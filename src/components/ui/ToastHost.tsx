import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { clsx } from "clsx";
import { useToastStore } from "../../store/useToastStore";

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

export function ToastHost() {
  const { toasts, dismiss } = useToastStore();
  return (
    <div className="pointer-events-none fixed bottom-4 left-3 right-3 z-[60] flex flex-col gap-2 sm:left-auto sm:right-4 sm:max-w-sm">
      {toasts.map((t) => {
        const Icon = icons[t.variant];
        return (
          <div
            key={t.id}
            className={clsx(
              "pointer-events-auto flex gap-3 rounded-xl border p-4 shadow-lg backdrop-blur-md transition-all duration-300",
              t.variant === "success" && "border-sky-200 bg-sky-50/95 text-sky-950",
              t.variant === "error" && "border-red-200 bg-red-50/95 text-red-950",
              t.variant === "info" && "border-slate-200 bg-white/95 text-slate-900",
            )}
          >
            <Icon className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{t.title}</p>
              {t.description && <p className="mt-0.5 text-xs opacity-90">{t.description}</p>}
            </div>
            <button type="button" className="shrink-0 opacity-60 hover:opacity-100" onClick={() => dismiss(t.id)} aria-label="Dismiss">
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
