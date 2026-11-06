import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

/** "Loyiha haqida" va oferta uchun umumiy to'q sarlavha bloki. */
export function DocumentHero({
  crumb,
  eyebrow,
  title,
  lead,
  aside,
  children,
}: {
  crumb: string;
  eyebrow: string;
  title: string;
  lead: ReactNode;
  aside?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-navy-dark text-white">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-56 -top-64 h-[38rem] w-[38rem] rounded-full bg-electric-blue/45 blur-[140px]" />
        <div className="absolute -right-40 top-1/3 h-[30rem] w-[30rem] rounded-full bg-violet/30 blur-[140px]" />
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-14 pt-6 sm:px-6 lg:pb-20">
        <Breadcrumbs tone="light" items={[{ label: crumb }]} />

        <div
          className={
            aside
              ? "mt-10 grid gap-10 lg:mt-14 lg:grid-cols-[minmax(0,1fr)_23rem] lg:items-end lg:gap-14"
              : "mt-10 max-w-3xl lg:mt-14"
          }
        >
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-light">{eyebrow}</p>
            <h1 className="mt-4 font-display text-[2.6rem] font-semibold leading-[1.04] sm:text-6xl">{title}</h1>
            <div className="mt-5 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">{lead}</div>
            {children}
          </div>
          {aside}
        </div>
      </div>
    </section>
  );
}
