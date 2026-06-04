'use server'

import { QueryCommand, GetCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb'
import { dynamo, TABLES } from '@/src/lib/aws/dynamodb'
import { requireAdmin } from '@/src/lib/session'
import { handleActionError } from '@/src/lib/admin/errors'
import { buildPaginationParams, getNextCursor } from '@/src/lib/admin/pagination'
import { clampTrustScore } from '@/src/lib/admin/trust-score'
import type { Alert, PaginatedParams, PaginatedResult, ActionResult, AlertSeverity } from '@/src/types/admin'

const TABLE = TABLES.MAIN
const TRUST_PENALTY_FALSE_REPORT = -10

// ── List Alerts ──────────────────────────────────────────────────────────────

export async function getAlerts(params: PaginatedParams = {}): Promise<PaginatedResult<Alert>> {
  const admin = await requireAdmin()
  if (!admin) throw new Error('Unauthorized')

  const { cursor, limit, filters } = params
  const pagination = buildPaginationParams(cursor, limit)

  const result = await dynamo.send(new QueryCommand({
    TableName: TABLE,
    IndexName: 'GSI3',
    KeyConditionExpression: 'GSI3PK = :pk',
    ExpressionAttributeValues: { ':pk': 'TYPE#ALERTS' },
    ScanIndexForward: false,
    ...pagination,
  }))

  let alerts = (result.Items || []).map(mapDynamoToAlert)

  // Apply filters
  if (filters?.search) {
    const search = filters.search.toLowerCase()
    alerts = alerts.filter(a =>
      a.description.toLowerCase().includes(search) ||
      (a.location.name || '').toLowerCase().includes(search) ||
      a.category.toLowerCase().includes(search)
    )
  }
  if (filters?.status && filters.status !== 'all') {
    alerts = alerts.filter(a => a.status === filters.status)
  }
  if (filters?.severity && filters.severity !== 'all') {
    alerts = alerts.filter(a => a.severity === filters.severity)
  }
  if (filters?.category && filters.category !== 'all') {
    alerts = alerts.filter(a => a.category === filters.category)
  }

  return {
    items: alerts,
    nextCursor: getNextCursor(result.LastEvaluatedKey),
    count: alerts.length,
  }
}

// ── Get Single Alert ─────────────────────────────────────────────────────────

export async function getAlert(alertId: string): Promise<Alert | null> {
  const admin = await requireAdmin()
  if (!admin) throw new Error('Unauthorized')

  const result = await dynamo.send(new GetCommand({
    TableName: TABLE,
    Key: { PK: `ALERT#${alertId}`, SK: 'METADATA' },
  }))

  if (!result.Item) return null
  return mapDynamoToAlert(result.Item)
}

// ── Update Alert Status ──────────────────────────────────────────────────────

export async function updateAlertStatus(
  alertId: string,
  status: 'official_confirmed' | 'false_report' | 'resolved'
): Promise<ActionResult<{ status: string }>> {
  try {
    const admin = await requireAdmin()
    if (!admin) throw new Error('Unauthorized')

    const alertResult = await dynamo.send(new GetCommand({
      TableName: TABLE,
      Key: { PK: `ALERT#${alertId}`, SK: 'METADATA' },
    }))

    if (!alertResult.Item) {
      return { success: false, error: 'Alert not found' }
    }

    // Update status
    await dynamo.send(new UpdateCommand({
      TableName: TABLE,
      Key: { PK: `ALERT#${alertId}`, SK: 'METADATA' },
      UpdateExpression: 'SET #status = :status, GSI1PK = :gsi1pk',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: {
        ':status': status,
        ':gsi1pk': `ALERT_STATUS#${status}`,
      },
    }))

    // If marking as false_report, penalize the creator's trust score
    if (status === 'false_report' && alertResult.Item.user_id) {
      try {
        const profileResult = await dynamo.send(new GetCommand({
          TableName: TABLE,
          Key: { PK: `USER#${alertResult.Item.user_id}`, SK: 'PROFILE' },
        }))
        if (profileResult.Item) {
          const currentScore = profileResult.Item.trust_score ?? 50
          const newScore = clampTrustScore(currentScore, TRUST_PENALTY_FALSE_REPORT)
          await dynamo.send(new UpdateCommand({
            TableName: TABLE,
            Key: { PK: `USER#${alertResult.Item.user_id}`, SK: 'PROFILE' },
            UpdateExpression: 'SET trust_score = :ts',
            ExpressionAttributeValues: { ':ts': newScore },
          }))
        }
      } catch (err) {
        console.error('Failed to apply trust penalty:', err)
      }
    }

    return { success: true, data: { status } }
  } catch (error) {
    return handleActionError(error, 'updateAlertStatus')
  }
}

// ── Delete Alert ─────────────────────────────────────────────────────────────

export async function deleteAlert(alertId: string): Promise<ActionResult<null>> {
  try {
    const admin = await requireAdmin()
    if (!admin) throw new Error('Unauthorized')

    await dynamo.send(new DeleteCommand({
      TableName: TABLE,
      Key: { PK: `ALERT#${alertId}`, SK: 'METADATA' },
    }))

    return { success: true, data: null }
  } catch (error) {
    return handleActionError(error, 'deleteAlert')
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function mapDynamoToAlert(item: Record<string, unknown>): Alert {
  // Helper function to safely cast severity
  const mapSeverity = (value: unknown): AlertSeverity => {
    const severity = (value as string) || 'medium'
    // Validate that it's a valid severity value
    if (severity === 'low' || severity === 'medium' || severity === 'high' || severity === 'critical') {
      return severity
    }
    return 'medium' // default fallback
  }

  // Helper function to safely cast status
  const mapStatus = (value: unknown): Alert['status'] => {
    const status = (value as string) || 'unverified'
    if (status === 'unverified' || status === 'official_confirmed' || status === 'false_report' || status === 'resolved') {
      return status
    }
    return 'unverified'
  }

  return {
    id: (item.id || (item.PK as string)?.replace('ALERT#', '') || '') as string,
    category: (item.category || 'other') as string,
    severity: mapSeverity(item.severity), // Fixed: properly typed as AlertSeverity
    status: mapStatus(item.status), // Fixed: properly typed as Alert['status']
    description: (item.description || '') as string,
    location: {
      latitude: (item.lat as number) || 0,
      longitude: (item.lng as number) || 0,
      name: (item.location as string) || undefined,
    },
    photos: (item.photos || item.media_urls || []) as string[],
    creatorId: (item.user_id || '') as string,
    creatorName: (item.reporter_name as string) || undefined,
    confirmationCount: (item.confirmed_count as number) || 0,
    falseReportCount: (item.false_report_count as number) || 0,
    createdAt: (item.created_at || item.GSI3SK || '') as string,
  }
}