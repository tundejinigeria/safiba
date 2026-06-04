'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Shield, Ban, Clock, FileText } from 'lucide-react'
import { takeEnforcementAction, dismissReport, updateReportStatus } from '@/src/actions/admin/reports'

interface ReportActionsProps {
  reportId: string
  currentStatus: string
}

export function ReportActions({ reportId, currentStatus }: ReportActionsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [selectedAction, setSelectedAction] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [durationDays, setDurationDays] = useState('')
  const [dismissReason, setDismissReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const resetState = () => {
    setSelectedAction(null)
    setNotes('')
    setDurationDays('')
    setDismissReason('')
  }

  const handleMarkUnderReview = async () => {
    setError(null)
    setSuccess(null)
    const result = await updateReportStatus(reportId, 'under_review')
    if (result.success) {
      setSuccess('Report marked as under review')
      startTransition(() => router.refresh())
    } else {
      setError(result.error)
    }
  }

  const handleWarn = async () => {
    setError(null)
    setSuccess(null)
    const result = await takeEnforcementAction(reportId, { action_type: 'warn', notes: notes || undefined })
    if (result.success) {
      setSuccess('Warning issued successfully')
      resetState()
      startTransition(() => router.refresh())
    } else {
      setError(result.error)
    }
  }

  const handleSuspend = async () => {
    setError(null)
    setSuccess(null)
    const duration = parseInt(durationDays, 10)
    if (!duration || duration < 1) {
      setError('Please enter a valid suspension duration (days)')
      return
    }
    const result = await takeEnforcementAction(reportId, {
      action_type: 'suspend',
      notes: notes || undefined,
      duration_days: duration,
    })
    if (result.success) {
      setSuccess('User suspended successfully')
      resetState()
      startTransition(() => router.refresh())
    } else {
      setError(result.error)
    }
  }

  const handleBan = async () => {
    setError(null)
    setSuccess(null)
    const result = await takeEnforcementAction(reportId, { action_type: 'ban', notes: notes || undefined })
    if (result.success) {
      setSuccess('User banned successfully')
      resetState()
      startTransition(() => router.refresh())
    } else {
      setError(result.error)
    }
  }

  const handleDismiss = async () => {
    setError(null)
    setSuccess(null)
    if (!dismissReason.trim()) {
      setError('Please provide a reason for dismissal')
      return
    }
    const result = await dismissReport(reportId, dismissReason.trim())
    if (result.success) {
      setSuccess('Report dismissed')
      resetState()
      startTransition(() => router.refresh())
    } else {
      setError(result.error)
    }
  }

  const isTerminal = currentStatus === 'resolved' || currentStatus === 'dismissed'

  if (isTerminal) {
    return (
      <div className="border border-neutral-200 bg-white p-5">
        <h2 className="text-sm font-medium text-neutral-900 mb-2">Enforcement Actions</h2>
        <p className="text-sm text-neutral-500">This report has been {currentStatus}. No further actions available.</p>
      </div>
    )
  }

  return (
    <div className="border border-neutral-200 bg-white p-5">
      <h2 className="text-sm font-medium text-neutral-900 mb-4">Enforcement Actions</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 px-4 py-2 mb-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 mb-4">
          <p className="text-sm text-emerald-700">{success}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {currentStatus === 'pending' && (
          <button
            onClick={handleMarkUnderReview}
            disabled={isPending}
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-blue-200 text-blue-700 hover:bg-blue-50 transition-colors disabled:opacity-50"
          >
            <Clock size={12} />
            Mark Under Review
          </button>
        )}
        <button
          onClick={() => setSelectedAction(selectedAction === 'warn' ? null : 'warn')}
          disabled={isPending}
          className="flex items-center gap-1.5 px-3 py-2 text-sm border border-amber-200 text-amber-700 hover:bg-amber-50 transition-colors disabled:opacity-50"
        >
          <AlertTriangle size={12} />
          Warn
        </button>
        <button
          onClick={() => setSelectedAction(selectedAction === 'suspend' ? null : 'suspend')}
          disabled={isPending}
          className="flex items-center gap-1.5 px-3 py-2 text-sm border border-orange-200 text-orange-700 hover:bg-orange-50 transition-colors disabled:opacity-50"
        >
          <Shield size={12} />
          Suspend
        </button>
        <button
          onClick={() => setSelectedAction(selectedAction === 'ban' ? null : 'ban')}
          disabled={isPending}
          className="flex items-center gap-1.5 px-3 py-2 text-sm border border-red-200 text-red-700 hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          <Ban size={12} />
          Ban
        </button>
        <button
          onClick={() => setSelectedAction(selectedAction === 'dismiss' ? null : 'dismiss')}
          disabled={isPending}
          className="flex items-center gap-1.5 px-3 py-2 text-sm border border-neutral-200 text-neutral-700 hover:bg-neutral-50 transition-colors disabled:opacity-50"
        >
          <FileText size={12} />
          Dismiss
        </button>
      </div>

      {/* Action Panels */}
      {selectedAction === 'warn' && (
        <div className="border border-amber-100 bg-amber-50/50 p-4 space-y-3">
          <p className="text-sm font-medium text-amber-800">Issue Warning</p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Admin notes (optional)"
            className="w-full px-3 py-2 text-sm border border-neutral-200 bg-white focus:outline-none focus:ring-1 focus:ring-amber-300 resize-none"
            rows={3}
          />
          <button
            onClick={handleWarn}
            disabled={isPending}
            className="px-4 py-2 text-sm bg-amber-600 text-white hover:bg-amber-700 transition-colors disabled:opacity-50"
          >
            {isPending ? 'Processing...' : 'Confirm Warning'}
          </button>
        </div>
      )}

      {selectedAction === 'suspend' && (
        <div className="border border-orange-100 bg-orange-50/50 p-4 space-y-3">
          <p className="text-sm font-medium text-orange-800">Suspend User</p>
          <div>
            <label className="text-xs text-neutral-600 mb-1 block">Duration (days)</label>
            <input
              type="number"
              min="1"
              value={durationDays}
              onChange={(e) => setDurationDays(e.target.value)}
              placeholder="e.g. 7"
              className="w-32 px-3 py-2 text-sm border border-neutral-200 bg-white focus:outline-none focus:ring-1 focus:ring-orange-300"
            />
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Admin notes (optional)"
            className="w-full px-3 py-2 text-sm border border-neutral-200 bg-white focus:outline-none focus:ring-1 focus:ring-orange-300 resize-none"
            rows={3}
          />
          <button
            onClick={handleSuspend}
            disabled={isPending}
            className="px-4 py-2 text-sm bg-orange-600 text-white hover:bg-orange-700 transition-colors disabled:opacity-50"
          >
            {isPending ? 'Processing...' : 'Confirm Suspension'}
          </button>
        </div>
      )}

      {selectedAction === 'ban' && (
        <div className="border border-red-100 bg-red-50/50 p-4 space-y-3">
          <p className="text-sm font-medium text-red-800">Ban User</p>
          <p className="text-xs text-red-600">This will permanently ban the user and remove them from all communities.</p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Admin notes (optional)"
            className="w-full px-3 py-2 text-sm border border-neutral-200 bg-white focus:outline-none focus:ring-1 focus:ring-red-300 resize-none"
            rows={3}
          />
          <button
            onClick={handleBan}
            disabled={isPending}
            className="px-4 py-2 text-sm bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {isPending ? 'Processing...' : 'Confirm Ban'}
          </button>
        </div>
      )}

      {selectedAction === 'dismiss' && (
        <div className="border border-neutral-200 bg-neutral-50 p-4 space-y-3">
          <p className="text-sm font-medium text-neutral-800">Dismiss Report</p>
          <textarea
            value={dismissReason}
            onChange={(e) => setDismissReason(e.target.value)}
            placeholder="Reason for dismissal (required)"
            className="w-full px-3 py-2 text-sm border border-neutral-200 bg-white focus:outline-none focus:ring-1 focus:ring-neutral-300 resize-none"
            rows={3}
          />
          <button
            onClick={handleDismiss}
            disabled={isPending}
            className="px-4 py-2 text-sm bg-neutral-700 text-white hover:bg-neutral-800 transition-colors disabled:opacity-50"
          >
            {isPending ? 'Processing...' : 'Confirm Dismissal'}
          </button>
        </div>
      )}
    </div>
  )
}
