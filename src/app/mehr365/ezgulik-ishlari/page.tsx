import type { Metadata } from "next";
import Link from "next/link";
import { getMehrFlags } from "@/lib/mehr/flags";
import { loadApprovedActivitiesPage } from "@/lib/mehr/public-stats";
import { MEHR_COLORS } from "@/lib/mehr/brand";
import { MehrClosed } from "@/components/mehr/mehr-closed";
import { ActivityCard } from "@/components/mehr/activity-card";
import { MehrEmpty } from "@/components/mehr/mehr-empty";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ezgulik ishlari — MEHR 365+",
  description: "Tekshiruvdan o'tgan va tasdiqlangan ezgulik ishlari arxivi.",
  alternates: { canonical: "/mehr365/ezgulik-ishlari" },
};

const PER_PAGE = 12;

/**
 * Tasdiqlangan ezgulik ishlari arxivi.
 *
 * FAQAT 'approved'. Qoralama, tekshiruvdagi va rad etilgan
 * ishlar bu yerga umuman kelmaydi — shart ma'lumot
 * qatlamining so'rovida turadi, UI filtrida emas. Filtrni
 * chetlab o'tish mumkin, so'rov shartini esa yo'q.
 */
export default async function ActivitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ sahifa?: string }>;
}) {
  const flags = await getMehrFlags();
  if (!flags.publicEnabled) return <MehrClosed />;

  const params = await searchParams;
  const page = Math.max(Number(params.sahifa ?? 1) || 1, 1);

  const { items, total } = await loadApprovedActivitiesPage({ page, perPage: PER_PAGE });
  const pages = Math.max(Math.ceil(total / PER_PAGE), 1);

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <h1
        className="font-display text-3xl font-bold tracking-tight sm:text-4xl"
        style={{ color: MEHR_COLORS.ink }}
      >
        Ezgulik ishlari
      </h1>
      <p className="mt-2 max-w-xl text-sm sm:text-base" style={{ color: MEHR_COLORS.inkSoft }}>
        Bu yerda faqat tekshiruvdan o&apos;tgan ishlar ko&apos;rinadi.
        {total > 0 ? ` Jami ${total.toLocaleString("uz-UZ")} ta.` : ""}
      </p>

      {items.length === 0 ? (
        <MehrEmpty
          title="Hozircha tasdiqlangan ezgulik ishi yo'q"
          text="Birinchi ishlar tekshiruvdan o'tgach shu yerda paydo bo'ladi."
        />
      ) : (
        <>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((a) => (
              <ActivityCard key={a.id} activity={a} />
            ))}
          </div>

          {/*
            Sahifalash — server tomonda.

            Minglab yozuvni brauzerga yuborib, u yerda kesish
            mumkin emas: sahifa og'irlashadi va telefonda
            umuman ochilmay qoladi.
          */}
          {pages > 1 && (
            <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Sahifalar">
              {page > 1 && (
                <Link
                  href={`/mehr365/ezgulik-ishlari?sahifa=${page - 1}`}
                  rel="prev"
                  className="rounded-full border px-4 py-2 text-sm font-semibold"
                  style={{ borderColor: MEHR_COLORS.border, color: MEHR_COLORS.ink }}
                >
                  ← Oldingi
                </Link>
              )}

              <span className="px-3 text-sm tabular-nums" style={{ color: MEHR_COLORS.inkSoft }}>
                {page} / {pages}
              </span>

              {page < pages && (
                <Link
                  href={`/mehr365/ezgulik-ishlari?sahifa=${page + 1}`}
                  rel="next"
                  className="rounded-full border px-4 py-2 text-sm font-semibold"
                  style={{ borderColor: MEHR_COLORS.border, color: MEHR_COLORS.ink }}
                >
                  Keyingi →
                </Link>
              )}
            </nav>
          )}
        </>
      )}
    </div>
  );
}
