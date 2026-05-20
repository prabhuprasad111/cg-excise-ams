import { clsx } from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";

const variants = {
  primary:
    "bg-[var(--color-cg-green-800)] text-white hover:bg-[var(--color-cg-green-700)] shadow-md shadow-emerald-900/20",
  secondary:
    "bg-white text-[var(--color-cg-green-900)] border border-emerald-200 hover:bg-emerald-50",
  ghost: "text-slate-600 hover:bg-emerald-50/80",
  danger: "bg-red-600 text-white hover:bg-red-500",
};

export function Button({
  className,
  variant = "primary",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={clsx(
        "inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 sm:w-auto sm:py-2",
        "disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
