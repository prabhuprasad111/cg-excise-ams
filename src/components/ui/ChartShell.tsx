import { clsx } from "clsx";
import type { ReactNode } from "react";

/** Responsive wrapper so ECharts/Apex fill width without horizontal overflow. */
export function ChartShell({
  children,
  className,
  size = "md",
}: {
  children: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const height =
    size === "lg"
      ? "h-[min(420px,58vh)] sm:h-[380px] lg:h-[420px]"
      : size === "sm"
        ? "h-[min(240px,38vh)] sm:h-64 lg:h-72"
        : "h-[min(280px,45vh)] sm:h-72 lg:h-80";

  return <div className={clsx("chart-shell w-full min-w-0 max-w-full", height, className)}>{children}</div>;
}
