import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import {
  Award,
  BadgeCheck,
  CalendarDays,
  Eye,
  FileText,
  Globe,
  GraduationCap,
  MapPin,
  Star,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { readingMinutes, toParagraphs } from "@/components/ui/article-body";
import { formatDateUz, formatNumber, rankDelta } from "@/lib/utils";
import { isVerified, range, safeUrl, toTimeline, trustLabel, year, type TimelineItem } from "@/lib/themes/shape";
import {
  chapterNumber,
  monogram,
  RANKING_SCORE_UNIT,
  rankingView,
  scoreText,
  splitName,
  withoutPortrait,
} from "@/lib/themes/profile-compose";
import type { ThemeExtras, ThemeProfile, ThemeProps } from "@/lib/themes/types";
import { AuMotion, AuPortrait, AuPromo, AuShare } from "./client";
import { auDisplay, auSans } from "./fonts";
import { auroraGlassCss } from "./styles";

/**
 * AURORA GLASS — kelajak yetakchiligi, texnologiya.
 *
 * Toza oq-sadaf fon, juda yumshoq aurora (osmon ko'ki, lavanda, pushti,
 * shaftoli, moviy) va suyuq shisha qatlamlar. Hammasi havodor va shaffof;
 * matn esa to'q ko'k — o'qilishi birinchi o'rinda.
 *
 * KOMPOZITSIYA:
 *
 *   - HERO: chapda katta ism (familiya aurora gradientda), markazda
 *     katta fonsiz portret, uning ortida va atrofida egilgan shisha
 *     panellar; o'ngda va portret yonida suzuvchi haqiqiy ma'lumot
 *     kartalari. Portret shisha qatlamlar ustiga chiqadi — chuqurlik.
 *   - Bitta shaffof statistika chizig'i — faqat haqiqiy raqamlar.
 *   - Bo'limlar har xil: tahririyat matni, shaffof vaqt paneli,
 *     suzuvchi yutuqlar, pastel surat kartalari, toza raqamlash.
 *
 * Komponent hech qanday so'rov qilmaydi (§11, §49): hammasi `profile` va
 * sahifa yuklagan `extras` dan. Soxta ma'lumot yo'q — bo'sh blok umuman
 * chizilmaydi.
 */

/* PALITRA — dizayn o'z ranglarini o'zi tashiydi. */
const PEARL = "#f7f8fc";
const INK = "#151a33";
const SKY = "#7cc4ff";
const LAVENDER = "#a99bff";
const PINK = "#ff9fcb";
const PEACH = "#ffbf98";

type Vars = CSSProperties & Record<`--${string}`, string | number>;

export default function AuroraGlassTheme({ profile, extras }: ThemeProps) {
  const quotes = (profile.quotes ?? [])
    .map((quote) => ({ id: String(quote.id), text: String(quote.text ?? "").trim() }))
    .filter((quote) => quote.text);
  const scenes = scenePool(profile, extras);
  const sections = buildSections(profile, extras, quotes.slice(2));

  return (
    <div data-au-root className={`au ${auDisplay.variable} ${auSans.variable}`}>
      <style
        dangerouslySetInnerHTML={{
          __html: auroraGlassCss({ pearl: PEARL, ink: INK, sky: SKY, lavender: LAVENDER, pink: PINK, peach: PEACH }),
        }}
      />
      <Defs />
      <AuMotion />

      {/* Aurora — butun dizayn ortida, sekin oqadi. Dizayn chegarasidan chiqmaydi. */}
      <div className="au-sky" aria-hidden>
        <div className="au-sky__inner">
          <i className="au-blob au-blob--a" />
          <i className="au-blob au-blob--b" />
          <i className="au-blob au-blob--c" />
          <i className="au-blob au-blob--d" />
        </div>
      </div>

      <Hero profile={profile} extras={extras} scenes={scenes} quote={quotes[0]?.text ?? null} />
      <Stats profile={profile} extras={extras} />

      {sections.map((section, index) => (
        <Section key={section.id} section={section} index={index} next={sections.slice(index + 1, index + 3)} scenes={scenes} />
      ))}

      {quotes[1] && <Interlude text={quotes[1].text} name={profile.full_name} />}
      <Outro profile={profile} />
    </div>
  );
}

/* ========================================================================= *
 * SUYUQ SHISHA LINZASI — Royal Navy bilan bir xil texnika, o'z nusxasi
 * ========================================================================= */

/**
 * Siljish xaritasi: markaz NEYTRAL (0.5), chetlarda esa ichkariga tortadi.
 *
 * `feDisplacementMap` har pikselni xaritadagi rang qadar suradi. Chetda
 * nur ichkaridan olinadi — fon shisha qirrasida egilib, linza kabi
 * "yig'iladi". Bu faqat ORTDAGI fonga ta'sir qiladi: panel ichidagi matn
 * hech qachon buzilmaydi. Qizil kanal — gorizontal, yashil — vertikal;
 * ikkalasi alohida rasm va filtr ichida qo'shiladi.
 *
 * `ramp` — chetdagi egilish zonasi, element o'lchamiga nisbatan.
 */
function rampMap(channel: "r" | "g", ramp: number): string {
  const c = (v: number) => {
    const hex = Math.round(v).toString(16).padStart(2, "0");
    return channel === "r" ? `#${hex}0000` : `#00${hex}00`;
  };
  const [x2, y2] = channel === "r" ? [1, 0] : [0, 1];
  const stops = [
    [0, 255],
    [ramp * 0.3, 205],
    [ramp * 0.65, 156],
    [ramp, 128],
    [1 - ramp, 128],
    [1 - ramp * 0.65, 100],
    [1 - ramp * 0.3, 51],
    [1, 0],
  ]
    .map(([offset, value]) => `<stop offset='${offset.toFixed(3)}' stop-color='${c(value)}'/>`)
    .join("");
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100' preserveAspectRatio='none'>` +
    `<linearGradient id='m' x1='0' y1='0' x2='${x2}' y2='${y2}'>${stops}</linearGradient>` +
    `<rect width='100' height='100' fill='url(#m)'/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const LENSES = [
  /* Plitkalar: ikki yo'nalishda bir xil egilish. */
  { id: "au-lens", x: rampMap("r", 0.1), y: rampMap("g", 0.14), scale: 40 },
  /* Keng va past panellar (dok, yakun): gorizontal zona tor, vertikal keng. */
  { id: "au-lens-wide", x: rampMap("r", 0.035), y: rampMap("g", 0.3), scale: 30 },
];

/** Linza filtrlari — butun dizayn uchun BITTA yashirin `<svg>` da. */
function Defs() {
  return (
    <svg className="au-defs" aria-hidden focusable="false">
      {LENSES.map((lens) => (
        <filter
          key={lens.id}
          id={lens.id}
          x="0"
          y="0"
          width="1"
          height="1"
          filterUnits="objectBoundingBox"
          colorInterpolationFilters="sRGB"
        >
          <feImage href={lens.x} preserveAspectRatio="none" result="mx" />
          <feImage href={lens.y} preserveAspectRatio="none" result="my" />
          <feComposite in="mx" in2="my" operator="arithmetic" k2="1" k3="1" result="map" />
          <feDisplacementMap in="SourceGraphic" in2="map" scale={lens.scale} xChannelSelector="R" yChannelSelector="G" />
        </filter>
      ))}
    </svg>
  );
}

/* ========================================================================= *
 * SURATLAR
 * ========================================================================= */

function optimizable(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" &&
      (parsed.hostname.endsWith(".supabase.co") || parsed.hostname === "static.tildacdn.com")
      ? url
      : null;
  } catch {
    return null;
  }
}

/**
 * Portret ORTIDAGI va kartalardagi suratlar — nomzodning BOSHQA suratlari
 * (galereya, maqolalar). Profil rasmi takrorlanmaydi; bo'lmasa — faqat
 * shisha va aurora.
 */
function scenePool(profile: ThemeProfile, extras: ThemeExtras | undefined): string[] {
  const all = [
    ...withoutPortrait(profile.media ?? [], profile.avatar_url).map((item) => String(item.url)),
    ...(profile.memberArticles ?? []).map((m) => m.heroUrl),
    ...(extras?.journalArticles ?? []).map((a) => a.cover_url as string | null),
  ]
    .map((url) => optimizable(url))
    .filter((url): url is string => Boolean(url));
  return Array.from(new Set(all));
}

function served(src: string, width = 1080): string {
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=75`;
}

/* ========================================================================= *
 * HERO
 * ========================================================================= */

function Hero({
  profile,
  extras,
  scenes,
  quote,
}: {
  profile: ThemeProfile;
  extras: ThemeExtras | undefined;
  scenes: string[];
  quote: string | null;
}) {
  const name = splitName(profile.full_name);
  const [family = "", given = ""] = name.primary;
  const first = given || family;
  const last = given ? family : "";
  const roles = (profile.description_items ?? []).slice(0, 3);
  const cutout = extras?.portraitCutout ?? null;
  const links = socialLinks(profile);
  const place = profile.current_location ?? profile.region?.name ?? null;
  const education = toTimeline(profile.education ?? [])[0]?.title || profile.education_summary;
  const languages = (profile.languages ?? []).join(", ");
  const allCards: { key: string; icon: LucideIcon; value: string | null; label: string }[] = [
    { key: "edu", icon: GraduationCap, value: education, label: "Ta’lim" },
    { key: "born", icon: CalendarDays, value: profile.birth_year_display, label: "Tug‘ilgan yili" },
    { key: "lang", icon: Globe, value: languages, label: "Tillar" },
    { key: "place", icon: MapPin, value: place, label: "Hudud" },
  ];
  const cards = allCards.filter((card): card is { key: string; icon: LucideIcon; value: string; label: string } => Boolean(card.value?.trim()));
  const hasStory = profile.sections.length > 0 || profile.articles.length > 0;

  return (
    <header className="au-hero" aria-label={profile.full_name}>
      <div className="au-stage">
        <div className="au-intro">
          {roles.length > 0 && (
            <ul className="au-micro" aria-label="Faoliyati">
              {roles.map((role) => (
                <li key={role}>{role}</li>
              ))}
            </ul>
          )}
          <h1 className="au-name" style={{ "--au-w": Math.max(3, nameEm(first), nameEm(last)).toFixed(3) } as Vars}>
            <span className="au-name__line">
              <span>{first}</span>
            </span>
            {last && (
              <span className="au-name__line au-name__line--aurora">
                <span>{last}</span>
              </span>
            )}
            {name.secondary && <span className="au-sr"> {name.secondary}</span>}
          </h1>
        </div>

        {/* -------------------------------------------- SHISHA SAHNA + PORTRET */}
        <div className="au-visual">
          <span className="au-pane au-pane--a au-lens" aria-hidden />
          <span
            className={`au-pane au-pane--b au-lens${scenes[0] ? " au-pane--photo" : ""}`}
            style={scenes[0] ? ({ "--au-scene": `url("${served(scenes[0])}")` } as Vars) : undefined}
            aria-hidden
          />
          <span className="au-pane au-pane--c au-lens" aria-hidden />
          <span className="au-orb" aria-hidden />

          <div className="au-figure">
            {cutout ? (
              <AuPortrait cutout={cutout} avatar={profile.avatar_url} alt={profile.full_name} />
            ) : profile.avatar_url ? (
              <div className="au-photo">
                <Image src={profile.avatar_url} alt={profile.full_name} fill preload sizes="(min-width: 900px) 560px, 88vw" />
              </div>
            ) : (
              <span className="au-mono" aria-hidden>
                {monogram(profile.full_name)}
              </span>
            )}
          </div>
        </div>

        {cards.length > 0 && (
          <ul className="au-cards" aria-label="Ma’lumot">
            {cards.map((card, index) => (
              <li key={card.key} className="au-float au-glass au-lens" style={{ "--i": index } as Vars}>
                <IconBox icon={card.icon} />
                <p>
                  <span className="au-float__value" title={card.value}>
                    {card.value}
                  </span>
                  <small>{card.label}</small>
                </p>
              </li>
            ))}
          </ul>
        )}

        <div className="au-notes">
          {quote && (
            <blockquote className="au-quote">
              <span aria-hidden>“</span>
              {quote}
            </blockquote>
          )}
          {links.length > 0 && <Socials links={links} />}
          <div className="au-actions">
            {hasStory && (
              <a href="#biografiya" className="au-btn au-btn--aurora">
                Biografiya
                <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                  <path d="M7 1.5v11M2.5 8L7 12.5 11.5 8" />
                </svg>
              </a>
            )}
            <AuShare name={profile.full_name} />
          </div>
          {extras?.promoCode && <AuPromo code={extras.promoCode} />}
        </div>
      </div>
    </header>
  );
}

/* ------------------------------------------------- ISM O'LCHAMI */

/*
 * Sora 800 harflarining kengligi (em × 1000), brauzerda o'lchangan.
 * Ism konteynerga ANIQ sig'adigan eng katta o'lchamda chiziladi: keng
 * "Muhammadyusuf" ham chetga chiqmaydi, ixcham ism ham keraksiz kichik
 * qolmaydi. Jadvalda yo'q belgi (kirill va h.k.) keng deb olinadi.
 */
const SORA_UPPER = [790, 696, 802, 778, 592, 560, 833, 798, 338, 644, 777, 562, 988, 885, 864, 676, 864, 740, 659, 626, 771, 750, 1080, 730, 658, 645];
const SORA_LOWER = [600, 708, 613, 708, 628, 383, 690, 656, 342, 346, 661, 324, 988, 656, 682, 708, 708, 424, 562, 436, 650, 609, 946, 614, 577, 506];
const SORA_MARKS: Record<string, number> = { "'": 270, "‘": 278, "’": 278, "ʻ": 234, "ʼ": 250, "`": 300, "-": 510, ".": 276, " ": 204 };
/** `.au-name` dagi letter-spacing bilan bir xil. */
const NAME_TRACKING = -0.04;

function nameEm(text: string): number {
  let width = 0;
  for (const char of text) {
    const code = char.charCodeAt(0);
    const glyph =
      code >= 65 && code <= 90 ? SORA_UPPER[code - 65] : code >= 97 && code <= 122 ? SORA_LOWER[code - 97] : (SORA_MARKS[char] ?? 720);
    width += glyph / 1000 + NAME_TRACKING;
  }
  return width;
}

/* ------------------------------------------------- IKONKALAR */

function IconBox({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className="au-icon" aria-hidden>
      <Icon strokeWidth={1.8} />
    </span>
  );
}

/* ========================================================================= *
 * IJTIMOIY TARMOQLAR — o'z brend rangida
 * ========================================================================= */

type Brand = "telegram" | "instagram" | "youtube" | "linkedin" | "facebook" | "x" | "tiktok" | "web";

interface Social {
  id: string;
  url: string;
  title: string;
  brand: Brand;
}

function brandOf(url: string): Brand {
  let host = "";
  try {
    host = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "web";
  }
  if (host === "t.me" || host.endsWith("telegram.org") || host.endsWith("telegram.me")) return "telegram";
  if (host.endsWith("instagram.com")) return "instagram";
  if (host.endsWith("youtube.com") || host === "youtu.be") return "youtube";
  if (host.endsWith("linkedin.com")) return "linkedin";
  if (host.endsWith("facebook.com") || host === "fb.com") return "facebook";
  if (host === "x.com" || host.endsWith("twitter.com")) return "x";
  if (host.endsWith("tiktok.com")) return "tiktok";
  return "web";
}

function socialLinks(profile: ThemeProfile): Social[] {
  return (profile.socialLinks ?? [])
    .map((link) => {
      const url = safeUrl(String(link.url ?? ""));
      return url ? { id: String(link.id), url, title: String(link.title ?? "Havola"), brand: brandOf(url) } : null;
    })
    .filter((link): link is Social => link !== null);
}

const BRAND_GLYPH: Record<Brand, ReactNode> = {
  telegram: <path d="M4.2 11.6l14.6-5.7c.7-.3 1.3.2 1.1 1l-2.5 11.7c-.2.8-.7 1-1.4.6l-3.8-2.8-1.8 1.8c-.2.2-.4.3-.8.3l.3-3.9 7-6.4c.3-.3-.1-.4-.5-.2l-8.7 5.5-3.7-1.2c-.8-.2-.8-.8.2-1.2z" fill="currentColor" />,
  instagram: (
    <g fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="4.5" y="4.5" width="15" height="15" rx="4.5" />
      <circle cx="12" cy="12" r="3.6" />
      <circle cx="16.6" cy="7.4" r=".6" fill="currentColor" stroke="none" />
    </g>
  ),
  youtube: <path d="M9.3 7.6v8.8l7.6-4.4z" fill="currentColor" />,
  linkedin: (
    <g fill="currentColor">
      <rect x="5" y="9.5" width="3" height="9" />
      <circle cx="6.5" cy="6.4" r="1.7" />
      <path d="M10.5 9.5h2.9v1.3c.5-.9 1.6-1.5 3-1.5 2.4 0 3.1 1.5 3.1 3.9v5.3h-3v-4.6c0-1.2-.3-2-1.4-2-1.2 0-1.6.9-1.6 2.1v4.5h-3z" />
    </g>
  ),
  facebook: <path d="M13.2 20v-6.6h2.2l.4-2.6h-2.6V9.2c0-.8.3-1.3 1.4-1.3h1.3V5.6c-.3 0-1-.1-1.9-.1-2 0-3.3 1.2-3.3 3.4v1.9H8.5v2.6h2.2V20z" fill="currentColor" />,
  x: <path d="M5 5h3.6l3.6 5 4.2-5H18l-5 6 5.6 8H15l-3.9-5.4L6.6 19H5l5.4-6.4z" fill="currentColor" />,
  tiktok: <path d="M14.5 4c.3 2 1.6 3.4 3.5 3.6v2.6c-1.3 0-2.5-.4-3.5-1.1v5.5a4.6 4.6 0 11-4.6-4.6h.5v2.7a2 2 0 102 1.9V4z" fill="currentColor" />,
  web: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="7.5" />
      <path d="M4.5 12h15M12 4.5c2.2 2.1 3.3 4.6 3.3 7.5s-1.1 5.4-3.3 7.5c-2.2-2.1-3.3-4.6-3.3-7.5s1.1-5.4 3.3-7.5z" />
    </g>
  ),
};

