import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import type { CandidateCardData } from "@/lib/types";
import { VerifiedBadge } from "@/components/ui/badge";
import { gradientFor, initialsFromName } from "@/lib/utils";

export function LeaderCard({ candidate, rank }: { candidate: CandidateCardData; rank?: number }) {
  const name = candidate.full_name;
  const gradient = gradientFor(candidate.slug);

  return (
    <Link
      href={`/liderlar/${candidate.slug}`}
      className="group block overflow-hidden rounded-2xl border border-brand-soft bg-paper shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:border-liderlar-blue/35 hover:shadow-card-hover"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-navy/5">
        {candidate.avatar_url ? (
          <Image
            src={candidate.avatar_url}
            alt={name}
            fill
            sizes="(max-width: 640px) 50vw, 280px"
            className="object-cover object-top transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className={`flex h-full w-full items-center justify-center font-display-alt text-5xl text-white/90 ${gradient}`}>
            {initialsFromName(candidate.full_name)}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-portrait" />
        {rank && (
          <span className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 font-display text-sm font-bold text-navy shadow">
            {rank}
          </span>
        )}
        {candidate.is_verified && (
          <span className="absolute right-3 top-3">
            <VerifiedBadge />
          </span>
        )}
        <div className="absolute inset-x-0 bottom-0 p-4 text-white">
          <p className="font-display text-xl font-semibold leading-none">{name}</p>
          {candidate.short_bio && <p className="mt-0.5 truncate text-xs text-white/80">{candidate.short_bio}</p>}
        </div>
      </div>
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-xs font-medium text-ink-soft">{candidate.region?.name ?? "Hudud ko'rsatilmagan"}</span>
        <span className="inline-flex items-center gap-1 text-xs font-bold text-liderlar-blue">
          <Star className="h-3.5 w-3.5 fill-current" aria-hidden />
          {candidate.total_score.toFixed(0)}
        </span>
      </div>
    </Link>
  );
}
