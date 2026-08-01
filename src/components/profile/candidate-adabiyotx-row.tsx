"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PublicCandidateAdabiyotXItem } from "@/lib/types";
import { CandidateAdabiyotXCard } from "@/components/profile/candidate-adabiyotx-card";
import { RealisticBookCard } from "@/components/profile/realistic-book-card";

type ScrollState = {
  overflowing: boolean;
  atStart: boolean;
  atEnd: boolean;
};

const INITIAL_SCROLL_STATE: ScrollState = {
  overflowing: false,
  atStart: true,
  atEnd: true,
};

export function CandidateAdabiyotXRow({
  items,
  ariaLabel,
}: {
  items: PublicCandidateAdabiyotXItem[];
  ariaLabel: string;
}) {
  const rowRef = useRef<HTMLUListElement>(null);
  const [scrollState, setScrollState] =
    useState<ScrollState>(INITIAL_SCROLL_STATE);

  const updateScrollState = useCallback(() => {
    const row = rowRef.current;
    if (!row) return;

    const maxScrollLeft = Math.max(0, row.scrollWidth - row.clientWidth);
    setScrollState({
      overflowing: maxScrollLeft > 2,
      atStart: row.scrollLeft <= 2,
      atEnd: row.scrollLeft >= maxScrollLeft - 2,
    });
  }, []);

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;

    updateScrollState();
    row.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(updateScrollState);
    resizeObserver?.observe(row);

    return () => {
      row.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
      resizeObserver?.disconnect();
    };
  }, [items, updateScrollState]);

  function scroll(direction: -1 | 1) {
    const row = rowRef.current;
    if (!row) return;

    const firstCard = row.querySelector<HTMLElement>("[data-adabiyotx-card]");
    const distance = (firstCard?.offsetWidth ?? row.clientWidth * 0.75) + 16;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    row.scrollBy({
      left: direction * distance,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }

  return (
    <div className="relative min-w-0 max-w-full">
      <ul
        ref={rowRef}
        aria-label={ariaLabel}
        className="no-scrollbar flex max-w-full touch-pan-x snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain scroll-smooth px-1 pb-4 pt-1 [-webkit-overflow-scrolling:touch] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-liderlar-blue/70"
        tabIndex={0}
      >
        {items.map((item, index) => (
          <li
            key={item.id}
            data-adabiyotx-card
            className="flex w-[9.75rem] shrink-0 snap-start sm:w-48 lg:w-[13.25rem]"
          >
            {item.contentType === "book" ? (
              <RealisticBookCard book={item} priority={index === 0} />
            ) : (
              <CandidateAdabiyotXCard item={item} />
            )}
          </li>
        ))}
      </ul>

      {scrollState.overflowing && (
        <div className="pointer-events-none absolute inset-x-2 top-[9.5rem] z-10 hidden -translate-y-1/2 items-center justify-between md:flex">
          <button
            type="button"
            aria-label="Oldingi AdabiyotX materiallarini ko‘rish"
            disabled={scrollState.atStart}
            onClick={() => scroll(-1)}
            className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-navy-dark/90 text-white shadow-lg backdrop-blur transition hover:bg-electric-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-liderlar-blue focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Keyingi AdabiyotX materiallarini ko‘rish"
            disabled={scrollState.atEnd}
            onClick={() => scroll(1)}
            className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-navy-dark/90 text-white shadow-lg backdrop-blur transition hover:bg-electric-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-liderlar-blue focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
        </div>
      )}
    </div>
  );
}
