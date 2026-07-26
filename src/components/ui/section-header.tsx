import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  actionHref,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: string;
  actionHref?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div>
        {eyebrow && (
          <span className="mb-2 inline-block text-[0.68rem] font-bold uppercase tracking-[0.2em] text-liderlar-blue">
            {eyebrow}
          </span>
        )}
        <h2 className="font-display text-3xl font-semibold leading-none text-navy sm:text-4xl">{title}</h2>
        {description && <p className="mt-2 max-w-2xl text-sm text-ink-soft sm:text-base">{description}</p>}
      </div>
      {action && actionHref && (
        <Link
          href={actionHref}
          className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-liderlar-blue transition-colors hover:text-electric-blue"
        >
          {action}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
        </Link>
      )}
    </div>
  );
}
