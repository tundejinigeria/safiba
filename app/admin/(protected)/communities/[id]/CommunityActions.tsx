'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle, Trash2 } from 'lucide-react'
import { updateCommunityVerification, deleteCommunity } from '@/src/actions/admin/communities'
import { ConfirmDialog } from '@/src/components/admin/ConfirmDialog'

interface CommunityActionsProps {
  communityId: string
  verified: boolean
  memberCount: number
}

export function CommunityActions({ communityId, verified, memberCount }: CommunityActionsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleVerify = async () => {
    setError(null)
    const result = await updateCommunityVerification(communityId, !verified)
    if (result.success) {
      startTransition(() => router.refresh())
    } else {
      setError(result.error)
    }
  }

  const handleDelete = async () => {
    setError(null)
    setShowDeleteConfirm(false)
    const result = await deleteCommunity(communityId)
    if (result.success) {
      router.push('/admin/communities')
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
        <button
          onClick={handleVerify}
          disabled={isPending}
          className={`flex items-center gap-1.5 px-3 py-2 text-sm border transition-colors ${
            verified
              ? 'border-amber-200 text-amber-700 hover:bg-amber-50'
              : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
          }`}
        >
          {verified ? <XCircle size={12} /> : <CheckCircle size={12} />}
          {verified ? 'Remove Verification' : 'Verify Community'}
        </button>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          disabled={isPending}
          className="flex items-center gap-1.5 px-3 py-2 text-sm border border-red-200 text-red-700 hover:bg-red-50 transition-colors"
        >
          <Trash2 size={12} />
          Delete Community
        </button>
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete Community"
        description={
          memberCount > 10
            ? `Warning: This community has ${memberCount} members. Deleting it will remove all member records. This cannot be undone.`
            : 'This will permanently delete the community and all associated data. This cannot be undone.'
        }
        variant="danger"
        confirmLabel="Delete Permanently"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        loading={isPending}
      />
    </div>
  )
}
