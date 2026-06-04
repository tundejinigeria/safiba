'use server'

import { QueryCommand, GetCommand, UpdateCommand, PutCommand, ScanCommand, BatchGetCommand } from '@aws-sdk/lib-dynamodb'
import { dynamo, TABLES } from '@/src/lib/aws/dynamodb'
import { requireAdmin } from '@/src/lib/session'
import { handleActionError } from '@/src/lib/admin/errors'
import { buildPaginationParams, getNextCursor } from '@/src/lib/admin/pagination'
import type {
  AdminReport,
  AdminReportDetail,
  PaginatedParams,
  PaginatedResult,
  ActionResult,
  ReportStatus,
  EnforcementAction,
  EnforcementActionInput,
  ReportHistorySummary,
} from '@/src/types/admin'

const TABLE = TABLES.MAIN

// Valid status transitions — terminal states cannot go back to pending
const VALID_TRANSITIONS: Record<ReportStatus, ReportStatus[]> = {
  pending: ['under_review', 'resolved', 'dismissed'],
  under_review: ['resolved', 'dismissed'],
  resolved: [],
  dismissed: [],
}

// ── List Reports ─────────────────────────────────────────────────────────────

export async function getReports(params: PaginatedParams = {}): Promise<PaginatedResult<AdminReport>> {
  const admin = await requireAdmin()
  if (!admin) throw new Error('Unauthorized')

  const { cursor, limit, filters } = params
  const pagination = buildPaginationParams(cursor, limit)

  const result = await dynamo.send(new QueryCommand({
    TableName: TABLE,
    IndexName: 'GSI3',
    KeyConditionExpression: 'GSI3PK = :pk',
    ExpressionAttributeValues: { ':pk': 'TYPE#REPORTS' },
    ScanIndexForward: false,
    ...pagination,
  }))

  const items = result.Items || []

  // Enrich with user/community names via BatchGetCommand
  const userIds = new Set<string>()
  const communityIds = new Set<string>()

  for (const item of items) {
    if (item.reporter_user_id) userIds.add(item.reporter_user_id as string)
    if (item.reported_user_id) userIds.add(item.reported_user_id as string)
    if (item.community_id) communityIds.add(item.community_id as string)
  }

  const userMap = await fetchUserNames([...userIds])
  const communityMap = await fetchCommunityNames([...communityIds])

  let reports: AdminReport[] = items.map(item => ({
    id: (item.id || '') as string,
    reporter_user_id: (item.reporter_user_id || '') as string,
    reported_user_id: (item.reported_user_id || '') as string,
    community_id: (item.community_id || '') as string,
    category: item.category as AdminReport['category'],
    description: (item.description || '') as string,
    evidence_urls: (item.evidence_urls || []) as string[],
    status: (item.status || 'pending') as ReportStatus,
    created_at: (item.created_at || item.GSI3SK || '') as string,
    updated_at: (item.updated_at || '') as string,
    reported_user_name: userMap.get(item.reported_user_id as string) || 'Unknown',
    reporter_user_name: userMap.get(item.reporter_user_id as string) || 'Unknown',
    community_name: communityMap.get(item.community_id as string) || 'Unknown',
    report_count_against_user: 0, // Enriched below
  }))

  // Count reports against each reported user
  const reportCounts = new Map<string, number>()
  for (const report of reports) {
    const count = reportCounts.get(report.reported_user_id) || 0
    reportCounts.set(report.reported_user_id, count + 1)
  }
  for (const report of reports) {
    report.report_count_against_user = reportCounts.get(report.reported_user_id) || 0
  }

  // Apply filters
  if (filters?.status && filters.status !== 'all') {
    reports = reports.filter(r => r.status === filters.status)
  }
  if (filters?.category && filters.category !== 'all') {
    reports = reports.filter(r => r.category === filters.category)
  }

  return {
    items: reports,
    nextCursor: getNextCursor(result.LastEvaluatedKey),
    count: reports.length,
  }
}

