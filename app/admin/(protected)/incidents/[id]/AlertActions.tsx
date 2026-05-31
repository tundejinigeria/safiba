'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Flag, Archive, Trash2 } from 'lucide-react'
import { updateAlertStatus, deleteAlert } from '@/src/actions/admin/alerts'
import { ConfirmDialog } from '@/src/components/admin/ConfirmDialog'

interface AlertActionsProps {
  alertId: string
  currentStatus: string
}

export function AlertActions({ alertId, currentStatus }: AlertActionsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [confirmAction, setConfirmAction] = useState<string | null>(null)

  const handleStatusChange = async (status: 'official_confirmed' | 'false_report' | 'resolved') => {
    setError(null)
    setConfirmAction(null)
    const result = await updateAlertStatus(alertId, status)
    if (result.success) {
      startTransition(() => router.refresh())
    } else {
      setError(result.error)
    }
  }

  const handleDelete = async () => {
    setError(null)
    setConfirmAction(null)
    const result = await deleteAlert(alertId)
    if (result.success) {
      router.push('/admin/incidents')
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="border border-neutral-200 bg-white p-5">
      <h2 className="text-sm font-medium text-neutral-900 mb-4">Admin Actions</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 px-4 py-2 mb-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {currentStatus !== 'official_confirmed' && (
          <button
            onClick={() => handleStatusChange('official_confirmed')}
            disabled={isPending}
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-blue-200 text-blue-700 hover:bg-blue-50 transition-colors"
          >
            <CheckCircle size={12} />
            Verify (Official)
          </button>
        )}
        {currentStatus !== 'false_report' && (
          <button
            onClick={() => setConfirmAction('false_report')}
            disabled={isPending}
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-amber-200 text-amber-700 hover:bg-amber-50 transition-colors"
          >
            <Flag size={12} />
            Mark as False
          </button>
        )}
        {currentStatus !== 'resolved' && (
          <button
            onClick={() => handleStatusChange('resolved')}
            disabled={isPending}
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition-colors"
          >
            <Archive size={12} />
            Resolve
          </button>
        )}
        <button
          onClick={() => setConfirmAction('delete')}
          disabled={isPending}
          className="flex items-center gap-1.5 px-3 py-2 text-sm border border-red-200 text-red-700 hover:bg-red-50 transition-colors"
        >
          <Trash2 size={12} />
          Delete
        </button>
      </div>

      {/* False Report Confirmation */}
      <ConfirmDialog
        open={confirmAction === 'false_report'}
        title="Mark as False Report"
        description="This will hide the alert from all feeds and apply a -10 trust score penalty to the creator."
        variant="warning"
        confirmLabel="Mark as False"
        onConfirm={() => handleStatusChange('false_report')}
        onCancel={() => setConfirmAction(null)}
        loading={isPending}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={confirmAction === 'delete'}
        title="Delete Alert"
        description={
          currentStatus === 'community_confirmed'
            ? 'Warning: This alert was verified by the community. Deleting it will remove it permanently.'
            : 'This will permanently delete the alert. This action cannot be undone.'
        }
        variant="danger"
        confirmLabel="Delete Permanently"
        onConfirm={handleDelete}
        onCancel={() => setConfirmAction(null)}
        loading={isPending}
      />
    </div>
  )
}
