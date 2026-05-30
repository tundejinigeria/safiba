'use client'

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  // Alert statuses
  unverified: { bg: 'bg-amber-50', text: 'text-amber-700' },
  community_confirmed: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  official_confirmed: { bg: 'bg-blue-50', text: 'text-blue-700' },
  false_report: { bg: 'bg-red-50', text: 'text-red-700' },
  resolved: { bg: 'bg-neutral-100', text: 'text-neutral-600' },
  // User statuses
  active: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  suspended: { bg: 'bg-amber-50', text: 'text-amber-700' },
  banned: { bg: 'bg-red-50', text: 'text-red-700' },
  // Missing person statuses
  found_safe: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  found_deceased: { bg: 'bg-neutral-100', text: 'text-neutral-600' },
  closed: { bg: 'bg-neutral-100', text: 'text-neutral-500' },
  // Verification
  verified: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  unverified_community: { bg: 'bg-amber-50', text: 'text-amber-700' },
  // Severity
  low: { bg: 'bg-neutral-100', text: 'text-neutral-600' },
  medium: { bg: 'bg-blue-50', text: 'text-blue-700' },
  high: { bg: 'bg-amber-50', text: 'text-amber-700' },
  critical: { bg: 'bg-red-50', text: 'text-red-700' },
}

interface StatusBadgeProps {
  status: string
  label?: string
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const colors = STATUS_COLORS[status] || { bg: 'bg-neutral-100', text: 'text-neutral-600' }
  const displayLabel = label || status.replace(/_/g, ' ')

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium capitalize ${colors.bg} ${colors.text}`}>
      {displayLabel}
    </span>
  )
}
