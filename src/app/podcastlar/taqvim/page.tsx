import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight, List } from "lucide-react";
import { addMonths, subMonths, startOfMonth, endOfMonth, format, parse } from "date-fns";
import { getPodcastsInRange } from "@/lib/data/podcasts";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { MonthCalendar } from "@/components/podcasts/month-calendar";
import { LinkButton } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Podcastlar taqvimi",
  description: "Liderlar.uz podcastlari taqvimi — oy bo'yicha rejalashtirilgan chiqishlar.",
};

const MONTHS_UZ = [
  "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
  "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr",
];

export default async function PodcastCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ oy?: string }>;
}) {
  const { oy } = await searchParams;
  const monthDate = oy ? parse(oy, "yyyy-MM", new Date()) : new Date();
  const validMonth = Number.isNaN(monthDate.getTime()) ? new Date() : monthDate;

  const podcasts = await getPodcastsInRange(startOfMonth(validMonth), endOfMonth(validMonth)).catch(() => []);

  const prevHref = `/podcastlar/taqvim?oy=${format(subMonths(validMonth, 1), "yyyy-MM")}`;
  const nextHref = `/podcastlar/taqvim?oy=${format(addMonths(validMonth, 1), "yyyy-MM")}`;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Breadcrumbs items={[{ label: "Podcastlar", href: "/podcastlar" }, { label: "Taqvim" }]} />
          <h1 className="mt-4 font-display text-3xl font-bold text-navy sm:text-4xl">Podcastlar taqvimi</h1>
        </div>
        <LinkButton href="/podcastlar" variant="secondary">
          <List className="h-4 w-4" aria-hidden />
          Ro&apos;yxat ko&apos;rinishi
        </LinkButton>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <Link href={prevHref} className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-soft hover:border-liderlar-blue">
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </Link>
        <h2 className="font-display text-xl font-bold text-navy">
          {MONTHS_UZ[validMonth.getMonth()]} {validMonth.getFullYear()}
        </h2>
        <Link href={nextHref} className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-soft hover:border-liderlar-blue">
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>

      <div className="mt-6">
        <MonthCalendar monthDate={validMonth} podcasts={podcasts} />
      </div>
    </div>
  );
}
