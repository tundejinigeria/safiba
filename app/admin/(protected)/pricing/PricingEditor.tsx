'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CreditCard, Percent, Save, Tag } from 'lucide-react'
import { updatePlan, setDiscount, type SubscriptionPlan } from '@/src/actions/admin/pricing'

interface PricingEditorProps {
  initialPlans: SubscriptionPlan[]
}

export function PricingEditor({ initialPlans }: PricingEditorProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [plans, setPlans] = useState(initialPlans)
  const [editingPlan, setEditingPlan] = useState<string | null>(null)
  const [discountPlan, setDiscountPlan] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Edit form state
  const [editForm, setEditForm] = useState<Partial<SubscriptionPlan>>({})

  // Discount form state
  const [discountPercent, setDiscountPercent] = useState('')
  const [discountLabel, setDiscountLabel] = useState('')
  const [discountExpiry, setDiscountExpiry] = useState('')

  const startEditing = (plan: SubscriptionPlan) => {
    setEditingPlan(plan.id)
    setEditForm({ ...plan })
    setDiscountPlan(null)
    setError(null)
    setSuccess(null)
  }

  const startDiscount = (plan: SubscriptionPlan) => {
    setDiscountPlan(plan.id)
    setDiscountPercent(plan.discount_percent?.toString() || '')
    setDiscountLabel(plan.discount_label || '')
    setDiscountExpiry(plan.discount_expires_at?.split('T')[0] || '')
    setEditingPlan(null)
    setError(null)
    setSuccess(null)
  }

  const handleSavePricing = async () => {
    if (!editingPlan || !editForm) return
    setError(null)
    setSuccess(null)

    const plan = plans.find(p => p.id === editingPlan)
    if (!plan) return

    const updatedPlan: SubscriptionPlan = {
      ...plan,
      name: editForm.name || plan.name,
      member_cap: editForm.member_cap ?? plan.member_cap,
      monthly_price: editForm.monthly_price ?? plan.monthly_price,
      annual_price: editForm.annual_price ?? plan.annual_price,
      per_user_price: editForm.per_user_price ?? plan.per_user_price,
    }

    const result = await updatePlan(updatedPlan)
    if (result.success) {
      setSuccess('Plan pricing updated')
      setEditingPlan(null)
      setPlans(plans.map(p => p.id === updatedPlan.id ? updatedPlan : p))
      startTransition(() => router.refresh())
    } else {
      setError(result.error)
    }
  }

  const handleSaveDiscount = async () => {
    if (!discountPlan) return
    setError(null)
    setSuccess(null)

    const percent = parseInt(discountPercent, 10) || 0
    const label = discountLabel.trim() || null
    const expiresAt = discountExpiry ? new Date(discountExpiry).toISOString() : null

    const result = await setDiscount(discountPlan, percent, label, expiresAt)
    if (result.success) {
      setSuccess(`Discount ${percent > 0 ? 'applied' : 'removed'}`)
      setDiscountPlan(null)
      setPlans(plans.map(p => p.id === discountPlan ? { ...p, discount_percent: percent, discount_label: label, discount_expires_at: expiresAt } : p))
      startTransition(() => router.refresh())
    } else {
      setError(result.error)
    }
  }

  const formatPrice = (amount: number) => `₦${amount.toLocaleString()}`

  return (
    <div>
      {error && (
        <div className="bg-red-50 border border-red-200 px-4 py-2 mb-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 mb-6">
          <p className="text-sm text-emerald-700">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {plans.map((plan) => (
          <div key={plan.id} className="border border-neutral-200 bg-white p-5">
            {/* Plan Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-neutral-900">{plan.name}</h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {plan.is_custom_pricing ? 'Custom per-member pricing' : `Up to ${plan.member_cap} members`}
                </p>
              </div>
              {plan.discount_percent > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-medium">
                  <Percent size={10} />
                  {plan.discount_percent}% off
                </span>
              )}
            </div>

            {/* Pricing Display */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {plan.is_custom_pricing ? (
                <div className="col-span-2">
                  <p className="text-xs text-neutral-500">Per member/month</p>
                  <p className="text-lg font-semibold text-neutral-900">{formatPrice(plan.per_user_price)}</p>
                </div>
              ) : (
                <>
                  <div>
                    <p className="text-xs text-neutral-500">Monthly</p>
                    <p className="text-lg font-semibold text-neutral-900">{formatPrice(plan.monthly_price)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">Annual</p>
                    <p className="text-lg font-semibold text-neutral-900">{formatPrice(plan.annual_price)}</p>
                  </div>
                </>
              )}
            </div>

            {/* Discount Info */}
            {plan.discount_percent > 0 && (
              <div className="bg-emerald-50 border border-emerald-100 px-3 py-2 mb-4">
                <p className="text-xs text-emerald-800">
                  <span className="font-medium">{plan.discount_label || 'Discount'}</span>
                  {' — '}{plan.discount_percent}% off
                  {plan.discount_expires_at && (
                    <span className="text-emerald-600"> · Expires {new Date(plan.discount_expires_at).toLocaleDateString()}</span>
                  )}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => startEditing(plan)}
                disabled={isPending}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs border border-neutral-200 text-neutral-700 hover:bg-neutral-50 transition-colors disabled:opacity-50"
              >
                <CreditCard size={12} />
                Edit Pricing
              </button>
              <button
                onClick={() => startDiscount(plan)}
                disabled={isPending}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition-colors disabled:opacity-50"
              >
                <Tag size={12} />
                {plan.discount_percent > 0 ? 'Edit Discount' : 'Add Discount'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Pricing Panel */}
      {editingPlan && (
        <div className="mt-6 border border-neutral-200 bg-white p-5">
          <h3 className="text-sm font-medium text-neutral-900 mb-4">
            Edit Pricing — {plans.find(p => p.id === editingPlan)?.name}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {!editForm.is_custom_pricing ? (
              <>
                <div>
                  <label className="text-xs text-neutral-600 mb-1 block">Monthly Price (₦)</label>
                  <input
                    type="number"
                    value={editForm.monthly_price || ''}
                    onChange={(e) => setEditForm({ ...editForm, monthly_price: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 bg-white focus:outline-none focus:border-neutral-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-neutral-600 mb-1 block">Annual Price (₦)</label>
                  <input
                    type="number"
                    value={editForm.annual_price || ''}
                    onChange={(e) => setEditForm({ ...editForm, annual_price: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 bg-white focus:outline-none focus:border-neutral-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-neutral-600 mb-1 block">Member Cap</label>
                  <input
                    type="number"
                    value={editForm.member_cap || ''}
                    onChange={(e) => setEditForm({ ...editForm, member_cap: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 bg-white focus:outline-none focus:border-neutral-400"
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="text-xs text-neutral-600 mb-1 block">Per-Member Price (₦/month)</label>
                <input
                  type="number"
                  value={editForm.per_user_price || ''}
                  onChange={(e) => setEditForm({ ...editForm, per_user_price: parseInt(e.target.value, 10) || 0 })}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 bg-white focus:outline-none focus:border-neutral-400"
                />
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSavePricing}
              disabled={isPending}
              className="flex items-center gap-1.5 px-4 py-2 text-sm bg-neutral-900 text-white hover:bg-neutral-700 transition-colors disabled:opacity-50"
            >
              <Save size={12} />
              Save Pricing
            </button>
            <button
              onClick={() => setEditingPlan(null)}
              className="px-4 py-2 text-sm border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Discount Panel */}
      {discountPlan && (
        <div className="mt-6 border border-emerald-100 bg-emerald-50/30 p-5">
          <h3 className="text-sm font-medium text-neutral-900 mb-4">
            Set Discount — {plans.find(p => p.id === discountPlan)?.name}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-xs text-neutral-600 mb-1 block">Discount %</label>
              <input
                type="number"
                min="0"
                max="100"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                placeholder="e.g. 20"
                className="w-full px-3 py-2 text-sm border border-neutral-200 bg-white focus:outline-none focus:border-emerald-400"
              />
            </div>
            <div>
              <label className="text-xs text-neutral-600 mb-1 block">Label (optional)</label>
              <input
                type="text"
                value={discountLabel}
                onChange={(e) => setDiscountLabel(e.target.value)}
                placeholder="e.g. Launch Promo"
                className="w-full px-3 py-2 text-sm border border-neutral-200 bg-white focus:outline-none focus:border-emerald-400"
              />
            </div>
            <div>
              <label className="text-xs text-neutral-600 mb-1 block">Expires (optional)</label>
              <input
                type="date"
                value={discountExpiry}
                onChange={(e) => setDiscountExpiry(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-neutral-200 bg-white focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>
          <p className="text-xs text-neutral-500 mb-4">Set to 0% to remove discount. Leave expiry empty for indefinite discount.</p>
          <div className="flex gap-2">
            <button
              onClick={handleSaveDiscount}
              disabled={isPending}
              className="flex items-center gap-1.5 px-4 py-2 text-sm bg-emerald-700 text-white hover:bg-emerald-800 transition-colors disabled:opacity-50"
            >
              <Tag size={12} />
              {parseInt(discountPercent, 10) > 0 ? 'Apply Discount' : 'Remove Discount'}
            </button>
            <button
              onClick={() => setDiscountPlan(null)}
              className="px-4 py-2 text-sm border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
