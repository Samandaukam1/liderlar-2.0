"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { UserRound } from "lucide-react";
import type { CandidateCardData } from "@/lib/types";
import { gradientFor, initialsFromName } from "@/lib/utils";

const FALLBACK_TONES = [
  "bg-gradient-peach",
  "bg-gradient-violet",
  "bg-gradient-mint",
  "bg-gradient-blue",
  "bg-gradient-coral",
  "bg-gradient-violet",
  "bg-gradient-peach",
];

function wrappedSlot(value: number, count: number) {
  const half = count / 2;
  return ((((value + half) % count) + count) % count) - half;
}

function OrbitCard({
  candidate,
  index,
  count,
  progress,
  prefersReducedMotion,
}: {
  candidate: CandidateCardData | null;
  index: number;
  count: number;
  progress: MotionValue<number>;
  prefersReducedMotion: boolean;
}) {
  const position = useTransform(() => wrappedSlot(index - progress.get(), count));
  const distance = useTransform(() => Math.min(1, Math.abs(position.get()) / Math.floor(count / 2)));
  const x = useTransform(() => `calc(${position.get()} * min(15vw, 230px))`);
  const y = useTransform(() => `calc(${1 - distance.get()} * clamp(58px, 7vw, 96px))`);
  const z = useTransform(() => (1 - distance.get()) * -150);
  const scale = useTransform(() => 0.8 + distance.get() * 0.2);
  const rotateY = useTransform(() => position.get() * -5.5);
  const rotateZ = useTransform(() => position.get() * -0.9);
  const zIndex = useTransform(() => Math.round(distance.get() * 20) + 1);

  return (
    <motion.div
      style={{ x, y, z, scale, rotateY, rotateZ, zIndex, transformStyle: "preserve-3d" }}
      className="absolute left-1/2 top-1 h-[270px] w-[132px] -ml-[66px] md:h-[410px] md:w-[220px] md:-ml-[110px]"
    >
      <motion.div
        className="h-full [transform-style:preserve-3d]"
        whileHover={
          prefersReducedMotion
            ? undefined
            : {
                rotateX: -6,
                rotateY: 8,
                y: -8,
                transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
              }
        }
      >
        {candidate ? (
          <Link
            href={`/liderlar/${candidate.slug}`}
            aria-label={`${candidate.full_name} profilini ko'rish`}
            className="group relative block h-full overflow-hidden rounded-[1.15rem] border border-white/90 bg-sand shadow-[0_18px_55px_rgba(8,88,126,0.15)] transition-shadow duration-500 hover:shadow-[0_28px_72px_rgba(4,151,198,0.3)]"
          >
            {candidate.avatar_url ? (
              <Image
                src={candidate.avatar_url}
                alt={candidate.full_name}
                fill
                priority={index >= 2 && index <= 4}
                sizes="(max-width: 767px) 132px, 220px"
                className="object-cover object-top saturate-[0.92] transition duration-700 group-hover:scale-[1.04] group-hover:saturate-100"
              />
            ) : (
              <div
                className={`flex h-full w-full items-center justify-center text-3xl font-bold text-white/90 ${gradientFor(
                  candidate.slug
                )}`}
              >
                {initialsFromName(candidate.full_name)}
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-portrait" />
            <div className="absolute inset-x-0 bottom-0 p-3 text-white md:p-4">
              <p className="truncate text-[0.62rem] font-bold md:text-xs">{candidate.full_name}</p>
              {candidate.category?.name && (
                <p className="mt-0.5 hidden truncate text-[0.62rem] text-white/70 md:block">
                  {candidate.category.name}
                </p>
              )}
            </div>
          </Link>
        ) : (
          <div
            aria-hidden
            className={`relative flex h-full items-center justify-center overflow-hidden rounded-[1.15rem] border border-white/90 shadow-[0_18px_55px_rgba(8,88,126,0.14)] ${FALLBACK_TONES[index]}`}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,rgba(255,255,255,0.35),transparent_50%)]" />
            <UserRound className="h-9 w-9 text-white/75 md:h-12 md:w-12" aria-hidden />
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export function HeroPortraitStack({ candidates }: { candidates: CandidateCardData[] }) {
  const cards = Array.from({ length: 7 }, (_, index) => candidates[index] ?? null);
  const progress = useMotionValue(0);
  const prefersReducedMotion = useReducedMotion() ?? false;
  const pointerRef = React.useRef<{
    id: number | null;
    startX: number;
    startProgress: number;
    moved: boolean;
  }>({ id: null, startX: 0, startProgress: 0, moved: false });

  useAnimationFrame((_, delta) => {
    if (prefersReducedMotion || pointerRef.current.id !== null) return;
    progress.set(progress.get() + delta * 0.00016);
  });

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    pointerRef.current = {
      id: event.pointerId,
      startX: event.clientX,
      startProgress: progress.get(),
      moved: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const pointer = pointerRef.current;
    if (pointer.id !== event.pointerId) return;
    const delta = event.clientX - pointer.startX;
    if (Math.abs(delta) > 4) pointer.moved = true;
    const slotWidth = Math.min(window.innerWidth * 0.15, 230);
    progress.set(pointer.startProgress - delta / slotWidth);
  }

  function releasePointer(event: React.PointerEvent<HTMLDivElement>) {
    if (pointerRef.current.id !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    pointerRef.current.id = null;
  }

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={releasePointer}
      onPointerCancel={releasePointer}
      onClickCapture={(event) => {
        if (!pointerRef.current.moved) return;
        event.preventDefault();
        event.stopPropagation();
        pointerRef.current.moved = false;
      }}
      className="relative h-[19.5rem] cursor-grab touch-pan-y select-none overflow-hidden active:cursor-grabbing md:h-[30rem] [perspective:1200px]"
      aria-label="Liderlar 3D karuseli. Sichqoncha yoki barmoq bilan suring."
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-30 w-12 bg-gradient-to-r from-paper to-transparent sm:w-24 lg:w-36"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-30 w-12 bg-gradient-to-l from-paper to-transparent sm:w-24 lg:w-36"
      />

      {cards.map((candidate, index) => (
        <OrbitCard
          key={candidate?.id ?? `hero-placeholder-${index}`}
          candidate={candidate}
          index={index}
          count={cards.length}
          progress={progress}
          prefersReducedMotion={prefersReducedMotion}
        />
      ))}
    </div>
  );
}
