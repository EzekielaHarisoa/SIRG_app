import { formatCell, toTitle } from '../../utils/format.js'
import DataTable from './DataTable.jsx'

const HIDDEN_KEYS = new Set(['links', '_links', 'self', 'password'])

/**
 * AutoTable — renders a table directly from raw API rows, using the union of
 * their keys as columns. Useful when the exact schema is unknown/unconfirmed.
 */
export default function AutoTable({ rows, rowKey = 'id', hideKeys = [], emptyLabel }) {
  if (!rows || rows.length === 0) {
    return (
      <div className="rounded-md border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
        {emptyLabel || 'Aucune donnée.'}
      </div>
    )
  }

  const allHidden = new Set([...HIDDEN_KEYS, ...hideKeys])
  const keyOrder = []
  for (const row of rows) {
    if (!row || typeof row !== 'object') continue
    for (const k of Object.keys(row)) {
      if (!allHidden.has(k) && !keyOrder.includes(k)) keyOrder.push(k)
    }
  }

  const columns = keyOrder.map((key) => ({
    key,
    label: toTitle(key),
    render: (value) => formatCell(value),
  }))

  return <DataTable columns={columns} rows={rows} rowKey={rowKey} />
}
