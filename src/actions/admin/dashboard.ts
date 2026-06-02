'use server'

import { QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb'
import { dynamo, TABLES } from '@/src/lib/aws/dynamodb'
import { requireAdmin } from '@/src/lib/session'
import type { DashboardStats } from '@/src/types/admin'

const TABLE = TABLES.MAIN

export interface RecentActivity {
  type: 'user_joined' | 'alert_created' | 'sos_triggered' | 'community_created' | 'case_reported'
  title: string
  description: string
  timestamp: string
  href: string
}

export async function getRecentActivity(): Promise<RecentActivity[]> {
  const admin = await requireAdmin()
  if (!admin) throw new Error('Unauthorized')

  const activities: RecentActivity[] = []

  try {
    // Recent users
    const usersResult = await dynamo.send(new QueryCommand({
      TableName: TABLE,
      IndexName: 'GSI3',
      KeyConditionExpression: 'GSI3PK = :pk',
      ExpressionAttributeValues: { ':pk': 'TYPE#USERS' },
      ScanIndexForward: false,
      Limit: 5,
    }))
    for (const item of (usersResult.Items || [])) {
      activities.push({
        type: 'user_joined',
        title: item.full_name || item.username || 'New user',
        description: 'joined the platform',
        timestamp: item.created_at || item.GSI3SK || '',
        href: `/admin/users/${item.id || item.PK?.replace('USER#', '')}`,
      })
    }

    // Recent alerts
    const alertsResult = await dynamo.send(new QueryCommand({
      TableName: TABLE,
      IndexName: 'GSI3',
      KeyConditionExpression: 'GSI3PK = :pk',
      ExpressionAttributeValues: { ':pk': 'TYPE#ALERTS' },
      ScanIndexForward: false,
      Limit: 5,
    }))
    for (const item of (alertsResult.Items || [])) {
      activities.push({
        type: 'alert_created',
        title: `${item.category || 'Alert'} incident`,
        description: (item.description || '').slice(0, 60) + ((item.description || '').length > 60 ? '...' : ''),
        timestamp: item.created_at || item.GSI3SK || '',
        href: `/admin/incidents/${item.id}`,
      })
    }

    // Recent SOS
    const sosResult = await dynamo.send(new ScanCommand({
      TableName: TABLE,
      FilterExpression: 'begins_with(PK, :pk) AND SK = :sk',
      ExpressionAttributeValues: { ':pk': 'SOS#', ':sk': 'METADATA' },
      Limit: 5,
    }))
    for (const item of (sosResult.Items || [])) {
      activities.push({
        type: 'sos_triggered',
        title: item.user_name || 'User',
        description: 'triggered SOS emergency',
        timestamp: item.triggered_at || item.created_at || '',
        href: '/admin/sos',
      })
    }
  } catch (err) {
    console.error('Error fetching recent activity:', err)
  }

  // Sort by timestamp descending and take top 10
  return activities
    .filter(a => a.timestamp)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10)
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const admin = await requireAdmin()
  if (!admin) throw new Error('Unauthorized')

  // Fetch counts in parallel
  const [usersResult, alertsResult, communitiesResult, missingResult, sosResult] = await Promise.all([
    // Total users
    dynamo.send(new QueryCommand({
      TableName: TABLE,
      IndexName: 'GSI3',
      KeyConditionExpression: 'GSI3PK = :pk',
      ExpressionAttributeValues: { ':pk': 'TYPE#USERS' },
      Select: 'COUNT',
    })).catch(() => ({ Count: 0 })),

    // Active alerts (not resolved/false_report)
    dynamo.send(new QueryCommand({
      TableName: TABLE,
      IndexName: 'GSI3',
      KeyConditionExpression: 'GSI3PK = :pk',
      ExpressionAttributeValues: { ':pk': 'TYPE#ALERTS' },
      Select: 'COUNT',
    })).catch(() => ({ Count: 0 })),

    // Total communities
    dynamo.send(new QueryCommand({
      TableName: TABLE,
      IndexName: 'GSI3',
      KeyConditionExpression: 'GSI3PK = :pk',
      ExpressionAttributeValues: { ':pk': 'TYPE#COMMUNITIES' },
      Select: 'COUNT',
    })).catch(() => ({ Count: 0 })),

    // Active missing persons
    dynamo.send(new QueryCommand({
      TableName: TABLE,
      IndexName: 'GSI3',
      KeyConditionExpression: 'GSI3PK = :pk',
      ExpressionAttributeValues: { ':pk': 'TYPE#MISSING_PERSONS' },
      Select: 'COUNT',
    })).catch(() => ({ Count: 0 })),

    // SOS events (scan for today)
    dynamo.send(new ScanCommand({
      TableName: TABLE,
      FilterExpression: 'begins_with(PK, :pk) AND SK = :sk AND triggered_at >= :today',
      ExpressionAttributeValues: {
        ':pk': 'SOS#',
        ':sk': 'METADATA',
        ':today': new Date().toISOString().split('T')[0],
      },
      Select: 'COUNT',
    })).catch(() => ({ Count: 0 })),
  ])

  // User growth — last 30 days
  const userGrowth = await getUserGrowth()

  // Alert trends — last 14 days
  const alertTrends = await getAlertTrends()

  // Top areas
  const topAreas = await getTopAreas()

  return {
    totalUsers: (usersResult as { Count?: number }).Count || 0,
    activeAlerts: (alertsResult as { Count?: number }).Count || 0,
    totalCommunities: (communitiesResult as { Count?: number }).Count || 0,
    activeMissingCases: (missingResult as { Count?: number }).Count || 0,
    sosEventsToday: (sosResult as { Count?: number }).Count || 0,
    userGrowth,
    alertTrends,
    topAreas,
  }
}

