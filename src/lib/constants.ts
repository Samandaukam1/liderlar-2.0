export const SITE_NAME = "Liderlar.uz";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
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
