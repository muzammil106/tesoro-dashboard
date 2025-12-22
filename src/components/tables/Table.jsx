import { memo } from 'react'
import { cn } from '../../utils/cn'

export const Table = memo(function Table({ columns, rows, rowKey, className }) {
  return (
    <div className={cn('overflow-x-auto overflow-y-hidden rounded-2xl border border-slate-200', className)}>
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-slate-900">
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                className="px-4 py-3 font-semibold text-white"
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={rowKey(r)} className="border-t border-slate-200">
              {columns.map((c) => (
                <td key={c.key} className="px-4 py-3 text-slate-800">
                  {c.cell(r)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
})
