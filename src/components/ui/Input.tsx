import { clsx } from "clsx";
import type { InputHTMLAttributes } from "react";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={clsx(
        "brand-input w-full rounded-lg border px-3 py-2 text-sm text-slate-900 outline-none",
        "placeholder:text-slate-400",
        className,
      )}
      {...props}
    />
  );
}

export function Select({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={clsx(
        "brand-input w-full rounded-lg border px-3 py-2 text-sm text-slate-900 outline-none",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
