import Image from "next/image";
import Link from "next/link";
import { Fragment, type CSSProperties, type ReactNode } from "react";
import { readingMinutes, toParagraphs } from "@/components/ui/article-body";
import { formatDateUz, formatNumber } from "@/lib/utils";
import {
  isVerified,
  range,
  safeUrl,
  toTimeline,
  trustLabel,
  year,
  type TimelineItem,
} from "@/lib/themes/shape";
import type { ThemeExtras, ThemeProfile, ThemeProps } from "@/lib/themes/types";
import type { PortraitCutout } from "@/lib/themes/portrait-cutout";
import {
  chapterNumber,
  monogram,
  RANKING_SCORE_UNIT,
  rankingView,
  roman,
  scoreText,
  splitName,
  withoutPortrait,
} from "@/lib/themes/profile-compose";
import { igSans, igSerif } from "./fonts";
import { IgGallery } from "./gallery";
import { IgMotion, IgSectionNav } from "./motion";
import { IgPromoCode } from "./promo";
import { imperialGoldCss } from "./styles";

/**
 * IMPERIAL GOLD — premium dizayn.
 *
 * Kayfiyat: zamonaviy o'zbek nufuzi, editorial hashamat, sokin kino.
 * Palitra: iliq chuqur qora, fil suyagi rang matn, o'lchovli shampan
 * tillasi. Tilla FAQAT ingichka chiziq, raqam va kichik urg'uda — katta
 * tilla maydon, porlash, zarracha va "kazino" effekti yo'q (§10, §68).
 *
 * KOMPOZITSIYA:
 *
 *   - HERO: Post Studio allaqachon yasagan FONSIZ portret ikki qavat
 *     ingichka tilla ramka oldida turadi — boshi yuqori chiziqdan chiqib
 *     turadi — va pastda fonga erib ketadi. Portret kartochkasi yo'q.
 *     Portret bo'lmasa, profil rasmi ramka ichida eriydi; rasm umuman
 *     yo'q bo'lsa, monogramma.
 *   - BOBLAR: raqamli editorial boblar ("01 — Biografiya"), chapda
 *     yopishqoq sarlavha, o'ngda mazmun. Kartochkalar o'rniga ingichka
 *     chiziqlar va tipografik ierarxiya.
 *
 * HARAKAT sekin va boshqariladigan: portret pastdan ko'tariladi, ism
 * qatorlari niqobdan chiqadi, tilla chiziqlar cho'ziladi, bo'limlar
 * ekranga kirganda ochiladi. `prefers-reduced-motion` da hammasi o'chadi.
 *
 * MA'LUMOT UMUMIY (§11): komponent so'rov qilmaydi — hammasi `profile`
 * va sahifa yuklagan `extras` dan. Soxta yoki namuna ma'lumot yo'q: bo'sh
 * bo'lim umuman chizilmaydi.
 */

/* ========================================================================= *
 * PALITRA — dizayn o'z ranglarini o'zi tashiydi (Tailwind konfiguratsiyasida
 * emas). Qolgan ohanglar `styles.ts` da shulardan kelib chiqqan.
 * ========================================================================= */

const INK = "#0b0a08";
const IVORY = "#f3ecdf";
const GOLD = "#c9a96b";
const GOLD_HI = "#e9d5a6";
const PALETTE = { ink: INK, ivory: IVORY, gold: GOLD, goldHi: GOLD_HI };

const FONT_CLASSES = `${igSerif.variable} ${igSans.variable}`;

type Vars = CSSProperties & Record<`--${string}`, string | number>;

