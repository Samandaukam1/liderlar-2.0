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
import type { PortraitCutout } from "@/lib/themes/portrait-cutout";
import { RnDock, RnMotion, RnPromo, RnShare } from "./client";
import { rnDisplay, rnMono, rnSans, rnScript } from "./fonts";
import { royalNavyCss } from "./styles";

/**
 * ROYAL NAVY — davlat, diplomatiya, institut.
 *
 * Kelajak tilida aytilgan jiddiylik: qora-ko'k fazo, ortda sekin oquvchi
 * kobalt va muzdek moviy yorug'lik ("aurora"), uning ustida SUYUQ SHISHA
 * (liquid glass) panellar — fonni xiralashtiradi, chetida sindiradi va
 * yuqori qirrasida yorug'likni aks ettiradi. Naqsh va bezak yo'q; oltin
 * faqat ism va imzoda — sovuq paneldagi yagona iliq metall.
 *
 * KOMPOZITSIYA BOSHQA DIZAYNLARDAN TUBDAN FARQ QILADI (§9):
 *
 *   - BENTO HERO. Hero bitta "rasm + ism" emas, turli o'lchamdagi shisha
 *     plitkalardan tuzilgan boshqaruv paneli: ism plitkasi, baland portret
 *     plitkasi, ko'rsatkich plitkalari. Portret ustida esa yana bitta
 *     shisha panel suzadi — u ortidagi suratni sindiradi.
 *   - MA'LUMOTNOMA — har bir fakt alohida shisha katak.
 *   - BIOGRAFIYA — chapda yopishqoq mundarija, o'ngda o'qish ustuni
 *     (zamonaviy hujjat sahifasi kabi).
 *   - XIZMAT YO'LI — jurnal qatorlari: sana, lavozim, tur.
 *   - Keng ekranda pastda suzuvchi shisha "dok" — bo'limlar navigatsiyasi.
 *
 * Komponent hech qanday so'rov qilmaydi (§11, §49): hammasi `profile` va
 * sahifa yuklagan `extras` dan. Soxta ma'lumot yo'q — bo'sh bo'lim
 * umuman chizilmaydi.
 */

/* PALITRA — dizayn o'z ranglarini o'zi tashiydi. */
const VOID = "#03050b";
const COBALT = "#2b5cff";
const ELECTRIC = "#4d8dff";
const ICE = "#9cc8ff";
const TEXT = "#eef3ff";

type Vars = CSSProperties & Record<`--${string}`, string | number>;

export default function RoyalNavyTheme({ profile, extras }: ThemeProps) {
  const quotes = (profile.quotes ?? [])
    .map((quote) => ({ id: String(quote.id), text: String(quote.text ?? "").trim() }))
    .filter((quote) => quote.text);
  const sections = buildSections(profile, extras, quotes.slice(1));
  const story = storyParts(profile);

  return (
    <div data-rn-root className={`rn ${rnDisplay.variable} ${rnSans.variable} ${rnMono.variable} ${rnScript.variable}`}>
      <style
        dangerouslySetInnerHTML={{
          __html: royalNavyCss({ void: VOID, cobalt: COBALT, electric: ELECTRIC, ice: ICE, text: TEXT }),
        }}
      />
      <Defs />
      <RnMotion />

      {/*
        AURORA — butun dizayn ortidagi yorug'lik. Yopishqoq qatlam: sahifa
        aylanganda ham ko'rinishda qoladi, shuning uchun har bir shisha
        panel ortida sindiradigan narsa bor. Dizayn chegarasidan chiqmaydi.
      */}
      <div className="rn-backdrop" aria-hidden>
        <div className="rn-backdrop__inner">
          <i className="rn-aurora rn-aurora--a" />
          <i className="rn-aurora rn-aurora--b" />
          <i className="rn-aurora rn-aurora--c" />
          <i className="rn-aurora rn-aurora--d" />
          <i className="rn-dots" />
        </div>
      </div>

      <Hero
        profile={profile}
        cutout={extras?.portraitCutout ?? null}
        promoCode={extras?.promoCode ?? null}
        storyMinutes={story.length > 0 ? storyMinutes(story) : null}
      />
      <Dossier profile={profile} />

      {sections.map((section, index) => (
        <Section key={section.id} section={section} index={index} />
      ))}

      {quotes[0] && <Interlude text={quotes[0].text} name={profile.full_name} />}
      <Outro profile={profile} />

      <RnDock items={sections.map((s, i) => ({ id: s.id, no: chapterNumber(i), title: s.short ?? s.title }))} />
    </div>
  );
}

