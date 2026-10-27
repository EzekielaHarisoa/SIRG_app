export default function EmptyState({ label = 'Aucune donnée à afficher.', hint, action }) {
  return (
    <div className="rounded-md border border-dashed border-slate-300 bg-white p-10 text-center">
      <p className="text-sm font-medium text-slate-600">{label}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
