'use server'

import { QueryCommand, ScanCommand, GetCommand } from '@aws-sdk/lib-dynamodb'
import { dynamo, TABLES } from '@/src/lib/aws/dynamodb'
import { requireAdmin } from '@/src/lib/session'
import { buildPaginationParams, getNextCursor } from '@/src/lib/admin/pagination'
import type { PaginatedParams, PaginatedResult } from '@/src/types/admin'
import type { AdminPayment, AdminSubscription, PaymentStats, PaymentFilters } from '@/src/types/payments'

const TABLE = TABLES.MAIN

// ── List Payments ────────────────────────────────────────────────────────────

export async function getPayments(params: PaginatedParams = {}): Promise<PaginatedResult<AdminPayment>> {
  const admin = await requireAdmin()
  if (!admin) throw new Error('Unauthorized')

  const { cursor, limit, filters } = params
  const pagination = buildPaginationParams(cursor, limit)

  // Query all payments via GSI3
  const result = await dynamo.send(new QueryCommand({
    TableName: TABLE,
    IndexName: 'GSI3',
    KeyConditionExpression: 'GSI3PK = :pk',
    ExpressionAttributeValues: { ':pk': 'TYPE#PAYMENTS' },
    ScanIndexForward: false,
    ...pagination,
  }))

  let payments = (result.Items || []).map(mapDynamoToPayment)

  // Apply filters client-side
  if (filters?.status && filters.status !== 'all') {
    payments = payments.filter(p => p.status === filters.status)
  }

  if (filters?.date_from) {
    payments = payments.filter(p => p.paid_at >= filters.date_from!)
  }

  if (filters?.date_to) {
    payments = payments.filter(p => p.paid_at <= filters.date_to!)
  }

  if (filters?.user_id) {
    payments = payments.filter(p => p.user_id === filters.user_id)
  }

  if (filters?.search) {
    const search = filters.search.toLowerCase()
    payments = payments.filter(p =>
      p.paystack_reference.toLowerCase().includes(search) ||
      p.user_id.toLowerCase().includes(search) ||
      p.community_id.toLowerCase().includes(search)
    )
  }

  return {
    items: payments,
    nextCursor: getNextCursor(result.LastEvaluatedKey),
    count: payments.length,
  }
}

// ── Get Payment Detail ───────────────────────────────────────────────────────

export async function getPaymentDetail(paymentId: string): Promise<{
  payment: AdminPayment
  subscription: AdminSubscription | null
  user: { id: string; name: string; email: string } | null
} | null> {
  const admin = await requireAdmin()
  if (!admin) throw new Error('Unauthorized')

  // Scan for the payment by id (payments are stored under SUBSCRIPTION# PK)
  const scanResult = await dynamo.send(new ScanCommand({
    TableName: TABLE,
    FilterExpression: 'id = :id AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':id': paymentId,
      ':sk': 'PAYMENT#',
    },
  }))

  if (!scanResult.Items || scanResult.Items.length === 0) return null

  const paymentItem = scanResult.Items[0]
  const payment = mapDynamoToPayment(paymentItem)

  // Fetch related subscription
  let subscription: AdminSubscription | null = null
  if (payment.subscription_id) {
    const subResult = await dynamo.send(new GetCommand({
      TableName: TABLE,
      Key: { PK: `SUBSCRIPTION#${payment.subscription_id}`, SK: 'METADATA' },
    }))
    if (subResult.Item) {
      subscription = mapDynamoToSubscription(subResult.Item)
    }
  }

  // Fetch related user
  let user: { id: string; name: string; email: string } | null = null
  if (payment.user_id) {
    const userResult = await dynamo.send(new GetCommand({
      TableName: TABLE,
      Key: { PK: `USER#${payment.user_id}`, SK: 'PROFILE' },
    }))
    if (userResult.Item) {
      user = {
        id: payment.user_id,
        name: (userResult.Item.full_name || '') as string,
        email: (userResult.Item.email || '') as string,
      }
    }
  }

  return { payment, subscription, user }
}

// ── Get Payment Stats ────────────────────────────────────────────────────────

export async function getPaymentStats(): Promise<PaymentStats> {
  const admin = await requireAdmin()
  if (!admin) throw new Error('Unauthorized')

  // Fetch all payments
  const paymentsResult = await dynamo.send(new QueryCommand({
    TableName: TABLE,
    IndexName: 'GSI3',
    KeyConditionExpression: 'GSI3PK = :pk',
    ExpressionAttributeValues: { ':pk': 'TYPE#PAYMENTS' },
  }))

  const payments = paymentsResult.Items || []

  // Fetch all subscriptions
  const subscriptionsResult = await dynamo.send(new QueryCommand({
    TableName: TABLE,
    IndexName: 'GSI3',
    KeyConditionExpression: 'GSI3PK = :pk',
    ExpressionAttributeValues: { ':pk': 'TYPE#SUBSCRIPTIONS' },
  }))

  const subscriptions = subscriptionsResult.Items || []

  // Aggregate stats
  const total_revenue = payments
    .filter(p => p.status === 'success')
    .reduce((sum, p) => sum + ((p.amount as number) || 0), 0)

  const active_subscriptions = subscriptions
    .filter(s => s.status === 'active')
    .length

  const failed_payments = payments
    .filter(p => p.status === 'failed')
    .length

  return { total_revenue, active_subscriptions, failed_payments }
}

