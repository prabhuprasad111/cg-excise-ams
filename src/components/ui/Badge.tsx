import { clsx } from "clsx";
import type { ReactNode } from "react";

const tones = {
  neutral: "bg-slate-100 text-slate-700",
  warn: "bg-amber-100 text-amber-900",
  success: "bg-sky-100 text-sky-900",
  danger: "bg-red-100 text-red-800",
};

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: keyof typeof tones }) {
  return (
    <span className={clsx("inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold", tones[tone])}>{children}</span>
  );
}
