import { formatCell, formatMontant } from '../../utils/format.js'

/**
 * StatCard — displays a single real statistic.
 * value may be a number/string; formatter defaults to formatCell.
 */
export default function StatCard({ label, value, hint, formatter, icon }) {
  const display = formatter ? formatter(value) : formatCell(value)
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{display}</p>
          {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
        </div>
        {icon && <div className="rounded-md bg-blue-50 p-2 text-blue-700">{icon}</div>}
      </div>
    </div>
  )
}

export function MontantStatCard(props) {
  return <StatCard {...props} formatter={formatMontant} />
}
