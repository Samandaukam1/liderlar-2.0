import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
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
import { IvMotion, IvPortrait, IvPromo, IvShare } from "./client";
import { ivGiant, ivSans, ivSerif } from "./fonts";
import { ivoryEditorialCss } from "./styles";

/**
 * IVORY EDITORIAL — premium jurnal, biografiya.
 *
 * Suyak rangidagi qog'oz, chuqur dengiz ko'ki, qora tipografiya va juda
 * nozik kulrang. Sahifa jurnal muqovasi kabi quriladi va so'ng
 * interaktiv biografiyaga aylanadi.
 *
 * KOMPOZITSIYA (§9):
 *
 *   - MUQOVA: chapda katta Didone ism (ism — qora, familiya — ko'k),
 *     markazda katta portret, o'ngda ULKAN kesilgan harflar (ism) —
 *     ichida nomzodning o'z suratlari ko'k monoxromda; ortida qiya
 *     geometrik kesiklar, ingichka chiziqlar va mikro-tipografiya.
 *   - Ingichka statistika chizig'i — faqat haqiqiy raqamlar.
 *   - Bo'limlar: katta raqam (01, 02…), ulkan serif sarlavha, assimetrik
 *     matn va surat, ko'p bo'sh joy.
 *
 * Komponent hech qanday so'rov qilmaydi (§11, §49): hammasi `profile` va
 * sahifa yuklagan `extras` dan. Soxta ma'lumot yo'q — bo'sh blok umuman
 * chizilmaydi.
 */

/* PALITRA — dizayn o'z ranglarini o'zi tashiydi. */
const IVORY = "#f2eee5";
const PAPER = "#fbf9f4";
const INK = "#141312";
const NAVY = "#163d73";
const STONE = "#8a857b";

type Vars = CSSProperties & Record<`--${string}`, string | number>;

export default function IvoryEditorialTheme({ profile, extras }: ThemeProps) {
  const quotes = (profile.quotes ?? [])
    .map((quote) => ({ id: String(quote.id), text: String(quote.text ?? "").trim() }))
    .filter((quote) => quote.text);
  const images = imagePool(profile, extras);
  const sections = buildSections(profile, extras, quotes.slice(2), images);

  return (
    <div data-iv-root className={`iv ${ivSerif.variable} ${ivSans.variable} ${ivGiant.variable}`}>
      <style
        dangerouslySetInnerHTML={{
          __html: ivoryEditorialCss({ ivory: IVORY, paper: PAPER, ink: INK, navy: NAVY, stone: STONE }),
        }}
      />
      <IvMotion />

      <Hero profile={profile} extras={extras} images={images} quote={quotes[0]?.text ?? null} />
      <Stats profile={profile} extras={extras} hasStory={sections.some((s) => s.id === "biografiya")} />

      {sections.map((section, index) => (
        <Section key={section.id} section={section} index={index} />
      ))}

      {quotes[1] && <Interlude text={quotes[1].text} name={profile.full_name} />}
      <Outro profile={profile} />
    </div>
  );
}

/* ========================================================================= *
 * SURATLAR — muqova kollaji uchun
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
 * Nomzodning MAVJUD suratlari: profil rasmi, galereya, o'z maqolalari va
 * jurnal muqovalari. Kollaj faqat shulardan quriladi — begona surat yo'q.
 */
function imagePool(profile: ThemeProfile, extras: ThemeExtras | undefined): string[] {
  const all = [
    profile.avatar_url,
    ...withoutPortrait(profile.media ?? [], profile.avatar_url).map((item) => String(item.url)),
    ...(profile.memberArticles ?? []).map((m) => m.heroUrl),
    ...(extras?.journalArticles ?? []).map((a) => a.cover_url as string | null),
  ]
    .map((url) => optimizable(url))
    .filter((url): url is string => Boolean(url));
  return Array.from(new Set(all));
}

