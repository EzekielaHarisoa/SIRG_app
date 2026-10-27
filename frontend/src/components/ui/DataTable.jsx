import { formatCell, toTitle } from '../../utils/format.js'

/**
 * DataTable — table with configurable columns.
 *
 * columns: [{ key, label?, render?(value, row), className? }]
 */
export default function DataTable({ columns, rows, rowKey = 'id', emptyLabel = 'Aucune donnée.' }) {
  if (!rows || rows.length === 0) {
    return (
      <div className="rounded-md border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
        {emptyLabel}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={[
                  'whitespace-nowrap px-4 py-3 text-left font-medium text-slate-600',
                  col.className || '',
                ].join(' ')}
              >
                {col.label || toTitle(col.key)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, rowIndex) => (
            <tr key={row[rowKey] ?? rowIndex} className="hover:bg-slate-50/70">
              {columns.map((col) => {
                const value = row[col.key]
                const content = col.render ? col.render(value, row) : formatCell(value)
                return (
                  <td
                    key={col.key}
                    className={['px-4 py-3 align-top text-slate-700', col.className || ''].join(' ')}
                  >
                    {content}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
