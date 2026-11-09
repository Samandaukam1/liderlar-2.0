"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import {
  eligibleAds,
  imageFrameHeight,
  nextCursor,
  nextXState,
  pickIndex,
  readableOn,
  type HighlightAd,
  type HighlightSettings,
  type XState,
} from "@/lib/profile-highlight/rules";

/**
 * BIOGRAFIK SAHIFA BARI.
 *
 * Header ostidan sirg'alib tushadigan "muz shisha" panel. Desktopda o'ng
 * tomonda (OS xabarnomasi o'rnida), telefonda MobileNav bilan bir xil 12px
 * chetlar bilan. Sahifa oqimiga kirmaydi (fixed) — layout siljimaydi.
 *
 * O'QISHGA XALAQIT BERMAYDI: o'quvchi biografiyaga tushishi bilan bar
 * header orqasiga yashirinadi va tepaga qaytganda chiqadi; header menyusi
 * ochilsa xiralashadi; z-index header'dan (40) past — menyular doim ustida.
 *
 * X (egasining talabi): birinchi bosish havolani yangi oynada ochadi va
 * "Yopish" holatiga o'tadi, ikkinchi bosish yopadi. Birinchi bosish oddiy
 * `<a target=_blank>` — popup bloklovchi uni to'sa olmaydi. Escape darhol
 * yopadi (klaviatura uchun chiqish yo'li).
 *
 * Serverda HECH NARSA chizilmaydi: qaysi reklama ko'rsatilishi brauzer
 * xotirasiga (navbat, yopilganlar) bog'liq.
 */

const noopSubscribe = () => () => {};

const KEYS = {
  cursor: "liderlar:phb:cursor",
  closed: (id: string) => `liderlar:phb:closed:${id}`,
  armed: (id: string) => `liderlar:phb:armed:${id}`,
};

type Store = "local" | "session";

