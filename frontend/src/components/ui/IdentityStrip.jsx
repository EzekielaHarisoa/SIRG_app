/**
 * IdentityStrip — bandeau d'identité compact (même langage visuel que la page
 * « Mes pointages ») : nom, ligne de contexte, action facultative à droite.
 */
export default function IdentityStrip({ title, meta, aside }) {
  return (
    <section className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-900">{title}</p>
        {meta && <p className="mt-0.5 text-xs text-slate-500">{meta}</p>}
      </div>
      {aside && <div className="flex flex-wrap items-center gap-3">{aside}</div>}
    </section>
  )
}
