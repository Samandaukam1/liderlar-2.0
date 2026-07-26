import Image from "next/image";
import Link from "next/link";
import type { QuoteCardData } from "@/lib/types";

const GRADIENTS: Record<string, string> = {
  blue: "bg-gradient-blue",
  peach: "bg-gradient-peach",
  violet: "bg-gradient-violet",
  mint: "bg-gradient-mint",
  coral: "bg-gradient-coral",
};

export function LeaderQuoteCard({ quote }: { quote: QuoteCardData }) {
  const name = quote.candidate?.full_name ?? quote.author_name ?? "Liderlar.uz";
  const gradient = GRADIENTS[quote.accent ?? ""] ?? "bg-gradient-blue";

  const content = (
    <>
      <span
        aria-hidden
        className="font-display-alt text-7xl leading-none text-white/35 transition-transform duration-200 group-hover:scale-110"
      >
        &ldquo;
      </span>

      <p className="font-display text-xl font-semibold leading-snug">{quote.text}</p>

      <div className="mt-6 flex items-center gap-3 border-t border-white/25 pt-4">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-white/60 bg-white/20">
          {quote.candidate?.avatar_url && (
            <Image src={quote.candidate.avatar_url} alt={name} fill sizes="48px" className="object-cover" />
          )}
        </div>
        <div>
          <p className="font-display text-sm font-bold">{name}</p>
          {quote.candidate?.short_bio && <p className="text-xs text-white/80">{quote.candidate.short_bio}</p>}
        </div>
      </div>
    </>
  );

  const className = `group relative flex min-h-[22rem] flex-col justify-between overflow-hidden rounded-xl p-6 text-white shadow-card transition-all duration-200 hover:-translate-y-1.5 hover:shadow-card-hover ${gradient}`;
  return quote.candidate ? (
    <Link href={`/liderlar/${quote.candidate.slug}`} className={className}>
      {content}
    </Link>
  ) : (
    <article className={className}>{content}</article>
  );
}