function storage(store: Store): Storage | null {
  try {
    return store === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

function readKey(store: Store, key: string): string | null {
  try {
    return storage(store)?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function writeKey(store: Store, key: string, value: string | null): void {
  try {
    const target = storage(store);
    if (!target) return;
    if (value === null) target.removeItem(key);
    else target.setItem(key, value);
  } catch {
    // Maxfiy rejim — holat faqat shu sahifa xotirasida qoladi.
  }
}

function track(id: string, event: "impression" | "click"): void {
  const body = JSON.stringify({ id, event });
  try {
    if (navigator.sendBeacon?.("/api/highlight/event", new Blob([body], { type: "application/json" }))) return;
  } catch {
    // sendBeacon yo'q yoki rad etdi — fetch bilan.
  }
  void fetch("/api/highlight/event", {
    method: "POST",
    body,
    headers: { "content-type": "application/json" },
    keepalive: true,
  }).catch(() => {});
}

/** Ko'rinib turgan header (desktop yoki mobil) pastki cheti; yo'q bo'lsa null. */
function visibleHeaderBottom(): number | null {
  let bottom = 0;
  document.querySelectorAll<HTMLElement>("[data-site-header]").forEach((el) => {
    if (el.offsetHeight > 0) bottom = Math.max(bottom, el.getBoundingClientRect().bottom);
  });
  return bottom > 0 ? bottom : null;
}

export function ProfileHighlightBar(props: {
  ads: HighlightAd[];
  settings: HighlightSettings;
  headerHidden: boolean;
}) {
  const mounted = React.useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  if (!mounted || props.ads.length === 0) return null;
  return createPortal(<HighlightBar {...props} />, document.body);
}

interface View {
  list: HighlightAd[];
  index: number;
}

function HighlightBar({
  ads,
  settings,
  headerHidden,
}: {
  ads: HighlightAd[];
  settings: HighlightSettings;
  headerHidden: boolean;
}) {
  const reduceMotion = useReducedMotion() ?? false;
  const hostRef = React.useRef<HTMLDivElement>(null);
  const [view, setView] = React.useState<View | null>(null);
  const [xState, setXState] = React.useState<XState>("idle");
  const [exiting, setExiting] = React.useState(false);
  const [hint, setHint] = React.useState(false);
  const [paused, setPaused] = React.useState(false);
  const [layout, setLayout] = React.useState({ width: 0, desktop: false });
  const [swapCount, setSwapCount] = React.useState(0);
  const [cycleTick, setCycleTick] = React.useState(0);
  const impressions = React.useRef(new Set<string>());
  const swaps = React.useRef(0);
  const hintTimer = React.useRef<number | null>(null);

  const current = view ? view.list[view.index] ?? null : null;

  /* 1. Kechikishdan keyin, sahifa ko'rinib turganda — qaysi reklama. */
  React.useEffect(() => {
    if (window.self !== window.top) return; // muharrirdagi jonli ko'rinish ichida emas
    let cancelled = false;
    let removeVisibility: (() => void) | null = null;

    const reveal = () => {
      if (cancelled) return;
      const now = Date.now();
      const closedAt: Record<string, number> = {};
      for (const ad of ads) {
        const value = Number(readKey("local", KEYS.closed(ad.id)));
        if (Number.isFinite(value) && value > 0) closedAt[ad.id] = value;
      }
      const list = eligibleAds(ads, closedAt, settings.dismissHours, now);
      if (list.length === 0) return;
      const stored = readKey("local", KEYS.cursor);
      // Birinchi tashrifda tasodifiy boshlanadi — hamma bitta reklamadan boshlamasin.
      const cursor = stored !== null && Number.isFinite(Number(stored)) ? Number(stored) : Math.floor(Math.random() * list.length);
      const index = pickIndex(settings.rotation, cursor, list.length, Math.random());
      writeKey("local", KEYS.cursor, String(nextCursor(cursor, list.length)));
      setXState(readKey("session", KEYS.armed(list[index].id)) === "1" ? "armed" : "idle");
      setView({ list, index });
    };

    const timer = window.setTimeout(() => {
      if (document.visibilityState === "visible") {
        reveal();
        return;
      }
      const onVisible = () => {
        if (document.visibilityState !== "visible") return;
        document.removeEventListener("visibilitychange", onVisible);
        reveal();
      };
      document.addEventListener("visibilitychange", onVisible);
      removeVisibility = () => document.removeEventListener("visibilitychange", onVisible);
    }, settings.appearDelayMs);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      removeVisibility?.();
    };
  }, [ads, settings]);

  /* 2. Joylashuv: header ostidan 8px; header qisqarsa ergashadi. */
  React.useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const bottom = headerHidden ? null : visibleHeaderBottom();
      if (bottom !== null) {
        host.style.setProperty("--phb-top", `${Math.round(bottom + 8)}px`);
        host.dataset.headerless = "false";
      } else {
        host.style.removeProperty("--phb-top");
        host.dataset.headerless = "true";
      }
      const desktop = window.matchMedia("(min-width: 1024px)").matches;
      const width = host.clientWidth;
      setLayout((prev) => (prev.width === width && prev.desktop === desktop ? prev : { width, desktop }));
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    schedule();
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(schedule) : null;
    document.querySelectorAll("[data-site-header]").forEach((el) => observer?.observe(el));
    observer?.observe(host);
    window.addEventListener("resize", schedule);
    window.addEventListener("scroll", schedule, { passive: true });
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener("resize", schedule);
      window.removeEventListener("scroll", schedule);
    };
  }, [headerHidden]);

  /* 3. O'qishga xalaqit bermaslik: pastga tushilganda bar yashirinadi. */
  React.useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    if (!settings.hideOnScroll) {
      host.dataset.parked = "false";
      return;
    }
    let frame = 0;
    const apply = () => {
      frame = 0;
      const threshold = Math.min(320, window.innerHeight * 0.4);
      host.dataset.parked = window.scrollY > threshold ? "true" : "false";
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(apply);
    };
    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [settings.hideOnScroll]);

  /* 4. Ko'rsatish hisobi — har reklama uchun bir sahifada bir marta. */
  const currentId = current?.id ?? null;
  React.useEffect(() => {
    if (!currentId || impressions.current.has(currentId)) return;
    const timer = window.setTimeout(() => {
      impressions.current.add(currentId);
      track(currentId, "impression");
    }, 900);
    return () => window.clearTimeout(timer);
  }, [currentId]);

  /* 5. "Aylanma" navbat: bir sahifada almashadi, lekin bezovta qilmaydi. */
  const listLength = view?.list.length ?? 0;
  React.useEffect(() => {
    if (settings.rotation !== "cycle" || listLength < 2) return;
    if (xState !== "idle" || exiting || paused || reduceMotion) return;
    if (swaps.current >= listLength * 2) return;
    const timer = window.setTimeout(
      () => {
        const host = hostRef.current;
        if (host?.dataset.parked === "true" || document.visibilityState !== "visible") {
          setCycleTick((t) => t + 1);
          return;
        }
        swaps.current += 1;
        setSwapCount((n) => n + 1);
        setView((prev) => (prev ? { ...prev, index: (prev.index + 1) % prev.list.length } : prev));
      },
      Math.max(settings.cycleSeconds * 1000, 4000),
    );
    return () => window.clearTimeout(timer);
  }, [settings.rotation, settings.cycleSeconds, listLength, xState, exiting, paused, reduceMotion, cycleTick, swapCount]);

  React.useEffect(
    () => () => {
      if (hintTimer.current) window.clearTimeout(hintTimer.current);
    },
    [],
  );

  const arm = React.useCallback(() => {
    if (!current) return;
    track(current.id, "click");
    if (!current.closeOpensLink) return;
    writeKey("session", KEYS.armed(current.id), "1");
    setXState("armed");
    setHint(true);
    if (hintTimer.current) window.clearTimeout(hintTimer.current);
    hintTimer.current = window.setTimeout(() => setHint(false), 2800);
  }, [current]);

  const close = React.useCallback(() => {
    if (!current) return;
    writeKey("local", KEYS.closed(current.id), String(Date.now()));
    writeKey("session", KEYS.armed(current.id), null);
    setHint(false);
    setExiting(true);
    // animationend kelmasa ham (masalan, fon oynasida) bar albatta yopiladi.
    window.setTimeout(() => setXState("closed"), 400);
  }, [current]);

  const onX = (event: React.MouseEvent) => {
    if (!current) return;
    const next = nextXState(xState, current.closeOpensLink);
    if (next === "armed") {
      // Havola `<a target=_blank>` ning o'zi ochadi — preventDefault yo'q.
      arm();
      return;
    }
    event.preventDefault();
    close();
  };

  const style = current?.style;
  const attention =
    style?.attention === "pulse" && !current?.buttonLabel ? "shimmer" : (style?.attention ?? "none");
  const customVars =
    style?.theme === "custom"
      ? ({
          "--phb-c-bg": style.bg ?? "#0b3555",
          "--phb-c-fg": style.fg ?? "#ffffff",
          "--phb-c-accent": style.accent ?? "#13bce4",
          "--phb-c-accent-fg": readableOn(style.accent ?? "#13bce4"),
        } as React.CSSProperties)
      : undefined;

  const imageHeight =
    current?.kind === "image"
      ? imageFrameHeight(layout.width, current.imageWidth, current.imageHeight, {
          min: 56,
          max: layout.desktop ? 120 : 96,
        })
      : undefined;

  const visible = current && xState !== "closed";
  const isArmed = xState === "armed";

  return (
    <div
      ref={hostRef}
      className="phb-host"
      data-profile-highlight=""
      data-header-hidden={headerHidden ? "true" : "false"}
    >
      {visible && current ? (
        <div className="phb-slot">
          <div
            role="complementary"
            aria-label="Reklama"
            className="phb-panel"
            data-kind={current.kind}
            data-theme={style?.theme}
            data-enter={style?.entrance}
            data-attention={attention}
            data-armed={isArmed ? "true" : "false"}
            data-phase={exiting ? "exit" : "shown"}
            style={customVars}
            onAnimationEnd={(event) => {
              if (exiting && event.animationName === "phb-exit") setXState("closed");
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") close();
            }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
          >
            {current.kind === "text" ? <span className="phb-sweep" aria-hidden /> : null}

            <a
              key={current.id}
              href={current.url}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className={current.kind === "image" ? "phb-body phb-body--image" : "phb-body"}
              data-swap={swapCount > 0 ? "true" : undefined}
              style={imageHeight ? { height: imageHeight } : undefined}
              onClick={arm}
            >
              {current.kind === "image" && current.imageUrl ? (
                <Image
                  src={current.imageUrl}
                  alt={current.text ?? "Reklama"}
                  fill
                  sizes="(max-width: 1023px) 100vw, 640px"
                  className="object-cover"
                />
              ) : (
                <>
                  {current.logoUrl && style?.logoPosition !== "right" ? (
                    <Image src={current.logoUrl} alt="" width={80} height={80} className="phb-logo" />
                  ) : null}
                  <span className="phb-copy">
                    <span className="phb-eyebrow">Reklama</span>
                    {attention === "marquee" ? (
                      <span className="phb-headline" data-marquee="true">
                        <span className="phb-marquee-track">
                          <span>{current.text}</span>
                          <span aria-hidden>{current.text}</span>
                        </span>
                      </span>
                    ) : (
                      <span className="phb-headline">{current.text}</span>
                    )}
                  </span>
                  {current.buttonLabel ? <span className="phb-cta">{current.buttonLabel}</span> : null}
                  {current.logoUrl && style?.logoPosition === "right" ? (
                    <Image src={current.logoUrl} alt="" width={80} height={80} className="phb-logo" />
                  ) : null}
                </>
              )}
            </a>

            {xState === "idle" && current.closeOpensLink ? (
              <a
                href={current.url}
                target="_blank"
                rel="noopener noreferrer sponsored"
                role="button"
                className="phb-x"
                aria-label="Reklamani ochish; yopish uchun yana bosing"
                onClick={onX}
              >
                <X className="h-4 w-4" aria-hidden />
              </a>
            ) : (
              <button
                type="button"
                className="phb-x"
                data-armed={isArmed ? "true" : undefined}
                aria-label="Reklamani yopish"
                onClick={onX}
              >
                <X className="h-4 w-4" aria-hidden />
                {isArmed ? <span>Yopish</span> : null}
              </button>
            )}
          </div>
          {hint ? (
            <span className="phb-hint" role="status">
              Yopish uchun yana bosing
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
