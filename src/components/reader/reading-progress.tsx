"use client";

import { useEffect, useRef } from "react";

/**
 * O'QISH JARAYONI CHIZIG'I — sahifaning eng tepasida.
 *
 * Maqola matni qancha o'qilganini ko'rsatadi: sahifa emas, aynan
 * `targetId` elementi (maqola tanasi) bo'yicha — pastdagi "boshqa
 * maqolalar" va footer foizni buzmasin.
 *
 * `transform: scaleX` — qayta joylashuv (layout) yo'q, faqat
 * kompozitsiya; `requestAnimationFrame` har kadrda bir marta.
 * React holati ishlatilmaydi: har scroll'da qayta chizish keraksiz.
 */
export function ReadingProgress({ targetId }: { targetId: string }) {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = document.getElementById(targetId);
    const el = bar.current;
    if (!target || !el) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = target.getBoundingClientRect();
      const total = rect.height - window.innerHeight * 0.6;
      const passed = -rect.top + window.innerHeight * 0.2;
      const ratio = total > 0 ? Math.min(1, Math.max(0, passed / total)) : 0;
      el.style.transform = `scaleX(${ratio})`;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [targetId]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[3px] bg-transparent">
      <div
        ref={bar}
        className="h-full origin-left bg-gradient-to-r from-liderlar-blue via-cyan to-electric-blue shadow-[0_0_8px_rgba(19,188,228,0.6)]"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}
