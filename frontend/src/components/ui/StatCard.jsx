import { formatCell, formatMontant } from '../../utils/format.js'

/**
 * StatCard — displays a single real statistic.
 * value may be a number/string; formatter defaults to formatCell.
 */
export default function StatCard({ label, value, hint, formatter, icon }) {
  const display = formatter ? formatter(value) : formatCell(value)
  return (
    <div className="rounded-md border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-800">{display}</p>
          {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
        </div>
        {icon && <div className="text-slate-300">{icon}</div>}
      </div>
    </div>
  )
}

export function MontantStatCard(props) {
  return <StatCard {...props} formatter={formatMontant} />
}
