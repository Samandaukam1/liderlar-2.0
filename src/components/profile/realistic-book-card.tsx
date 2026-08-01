"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, Star } from "lucide-react";
import type { PublicCandidateAdabiyotXItem } from "@/lib/types";
import { adabiyotXBookHref, isSafeHttpUrl } from "@/lib/adabiyotx";
import { BookCoverFallback } from "@/components/profile/book-cover-fallback";

export interface RealisticBookCardProps {
  book: PublicCandidateAdabiyotXItem;
  priority?: boolean;
}

const MAX_TILT_DEG = 4;

function BookBody({
  book,
  priority,
}: {
  book: PublicCandidateAdabiyotXItem;
  priority: boolean;
}) {
  const [coverFailed, setCoverFailed] = useState(false);
  const coverUrl = isSafeHttpUrl(book.coverUrl) ? book.coverUrl : null;
  const { isFree, rating, category } = book.metadata;
  const book3dRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const node = book3dRef.current;
    if (!node || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = node.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 .. 0.5
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    node.style.setProperty("--book-tilt-y", `${(nx * MAX_TILT_DEG).toFixed(2)}deg`);
    node.style.setProperty("--book-tilt-x", `${(-ny * MAX_TILT_DEG).toFixed(2)}deg`);
    node.style.setProperty("--book-shadow-x", `${(nx * 10).toFixed(1)}px`);
  };

  const handlePointerLeave = () => {
    const node = book3dRef.current;
    if (!node) return;
    node.style.setProperty("--book-tilt-y", "0deg");
    node.style.setProperty("--book-tilt-x", "0deg");
    node.style.setProperty("--book-shadow-x", "0px");
  };

  return (
    <>
      <div
        ref={book3dRef}
        className="book3d"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        <span aria-hidden className="book3d-shadow" />
        <div className="book3d-shell">
          <span aria-hidden className="book3d-pages" />
          <div className="book3d-cover">
            {coverUrl && !coverFailed ? (
              // The AdabiyotX cover host is not fixed, so a native image avoids
              // opening Next/Image remotePatterns to arbitrary domains — and a
              // failing host falls back instead of rendering a broken box.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coverUrl}
                alt={`${book.title} kitobi muqovasi`}
                width={420}
                height={630}
                loading={priority ? "eager" : "lazy"}
                fetchPriority={priority ? "high" : "auto"}
                decoding="async"
                className="h-full w-full object-cover"
                onError={() => setCoverFailed(true)}
              />
            ) : (
              <BookCoverFallback
                title={book.title}
                authorName={book.authorName}
              />
            )}

            <span aria-hidden className="book3d-spine" />
            <span aria-hidden className="book3d-sheen" />

            <div className="absolute inset-x-0 top-0 z-[3] flex flex-wrap items-start justify-between gap-1 p-2 pl-3.5">
              <span className="rounded-full border border-white/25 bg-navy-dark/70 px-2 py-0.5 text-[0.55rem] font-bold uppercase tracking-[0.14em] text-white backdrop-blur-sm">
                Kitob
              </span>
              {isFree === true && (
                <span className="rounded-full bg-liderlar-blue px-2 py-0.5 text-[0.55rem] font-bold uppercase tracking-[0.14em] text-navy-dark">
                  Bepul
                </span>
              )}
            </div>

            {(typeof rating === "number" || category) && (
              <div className="absolute inset-x-0 bottom-0 z-[3] flex flex-wrap items-end justify-between gap-1 bg-gradient-to-t from-navy-dark/75 to-transparent p-2 pl-3.5 pt-6">
                {category ? (
                  <span className="max-w-[7rem] truncate text-[0.55rem] font-bold uppercase tracking-[0.14em] text-white/85">
                    {category}
                  </span>
                ) : (
                  <span />
                )}
                {typeof rating === "number" && (
                  <span className="flex items-center gap-0.5 rounded-full bg-white/90 px-1.5 py-0.5 text-[0.6rem] font-bold tabular-nums text-navy">
                    <Star
                      className="h-2.5 w-2.5 fill-liderlar-blue text-liderlar-blue"
                      aria-hidden
                    />
                    {rating.toFixed(1)}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-1 flex-col">
        <h3 className="line-clamp-2 font-display text-[1.02rem] font-bold leading-[1.12] text-navy sm:text-[1.12rem]">
          {book.title}
        </h3>
        {book.authorName && (
          <p className="mt-1 line-clamp-1 text-[0.72rem] leading-4 text-ink-soft">
            {book.authorName}
          </p>
        )}
      </div>
    </>
  );
}

export function RealisticBookCard({
  book,
  priority = false,
}: RealisticBookCardProps) {
  const href = adabiyotXBookHref(book.externalUrl);

  useEffect(() => {
    if (href || process.env.NODE_ENV === "production") return;
    console.warn(
      `[adabiyotx] Kitob uchun yaroqsiz tashqi havola, link o‘chirildi: ${book.id}`
    );
  }, [href, book.id]);

  if (!href) {
    return (
      <article
        aria-label={`${book.title}. Tashqi havola mavjud emas`}
        className="flex h-full w-full flex-col opacity-90"
      >
        <BookBody book={book} priority={priority} />
        <span className="mt-2 text-[0.66rem] font-bold text-ink-soft">
          Havola mavjud emas
        </span>
      </article>
    );
  }

  return (
    // A bare anchor with the untouched AdabiyotX URL: this is what lets iOS /
    // Android hand the tap to the installed app via Universal / App Links and
    // fall back to the web page when it is not installed.
    <a
      href={href}
      aria-label={`${book.title} — AdabiyotX’da o‘qish`}
      className="book3d-link flex h-full w-full flex-col rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-liderlar-blue focus-visible:ring-offset-4 focus-visible:ring-offset-ice"
    >
      <BookBody book={book} priority={priority} />
      <span className="mt-2 flex items-center gap-1 text-[0.66rem] font-bold text-electric-blue">
        AdabiyotX’da o‘qing
        <ExternalLink className="h-3 w-3 shrink-0" aria-hidden />
      </span>
    </a>
  );
}
