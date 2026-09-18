'use client';

import type { ChatTableData } from '../actions';

function isNumericColumn(rows: ChatTableData['rows'], col: string) {
  return rows.every((row) => row[col] === null || row[col] === undefined || !isNaN(Number(row[col])));
}

function formatCell(value: string | number | null) {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'number') return new Intl.NumberFormat('id-ID').format(value);
  if (typeof value === 'string' && !isNaN(Number(value))) {
    return new Intl.NumberFormat('id-ID').format(Number(value));
  }
  return value;
}

export function ChatTable({ table }: { table: ChatTableData }) {
  if (!table.rows.length) return null;

  return (
    <div className="mt-3 max-w-full overflow-x-auto rounded-2xl border border-slate-100 bg-white">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/60">
            {table.columns.map((col) => (
              <th
                key={col}
                className={`whitespace-nowrap px-3 py-2.5 text-[10px] font-black uppercase tracking-wider text-slate-400 ${
                  isNumericColumn(table.rows, col) ? 'text-right' : 'text-left'
                }`}
              >
                {col.replace(/_/g, ' ')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, i) => (
            <tr key={i} className="border-b border-slate-50 last:border-0">
              {table.columns.map((col) => (
                <td
                  key={col}
                  className={`whitespace-nowrap px-3 py-2 font-semibold text-slate-700 ${
                    isNumericColumn(table.rows, col) ? 'text-right font-mono tabular-nums' : 'text-left'
                  }`}
                >
                  {formatCell(row[col])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
