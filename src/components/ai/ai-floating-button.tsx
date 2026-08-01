"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AIChatPanel } from "@/components/ai/ai-chat-panel";
import { JaxongirAiMedia } from "@/components/ai/jaxongir-ai-media";
import {
  DEFAULT_AI_ASSISTANT_SETTINGS,
  mapAiAssistantSettingsRow,
  type AiAssistantSettings,
  type AiAssistantSettingsRow,
} from "@/lib/ai/assistant-settings";

const PANEL_VARIANTS: Record<AiAssistantSettings["openingAnimation"], Variants> = {
  portal: {
    hidden: { opacity: 0, scale: 0.25, rotate: -18, filter: "blur(14px)" },
    visible: { opacity: 1, scale: 1, rotate: 0, filter: "blur(0px)" },
  },
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.85, y: 16 },
    visible: { opacity: 1, scale: 1, y: 0 },
  },
};

const EXIT_VARIANTS: Record<AiAssistantSettings["closingAnimation"], Variants> = {
  teleport: { exit: { opacity: 0, scaleY: 1.35, scaleX: 0.55, filter: "blur(18px)", y: -24 } },
  fade: { exit: { opacity: 0 } },
  scale: { exit: { opacity: 0, scale: 0.85, y: 16 } },
};

export function AIFloatingButton({ initialSettings }: { initialSettings?: AiAssistantSettings }) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const [awake, setAwake] = React.useState(false);
  const [settings, setSettings] = React.useState<AiAssistantSettings>(
    initialSettings ?? DEFAULT_AI_ASSISTANT_SETTINGS
  );

  React.useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("ai-assistant-settings-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ai_assistant_settings" },
        (payload) => {
          const row = (payload.new ?? payload.old) as Partial<AiAssistantSettingsRow> | null;
          if (!row || Object.keys(row).length === 0) return;
          setSettings((prev) => mapAiAssistantSettingsRow(row, prev));
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  React.useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  const particles = React.useMemo(() => {
    if (!settings.particleEnabled) return [];
    const count = Math.min(settings.particleCount, 24);
    // Deterministic pseudo-randomness (pure fn of the index) instead of
    // Math.random, so this stays a valid render-time computation.
    const rand = (seed: number) => {
      const x = Math.sin(seed * 999.9) * 10000;
      return x - Math.floor(x);
    };
    return Array.from({ length: count }, (_, i) => ({
      key: i,
      left: `${10 + rand(i + 1) * 80}%`,
      dx: `${(rand(i + 11) - 0.5) * 40}px`,
      duration: `${(2.4 + rand(i + 21) * 2) / settings.animationSpeed}s`,
      delay: `${rand(i + 31) * 3}s`,
    }));
  }, [settings.particleEnabled, settings.particleCount, settings.animationSpeed]);

  // The /ai route already renders the full panel; avoid a redundant floating trigger there.
  if (pathname?.startsWith("/ai")) return null;

  const cssVars = {
    "--ai-glow": settings.glowColor,
    "--ai-border": settings.borderColor,
    "--ai-speed": settings.animationSpeed,
  } as React.CSSProperties;

  const openVariants = PANEL_VARIANTS[settings.openingAnimation];
  const exitVariants = EXIT_VARIANTS[settings.closingAnimation];

  return (
    <>
      <div
        className="fixed right-4 z-30 lg:right-6"
        style={{ bottom: `calc(6rem + ${settings.floatingHeightPx}px)`, ...cssVars }}
      >
        <div className="relative" style={{ width: settings.sizePx, height: settings.sizePx }}>
          {settings.bloomEnabled && <span aria-hidden className="ai-orb-bloom" />}
          {settings.haloEnabled && <span aria-hidden className="ai-orb-halo" />}
          {particles.map((p) => (
            <span
              key={p.key}
              aria-hidden
              className="ai-particle"
              style={
                {
                  left: p.left,
                  animationDuration: p.duration,
                  animationDelay: p.delay,
                  "--ai-particle-x": p.dx,
                } as React.CSSProperties
              }
            />
          ))}
          <button
            onClick={() => setOpen(true)}
            onMouseEnter={() => setAwake(true)}
            onMouseLeave={() => setAwake(false)}
            onFocus={() => setAwake(true)}
            onBlur={() => setAwake(false)}
            aria-label={`${settings.assistantName} bilan suhbat`}
            className={`relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-gradient-blue text-white shadow-[0_14px_34px_rgba(0,151,190,0.4)] ring-2 transition-all duration-300 hover:scale-105 active:scale-95 ${
              settings.glowEnabled ? "" : "ring-transparent"
            } ${settings.pulseEnabled ? "ai-orb-pulse" : ""}`}
            style={{
              boxShadow: settings.glowEnabled
                ? `0 14px 34px rgba(0,151,190,0.4), 0 0 ${awake ? 28 : 16}px ${settings.glowColor}66`
                : undefined,
              ["--tw-ring-color" as string]: settings.borderColor,
            }}
          >
            <JaxongirAiMedia
              avatarKind={settings.avatarKind}
              avatarImageUrl={settings.avatarImageUrl}
              avatarVideoUrl={settings.avatarVideoUrl}
              breathing={!awake}
              className="rounded-full"
            />
          </button>
        </div>
      </div>

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {open && (
              <div className="fixed inset-0 z-[100]">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-navy/40 backdrop-blur-sm"
                  onClick={() => setOpen(false)}
                  aria-hidden
                />
                <motion.div
                  role="dialog"
                  aria-modal="true"
                  aria-label={settings.assistantName}
                  variants={{ ...openVariants, ...exitVariants }}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.5 / settings.animationSpeed, ease: [0.16, 1, 0.3, 1] }}
                  style={{ transformOrigin: "bottom right" }}
                  className="absolute right-0 top-0 h-full w-full max-w-md overflow-hidden bg-paper shadow-card-hover lg:right-6 lg:top-auto lg:bottom-6 lg:h-[calc(100%-3rem)] lg:max-h-[42rem] lg:rounded-[1.5rem]"
                >
                  <button
                    onClick={() => setOpen(false)}
                    aria-label="Yopish"
                    className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25"
                  >
                    <X className="h-4 w-4" aria-hidden />
                  </button>
                  <AIChatPanel
                    compact
                    assistantName={settings.assistantName}
                    greeting={settings.greeting}
                    quickQuestions={settings.quickQuestions}
                    voiceEnabled={settings.voiceEnabled}
                    avatarKind={settings.avatarKind}
                    avatarImageUrl={settings.avatarImageUrl}
                    avatarVideoUrl={settings.avatarVideoUrl}
                  />
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
