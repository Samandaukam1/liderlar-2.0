/**
 * BIOGRAFIK SAHIFA BARI — SOF QOIDALAR.
 *
 * Bu fayl HECH NARSA import qilmaydi: testlar `@/` taxallusini yecha olmaydi.
 * Oq ro'yxatlar admin panelidagi `src/lib/elonlar/types.ts` bilan AYNAN bir
 * xil bo'lishi shart — `tests/profile-highlight.test.ts` ikkalasini
 * solishtiradi. Bittasida yangi animatsiya qo'shilib, ikkinchisida
 * unutilsa, sayt uni jimgina standartga tushirardi.
 *
 * NOMLASH: ommaviy URL, CSS klass, DOM atributlarida "ads/reklama/banner/
 * promo" so'zlari yo'q — reklama bloklovchilar ularni yashiradi. Shuning
 * uchun funksiya nomi "profile highlight", CSS prefiksi `phb-`.
 */

export const BAR_THEMES = ["glass-light", "glass-dark", "brand-gradient", "custom"] as const;
export const BAR_ENTRANCES = ["drop", "drop-bounce", "fade-down", "unfold"] as const;
export const BAR_ATTENTIONS = ["none", "shimmer", "pulse", "float", "marquee"] as const;
export const BAR_LOGO_POSITIONS = ["left", "right"] as const;
export const BAR_ROTATIONS = ["sequential", "cycle", "random"] as const;

export type HighlightTheme = (typeof BAR_THEMES)[number];
export type HighlightEntrance = (typeof BAR_ENTRANCES)[number];
export type HighlightAttention = (typeof BAR_ATTENTIONS)[number];
export type HighlightLogoPosition = (typeof BAR_LOGO_POSITIONS)[number];
export type HighlightRotation = (typeof BAR_ROTATIONS)[number];

export interface HighlightStyle {
  theme: HighlightTheme;
  entrance: HighlightEntrance;
  attention: HighlightAttention;
  logoPosition: HighlightLogoPosition;
  bg: string | null;
  fg: string | null;
  accent: string | null;
}

export const DEFAULT_HIGHLIGHT_STYLE: HighlightStyle = {
  theme: "glass-light",
  entrance: "drop",
  attention: "shimmer",
  logoPosition: "left",
  bg: null,
  fg: null,
  accent: null,
};

export interface HighlightAd {
  id: string;
  kind: "text" | "image";
  text: string | null;
  url: string;
  buttonLabel: string | null;
  logoUrl: string | null;
  imageUrl: string | null;
  imageWidth: number | null;
  imageHeight: number | null;
  style: HighlightStyle;
  closeOpensLink: boolean;
  startsAt: string | null;
  endsAt: string | null;
  sortOrder: number;
}

export interface HighlightSettings {
  rotation: HighlightRotation;
  appearDelayMs: number;
  cycleSeconds: number;
  dismissHours: number;
  hideOnScroll: boolean;
}

export const DEFAULT_HIGHLIGHT_SETTINGS: HighlightSettings = {
  rotation: "sequential",
  appearDelayMs: 1200,
  cycleSeconds: 8,
  dismissHours: 12,
  hideOnScroll: true,
};

/** Bazadagi `ads` dan o'qiladigan ustunlar. */
export const HIGHLIGHT_AD_COLUMNS =
  "id, kind, text, url, button_label, logo_url, image_url, image_width, image_height, style, " +
  "close_opens_link, starts_at, ends_at, sort_order";

export const HIGHLIGHT_SETTINGS_COLUMNS =
  "profile_bar_rotation, profile_bar_appear_delay_ms, profile_bar_cycle_seconds, " +
  "profile_bar_dismiss_hours, profile_bar_hide_on_scroll";

const HEX = /^#[0-9a-fA-F]{6}$/;

function pick<T extends string>(allowed: readonly T[], value: unknown, fallback: T): T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

function hex(value: unknown): string | null {
  return typeof value === "string" && HEX.test(value) ? value.toLowerCase() : null;
}