async function getUserGrowth(): Promise<{ date: string; count: number }[]> {
  const days = 30
  const result: { date: string; count: number }[] = []

  try {
    // Fetch all users and group by creation date
    const usersResult = await dynamo.send(new QueryCommand({
      TableName: TABLE,
      IndexName: 'GSI3',
      KeyConditionExpression: 'GSI3PK = :pk',
      ExpressionAttributeValues: { ':pk': 'TYPE#USERS' },
    }))

    const users = usersResult.Items || []
    const countByDate: Record<string, number> = {}

    // Initialize last 30 days
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      countByDate[date.toISOString().split('T')[0]] = 0
    }

    // Count users by creation date
    users.forEach((user: Record<string, unknown>) => {
      const date = ((user.created_at || user.GSI3SK || '') as string).split('T')[0]
      if (date && countByDate[date] !== undefined) {
        countByDate[date]++
      }
    })

    for (const [date, count] of Object.entries(countByDate)) {
      result.push({ date, count })
    }
  } catch (err) {
    console.error('Error fetching user growth:', err)
  }

  return result
}

async function getAlertTrends(): Promise<{ date: string; category: string; count: number }[]> {
  const result: { date: string; category: string; count: number }[] = []

  try {
    const alertsResult = await dynamo.send(new QueryCommand({
      TableName: TABLE,
      IndexName: 'GSI3',
      KeyConditionExpression: 'GSI3PK = :pk',
      ExpressionAttributeValues: { ':pk': 'TYPE#ALERTS' },
      ScanIndexForward: false,
      Limit: 200,
    }))

    const alerts = alertsResult.Items || []
    const countByDateCategory: Record<string, number> = {}

    // Last 14 days
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 14)

    alerts.forEach((alert: Record<string, unknown>) => {
      const date = ((alert.created_at || alert.GSI3SK || '') as string).split('T')[0]
      const category = (alert.category as string) || 'other'
      if (date && new Date(date) >= cutoff) {
        const key = `${date}|${category}`
        countByDateCategory[key] = (countByDateCategory[key] || 0) + 1
      }
    })

    for (const [key, count] of Object.entries(countByDateCategory)) {
      const [date, category] = key.split('|')
      result.push({ date, category, count })
    }
  } catch (err) {
    console.error('Error fetching alert trends:', err)
  }

  return result.sort((a, b) => a.date.localeCompare(b.date))
}

async function getTopAreas(): Promise<{ name: string; incidentCount: number }[]> {
  try {
    const alertsResult = await dynamo.send(new QueryCommand({
      TableName: TABLE,
      IndexName: 'GSI3',
      KeyConditionExpression: 'GSI3PK = :pk',
      ExpressionAttributeValues: { ':pk': 'TYPE#ALERTS' },
      ScanIndexForward: false,
      Limit: 200,
    }))

    const alerts = alertsResult.Items || []
    const countByArea: Record<string, number> = {}

    alerts.forEach((alert: Record<string, unknown>) => {
      const location = (alert.location as string) || 'Unknown'
      // Extract area name (first part before comma)
      const area = location.split(',')[0].trim() || 'Unknown'
      if (area !== 'Unknown') {
        countByArea[area] = (countByArea[area] || 0) + 1
      }
    })

    return Object.entries(countByArea)
      .map(([name, incidentCount]) => ({ name, incidentCount }))
      .sort((a, b) => b.incidentCount - a.incidentCount)
      .slice(0, 5)
  } catch (err) {
    console.error('Error fetching top areas:', err)
    return []
  }
}
