'use client'

import { AlertTriangle } from 'lucide-react'
import { useRef, useEffect } from 'react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning' | 'default'
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (open) {
      dialogRef.current?.showModal()
    } else {
      dialogRef.current?.close()
    }
  }, [open])

  if (!open) return null

  const confirmColors = {
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    warning: 'bg-amber-600 hover:bg-amber-700 text-white',
    default: 'bg-neutral-900 hover:bg-neutral-700 text-white',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white border border-neutral-200 shadow-lg p-6 max-w-sm w-full mx-4">
        <div className="flex items-start gap-3 mb-4">
          {variant === 'danger' && (
            <div className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center shrink-0">
              <AlertTriangle size={16} className="text-red-600" />
            </div>
          )}
          <div>
            <h3 className="text-base font-semibold text-neutral-900">{title}</h3>
            <p className="text-sm text-neutral-500 mt-1 leading-relaxed">{description}</p>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm text-neutral-600 border border-neutral-200 hover:bg-neutral-50 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-sm font-medium transition-colors ${confirmColors[variant]} ${loading ? 'opacity-50' : ''}`}
          >
            {loading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
