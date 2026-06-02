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

  let events = (result.Items || []).map((item: Record<string, unknown>): SOSEvent => ({
    id: (item.id || (item.PK as string)?.replace('SOS#', '') || '') as string,
    userId: (item.user_id || '') as string,
    userName: (item.user_name as string) || undefined,
    status: (item.status || 'active') as string,
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
