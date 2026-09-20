import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getMehrFlags } from "@/lib/mehr/flags";
import { loadTopVolunteers } from "@/lib/mehr/public-stats";
import { MEHR_COLORS } from "@/lib/mehr/brand";
import { RANKING_PERIOD_LABEL, type RankingPeriod } from "@/lib/mehr/public-types";
import { MehrClosed } from "@/components/mehr/mehr-closed";
import { MehrEmpty } from "@/components/mehr/mehr-empty";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Reyting — MEHR 365+",
  description: "Tasdiqlangan ball daftariga asoslangan volontyorlar reytingi.",
  alternates: { canonical: "/mehr365/reyting" },
};

const PERIODS: RankingPeriod[] = ["all", "year", "month"];

/**
 * Reyting.
 *
 * MANBA — O'ZGARMAS BALL DAFTARI (jamlanma orqali). Reyting
 * hech qachon mijozdan kelgan son yoki tasdiqlanmagan
 * faoliyat asosida hisoblanmaydi.
 *
 * Tartib serverda beriladi va sahifaga tayyor holda keladi:
 * minglab odamni brauzerda saralash mumkin emas.
 */
export default async function RankingPage({
  searchParams,
}: {
  searchParams: Promise<{ davr?: string }>;
}) {
  const flags = await getMehrFlags();
  if (!flags.publicEnabled) return <MehrClosed />;

  const params = await searchParams;
  const period = (PERIODS as string[]).includes(params.davr ?? "")
    ? (params.davr as RankingPeriod)
    : "all";

  const rows = await loadTopVolunteers(period, 100);

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <h1
        className="font-display text-3xl font-bold tracking-tight sm:text-4xl"
        style={{ color: MEHR_COLORS.ink }}
      >
        Reyting
      </h1>
      <p className="mt-2 max-w-xl text-sm sm:text-base" style={{ color: MEHR_COLORS.inkSoft }}>
        Faqat tasdiqlangan faoliyat hisobga olinadi.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {PERIODS.map((p) => (
          <Link
            key={p}
            href={p === "all" ? "/mehr365/reyting" : `/mehr365/reyting?davr=${p}`}
            aria-current={period === p ? "page" : undefined}
            className="rounded-full border px-4 py-2 text-sm font-semibold transition"
            style={{
              borderColor: period === p ? MEHR_COLORS.blue : MEHR_COLORS.border,
              color: period === p ? MEHR_COLORS.blue : MEHR_COLORS.inkSoft,
              background: period === p ? "rgba(28,143,232,0.08)" : "#fff",
            }}
          >
            {RANKING_PERIOD_LABEL[p]}
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <MehrEmpty
          title="Bu davr uchun reyting bo'sh"
          text="Tasdiqlangan faoliyat paydo bo'lgach, reyting avtomatik shakllanadi."
        />
      ) : (
        <div
          className="mt-8 overflow-hidden rounded-2xl border bg-white"
          style={{ borderColor: MEHR_COLORS.border }}
        >
          <table className="w-full text-left text-sm">
            <caption className="sr-only">MEHR 365+ volontyorlar reytingi</caption>
            <thead>
              <tr style={{ background: MEHR_COLORS.surfaceSoft, color: MEHR_COLORS.inkSoft }}>
                <th scope="col" className="w-16 px-4 py-3 text-xs font-bold uppercase tracking-wide">
                  O&apos;rin
                </th>
                <th scope="col" className="px-4 py-3 text-xs font-bold uppercase tracking-wide">
                  Volontyor
                </th>
                <th scope="col" className="hidden px-4 py-3 text-xs font-bold uppercase tracking-wide sm:table-cell">
                  Hudud
                </th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide">
                  Faoliyat
                </th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide">
                  Ball
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((v, i) => (
                <tr
                  key={v.profileId}
                  className="border-t"
                  style={{ borderColor: MEHR_COLORS.border }}
                >
                  <td className="px-4 py-3 font-bold tabular-nums" style={{ color: MEHR_COLORS.inkSoft }}>
                    {i + 1}
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2.5">
                      {v.avatarUrl ? (
                        <Image
                          src={v.avatarUrl}
                          alt=""
                          width={32}
                          height={32}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <span
                          aria-hidden
                          className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
                          style={{ background: MEHR_COLORS.blue }}
                        >
                          {(v.fullName ?? "?").charAt(0)}
                        </span>
                      )}
                      {v.candidateSlug ? (
                        <Link
                          href={`/liderlar/${v.candidateSlug}`}
                          className="font-semibold hover:underline"
                          style={{ color: MEHR_COLORS.ink }}
                        >
                          {v.fullName ?? "Noma'lum"}
                        </Link>
                      ) : (
                        <span className="font-semibold" style={{ color: MEHR_COLORS.ink }}>
                          {v.fullName ?? "Noma'lum"}
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell" style={{ color: MEHR_COLORS.inkSoft }}>
                    {v.regionName ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums" style={{ color: MEHR_COLORS.inkSoft }}>
                    {v.activityCount}
                  </td>
                  <td className="px-4 py-3 text-right font-bold tabular-nums" style={{ color: MEHR_COLORS.ink }}>
                    {v.points.toLocaleString("uz-UZ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