/** Faqat http(s) havola — `javascript:` va boshqalar sahifaga tushmaydi. */
export function isSafeHttpUrl(value: unknown): value is string {
  if (typeof value !== "string" || /\s/.test(value)) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function parseStyle(value: unknown): HighlightStyle {
  const raw = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const theme = pick(BAR_THEMES, raw.theme, DEFAULT_HIGHLIGHT_STYLE.theme);
  return {
    theme,
    entrance: pick(BAR_ENTRANCES, raw.entrance, DEFAULT_HIGHLIGHT_STYLE.entrance),
    attention: pick(BAR_ATTENTIONS, raw.attention, DEFAULT_HIGHLIGHT_STYLE.attention),
    logoPosition: pick(BAR_LOGO_POSITIONS, raw.logoPosition, DEFAULT_HIGHLIGHT_STYLE.logoPosition),
    bg: theme === "custom" ? hex(raw.bg) : null,
    fg: theme === "custom" ? hex(raw.fg) : null,
    accent: theme === "custom" ? hex(raw.accent) : null,
  };
}

function positive(value: unknown): number | null {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
}

/**
 * Bazadagi qator -> bar. Chala yoki xavfli qator (havola http(s) emas,
 * matnli turda matn yo'q, rasmli turda rasm yo'q) `null` — ko'rsatilmaydi.
 */
export function mapHighlightAdRow(row: Record<string, unknown> | null | undefined): HighlightAd | null {
  if (!row || typeof row.id !== "string") return null;
  if (!isSafeHttpUrl(row.url)) return null;
  const kind = row.kind === "image" ? "image" : row.kind === "text" ? "text" : null;
  if (!kind) return null;
  const text = typeof row.text === "string" && row.text.trim() ? row.text.trim() : null;
  const imageUrl = isSafeHttpUrl(row.image_url) ? row.image_url : null;
  if (kind === "text" && !text) return null;
  if (kind === "image" && !imageUrl) return null;
  const buttonLabel = typeof row.button_label === "string" && row.button_label.trim() ? row.button_label.trim() : null;
  return {
    id: row.id,
    kind,
    text,
    url: row.url,
    buttonLabel: kind === "text" ? buttonLabel : null,
    logoUrl: kind === "text" && isSafeHttpUrl(row.logo_url) ? row.logo_url : null,
    imageUrl: kind === "image" ? imageUrl : null,
    imageWidth: positive(row.image_width),
    imageHeight: positive(row.image_height),
    style: parseStyle(row.style),
    closeOpensLink: row.close_opens_link !== false,
    startsAt: typeof row.starts_at === "string" ? row.starts_at : null,
    endsAt: typeof row.ends_at === "string" ? row.ends_at : null,
    sortOrder: positive(row.sort_order) ?? 0,
  };
}

function clamp(value: unknown, min: number, max: number, fallback: number): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}

export function mapHighlightSettingsRow(row: Record<string, unknown> | null | undefined): HighlightSettings {
  if (!row) return DEFAULT_HIGHLIGHT_SETTINGS;
  const d = DEFAULT_HIGHLIGHT_SETTINGS;
  return {
    rotation: pick(BAR_ROTATIONS, row.profile_bar_rotation, d.rotation),
    appearDelayMs: clamp(row.profile_bar_appear_delay_ms, 0, 30_000, d.appearDelayMs),
    cycleSeconds: clamp(row.profile_bar_cycle_seconds, 3, 120, d.cycleSeconds),
    dismissHours: clamp(row.profile_bar_dismiss_hours, 1, 720, d.dismissHours),
    hideOnScroll: row.profile_bar_hide_on_scroll !== false,
  };
}

/** Muddat ichidami (kesh 2 daqiqa eskirishi mumkin — brauzer ham tekshiradi). */
export function isLive(ad: Pick<HighlightAd, "startsAt" | "endsAt">, now: number): boolean {
  if (ad.startsAt && Date.parse(ad.startsAt) > now) return false;
  if (ad.endsAt && Date.parse(ad.endsAt) <= now) return false;
  return true;
}

/** Yopilganiga `dismissHours` bo'lmagan reklamalar chiqmaydi. */
export function eligibleAds(
  ads: readonly HighlightAd[],
  closedAt: Readonly<Record<string, number>>,
  dismissHours: number,
  now: number,
): HighlightAd[] {
  const windowMs = dismissHours * 3_600_000;
  return ads.filter((ad) => {
    if (!isLive(ad, now)) return false;
    const closed = closedAt[ad.id];
    return !(typeof closed === "number" && Number.isFinite(closed) && now - closed < windowMs);
  });
}

/** Qaysi reklama ko'rsatiladi. `random01` — [0, 1). */
export function pickIndex(mode: HighlightRotation, cursor: number, count: number, random01: number): number {
  if (count <= 0) return -1;
  if (mode === "random") return Math.min(count - 1, Math.floor(random01 * count));
  const safe = Number.isFinite(cursor) && cursor >= 0 ? Math.floor(cursor) : 0;
  return safe % count;
}

export function nextCursor(cursor: number, count: number): number {
  if (count <= 0) return 0;
  const safe = Number.isFinite(cursor) && cursor >= 0 ? Math.floor(cursor) : 0;
  return (safe + 1) % (count * 1000);
}

/**
 * X tugmasi (egasining talabi): birinchi bosish havolani ochadi va "qurollanadi",
 * ikkinchisi yopadi. `closeOpensLink` o'chirilgan bo'lsa birinchisidayoq yopadi.
 */
export type XState = "idle" | "armed" | "closed";

export function nextXState(state: XState, closeOpensLink: boolean): XState {
  if (state === "idle") return closeOpensLink ? "armed" : "closed";
  return "closed";
}

/** Rasmli bar balandligi: nisbat saqlanadi, lekin chegaradan chiqmaydi. */
export function imageFrameHeight(
  frameWidth: number,
  imageWidth: number | null,
  imageHeight: number | null,
  bounds: { min: number; max: number },
): number {
  if (!imageWidth || !imageHeight || frameWidth <= 0) return Math.min(bounds.max, Math.max(bounds.min, 80));
  const natural = Math.round((frameWidth * imageHeight) / imageWidth);
  return Math.min(bounds.max, Math.max(bounds.min, natural));
}

/** Maxsus rang ustidagi tugma matni: och fonga to'q, to'q fonga oq (WCAG yorqinlik). */
export function readableOn(hexColor: string | null): string {
  const match = hexColor ? /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hexColor) : null;
  if (!match) return "#062741";
  const [r, g, b] = [match[1], match[2], match[3]].map((part) => parseInt(part, 16) / 255);
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const luminance = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  return luminance > 0.45 ? "#062741" : "#ffffff";
}