// ── Get Single Report ────────────────────────────────────────────────────────

export async function getReport(reportId: string): Promise<AdminReportDetail | null> {
  const admin = await requireAdmin()
  if (!admin) throw new Error('Unauthorized')

  // Find report by ID using scan with filter
  const reportResult = await dynamo.send(new ScanCommand({
    TableName: TABLE,
    FilterExpression: 'id = :id AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':id': reportId,
      ':sk': 'REPORT#',
    },
  }))

  const reportItem = reportResult.Items?.[0]
  if (!reportItem) return null

  // Fetch reporter and reported profiles
  const [reporterProfile, reportedProfile] = await Promise.all([
    fetchUserProfile(reportItem.reporter_user_id as string),
    fetchUserProfile(reportItem.reported_user_id as string),
  ])

  // Fetch enforcement actions for this report
  const actionsResult = await dynamo.send(new QueryCommand({
    TableName: TABLE,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': `REPORT#${reportId}`,
      ':sk': 'ACTION#',
    },
    ScanIndexForward: false,
  }))

  const previousActions: EnforcementAction[] = (actionsResult.Items || []).map(item => ({
    id: (item.id || '') as string,
    report_id: reportId,
    action_type: item.action_type as EnforcementAction['action_type'],
    admin_id: (item.admin_id || '') as string,
    notes: (item.notes as string) || null,
    duration_days: (item.duration_days as number) || null,
    created_at: (item.created_at || '') as string,
  }))

  // Count total reports against this user
  const userReportsResult = await dynamo.send(new QueryCommand({
    TableName: TABLE,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': `USER#${reportItem.reported_user_id}`,
      ':sk': 'REPORT#',
    },
  }))

  const reportCount = userReportsResult.Items?.length || 0

  // Get community name
  const communityMap = await fetchCommunityNames([reportItem.community_id as string])

  return {
    id: (reportItem.id || '') as string,
    reporter_user_id: (reportItem.reporter_user_id || '') as string,
    reported_user_id: (reportItem.reported_user_id || '') as string,
    community_id: (reportItem.community_id || '') as string,
    category: reportItem.category as AdminReport['category'],
    description: (reportItem.description || '') as string,
    evidence_urls: (reportItem.evidence_urls || []) as string[],
    status: (reportItem.status || 'pending') as ReportStatus,
    created_at: (reportItem.created_at || '') as string,
    updated_at: (reportItem.updated_at || '') as string,
    reported_user_name: reportedProfile.full_name,
    reporter_user_name: reporterProfile.full_name,
    community_name: communityMap.get(reportItem.community_id as string) || 'Unknown',
    report_count_against_user: reportCount,
    previous_actions: previousActions,
    reporter_profile: { full_name: reporterProfile.full_name, username: reporterProfile.username },
    reported_profile: { full_name: reportedProfile.full_name, username: reportedProfile.username },
  }
}

// ── Get User Report History ──────────────────────────────────────────────────

export async function getUserReportHistory(userId: string): Promise<ReportHistorySummary> {
  const admin = await requireAdmin()
  if (!admin) throw new Error('Unauthorized')

  // Query all reports against this user
  const reportsResult = await dynamo.send(new QueryCommand({
    TableName: TABLE,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': `USER#${userId}`,
      ':sk': 'REPORT#',
    },
    ScanIndexForward: false,
  }))

  const reports = reportsResult.Items || []
  const resolvedCount = reports.filter(r => r.status === 'resolved').length
  const pendingCount = reports.filter(r => r.status === 'pending' || r.status === 'under_review').length

  // Fetch enforcement actions from all reports against this user
  const allActions: EnforcementAction[] = []
  for (const report of reports) {
    const reportId = (report.SK as string).replace('REPORT#', '')
    const actionsResult = await dynamo.send(new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `REPORT#${reportId}`,
        ':sk': 'ACTION#',
      },
      ScanIndexForward: false,
    }))

    for (const item of actionsResult.Items || []) {
      allActions.push({
        id: (item.id || '') as string,
        report_id: reportId,
        action_type: item.action_type as EnforcementAction['action_type'],
        admin_id: (item.admin_id || '') as string,
        notes: (item.notes as string) || null,
        duration_days: (item.duration_days as number) || null,
        created_at: (item.created_at || '') as string,
      })
    }
  }

  return {
    total_reports: reports.length,
    resolved_count: resolvedCount,
    pending_count: pendingCount,
    previous_actions: allActions,
  }
}

