import Image from "next/image";
import Link from "next/link";
import type { CandidateCardData } from "@/lib/types";
import { VerifiedBadge } from "@/components/ui/badge";
import { gradientFor } from "@/lib/utils";

export function FeaturedLeaderCard({ candidate, className }: { candidate: CandidateCardData; className?: string }) {
  const name = candidate.full_name;
  const gradient = gradientFor(candidate.slug);

  return (
    <Link
      href={`/liderlar/${candidate.slug}`}
      className={`group relative block h-full min-h-[24rem] overflow-hidden rounded-2xl shadow-card transition-all duration-200 hover:-translate-y-1.5 hover:shadow-card-hover ${className ?? ""}`}
    >
      {candidate.avatar_url ? (
        <Image
          src={candidate.avatar_url}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, 480px"
          className="object-cover object-top transition-transform duration-300 group-hover:scale-[1.04]"
        />
      ) : (
        <div className={`h-full w-full ${gradient}`} />
      )}
      <div className="absolute inset-0 bg-gradient-portrait" />
      <div className="absolute left-4 top-4">
        <span className="rounded-full bg-white/90 px-3 py-1 font-display text-xs font-bold uppercase tracking-wide text-navy">
          Tavsiya etilgan
        </span>
      </div>
      <div className="absolute inset-x-0 bottom-0 p-6 text-white">
        <div className="mb-2 flex items-center gap-2">
          {candidate.is_verified && <VerifiedBadge />}
        </div>
        <p className="font-display text-2xl font-bold leading-tight sm:text-3xl">{name}</p>
        {candidate.short_bio && <p className="mt-1 text-sm text-white/85">{candidate.short_bio}</p>}
        {candidate.region && <p className="mt-0.5 text-xs text-white/70">{candidate.region.name}</p>}
      </div>
    </Link>
  );
}
