"use client";

import { useEffect, useRef } from "react";
import { MIN_ENGAGEMENT_MS } from "@/lib/analytics/bot-detection";

/**
 * Profil ko'rishini qayd etadi.
 *
 * DARHOL EMAS — E'TIBORDAN KEYIN.
 *
 * Avval bu komponent sahifa yuklanishi bilan so'rov yuborardi.
 * U holda orqa fonda ochilgan yorliq, tasodifiy bosish va
 * oldindan yuklash ham ko'rish deb hisoblanardi.
 *
 * Endi uchta shart: sahifa KO'RINIB tursin, odam kamida bir
 * necha soniya qolsin, va yorliq faol bo'lsin. Bu
 * foydalanuvchiga sezilmaydi — u shunchaki o'qiydi.
 */
export function ProfileViewTracker({ candidateSlug }: { candidateSlug: string }) {
  // Bir marta yuborish kafolati: React ikki marta chizsa ham.
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;

    let timer: ReturnType<typeof setTimeout> | null = null;

    function send() {
      if (sent.current) return;
      sent.current = true;

      fetch("/api/profile-view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateSlug,
          /*
           * Brauzer avtomatlashtirilganini AYTADI, lekin
           * server unga ISHONMAYDI: u o'z tomonidan
           * User-Agent'ni ham tekshiradi. Bu maydon faqat
           * qo'shimcha signal.
           */
          automated: typeof navigator !== "undefined" && navigator.webdriver === true,
        }),
        keepalive: true,
      }).catch(() => {
        // Ko'rish yozilmagani sahifani hech qachon buzmasin.
      });
    }

    function start() {
      if (timer !== null) return;
      timer = setTimeout(send, MIN_ENGAGEMENT_MS);
    }

    function stop() {
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
    }

    /*
     * Yorliq orqa fonda bo'lsa, sanoq umuman boshlanmaydi.
     * Odam yorliqqa qaytganda boshlanadi.
     */
    function onVisibility() {
      if (document.visibilityState === "visible") start();
      else stop();
    }

    if (document.visibilityState === "visible") start();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [candidateSlug]);

  return null;
}
