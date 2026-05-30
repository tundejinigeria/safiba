'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  hasNext: boolean
  hasPrevious: boolean
  onNext: () => void
  onPrevious: () => void
  page: number
}

export function Pagination({ hasNext, hasPrevious, onNext, onPrevious, page }: PaginationProps) {
  return (
    <div className="flex items-center justify-between border-t border-neutral-200 pt-4 mt-4">
      <p className="text-xs text-neutral-500">Page {page}</p>
      <div className="flex items-center gap-2">
        <button
          onClick={onPrevious}
          disabled={!hasPrevious}
          className="flex items-center gap-1 px-3 py-1.5 text-xs text-neutral-600 border border-neutral-200 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={12} />
          Previous
        </button>
        <button
          onClick={onNext}
          disabled={!hasNext}
          className="flex items-center gap-1 px-3 py-1.5 text-xs text-neutral-600 border border-neutral-200 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Next
          <ChevronRight size={12} />
        </button>
      </div>
    </div>
  )
}
