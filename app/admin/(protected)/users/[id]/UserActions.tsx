'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Ban, RefreshCw } from 'lucide-react'
import { updateTrustScore, updateUserStatus } from '@/src/actions/admin/users'
import { ConfirmDialog } from '@/src/components/admin/ConfirmDialog'

interface UserActionsProps {
  userId: string
  currentStatus: string
  currentTrustScore: number
}

export function UserActions({ userId, currentStatus, currentTrustScore }: UserActionsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [scoreAdjustment, setScoreAdjustment] = useState('')
  const [confirmAction, setConfirmAction] = useState<{ type: string; status: string } | null>(null)

  const handleTrustScoreUpdate = async () => {
    const adj = parseInt(scoreAdjustment)
    if (isNaN(adj)) return

    setError(null)
    const result = await updateTrustScore(userId, adj)
    if (result.success) {
      setScoreAdjustment('')
      startTransition(() => router.refresh())
    } else {
      setError(result.error)
    }
  }

  const handleStatusChange = async (status: 'active' | 'suspended' | 'banned') => {
    setError(null)
    setConfirmAction(null)
    const result = await updateUserStatus(userId, status)
    if (result.success) {
      startTransition(() => router.refresh())
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="border border-neutral-200 bg-white p-5 mb-6">
      <h2 className="text-sm font-medium text-neutral-900 mb-4">Admin Actions</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 px-4 py-2 mb-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Trust Score Adjustment */}
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-neutral-100">
        <label className="text-sm text-neutral-600 shrink-0">Adjust trust score:</label>
        <input
          type="number"
          value={scoreAdjustment}
          onChange={(e) => setScoreAdjustment(e.target.value)}
          placeholder="e.g. +10 or -5"
          className="w-24 px-3 py-1.5 text-sm border border-neutral-200 focus:outline-none focus:border-neutral-400"
        />
        <button
          onClick={handleTrustScoreUpdate}
          disabled={!scoreAdjustment || isPending}
          className="px-3 py-1.5 text-sm bg-neutral-900 text-white hover:bg-neutral-700 disabled:opacity-40 transition-colors"
        >
          Apply
        </button>
        <span className="text-xs text-neutral-400">Current: {currentTrustScore}</span>
      </div>

      {/* Status Actions */}
      <div className="flex flex-wrap gap-2">
        {currentStatus !== 'active' && (
          <button
            onClick={() => setConfirmAction({ type: 'reactivate', status: 'active' })}
            disabled={isPending}
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition-colors"
          >
            <RefreshCw size={12} />
            Reactivate
          </button>
        )}
        {currentStatus !== 'suspended' && (
          <button
            onClick={() => setConfirmAction({ type: 'suspend', status: 'suspended' })}
            disabled={isPending}
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-amber-200 text-amber-700 hover:bg-amber-50 transition-colors"
          >
            <Shield size={12} />
            Suspend
          </button>
        )}
        {currentStatus !== 'banned' && (
          <button
            onClick={() => setConfirmAction({ type: 'ban', status: 'banned' })}
            disabled={isPending}
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-red-200 text-red-700 hover:bg-red-50 transition-colors"
          >
            <Ban size={12} />
            Ban
          </button>
        )}
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={!!confirmAction}
        title={`${confirmAction?.type === 'ban' ? 'Ban' : confirmAction?.type === 'suspend' ? 'Suspend' : 'Reactivate'} User`}
        description={
          confirmAction?.type === 'ban'
            ? 'This user will be permanently banned and unable to access the app.'
            : confirmAction?.type === 'suspend'
            ? 'This user will be temporarily suspended and unable to post or interact.'
            : 'This user will be reactivated and able to use the app normally.'
        }
        variant={confirmAction?.type === 'ban' ? 'danger' : confirmAction?.type === 'suspend' ? 'warning' : 'default'}
        confirmLabel={confirmAction?.type === 'ban' ? 'Ban User' : confirmAction?.type === 'suspend' ? 'Suspend' : 'Reactivate'}
        onConfirm={() => handleStatusChange(confirmAction!.status as 'active' | 'suspended' | 'banned')}
        onCancel={() => setConfirmAction(null)}
        loading={isPending}
      />
    </div>
  )
}
