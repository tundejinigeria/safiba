'use server'

import { QueryCommand, GetCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb'
import { dynamo, TABLES } from '@/src/lib/aws/dynamodb'
import { requireAdmin } from '@/src/lib/session'
import { handleActionError } from '@/src/lib/admin/errors'
import { buildPaginationParams, getNextCursor } from '@/src/lib/admin/pagination'
import type { MissingPerson, PaginatedParams, PaginatedResult, ActionResult } from '@/src/types/admin'

const TABLE = TABLES.MAIN

export async function getMissingPersons(params: PaginatedParams = {}): Promise<PaginatedResult<MissingPerson>> {
  const admin = await requireAdmin()
  if (!admin) throw new Error('Unauthorized')

  const { cursor, limit, filters } = params
  const pagination = buildPaginationParams(cursor, limit)

  const result = await dynamo.send(new QueryCommand({
    TableName: TABLE,
    IndexName: 'GSI3',
    KeyConditionExpression: 'GSI3PK = :pk',
    ExpressionAttributeValues: { ':pk': 'TYPE#MISSING_PERSONS' },
    ScanIndexForward: false,
    ...pagination,
  }))

  let cases = (result.Items || []).map((item: Record<string, unknown>): MissingPerson => ({
    id: (item.id || '') as string,
    caseId: (item.case_id || '') as string,
    name: (item.full_name || '') as string,
    age: item.age as number | undefined,
    gender: item.gender as string | undefined,
    description: (item.description || '') as string,
    photos: (item.photos || []) as string[],
    lastSeenLocation: {
      latitude: (item.last_seen_lat as number) || 0,
      longitude: (item.last_seen_lng as number) || 0,
      name: (item.last_seen_address as string) || undefined,
    },
    lastSeenDate: (item.last_seen_at || '') as string,
    status: (item.status || 'active') as string,
    reporterId: (item.reporter_id || '') as string,
    contactNumber: (item.contact_number || '') as string,
    createdAt: (item.created_at || item.GSI3SK || '') as string,
  }))

  if (filters?.status && filters.status !== 'all') {
    cases = cases.filter(c => c.status === filters.status)
  }
  if (filters?.search) {
    const search = filters.search.toLowerCase()
    cases = cases.filter(c =>
      c.name.toLowerCase().includes(search) ||
      c.description.toLowerCase().includes(search) ||
      (c.lastSeenLocation.name || '').toLowerCase().includes(search) ||
      c.caseId.toLowerCase().includes(search)
    )
  }

  return {
    items: cases,
    nextCursor: getNextCursor(result.LastEvaluatedKey),
    count: cases.length,
  }
}

export async function getMissingPerson(caseId: string): Promise<MissingPerson | null> {
  const admin = await requireAdmin()
  if (!admin) throw new Error('Unauthorized')

  const result = await dynamo.send(new GetCommand({
    TableName: TABLE,
    Key: { PK: `MISSING#${caseId}`, SK: 'METADATA' },
  }))

  if (!result.Item) return null
  const item = result.Item
  return {
    id: item.id || '',
    caseId: item.case_id || '',
    name: item.full_name || '',
    age: item.age || undefined,
    gender: item.gender || undefined,
    description: item.description || '',
    photos: item.photos || [],
    lastSeenLocation: {
      latitude: item.last_seen_lat || 0,
      longitude: item.last_seen_lng || 0,
      name: item.last_seen_address || undefined,
    },
    lastSeenDate: item.last_seen_at || '',
    status: item.status || 'active',
    reporterId: item.reporter_id || '',
    contactNumber: item.contact_number || '',
    createdAt: item.created_at || '',
  }
}

export async function updateCaseStatus(caseId: string, status: string): Promise<ActionResult<null>> {
  try {
    const admin = await requireAdmin()
    if (!admin) throw new Error('Unauthorized')

    const now = new Date().toISOString()
    await dynamo.send(new UpdateCommand({
      TableName: TABLE,
      Key: { PK: `MISSING#${caseId}`, SK: 'METADATA' },
      UpdateExpression: 'SET #status = :status, resolved_at = :resolved, updated_at = :now',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: {
        ':status': status,
        ':resolved': status !== 'active' ? now : null,
        ':now': now,
      },
    }))

    return { success: true, data: null }
  } catch (error) {
    return handleActionError(error, 'updateCaseStatus')
  }
}

export async function deleteCase(caseId: string): Promise<ActionResult<null>> {
  try {
    const admin = await requireAdmin()
    if (!admin) throw new Error('Unauthorized')

    await dynamo.send(new DeleteCommand({
      TableName: TABLE,
      Key: { PK: `MISSING#${caseId}`, SK: 'METADATA' },
    }))

    return { success: true, data: null }
  } catch (error) {
    return handleActionError(error, 'deleteCase')
  }
}
