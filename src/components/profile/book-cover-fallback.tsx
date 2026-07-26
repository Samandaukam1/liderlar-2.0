import { BookOpen } from "lucide-react";

/**
 * Shown when a book has no `coverUrl` or the remote image fails to load, so a
 * broken cover can never collapse the row. Deliberately typographic: the real
 * title and author carry the card instead of a generic placeholder graphic.
 */
export function BookCoverFallback({
  title,
  authorName,
}: {
  title: string;
  authorName: string | null;
}) {
  return (
    <div
      aria-hidden
      className="relative flex h-full w-full flex-col justify-between overflow-hidden bg-gradient-to-br from-[#082f4d] via-[#0b6682] to-[#1aa9cd] px-4 pb-4 pt-6"
    >
      <span className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full border border-white/20" />
      <span className="pointer-events-none absolute -bottom-14 -left-8 h-36 w-36 rounded-full border-[14px] border-white/8" />

      <div className="relative">
        <BookOpen className="h-6 w-6 text-white/85" />
        <p className="mt-3 line-clamp-4 font-display text-[0.98rem] font-bold leading-[1.12] text-white">
          {title}
        </p>
        {authorName && (
          <p className="mt-1.5 line-clamp-2 text-[0.62rem] font-semibold leading-snug text-white/65">
            {authorName}
          </p>
        )}
      </div>

      <span className="relative text-[0.55rem] font-bold uppercase tracking-[0.24em] text-white/60">
        AdabiyotX
      </span>
    </div>
  );
}
