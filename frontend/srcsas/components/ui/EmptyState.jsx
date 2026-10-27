import { Inbox } from 'lucide-react'

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'Aucune donnée disponible',
  message = "Il n'y a actuellement rien à afficher.",
  action,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-neutral-300 bg-white px-6 py-16 text-center ${className}`}>
      <Icon className="h-10 w-10 text-neutral-300" aria-hidden="true" />
      <div>
        <p className="text-sm font-semibold text-neutral-700">{title}</p>
        <p className="mt-1 text-sm text-neutral-500">{message}</p>
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}