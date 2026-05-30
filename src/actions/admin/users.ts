'use server'

import { QueryCommand, GetCommand, UpdateCommand, ScanCommand } from '@aws-sdk/lib-dynamodb'
import { dynamo, TABLES } from '@/src/lib/aws/dynamodb'
import { requireAdmin } from '@/src/lib/session'
import { handleActionError } from '@/src/lib/admin/errors'
import { buildPaginationParams, getNextCursor } from '@/src/lib/admin/pagination'
import { clampTrustScore } from '@/src/lib/admin/trust-score'
import type { AdminUser, PaginatedParams, PaginatedResult, ActionResult } from '@/src/types/admin'

const TABLE = TABLES.MAIN

// ── List Users ───────────────────────────────────────────────────────────────

export async function getUsers(params: PaginatedParams = {}): Promise<PaginatedResult<AdminUser>> {
  const admin = await requireAdmin()
  if (!admin) throw new Error('Unauthorized')

  const { cursor, limit, filters } = params
  const pagination = buildPaginationParams(cursor, limit)

  // Query all users via GSI3
  let result = await dynamo.send(new QueryCommand({
    TableName: TABLE,
    IndexName: 'GSI3',
    KeyConditionExpression: 'GSI3PK = :pk',
    ExpressionAttributeValues: { ':pk': 'TYPE#USERS' },
    ScanIndexForward: false,
    ...pagination,
  }))

  // Fallback: if GSI3 returns no results, scan for users directly
  // This handles users created before GSI3PK was added to the write path
  if (!result.Items || result.Items.length === 0) {
    result = await dynamo.send(new ScanCommand({
      TableName: TABLE,
      FilterExpression: 'begins_with(PK, :prefix) AND SK = :sk',
      ExpressionAttributeValues: {
        ':prefix': 'USER#',
        ':sk': 'PROFILE',
      },
      ...pagination,
    }))
  }

  let users = (result.Items || []).map(mapDynamoToUser)

  // Apply filters client-side (DynamoDB doesn't support complex filtering on GSI queries efficiently)
  if (filters?.search) {
    const search = filters.search.toLowerCase()
    users = users.filter(u =>
      u.name.toLowerCase().includes(search) ||
      u.username.toLowerCase().includes(search) ||
      u.email.toLowerCase().includes(search) ||
      u.phone.toLowerCase().includes(search)
    )
  }

  if (filters?.status && filters.status !== 'all') {
    users = users.filter(u => u.status === filters.status)
  }

  if (filters?.role && filters.role !== 'all') {
    users = users.filter(u => u.role === filters.role)
  }

  if (filters?.trustScoreMin) {
    users = users.filter(u => u.trustScore >= parseInt(filters.trustScoreMin!))
  }
  if (filters?.trustScoreMax) {
    users = users.filter(u => u.trustScore <= parseInt(filters.trustScoreMax!))
  }

  return {
    items: users,
    nextCursor: getNextCursor(result.LastEvaluatedKey as any),
    count: users.length,
  }
}

// ── Get Single User ──────────────────────────────────────────────────────────

export async function getUser(userId: string): Promise<AdminUser | null> {
  const admin = await requireAdmin()
  if (!admin) throw new Error('Unauthorized')

  const result = await dynamo.send(new GetCommand({
    TableName: TABLE,
    Key: { PK: `USER#${userId}`, SK: 'PROFILE' },
  }))

  if (!result.Item) return null
  return mapDynamoToUser(result.Item)
}

// ── Get User's Alerts ────────────────────────────────────────────────────────

export async function getUserAlerts(userId: string) {
  const admin = await requireAdmin()
  if (!admin) throw new Error('Unauthorized')

  const result = await dynamo.send(new QueryCommand({
    TableName: TABLE,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': `USER#${userId}`,
      ':sk': 'ALERT#',
    },
    ScanIndexForward: false,
  }))

  return result.Items || []
}