function Socials({ links }: { links: Social[] }) {
  return (
    <ul className="au-social" aria-label="Ijtimoiy tarmoqlar">
      {links.slice(0, 6).map((link) => (
        <li key={link.id}>
          {/* Foydalanuvchi kiritgan havola: SEO vazni berilmaydi. */}
          <a href={link.url} target="_blank" rel="noopener noreferrer nofollow" className={`au-brand au-brand--${link.brand}`} aria-label={link.title}>
            <svg viewBox="0 0 24 24" aria-hidden focusable="false">
              {BRAND_GLYPH[link.brand]}
            </svg>
          </a>
        </li>
      ))}
    </ul>
  );
}

/* ========================================================================= *
 * STATISTIKA — bitta shaffof chiziq, faqat haqiqiy raqamlar
 * ========================================================================= */

function compact(value: number): string {
  return value >= 10000
    ? new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value)
    : formatNumber(value);
}

function Stats({ profile, extras }: { profile: ThemeProfile; extras: ThemeExtras | undefined }) {
  const ranking = rankingView(profile.position, profile.total_score, profile.ranking.hasRow);
  const delta = ranking.kind === "position" ? rankDelta(profile.position, profile.previous_position) : 0;
  const articles = (profile.memberArticles ?? []).length + (extras?.journalArticles ?? []).length;
  const achievements = (profile.achievements ?? []).length;
  const certificates = (profile.certificates ?? []).length;

  const items: { key: string; tint: string; icon: LucideIcon; value: ReactNode; label: ReactNode }[] = [
    {
      key: "rank",
      tint: "lavender",
      icon: Trophy,
      value: ranking.kind === "position" ? `#${ranking.value}` : <span className="au-stat__soft">{ranking.kind === "pending" ? "Hisoblanmoqda" : "Shakllanmoqda"}</span>,
      label: (
        <>
          Umumiy reytingda
          {delta !== 0 && <em className={delta > 0 ? "au-up" : "au-down"}>{delta > 0 ? `↑ +${delta}` : `↓ ${delta}`}</em>}
        </>
      ),
    },
    {
      key: "score",
      tint: "sky",
      icon: Star,
      value: scoreText(profile.total_score),
      label: `Reyting balli ${RANKING_SCORE_UNIT}`,
    },
    {
      key: "views",
      tint: "pink",
      icon: Eye,
      value: compact(profile.view_count),
      label: "Profil ko‘rishlari",
    },
    ...(articles > 0
      ? [{ key: "articles", tint: "cyan", icon: FileText, value: formatNumber(articles), label: "Maqolalari" }]
      : []),
    ...(achievements > 0
      ? [{ key: "achievements", tint: "peach", icon: Award, value: formatNumber(achievements), label: "Yutuqlari" }]
      : []),
    ...(certificates > 0
      ? [{ key: "certificates", tint: "violet", icon: BadgeCheck, value: formatNumber(certificates), label: "Sertifikatlari" }]
      : []),
  ];

  return (
    <section className="au-stats" aria-label="Ko‘rsatkichlar">
      <div className="au-wrap">
        <ul className="au-stats__row au-glass au-lens au-lens--wide" style={{ "--au-cols": items.length } as Vars}>
          {items.map(({ key, tint, icon: Icon, value, label }) => (
            <li key={key} className="au-stat">
              <span className={`au-chip au-chip--${tint}`} aria-hidden>
                <Icon strokeWidth={2} />
              </span>
              <div>
                <b>{value}</b>
                <span className="au-stat__label">{label}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ========================================================================= *
 * BO'LIMLAR
 * ========================================================================= */

interface Section {
  id: string;
  kicker: string;
  /** Sarlavha: oxirgi so'z aurora gradientda. */
  title: string;
  meta?: string;
  /** Tartib: "split" — chapda sarlavha, o'ngda mazmun; "stack" — sarlavha ustida. */
  layout: "split" | "stack";
  body: ReactNode;
}

function Heading({ section, index }: { section: Section; index: number }) {
  const words = section.title.split(" ");
  const tail = words.pop() ?? "";
  return (
    <header className="au-head">
      <p className="au-head__no" aria-hidden>
        {chapterNumber(index)}
        <i />
      </p>
      <div>
        <p className="au-kicker">{section.kicker}</p>
        <h2 id={`${section.id}-t`} className="au-h2" style={{ "--au-n": Math.max(6, ...section.title.split(" ").map((w) => w.length)) } as Vars}>
          {words.length > 0 && <>{words.join(" ")} </>}
          <span className="au-gradient">{tail}</span>
        </h2>
        {section.meta && <p className="au-meta">{section.meta}</p>}
      </div>
    </header>
  );
}

function Section({ section, index, next, scenes }: { section: Section; index: number; next: Section[]; scenes: string[] }) {
  /* Birinchi bo'lim (odatda biografiya) yonida keyingi bo'limlarga pastel kartalar. */
  const guide = index === 0 && next.length > 0;
  return (
    <section id={section.id} className={`au-sec au-sec--${section.layout}${guide ? " au-sec--guide" : ""}`} aria-labelledby={`${section.id}-t`} data-au-reveal>
      <div className="au-wrap au-sec__grid">
        <Heading section={section} index={index} />
        <div className="au-sec__body">{section.body}</div>
        {guide && (
          <ul className="au-guide" aria-label="Keyingi bo‘limlar">
            {next.map((item, i) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className={`au-guide__card${scenes[i + 1] ? " au-guide__card--photo" : ""}`}
                  style={scenes[i + 1] ? ({ "--au-scene": `url("${served(scenes[i + 1], 640)}")` } as Vars) : undefined}
                >
                  <span className="au-guide__no">{chapterNumber(index + i + 1)}</span>
                  <span className="au-guide__title">{item.kicker}</span>
                  <span className="au-guide__go" aria-hidden>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function buildSections(profile: ThemeProfile, extras: ThemeExtras | undefined, restQuotes: { id: string; text: string }[]): Section[] {
  return [
    biography(profile),
    path(profile),
    honours(profile),
    certificates(profile),
    media(profile, extras),
    books(profile),
    gallery(profile),
    sayings(restQuotes),
  ].filter((section): section is Section => section !== null);
}

/* ------------------------------------------------- BIOGRAFIYA (tahririyat) */

function biography(profile: ThemeProfile): Section | null {
  const parts =
    profile.sections.length > 0
      ? profile.sections.map((s) => ({ id: s.id, title: s.title?.trim() || null, paragraphs: toParagraphs(s.content) }))
      : profile.articles.map((a) => ({ id: String(a.id), title: null, paragraphs: toParagraphs(a.content as string | null) }));
  const story = parts.filter((part) => part.title || part.paragraphs.length > 0);
  if (story.length === 0) return null;

  const minutes = readingMinutes(story.flatMap((part) => part.paragraphs).join(" "));
  const leadPart = story.findIndex((part) => part.paragraphs.length > 0);
  const lead = leadPart >= 0 ? story[leadPart].paragraphs[0] : null;
  const rest = story
    .map((part, index) => ({ ...part, index, paragraphs: index === leadPart ? part.paragraphs.slice(1) : part.paragraphs }))
    .filter((part) => part.title || part.paragraphs.length > 0);

  return {
    id: "biografiya",
    kicker: "Biografiya",
    title: "Hayot yo‘li",
    meta: `${minutes} daqiqa o‘qish`,
    layout: "split",
    body: (
      <div className="au-story" lang="uz">
        {lead && <p className="au-lead">{lead}</p>}
        {rest.length > 0 && (
          /* To'liq matn yig'ilgan: sahifa havodor qoladi. Skriptsiz ishlaydi. */
          <details className="au-more">
            <summary className="au-btn au-btn--glass">
              Batafsil o‘qish
              <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                <path d="M2 7h10M8 3l4 4-4 4" />
              </svg>
            </summary>
            <div className="au-story__rest">
              {rest.map((part) => (
                <div key={part.id} className="au-story__part">
                  {part.title && (
                    <h3>
                      <small>{chapterNumber(part.index)}</small>
                      {part.title}
                    </h3>
                  )}
                  {part.paragraphs.map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
              ))}
            </div>
          </details>
        )}
      </div>
    ),
  };
}

/* ------------------------------------------------- TA'LIM VA FAOLIYAT (shaffof panel) */

function path(profile: ThemeProfile): Section | null {
  const work = toTimeline(profile.workExperience ?? []).map((item) => ({ item, tag: "Faoliyat" }));
  const education = toTimeline(profile.education ?? []).map((item) => ({ item, tag: "Ta’lim" }));
  const all = [...work, ...education].sort((a, b) => (b.item.from ?? "").localeCompare(a.item.from ?? ""));
  if (all.length === 0) return null;

  return {
    id: "yol",
    kicker: work.length > 0 && education.length > 0 ? "Ta’lim va faoliyat" : work.length > 0 ? "Faoliyat" : "Ta’lim",
    title: work.length > 0 ? "Kasbiy yo‘l" : "Bilim yo‘li",
    meta: `${all.length} ta yozuv`,
    layout: "split",
    body: (
      <ol className="au-timeline au-glass">
        {all.map(({ item, tag }) => (
          <li key={`${tag}-${item.id}`} className="au-timeline__item">
            <span className="au-timeline__dot" aria-hidden />
            <p className="au-timeline__when">
              {item.from ? range(item.from, item.to) : "—"}
              <span>{tag}</span>
            </p>
            <b>{item.title}</b>
            {item.subtitle && <span className="au-timeline__sub">{item.subtitle}</span>}
            {item.description && <p className="au-timeline__text">{item.description}</p>}
          </li>
        ))}
      </ol>
    ),
  };
}

/* ------------------------------------------------- YUTUQLAR (suzuvchi) */

function honours(profile: ThemeProfile): Section | null {
  const achievements = toTimeline(profile.achievements ?? []);
  const events = toTimeline(profile.events ?? []);
  const all = [...achievements, ...events];
  if (all.length === 0) return null;

  return {
    id: "yutuqlar",
    kicker: achievements.length > 0 ? "Yutuqlar" : "Tadbirlar",
    title: achievements.length > 0 ? "E’tirof va natijalar" : "Tadbirlar",
    meta: `${all.length} ta yozuv`,
    layout: "stack",
    body: <Floating items={all} />,
  };
}

function Floating({ items }: { items: TimelineItem[] }) {
  const tints = ["lavender", "sky", "pink", "peach", "cyan"];
  return (
    <ul className="au-floating">
      {items.map((item, index) => {
        const url = safeUrl(item.url);
        return (
          <li key={item.id} className="au-floating__item au-glass">
            <span className={`au-chip au-chip--${tints[index % tints.length]}`} aria-hidden>
              <Award strokeWidth={2} />
            </span>
            <div>
              {item.from && <p className="au-floating__year">{year(item.from)}</p>}
              <b>{item.title}</b>
              {item.subtitle && <span className="au-floating__sub">{item.subtitle}</span>}
              {item.description && <p>{item.description}</p>}
              {url && <External href={url} label="Manba" />}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/* ------------------------------------------------- SERTIFIKATLAR (bitta panel) */

function certificates(profile: ThemeProfile): Section | null {
  const list = profile.certificates ?? [];
  if (list.length === 0) return null;

  return {
    id: "sertifikatlar",
    kicker: "Sertifikatlar",
    title: "Tasdiqlangan bilim",
    meta: `${list.length} ta hujjat`,
    layout: "split",
    body: (
      <ul className="au-certs au-glass">
        {list.map((certificate) => {
          const url = safeUrl(certificate.credential_url as string | null);
          const verified = isVerified(certificate.trust);
          return (
            <li key={certificate.id} className="au-cert">
              <div>
                <b>{certificate.title}</b>
                {(certificate.issuer || certificate.issued_on) && (
                  <span className="au-cert__sub">
                    {[certificate.issuer, year(certificate.issued_on as string | null)].filter(Boolean).join(" · ")}
                  </span>
                )}
              </div>
              <div className="au-cert__end">
                {/* §8: ishonch belgisi dizayndan qat'i nazar ko'rsatiladi. */}
                <span className={`au-pill${verified ? " au-pill--ok" : ""}`}>{trustLabel(certificate.trust)}</span>
                {url && <External href={url} label="Hujjat" />}
              </div>
            </li>
          );
        })}
      </ul>
    ),
  };
}

/* ------------------------------------------------- MAQOLALAR (pastel surat kartalari) */

function media(profile: ThemeProfile, extras: ThemeExtras | undefined): Section | null {
  const own = profile.memberArticles ?? [];
  const articles = extras?.journalArticles ?? [];
  const podcasts = extras?.podcasts ?? [];
  if (own.length === 0 && articles.length === 0 && podcasts.length === 0) return null;

  const cards = [
    /*
     * A'ZONING O'Z MAQOLALARI — avval, chunki bular uning o'zi yozgani.
     * Muallif kabinetda yashirganlari bu yerga kelmaydi (`show_on_profile`).
     */
    ...own.map((m) => ({
      id: `m-${m.id}`,
      href: m.href,
      title: m.title,
      meta: m.publishedAt ? `Maqola · ${formatDateUz(m.publishedAt)}` : "Maqola",
      image: optimizable(m.heroUrl),
    })),
    ...articles.map((a) => ({
      id: `a-${a.id}`,
      href: `/jurnal/maqola/${a.slug}`,
      title: String(a.title ?? ""),
      meta: a.journal ? `Liderlar Online · ${a.journal.issue_number}-son` : "Liderlar Online",
      image: optimizable(a.cover_url),
    })),
    ...podcasts.map((p) => ({
      id: `p-${p.id}`,
      href: `/podcastlar/${p.slug}`,
      title: String(p.title ?? ""),
      meta: `Podcast${p.starts_at ? ` · ${formatDateUz(p.starts_at)}` : ""}`,
      image: optimizable(p.banner_url),
    })),
  ];

  return {
    id: "maqolalar",
    kicker: "Maqolalar va media",
    title: "Nashrlar",
    meta: `${cards.length} ta material`,
    // 1–2 ta material — sarlavha yonida; ko'p bo'lsa — keng qator.
    layout: cards.length <= 2 ? "split" : "stack",
    body: (
      <ul className="au-press">
        {cards.map((card) => (
          <li key={card.id}>
            <Link href={card.href} className="au-press__card">
              <span className="au-press__shot">
                {card.image && <Image src={card.image} alt="" fill sizes="(min-width: 900px) 560px, 92vw" loading="lazy" />}
              </span>
              <span className="au-press__body au-glass">
                <span className="au-press__meta">{card.meta}</span>
                <b>{card.title}</b>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    ),
  };
}

/* ------------------------------------------------- KITOBLAR */

function books(profile: ThemeProfile): Section | null {
  const items = profile.adabiyotXItems ?? [];
  const own = items.filter((item) => item.relationshipType === "own_work");
  const read = items.filter((item) => item.relationshipType === "read_book" && item.contentType === "book");
  const manual = profile.booksRead ?? [];
  if (own.length === 0 && read.length === 0 && manual.length === 0) return null;

  return {
    id: "kitoblar",
    kicker: "Kitoblar",
    title: own.length > 0 ? "Ijod va kitoblar" : "Kutubxona",
    layout: "stack",
    body: (
      <div className="au-library">
        {own.length > 0 && <Shelf label="Ijodiy ishlari" items={own} />}
        {read.length > 0 && <Shelf label="O‘qigan kitoblari" items={read} />}
        {manual.length > 0 && (
          <ul className="au-list au-glass">
            {manual.map((book) => (
              <li key={String(book.id)}>
                <b>{String(book.title ?? "")}</b>
                {book.subtitle && <span className="au-list__sub">{String(book.subtitle)}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
    ),
  };
}

function Shelf({ label, items }: { label: string; items: ThemeProfile["adabiyotXItems"] }) {
  return (
    <div>
      <p className="au-kicker">{label}</p>
      <ul className="au-books">
        {items.map((item) => {
          const href = safeUrl(item.externalUrl);
          const cover = safeUrl(item.coverUrl);
          const content = (
            <>
              <span className="au-book__cover">
                {cover ? (
                  // Muqovalar AdabiyotX domenida — `next/image` ruxsat ro'yxatida yo'q.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cover} alt="" loading="lazy" decoding="async" />
                ) : (
                  <span className="au-book__blank">{item.title}</span>
                )}
              </span>
              <b>{item.title}</b>
              {item.authorName && <span className="au-book__author">{item.authorName}</span>}
            </>
          );
          return (
            <li key={item.id}>
              {href ? (
                <a href={href} target="_blank" rel="noopener noreferrer" className="au-book">
                  {content}
                </a>
              ) : (
                <div className="au-book">{content}</div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ------------------------------------------------- GALEREYA */

function gallery(profile: ThemeProfile): Section | null {
  // Hero'dagi portret galereyada takrorlanmaydi.
  const items = withoutPortrait(profile.media ?? [], profile.avatar_url);
  if (items.length === 0) return null;

  return {
    id: "galereya",
    kicker: "Galereya",
    title: "Lahzalar",
    meta: `${items.length} ta surat`,
    layout: items.length <= 2 ? "split" : "stack",
    body: (
      <ul className={`au-gallery au-gallery--${Math.min(items.length, 3)}`}>
        {items.map((item) => (
          <li key={String(item.url)}>
            <figure className="au-shot">
              <a href={String(item.url)} target="_blank" rel="noopener noreferrer">
                <Image
                  src={String(item.url)}
                  alt={item.caption ?? `${profile.full_name} — galereya rasmi`}
                  fill
                  sizes="(min-width: 900px) 420px, 46vw"
                  loading="lazy"
                />
              </a>
              {item.caption && <figcaption className="au-glass">{item.caption}</figcaption>}
            </figure>
          </li>
        ))}
      </ul>
    ),
  };
}

/* ------------------------------------------------- IQTIBOSLAR */

function sayings(quotes: { id: string; text: string }[]): Section | null {
  if (quotes.length === 0) return null;
  return {
    id: "iqtiboslar",
    kicker: "Iqtiboslar",
    title: "O‘z so‘zlari",
    layout: "split",
    body: (
      <ul className="au-sayings">
        {quotes.map((quote) => (
          <li key={quote.id} className="au-glass">
            “{quote.text}”
          </li>
        ))}
      </ul>
    ),
  };
}

function Interlude({ text, name }: { text: string; name: string }) {
  return (
    <section className="au-interlude" aria-label="Iqtibos" data-au-reveal>
      <div className="au-wrap">
        <figure className="au-interlude__panel au-glass au-lens">
          <blockquote>“{text}”</blockquote>
          <figcaption>{name}</figcaption>
        </figure>
      </div>
    </section>
  );
}

/* ========================================================================= *
 * YAKUN
 * ========================================================================= */

function Outro({ profile }: { profile: ThemeProfile }) {
  const links = socialLinks(profile);
  return (
    <footer className="au-outro" aria-label="Yakun">
      <div className="au-wrap" data-au-reveal>
        <div className="au-outro__panel au-glass au-lens au-lens--wide">
          <div>
            <p className="au-kicker">Liderlar.uz ensiklopediyasi</p>
            <p className="au-outro__name">{profile.full_name}</p>
          </div>
          <div className="au-outro__end">
            {links.length > 0 && <Socials links={links} />}
            <Link href="/liderlar" className="au-btn au-btn--aurora">
              Barcha liderlar
              <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                <path d="M2 7h10M8 3l4 4-4 4" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function External({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer nofollow" className="au-go">
      {label}
      <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden>
        <path d="M3 9L9 3M4 3h5v5" />
      </svg>
    </a>
  );
}
