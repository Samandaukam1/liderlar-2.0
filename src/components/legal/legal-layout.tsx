import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

export function LegalLayout({
  title,
  updatedAt,
  children,
}: {
  title: string;
  updatedAt: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ label: title }]} />
      <h1 className="mt-4 font-display text-3xl font-bold text-navy sm:text-4xl">{title}</h1>
      <p className="mt-2 text-sm text-ink-soft">Oxirgi yangilanish: {updatedAt}</p>
      <div className="prose-article mt-8 space-y-6 text-[0.98rem] leading-[1.75] text-ink-soft [&_h2]:mb-2 [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-navy [&_ol]:list-decimal [&_ol]:space-y-1.5 [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
        {children}
      </div>
    </div>
  );
}
