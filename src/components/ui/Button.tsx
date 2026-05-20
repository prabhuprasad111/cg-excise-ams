import { clsx } from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";

const variants = {
  primary: "btn-primary-3d",
  secondary:
    "bg-white text-[var(--color-cg-green-900)] border border-sky-200/90 shadow-sm hover:bg-sky-50/80 hover:shadow-md",
  ghost: "text-slate-600 hover:bg-sky-50/90",
  danger: "bg-red-600 text-white shadow-md hover:bg-red-500 hover:shadow-lg",
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
