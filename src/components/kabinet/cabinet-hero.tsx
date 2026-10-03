import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Crown, ExternalLink, Trophy } from "lucide-react";
import type { CabinetData } from "@/lib/kabinet/cabinet-data";

const fmt = new Intl.NumberFormat("uz-UZ", { maximumFractionDigits: 2 });

const STATUS_TEXT: Record<string, string> = {
  published: "Chop etilgan",
  draft: "Tayyorlanmoqda",
  pending: "Tekshiruvda",
  archived: "Arxivda",
};

/**
 * KABINET YUQORISI — SHAXS.
 *
 * Portret, ism, ommaviy profil, holat, VIP va reyting o'rni bir qarashda.
 */
export function CabinetHero({ data }: { data: CabinetData }) {
  const { candidate, profile, ranking, vip } = data;
  const name = candidate?.fullName ?? profile.fullName ?? "Foydalanuvchi";
  const vipActive = vip.status === "active";

  return (
    <section className="relative overflow-hidden rounded-3xl bg-navy p-5 text-white shadow-card sm:p-7">
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-liderlar-blue/25 blur-3xl" aria-hidden />
      <div className="relative flex items-center gap-4 sm:gap-5">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-white/10 ring-2 ring-white/20 sm:h-24 sm:w-24">
          {candidate?.avatarUrl ? (
            <Image src={candidate.avatarUrl} alt="" fill sizes="96px" priority className="object-cover object-top" />
          ) : (
            <span className="flex h-full w-full items-center justify-center font-display text-3xl font-bold" aria-hidden>
              {name.charAt(0)}
            </span>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-liderlar-blue">Shaxsiy kabinet</p>
          <h1 className="mt-1 font-display text-2xl font-bold leading-tight sm:text-3xl">{name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            {candidate && (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1">
                <BadgeCheck className="h-3.5 w-3.5 text-liderlar-blue" aria-hidden />
                {STATUS_TEXT[candidate.status] ?? candidate.status}
              </span>
            )}
            {vipActive && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 px-2.5 py-1 font-semibold text-amber-200">
                <Crown className="h-3.5 w-3.5" aria-hidden />
                VIP
              </span>
            )}
            {candidate?.region && <span className="text-white/70">{candidate.region}</span>}
          </div>
        </div>
      </div>

      <div className="relative mt-5 grid grid-cols-2 gap-2 sm:max-w-md">
        <div className="rounded-2xl bg-white/10 px-4 py-3">
          <p className="flex items-center gap-1 text-[0.68rem] uppercase tracking-wide text-white/70">
            <Trophy className="h-3.5 w-3.5" aria-hidden />
            Reyting
          </p>
          <p className="mt-1 font-display text-xl font-bold">
            {ranking?.position && ranking.totalScore > 0 ? `${fmt.format(ranking.position)}-o‘rin` : "—"}
          </p>
          {ranking && ranking.totalScore <= 0 && <p className="text-[0.68rem] text-white/60">hali shakllanmagan</p>}
        </div>
        <div className="rounded-2xl bg-white/10 px-4 py-3">
          <p className="text-[0.68rem] uppercase tracking-wide text-white/70">Umumiy ball</p>
          <p className="mt-1 font-display text-xl font-bold">{ranking ? fmt.format(ranking.totalScore) : "—"}</p>
        </div>
      </div>

      {candidate?.status === "published" && (
        <Link
          href={`/liderlar/${candidate.slug}`}
          className="relative mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-navy transition hover:bg-liderlar-blue hover:text-white"
        >
          Ommaviy profilni ko‘rish
          <ExternalLink className="h-4 w-4" aria-hidden />
        </Link>
      )}
    </section>
  );
}
