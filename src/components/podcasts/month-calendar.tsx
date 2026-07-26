import Link from "next/link";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  format,
} from "date-fns";
import type { PodcastCardData } from "@/lib/types";
import { gradientFor } from "@/lib/utils";

const WEEKDAYS_UZ = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"];

export function MonthCalendar({ monthDate, podcasts }: { monthDate: Date; podcasts: PodcastCardData[] }) {
  const start = startOfWeek(startOfMonth(monthDate), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(monthDate), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start, end });

  const byDay = new Map<string, PodcastCardData[]>();
  for (const p of podcasts) {
    if (!p.starts_at) continue;
    const key = format(new Date(p.starts_at), "yyyy-MM-dd");
    byDay.set(key, [...(byDay.get(key) ?? []), p]);
  }

  return (
    <div className="overflow-hidden rounded-xl border border-brand-soft bg-paper shadow-card">
      <div className="grid grid-cols-7 border-b border-brand-soft bg-liderlar-blue/5">
        {WEEKDAYS_UZ.map((w) => (
          <div key={w} className="p-2 text-center text-xs font-semibold uppercase tracking-wide text-liderlar-blue">
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const events = byDay.get(key) ?? [];
          const inMonth = isSameMonth(day, monthDate);
          return (
            <div
              key={key}
              className={`min-h-[6.5rem] border-b border-r border-brand-soft/70 p-2 transition-colors last:border-r-0 hover:bg-liderlar-blue/5 ${
                inMonth ? "" : "bg-navy/[0.02] text-ink-soft/50"
              }`}
            >
              <span
                className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                  isSameDay(day, new Date()) || isToday(day) ? "bg-gradient-blue text-white" : "text-ink-soft"
                }`}
              >
                {format(day, "d")}
              </span>
              <div className="mt-1.5 space-y-1">
                {events.slice(0, 2).map((e) => (
                  <Link
                    key={e.id}
                    href={`/podcastlar/${e.slug}`}
                    className={`block truncate rounded-sm px-1.5 py-0.5 text-[0.65rem] font-semibold text-white transition-transform hover:scale-[1.03] ${gradientFor(
                      e.slug
                    )}`}
                    title={e.title}
                  >
                    {e.title}
                  </Link>
                ))}
                {events.length > 2 && (
                  <span className="block text-[0.65rem] font-semibold text-liderlar-blue">
                    +{events.length - 2} ko&apos;proq
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
