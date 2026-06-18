'use server'

import { QueryCommand, PutCommand } from '@aws-sdk/lib-dynamodb'
import { dynamo, TABLES } from '@/src/lib/aws/dynamodb'
import { requireAdmin } from '@/src/lib/session'
import { handleActionError } from '@/src/lib/admin/errors'
import type { ActionResult } from '@/src/types/admin'

const TABLE = TABLES.MAIN

// ── Types ────────────────────────────────────────────────────────────────────

export interface SubscriptionPlan {
  id: string
  name: string
  member_cap: number
  monthly_price: number
  annual_price: number
  is_custom_pricing: boolean
  per_user_price: number
  discount_percent: number
  discount_label: string | null
  discount_expires_at: string | null
}

// Default plans (used as fallback if none are stored in DynamoDB)
const DEFAULT_PLANS: SubscriptionPlan[] = [
  { id: 'starter_hub', name: 'Starter Hub', member_cap: 20, monthly_price: 6000, annual_price: 72000, is_custom_pricing: false, per_user_price: 0, discount_percent: 0, discount_label: null, discount_expires_at: null },
  { id: 'growth_hub', name: 'Growth Hub', member_cap: 50, monthly_price: 15000, annual_price: 180000, is_custom_pricing: false, per_user_price: 0, discount_percent: 0, discount_label: null, discount_expires_at: null },
  { id: 'enterprise_hub', name: 'Enterprise Hub', member_cap: 100, monthly_price: 30000, annual_price: 360000, is_custom_pricing: false, per_user_price: 0, discount_percent: 0, discount_label: null, discount_expires_at: null },
  { id: 'enterprise_pro_hub', name: 'Enterprise Pro Hub', member_cap: 0, monthly_price: 0, annual_price: 0, is_custom_pricing: true, per_user_price: 300, discount_percent: 0, discount_label: null, discount_expires_at: null },
]

// ── Get Plans ────────────────────────────────────────────────────────────────

export async function getPlans(): Promise<SubscriptionPlan[]> {
  const admin = await requireAdmin()
  if (!admin) throw new Error('Unauthorized')

  const result = await dynamo.send(new QueryCommand({
    TableName: TABLE,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: { ':pk': 'CONFIG#PLANS', ':sk': 'PLAN#' },
  }))

  if (result.Items && result.Items.length > 0) {
    return result.Items.map((item: Record<string, any>): SubscriptionPlan => ({
      id: item.plan_id,
      name: item.name,
      member_cap: item.member_cap || 0,
      monthly_price: item.monthly_price || 0,
      annual_price: item.annual_price || 0,
      is_custom_pricing: item.is_custom_pricing || false,
      per_user_price: item.per_user_price || 0,
      discount_percent: item.discount_percent || 0,
      discount_label: item.discount_label || null,
      discount_expires_at: item.discount_expires_at || null,
    }))
  }

  return DEFAULT_PLANS
}

// ── Update Plan ──────────────────────────────────────────────────────────────

export async function updatePlan(plan: SubscriptionPlan): Promise<ActionResult<{ success: boolean }>> {
  try {
    const admin = await requireAdmin()
    if (!admin) throw new Error('Unauthorized')

    await dynamo.send(new PutCommand({
      TableName: TABLE,
      Item: {
        PK: 'CONFIG#PLANS',
        SK: `PLAN#${plan.id}`,
        plan_id: plan.id,
        name: plan.name,
        member_cap: plan.member_cap,
        monthly_price: plan.monthly_price,
        annual_price: plan.annual_price,
        is_custom_pricing: plan.is_custom_pricing,
        per_user_price: plan.per_user_price,
        discount_percent: plan.discount_percent,
        discount_label: plan.discount_label,
        discount_expires_at: plan.discount_expires_at,
        updated_at: new Date().toISOString(),
      },
    }))

    return { success: true, data: { success: true } }
  } catch (error) {
    return handleActionError(error, 'updatePlan')
  }
}

// ── Set Discount ─────────────────────────────────────────────────────────────

export async function setDiscount(
  planId: string,
  discountPercent: number,
  label: string | null,
  expiresAt: string | null
): Promise<ActionResult<{ success: boolean }>> {
  try {
    const admin = await requireAdmin()
    if (!admin) throw new Error('Unauthorized')

    if (discountPercent < 0 || discountPercent > 100) {
      return { success: false, error: 'Discount must be between 0 and 100%' }
    }

    // First get the existing plan
    const plans = await getPlans()
    const plan = plans.find(p => p.id === planId)
    if (!plan) return { success: false, error: 'Plan not found' }

    // Update with discount
    await dynamo.send(new PutCommand({
      TableName: TABLE,
      Item: {
        PK: 'CONFIG#PLANS',
        SK: `PLAN#${planId}`,
        plan_id: plan.id,
        name: plan.name,
        member_cap: plan.member_cap,
        monthly_price: plan.monthly_price,
        annual_price: plan.annual_price,
        is_custom_pricing: plan.is_custom_pricing,
        per_user_price: plan.per_user_price,
        discount_percent: discountPercent,
        discount_label: label,
        discount_expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      },
    }))

    return { success: true, data: { success: true } }
  } catch (error) {
    return handleActionError(error, 'setDiscount')
  }
}
