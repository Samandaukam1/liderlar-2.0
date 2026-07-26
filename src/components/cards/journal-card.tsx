import Image from "next/image";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import type { JournalCardData } from "@/lib/types";
import { formatDateUz, gradientFor } from "@/lib/utils";

export function JournalCard({ journal, featured = false }: { journal: JournalCardData; featured?: boolean }) {
  const gradient = gradientFor(journal.slug);

  return (
    <Link
      href={`/jurnal/${journal.slug}`}
      className={`group relative block overflow-hidden rounded-2xl border border-brand-soft bg-paper shadow-card transition-all duration-300 hover:-translate-y-2 hover:shadow-card-hover hover:[transform:perspective(900px)_rotateY(-2deg)_translateY(-6px)] ${
        featured ? "aspect-[3/2]" : "aspect-[3/4]"
      }`}
    >
      {journal.cover_url ? (
        <Image
          src={journal.cover_url}
          alt={journal.title}
          fill
          sizes={featured ? "(max-width: 768px) 100vw, 640px" : "(max-width: 640px) 45vw, 220px"}
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      ) : (
        <div className={`flex h-full w-full items-center justify-center ${gradient}`}>
          <BookOpen className="h-10 w-10 text-white/80" aria-hidden />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/10 to-transparent" />
      <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 font-display text-xs font-bold text-navy">
        #{journal.issue_number}
      </span>
      <div className="absolute inset-x-0 bottom-0 p-4 text-white">
        <p className="font-display text-xl font-semibold leading-none">{journal.title}</p>
        {journal.published_at && <p className="mt-0.5 text-[0.7rem] text-white/70">{formatDateUz(journal.published_at)}</p>}
      </div>
    </Link>
  );
}
