import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items, tone = "dark" }: { items: Crumb[]; tone?: "dark" | "light" }) {
  const light = tone === "light";
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center gap-1.5 text-sm", light ? "text-white/55" : "text-ink-soft")}
    >
      <Link href="/" className={cn("flex items-center", light ? "hover:text-white" : "hover:text-liderlar-blue")}>
        <Home className="h-3.5 w-3.5" aria-hidden />
      </Link>
      {items.map((item, idx) => (
        <span key={idx} className="flex items-center gap-1.5">
          <ChevronRight className={cn("h-3.5 w-3.5", light ? "text-white/30" : "text-ink-soft/50")} aria-hidden />
          {item.href ? (
            <Link href={item.href} className={light ? "hover:text-white" : "hover:text-liderlar-blue"}>
              {item.label}
            </Link>
          ) : (
            <span className={cn("truncate font-medium", light ? "text-white/85" : "text-navy")}>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
