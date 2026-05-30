'use server'

import { ScanCommand, GetCommand } from '@aws-sdk/lib-dynamodb'
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

  let events = (result.Items || []).map((item: any): SOSEvent => ({
    id: item.id || item.PK?.replace('SOS#', '') || '',
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
  }))

  // Sort by triggered time (newest first)
  events.sort((a, b) => new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime())

  // Filter by active status
  if (filters?.active !== undefined) {
    events = events.filter(e => filters.active ? e.status === 'active' : e.status !== 'active')
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
