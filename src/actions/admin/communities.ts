'use server'

import { QueryCommand, GetCommand, UpdateCommand, DeleteCommand, ScanCommand } from '@aws-sdk/lib-dynamodb'
import { dynamo, TABLES } from '@/src/lib/aws/dynamodb'
import { requireAdmin } from '@/src/lib/session'
import { handleActionError } from '@/src/lib/admin/errors'
import { buildPaginationParams, getNextCursor } from '@/src/lib/admin/pagination'
import type { Community, PaginatedParams, PaginatedResult, ActionResult } from '@/src/types/admin'

const TABLE = TABLES.MAIN

export async function getCommunities(params: PaginatedParams = {}): Promise<PaginatedResult<Community>> {
  const admin = await requireAdmin()
  if (!admin) throw new Error('Unauthorized')

  const { cursor, limit, filters } = params
  const pagination = buildPaginationParams(cursor, limit)

  const result = await dynamo.send(new QueryCommand({
    TableName: TABLE,
    IndexName: 'GSI3',
    KeyConditionExpression: 'GSI3PK = :pk',
    ExpressionAttributeValues: { ':pk': 'TYPE#COMMUNITIES' },
    ScanIndexForward: false,
    ...pagination,
  }))

  let communities = (result.Items || []).map((item: Record<string, unknown>): Community => ({
    id: (item.id || '') as string,
    name: (item.name || '') as string,
    description: (item.description || '') as string,
    type: (item.community_type || 'other') as string,
    locationArea: (item.location_area || '') as string,
    memberCount: (item.member_count as number) || 0,
    verified: (item.is_verified as boolean) || false,
    isPrivate: (item.is_private as boolean) || false,
    createdAt: (item.created_at || item.GSI3SK || '') as string,
    creatorId: (item.created_by || '') as string,
  }))

  if (filters?.type && filters.type !== 'all') {
    communities = communities.filter(c => c.type === filters.type)
  }
  if (filters?.verified && filters.verified !== 'all') {
    communities = communities.filter(c => filters.verified === 'true' ? c.verified : !c.verified)
  }
  if (filters?.search) {
    const search = filters.search.toLowerCase()
    communities = communities.filter(c =>
      c.name.toLowerCase().includes(search) ||
      (c.locationArea || '').toLowerCase().includes(search) ||
      c.description.toLowerCase().includes(search)
    )
  }

  return {
    items: communities,
    nextCursor: getNextCursor(result.LastEvaluatedKey),
    count: communities.length,
  }
}

export async function getCommunity(communityId: string): Promise<Community | null> {
  const admin = await requireAdmin()
  if (!admin) throw new Error('Unauthorized')

  const result = await dynamo.send(new GetCommand({
    TableName: TABLE,
    Key: { PK: `COMMUNITY#${communityId}`, SK: 'METADATA' },
  }))

  if (!result.Item) return null
  const item = result.Item
  return {
    id: item.id || '',
    name: item.name || '',
    description: item.description || '',
    type: item.community_type || 'other',
    locationArea: item.location_area || '',
    memberCount: item.member_count || 0,
    verified: item.is_verified || false,
    isPrivate: item.is_private || false,
    createdAt: item.created_at || '',
    creatorId: item.created_by || '',
  }
}

export async function updateCommunityVerification(communityId: string, verified: boolean): Promise<ActionResult<null>> {
  try {
    const admin = await requireAdmin()
    if (!admin) throw new Error('Unauthorized')

    await dynamo.send(new UpdateCommand({
      TableName: TABLE,
      Key: { PK: `COMMUNITY#${communityId}`, SK: 'METADATA' },
      UpdateExpression: 'SET is_verified = :v',
      ExpressionAttributeValues: { ':v': verified },
    }))

    return { success: true, data: null }
  } catch (error) {
    return handleActionError(error, 'updateCommunityVerification')
  }
}

export async function deleteCommunity(communityId: string): Promise<ActionResult<null>> {
  try {
    const admin = await requireAdmin()
    if (!admin) throw new Error('Unauthorized')

    // Delete metadata
    await dynamo.send(new DeleteCommand({
      TableName: TABLE,
      Key: { PK: `COMMUNITY#${communityId}`, SK: 'METADATA' },
    }))

    // Delete all members
    const members = await dynamo.send(new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: { ':pk': `COMMUNITY#${communityId}`, ':sk': 'MEMBER#' },
    }))

    for (const member of (members.Items || [])) {
      await dynamo.send(new DeleteCommand({
        TableName: TABLE,
        Key: { PK: member.PK, SK: member.SK },
      }))
    }

    return { success: true, data: null }
  } catch (error) {
    return handleActionError(error, 'deleteCommunity')
  }
}


export async function getCommunityMembers(communityId: string) {
  const admin = await requireAdmin()
  if (!admin) throw new Error('Unauthorized')

  const result = await dynamo.send(new QueryCommand({
    TableName: TABLE,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': `COMMUNITY#${communityId}`,
      ':sk': 'MEMBER#',
    },
  }))

  const members = result.Items || []

  // Fetch profiles for each member
  const enriched = await Promise.all(
    members.map(async (m: Record<string, unknown>) => {
      try {
        const profile = await dynamo.send(new GetCommand({
          TableName: TABLE,
          Key: { PK: `USER#${m.user_id}`, SK: 'PROFILE' },
        }))
        return {
          id: (m.id || '') as string,
          userId: (m.user_id || '') as string,
          name: (profile.Item?.full_name || '') as string,
          username: (profile.Item?.username || '') as string,
          role: (m.role || 'member') as string,
          joinedAt: (m.joined_at || '') as string,
        }
      } catch {
        return {
          id: (m.id || '') as string,
          userId: (m.user_id || '') as string,
          name: 'Unknown',
          username: '',
          role: (m.role || 'member') as string,
          joinedAt: (m.joined_at || '') as string,
        }
      }
    })
  )

  return enriched
}
