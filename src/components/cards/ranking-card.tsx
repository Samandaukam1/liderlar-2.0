import Image from "next/image";
import Link from "next/link";
import type { RankingRow } from "@/lib/types";
import { RankingBadge, RankDeltaBadge, VerifiedBadge } from "@/components/ui/badge";
import { rankDelta, gradientFor } from "@/lib/utils";

export function RankingCard({ row }: { row: RankingRow }) {
  const name = row.candidate.full_name;
  const gradient = gradientFor(row.candidate.slug);
  const delta = rankDelta(row.position, row.previous_position);

  return (
    <Link
      href={`/liderlar/${row.candidate.slug}`}
      className="group flex items-center gap-4 rounded-2xl border border-brand-soft bg-paper p-3.5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-liderlar-blue/35 hover:shadow-card-hover sm:p-4"
    >
      <RankingBadge position={row.position ?? 0} />

      <div className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-full ${gradient}`}>
        {row.candidate.avatar_url && (
          <Image src={row.candidate.avatar_url} alt={name} fill sizes="56px" className="object-cover" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate font-display text-base font-bold text-navy">{name}</p>
          {row.candidate.is_verified && <VerifiedBadge className="hidden sm:inline-flex" />}
        </div>
        <p className="truncate text-xs text-ink-soft">
          {row.candidate.short_bio ?? "Faoliyat ko'rsatilmagan"}
          {row.candidate.region && ` · ${row.candidate.region.name}`}
        </p>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className="font-display text-lg font-bold text-navy">{row.total_score.toFixed(1)}</span>
        <RankDeltaBadge delta={delta} />
      </div>
    </Link>
  );
}
