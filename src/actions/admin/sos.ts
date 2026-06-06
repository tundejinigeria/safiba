'use server'

import { ScanCommand, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb'
import { dynamo, TABLES } from '@/src/lib/aws/dynamodb'
import { requireAdmin } from '@/src/lib/session'
import type { SOSEvent, PaginatedResult } from '@/src/types/admin'

const TABLE = TABLES.MAIN

export async function getSOSEvents(filters?: { active?: boolean }): Promise<PaginatedResult<SOSEvent>> {
  const admin = await requireAdmin()
  if (!admin) throw new Error('Unauthorized')

  // SOS events are stored with PK: SOS#id, SK: METADATA
  const result = await dynamo.send(new ScanCommand({
    TableName: TABLE,
    FilterExpression: 'begins_with(PK, :pk) AND SK = :sk',
    ExpressionAttributeValues: {
      ':pk': 'SOS#',
      ':sk': 'METADATA',
    },
    Limit: 100,
  }))

  let events = (result.Items || []).map((item: Record<string, unknown>): SOSEvent => ({
    id: (item.id || (item.PK as string)?.replace('SOS#', '') || '') as string,
    userId: (item.user_id || '') as string,
    userName: (item.user_name as string) || undefined,
    status: (item.status || 'active') as SOSEvent['status'],
    location: item.trigger_lat && item.trigger_lng ? {
      latitude: item.trigger_lat as number,
      longitude: item.trigger_lng as number,
      address: (item.trigger_address as string) || undefined,
    } : undefined,
    contactsNotified: Array.isArray(item.contacts_notified) ? item.contacts_notified.length : 0,
    triggeredAt: (item.triggered_at || item.created_at || '') as string,
    resolvedAt: (item.resolved_at as string) || undefined,
    cancelledAt: (item.cancelled_at as string) || undefined,
  }))

  // Sort by triggered time (newest first)
  events.sort((a, b) => new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime())

  // Filter by status
  if (filters?.active === true) {
    events = events.filter(e => e.status === 'active')
  } else if (filters?.active === false) {
    events = events.filter(e => e.status !== 'active')
  }

  return {
    items: events,
    nextCursor: null,
    count: events.length,
  }
}

export async function getSOSEvent(eventId: string): Promise<SOSEvent | null> {
  const admin = await requireAdmin()
  if (!admin) throw new Error('Unauthorized')

  const result = await dynamo.send(new GetCommand({
    TableName: TABLE,
    Key: { PK: `SOS#${eventId}`, SK: 'METADATA' },
  }))

  if (!result.Item) return null
  const item = result.Item
  return {
    id: item.id || '',
    userId: item.user_id || '',
    userName: item.user_name || undefined,
    status: item.status || 'active',
    location: item.trigger_lat && item.trigger_lng ? {
      latitude: item.trigger_lat,
      longitude: item.trigger_lng,
      address: item.trigger_address || undefined,
    } : undefined,
    contactsNotified: Array.isArray(item.contacts_notified) ? item.contacts_notified.length : 0,
    triggeredAt: item.triggered_at || item.created_at || '',
    resolvedAt: item.resolved_at || undefined,
    cancelledAt: item.cancelled_at || undefined,
  }
}


// ── GET SOS CONTACTS ─────────────────────────────────────────────────────────

export interface SOSContact {
  id: string
  name: string
  phone: string
  relationship: string
  isPrimary: boolean
  isOnSafiba: boolean
  linkedUserId?: string
}

export async function getSOSContacts(userId: string): Promise<SOSContact[]> {
  const admin = await requireAdmin()
  if (!admin) throw new Error('Unauthorized')

  // Fetch user's emergency contacts
  const result = await dynamo.send(new QueryCommand({
    TableName: TABLE,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': `USER#${userId}`,
      ':sk': 'CONTACT#',
    },
  }))

  const contacts: SOSContact[] = (result.Items || []).map((item: any) => ({
    id: item.id || '',
    name: item.name || 'Unknown',
    phone: item.phone_number || '',
    relationship: item.relationship || '',
    isPrimary: item.is_primary || false,
    isOnSafiba: !!item.linked_user_id,
    linkedUserId: item.linked_user_id || undefined,
  }))

  return contacts
}

// ── GET SOS LIVE LOCATION ────────────────────────────────────────────────────

export interface SOSLiveLocation {
  sessionId: string
  lat: number | null
  lng: number | null
  lastUpdated: string | null
  shareUrl: string | null
  status: string
  expiresAt: string | null
}

export async function getSOSLiveLocation(userId: string): Promise<SOSLiveLocation | null> {
  const admin = await requireAdmin()
  if (!admin) throw new Error('Unauthorized')

  // Find active live location session for this user
  // Sessions are stored with GSI1PK: USER_LIVE#{userId}
  const result = await dynamo.send(new QueryCommand({
    TableName: TABLE,
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :pk',
    ExpressionAttributeValues: {
      ':pk': `USER_LIVE#${userId}`,
    },
    ScanIndexForward: false, // newest first
    Limit: 1,
  }))

  if (!result.Items || result.Items.length === 0) return null

  const session = result.Items[0]

  // Only return if still active
  if (session.status !== 'active') return null
  if (session.expires_at && new Date(session.expires_at) < new Date()) return null

  return {
    sessionId: session.id || '',
    lat: session.last_lat || null,
    lng: session.last_lng || null,
    lastUpdated: session.last_updated || null,
    shareUrl: session.share_url || null,
    status: session.status || 'unknown',
    expiresAt: session.expires_at || null,
  }
}
