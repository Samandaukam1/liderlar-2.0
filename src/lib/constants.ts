export const SITE_NAME = "Liderlar.uz";

/**
 * Production canonical public origin — the single place this domain is written
 * down. Canonical metadata, OpenGraph, the sitemap, structured data, QR codes
 * and share links all resolve through SITE_URL, so a deployment whose
 * NEXT_PUBLIC_SITE_URL is unset must still name the real site rather than
 * localhost or the Vercel deployment URL.
 */
export const CANONICAL_SITE_URL = "https://liderlar.uz";

/**
 * A Vercel deployment URL is infrastructure, not the site's public address: a
 * preview or production `*.vercel.app` host left in NEXT_PUBLIC_SITE_URL would
 * otherwise end up in canonical tags, OpenGraph, the sitemap, structured data,
 * QR codes and every share link. localhost still passes through — resolveSiteUrl
 * derives the real origin from the request in that case.
 */
function publicOrigin(raw: string | undefined): string {
  const value = (raw ?? "").trim().replace(/\/+$/, "");
  if (!value) return CANONICAL_SITE_URL;
  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  try {
    const url = new URL(withProtocol);
    if (/\.vercel\.app$/i.test(url.hostname)) return CANONICAL_SITE_URL;
    return `${url.origin}${url.pathname.replace(/\/+$/, "")}`.replace(/\/+$/, "");
  } catch {
    return CANONICAL_SITE_URL;
  }
}

export const SITE_URL = publicOrigin(process.env.NEXT_PUBLIC_SITE_URL);
export const ADMIN_URL = process.env.NEXT_PUBLIC_ADMIN_URL ?? "http://localhost:3001";

export type NavItem = {
  label: string;
  href: string;
};

export const PRIMARY_NAV: NavItem[] = [
  { label: "Bosh sahifa", href: "/" },
  { label: "Liderlar", href: "/liderlar" },
  { label: "Reyting", href: "/reyting" },
  { label: "Yo'nalishlar", href: "/yonalishlar" },
  { label: "Podcastlar", href: "/podcastlar" },
  { label: "Liderlar Online", href: "/jurnal" },
  { label: "Iqtiboslar", href: "/iqtiboslar" },
  { label: "TOP 100", href: "/top-100" },
];

export const MORE_NAV: NavItem[] = [
  { label: "Loyiha haqida", href: "/loyiha-haqida" },
  { label: "Ariza topshirish", href: "/ariza" },
  { label: "Ommaviy oferta", href: "/ommaviy_ofertasi" },
  { label: "Maxfiylik siyosati", href: "/maxfiylik-siyosati" },
  { label: "Foydalanish shartlari", href: "/foydalanish-shartlari" },
];

export const MOBILE_PRIMARY_NAV: NavItem[] = [
  { label: "Bosh sahifa", href: "/" },
  { label: "Liderlar", href: "/liderlar" },
  { label: "Reyting", href: "/reyting" },
  { label: "Podcastlar", href: "/podcastlar" },
  { label: "Ko'proq", href: "/qidiruv" },
];

export const RANKING_CATEGORY_LABELS: Record<string, string> = {
  overall: "Umumiy reyting",
  achievements: "Yutuqlar bo'yicha",
  monthly_activity: "Oylik faollik bo'yicha",
  active_leadership: "Faol liderlik bo'yicha",
};

export const GRADIENT_CLASSES = [
  "bg-gradient-blue",
  "bg-gradient-peach",
  "bg-gradient-violet",
  "bg-gradient-mint",
  "bg-gradient-coral",
] as const;

export const AI_DAILY_MESSAGE_LIMIT_DEFAULT = 40;
export const MONTHLY_UPDATE_TOKEN_TTL_DAYS = 30;
