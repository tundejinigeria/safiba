import { Inbox } from 'lucide-react'

interface EmptyStateProps {
  icon?: React.ElementType
  title: string
  description?: string
}

export function EmptyState({ icon: Icon = Inbox, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
        <Icon size={20} className="text-neutral-400" />
      </div>
      <p className="text-sm font-medium text-neutral-600">{title}</p>
      {description && (
        <p className="text-xs text-neutral-400 mt-1 text-center max-w-xs">{description}</p>
      )}
    </div>
  )
}