// ── Export Payments ──────────────────────────────────────────────────────────

export async function exportPayments(filters: PaymentFilters = {}): Promise<string> {
  const admin = await requireAdmin()
  if (!admin) throw new Error('Unauthorized')

  // Fetch all payments
  const result = await dynamo.send(new QueryCommand({
    TableName: TABLE,
    IndexName: 'GSI3',
    KeyConditionExpression: 'GSI3PK = :pk',
    ExpressionAttributeValues: { ':pk': 'TYPE#PAYMENTS' },
    ScanIndexForward: false,
  }))

  let payments = (result.Items || []).map(mapDynamoToPayment)

  // Apply filters
  if (filters.status && filters.status !== 'all') {
    payments = payments.filter(p => p.status === filters.status)
  }
  if (filters.date_from) {
    payments = payments.filter(p => p.paid_at >= filters.date_from!)
  }
  if (filters.date_to) {
    payments = payments.filter(p => p.paid_at <= filters.date_to!)
  }
  if (filters.user_id) {
    payments = payments.filter(p => p.user_id === filters.user_id)
  }

  // Generate CSV
  const headers = ['ID', 'Subscription ID', 'User ID', 'Community ID', 'Amount', 'Status', 'Paystack Reference', 'Billing Cycle', 'Paid At', 'Created At']
  const rows = payments.map(p => [
    p.id,
    p.subscription_id,
    p.user_id,
    p.community_id,
    p.amount.toString(),
    p.status,
    p.paystack_reference,
    p.billing_cycle,
    p.paid_at,
    p.created_at,
  ])

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  return csv
}

// ── Get User Subscriptions (for user detail page) ────────────────────────────

export async function getUserSubscriptions(userId: string): Promise<AdminSubscription[]> {
  const admin = await requireAdmin()
  if (!admin) throw new Error('Unauthorized')

  const result = await dynamo.send(new QueryCommand({
    TableName: TABLE,
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :pk',
    ExpressionAttributeValues: { ':pk': `USER_SUBSCRIPTIONS#${userId}` },
    ScanIndexForward: false,
  }))

  return (result.Items || []).map(mapDynamoToSubscription)
}

// ── Get Community Subscription (for community detail page) ───────────────────

export async function getCommunitySubscription(communityId: string): Promise<AdminSubscription | null> {
  const admin = await requireAdmin()
  if (!admin) throw new Error('Unauthorized')

  const result = await dynamo.send(new QueryCommand({
    TableName: TABLE,
    IndexName: 'GSI2',
    KeyConditionExpression: 'GSI2PK = :pk',
    ExpressionAttributeValues: { ':pk': `COMMUNITY_SUB#${communityId}` },
    ScanIndexForward: false,
    Limit: 1,
  }))

  if (!result.Items || result.Items.length === 0) return null
  return mapDynamoToSubscription(result.Items[0])
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function mapDynamoToPayment(item: Record<string, unknown>): AdminPayment {
  return {
    id: (item.id || '') as string,
    subscription_id: (item.subscription_id || '') as string,
    user_id: (item.user_id || '') as string,
    community_id: (item.community_id || '') as string,
    amount: (item.amount as number) || 0,
    status: (item.status || 'pending') as 'success' | 'failed' | 'pending',
    paystack_reference: (item.paystack_reference || '') as string,
    billing_cycle: (item.billing_cycle || 'monthly') as 'monthly' | 'annual',
    paid_at: (item.paid_at || item.GSI3SK || '') as string,
    created_at: (item.created_at || '') as string,
  }
}

function mapDynamoToSubscription(item: Record<string, unknown>): AdminSubscription {
  return {
    id: (item.id || '') as string,
    user_id: (item.user_id || '') as string,
    community_id: (item.community_id || '') as string,
    plan_id: (item.plan_id || '') as string,
    plan_name: (item.plan_name || '') as string,
    status: (item.status || 'pending') as AdminSubscription['status'],
    billing_cycle: (item.billing_cycle || 'monthly') as 'monthly' | 'annual',
    member_cap: (item.member_cap as number) || 0,
    amount: (item.amount as number) || 0,
    next_payment_date: (item.next_payment_date || '') as string,
    created_at: (item.created_at || item.GSI3SK || '') as string,
  }
}
