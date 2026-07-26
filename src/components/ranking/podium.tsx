import Image from "next/image";
import Link from "next/link";
import { Trophy } from "lucide-react";
import type { RankingRow } from "@/lib/types";
import { VerifiedBadge } from "@/components/ui/badge";
import { gradientFor } from "@/lib/utils";

const ORDER = [1, 0, 2]; // visual order: 2nd, 1st, 3rd
const HEIGHTS = ["h-40 sm:h-48", "h-56 sm:h-64", "h-32 sm:h-40"];

export function Podium({ rows }: { rows: RankingRow[] }) {
  const top3 = rows.slice(0, 3);
  if (top3.length === 0) return null;

  return (
    <div className="grid grid-cols-3 items-end gap-3 sm:gap-6">
      {ORDER.map((idx, col) => {
        const row = top3[idx];
        if (!row) return <div key={col} />;
        const name = row.candidate.full_name;
        const gradient = gradientFor(row.candidate.slug);
        const isFirst = idx === 0;

        return (
          <Link
            key={row.candidate_id}
            href={`/liderlar/${row.candidate.slug}`}
            className="group flex flex-col items-center"
          >
            <div className="relative mb-3">
              {isFirst && (
                <Trophy
                  className="absolute -top-8 left-1/2 h-6 w-6 -translate-x-1/2 text-electric-blue"
                  aria-hidden
                />
              )}
              <div
                className={`relative h-20 w-20 overflow-hidden rounded-full border-4 border-white shadow-card-hover transition-transform group-hover:scale-105 sm:h-24 sm:w-24 ${gradient}`}
              >
                {row.candidate.avatar_url && (
                  <Image src={row.candidate.avatar_url} alt={name} fill sizes="96px" className="object-cover" />
                )}
              </div>
              <span
                className={`absolute -bottom-2 left-1/2 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full font-display text-sm font-bold text-white shadow ${
                  isFirst ? "bg-gradient-blue h-9 w-9 text-base" : "bg-navy/70"
                }`}
              >
                {idx + 1}
              </span>
            </div>
            <p className="mt-2 max-w-[7rem] truncate text-center text-sm font-bold text-navy sm:max-w-[9rem] sm:text-base">
              {name}
            </p>
            {row.candidate.is_verified && <VerifiedBadge className="mt-1" />}
            <p className="mt-1 font-display text-lg font-bold text-liderlar-blue">{row.total_score.toFixed(1)}</p>
            <div
              className={`mt-3 w-full rounded-t-xl bg-gradient-blue ${HEIGHTS[col]} ${isFirst ? "" : "opacity-80"}`}
            />
          </Link>
        );
      })}
    </div>
  );
}