// ── Update Report Status ─────────────────────────────────────────────────────

export async function updateReportStatus(
  reportId: string,
  status: ReportStatus
): Promise<ActionResult<{ status: string }>> {
  try {
    const admin = await requireAdmin()
    if (!admin) throw new Error('Unauthorized')

    // Find the report
    const reportResult = await dynamo.send(new ScanCommand({
      TableName: TABLE,
      FilterExpression: 'id = :id AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':id': reportId,
        ':sk': 'REPORT#',
      },
    }))

    const reportItem = reportResult.Items?.[0]
    if (!reportItem) {
      return { success: false, error: 'Report not found' }
    }

    const currentStatus = reportItem.status as ReportStatus
    const allowedTransitions = VALID_TRANSITIONS[currentStatus] || []

    if (!allowedTransitions.includes(status)) {
      return { success: false, error: `Cannot transition from ${currentStatus} to ${status}` }
    }

    const now = new Date().toISOString()

    // Update the primary report record
    await dynamo.send(new UpdateCommand({
      TableName: TABLE,
      Key: { PK: reportItem.PK as string, SK: reportItem.SK as string },
      UpdateExpression: 'SET #status = :status, updated_at = :now',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: {
        ':status': status,
        ':now': now,
      },
    }))

    // Also update the user-index record
    await dynamo.send(new UpdateCommand({
      TableName: TABLE,
      Key: { PK: `USER#${reportItem.reported_user_id}`, SK: `REPORT#${reportId}` },
      UpdateExpression: 'SET #status = :status',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: { ':status': status },
    }))

    return { success: true, data: { status } }
  } catch (error) {
    return handleActionError(error, 'updateReportStatus')
  }
}

// ── Take Enforcement Action ──────────────────────────────────────────────────

