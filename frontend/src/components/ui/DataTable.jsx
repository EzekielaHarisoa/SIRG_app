import { ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * Generic, presentational data table for resource lists.
 *
 * Props:
 *  - columns: [{ key, header, render?, className? }]
 *  - rows: array of row objects
 *  - rowKey: (row, index) => string | number
 *  - empty: ReactNode rendered when rows is empty
 *  - onRowClick: (row) => void  (optional)
 */
export default function DataTable({ columns, rows, rowKey, empty, onRowClick }) {
  if (!rows || rows.length === 0) {
    return empty || null
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-neutral-50 text-xs font-semibold uppercase tracking-wide text-neutral-500">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={`px-4 py-3 ${col.className ?? ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {rows.map((row, index) => (
            <tr
              key={rowKey ? rowKey(row, index) : index}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={`transition ${onRowClick ? 'cursor-pointer hover:bg-primary-50/50' : 'hover:bg-neutral-50'}`}
            >
              {columns.map((col) => (
                <td key={col.key} className={`px-4 py-3 text-neutral-700 ${col.className ?? ''}`}>
                  {col.render ? col.render(row) : (row[col.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
