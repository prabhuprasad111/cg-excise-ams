import { clsx } from "clsx";
import type { ReactNode } from "react";

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  empty,
  loading,
}: {
  columns: { key: string; header: string; render: (row: T) => ReactNode; className?: string }[];
  rows: T[];
  rowKey: (row: T) => string;
  empty?: ReactNode;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="brand-table-empty flex min-h-[160px] items-center justify-center rounded-xl border border-dashed border-emerald-200 bg-emerald-50/30">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
      </div>
    );
  }
  if (!rows.length) {
    return (
      <div className="brand-table-empty flex min-h-[160px] items-center justify-center rounded-xl border border-dashed border-emerald-200 bg-white p-6 text-center text-sm text-slate-500">
        {empty ?? "No records"}
      </div>
    );
  }
  return (
    <div className="brand-table overflow-x-auto rounded-xl border border-emerald-100 bg-white">
      <table className="min-w-full divide-y divide-emerald-100 text-sm">
        <thead className="bg-emerald-50/80">
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                scope="col"
                className={clsx(
                  "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-cg-green-900)]",
                  c.className,
                )}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-emerald-50 bg-white">
          {rows.map((row) => (
            <tr key={rowKey(row)} className="transition-colors hover:bg-emerald-50/40">
              {columns.map((c) => (
                <td key={c.key} className={clsx("whitespace-nowrap px-4 py-3 text-slate-700", c.className)}>
                  {c.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