/* ========================================================================= *
 * SUYUQ SHISHA LINZASI
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
  { id: "rn-lens", x: rampMap("r", 0.1), y: rampMap("g", 0.14), scale: 40 },
  /* Keng va past panellar (dok, yakun): gorizontal zona tor, vertikal keng. */
  { id: "rn-lens-wide", x: rampMap("r", 0.035), y: rampMap("g", 0.3), scale: 30 },
];

/** Linza filtrlari — butun dizayn uchun BITTA yashirin `<svg>` da. */
function Defs() {
  return (
    <svg className="rn-defs" aria-hidden focusable="false">
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
 * HERO — BENTO PANEL
 * ========================================================================= */

function Hero({
  profile,
  cutout,
  promoCode,
  storyMinutes,
}: {
  profile: ThemeProfile;
  cutout: PortraitCutout | null;
  promoCode: string | null;
  /** Biografiya bo'lsa — o'qish vaqti; yo'q bo'lsa `null`. */
  storyMinutes: number | null;
}) {
  const name = splitName(profile.full_name);
  const items = profile.description_items ?? [];

  return (
    <header className="rn-hero" data-rn-hero aria-label={profile.full_name}>
      <div className="rn-wrap rn-bento">
        {/* ------------------------------------------- ISM PLITKASI */}
        <div className="rn-tile rn-tile--name rn-glass rn-lens" style={{ "--i": 0 } as Vars}>
          <div className="rn-name-top">
            <p className="rn-pill">
              <i aria-hidden />
              Liderlar ensiklopediyasi
            </p>
            {profile.is_top100 && (
              <p className="rn-pill rn-pill--accent">
                TOP 100{profile.top100_position ? ` · №${profile.top100_position}` : ""}
              </p>
            )}
          </div>

          <div className="rn-name-body">
            {/*
              ISM O'LCHAMI ENG UZUN SO'ZGA MOSLANADI: "MUHAMMADYUSUF" kabi uzun
              so'z ham bitta qatorda qoladi va o'rtasidan bo'linmaydi. `h1`
              ichida ism to'liq matn — qidiruv va ekran o'quvchisi uchun.
            */}
            <h1 className="rn-name" style={{ "--rn-ch": longestWord(name.primary) } as Vars}>
              {name.primary.map((word, index) => (
                <span key={`${word}-${index}`} className="rn-name__line">
                  <span style={{ "--i": index } as Vars}>{word}</span>
                </span>
              ))}
              {name.secondary && <span className="rn-name__sub">{name.secondary}</span>}
            </h1>

            {items.length > 0 && (
              <p className="rn-role">
                <b>{items[0]}</b>
                {items.length > 1 && <span>{items.slice(1, 4).join("  ·  ")}</span>}
              </p>
            )}

            <div className="rn-actions">
              {storyMinutes !== null && (
                <a href="#biografiya" className="rn-btn rn-btn--solid">
                  Biografiya
                  <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                    <path d="M7 1.5v11M2.5 8L7 12.5 11.5 8" />
                  </svg>
                </a>
              )}
              <RnShare name={profile.full_name} />
            </div>
          </div>
        </div>

        {/* ------------------------------------------- PORTRET PLITKASI */}
        <Portrait profile={profile} cutout={cutout} promoCode={promoCode} storyMinutes={storyMinutes} />

        {/* ------------------------------------------- KO'RSATKICHLAR */}
        <RankTile profile={profile} />
        <ScoreTile score={profile.total_score} />
        <ViewsTile views={profile.view_count} />
      </div>
    </header>
  );
}

/**
 * PORTRET PLITKASI.
 *
 * Post Studio yasagan FONSIZ portret bo'lsa, odam plitka tubida turadi va
 * ortida kobalt yorug'lik hamda nozik koordinata to'ri ko'rinadi. Kesma
 * ataylab oq-qora saqlanadi (post kartochkalari uslubi) va shunday qoladi:
 * kobalt fonda oq-qora portret jiddiy va zamonaviy o'qiladi.
 *
 * Kesma yo'q bo'lsa — profil rasmi plitkani to'liq egallaydi. Rasm umuman
 * yo'q bo'lsa — monogramma.
 *
 * PORTRET USTIDA — OLTIN IMZO: ism va familiya qo'lyozma (Great Vibes)
 * shriftida, o'ng tomonda, xuddi qo'lda yozilgandek chapdan o'ngga ochiladi.
 *
 * PASTDA SUZUVCHI SHISHA: yo'nalish va hudud, o'ng tomonda promo kod yoki
 * biografiyaga havola. U portretning o'zini sindiradi — suyuq shishaning
 * eng yaqqol ko'rinadigan joyi.
 */
function Portrait({
  profile,
  cutout,
  promoCode,
  storyMinutes,
}: {
  profile: ThemeProfile;
  cutout: PortraitCutout | null;
  promoCode: string | null;
  storyMinutes: number | null;
}) {
  const facts = [profile.category?.name, profile.region?.name].filter((v): v is string => Boolean(v?.trim()));
  const hasSide = Boolean(promoCode) || storyMinutes !== null;
  const signature = signatureOf(profile.full_name);

  return (
    <figure className="rn-tile rn-tile--portrait" data-rn-tilt style={{ "--i": 1 } as Vars}>
      <span className="rn-portrait__field" aria-hidden />
      {cutout ? (
        <span className="rn-portrait__cut">
          <Image src={cutout.url} alt={profile.full_name} fill preload sizes="(min-width: 1080px) 520px, 94vw" />
        </span>
      ) : profile.avatar_url ? (
        <span className="rn-portrait__photo">
          <Image src={profile.avatar_url} alt={profile.full_name} fill preload sizes="(min-width: 1080px) 520px, 94vw" />
        </span>
      ) : (
        <span className="rn-portrait__mono" aria-hidden>
          {monogram(profile.full_name)}
        </span>
      )}
      <span className="rn-portrait__shade" aria-hidden />

      <div className="rn-portrait__foot">
        {/* Imzo — bezak: ism `h1` da to'liq turibdi. */}
        {signature && (
          <div className="rn-words" aria-hidden>
            <p className="rn-words__sign" style={{ "--rn-sl": signature.length } as Vars}>
              <span>{signature}</span>
            </p>
          </div>
        )}

        {(facts.length > 0 || hasSide) && (
          <figcaption className="rn-cap rn-glass rn-lens">
            {facts.length > 0 && (
              <div className="rn-cap__main">
                <p className="rn-label">Yo‘nalish</p>
                <p className="rn-cap__v">{facts.join(" · ")}</p>
              </div>
            )}
            {promoCode ? (
              <RnPromo code={promoCode} name={profile.full_name} />
            ) : (
              storyMinutes !== null && (
                <a href="#biografiya" className="rn-cap__side rn-cap__link">
                  <span className="rn-label">Hayot yo‘li</span>
                  <span className="rn-cap__v">
                    {storyMinutes} daqiqa o‘qish
                    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                      <path d="M7 1.5v11M2.5 8L7 12.5 11.5 8" />
                    </svg>
                  </span>
                </a>
              )
            )}
          </figcaption>
        )}
      </div>
    </figure>
  );
}

/**
 * Imzo matni: "Ism Familiya" — odam o'zini shunday imzolaydi (bazada
 * "Familiya Ism Otasining-ismi" tartibida). Katta-kichik harf bazada har
 * xil kelishi mumkin ("OCHILOVA BARNO"), imzo uchun bir xillashtiriladi.
 */
function signatureOf(fullName: string): string {
  const [family, given] = splitName(fullName).primary.map((word) => {
    const [first = "", ...rest] = Array.from(word.toLocaleLowerCase("uz"));
    return first.toLocaleUpperCase("uz") + rest.join("");
  });
  return [given, family].filter(Boolean).join(" ");
}

function longestWord(words: string[]): number {
  return Math.max(6, words.reduce((max, word) => Math.max(max, word.length), 0));
}

/* ------------------------------------------------- KO'RSATKICH PLITKALARI */

function RankTile({ profile }: { profile: ThemeProfile }) {
  const ranking = rankingView(profile.position, profile.total_score, profile.ranking.hasRow);
  const delta = ranking.kind === "position" ? rankDelta(profile.position, profile.previous_position) : 0;

  return (
    <div className="rn-tile rn-tile--metric rn-glass rn-lens" style={{ "--i": 2 } as Vars}>
      <p className="rn-label">
        <MetricIcon d="M4 2h8v3a4 4 0 01-8 0zM4 3H2v1a3 3 0 003 3M12 3h2v1a3 3 0 01-3 3M6 14h4M8 9v5" />
        Umumiy reyting
      </p>
      <p className="rn-metric">
        {ranking.kind === "position" ? (
          <>
            <small>#</small>
            {ranking.value}
          </>
        ) : (
          <u>{ranking.kind === "pending" ? "Hisoblanmoqda" : "Shakllanmoqda"}</u>
        )}
      </p>
      {delta !== 0 && (
        <p className={`rn-delta ${delta > 0 ? "rn-delta--up" : "rn-delta--down"}`}>
          {delta > 0 ? `▲ ${delta}` : `▼ ${Math.abs(delta)}`} o‘rin
        </p>
      )}
    </div>
  );
}

/** Ball — maxraji bilan va 100 lik shkala bo'yicha ingichka chiziq. */
function ScoreTile({ score }: { score: number }) {
  const share = Math.max(0, Math.min(1, (Number.isFinite(score) ? score : 0) / 100));

  return (
    <div className="rn-tile rn-tile--metric rn-glass rn-lens" style={{ "--i": 3 } as Vars}>
      <p className="rn-label">
        <MetricIcon d="M8 1.8l1.9 3.9 4.3.6-3.1 3 .7 4.3L8 11.6l-3.8 2 .7-4.3-3.1-3 4.3-.6z" />
        Reyting balli
      </p>
      <p className="rn-metric">
        {scoreText(score)}
        <i>{RANKING_SCORE_UNIT}</i>
      </p>
      <span className="rn-meter" aria-hidden>
        <i style={{ "--rn-fill": share.toFixed(4) } as Vars} />
      </span>
    </div>
  );
}

function ViewsTile({ views }: { views: number }) {
  return (
    <div className="rn-tile rn-tile--metric rn-glass rn-lens" style={{ "--i": 4 } as Vars}>
      <p className="rn-label">
        <MetricIcon d="M1 8s2.6-4.5 7-4.5S15 8 15 8s-2.6 4.5-7 4.5S1 8 1 8zM8 6.1a1.9 1.9 0 100 3.8 1.9 1.9 0 000-3.8z" />
        Ko‘rishlar
      </p>
      <p className="rn-metric">{formatNumber(views)}</p>
    </div>
  );
}

function MetricIcon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden focusable="false">
      <path d={d} />
    </svg>
  );
}

