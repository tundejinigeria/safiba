'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { updateCaseStatus, deleteCase } from '@/src/actions/admin/missing-persons'
import { ConfirmDialog } from '@/src/components/admin/ConfirmDialog'

interface CaseActionsProps {
  caseId: string
  currentStatus: string
}

export function CaseActions({ caseId, currentStatus }: CaseActionsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [confirmAction, setConfirmAction] = useState<string | null>(null)

  const handleStatusChange = async (status: string) => {
    setError(null)
    setConfirmAction(null)
    const result = await updateCaseStatus(caseId, status)
    if (result.success) {
      startTransition(() => router.refresh())
    } else {
      setError(result.error)
    }
  }

  const handleDelete = async () => {
    setError(null)
    setConfirmAction(null)
    const result = await deleteCase(caseId)
    if (result.success) {
      router.push('/admin/missing-persons')
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="border border-neutral-200 bg-white p-5">
      <h2 className="text-sm font-medium text-neutral-900 mb-4">Update Case Status</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 px-4 py-2 mb-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        {['active', 'found_safe', 'found_deceased', 'closed'].map((status) => (
          <button
            key={status}
            onClick={() => {
              if (status === 'found_deceased' && currentStatus === 'active') {
                setConfirmAction('found_deceased')
              } else {
                handleStatusChange(status)
              }
            }}
            disabled={isPending || currentStatus === status}
            className={`px-3 py-2 text-sm border capitalize transition-colors ${
              currentStatus === status
                ? 'bg-neutral-100 border-neutral-300 text-neutral-500 cursor-default'
                : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            {status.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      <div className="pt-4 border-t border-neutral-100">
        <button
          onClick={() => setConfirmAction('delete')}
          disabled={isPending}
          className="flex items-center gap-1.5 px-3 py-2 text-sm border border-red-200 text-red-700 hover:bg-red-50 transition-colors"
        >
          <Trash2 size={12} />
          Delete Case
        </button>
      </div>

      {/* Found Deceased Confirmation */}
      <ConfirmDialog
        open={confirmAction === 'found_deceased'}
        title="Mark as Found Deceased"
        description="Are you sure you want to mark this person as found deceased? This is a sensitive status change."
        variant="danger"
        confirmLabel="Confirm Status"
        onConfirm={() => handleStatusChange('found_deceased')}
        onCancel={() => setConfirmAction(null)}
        loading={isPending}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={confirmAction === 'delete'}
        title="Delete Case"
        description="This will permanently delete the missing person case. This cannot be undone."
        variant="danger"
        confirmLabel="Delete Permanently"
        onConfirm={handleDelete}
        onCancel={() => setConfirmAction(null)}
        loading={isPending}
      />
    </div>
  )
}
