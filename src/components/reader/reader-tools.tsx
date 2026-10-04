"use client";

import { useEffect, useSyncExternalStore } from "react";
import { ArrowUp } from "lucide-react";

const SIZES = ["sm", "md", "lg"] as const;
type Size = (typeof SIZES)[number];
const STORAGE_KEY = "liderlar:reader-size";

/* ------------------------------------------------------------------ *
 * MATN O'LCHAMI — UMUMIY HOLAT
 *
 * Sahifada asboblar IKKI joyda (telefonda sarlavha ostida, kompyuterda
 * chap ustunda). Har biri o'z `useState` iga ega bo'lsa, biri
 * o'zgarganda ikkinchisi eskirib qolardi ("A+" o'chiq ko'rinardi).
 * Shuning uchun holat bitta va ikkala nusxa unga obuna.
 * ------------------------------------------------------------------ */

let current: Size = "md";
let loaded = false;
const listeners = new Set<() => void>();

function readStored(): Size {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored && (SIZES as readonly string[]).includes(stored) ? (stored as Size) : "md";
  } catch {
    // Maxfiy oyna yoki bloklangan saqlash — standart o'lcham.
    return "md";
  }
}

function subscribe(listener: () => void) {
  if (!loaded) {
    loaded = true;
    current = readStored();
  }
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function setSize(next: Size) {
  current = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Eslab bo'lmadi — joriy sahifada baribir ishlaydi.
  }
  listeners.forEach((listener) => listener());
}

/* ------------------------------------------------------------------ *
 * "YUQORIGA" — scroll holati
 * ------------------------------------------------------------------ */

function subscribeScroll(listener: () => void) {
  window.addEventListener("scroll", listener, { passive: true });
  return () => window.removeEventListener("scroll", listener);
}

/**
 * MATN O'LCHAMI VA "YUQORIGA" TUGMASI.
 *
 * O'lcham `data-reader-size` atributi orqali qo'llanadi (`rootId`
 * elementiga), qolganini CSS bajaradi (`globals.css`, `.reader-body`).
 * Tanlov shu brauzerda eslab qolinadi.
 */
export function ReaderTools({
  rootId,
  orientation = "vertical",
}: {
  rootId: string;
  /** `horizontal` — telefon: faqat o'lcham, "yuqoriga" tugmasisiz (pastki menyu bor). */
  orientation?: "vertical" | "horizontal";
}) {
  const size = useSyncExternalStore(subscribe, () => current, () => "md" as Size);
  const showTop = useSyncExternalStore(
    subscribeScroll,
    () => window.scrollY > 900,
    () => false,
  );

  useEffect(() => {
    document.getElementById(rootId)?.setAttribute("data-reader-size", size);
  }, [rootId, size]);

  function change(step: -1 | 1) {
    setSize(SIZES[Math.min(SIZES.length - 1, Math.max(0, SIZES.indexOf(size) + step))]!);
  }

  const vertical = orientation === "vertical";
  const stack = vertical ? "flex flex-col items-center gap-2" : "flex items-center gap-2";
  const button =
    "inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-soft bg-white font-display font-bold text-navy shadow-sm transition hover:border-liderlar-blue/50 hover:text-liderlar-blue disabled:cursor-not-allowed disabled:opacity-40";

  const smaller = (
    <button
      key="smaller"
      type="button"
      onClick={() => change(-1)}
      disabled={size === "sm"}
      aria-label="Matnni kichraytirish"
      title="Matnni kichraytirish"
      className={`${button} text-[0.82rem]`}
    >
      A<span className="text-[0.62rem]">−</span>
    </button>
  );
  const larger = (
    <button
      key="larger"
      type="button"
      onClick={() => change(1)}
      disabled={size === "lg"}
      aria-label="Matnni kattalashtirish"
      title="Matnni kattalashtirish"
      className={`${button} text-[1.05rem]`}
    >
      A<span className="text-[0.7rem]">+</span>
    </button>
  );

  return (
    <div className={stack}>
      {/* Ustunda "katta" tepada, qatorda "kichik" chapda — har ikkisida tabiiy tartib. */}
      <div role="group" aria-label="Matn o'lchami" className={stack}>
        {vertical ? [larger, smaller] : [smaller, larger]}
      </div>

      {vertical && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Sahifa boshiga"
          title="Sahifa boshiga"
          tabIndex={showTop ? 0 : -1}
          className={`${button} mt-2 transition-opacity ${showTop ? "opacity-100" : "pointer-events-none opacity-0"}`}
        >
          <ArrowUp className="h-4 w-4" aria-hidden />
        </button>
      )}
    </div>
  );
}