export async function takeEnforcementAction(
  reportId: string,
  action: EnforcementActionInput
): Promise<ActionResult<{ status: string }>> {
  try {
    const admin = await requireAdmin()
    if (!admin) throw new Error('Unauthorized')

    // Find the report
    const reportResult = await dynamo.send(new ScanCommand({
      TableName: TABLE,
      FilterExpression: 'id = :id AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':id': reportId,
        ':sk': 'REPORT#',
      },
    }))

    const reportItem = reportResult.Items?.[0]
    if (!reportItem) {
      return { success: false, error: 'Report not found' }
    }

    const currentStatus = reportItem.status as ReportStatus
    if (currentStatus === 'resolved' || currentStatus === 'dismissed') {
      return { success: false, error: `Cannot take action on a ${currentStatus} report` }
    }

    const now = new Date().toISOString()
    const actionId = crypto.randomUUID()

    // 1. Update report status to resolved
    await dynamo.send(new UpdateCommand({
      TableName: TABLE,
      Key: { PK: reportItem.PK as string, SK: reportItem.SK as string },
      UpdateExpression: 'SET #status = :status, updated_at = :now',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: {
        ':status': 'resolved',
        ':now': now,
      },
    }))

    // Update user-index record status
    await dynamo.send(new UpdateCommand({
      TableName: TABLE,
      Key: { PK: `USER#${reportItem.reported_user_id}`, SK: `REPORT#${reportId}` },
      UpdateExpression: 'SET #status = :status',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: { ':status': 'resolved' },
    }))

    // 2. Create enforcement action record
    await dynamo.send(new PutCommand({
      TableName: TABLE,
      Item: {
        PK: `REPORT#${reportId}`,
        SK: `ACTION#${actionId}`,
        id: actionId,
        report_id: reportId,
        action_type: action.action_type,
        admin_id: admin,
        notes: action.notes || null,
        duration_days: action.duration_days || null,
        created_at: now,
      },
    }))

    // 3. Handle enforcement based on action type
    const reportedUserId = reportItem.reported_user_id as string

    if (action.action_type === 'suspend') {
      // Set user status to suspended
      await dynamo.send(new UpdateCommand({
        TableName: TABLE,
        Key: { PK: `USER#${reportedUserId}`, SK: 'PROFILE' },
        UpdateExpression: 'SET account_status = :status',
        ExpressionAttributeValues: { ':status': 'suspended' },
      }))
    } else if (action.action_type === 'ban') {
      // Set user status to banned
      await dynamo.send(new UpdateCommand({
        TableName: TABLE,
        Key: { PK: `USER#${reportedUserId}`, SK: 'PROFILE' },
        UpdateExpression: 'SET account_status = :status',
        ExpressionAttributeValues: { ':status': 'banned' },
      }))

      // Remove user from all communities
      await removeUserFromAllCommunities(reportedUserId)
    }

    // 4. Notify reporter that their report has been reviewed
    await notifyReporter(reportItem.reporter_user_id as string, true)

    return { success: true, data: { status: 'resolved' } }
  } catch (error) {
    return handleActionError(error, 'takeEnforcementAction')
  }
}

// ── Dismiss Report ───────────────────────────────────────────────────────────

export async function dismissReport(
  reportId: string,
  reason: string
): Promise<ActionResult<{ status: string }>> {
  try {
    const admin = await requireAdmin()
    if (!admin) throw new Error('Unauthorized')

    // Find the report
    const reportResult = await dynamo.send(new ScanCommand({
      TableName: TABLE,
      FilterExpression: 'id = :id AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':id': reportId,
        ':sk': 'REPORT#',
      },
    }))

    const reportItem = reportResult.Items?.[0]
    if (!reportItem) {
      return { success: false, error: 'Report not found' }
    }

    const currentStatus = reportItem.status as ReportStatus
    if (currentStatus === 'resolved' || currentStatus === 'dismissed') {
      return { success: false, error: `Cannot dismiss a ${currentStatus} report` }
    }

    const now = new Date().toISOString()
    const actionId = crypto.randomUUID()

    // 1. Update report status to dismissed
    await dynamo.send(new UpdateCommand({
      TableName: TABLE,
      Key: { PK: reportItem.PK as string, SK: reportItem.SK as string },
      UpdateExpression: 'SET #status = :status, updated_at = :now',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: {
        ':status': 'dismissed',
        ':now': now,
      },
    }))

    // Update user-index record status
    await dynamo.send(new UpdateCommand({
      TableName: TABLE,
      Key: { PK: `USER#${reportItem.reported_user_id}`, SK: `REPORT#${reportId}` },
      UpdateExpression: 'SET #status = :status',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: { ':status': 'dismissed' },
    }))

    // 2. Create dismiss action record with reason
    await dynamo.send(new PutCommand({
      TableName: TABLE,
      Item: {
        PK: `REPORT#${reportId}`,
        SK: `ACTION#${actionId}`,
        id: actionId,
        report_id: reportId,
        action_type: 'dismiss',
        admin_id: admin,
        notes: reason,
        duration_days: null,
        created_at: now,
      },
    }))

    // 3. Notify reporter that their report has been reviewed
    await notifyReporter(reportItem.reporter_user_id as string, false)

    return { success: true, data: { status: 'dismissed' } }
  } catch (error) {
    return handleActionError(error, 'dismissReport')
  }
}

// ── Helper Functions ─────────────────────────────────────────────────────────

