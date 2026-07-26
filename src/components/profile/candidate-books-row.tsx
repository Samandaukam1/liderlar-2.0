"use client";

import { useId, useRef } from "react";
import type { PublicCandidateAdabiyotXItem } from "@/lib/types";
import { RealisticBookCard } from "@/components/profile/realistic-book-card";
import { HorizontalScrollControls } from "@/components/profile/horizontal-scroll-controls";

export interface CandidateBooksRowProps {
  title: string;
  books: PublicCandidateAdabiyotXItem[];
}

export function CandidateBooksRow({ title, books }: CandidateBooksRowProps) {
  const headingId = useId();
  const scrollerRef = useRef<HTMLUListElement>(null);

  if (books.length === 0) return null;

  return (
    <section
      aria-labelledby={headingId}
      className="relative isolate min-w-0 max-w-full overflow-hidden rounded-[1.5rem] border border-brand-soft bg-gradient-to-b from-paper to-ice/70 px-4 py-6 sm:px-6"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-20 -z-10 h-52 w-52 rounded-full bg-liderlar-blue/10 blur-3xl"
      />

      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-[0.6rem] font-bold uppercase tracking-[0.24em] text-liderlar-blue">
            AdabiyotX
          </p>
          <h2
            id={headingId}
            className="mt-1 font-display text-2xl font-bold leading-none text-navy"
          >
            {title}
          </h2>
        </div>
        <span className="shrink-0 rounded-full border border-brand-soft bg-paper px-2.5 py-1 text-[0.65rem] font-bold tabular-nums text-ink-soft">
          {books.length} ta
        </span>
      </div>

      <div className="relative min-w-0 max-w-full">
        <ul
          ref={scrollerRef}
          // scroll-p* must match px, otherwise `snap-start` aligns the first
          // card to the raw scrollport edge and the row rests pre-scrolled.
          className="no-scrollbar -mx-4 flex max-w-[calc(100%+2rem)] touch-pan-x snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto overscroll-x-contain scroll-smooth px-4 pb-6 pt-2 [-webkit-overflow-scrolling:touch] sm:-mx-6 sm:max-w-[calc(100%+3rem)] sm:scroll-px-6 sm:px-6"
        >
          {books.map((book, index) => (
            <li
              key={book.id}
              data-book-card
              // The last card snaps to the end so mandatory snapping can still
              // reach the true scroll end instead of stopping a card early.
              className={`flex w-[10.5rem] shrink-0 sm:w-[12.25rem] lg:w-[13.5rem] ${
                index === books.length - 1 ? "snap-end" : "snap-start"
              }`}
            >
              <RealisticBookCard book={book} priority={index === 0} />
            </li>
          ))}
        </ul>

        <HorizontalScrollControls
          scrollerRef={scrollerRef}
          itemSelector="[data-book-card]"
          previousLabel={`${title}: oldingi kitoblarni ko‘rish`}
          nextLabel={`${title}: keyingi kitoblarni ko‘rish`}
          className="top-[9rem]"
        />
      </div>
    </section>
  );
}
