'use server'

import { QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb'
import { dynamo, TABLES } from '@/src/lib/aws/dynamodb'
import { requireAdmin } from '@/src/lib/session'
import type { DashboardStats } from '@/src/types/admin'

const TABLE = TABLES.MAIN

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
    totalUsers: (usersResult as any).Count || 0,
    activeAlerts: (alertsResult as any).Count || 0,
    totalCommunities: (communitiesResult as any).Count || 0,
    activeMissingCases: (missingResult as any).Count || 0,
    sosEventsToday: (sosResult as any).Count || 0,
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
    users.forEach((user: any) => {
      const date = (user.created_at || user.GSI3SK || '').split('T')[0]
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

    alerts.forEach((alert: any) => {
      const date = (alert.created_at || alert.GSI3SK || '').split('T')[0]
      const category = alert.category || 'other'
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

    alerts.forEach((alert: any) => {
      const location = alert.location || 'Unknown'
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
