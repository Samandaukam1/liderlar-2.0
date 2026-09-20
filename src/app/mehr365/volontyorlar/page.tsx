import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getMehrFlags } from "@/lib/mehr/flags";
import { loadTopVolunteers } from "@/lib/mehr/public-stats";
import { MEHR_COLORS } from "@/lib/mehr/brand";
import { MehrClosed } from "@/components/mehr/mehr-closed";
import { MehrEmpty } from "@/components/mehr/mehr-empty";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Volontyorlar — MEHR 365+",
  description: "Tasdiqlangan ezgulik faoliyati bo'lgan volontyorlar.",
  alternates: { canonical: "/mehr365/volontyorlar" },
};

/**
 * Volontyorlar.
 *
 * VOLONTYOR KIM? — tasdiqlangan MEHR faoliyati bo'lgan odam.
 *
 * Bu ta'rif ataylab tor. Barcha ~2000 nomzodni "volontyor"
 * deb atash oson edi, lekin bu yolg'on bo'lardi: ularning
 * ko'pchiligi hali birorta ezgulik ishida qatnashmagan.
 * Ball daftarida yozuvi bor odamgina bu yerda ko'rinadi.
 */
export default async function VolunteersPage() {
  const flags = await getMehrFlags();
  if (!flags.publicEnabled) return <MehrClosed />;

  const volunteers = await loadTopVolunteers("all", 60);

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <h1
        className="font-display text-3xl font-bold tracking-tight sm:text-4xl"
        style={{ color: MEHR_COLORS.ink }}
      >
        Volontyorlar
      </h1>
      <p className="mt-2 max-w-xl text-sm sm:text-base" style={{ color: MEHR_COLORS.inkSoft }}>
        Tasdiqlangan ezgulik faoliyati bo&apos;lgan odamlar. Ro&apos;yxat ball daftaridan
        shakllanadi — tasdiqlanmagan faoliyat hisobga olinmaydi.
      </p>

      {volunteers.length === 0 ? (
        <MehrEmpty
          title="Hozircha volontyorlar ro'yxati bo'sh"
          text="Birinchi ezgulik ishi tasdiqlangach, ishtirokchilar shu yerda paydo bo'ladi."
          action={{ href: "/mehr365/ezgulik-ishlari", label: "Ezgulik ishlari" }}
        />
      ) : (
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {volunteers.map((v, index) => {
            const card = (
              <>
                <div className="flex items-center gap-3">
                  {v.avatarUrl ? (
                    <Image
                      src={v.avatarUrl}
                      alt=""
                      width={52}
                      height={52}
                      className="h-13 w-13 rounded-full object-cover"
                      style={{ width: 52, height: 52 }}
                    />
                  ) : (
                    <span
                      aria-hidden
                      className="flex items-center justify-center rounded-full text-lg font-bold text-white"
                      style={{ width: 52, height: 52, background: MEHR_COLORS.blue }}
                    >
                      {(v.fullName ?? "?").charAt(0)}
                    </span>
                  )}

                  <div className="min-w-0">
                    <p className="truncate font-display text-base font-bold" style={{ color: MEHR_COLORS.ink }}>
                      {v.fullName ?? "Noma'lum"}
                    </p>
                    {v.regionName && (
                      <p className="truncate text-xs" style={{ color: MEHR_COLORS.inkSoft }}>
                        {v.regionName}
                      </p>
                    )}
                  </div>

                  <span
                    className="ml-auto shrink-0 rounded-full px-2.5 py-1 text-xs font-bold"
                    style={{ background: "rgba(28,143,232,0.10)", color: MEHR_COLORS.blue }}
                  >
                    #{index + 1}
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-4 text-sm">
                  <span>
                    <strong style={{ color: MEHR_COLORS.ink }}>{v.points.toLocaleString("uz-UZ")}</strong>{" "}
                    <span style={{ color: MEHR_COLORS.inkSoft }}>ball</span>
                  </span>
                  <span style={{ color: MEHR_COLORS.inkSoft }}>
                    {v.activityCount} ta faoliyat
                  </span>
                </div>
              </>
            );

            /*
             * Ensiklopediya profili BO'LSA havola beriladi.
             * Yangi biografiya sahifasi YARATILMAYDI — u mavjud
             * profilning dublikati bo'lardi.
             */
            return (
              <li key={v.profileId}>
                {v.candidateSlug ? (
                  <Link
                    href={`/liderlar/${v.candidateSlug}`}
                    className="block rounded-2xl border bg-white p-5 transition hover:shadow-md"
                    style={{ borderColor: MEHR_COLORS.border }}
                  >
                    {card}
                  </Link>
                ) : (
                  <div
                    className="rounded-2xl border bg-white p-5"
                    style={{ borderColor: MEHR_COLORS.border }}
                  >
                    {card}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
