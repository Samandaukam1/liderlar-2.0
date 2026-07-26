import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-ink-soft">
      <Link href="/" className="flex items-center hover:text-liderlar-blue">
        <Home className="h-3.5 w-3.5" aria-hidden />
      </Link>
      {items.map((item, idx) => (
        <span key={idx} className="flex items-center gap-1.5">
          <ChevronRight className="h-3.5 w-3.5 text-ink-soft/50" aria-hidden />
          {item.href ? (
            <Link href={item.href} className="hover:text-liderlar-blue">
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-navy">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
