import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { clsx } from "clsx";

export type Crumb = { label: string; to?: string };

export function BreadcrumbNav({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1 text-xs text-slate-500 sm:mb-6 sm:text-sm">
      <Link
        to="/"
        className="inline-flex items-center gap-1 font-medium text-[var(--color-cg-green-800)] hover:text-[var(--color-cg-green-900)] hover:underline"
      >
        <Home className="h-4 w-4" />
        State
      </Link>
      {items.map((c, i) => (
        <span key={i} className="flex items-center gap-1">
          <ChevronRight className="h-4 w-4 text-slate-400" />
          {c.to ? (
            <Link
              to={c.to}
              className={clsx("font-medium text-[var(--color-cg-green-800)] hover:text-[var(--color-cg-green-900)] hover:underline")}
            >
              {c.label}
            </Link>
          ) : (
            <span className="font-semibold text-[var(--color-cg-green-900)]">{c.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
