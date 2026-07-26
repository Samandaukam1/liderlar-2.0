"use client";

import { useCallback, useEffect, useState, type RefObject } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type ScrollState = {
  overflowing: boolean;
  atStart: boolean;
  atEnd: boolean;
};

const INITIAL_STATE: ScrollState = {
  overflowing: false,
  atStart: true,
  atEnd: true,
};

export interface HorizontalScrollControlsProps {
  scrollerRef: RefObject<HTMLElement | null>;
  /** Selector of a single item, used to step by exactly one card. */
  itemSelector: string;
  previousLabel: string;
  nextLabel: string;
  /** Vertical anchor of the buttons, e.g. "top-[8rem]". */
  className?: string;
}

export function HorizontalScrollControls({
  scrollerRef,
  itemSelector,
  previousLabel,
  nextLabel,
  className,
}: HorizontalScrollControlsProps) {
  const [state, setState] = useState<ScrollState>(INITIAL_STATE);

  const sync = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const maxScrollLeft = Math.max(
      0,
      scroller.scrollWidth - scroller.clientWidth
    );
    setState({
      overflowing: maxScrollLeft > 2,
      atStart: scroller.scrollLeft <= 2,
      atEnd: scroller.scrollLeft >= maxScrollLeft - 2,
    });
  }, [scrollerRef]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    sync();
    scroller.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);

    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(sync);
    observer?.observe(scroller);

    return () => {
      scroller.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
      observer?.disconnect();
    };
  }, [scrollerRef, sync]);

  if (!state.overflowing) return null;

  function scrollBy(direction: -1 | 1) {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const item = scroller.querySelector<HTMLElement>(itemSelector);
    const step = (item?.offsetWidth ?? scroller.clientWidth * 0.8) + 16;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    scroller.scrollBy({
      left: direction * step,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }

  const button =
    "pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-white/60 bg-navy-dark/90 text-white shadow-lg backdrop-blur transition-colors hover:bg-electric-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-liderlar-blue focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-0";

  return (
    <div
      className={`pointer-events-none absolute inset-x-1 z-20 hidden -translate-y-1/2 items-center justify-between md:flex ${className ?? ""}`}
    >
      <button
        type="button"
        aria-label={previousLabel}
        disabled={state.atStart}
        onClick={() => scrollBy(-1)}
        className={button}
      >
        <ChevronLeft className="h-5 w-5" aria-hidden />
      </button>
      <button
        type="button"
        aria-label={nextLabel}
        disabled={state.atEnd}
        onClick={() => scrollBy(1)}
        className={button}
      >
        <ChevronRight className="h-5 w-5" aria-hidden />
      </button>
    </div>
  );
}
