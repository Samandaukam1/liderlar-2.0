import * as React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  totalPages,
  buildHref,
  className,
}: {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
  className?: string;
}) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  return (
    <nav className={cn("flex items-center justify-center gap-1.5", className)} aria-label="Sahifalash">
      <Link
        href={buildHref(Math.max(1, page - 1))}
        aria-disabled={page === 1}
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full border border-brand-soft text-navy transition-colors hover:border-liderlar-blue",
          page === 1 && "pointer-events-none opacity-40"
        )}
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
      </Link>

      {pages.map((p, idx) => (
        <React.Fragment key={p}>
          {idx > 0 && pages[idx - 1] !== p - 1 && <span className="px-1 text-ink-soft">…</span>}
          <Link
            href={buildHref(p)}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-colors",
              p === page ? "bg-gradient-blue text-white" : "border border-brand-soft text-navy hover:border-liderlar-blue"
            )}
          >
            {p}
          </Link>
        </React.Fragment>
      ))}

      <Link
        href={buildHref(Math.min(totalPages, page + 1))}
        aria-disabled={page === totalPages}
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full border border-brand-soft text-navy transition-colors hover:border-liderlar-blue",
          page === totalPages && "pointer-events-none opacity-40"
        )}
      >
        <ChevronRight className="h-4 w-4" aria-hidden />
      </Link>
    </nav>
  );
}
