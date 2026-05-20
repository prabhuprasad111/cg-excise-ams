import { clsx } from "clsx";
import type { ReactNode } from "react";

export function Card({
  className,
  children,
  title,
  action,
}: {
  className?: string;
  children: ReactNode;
  title?: string;
  action?: ReactNode;
}) {
  return (
    <div
      className={clsx(
        "panel-card brand-card min-w-0 rounded-2xl border border-emerald-100/80 bg-white p-4 shadow-sm sm:p-5",
        "transition-shadow duration-300 hover:shadow-md",
        className,
      )}
    >
      {(title || action) && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          {title && (
            <h3 className="text-sm font-semibold tracking-tight text-[var(--color-cg-green-900)]">
              {title}
            </h3>
          )}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
