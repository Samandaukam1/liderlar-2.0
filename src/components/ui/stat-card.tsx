import * as React from "react";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/utils";

export function StatCard({
  value,
  label,
  gradientClassName = "bg-gradient-blue",
  icon,
  className,
}: {
  value: number | string;
  label: string;
  gradientClassName?: string;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-brand-soft bg-paper p-6 shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover",
        className
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-15 blur-2xl transition-opacity group-hover:opacity-25",
          gradientClassName
        )}
      />
      {icon && (
        <div className={cn("mb-3 inline-flex h-10 w-10 items-center justify-center rounded-md text-white", gradientClassName)}>
          {icon}
        </div>
      )}
      <div className="font-display text-4xl font-semibold leading-none text-navy sm:text-5xl">
        {typeof value === "number" ? formatNumber(value) : value}
      </div>
      <p className="mt-1 text-sm text-ink-soft">{label}</p>
    </div>
  );
}
