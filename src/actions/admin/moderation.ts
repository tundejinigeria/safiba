'use server'

import { QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb'
import { dynamo, TABLES } from '@/src/lib/aws/dynamodb'
import { requireAdmin } from '@/src/lib/session'
import type { ModerationItem } from '@/src/types/admin'

const TABLE = TABLES.MAIN

export async function getModerationQueue(): Promise<ModerationItem[]> {
  const admin = await requireAdmin()
  if (!admin) throw new Error('Unauthorized')

  const items: ModerationItem[] = []

  // 1. Alerts marked as false_report
  try {
    const alertsResult = await dynamo.send(new QueryCommand({
      TableName: TABLE,
      IndexName: 'GSI3',
      KeyConditionExpression: 'GSI3PK = :pk',
      ExpressionAttributeValues: { ':pk': 'TYPE#ALERTS' },
      ScanIndexForward: false,
      Limit: 50,
    }))

    const flaggedAlerts = (alertsResult.Items || []).filter(
      (item: Record<string, unknown>) => item.status === 'false_report' || ((item.false_report_count as number) || 0) >= 1
    )

    flaggedAlerts.forEach((alert: Record<string, unknown>) => {
      items.push({
        type: 'alert',
        id: (alert.id || '') as string,
        title: `${(alert.category as string) || 'Alert'}: ${((alert.description as string) || '').slice(0, 50)}...`,
        reason: alert.status === 'false_report'
          ? `Marked as false report (${(alert.false_report_count as number) || 0} reports)`
          : `${(alert.false_report_count as number) || 0} report(s) received`,
        createdAt: (alert.created_at || '') as string,
      })
    })
  } catch (err) {
    console.error('Error fetching flagged alerts:', err)
  }

  // 2. Users with low trust scores (below 30)
  try {
    const usersResult = await dynamo.send(new QueryCommand({
      TableName: TABLE,
      IndexName: 'GSI3',
      KeyConditionExpression: 'GSI3PK = :pk',
      ExpressionAttributeValues: { ':pk': 'TYPE#USERS' },
      Limit: 100,
    }))

    const lowTrustUsers = (usersResult.Items || []).filter(
      (item: Record<string, unknown>) => ((item.trust_score as number) ?? 50) < 30
    )

    lowTrustUsers.forEach((user: Record<string, unknown>) => {
      items.push({
        type: 'user',
        id: (user.id || (user.PK as string)?.replace('USER#', '') || '') as string,
        title: (user.full_name || user.username || 'Unknown user') as string,
        reason: `Trust score: ${(user.trust_score as number) ?? 0}/100`,
        createdAt: (user.created_at || '') as string,
      })
    })
  } catch (err) {
    console.error('Error fetching low-trust users:', err)
  }

  // 3. Unverified communities
  try {
    const communitiesResult = await dynamo.send(new QueryCommand({
      TableName: TABLE,
      IndexName: 'GSI3',
      KeyConditionExpression: 'GSI3PK = :pk',
      ExpressionAttributeValues: { ':pk': 'TYPE#COMMUNITIES' },
      Limit: 50,
    }))

    const unverified = (communitiesResult.Items || []).filter(
      (item: Record<string, unknown>) => !item.is_verified
    )

    unverified.forEach((community: Record<string, unknown>) => {
      items.push({
        type: 'community',
        id: (community.id || '') as string,
        title: (community.name || 'Unknown community') as string,
        reason: 'Pending verification',
        createdAt: (community.created_at || '') as string,
      })
    })
  } catch (err) {
    console.error('Error fetching unverified communities:', err)
  }

  // Sort by creation date (newest first)
  items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return items
}

export async function getModerationCount(): Promise<number> {
  try {
    const queue = await getModerationQueue()
    return queue.length
  } catch {
    return 0
  }
}
