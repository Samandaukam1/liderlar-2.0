"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import {
  ASPECT_RATIO_VALUES,
  DEFAULT_CORNER_VIDEO_SETTINGS,
  mapCornerVideoSettingsRow,
  type CornerVideoSettings,
  type CornerVideoSettingsRow,
} from "@/lib/corner-video/settings";

const DISMISS_KEY = "corner-video-dismissed";

/** Flex alignment that pins the card to the admin-chosen corner. */
const CORNER_ALIGNMENT: Record<CornerVideoSettings["corner"], string> = {
  "top-left": "items-start justify-start",
  "top-right": "items-start justify-end",
  "bottom-left": "items-end justify-start",
  "bottom-right": "items-end justify-end",
};

const BUTTON_ANIMATION_CLASS: Record<CornerVideoSettings["buttonAnimation"], string> = {
  pulse: "cv-btn-pulse",
  bounce: "cv-btn-bounce",
  glow: "cv-btn-glow",
  shine: "cv-btn-shine",
  none: "",
};

const noopSubscribe = () => () => {};

/**
 * Reads the "user already closed this" flag without a cascading render:
 * the server snapshot is always `false`, and the client snapshot is applied
 * as part of hydration rather than in a follow-up effect.
 */
function useSessionDismissed() {
  return React.useSyncExternalStore(
    noopSubscribe,
    () => {
      try {
        return sessionStorage.getItem(DISMISS_KEY) === "1";
      } catch {
        return false;
      }
    },
    () => false
  );
}

/** Tracks the viewport so the expanded card can be sized to fit it. */
function useViewport() {
  const [size, setSize] = React.useState({ width: 0, height: 0 });
  React.useEffect(() => {
    const read = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    read();
    window.addEventListener("resize", read);
    window.addEventListener("orientationchange", read);
    return () => {
      window.removeEventListener("resize", read);
      window.removeEventListener("orientationchange", read);
    };
  }, []);
  return size;
}

