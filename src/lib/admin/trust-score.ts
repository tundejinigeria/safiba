// ─────────────────────────────────────────────────────────────────────────────
// Trust Score Utilities
// ─────────────────────────────────────────────────────────────────────────────

import type { TrustScoreLevel } from '@/src/types/admin'

/**
 * Clamp a trust score adjustment to the valid range [0, 100].
 */
export function clampTrustScore(current: number, adjustment: number): number {
  return Math.max(0, Math.min(100, current + adjustment))
}

/**
 * Get the trust score level classification.
 * - Low: 0–30
 * - Medium: 31–60
 * - High: 61–100
 */
export function getTrustScoreLevel(score: number): TrustScoreLevel {
  if (score <= 30) return 'low'
  if (score <= 60) return 'medium'
  return 'high'
}

/**
 * Get the color for a trust score level (for UI rendering).
 */
export function getTrustScoreColor(score: number): string {
  const level = getTrustScoreLevel(score)
  switch (level) {
    case 'low': return '#DC2626'    // Red
    case 'medium': return '#D97706' // Amber
    case 'high': return '#059669'   // Green
  }
}
