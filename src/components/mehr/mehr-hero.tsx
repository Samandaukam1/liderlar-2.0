"use client";

import { useEffect, useRef, useState } from "react";
import { MEHR_COLORS, MEHR_GRADIENT } from "@/lib/mehr/brand";
import { usePointerMotion, usePrefersReducedMotion } from "./use-motion";

/**
 * Bosh sahifa vizuali.
 *
 * QAROR: WebGL EMAS.
 *
 * Bu sahifa ko'pincha telefonda va sekin internetda ochiladi.
 * Og'ir 3D sahna uchun yuklanadigan kutubxona bu yerda
 * beradigan foydasidan qimmatroqqa tushadi. Shuning uchun —
 * oddiy CSS transform va sichqoncha holatiga yumshoq javob.
 *
 * `prefers-reduced-motion` HURMAT QILINADI: harakat butunlay
 * o'chadi, chunki u bezak, ma'lumot emas.
 */
export function MehrHeroVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  /*
   * Harakat FAQAT sichqonchali qurilmada va foydalanuvchi uni
   * cheklamagan bo'lsa. Qiymat render paytida o'qiladi —
   * effektda emas, aks holda ekran avval harakat bilan
   * chizilib, keyin to'xtardi.
   */
  const motionAllowed = usePointerMotion();

  useEffect(() => {
    if (!motionAllowed) return;

    const node = ref.current;
    if (!node) return;

    let frame = 0;
    function onMove(event: MouseEvent) {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = node!.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        // Burchak ataylab kichik: ekran "suzib ketmasin".
        setTilt({
          x: Math.max(-6, Math.min(6, (event.clientY - cy) / -40)),
          y: Math.max(-6, Math.min(6, (event.clientX - cx) / 40)),
        });
      });
    }

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(frame);
    };
  }, [motionAllowed]);

  return (
    <div
      ref={ref}
      aria-hidden
      className="relative mx-auto aspect-square w-full max-w-[420px]"
      style={{ perspective: 1000 }}
    >
      <div
        className="absolute inset-0 transition-transform duration-500 ease-out"
        style={{
          transform: motionAllowed
            ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`
            : undefined,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Yumshoq nur — chuqurlik hissi uchun. */}
        <div
          className="absolute inset-[12%] rounded-full opacity-25 blur-3xl"
          style={{ background: MEHR_GRADIENT }}
        />

        <div
          className="absolute inset-[18%] rounded-full"
          style={{
            background: MEHR_GRADIENT,
            boxShadow: "0 30px 80px -30px rgba(15,43,61,0.45)",
          }}
        />

        <div className="absolute inset-[18%] flex items-center justify-center">
          <span className="font-display text-5xl font-black tracking-tight text-white sm:text-6xl">
            365<span className="text-4xl sm:text-5xl">+</span>
          </span>
        </div>

        {/*
          Aylanadigan halqa — sof bezak, ma'lumot tashimaydi.
          Shuning uchun `aria-hidden` va harakat o'chirilganda
          ham sahifa to'liq tushunarli qoladi.
        */}
        <div
          className="absolute inset-[6%] rounded-full border"
          style={{
            borderColor: "rgba(28,143,232,0.18)",
            animation: motionAllowed ? "mehr-spin 28s linear infinite" : undefined,
          }}
        />
        <div
          className="absolute inset-0 rounded-full border"
          style={{
            borderColor: "rgba(34,181,115,0.14)",
            animation: motionAllowed ? "mehr-spin 44s linear infinite reverse" : undefined,
          }}
        />
      </div>

      <style>{`
        @keyframes mehr-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="mehr-spin"] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}

/** Sonni sanab ko'rsatadi — faqat harakat ruxsat etilgan bo'lsa. */
export function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
  const reduce = usePrefersReducedMotion();
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (reduce || value <= 0) return;

    const duration = 900;
    const start = performance.now();
    let frame = 0;

    function step(now: number) {
      const progress = Math.min(1, (now - start) / duration);
      // easeOutCubic — oxirida yumshoq to'xtaydi.
      setShown(Math.round(value * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(step);
    }

    // setState faqat rAF ichida — effekt tanasida emas.
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [reduce, value]);

  /*
   * Ko'rsatiladigan qiymat HOSILA.
   *
   * Harakat cheklangan bo'lsa yoki son nol bo'lsa, sanoq
   * umuman ishlamaydi va haqiqiy qiymat darhol chiqadi —
   * "0" ni animatsiya qilish ma'nosiz.
   */
  const display = reduce || value <= 0 ? value : shown;

  return (
    <span className="tabular-nums" style={{ color: MEHR_COLORS.ink }}>
      {display.toLocaleString("uz-UZ")}
      {suffix}
    </span>
  );
}
