import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import {
  Award,
  BadgeCheck,
  BookOpen,
  Briefcase,
  CalendarDays,
  Eye,
  FileText,
  Globe,
  GraduationCap,
  MapPin,
  Star,
  Target,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { readingMinutes, toParagraphs } from "@/components/ui/article-body";
import { formatDateUz, formatNumber, rankDelta } from "@/lib/utils";
import { isVerified, range, safeUrl, toTimeline, trustLabel, year, type TimelineItem } from "@/lib/themes/shape";
import {
  RANKING_SCORE_UNIT,
  rankingView,
  scoreText,
  splitName,
  withoutPortrait,
  monogram,
} from "@/lib/themes/profile-compose";
import type { ThemeExtras, ThemeProfile, ThemeProps } from "@/lib/themes/types";
import { SeMotion, SeNav, SePortrait, SeShare } from "./client";
import { seSans } from "./fonts";
import { silverExecutiveCss } from "./styles";

/**
 * SILVER EXECUTIVE — zamonaviy korporativ premium + editorial.
 *
 * Oq / och kumush-moviy fon, to'q ko'k tipografiya, qirollik ko'k urg'u,
 * yumshoq shisha yuzalar, minimal yumaloq kartochkalar.
 *
 * HERO: nomzod CHAPDA, mavjud profil rasmi. Rasm chetidagi fon rangi
 * brauzerda o'qiladi va hero foni shu rangga o'tadi, rasm o'ng va pastki
 * chetida eriydi — to'rtburchak chegara ko'rinmaydi. O'ngda ism, rol,
 * haqiqiy metama'lumot, iqtibos (bo'lsa) va amallar.
 *
 * Faqat haqiqiy profil ma'lumoti: bo'sh bo'lim yoki ko'rsatkich chizilmaydi.
 * Komponent so'rov qilmaydi (§11, §49).
 */

/* PALITRA — dizayn o'z ranglarini o'zi tashiydi. */
const PAGE = "#f3f6fb";
const NAVY = "#0b1f44";
const ROYAL = "#1d4ed8";
const ELECTRIC = "#2f6bff";

type Vars = CSSProperties & Record<`--${string}`, string | number>;

export default function SilverExecutiveTheme({ profile, extras }: ThemeProps) {
  const quotes = (profile.quotes ?? [])
    .map((quote) => ({ id: String(quote.id), text: String(quote.text ?? "").trim() }))
    .filter((quote) => quote.text);
  const sections = buildSections(profile, extras, quotes.slice(1));

  return (
    <div data-se-root className={`se ${seSans.variable}`}>
      <style
        dangerouslySetInnerHTML={{
          __html: silverExecutiveCss({ page: PAGE, navy: NAVY, blue: ROYAL, electric: ELECTRIC }),
        }}
      />
      <SeMotion />
      <Hero profile={profile} quote={quotes[0]?.text ?? null} hasBio={sections[0]?.id === "biografiya"} />

      <div className="se-wrap">
        <Stats profile={profile} extras={extras} />

        <div className={`se-body${sections.length > 1 ? "" : " se-body--solo"}`}>
          {sections.length > 1 && <SeNav items={sections.map((s) => ({ id: s.id, label: s.label }))} />}
          <QuickInfo profile={profile} />
          <div className="se-main">
            {sections.map((section, index) => (
              <section
                key={section.id}
                id={section.id}
                className="se-card"
                data-se-reveal
                style={{ "--d": `${Math.min(index, 2) * 80}ms` } as Vars}
                aria-labelledby={`${section.id}-t`}
              >
                <h2 id={`${section.id}-t`} className="se-h2">
                  {section.title}
                  {section.note && <span className="se-note">{section.note}</span>}
                </h2>
                <span className="se-h2-rule" aria-hidden />
                {section.body}
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================= *
 * HERO
 * ========================================================================= */

function Hero({ profile, quote, hasBio }: { profile: ThemeProfile; quote: string | null; hasBio: boolean }) {
  const name = splitName(profile.full_name);
  const firstLine = name.primary.join(" ");
  const roles = (profile.description_items ?? []).slice(0, 2);
  const meta: { icon: LucideIcon; value: string; label: string }[] = [
    { icon: MapPin, value: profile.current_location ?? "", label: "Yashash hududi" },
    { icon: GraduationCap, value: profile.category?.name ?? "", label: "Yo‘nalish" },
    { icon: CalendarDays, value: profile.birth_year_display ?? "", label: "Tug‘ilgan yili" },
  ].filter((item) => item.value.trim());

  return (
    <section className="se-hero" data-se-hero aria-label={profile.full_name}>
      <div className="se-hero__deco" aria-hidden>
        <span className="se-shard se-shard--1" />
        <span className="se-shard se-shard--2" />
        <span className="se-beam se-beam--1" />
        <span className="se-beam se-beam--2" />
      </div>

      <div className="se-wrap se-hero__grid">
        {profile.avatar_url ? (
          <div className="se-figure">
            <SePortrait src={profile.avatar_url} alt={profile.full_name} />
          </div>
        ) : (
          <div className="se-figure se-figure--initials" aria-hidden>
            <span className="se-initials">{monogram(profile.full_name)}</span>
          </div>
        )}

        <div className="se-copy">
          <p className="se-badge se-seq" style={{ "--i": 0 } as Vars}>
            {profile.is_top100 ? `TOP 100${profile.top100_position ? ` · №${profile.top100_position}` : ""}` : (profile.category?.name ?? "Liderlar.uz")}
          </p>
          <h1 className="se-name se-seq" style={{ "--i": 1 } as Vars}>
            <b>{firstLine}</b>{" "}
            {name.secondary && <span>{name.secondary}</span>}
          </h1>
          {roles.length > 0 && (
            <p className="se-role se-seq" style={{ "--i": 2 } as Vars}>
              {roles.map((role, index) => (
                <span key={role}>
                  {index > 0 && <i aria-hidden>|</i>}
                  {role}
                </span>
              ))}
            </p>
          )}
          {meta.length > 0 && (
            <ul className="se-meta se-seq" style={{ "--i": 3 } as Vars}>
              {meta.map(({ icon: Icon, value, label }) => (
                <li key={label}>
                  <span className="se-meta__icon" aria-hidden>
                    <Icon className="se-icon" />
                  </span>
                  <span className="min-w-0">
                    <b>{value}</b>
                    <small>{label}</small>
                  </span>
                </li>
              ))}
            </ul>
          )}
          {quote && (
            <blockquote className="se-quote se-seq" style={{ "--i": 4 } as Vars}>
              {quote}
            </blockquote>
          )}
          <div className="se-actions se-seq" style={{ "--i": 5 } as Vars}>
            {hasBio && (
              <a href="#biografiya" className="se-btn se-btn--primary">
                <BookOpen aria-hidden />
                Biografiya
              </a>
            )}
            <SeShare name={profile.full_name} />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ========================================================================= *
 * KO'RSATKICHLAR — faqat haqiqiy qiymatlar, bo'sh sanoq chizilmaydi
 * ========================================================================= */

function Stats({ profile, extras }: { profile: ThemeProfile; extras: ThemeExtras | undefined }) {
  const ranking = rankingView(profile.position, profile.total_score, profile.ranking.hasRow);
  const delta = ranking.kind === "position" ? rankDelta(profile.position, profile.previous_position) : 0;
  const items: { icon: LucideIcon; value: ReactNode; label: string }[] = [
    {
      icon: Trophy,
      label: "Umumiy reytingda",
      value:
        ranking.kind === "position" ? (
          <>
            #{ranking.value}
            {delta !== 0 && <small className={delta < 0 ? "down" : undefined}>{delta > 0 ? `↑ +${delta}` : `↓ ${delta}`}</small>}
          </>
        ) : (
          <i>{ranking.kind === "pending" ? "hisoblanmoqda" : "hali shakllanmagan"}</i>
        ),
    },
    {
      icon: Star,
      label: "Reyting balli",
      // MAXRAJ BILAN: "7" emas, "7.0 / 100 ball" — raqam shkalasiz ma'nosiz.
      value: (
        <>
          {scoreText(profile.total_score)}
          <small>{RANKING_SCORE_UNIT}</small>
        </>
      ),
    },
    { icon: Eye, label: "Profil ko‘rishlari", value: formatNumber(profile.view_count) },
  ];
  const counts: [LucideIcon, number, string][] = [
    [FileText, extras?.journalArticles?.length ?? 0, "Maqolalari"],
    [Award, (profile.achievements ?? []).length, "Yutuqlari"],
    [BadgeCheck, (profile.certificates ?? []).length, "Sertifikatlari"],
  ];
  for (const [icon, count, label] of counts) {
    if (count > 0) items.push({ icon, value: formatNumber(count), label });
  }

  return (
    <div className="se-stats" style={{ "--se-cols": items.length } as Vars}>
      {items.map(({ icon: Icon, value, label }) => (
        <div key={label} className="se-stat">
          <span className="se-stat__icon" aria-hidden>
            <Icon className="se-icon" />
          </span>
          <div className="min-w-0">
            <b>{value}</b>
            <span>{label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ========================================================================= *
 * TEZKOR MA'LUMOT
 * ========================================================================= */

function QuickInfo({ profile }: { profile: ThemeProfile }) {
  const facts: { icon: LucideIcon; label: string; value: string | null }[] = [
    { icon: CalendarDays, label: "Tug‘ilgan yili", value: profile.birth_year_display },
    { icon: MapPin, label: "Tug‘ilgan joyi", value: profile.birth_place },
    { icon: Target, label: "Yashash hududi", value: profile.current_location },
    { icon: GraduationCap, label: "Ta’lim", value: profile.education_summary },
    { icon: Briefcase, label: "Faoliyat sohasi", value: profile.activity_field },
    { icon: Globe, label: "Tillar", value: (profile.languages ?? []).join(", ") || null },
  ];
  const visible = facts.filter((fact) => fact.value?.trim());
  const links = (profile.socialLinks ?? [])
    .map((link) => ({ id: String(link.id), url: safeUrl(String(link.url ?? "")), title: String(link.title ?? "Havola") }))
    .filter((link): link is { id: string; url: string; title: string } => Boolean(link.url));
  if (visible.length === 0 && links.length === 0) return null;

  return (
    <aside className="se-card se-aside" data-se-reveal aria-label="Tezkor ma’lumot">
      <h2 className="se-h2">Tezkor ma’lumot</h2>
      <ul className="se-facts">
        {visible.map(({ icon: Icon, label, value }) => (
          <li key={label}>
            <span className="se-facts__icon" aria-hidden>
              <Icon className="se-icon" />
            </span>
            <span className="min-w-0">
              <b>{label}</b>
              <span>{value}</span>
            </span>
          </li>
        ))}
        {links.length > 0 && (
          <li>
            <span className="se-facts__icon" aria-hidden>
              <Globe className="se-icon" />
            </span>
            <span className="min-w-0">
              <b>Ijtimoiy tarmoqlar</b>
              <span className="se-socials">
                {links.map((link) => (
                  <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer nofollow">
                    {link.title}
                  </a>
                ))}
              </span>
            </span>
          </li>
        )}
      </ul>
    </aside>
  );
}

/* ========================================================================= *
 * BO'LIMLAR
 * ========================================================================= */

interface Section {
  id: string;
  label: string;
  title: string;
  note?: string;
  body: ReactNode;
}

function buildSections(
  profile: ThemeProfile,
  extras: ThemeExtras | undefined,
  restQuotes: { id: string; text: string }[],
): Section[] {
  return [
    biography(profile, restQuotes),
    path(profile),
    honours(profile),
    certificates(profile),
    books(profile),
    media(extras),
    gallery(profile),
  ].filter((section): section is Section => section !== null);
}

function biography(profile: ThemeProfile, quotes: { id: string; text: string }[]): Section | null {
  const parts =
    profile.sections.length > 0
      ? profile.sections.map((s) => ({ id: s.id, title: s.title?.trim() || null, paragraphs: toParagraphs(s.content) }))
      : profile.articles.map((a) => ({ id: String(a.id), title: null, paragraphs: toParagraphs(a.content as string | null) }));
  const story = parts.filter((part) => part.title || part.paragraphs.length > 0);
  if (story.length === 0 && quotes.length === 0) return null;
  const minutes = readingMinutes(story.flatMap((part) => part.paragraphs).join(" "));

  return {
    id: "biografiya",
    label: "Biografiya",
    title: "Men haqimda",
    note: story.length > 0 ? `${minutes} daqiqa o‘qish` : undefined,
    body: (
      <div className="se-prose" lang="uz">
        {story.map((part, partIndex) => (
          <div key={part.id} className="se-part">
            {part.title && (
              <h3>
                {story.length > 1 && <small>{String(partIndex + 1).padStart(2, "0")}</small>}
                {part.title}
              </h3>
            )}
            {part.paragraphs.map((paragraph, index) => (
              <p key={index} className={partIndex === 0 && index === 0 ? "se-lead" : undefined}>
                {paragraph}
              </p>
            ))}
          </div>
        ))}
        {quotes.map((quote) => (
          <blockquote key={quote.id} className="se-pull">
            {quote.text}
          </blockquote>
        ))}
      </div>
    ),
  };
}

function path(profile: ThemeProfile): Section | null {
  const education = toTimeline(profile.education ?? []);
  const work = toTimeline(profile.workExperience ?? []);
  if (education.length === 0 && work.length === 0) return null;
  const both = education.length > 0 && work.length > 0;
  const title = both ? "Ta’lim va faoliyat" : education.length > 0 ? "Ta’lim" : "Faoliyat";
  return {
    id: "talim-faoliyat",
    label: both ? "Ta’lim va faoliyat" : title,
    title,
    body: (
      <div className={`se-cols${both ? " se-cols--two" : ""}`}>
        {education.length > 0 && <Steps label={both ? "Ta’lim" : null} items={education} />}
        {work.length > 0 && <Steps label={both ? "Ish tajribasi" : null} items={work} />}
      </div>
    ),
  };
}

function Steps({ label, items }: { label: string | null; items: TimelineItem[] }) {
  return (
    <div>
      {label && <h3 className="se-sub">{label}</h3>}
      <ol className="se-steps">
        {items.map((item) => (
          <li key={item.id} className="se-step">
            {item.from && <span className="se-when">{range(item.from, item.to)}</span>}
            <b>{item.title}</b>
            {item.subtitle && <span>{item.subtitle}</span>}
            {item.description && <p>{item.description}</p>}
          </li>
        ))}
      </ol>
    </div>
  );
}

function honours(profile: ThemeProfile): Section | null {
  const achievements = toTimeline(profile.achievements ?? []);
  const events = toTimeline(profile.events ?? []);
  if (achievements.length === 0 && events.length === 0) return null;
  const title = achievements.length > 0 ? "Yutuqlar" : "Tadbirlar";
  return {
    id: "yutuqlar",
    label: title,
    title,
    body: (
      <div className="se-cols">
        {achievements.length > 0 && <Rows icon={Trophy} items={achievements} />}
        {events.length > 0 && (
          <div>
            {achievements.length > 0 && <h3 className="se-sub">Tadbirlar</h3>}
            <Rows icon={CalendarDays} items={events} />
          </div>
        )}
      </div>
    ),
  };
}

function Rows({ icon: Icon, items }: { icon: LucideIcon; items: TimelineItem[] }) {
  return (
    <ul className="se-rows">
      {items.map((item) => {
        const url = safeUrl(item.url);
        return (
          <li key={item.id} className="se-row">
            <span className="se-row__icon" aria-hidden>
              <Icon className="se-icon" />
            </span>
            <div className="se-row__body">
              <b>{item.title}</b>
              {item.subtitle && <span>{item.subtitle}</span>}
              {item.description && <p>{item.description}</p>}
            </div>
            {(item.from || url) && (
              <div className="se-row__aside">
                {item.from && <span className="se-chip">{year(item.from)}</span>}
                {url && (
                  <a href={url} target="_blank" rel="noopener noreferrer nofollow" className="se-link">
                    Manba ↗
                  </a>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function certificates(profile: ThemeProfile): Section | null {
  const list = profile.certificates ?? [];
  if (list.length === 0) return null;
  return {
    id: "sertifikatlar",
    label: "Sertifikatlar",
    title: "Sertifikatlar",
    body: (
      <ul className="se-rows">
        {list.map((certificate) => {
          const url = safeUrl(certificate.credential_url as string | null);
          return (
            <li key={certificate.id} className="se-row">
              <span className="se-row__icon" aria-hidden>
                <BadgeCheck className="se-icon" />
              </span>
              <div className="se-row__body">
                <b>{certificate.title}</b>
                {(certificate.issuer || certificate.issued_on) && (
                  <span>{[certificate.issuer, year(certificate.issued_on as string | null)].filter(Boolean).join(" · ")}</span>
                )}
              </div>
              <div className="se-row__aside">
                {/* §8: ishonch belgisi dizayndan qat'i nazar ko'rsatiladi. */}
                <span className={`se-chip${isVerified(certificate.trust) ? " se-chip--ok" : ""}`}>
                  {trustLabel(certificate.trust)}
                </span>
                {url && (
                  <a href={url} target="_blank" rel="noopener noreferrer nofollow" className="se-link">
                    Hujjat ↗
                  </a>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    ),
  };
}

function books(profile: ThemeProfile): Section | null {
  const items = profile.adabiyotXItems ?? [];
  const own = items.filter((item) => item.relationshipType === "own_work");
  const read = items.filter((item) => item.relationshipType === "read_book" && item.contentType === "book");
  const manual = profile.booksRead ?? [];
  if (own.length === 0 && read.length === 0 && manual.length === 0) return null;
  return {
    id: "kitoblar",
    label: "Kitoblar",
    title: own.length > 0 ? "Ijod va kitoblar" : "Kitoblar",
    body: (
      <div className="se-cols">
        {own.length > 0 && <Shelf label="Ijodiy ishlari" items={own} />}
        {read.length > 0 && <Shelf label="O‘qigan kitoblari" items={read} />}
        {manual.length > 0 && (
          <div>
            <h3 className="se-sub">{read.length > 0 ? "Boshqa o‘qigan kitoblari" : "O‘qigan kitoblari"}</h3>
            <ul className="se-rows">
              {manual.map((book) => (
                <li key={String(book.id)} className="se-row">
                  <span className="se-row__icon" aria-hidden>
                    <BookOpen className="se-icon" />
                  </span>
                  <div className="se-row__body">
                    <b>{String(book.title ?? "")}</b>
                    {book.subtitle && <span>{String(book.subtitle)}</span>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    ),
  };
}

function Shelf({ label, items }: { label: string; items: ThemeProfile["adabiyotXItems"] }) {
  return (
    <div>
      <h3 className="se-sub">{label}</h3>
      <ul className="se-shelf">
        {items.map((item) => {
          const href = safeUrl(item.externalUrl);
          const cover = safeUrl(item.coverUrl);
          const content = (
            <>
              <span className="se-book__cover">
                {cover ? (
                  // Muqovalar AdabiyotX domenida — `next/image` ruxsat ro'yxatida yo'q.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cover} alt="" loading="lazy" decoding="async" />
                ) : (
                  <span className="se-book__blank">{item.title}</span>
                )}
              </span>
              <b>{item.title}</b>
              {item.authorName && <span>{item.authorName}</span>}
            </>
          );
          return (
            <li key={item.id}>
              {href ? (
                <a href={href} target="_blank" rel="noopener noreferrer" className="se-book">
                  {content}
                </a>
              ) : (
                <div className="se-book">{content}</div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

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

function media(extras: ThemeExtras | undefined): Section | null {
  const articles = extras?.journalArticles ?? [];
  const podcasts = extras?.podcasts ?? [];
  if (articles.length === 0 && podcasts.length === 0) return null;
  const entries = [
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
    id: "media",
    label: "Maqolalar",
    title: "Maqolalar va media",
    body: (
      <ul className="se-entries">
        {entries.map((entry) => (
          <li key={entry.id}>
            <Link href={entry.href} className="se-entry">
              <span className="se-entry__thumb">
                {entry.image && <Image src={entry.image} alt="" fill sizes="68px" loading="lazy" />}
              </span>
              <span className="min-w-0">
                <b>{entry.title}</b>
                <span>{entry.meta}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    ),
  };
}

function gallery(profile: ThemeProfile): Section | null {
  // Hero'dagi profil rasmi galereyada takrorlanmaydi.
  const items = withoutPortrait(profile.media ?? [], profile.avatar_url);
  if (items.length === 0) return null;
  return {
    id: "rasmlar",
    label: "Rasmlar",
    title: "Rasmlar",
    note: `${items.length} ta`,
    body: (
      <ul className="se-gallery">
        {items.map((item) => (
          <li key={String(item.url)}>
            <figure className="se-shot">
              <a href={String(item.url)} target="_blank" rel="noopener noreferrer">
                <Image
                  src={String(item.url)}
                  alt={item.caption ?? `${profile.full_name} — galereya rasmi`}
                  fill
                  sizes="(min-width: 1024px) 260px, (min-width: 640px) 33vw, 50vw"
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