async function fetchUserNames(userIds: string[]): Promise<Map<string, string>> {
  const nameMap = new Map<string, string>()
  if (userIds.length === 0) return nameMap

  // BatchGetCommand supports max 100 keys per request
  const chunks = chunkArray(userIds, 100)

  for (const chunk of chunks) {
    const keys = chunk.map(id => ({ PK: `USER#${id}`, SK: 'PROFILE' }))

    const result = await dynamo.send(new BatchGetCommand({
      RequestItems: {
        [TABLE]: { Keys: keys },
      },
    }))

    const items = result.Responses?.[TABLE] || []
    for (const item of items) {
      const userId = (item.PK as string).replace('USER#', '')
      nameMap.set(userId, (item.full_name as string) || 'Unknown')
    }
  }

  return nameMap
}

async function fetchCommunityNames(communityIds: string[]): Promise<Map<string, string>> {
  const nameMap = new Map<string, string>()
  if (communityIds.length === 0) return nameMap

  const chunks = chunkArray(communityIds, 100)

  for (const chunk of chunks) {
    const keys = chunk.map(id => ({ PK: `COMMUNITY#${id}`, SK: 'METADATA' }))

    const result = await dynamo.send(new BatchGetCommand({
      RequestItems: {
        [TABLE]: { Keys: keys },
      },
    }))

    const items = result.Responses?.[TABLE] || []
    for (const item of items) {
      const communityId = (item.PK as string).replace('COMMUNITY#', '')
      nameMap.set(communityId, (item.name as string) || 'Unknown')
    }
  }

  return nameMap
}

async function fetchUserProfile(userId: string): Promise<{ full_name: string; username: string }> {
  const result = await dynamo.send(new GetCommand({
    TableName: TABLE,
    Key: { PK: `USER#${userId}`, SK: 'PROFILE' },
  }))

  return {
    full_name: (result.Item?.full_name as string) || 'Unknown',
    username: (result.Item?.username as string) || 'unknown',
  }
}

async function removeUserFromAllCommunities(userId: string): Promise<void> {
  // Find all community memberships for this user
  const membershipsResult = await dynamo.send(new ScanCommand({
    TableName: TABLE,
    FilterExpression: 'begins_with(SK, :sk) AND user_id = :uid',
    ExpressionAttributeValues: {
      ':sk': 'MEMBER#',
      ':uid': userId,
    },
  }))

  const memberships = membershipsResult.Items || []

  // Update each membership record to remove the user (set status to removed)
  for (const membership of memberships) {
    await dynamo.send(new UpdateCommand({
      TableName: TABLE,
      Key: { PK: membership.PK as string, SK: membership.SK as string },
      UpdateExpression: 'SET #status = :status',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: { ':status': 'removed' },
    }))
  }
}

function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

// ── Push Notification Helper ─────────────────────────────────────────────────

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'

/**
 * Send a push notification to the reporter when their report is resolved or dismissed.
 * Does NOT disclose the specific enforcement action taken (privacy requirement 7.2).
 */
async function notifyReporter(reporterUserId: string, isResolved: boolean): Promise<void> {
  try {
    // Look up reporter's push token
    const tokenResult = await dynamo.send(new GetCommand({
      TableName: TABLE,
      Key: { PK: `USER#${reporterUserId}`, SK: 'PUSH_TOKEN' },
    }))

    const pushToken = tokenResult.Item?.push_token as string | undefined
    if (!pushToken) return

    const title = '📋 Report Update'
    const body = isResolved
      ? 'Your report has been reviewed by our team and appropriate action has been taken.'
      : 'Your report has been reviewed by our team. Thank you for helping keep our community safe.'

    await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: pushToken,
        title,
        body,
        data: { type: 'report_update' },
        sound: 'default',
        priority: 'high',
        channelId: 'default',
      }),
    })
  } catch (err) {
    // Push notification failure should not block the enforcement action
    console.error('Failed to notify reporter:', err)
  }
}