export default function ImperialGoldTheme({ profile, extras }: ThemeProps) {
  const quotes = (profile.quotes ?? [])
    .map((quote) => ({ id: String(quote.id), text: String(quote.text ?? "").trim() }))
    .filter((quote) => quote.text);
  const chapters = buildChapters(profile, extras, quotes.slice(1));
  const hasBiography = chapters[0]?.id === "biografiya";

  return (
    <div data-ig-root className={`ig ${FONT_CLASSES}`}>
      <style dangerouslySetInnerHTML={{ __html: imperialGoldCss({ sansFamily: igSans.style.fontFamily, palette: PALETTE }) }} />
      <IgMotion />

      <Hero profile={profile} cutout={extras?.portraitCutout ?? null} hasBiography={hasBiography} />

      {chapters.length > 1 && (
        <IgSectionNav items={chapters.map((chapter) => ({ id: chapter.id, label: chapter.label }))} />
      )}

      {/*
        BIRINCHI IQTIBOS biografiyadan keyin "nafas" bo'lib turadi; biografiya
        bo'lmasa — hero'dan keyin. Qolgan iqtiboslar o'z bobida.
      */}
      {!hasBiography && quotes[0] && <Interlude text={quotes[0].text} name={profile.full_name} />}
      {chapters.map((chapter, index) => (
        <Fragment key={chapter.id}>
          <ChapterFrame chapter={chapter} index={index} />
          {index === 0 && hasBiography && quotes[0] && (
            <Interlude text={quotes[0].text} name={profile.full_name} />
          )}
        </Fragment>
      ))}

      <Outro profile={profile} promoCode={extras?.promoCode ?? null} />
    </div>
  );
}

/* ========================================================================= *
 * HERO
 * ========================================================================= */