export function CornerVideoPlayer({
  initialSettings,
}: {
  initialSettings?: CornerVideoSettings;
}) {
  const [settings, setSettings] = React.useState<CornerVideoSettings>(
    initialSettings ?? DEFAULT_CORNER_VIDEO_SETTINGS
  );
  const [expanded, setExpanded] = React.useState(false);
  const [dismissedNow, setDismissedNow] = React.useState(false);
  const dismissed = useSessionDismissed() || dismissedNow;
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const viewport = useViewport();
  const reduceMotion = useReducedMotion();

  const expand = React.useCallback(() => {
    setExpanded(true);
    const video = videoRef.current;
    if (!video) return;
    // Unmuting is only permitted inside the click gesture that got us here.
    video.muted = false;
    video.volume = 1;
    void video.play().catch(() => {
      // Autoplay policy still refused sound — keep it playing silently.
      video.muted = true;
      void video.play().catch(() => {});
    });
  }, []);

  const collapse = React.useCallback(() => {
    setExpanded(false);
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    void video.play().catch(() => {});
  }, []);

  // Closing hides the widget for the rest of the browsing session.
  const dismiss = React.useCallback(() => {
    setExpanded(false);
    setDismissedNow(true);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* private mode — hidden for this page view only */
    }
  }, []);

  React.useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("corner-video-settings-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "corner_video_settings" },
        (payload) => {
          const row = (payload.new ?? payload.old) as Partial<CornerVideoSettingsRow> | null;
          if (!row || Object.keys(row).length === 0) return;
          setSettings((prev) => mapCornerVideoSettingsRow(row, prev));
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Escape returns to the corner rather than closing the widget outright.
  React.useEffect(() => {
    if (!expanded) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") collapse();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [expanded, collapse]);

  // Lock background scrolling while the centred player is open.
  React.useEffect(() => {
    if (!expanded) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [expanded]);

  if (!settings.enabled || !settings.videoUrl || dismissed) return null;

  const ratio = ASPECT_RATIO_VALUES[settings.aspectRatio] ?? ASPECT_RATIO_VALUES["9:16"];
  const isBottom = settings.corner.startsWith("bottom");
  const buttonUrl = settings.buttonUrl;
  const showButton = settings.buttonEnabled && Boolean(buttonUrl);
  const isInternalLink = Boolean(buttonUrl?.startsWith("/"));

  // Before the first client measurement the admin width is used, so the
  // server-rendered markup matches what hydration produces.
  const miniWidth = viewport.width
    ? Math.min(settings.widthPx, Math.max(110, viewport.width * 0.38))
    : settings.widthPx;

  // Landscape clips get a wider ceiling; portrait ones are bounded by height.
  const expandedCap = ratio >= 1 ? 880 : 460;
  const expandedWidth = viewport.width
    ? Math.min(viewport.width * 0.92, viewport.height * 0.72 * ratio, expandedCap)
    : expandedCap;

  const transition = reduceMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 260, damping: 30 };

  return (
    <div
      className={cn(
        "fixed inset-0 flex",
        expanded ? "z-[105] items-center justify-center p-4" : "z-[70]",
        !expanded && CORNER_ALIGNMENT[settings.corner],
        // Bottom corners have to clear the mobile tab bar, which is gone at lg.
        !expanded && isBottom && "pb-[calc(var(--cv-y)+4.75rem)] lg:pb-[var(--cv-y)]",
        !expanded && !isBottom && "pt-[var(--cv-y)]",
        !expanded && "px-[var(--cv-x)]"
      )}
      style={
        {
          "--cv-x": `${settings.offsetXPx}px`,
          "--cv-y": `${settings.offsetYPx}px`,
          pointerEvents: expanded ? "auto" : "none",
        } as React.CSSProperties
      }
    >
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-navy/70 backdrop-blur-sm"
            onClick={collapse}
            aria-hidden
          />
        )}
      </AnimatePresence>

      <motion.div
        layout
        transition={transition}
        style={{ width: expanded ? expandedWidth : miniWidth, pointerEvents: "auto" }}
        className="relative flex flex-col gap-2"
      >
        <div className="group relative">
          <video
            ref={videoRef}
            src={settings.videoUrl}
            poster={settings.posterUrl ?? undefined}
            autoPlay
            muted
            loop={settings.loopEnabled}
            playsInline
            preload="metadata"
            controls={expanded}
            controlsList="nodownload"
            disablePictureInPicture
            onEnded={() => {
              // A non-looping clip that finishes in the centre returns home.
              if (expanded) collapse();
            }}
            style={{
              borderRadius: expanded ? Math.max(settings.roundedPx, 16) : settings.roundedPx,
              aspectRatio: settings.aspectRatio.replace(":", " / "),
            }}
            className={cn(
              "w-full bg-navy object-cover shadow-[0_18px_50px_rgba(7,88,126,0.35)] ring-1 ring-white/25",
              !expanded && "cursor-pointer transition-transform duration-300 group-hover:scale-[1.04]"
            )}
          />

          {/* Mini state: the whole frame is the "play bigger" affordance. */}
          {!expanded && (
            <button
              type="button"
              onClick={expand}
              aria-label="Videoni kattalashtirib, ovoz bilan ko'rish"
              className="absolute inset-0 cursor-pointer rounded-[inherit] transition-transform duration-300 hover:scale-[1.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-liderlar-blue"
            />
          )}

          {expanded && (
            <button
              type="button"
              onClick={collapse}
              aria-label="Orqaga qaytish"
              className="absolute left-2 top-2 z-10 flex items-center gap-1.5 rounded-full bg-navy/70 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md transition-colors hover:bg-navy"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Orqaga
            </button>
          )}

          {settings.showCloseButton && (
            <button
              type="button"
              onClick={dismiss}
              aria-label="Videoni yopish"
              className={cn(
                "absolute z-10 flex items-center justify-center rounded-full bg-navy/70 text-white shadow-md backdrop-blur-md transition-colors hover:bg-navy",
                expanded ? "right-2 top-2 h-9 w-9" : "-right-2 -top-2 h-7 w-7"
              )}
            >
              <X className={expanded ? "h-4 w-4" : "h-3.5 w-3.5"} aria-hidden />
            </button>
          )}
        </div>

        {showButton && buttonUrl && (
          <a
            href={buttonUrl}
            target={isInternalLink ? undefined : "_blank"}
            rel={isInternalLink ? undefined : "noopener noreferrer"}
            style={
              {
                background: settings.buttonColor,
                color: settings.buttonTextColor,
                "--cv-btn-color": settings.buttonColor,
              } as React.CSSProperties
            }
            className={cn(
              "relative flex w-full items-center justify-center rounded-full px-3 py-2 text-center font-bold leading-tight shadow-[0_8px_22px_rgba(7,88,126,0.28)] transition-transform hover:scale-[1.03] active:scale-95",
              expanded ? "text-sm" : "text-[0.7rem]",
              BUTTON_ANIMATION_CLASS[settings.buttonAnimation]
            )}
          >
            <span className="relative z-10 truncate">{settings.buttonLabel}</span>
          </a>
        )}
      </motion.div>
    </div>
  );
}
