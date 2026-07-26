import type { Metadata } from "next";
import Link from "next/link";
import { Compass, ArrowRight } from "lucide-react";
import { getDirectionsWithCounts } from "@/lib/data/reference";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { EmptyState } from "@/components/ui/empty-state";
import { gradientFor, formatNumber } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Faoliyat yo'nalishlari",
  description: "Liderlar.uz platformasidagi yosh liderlarning faoliyat yo'nalishlari bo'yicha bo'limlar.",
};

export default async function DirectionsPage() {
  const directions = await getDirectionsWithCounts().catch(() => []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ label: "Yo'nalishlar" }]} />
      <h1 className="mt-4 font-display text-3xl font-bold text-navy sm:text-4xl">Faoliyat yo&apos;nalishlari</h1>
      <p className="mt-2 max-w-2xl text-ink-soft">
        Yosh liderlar faoliyat ko&apos;rsatayotgan sohalar bo&apos;yicha bo&apos;limlar. Har bir yo&apos;nalishni tanlab, o&apos;sha
        sohadagi barcha tasdiqlangan liderlarni ko&apos;rishingiz mumkin.
      </p>

      {directions.length === 0 ? (
        <EmptyState className="mt-10" title="Hozircha yo'nalishlar qo'shilmagan" />
      ) : (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {directions.map((d) => (
            <Link
              key={d.id}
              href={`/liderlar?yonalish=${d.slug}`}
              className="group flex flex-col justify-between rounded-xl border border-brand-soft bg-paper p-6 shadow-card transition-all hover:-translate-y-1 hover:shadow-card-hover"
            >
              <div>
                <span className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-md text-white ${gradientFor(d.slug)}`}>
                  <Compass className="h-5 w-5" aria-hidden />
                </span>
                <h2 className="font-display text-lg font-bold text-navy">{d.name}</h2>
              </div>
              <div className="mt-5 flex items-center justify-between text-sm">
                <span className="font-semibold text-liderlar-blue">{formatNumber(d.candidateCount)} lider</span>
                <ArrowRight className="h-4 w-4 text-liderlar-blue transition-transform group-hover:translate-x-1" aria-hidden />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
