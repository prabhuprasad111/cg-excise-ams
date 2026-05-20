import type { ReactNode } from "react";

export function EmptyState({ title, hint }: { title: string; hint?: ReactNode }) {
  return (
    <div className="brand-table-empty flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-12 text-center text-slate-500">
      <p className="font-medium text-slate-700">{title}</p>
      {hint ? <p className="text-sm">{hint}</p> : null}
    </div>
  );
}