/* ========================================================================= *
 * MA'LUMOTNOMA — har fakt alohida shisha katak
 * ========================================================================= */

function Dossier({ profile }: { profile: ThemeProfile }) {
  const cells = [
    { label: "Tug‘ilgan yili", value: profile.birth_year_display },
    { label: "Tug‘ilgan joyi", value: profile.birth_place },
    { label: "Hudud", value: profile.current_location ?? profile.region?.name ?? null },
    { label: "Ta’lim", value: profile.education_summary },
    { label: "Faoliyat sohasi", value: profile.activity_field },
    { label: "Tillar", value: (profile.languages ?? []).join(" · ") || null },
  ].filter((cell): cell is { label: string; value: string } => Boolean(cell.value?.trim()));

  const counts = [
    { k: "Bo‘lim", v: (profile.sections ?? []).length },
    { k: "Yutuq", v: (profile.achievements ?? []).length },
    { k: "Sertifikat", v: (profile.certificates ?? []).length },
    { k: "Surat", v: withoutPortrait(profile.media ?? [], profile.avatar_url).length },
  ].filter((item) => item.v > 0);

  if (cells.length === 0 && counts.length === 0) return null;

  return (
    <section className="rn-dossier" aria-labelledby="rn-dossier-t" data-rn-reveal>
      <div className="rn-wrap">
        <h2 id="rn-dossier-t" className="rn-index rn-index--solo">
          <i aria-hidden />
          Ma’lumotnoma
          <span className="rn-index__rule" aria-hidden />
        </h2>
        <dl className="rn-facts">
          {cells.map((cell) => (
            <div key={cell.label} className={`rn-fact rn-glass${cell.value.length > 90 ? " rn-fact--wide" : ""}`}>
              <dt className="rn-label">{cell.label}</dt>
              <dd>{cell.value}</dd>
            </div>
          ))}
          {counts.map((item) => (
            <div key={item.k} className="rn-fact rn-fact--count rn-glass">
              <dt className="rn-label">{item.k}</dt>
              <dd>{formatNumber(item.v)}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/* ========================================================================= *
 * BO'LIM RAMKASI
 * ========================================================================= */

interface Section {
  id: string;
  title: string;
  /** Dokdagi qisqa nom. */
  short?: string;
  kicker?: string;
  body: ReactNode;
}

function Section({ section, index }: { section: Section; index: number }) {
  return (
    <section id={section.id} className="rn-sec" aria-labelledby={`${section.id}-t`} data-rn-reveal>
      <div className="rn-wrap">
        <header className="rn-head">
          <p className="rn-index" aria-hidden>
            <i />
            {chapterNumber(index)}
            <span className="rn-index__rule" />
            {section.kicker && <span className="rn-index__k">{section.kicker}</span>}
          </p>
          <h2 id={`${section.id}-t`} className="rn-h2">
            {section.title}
          </h2>
        </header>
        {section.body}
      </div>
    </section>
  );
}

function buildSections(
  profile: ThemeProfile,
  extras: ThemeExtras | undefined,
  restQuotes: { id: string; text: string }[],
): Section[] {
  return [
    biography(profile),
    service(profile),
    honours(profile),
    certificates(profile),
    media(profile, extras),
    books(profile),
    gallery(profile),
    quotesSection(restQuotes),
  ].filter((section): section is Section => section !== null);
}

/* ------------------------------------------------- BIOGRAFIYA */

function storyParts(profile: ThemeProfile) {
  const parts =
    profile.sections.length > 0
      ? profile.sections.map((s) => ({ id: s.id, title: s.title?.trim() || null, paragraphs: toParagraphs(s.content) }))
      : profile.articles.map((a) => ({ id: String(a.id), title: null, paragraphs: toParagraphs(a.content as string | null) }));
  return parts.filter((part) => part.title || part.paragraphs.length > 0);
}

function storyMinutes(story: ReturnType<typeof storyParts>): number {
  return readingMinutes(story.flatMap((part) => part.paragraphs).join(" "));
}

function biography(profile: ThemeProfile): Section | null {
  const story = storyParts(profile);
  if (story.length === 0) return null;

  /*
   * Birinchi abzats — KIRISH: kattaroq va oqroq. Qismlar sarlavhali bo'lsa,
   * keng ekranda chapda yopishqoq mundarija paydo bo'ladi; sarlavhalar
   * yetarli bo'lmasa mundarija ma'nosiz — matn yolg'iz, markazda turadi.
   */
  const titled = story.filter((part) => part.title);
  const minutes = storyMinutes(story);
  const leadPart = story.findIndex((part) => part.paragraphs.length > 0);

  return {
    id: "biografiya",
    title: "Hayot yo‘li",
    short: "Biografiya",
    kicker: `${minutes} daqiqa o‘qish`,
    body: (
      <div className={`rn-read${titled.length > 1 ? "" : " rn-read--solo"}`}>
        {titled.length > 1 && (
          <nav className="rn-toc rn-glass" aria-label="Biografiya mundarijasi">
            <p className="rn-label">Mundarija</p>
            <ol>
              {story.map((part, index) =>
                part.title ? (
                  <li key={part.id}>
                    <a href={`#bio-${index + 1}`}>
                      <i>{chapterNumber(index)}</i>
                      {part.title}
                    </a>
                  </li>
                ) : null,
              )}
            </ol>
          </nav>
        )}
        <div className="rn-story" lang="uz">
          {story.map((part, index) => (
            <div key={part.id} id={`bio-${index + 1}`} className="rn-story__part">
              {part.title && (
                <h3>
                  <small>§ {chapterNumber(index)}</small>
                  {part.title}
                </h3>
              )}
              {part.paragraphs.map((paragraph, i) => (
                <p key={i} className={index === leadPart && i === 0 ? "rn-lead" : undefined}>
                  {paragraph}
                </p>
              ))}
            </div>
          ))}
        </div>
      </div>
    ),
  };
}

/* ------------------------------------------------- XIZMAT YO'LI (jurnal) */

function service(profile: ThemeProfile): Section | null {
  const education = toTimeline(profile.education ?? []).map((item) => ({ item, tag: "Ta’lim" }));
  const work = toTimeline(profile.workExperience ?? []).map((item) => ({ item, tag: "Faoliyat" }));
  const all = [...work, ...education];
  if (all.length === 0) return null;

  /* Yangisidan eskisiga — rasmiy tarjimai hol shunday o'qiladi. Sanasizlar oxirida. */
  const ordered = all.sort((a, b) => (b.item.from ?? "").localeCompare(a.item.from ?? ""));

  return {
    id: "xizmat-yoli",
    title: "Xizmat yo‘li",
    short: "Xizmat",
    kicker: `${ordered.length} ta yozuv`,
    body: (
      <ol className="rn-log">
        {ordered.map(({ item, tag }) => {
          const current = Boolean(item.from) && !item.to;
          return (
            <li key={`${tag}-${item.id}`} className="rn-log__row rn-glass">
              <p className="rn-log__when">{item.from ? range(item.from, item.to) : "—"}</p>
              <div className="rn-log__body">
                <b>{item.title}</b>
                {item.subtitle && <span>{item.subtitle}</span>}
                {item.description && <p>{item.description}</p>}
              </div>
              <p className={`rn-tag${current ? " rn-tag--live" : ""}`}>{current ? `${tag} · hozir` : tag}</p>
            </li>
          );
        })}
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
    title: achievements.length > 0 ? "Yutuqlar" : "Tadbirlar",
    kicker: `${all.length} ta yozuv`,
    body: <Awards items={all} />,
  };
}

function Awards({ items }: { items: TimelineItem[] }) {
  return (
    <ul className="rn-awards">
      {items.map((item, index) => {
        const url = safeUrl(item.url);
        return (
          <li key={item.id} className={`rn-award rn-glass${index === 0 && items.length > 2 ? " rn-award--lead" : ""}`}>
            <div className="rn-award__top">
              <span className="rn-award__year">{item.from ? year(item.from) : chapterNumber(index)}</span>
              <span className="rn-award__icon" aria-hidden>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <circle cx="12" cy="9" r="5.5" />
                  <path d="M8.5 13.5L7 21l5-2.6 5 2.6-1.5-7.5" />
                </svg>
              </span>
            </div>
            <b>{item.title}</b>
            {item.subtitle && <span>{item.subtitle}</span>}
            {item.description && <p>{item.description}</p>}
            {url && <External href={url} label="Manba" />}
          </li>
        );
      })}
    </ul>
  );
}

/* ------------------------------------------------- SERTIFIKATLAR */

function certificates(profile: ThemeProfile): Section | null {
  const list = profile.certificates ?? [];
  if (list.length === 0) return null;

  return {
    id: "sertifikatlar",
    title: "Sertifikatlar",
    kicker: `${list.length} ta hujjat`,
    body: (
      <ul className="rn-docs">
        {list.map((certificate) => {
          const url = safeUrl(certificate.credential_url as string | null);
          const verified = isVerified(certificate.trust);
          return (
            <li key={certificate.id} className="rn-doc rn-glass">
              {/* §8: ishonch belgisi dizayndan qat'i nazar ko'rsatiladi. */}
              <p className={`rn-status${verified ? " rn-status--ok" : ""}`}>
                <i aria-hidden />
                {trustLabel(certificate.trust)}
              </p>
              <b>{certificate.title}</b>
              {(certificate.issuer || certificate.issued_on) && (
                <span>{[certificate.issuer, year(certificate.issued_on as string | null)].filter(Boolean).join(" · ")}</span>
              )}
              {url && <External href={url} label="Hujjat" />}
            </li>
          );
        })}
      </ul>
    ),
  };
}

/* ------------------------------------------------- MAQOLALAR VA MEDIA */

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
      kind: "Maqola",
      meta: m.publishedAt ? `Liderlar Online · ${formatDateUz(m.publishedAt)}` : "Liderlar Online",
      image: optimizable(m.heroUrl),
    })),
    ...articles.map((a) => ({
      id: `a-${a.id}`,
      href: `/jurnal/maqola/${a.slug}`,
      title: String(a.title ?? ""),
      kind: "Jurnal",
      meta: a.journal ? `Liderlar Online · ${a.journal.issue_number}-son` : "Liderlar Online",
      image: optimizable(a.cover_url),
    })),
    ...podcasts.map((p) => ({
      id: `p-${p.id}`,
      href: `/podcastlar/${p.slug}`,
      title: String(p.title ?? ""),
      kind: "Podcast",
      meta: p.starts_at ? formatDateUz(p.starts_at) : "Liderlar podcast",
      image: optimizable(p.banner_url),
    })),
  ];

  return {
    id: "media",
    title: "Maqolalar va media",
    short: "Media",
    kicker: `${cards.length} ta material`,
    body: (
      <ul className="rn-press">
        {cards.map((card) => (
          <li key={card.id}>
            <Link href={card.href} className="rn-press__card rn-glass">
              <span className="rn-press__shot">
                {card.image && (
                  <Image src={card.image} alt="" fill sizes="(min-width: 1080px) 400px, (min-width: 700px) 45vw, 92vw" loading="lazy" />
                )}
                <span className="rn-press__kind rn-glass">{card.kind}</span>
              </span>
              <span className="rn-press__body">
                <span className="rn-label">{card.meta}</span>
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
    title: own.length > 0 ? "Ijod va kutubxona" : "Kutubxona",
    short: "Kitoblar",
    body: (
      <div className="rn-library">
        {own.length > 0 && <Shelf label="Ijodiy ishlari" items={own} />}
        {read.length > 0 && <Shelf label="O‘qigan kitoblari" items={read} />}
        {manual.length > 0 && (
          <div>
            <p className="rn-label rn-shelf__k">{read.length > 0 ? "Boshqa o‘qigan kitoblari" : "O‘qigan kitoblari"}</p>
            <ul className="rn-list">
              {manual.map((book) => (
                <li key={String(book.id)} className="rn-glass">
                  <b>{String(book.title ?? "")}</b>
                  {book.subtitle && <span>{String(book.subtitle)}</span>}
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
      <p className="rn-label rn-shelf__k">{label}</p>
      <ul className="rn-books">
        {items.map((item) => {
          const href = safeUrl(item.externalUrl);
          const cover = safeUrl(item.coverUrl);
          const content = (
            <>
              <span className="rn-book__cover">
                {cover ? (
                  // Muqovalar AdabiyotX domenida — `next/image` ruxsat ro'yxatida yo'q.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cover} alt="" loading="lazy" decoding="async" />
                ) : (
                  <span className="rn-book__blank">{item.title}</span>
                )}
              </span>
              <b>{item.title}</b>
              {item.authorName && <span>{item.authorName}</span>}
            </>
          );
          return (
            <li key={item.id}>
              {href ? (
                <a href={href} target="_blank" rel="noopener noreferrer" className="rn-book">
                  {content}
                </a>
              ) : (
                <div className="rn-book">{content}</div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ------------------------------------------------- GALEREYA (bento) */

function gallery(profile: ThemeProfile): Section | null {
  // Hero'dagi portret galereyada takrorlanmaydi.
  const items = withoutPortrait(profile.media ?? [], profile.avatar_url);
  if (items.length === 0) return null;

  return {
    id: "galereya",
    title: "Galereya",
    kicker: `${items.length} ta surat`,
    body: (
      <ul className={`rn-gallery rn-gallery--${Math.min(items.length, 4)}`}>
        {items.map((item, index) => (
          <li key={String(item.url)}>
            <figure className="rn-frame">
              <a href={String(item.url)} target="_blank" rel="noopener noreferrer">
                <Image
                  src={String(item.url)}
                  alt={item.caption ?? `${profile.full_name} — galereya rasmi`}
                  fill
                  sizes={index % 7 === 0 ? "(min-width: 1080px) 620px, 92vw" : "(min-width: 1080px) 310px, 46vw"}
                  loading="lazy"
                />
              </a>
              {item.caption && <figcaption className="rn-glass">{item.caption}</figcaption>}
            </figure>
          </li>
        ))}
      </ul>
    ),
  };
}

/* ------------------------------------------------- IQTIBOSLAR */

function quotesSection(quotes: { id: string; text: string }[]): Section | null {
  if (quotes.length === 0) return null;
  return {
    id: "iqtiboslar",
    title: "So‘zlar",
    body: (
      <ul className="rn-sayings">
        {quotes.map((quote) => (
          <li key={quote.id} className="rn-glass">
            <p>{quote.text}</p>
          </li>
        ))}
      </ul>
    ),
  };
}

function Interlude({ text, name }: { text: string; name: string }) {
  return (
    <section className="rn-interlude" aria-label="Iqtibos" data-rn-reveal>
      <div className="rn-wrap">
        <figure className="rn-interlude__panel rn-glass rn-lens">
          <blockquote>{text}</blockquote>
          <figcaption>
            <i aria-hidden />
            {name}
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

/* ========================================================================= *
 * YAKUN
 * ========================================================================= */

function Outro({ profile }: { profile: ThemeProfile }) {
  const links = (profile.socialLinks ?? [])
    .map((link) => ({ id: String(link.id), url: safeUrl(String(link.url ?? "")), title: String(link.title ?? "Havola") }))
    .filter((link): link is { id: string; url: string; title: string } => Boolean(link.url));

  return (
    <footer className="rn-outro" aria-label="Yakun" data-rn-outro>
      <div className="rn-wrap" data-rn-reveal>
        <div className="rn-outro__panel rn-glass rn-lens rn-lens--wide">
          <div className="min-w-0">
            <p className="rn-label">Liderlar.uz ensiklopediyasi</p>
            <p className="rn-outro__name">{profile.full_name}</p>
          </div>
          <div className="rn-outro__end">
            {links.length > 0 && (
              <ul className="rn-socials">
                {links.map((link) => (
                  <li key={link.id}>
                    {/* Foydalanuvchi kiritgan havola: SEO vazni berilmaydi. */}
                    <a href={link.url} target="_blank" rel="noopener noreferrer nofollow" className="rn-glass">
                      {link.title}
                    </a>
                  </li>
                ))}
              </ul>
            )}
            <Link href="/liderlar" className="rn-btn rn-btn--solid">
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
    <a href={href} target="_blank" rel="noopener noreferrer nofollow" className="rn-go">
      {label}
      <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden>
        <path d="M3 9L9 3M4 3h5v5" />
      </svg>
    </a>
  );
}