function Hero({
  profile,
  cutout,
  hasBiography,
}: {
  profile: ThemeProfile;
  cutout: PortraitCutout | null;
  hasBiography: boolean;
}) {
  const name = splitName(profile.full_name);
  const items = profile.description_items ?? [];
  const role = items[0] ?? null;
  const tags = items.slice(1, 5);
  const eyebrow = profile.category?.name ?? "Liderlar.uz";
  const meta = [
    { label: "Hudud", value: profile.current_location },
    { label: "Tug‘ilgan yili", value: profile.birth_year_display },
  ].filter((item): item is { label: string; value: string } => Boolean(item.value));
  const ranking = rankingView(profile.position, profile.total_score, profile.ranking.hasRow);

  return (
    <section className="ig-hero" aria-label={profile.full_name}>
      <div className="ig-hero__bg" aria-hidden />

      <div className="ig-wrap ig-hero__inner">
        <Figure profile={profile} cutout={cutout} />

        <div className="ig-copy">
          <p className="ig-eyebrow">
            <span className="ig-eyebrow__label">{eyebrow}</span>
            {profile.is_top100 && (
              <span className="ig-badge">
                TOP 100{profile.top100_position ? ` · №${profile.top100_position}` : ""}
              </span>
            )}
          </p>

          {/*
            ISM — SAHIFANING ASOSIY ELEMENTI. Qatorlar orasidagi bo'sh joy
            matn tugunlari: ekran o'quvchisi va qidiruv ismni so'zma-so'z
            ajratib o'qiydi, qatorlar esa vizual blok bo'lib qoladi.
          */}
          <h1 className={`ig-name${name.long ? " ig-name--long" : ""}`}>
            {name.primary.map((word, index) => (
              <span key={`${word}-${index}`}>
                <span className="ig-name__line">
                  <span style={{ "--i": index } as Vars}>{word}</span>
                </span>{" "}
              </span>
            ))}
            {name.secondary && <span className="ig-name__sub">{name.secondary}</span>}
          </h1>

          <span className="ig-hero-rule" aria-hidden />

          {role && (
            <p className="ig-role ig-seq" style={{ "--i": 0 } as Vars}>
              {role}
            </p>
          )}
          {tags.length > 0 && (
            <div className="ig-tags ig-seq" style={{ "--i": 1 } as Vars}>
              <ul aria-label="Qisqa tavsif">
                {tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            </div>
          )}

          {meta.length > 0 && (
            <dl className="ig-meta ig-seq" style={{ "--i": 2 } as Vars}>
              {meta.map((item) => (
                <div key={item.label}>
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
          )}

          {/* HAQIQIY KO'RSATKICHLAR — reyting dvigateli va ko'rishlar hisobidan. */}
          <dl className="ig-stats ig-seq" style={{ "--i": 3 } as Vars}>
            <div className="ig-stat">
              <dt className="ig-stat__label">Umumiy reyting</dt>
              <dd>
                {ranking.kind === "position" ? (
                  <span className="ig-stat__value">
                    {ranking.value}
                    <span className="ig-stat__unit">-o‘rin</span>
                  </span>
                ) : (
                  <span className="ig-stat__word">
                    {ranking.kind === "pending" ? "hisoblanmoqda" : "hali shakllanmagan"}
                  </span>
                )}
              </dd>
            </div>
            <div className="ig-stat">
              <dt className="ig-stat__label">Reyting balli</dt>
              <dd className="ig-stat__value">
                {scoreText(profile.total_score)}
                {/* MAXRAJ — "7" emas, "7.0 / 100": raqam o'z shkalasi bilan ma'noga ega. */}
                <span className="ig-stat__unit"> {RANKING_SCORE_UNIT}</span>
              </dd>
            </div>
            <div className="ig-stat">
              <dt className="ig-stat__label">Ko‘rishlar</dt>
              <dd className="ig-stat__value">{formatNumber(profile.view_count)}</dd>
            </div>
          </dl>

          {hasBiography && (
            <div className="ig-actions ig-seq" style={{ "--i": 4 } as Vars}>
              <a href="#biografiya" className="ig-btn">
                Biografiya
                <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden>
                  <path d="M7 1.5v11M2.5 8L7 12.5 11.5 8" />
                </svg>
              </a>
            </div>
          )}
        </div>
      </div>

      <span className="ig-hero__floor" aria-hidden />
    </section>
  );
}

/**
 * PORTRET VA RAMKA.
 *
 * Uch holat, bittasi ko'rsatiladi (portret HECH QACHON ikki marta emas):
 *   1. Post Studio fonsiz portreti — ramka oldida, boshi ramkadan chiqadi;
 *   2. faqat profil rasmi — ramka ichida, pastda fonga eriydi;
 *   3. rasm yo'q — ramka ichida bosh harflar.
 */
function Figure({ profile, cutout }: { profile: ThemeProfile; cutout: PortraitCutout | null }) {
  const framed = !cutout && Boolean(profile.avatar_url);

  return (
    <div className="ig-figure">
      <div className="ig-stage">
        {/*
          ORQA FON — ZAMONAVIY EDITORIAL RAMKA, ME'MORIY RAVOQ EMAS.
          Ikki qavat ingichka tilla ramka; odamning boshi yuqori chiziqdan
          chiqib turadi ("ramkadan chiqish"). Yuqoridan tushgan yumshoq
          yorug'lik ustuni chuqurlik beradi.
        */}
        <span className="ig-beam" aria-hidden />
        <div className="ig-frame" aria-hidden>
          <span className="ig-frame__ghost" />
          <span className="ig-frame__line ig-frame__line--top" />
          <span className="ig-frame__line ig-frame__line--left" />
          <span className="ig-frame__line ig-frame__line--right" />
          <span className="ig-frame__node ig-frame__node--l" />
          <span className="ig-frame__node ig-frame__node--r" />
        </div>

        {cutout ? (
          <div className="ig-portrait">
            <Image
              src={cutout.url}
              alt={profile.full_name}
              fill
              preload
              sizes="(min-width: 1024px) 620px, (min-width: 640px) 500px, 92vw"
            />
          </div>
        ) : framed && profile.avatar_url ? (
          <>
            <div className="ig-portrait ig-portrait--framed">
              <Image
                src={profile.avatar_url}
                alt={profile.full_name}
                fill
                preload
                sizes="(min-width: 1024px) 460px, (min-width: 640px) 380px, 74vw"
              />
            </div>
          </>
        ) : (
          <span className="ig-monogram" aria-hidden>
            {monogram(profile.full_name)}
          </span>
        )}
      </div>
    </div>
  );
}

/** Kichik romb belgisi — bob va yakun ajratgichi. */
function Mark() {
  return (
    <svg viewBox="-12 -12 24 24" aria-hidden>
      <rect x="-6" y="-6" width="12" height="12" transform="rotate(45)" />
      <circle r="1.4" />
    </svg>
  );
}

/* ========================================================================= *
 * BOBLAR
 * ========================================================================= */

interface Chapter {
  id: string;
  /** Navigatsiyadagi qisqa nom. */
  label: string;
  title: string;
  note?: string;
  wide?: boolean;
  body: ReactNode;
}

function ChapterFrame({ chapter, index }: { chapter: Chapter; index: number }) {
  return (
    <section
      id={chapter.id}
      className={`ig-chapter${chapter.wide ? " ig-chapter--wide" : ""}`}
      aria-labelledby={`${chapter.id}-title`}
    >
      <div className="ig-wrap ig-chapter__grid">
        <header className="ig-chapter__head" data-ig-reveal>
          <p className="ig-chapter__index" aria-hidden>
            <span>{chapterNumber(index)}</span>
            <span className="ig-rule" />
          </p>
          <h2 id={`${chapter.id}-title`} className="ig-h2">
            {chapter.title}
          </h2>
          {chapter.note && <p className="ig-chapter__note">{chapter.note}</p>}
        </header>
        <div className="min-w-0">{chapter.body}</div>
      </div>
    </section>
  );
}

function buildChapters(
  profile: ThemeProfile,
  extras: ThemeExtras | undefined,
  restQuotes: { id: string; text: string }[],
): Chapter[] {
  return [
    biographyChapter(profile),
    pathChapter(profile),
    honoursChapter(profile),
    certificatesChapter(profile),
    booksChapter(profile),
    journalChapter(profile, extras),
    podcastsChapter(extras),
    galleryChapter(profile),
    quotesChapter(restQuotes),
  ].filter((chapter): chapter is Chapter => chapter !== null);
}

/* ------------------------------------------------------------ BIOGRAFIYA */

function biographyChapter(profile: ThemeProfile): Chapter | null {
  const facts = [
    { label: "Tug‘ilgan yili", value: profile.birth_year_display },
    { label: "Tug‘ilgan joyi", value: profile.birth_place },
    { label: "Yashash hududi", value: profile.current_location },
    { label: "Ta’lim", value: profile.education_summary },
    { label: "Faoliyat sohasi", value: profile.activity_field },
  ].filter((fact): fact is { label: string; value: string } => Boolean(fact.value?.trim()));
  const languages = profile.languages ?? [];

  /*
   * MATN MANBAI — standart sahifa bilan bir xil tartib: tuzilgan bo'limlar
   * bo'lsa ular, bo'lmasa biografiya maqolasi.
   */
  const parts =
    profile.sections.length > 0
      ? profile.sections.map((section) => ({
          id: section.id,
          title: section.title?.trim() || null,
          paragraphs: toParagraphs(section.content),
        }))
      : profile.articles.map((article) => ({
          id: String(article.id),
          title: null,
          paragraphs: toParagraphs(article.content as string | null),
        }));
  const story = parts.filter((part) => part.title || part.paragraphs.length > 0);

  if (facts.length === 0 && languages.length === 0 && story.length === 0) return null;

  const minutes = readingMinutes(story.flatMap((part) => part.paragraphs).join(" "));
  const numbered = story.length > 1 && story.some((part) => part.title);

  return {
    id: "biografiya",
    label: "Biografiya",
    title: "Biografiya",
    note: story.length > 0 ? `${minutes} daqiqa o‘qish` : undefined,
    body: (
      <>
        {(facts.length > 0 || languages.length > 0) && (
          <dl className="ig-facts ig-block" data-ig-reveal>
            {facts.map((fact) => (
              <div key={fact.label} className={`ig-fact${fact.value.length > 46 ? " ig-fact--wide" : ""}`}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
            {languages.length > 0 && (
              <div className="ig-fact ig-fact--wide">
                <dt>Tillar</dt>
                <dd className="ig-langs">
                  {languages.map((language) => (
                    <span key={language}>{language}</span>
                  ))}
                </dd>
              </div>
            )}
          </dl>
        )}

        {story.length > 0 && (
          <div className="ig-story ig-block" lang="uz">
            {story.map((part, partIndex) => (
              <article key={part.id} className="ig-story__part" data-ig-reveal>
                {part.title && (
                  <div className="ig-story__head">
                    {numbered && (
                      <span className="ig-story__num" aria-hidden>
                        {roman(partIndex + 1)}
                      </span>
                    )}
                    <h3>{part.title}</h3>
                  </div>
                )}
                <div className={`ig-prose${numbered ? " ig-story__body" : ""}`}>
                  {part.paragraphs.map((paragraph, index) => (
                    <p key={index} className={partIndex === 0 && index === 0 ? "ig-lead" : undefined}>
                      {paragraph}
                    </p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </>
    ),
  };
}

/* ------------------------------------------------------------ HAYOT YO'LI */

function pathChapter(profile: ThemeProfile): Chapter | null {
  const work = toTimeline(profile.workExperience ?? []);
  const education = toTimeline(profile.education ?? []);
  if (work.length === 0 && education.length === 0) return null;

  return {
    id: "hayot-yoli",
    label: "Hayot yo‘li",
    title: "Hayot yo‘li",
    body: (
      <div className={`ig-path${work.length > 0 && education.length > 0 ? " ig-path--two" : ""}`}>
        {work.length > 0 && <Steps label="Faoliyat" items={work} />}
        {education.length > 0 && <Steps label="Ta’lim" items={education} />}
      </div>
    ),
  };
}

function Steps({ label, items }: { label: string; items: TimelineItem[] }) {
  return (
    <div data-ig-reveal>
      <h3 className="ig-sub">{label}</h3>
      <ol className="ig-steps">
        {items.map((item) => (
          <li key={item.id} className="ig-step">
            {item.from && <p className="ig-when">{range(item.from, item.to)}</p>}
            <p className="ig-step__title">{item.title}</p>
            {item.subtitle && <p className="ig-step__sub">{item.subtitle}</p>}
            {item.description && <p className="ig-step__desc">{item.description}</p>}
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ------------------------------------------------------------ YUTUQLAR */

function honoursChapter(profile: ThemeProfile): Chapter | null {
  const achievements = toTimeline(profile.achievements ?? []);
  const events = toTimeline(profile.events ?? []);
  if (achievements.length === 0 && events.length === 0) return null;

  const title = achievements.length > 0 ? "Yutuqlar" : "Tadbirlar";
  return {
    id: "yutuqlar",
    label: title,
    title,
    body: (
      <>
        {achievements.length > 0 && <Rows items={achievements} />}
        {events.length > 0 && (
          <div className="ig-block">
            {achievements.length > 0 && <h3 className="ig-sub">Tadbirlar</h3>}
            <Rows items={events} />
          </div>
        )}
      </>
    ),
  };
}

function Rows({ items }: { items: TimelineItem[] }) {
  return (
    <ol className="ig-rows">
      {items.map((item, index) => {
        const url = safeUrl(item.url);
        return (
          <li key={item.id} className="ig-row" data-ig-reveal style={{ "--d": `${Math.min(index, 4) * 70}ms` } as Vars}>
            <span className="ig-row__n" aria-hidden>
              {chapterNumber(index)}
            </span>
            <div className="min-w-0">
              <p className="ig-row__title">{item.title}</p>
              {item.subtitle && <p className="ig-row__sub">{item.subtitle}</p>}
              {item.description && <p className="ig-row__desc">{item.description}</p>}
            </div>
            {(item.from || url) && (
              <div className="ig-row__aside">
                {item.from && <span className="ig-when">{year(item.from)}</span>}
                {url && <ExternalArrow href={url} label="Manba" />}
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

/* ------------------------------------------------------------ SERTIFIKATLAR */

function certificatesChapter(profile: ThemeProfile): Chapter | null {
  const certificates = profile.certificates ?? [];
  if (certificates.length === 0) return null;

  return {
    id: "sertifikatlar",
    label: "Sertifikatlar",
    title: "Sertifikatlar",
    body: (
      <ol className="ig-rows">
        {certificates.map((certificate, index) => {
          const url = safeUrl(certificate.credential_url as string | null);
          return (
            <li key={certificate.id} className="ig-row" data-ig-reveal style={{ "--d": `${Math.min(index, 4) * 70}ms` } as Vars}>
              <span className="ig-row__n" aria-hidden>
                {chapterNumber(index)}
              </span>
              <div className="min-w-0">
                <p className="ig-row__title">{certificate.title}</p>
                {(certificate.issuer || certificate.issued_on) && (
                  <p className="ig-row__sub">
                    {[certificate.issuer, year(certificate.issued_on as string | null)].filter(Boolean).join(" · ")}
                  </p>
                )}
              </div>
              <div className="ig-row__aside">
                {/*
                  ISHONCH BELGISI — DIZAYNDAN QAT'I NAZAR (§8): "Foydalanuvchi
                  kiritgan" va "Tasdiqlangan" farqi o'quvchiga aytilishi SHART.
                */}
                <span className={`ig-trust${isVerified(certificate.trust) ? " ig-trust--ok" : ""}`}>
                  {trustLabel(certificate.trust)}
                </span>
                {url && <ExternalArrow href={url} label="Hujjat" />}
              </div>
            </li>
          );
        })}
      </ol>
    ),
  };
}

/* ------------------------------------------------------------ KITOBLAR */

function booksChapter(profile: ThemeProfile): Chapter | null {
  const items = profile.adabiyotXItems ?? [];
  const ownWorks = items.filter((item) => item.relationshipType === "own_work");
  const readBooks = items.filter(
    (item) => item.relationshipType === "read_book" && item.contentType === "book",
  );
  const manual = profile.booksRead ?? [];
  if (ownWorks.length === 0 && readBooks.length === 0 && manual.length === 0) return null;

  const hasReading = readBooks.length > 0 || manual.length > 0;
  const title = ownWorks.length > 0 ? (hasReading ? "Ijod va kitoblar" : "Ijodiy ishlari") : "Kitoblar";

  return {
    id: "kitoblar",
    label: ownWorks.length > 0 && !hasReading ? "Ijod" : "Kitoblar",
    title,
    body: (
      <>
        {ownWorks.length > 0 && (
          <div className="ig-block" data-ig-reveal>
            {hasReading && <h3 className="ig-sub">Ijodiy ishlari</h3>}
            <Shelf items={ownWorks} />
          </div>
        )}
        {readBooks.length > 0 && (
          <div className="ig-block" data-ig-reveal>
            <h3 className="ig-sub">O‘qigan kitoblari</h3>
            <Shelf items={readBooks} />
          </div>
        )}
        {manual.length > 0 && (
          <div className="ig-block" data-ig-reveal>
            <h3 className="ig-sub">{readBooks.length > 0 ? "Boshqa o‘qigan kitoblari" : "O‘qigan kitoblari"}</h3>
            <ul className="ig-simple">
              {manual.map((book) => (
                <li key={String(book.id)}>
                  <b>{String(book.title ?? "")}</b>
                  {book.subtitle && <span>{String(book.subtitle)}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </>
    ),
  };
}

function Shelf({ items }: { items: ThemeProfile["adabiyotXItems"] }) {
  return (
    <ul className="ig-shelf">
      {items.map((item) => {
        const href = safeUrl(item.externalUrl);
        const cover = safeUrl(item.coverUrl);
        const content = (
          <>
            <span className="ig-book__cover">
              {cover ? (
                // Muqovalar AdabiyotX domenida — `next/image` ruxsat ro'yxatida yo'q.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cover} alt="" loading="lazy" decoding="async" />
              ) : (
                <span className="ig-book__blank">{item.title}</span>
              )}
            </span>
            <span className="ig-book__title">{item.title}</span>
            {item.authorName && <span className="ig-book__author">{item.authorName}</span>}
          </>
        );
        return (
          <li key={item.id}>
            {href ? (
              <a href={href} target="_blank" rel="noopener noreferrer" className="ig-book">
                {content}
              </a>
            ) : (
              <div className="ig-book">{content}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/* ------------------------------------------------------------ MAQOLALAR / PODCASTLAR */

/** `next/image` faqat ruxsat etilgan hostlardan oladi (`next.config.ts`). */
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

function journalChapter(profile: ThemeProfile, extras: ThemeExtras | undefined): Chapter | null {
  const entries = [
    /*
     * A'ZONING O'Z MAQOLALARI — avval, chunki bular uning o'zi yozgani.
     * Muallif kabinetda yashirganlari bu yerga kelmaydi (`show_on_profile`).
     */
    ...(profile.memberArticles ?? []).map((m) => ({
      id: `m-${m.id}`,
      href: m.href,
      title: m.title,
      meta: m.publishedAt ? `Liderlar Online · ${formatDateUz(m.publishedAt)}` : "Liderlar Online",
      image: optimizable(m.heroUrl),
    })),
    ...(extras?.journalArticles ?? []).map((article) => ({
      id: `j-${article.id}`,
      href: `/jurnal/maqola/${article.slug}`,
      title: String(article.title ?? ""),
      meta: article.journal ? `Liderlar Online · ${article.journal.issue_number}-son` : "Liderlar Online",
      image: optimizable(article.cover_url),
    })),
  ];
  if (entries.length === 0) return null;

  return {
    id: "maqolalar",
    label: "Maqolalar",
    title: "Maqolalar",
    body: (
      <ul className="ig-entries">
        {entries.map((entry) => (
          <li key={entry.id} data-ig-reveal>
            <Entry href={entry.href} title={entry.title} meta={entry.meta} image={entry.image} />
          </li>
        ))}
      </ul>
    ),
  };
}

function podcastsChapter(extras: ThemeExtras | undefined): Chapter | null {
  const podcasts = extras?.podcasts ?? [];
  if (podcasts.length === 0) return null;

  return {
    id: "podcastlar",
    label: "Podcastlar",
    title: "Podcastlar",
    body: (
      <ul className="ig-entries">
        {podcasts.map((podcast) => (
          <li key={podcast.id} data-ig-reveal>
            <Entry
              href={`/podcastlar/${podcast.slug}`}
              title={String(podcast.title ?? "")}
              meta={formatDateUz(podcast.starts_at) || "Podcast"}
              image={optimizable(podcast.banner_url)}
            />
          </li>
        ))}
      </ul>
    ),
  };
}

function Entry({ href, title, meta, image }: { href: string; title: string; meta: string; image: string | null }) {
  return (
    <Link href={href} className="ig-entry">
      <span className="ig-entry__thumb">
        {image && <Image src={image} alt="" fill sizes="72px" loading="lazy" />}
      </span>
      <span className="min-w-0">
        <span className="ig-entry__title block">{title}</span>
        <span className="ig-entry__meta block">{meta}</span>
      </span>
      <span className="ig-entry__go" aria-hidden>
        <ArrowIcon />
      </span>
    </Link>
  );
}

/* ------------------------------------------------------------ GALEREYA */

const GALLERY_SIZES = {
  big: "(min-width: 1280px) 820px, (min-width: 768px) 64vw, 100vw",
  small: "(min-width: 1280px) 400px, (min-width: 768px) 32vw, 50vw",
};

function galleryChapter(profile: ThemeProfile): Chapter | null {
  const visible = withoutPortrait(profile.media ?? [], profile.avatar_url);
  if (visible.length === 0) return null;
  const media = visible.map((item, index) => ({
    url: String(item.url),
    caption: item.caption ?? null,
    alt: item.caption ?? `${profile.full_name} — galereya rasmi`,
    thumb: (
      <Image
        src={String(item.url)}
        alt={item.caption ?? `${profile.full_name} — galereya rasmi`}
        fill
        sizes={index === 0 || index === 6 || visible.length <= 2 ? GALLERY_SIZES.big : GALLERY_SIZES.small}
        loading="lazy"
      />
    ),
  }));

  return {
    id: "galereya",
    label: "Galereya",
    title: "Galereya",
    note: `${media.length} ta surat`,
    wide: true,
    body: <IgGallery items={media} name={profile.full_name} fontClassName={FONT_CLASSES} />,
  };
}

/* ------------------------------------------------------------ IQTIBOSLAR */

function quotesChapter(quotes: { id: string; text: string }[]): Chapter | null {
  if (quotes.length === 0) return null;
  return {
    id: "iqtiboslar",
    label: "Iqtiboslar",
    title: "Iqtiboslar",
    body: (
      <div className="ig-quotes">
        {quotes.map((quote) => (
          <blockquote key={quote.id} data-ig-reveal>
            {quote.text}
          </blockquote>
        ))}
      </div>
    ),
  };
}

/**
 * BIRINCHI IQTIBOS — boblar orasidagi "nafas". Editorial nashrlardagi
 * katta ajratilgan iqtibos usuli; muallif — sahifa egasi.
 */
function Interlude({ text, name }: { text: string; name: string }) {
  return (
    <section className="ig-interlude" aria-label="Iqtibos">
      <div className="ig-wrap" data-ig-reveal>
        <svg className="ig-quote-mark" viewBox="0 0 40 40" fill="currentColor" aria-hidden>
          <path d="M8 30c0-8.5 3.6-15 10.8-19.4l1.4 2.2C15.5 16 13.3 19.6 13 24h5v10H8v-4zm16 0c0-8.5 3.6-15 10.8-19.4l1.4 2.2C31.5 16 29.3 19.6 29 24h5v10H24v-4z" />
        </svg>
        <blockquote className="ig-quote">{text}</blockquote>
        <p className="ig-quote-by">{name}</p>
      </div>
    </section>
  );
}

/* ========================================================================= *
 * YAKUN
 * ========================================================================= */

function Outro({ profile, promoCode }: { profile: ThemeProfile; promoCode: string | null }) {
  const links = (profile.socialLinks ?? [])
    .map((link) => ({ id: String(link.id), url: safeUrl(String(link.url ?? "")), title: String(link.title ?? "Havola") }))
    .filter((link): link is { id: string; url: string; title: string } => Boolean(link.url));
  const role = profile.description_items?.[0] ?? profile.category?.name ?? null;

  return (
    <section className="ig-outro" aria-label="Aloqa">
      <div className="ig-wrap" data-ig-reveal>
        <div className="ig-outro__mark" aria-hidden>
          <Mark />
        </div>
        <p className="ig-outro__name">{profile.full_name}</p>
        {role && <p className="ig-outro__role">{role}</p>}

        {links.length > 0 && (
          <ul className="ig-socials">
            {links.map((link) => (
              <li key={link.id}>
                {/* Foydalanuvchi kiritgan havola: SEO vazni berilmaydi, manba uzatilmaydi. */}
                <a href={link.url} target="_blank" rel="noopener noreferrer nofollow">
                  <span className="ig-link">{link.title}</span>
                  <ArrowIcon />
                </a>
              </li>
            ))}
          </ul>
        )}

        {promoCode && <IgPromoCode code={promoCode} name={profile.full_name} />}
      </div>
    </section>
  );
}

/* ========================================================================= *
 * KICHIK BELGILAR
 * ========================================================================= */

function ArrowIcon() {
  return (
    <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden>
      <path d="M3 9L9 3M4 3h5v5" />
    </svg>
  );
}

function ExternalArrow({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer nofollow" className="ig-arrow">
      {label}
      <ArrowIcon />
    </a>
  );
}
