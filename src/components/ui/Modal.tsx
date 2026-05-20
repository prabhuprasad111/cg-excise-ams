import { clsx } from "clsx";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "./Button";

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div
        className={clsx(
          "panel-card relative z-10 max-h-[min(90vh,100dvh)] w-full max-w-[100vw] overflow-y-auto rounded-2xl border border-emerald-100 bg-white p-4 shadow-2xl sm:max-h-[90vh] sm:p-6",
          wide ? "sm:max-w-3xl" : "sm:max-w-lg",
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold text-[var(--color-cg-green-900)]">{title}</h2>
          <Button variant="ghost" className="!p-1" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="text-sm text-slate-700">{children}</div>
        {footer && (
          <div className="mt-6 flex flex-col-reverse gap-2 border-t border-emerald-100 pt-4 sm:flex-row sm:flex-wrap sm:justify-end">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
