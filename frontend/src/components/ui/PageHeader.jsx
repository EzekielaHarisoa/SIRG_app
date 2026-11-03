export default function PageHeader({ title, description, actions }) {
  return (
    <header className="flex flex-col gap-3 border border-slate-200 bg-white px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h2 className="text-lg font-semibold leading-6 tracking-tight text-slate-900">{title}</h2>
        {description && (
          <p className="mt-0.5 text-[13px] leading-5 text-slate-600">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  )
}