/** O'z domenimizdagi optimallashtirilgan nusxa — Supabase'dan qayta yuklanmaydi. */
function served(src: string, width = 1200): string {
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=75`;
}

/**
 * Ko'k monoxrom surat: ustidagi ko'k qatlam `color` rejimida aralashadi —
 * qatlamning tusi va suratning yorqinligi qoladi, ya'ni surat aniq
 * ko'rinadi, faqat bir rangda.
 */
function duo(src: string | undefined, position = "50% 30%"): CSSProperties | undefined {
  if (!src) return undefined;
  return {
    backgroundImage: `linear-gradient(#1c4b8f,#1c4b8f),url("${served(src)}")`,
    backgroundPosition: `0 0,${position}`,
  };
}

/* ========================================================================= *
 * HERO — jurnal muqovasi
 * ========================================================================= */

function Hero({
  profile,
  extras,
  images,
  quote,
}: {
  profile: ThemeProfile;
  extras: ThemeExtras | undefined;
  images: string[];
  quote: string | null;
}) {
  const name = splitName(profile.full_name);
  const [family = "", given = ""] = name.primary;
  const first = given || family;
  const last = given ? family : "";
  const roles = (profile.description_items ?? []).slice(0, 3);
  const cutout = extras?.portraitCutout ?? null;
  const links = socialLinks(profile);
  const facts = heroFacts(profile);
  const band = [profile.category?.name, ...(profile.description_items ?? []).slice(3, 5)].filter((v): v is string => Boolean(v?.trim()));

  /* Ulkan harflar: ism ikki qatorga bo'linadi ("JAXO" / "NGIR"). */
  const giantLines = splitGiant(first.toLocaleUpperCase("uz"));
  const longest = Math.max(4, ...giantLines.map((line) => line.length));
  const nameLength = Math.max(6, first.length, last.length);
  const scenes = images.filter((src) => src !== optimizable(profile.avatar_url));

  return (
    <header className="iv-hero" aria-label={profile.full_name}>
      <div className="iv-stage">
        {roles.length > 0 && (
          <ul className="iv-micro iv-micro--roles" aria-label="Faoliyati">
            {roles.map((role) => (
              <li key={role}>{role}</li>
            ))}
          </ul>
        )}

        {/* Telefonda ism tepada turadi; keng ekranda bu nusxa yashirin. */}
        <p className="iv-name iv-name--mobile" aria-hidden style={{ "--iv-n": nameLength } as Vars}>
          <span className="iv-name__line">
            <span>{first}</span>
          </span>
          {last && (
            <span className="iv-name__line iv-name__line--navy">
              <span>{last}</span>
            </span>
          )}
        </p>

        {/* -------------------------------------------- KOLLAJ */}
        <div className="iv-visual">
          {/*
            ULKAN HARFLAR va ular orasida MUQOVA SARLAVHASI — ism. Harflar
            ichida nomzodning yuzi; sarlavha ikki qator orasidagi bo'sh
            joyda turadi, portret esa chapda — hech biri bir-birini yopmaydi.
          */}
          <div className="iv-giant" style={{ "--iv-gn": longest } as Vars}>
            <span className="iv-giant__line" aria-hidden>
              {giantLines[0]}
            </span>
            <h1 className="iv-name iv-name--cover" style={{ "--iv-n": nameLength } as Vars}>
              <span className="iv-name__line">
                <span>{first}</span>
              </span>
              {last && (
                <span className="iv-name__line iv-name__line--navy">
                  <span>{last}</span>
                </span>
              )}
              {name.secondary && <span className="iv-sr"> {name.secondary}</span>}
            </h1>
            {giantLines[1] && (
              <span className="iv-giant__line iv-giant__line--outline" aria-hidden>
                {giantLines[1]}
              </span>
            )}
          </div>
          {/*
            KESIKLARDA faqat nomzodning BOSHQA suratlari (galereya, maqolalar)
            — portretning o'zi takrorlanmaydi. Bunday surat bo'lmasa kesik
            toza to'q ko'k shakl bo'lib qoladi.
          */}
          <span className="iv-shard iv-shard--a" style={duo(scenes[0], "50% 35%")} aria-hidden />
          <span className="iv-shard iv-shard--b" style={duo(scenes[1], "50% 40%")} aria-hidden>
            {band.length > 0 && (
              <span className="iv-shard__words">
                {band.map((word) => (
                  <i key={word}>{word}</i>
                ))}
              </span>
            )}
          </span>
          <span className="iv-cutline" aria-hidden />

          <div className="iv-figure">
            {cutout ? (
              <IvPortrait cutout={cutout} avatar={profile.avatar_url} alt={profile.full_name} />
            ) : profile.avatar_url ? (
              <div className="iv-photo">
                <Image src={profile.avatar_url} alt={profile.full_name} fill preload sizes="(min-width: 900px) 520px, 80vw" />
              </div>
            ) : (
              <span className="iv-mono" aria-hidden>
                {monogram(profile.full_name)}
              </span>
            )}
          </div>

        </div>

        {/* -------------------------------------------- IZOHLAR */}
        <div className="iv-notes">
          {quote && (
            <blockquote className="iv-quote">
              <span aria-hidden>“</span>
              {quote}
            </blockquote>
          )}
          <div className="iv-notes__row">
            {links.length > 0 && <Socials links={links} />}
            {facts.length > 0 && (
              <dl className="iv-facts">
                {facts.map((fact) => (
                  <div key={fact.label}>
                    <dt>
                      <FactIcon kind={fact.icon} />
                      <span className="iv-sr">{fact.label}</span>
                    </dt>
                    <dd>
                      {fact.value}
                      <small>{fact.label}</small>
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

/**
 * Ismni ikki qatorga bo'ladi. Apostrof (o', g') harf hisoblanmaydi va
 * oldingi harf bilan qoladi — "O'G'ILOY" → "O'G'I" / "LOY".
 */
function splitGiant(word: string): string[] {
  const chars = Array.from(word);
  const isLetter = (c: string) => /\p{L}/u.test(c);
  const letters = chars.filter(isLetter).length;
  if (letters <= 4) return [word];
  const target = Math.ceil(letters / 2);
  let seen = 0;
  let cut = chars.length;
  for (let i = 0; i < chars.length; i++) {
    if (isLetter(chars[i])) seen += 1;
    if (seen === target) {
      cut = i + 1;
      while (cut < chars.length && !isLetter(chars[cut])) cut += 1;
      break;
    }
  }
  return [chars.slice(0, cut).join(""), chars.slice(cut).join("")].filter(Boolean);
}

type FactKind = "pin" | "calendar" | "cap";

function heroFacts(profile: ThemeProfile): { label: string; value: string; icon: FactKind }[] {
  const education = toTimeline(profile.education ?? [])[0]?.title || profile.education_summary;
  const home = profile.current_location ?? profile.region?.name ?? null;
  return [
    { label: "Hudud", value: home, icon: "pin" as const },
    { label: "Tug‘ilgan joyi", value: profile.birth_place === home ? null : profile.birth_place, icon: "pin" as const },
    { label: "Ta’lim", value: education, icon: "cap" as const },
    { label: "Tug‘ilgan yili", value: profile.birth_year_display, icon: "calendar" as const },
  ].filter((fact): fact is { label: string; value: string; icon: FactKind } => Boolean(fact.value?.trim()));
}

function FactIcon({ kind }: { kind: FactKind }) {
  const d = {
    pin: "M10 17.5s-5.5-5-5.5-9a5.5 5.5 0 0111 0c0 4-5.5 9-5.5 9zM10 10.2a2 2 0 100-4 2 2 0 000 4z",
    calendar: "M4 5.5h12v11H4zM4 9h12M7.5 3.5v3M12.5 3.5v3",
    cap: "M2.5 8L10 4.5 17.5 8 10 11.5zM5.5 9.5v4c1.2 1.3 2.7 2 4.5 2s3.3-.7 4.5-2v-4M17.5 8v4.5",
  }[kind];
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden focusable="false">
      <path d={d} />
    </svg>
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
    <ul className="iv-social" aria-label="Ijtimoiy tarmoqlar">
      {links.slice(0, 6).map((link) => (
        <li key={link.id}>
          {/* Foydalanuvchi kiritgan havola: SEO vazni berilmaydi. */}
          <a href={link.url} target="_blank" rel="noopener noreferrer nofollow" className={`iv-brand iv-brand--${link.brand}`} aria-label={link.title}>
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
 * STATISTIKA — jurnal chizig'i, faqat haqiqiy raqamlar
 * ========================================================================= */

function compact(value: number): string {
  return value >= 10000
    ? new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value)
    : formatNumber(value);
}

function Stats({ profile, extras, hasStory }: { profile: ThemeProfile; extras: ThemeExtras | undefined; hasStory: boolean }) {
  const ranking = rankingView(profile.position, profile.total_score, profile.ranking.hasRow);
  const delta = ranking.kind === "position" ? rankDelta(profile.position, profile.previous_position) : 0;
  const articles = (profile.memberArticles ?? []).length + (extras?.journalArticles ?? []).length;
  const achievements = (profile.achievements ?? []).length;
  const certificates = (profile.certificates ?? []).length;
  const promo = extras?.promoCode ?? null;

  const items: { key: string; icon: string; value: ReactNode; label: ReactNode }[] = [
    {
      key: "rank",
      icon: "M7 3.5h10v4a5 5 0 01-10 0zM7 5H4v1.5a3.5 3.5 0 003.5 3.5M17 5h3v1.5a3.5 3.5 0 01-3.5 3.5M9 20.5h6M12 12.5v8",
      value: ranking.kind === "position" ? `#${ranking.value}` : <span className="iv-stat__soft">{ranking.kind === "pending" ? "Hisoblanmoqda" : "Shakllanmoqda"}</span>,
      label: (
        <>
          Umumiy reytingda
          {delta !== 0 && <em className={delta > 0 ? "iv-up" : "iv-down"}>{delta > 0 ? `↑ +${delta}` : `↓ ${delta}`}</em>}
        </>
      ),
    },
    {
      key: "score",
      icon: "M12 3.2l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.5l-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z",
      value: scoreText(profile.total_score),
      label: `Reyting balli ${RANKING_SCORE_UNIT}`,
    },
    {
      key: "views",
      icon: "M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12zM12 9a3 3 0 100 6 3 3 0 000-6z",
      value: compact(profile.view_count),
      label: "Profil ko‘rishlari",
    },
    ...(articles > 0
      ? [{ key: "articles", icon: "M6 3h8.5L19 7.5V21H6zM14 3v5h5M9 12h7M9 15.5h7M9 9h3", value: formatNumber(articles), label: "Maqolalari" }]
      : []),
    ...(achievements > 0
      ? [{ key: "achievements", icon: "M12 2.5a6.5 6.5 0 110 13 6.5 6.5 0 010-13zM8.5 14.5L7 21.5l5-2.7 5 2.7-1.5-7", value: formatNumber(achievements), label: "Yutuqlari" }]
      : []),
    ...(certificates > 0
      ? [{ key: "certificates", icon: "M4 4.5h16v11H4zM8 19.5l1-4M16 19.5l-1-4M8 8.5h8M8 11.5h5", value: formatNumber(certificates), label: "Sertifikatlari" }]
      : []),
  ];

  return (
    <section className="iv-stats" aria-label="Ko‘rsatkichlar">
      <div className="iv-wrap">
        <div className="iv-stats__bar">
          <ul className="iv-stats__row" style={{ "--iv-cols": items.length } as Vars}>
            {items.map((item) => (
              <li key={item.key} className="iv-stat">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden focusable="false">
                  <path d={item.icon} />
                </svg>
                <div>
                  <b>{item.value}</b>
                  <span>{item.label}</span>
                </div>
              </li>
            ))}
          </ul>
          <div className="iv-stats__actions">
            {hasStory && (
              <a href="#biografiya" className="iv-btn iv-btn--solid">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                  <path d="M4 3.5h8.5L16 7v9.5H4zM12 3.5V7h4M7 10.5h6M7 13.5h4" />
                </svg>
                Biografiya
              </a>
            )}
            <IvShare name={profile.full_name} />
          </div>
        </div>
        {promo && <IvPromo code={promo} />}
      </div>
    </section>
  );
}

/* ========================================================================= *
 * BO'LIM — katta raqam, ulkan serif sarlavha
 * ========================================================================= */

interface Section {
  id: string;
  kind: string;
  title: string;
  kicker?: string;
  /** Mazmun to'liq kenglikda (galereya, maqolalar). */
  wide?: boolean;
  /** Sarlavha yonidagi surat (ko'k monoxrom). */
  image?: string;
  body: ReactNode;
}

function Section({ section, index }: { section: Section; index: number }) {
  return (
    <section
      id={section.id}
      className={`iv-sec${section.wide ? " iv-sec--wide" : ""}${section.image ? " iv-sec--image" : ""}`}
      aria-labelledby={`${section.id}-t`}
      data-iv-reveal
    >
      <div className="iv-wrap iv-sec__grid">
        <p className="iv-sec__no" aria-hidden>
          {chapterNumber(index)}
          <i />
        </p>
        <header className="iv-sec__head">
          <p className="iv-kicker">{section.kind}</p>
          <h2
            id={`${section.id}-t`}
            className="iv-h2"
            style={{ "--iv-n": Math.max(6, ...section.title.split(/\s+/).map((word) => word.length)) } as Vars}
          >
            {section.title}
          </h2>
          {section.kicker && <p className="iv-sec__meta">{section.kicker}</p>}
        </header>
        <div className="iv-sec__body">{section.body}</div>
        {section.image && <span className="iv-sec__plate" style={duo(section.image, "50% 35%")} aria-hidden />}
      </div>
    </section>
  );
}

function buildSections(
  profile: ThemeProfile,
  extras: ThemeExtras | undefined,
  restQuotes: { id: string; text: string }[],
  images: string[],
): Section[] {
  return [
    biography(profile, images[1] ?? images[0]),
    path(profile),
    honours(profile),
    certificates(profile),
    media(profile, extras),
    books(profile),
    gallery(profile),
    sayings(restQuotes),
  ].filter((section): section is Section => section !== null);
}

/* ------------------------------------------------- BIOGRAFIYA */

function biography(profile: ThemeProfile, image: string | undefined): Section | null {
  const parts =
    profile.sections.length > 0
      ? profile.sections.map((s) => ({ id: s.id, title: s.title?.trim() || null, paragraphs: toParagraphs(s.content) }))
      : profile.articles.map((a) => ({ id: String(a.id), title: null, paragraphs: toParagraphs(a.content as string | null) }));
  const story = parts.filter((part) => part.title || part.paragraphs.length > 0);
  if (story.length === 0) return null;

  const minutes = readingMinutes(story.flatMap((part) => part.paragraphs).join(" "));
  const leadPart = story.findIndex((part) => part.paragraphs.length > 0);
  const lead = leadPart >= 0 ? story[leadPart].paragraphs[0] : null;

  return {
    id: "biografiya",
    kind: "Biografiya",
    title: "Hayot yo‘li",
    kicker: `${minutes} daqiqa o‘qish`,
    image,
    body: (
      <div className="iv-story" lang="uz">
        {lead && <p className="iv-lead">{lead}</p>}
        <div className="iv-story__cols">
          {story.map((part, index) => {
            const paragraphs = index === leadPart ? part.paragraphs.slice(1) : part.paragraphs;
            if (!part.title && paragraphs.length === 0) return null;
            return (
              <div key={part.id} className="iv-story__part">
                {part.title && (
                  <h3>
                    <small>{chapterNumber(index)}</small>
                    {part.title}
                  </h3>
                )}
                {paragraphs.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    ),
  };
}

/* ------------------------------------------------- TA'LIM VA FAOLIYAT */

function path(profile: ThemeProfile): Section | null {
  const work = toTimeline(profile.workExperience ?? []).map((item) => ({ item, tag: "Faoliyat" }));
  const education = toTimeline(profile.education ?? []).map((item) => ({ item, tag: "Ta’lim" }));
  const all = [...work, ...education].sort((a, b) => (b.item.from ?? "").localeCompare(a.item.from ?? ""));
  if (all.length === 0) return null;

  return {
    id: "yol",
    kind: work.length > 0 && education.length > 0 ? "Ta’lim va faoliyat" : work.length > 0 ? "Faoliyat" : "Ta’lim",
    title: work.length > 0 ? "Kasbiy yo‘l" : "Ta’lim",
    kicker: `${all.length} ta yozuv`,
    body: (
      <ol className="iv-rows">
        {all.map(({ item, tag }) => (
          <li key={`${tag}-${item.id}`} className="iv-row">
            <p className="iv-row__when">{item.from ? range(item.from, item.to) : "—"}</p>
            <div className="iv-row__main">
              <b>{item.title}</b>
              {item.subtitle && <span>{item.subtitle}</span>}
              {item.description && <p>{item.description}</p>}
            </div>
            <p className="iv-row__tag">{tag}</p>
          </li>
        ))}
      </ol>
    ),
  };
}

/* ------------------------------------------------- YUTUQLAR */

function honours(profile: ThemeProfile): Section | null {
  const achievements = toTimeline(profile.achievements ?? []);
  const events = toTimeline(profile.events ?? []);
  const all = [...achievements, ...events];
  if (all.length === 0) return null;

  return {
    id: "yutuqlar",
    kind: achievements.length > 0 ? "Yutuqlar" : "Tadbirlar",
    title: achievements.length > 0 ? "E’tirof" : "Tadbirlar",
    kicker: `${all.length} ta yozuv`,
    body: <Honours items={all} />,
  };
}

function Honours({ items }: { items: TimelineItem[] }) {
  return (
    <ol className="iv-honours">
      {items.map((item, index) => {
        const url = safeUrl(item.url);
        return (
          <li key={item.id} className="iv-honour">
            <span className="iv-honour__no" aria-hidden>
              {chapterNumber(index)}
            </span>
            <div className="iv-honour__main">
              {item.from && <p className="iv-honour__year">{year(item.from)}</p>}
              <b>{item.title}</b>
              {item.subtitle && <span>{item.subtitle}</span>}
              {item.description && <p>{item.description}</p>}
              {url && <External href={url} label="Manba" />}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/* ------------------------------------------------- SERTIFIKATLAR */

function certificates(profile: ThemeProfile): Section | null {
  const list = profile.certificates ?? [];
  if (list.length === 0) return null;

  return {
    id: "sertifikatlar",
    kind: "Sertifikatlar",
    title: "Hujjatlar",
    kicker: `${list.length} ta hujjat`,
    body: (
      <ul className="iv-rows">
        {list.map((certificate) => {
          const url = safeUrl(certificate.credential_url as string | null);
          return (
            <li key={certificate.id} className="iv-row">
              <p className="iv-row__when">{year(certificate.issued_on as string | null) || "—"}</p>
              <div className="iv-row__main">
                <b>{certificate.title}</b>
                {certificate.issuer && <span>{certificate.issuer}</span>}
                {url && <External href={url} label="Hujjat" />}
              </div>
              {/* §8: ishonch belgisi dizayndan qat'i nazar ko'rsatiladi. */}
              <p className={`iv-row__tag${isVerified(certificate.trust) ? " iv-row__tag--ok" : ""}`}>{trustLabel(certificate.trust)}</p>
            </li>
          );
        })}
      </ul>
    ),
  };
}

/* ------------------------------------------------- MAQOLALAR */

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
    kind: "Maqolalar va media",
    title: "Nashrlar",
    kicker: `${cards.length} ta material`,
    wide: true,
    body: (
      <ul className="iv-press">
        {cards.map((card) => (
          <li key={card.id}>
            <Link href={card.href} className="iv-press__item">
              <span className="iv-press__shot">
                {card.image && <Image src={card.image} alt="" fill sizes="(min-width: 900px) 640px, 92vw" loading="lazy" />}
              </span>
              <span className="iv-press__meta">{card.meta}</span>
              <b>{card.title}</b>
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
    kind: "Kitoblar",
    title: own.length > 0 ? "Ijod va kitoblar" : "Kutubxona",
    body: (
      <div className="iv-library">
        {own.length > 0 && <Shelf label="Ijodiy ishlari" items={own} />}
        {read.length > 0 && <Shelf label="O‘qigan kitoblari" items={read} />}
        {manual.length > 0 && (
          <ul className="iv-rows">
            {manual.map((book) => (
              <li key={String(book.id)} className="iv-row iv-row--compact">
                <div className="iv-row__main">
                  <b>{String(book.title ?? "")}</b>
                  {book.subtitle && <span>{String(book.subtitle)}</span>}
                </div>
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
      <p className="iv-kicker">{label}</p>
      <ul className="iv-books">
        {items.map((item) => {
          const href = safeUrl(item.externalUrl);
          const cover = safeUrl(item.coverUrl);
          const content = (
            <>
              <span className="iv-book__cover">
                {cover ? (
                  // Muqovalar AdabiyotX domenida — `next/image` ruxsat ro'yxatida yo'q.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cover} alt="" loading="lazy" decoding="async" />
                ) : (
                  <span className="iv-book__blank">{item.title}</span>
                )}
              </span>
              <b>{item.title}</b>
              {item.authorName && <span>{item.authorName}</span>}
            </>
          );
          return (
            <li key={item.id}>
              {href ? (
                <a href={href} target="_blank" rel="noopener noreferrer" className="iv-book">
                  {content}
                </a>
              ) : (
                <div className="iv-book">{content}</div>
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
    kind: "Galereya",
    title: "Kadrlar",
    kicker: `${items.length} ta surat`,
    wide: true,
    body: (
      <ul className={`iv-gallery iv-gallery--${Math.min(items.length, 3)}`}>
        {items.map((item) => (
          <li key={String(item.url)}>
            <figure className="iv-shot">
              <a href={String(item.url)} target="_blank" rel="noopener noreferrer">
                <Image
                  src={String(item.url)}
                  alt={item.caption ?? `${profile.full_name} — galereya rasmi`}
                  fill
                  sizes="(min-width: 900px) 620px, 92vw"
                  loading="lazy"
                />
              </a>
              {item.caption && <figcaption>{item.caption}</figcaption>}
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
    kind: "Iqtiboslar",
    title: "So‘zlar",
    body: (
      <ul className="iv-sayings">
        {quotes.map((quote) => (
          <li key={quote.id}>“{quote.text}”</li>
        ))}
      </ul>
    ),
  };
}

function Interlude({ text, name }: { text: string; name: string }) {
  return (
    <section className="iv-interlude" aria-label="Iqtibos" data-iv-reveal>
      <div className="iv-wrap">
        <figure>
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
    <footer className="iv-outro" aria-label="Yakun">
      <div className="iv-wrap" data-iv-reveal>
        <p className="iv-kicker">Liderlar.uz ensiklopediyasi</p>
        <p className="iv-outro__name">{profile.full_name}</p>
        <div className="iv-outro__row">
          {links.length > 0 && <Socials links={links} />}
          <Link href="/liderlar" className="iv-btn iv-btn--line">
            Barcha liderlar
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
              <path d="M2 7h10M8 3l4 4-4 4" />
            </svg>
          </Link>
        </div>
      </div>
    </footer>
  );
}

function External({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer nofollow" className="iv-go">
      {label}
      <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden>
        <path d="M3 9L9 3M4 3h5v5" />
      </svg>
    </a>
  );
}
