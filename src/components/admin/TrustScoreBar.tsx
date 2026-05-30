'use client'

import { getTrustScoreColor, getTrustScoreLevel } from '@/src/lib/admin/trust-score'

interface TrustScoreBarProps {
  score: number
  showLabel?: boolean
}

export function TrustScoreBar({ score, showLabel = true }: TrustScoreBarProps) {
  const color = getTrustScoreColor(score)
  const level = getTrustScoreLevel(score)
  const percentage = Math.max(0, Math.min(100, score))

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden min-w-[60px]">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-medium text-neutral-600 w-7 text-right">{score}</span>
      {showLabel && (
        <span className="text-xs capitalize" style={{ color }}>{level}</span>
      )}
    </div>
  )
}
