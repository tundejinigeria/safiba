// ─────────────────────────────────────────────────────────────────────────────
// Admin Portal Payment & Subscription Types
// ─────────────────────────────────────────────────────────────────────────────

export interface AdminPayment {
  id: string
  subscription_id: string
  user_id: string
  community_id: string
  amount: number
  status: 'success' | 'failed' | 'pending'
  paystack_reference: string
  billing_cycle: 'monthly' | 'annual'
  paid_at: string
  created_at: string
}

export interface AdminSubscription {
  id: string
  user_id: string
  community_id: string
  plan_id: string
  plan_name: string
  status: 'pending' | 'active' | 'past_due' | 'cancelled' | 'expired'
  billing_cycle: 'monthly' | 'annual'
  member_cap: number
  amount: number
  next_payment_date: string
  created_at: string
}

export interface PaymentStats {
  total_revenue: number
  active_subscriptions: number
  failed_payments: number
}

export interface PaymentFilters {
  status?: string
  date_from?: string
  date_to?: string
  user_id?: string
  search?: string
}