// ── Get User's Communities ───────────────────────────────────────────────────

export async function getUserCommunities(userId: string) {
  const admin = await requireAdmin()
  if (!admin) throw new Error('Unauthorized')

  // Scan for membership records where user_id matches
  const result = await dynamo.send(new ScanCommand({
    TableName: TABLE,
    FilterExpression: 'begins_with(SK, :sk) AND user_id = :uid AND #s = :active',
    ExpressionAttributeNames: { '#s': 'status' },
    ExpressionAttributeValues: {
      ':sk': 'MEMBER#',
      ':uid': userId,
      ':active': 'active',
    },
  }))

  const memberships = result.Items || []

  // Fetch community names
  const communities = await Promise.all(
    memberships.map(async (m: any) => {
      try {
        const communityResult = await dynamo.send(new GetCommand({
          TableName: TABLE,
          Key: { PK: `COMMUNITY#${m.community_id}`, SK: 'METADATA' },
        }))
        return {
          id: m.community_id,
          name: communityResult.Item?.name || 'Unknown',
          role: m.role,
          joinedAt: m.joined_at,
        }
      } catch {
        return { id: m.community_id, name: 'Unknown', role: m.role, joinedAt: m.joined_at }
      }
    })
  )

  return communities
}

// ── Update Trust Score ───────────────────────────────────────────────────────

export async function updateTrustScore(userId: string, adjustment: number): Promise<ActionResult<{ newScore: number }>> {
  try {
    const admin = await requireAdmin()
    if (!admin) throw new Error('Unauthorized')

    // Get current score
    const userResult = await dynamo.send(new GetCommand({
      TableName: TABLE,
      Key: { PK: `USER#${userId}`, SK: 'PROFILE' },
    }))

    if (!userResult.Item) {
      return { success: false, error: 'User not found' }
    }

    const currentScore = userResult.Item.trust_score ?? 50
    const newScore = clampTrustScore(currentScore, adjustment)

    await dynamo.send(new UpdateCommand({
      TableName: TABLE,
      Key: { PK: `USER#${userId}`, SK: 'PROFILE' },
      UpdateExpression: 'SET trust_score = :ts',
      ExpressionAttributeValues: { ':ts': newScore },
    }))

    return { success: true, data: { newScore } }
  } catch (error) {
    return handleActionError(error, 'updateTrustScore')
  }
}

// ── Update User Status ───────────────────────────────────────────────────────

export async function updateUserStatus(
  userId: string,
  status: 'active' | 'suspended' | 'banned'
): Promise<ActionResult<{ status: string }>> {
  try {
    const admin = await requireAdmin()
    if (!admin) throw new Error('Unauthorized')

    // Prevent self-modification
    const userResult = await dynamo.send(new GetCommand({
      TableName: TABLE,
      Key: { PK: `USER#${userId}`, SK: 'PROFILE' },
    }))

    if (!userResult.Item) {
      return { success: false, error: 'User not found' }
    }

    if (userResult.Item.email === admin) {
      throw new Error('SELF_MODIFICATION')
    }

    await dynamo.send(new UpdateCommand({
      TableName: TABLE,
      Key: { PK: `USER#${userId}`, SK: 'PROFILE' },
      UpdateExpression: 'SET account_status = :status',
      ExpressionAttributeValues: { ':status': status },
    }))

    return { success: true, data: { status } }
  } catch (error) {
    return handleActionError(error, 'updateUserStatus')
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function mapDynamoToUser(item: any): AdminUser {
  return {
    id: item.id || item.PK?.replace('USER#', '') || '',
    name: item.full_name || '',
    username: item.username || '',
    email: item.email || '',
    phone: item.phone_number || item.phone || '',
    trustScore: item.trust_score ?? 50,
    role: item.role || 'user',
    status: item.account_status || 'active',
    createdAt: item.created_at || item.GSI3SK || '',
    profilePhoto: item.avatar_url || undefined,
  }
}
