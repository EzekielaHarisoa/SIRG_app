export default function LoadingState({ label = 'Chargement…' }) {
  return (
    <div className="flex items-center justify-center gap-3 rounded-md border border-slate-200 bg-white p-10 text-slate-500">
      <span
        aria-hidden="true"
        className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-r-slate-600"
      />
      <span className="text-sm">{label}</span>
    </div>
  )
}
