"use client";

import { useSyncExternalStore } from "react";

/**
 * Harakat ruxsat etilganmi — TASHQI TIZIM SIFATIDA o'qiladi.
 *
 * Buni effektda o'qib setState qilish vasvasa qiladi, lekin
 * shunda ekran ikki marta chiziladi: avval harakat bilan,
 * keyin harakatsiz. Foydalanuvchi aynan harakatni
 * cheklaganini aytgan bo'lsa, unga bir lahzaga bo'lsa ham
 * harakat ko'rsatish — so'rovni buzish.
 *
 * `useSyncExternalStore` bu holat uchun aynan to'g'ri
 * primitiv: qiymat render paytida mavjud bo'ladi va server
 * surati alohida beriladi.
 */

function subscribe(onChange: () => void): () => void {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const pointer = window.matchMedia("(pointer: fine)");

  reduce.addEventListener("change", onChange);
  pointer.addEventListener("change", onChange);

  return () => {
    reduce.removeEventListener("change", onChange);
    pointer.removeEventListener("change", onChange);
  };
}

/** Mijoz surati: harakat + sichqoncha bor. */
function getSnapshot(): boolean {
  return (
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
    window.matchMedia("(pointer: fine)").matches
  );
}

/*
 * Server surati: HARAKAT YO'Q.
 *
 * Serverda foydalanuvchi sozlamasi noma'lum. "Bor" deb
 * taxmin qilsak, harakatni cheklagan odam birinchi
 * chizishda uni ko'rib qolardi.
 */
function getServerSnapshot(): boolean {
  return false;
}

export function usePointerMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

function getReduceSnapshot(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReduceServerSnapshot(): boolean {
  // Serverda — harakatni cheklangan deb hisoblaymiz.
  return true;
}

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getReduceSnapshot, getReduceServerSnapshot);
}
