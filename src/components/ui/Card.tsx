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
        "panel-card brand-card relative min-w-0 overflow-hidden p-4 sm:p-5",
        className,
      )}
    >
      <div className="relative z-[1]">
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
    </div>
  );
}
