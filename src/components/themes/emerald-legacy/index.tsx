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
import { ElMotion, ElPromo, ElRail, ElShare } from "./client";
import { elDisplay, elSans, elSerif } from "./fonts";
import { emeraldLegacyCss } from "./styles";

/**
 * EMERALD LEGACY — meros, bilim, intellektual nufuz.
 *
 * Chuqur zumrad-qora, nurli zumrad shisha, bosiq antiqa guruch va juda
 * nozik o'zbek merosi geometriyasi (girih).
 *
 * KOMPOZITSIYA BOSHQA DIZAYNLARDAN TUBDAN BOSHQACHA (§9). Bu yerda
 * "chapda portret → ism → gorizontal ko'rsatkichlar paneli → chap menyu +
 * markaz matn + o'ng panel" tuzilishi YO'Q:
 *
 *   - HERO assimetrik: ism me'moriy tipografiya zonasi bo'lib chap
 *     tomonni egallaydi, portret o'ng tomondan kiradi va pastki
 *     bo'limga CHIQIB KETADI. Raqamlar bitta panel emas, kompozitsiya
 *     bo'ylab har xil balandlikda suzuvchi shisha modullar.
 *   - TEZKOR MA'LUMOT o'ng panelda emas: hero ostidagi to'liq kenglikdagi
 *     "dosye" lentasi, ingichka vertikal chiziqlar bilan bo'lingan.
 *   - BIOGRAFIYA keng editorial: katta kirish, so'ng ko'p ustunli matn.
 *   - TA'LIM gorizontal vaqt o'qi, YUTUQLAR zinapoyali raqamli bloklar,
 *     SERTIFIKATLAR assimetrik galereya, MEDIA kinematik lenta.
 *
 * Bo'limlar kompozitsiyasi navbatma-navbat o'zgaradi — sahifa sirpanganda
 * jonli ko'rinadi.
 *
 * Komponent hech qanday so'rov qilmaydi (§11, §49): hammasi `profile` va
 * sahifa yuklagan `extras` dan. Soxta ma'lumot yo'q — bo'sh bo'lim
 * umuman chizilmaydi.
 */

/* PALITRA — dizayn o'z ranglarini o'zi tashiydi. */
const VOID = "#04110d";
const EMERALD = "#0d6b4e";
const GLOW = "#34d399";
const CREAM = "#eef7f2";
const GOLD = "#b99a5b";

type Vars = CSSProperties & Record<`--${string}`, string | number>;

export default function EmeraldLegacyTheme({ profile, extras }: ThemeProps) {
  const quotes = (profile.quotes ?? [])
    .map((quote) => ({ id: String(quote.id), text: String(quote.text ?? "").trim() }))
    .filter((quote) => quote.text);
  const sections = buildSections(profile, extras, quotes.slice(2));

  return (
    <div data-el-root className={`el ${elDisplay.variable} ${elSerif.variable} ${elSans.variable}`}>
      <style
        dangerouslySetInnerHTML={{
          __html: emeraldLegacyCss({ void: VOID, emerald: EMERALD, glow: GLOW, cream: CREAM, gold: GOLD }),
        }}
      />
      <ElMotion />

      <Hero
        profile={profile}
        sections={sections}
        cutout={extras?.portraitCutout ?? null}
        promoCode={extras?.promoCode ?? null}
        quote={quotes[0]?.text ?? null}
        hasStory={sections.some((s) => s.id === "biografiya")}
      />
      <Dossier profile={profile} />

      {sections.map((section, index) => (
        <Section key={section.id} section={section} index={index} />
      ))}

      {quotes[1] && <Interlude text={quotes[1].text} name={profile.full_name} />}
      <Outro profile={profile} />
    </div>
  );
}

/* ========================================================================= *
 * HERO — assimetrik, portret pastga chiqadi
 * ========================================================================= */

function Hero({
  profile,
  sections,
  cutout,
  promoCode,
  quote,
  hasStory,
}: {
  profile: ThemeProfile;
  sections: Section[];
  cutout: PortraitCutout | null;
  promoCode: string | null;
  quote: string | null;
  hasStory: boolean;
}) {
  const name = splitName(profile.full_name);
  const items = profile.description_items ?? [];

  return (
    <header className="el-hero" aria-label={profile.full_name}>
      <div className="el-hero__sky" aria-hidden />
      <div className="el-grid el-hero__grid-bg" aria-hidden />
      <span className="el-trace" style={{ top: "34%", left: "-10%", width: "70%" }} aria-hidden />
      <span className="el-trace" style={{ top: "68%", left: "20%", width: "60%", animationDelay: "4s" }} aria-hidden />

      <div className="el-wrap el-hero__grid">
        {/* Vertikal meros yozuvi — faqat keng ekranda. */}
        <p className="el-rail" aria-hidden>
          <span>Meros</span>
          <span>Bilim</span>
          <span>Nufuz</span>
        </p>

        <div className="el-copy">
          <p className="el-eyebrow">
            <span>Emerald Legacy</span>
            {profile.is_top100 && (
              <span className="el-eyebrow__chip">
                TOP 100{profile.top100_position ? ` · №${profile.top100_position}` : ""}
              </span>
            )}
          </p>

          {/*
            ISM — me'moriy tipografiya. Qatorlar vizual blok, lekin `h1`
            ichida ism to'liq matn bo'lib qoladi (qidiruv va ekran
            o'quvchisi uchun).
          */}
          {/*
            ISM O'LCHAMI ENG UZUN SO'ZGA MOSLANADI.

            "QURBONNAZAROV" kabi uzun familiya qat'iy o'lchamda ustunga
            sig'may, SO'Z O'RTASIDAN bo'linib ketardi. Shuning uchun
            o'lcham USTUN KENGLIGIDAN hisoblanadi: eng uzun so'z nechta
            belgi bo'lsa, shuncha joyga bo'linadi va hech qachon chiqib
            ketmaydi.
          */}
          <h1 className="el-name" style={{ "--el-ch": longestWord(name.primary) } as Vars}>
            {name.primary.map((word, index) => (
              <span key={`${word}-${index}`} className="el-name__line">
                <span style={{ "--i": index } as Vars}>{word}</span>
              </span>
            ))}
            {name.secondary && <span className="el-name__sub">{name.secondary}</span>}
          </h1>

          {items.length > 0 && (
            <p className="el-role el-seq" style={{ "--i": 0 } as Vars}>
              <b>{items[0]}</b>
              {items.length > 1 && items.slice(1, 4).join(" · ")}
            </p>
          )}

          {quote && (
            <blockquote className="el-quote el-seq" style={{ "--i": 1 } as Vars}>
              {quote}
            </blockquote>
          )}

          <div className="el-actions el-seq" style={{ "--i": 2 } as Vars}>
            {hasStory && (
              <a href="#biografiya" className="el-btn el-btn--gold">
                Biografiya
                <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden>
                  <path d="M7 1.5v11M2.5 8L7 12.5 11.5 8" />
                </svg>
              </a>
            )}
            <ElShare name={profile.full_name} />
          </div>

        </div>

        <div className="el-figure">
          <span className="el-orb el-orb--1" aria-hidden />
          <span className="el-orb el-orb--2" aria-hidden />
          <span className="el-orb el-orb--3" aria-hidden />

          {/*
            PORTRET.

            Post Studio ALLAQACHON yasagan fonsiz portret bo'lsa — u
            ramkasiz turadi va pastki bo'limga chiqib ketadi (yangi fon
            olib tashlash tizimi qurilmagan, faqat tayyorisi o'qiladi).

            Fonsiz portret bo'lmasa, oddiy profil rasmi ishlatiladi: u
            odatda OQ fonli, shuning uchun qorong'u sahifada ramkasiz
            qoldirib bo'lmaydi — ravoq shaklida kesiladi va pastki qismi
            zumrad gradientga eriydi.
          */}
          <div className="el-portrait" data-el-parallax style={{ transform: "translateY(var(--el-shift,0px))" }}>
            <span className="el-portrait__halo" aria-hidden />
            <span className="el-portrait__lines" aria-hidden>
              <i /><i /><i /><i />
            </span>
            {cutout ? (
              /*
                PORTRET — FONSIZ.

                Post Studio kesmasi: odamning o'zi, fon yo'q. Kesma
                ataylab oq-qora saqlanadi (post kartochkalari uslubi), shu
                sababli bu yerda ILIQ BRONZA tusga bo'yaladi — jonsiz
                kulrang ham, yashil ham emas. Rang CSS filtri bilan
                beriladi, ya'ni rasm aynan o'zi bo'lib qoladi.

                Asl rangli surat niqob sifatida ishlatilmadi: kesma
                qirqilgan (masalan 659x1084) va asl surat (912x1152) bilan
                ustma-ust tushmaydi.
              */
              <span className="el-portrait__frame el-portrait__frame--cut">
                <Image src={cutout.url} alt={profile.full_name} fill preload sizes="(min-width: 1080px) 620px, 94vw" />
              </span>
            ) : profile.avatar_url ? (
              /* Kesma yo'q — rasm yumshoq chetli ramkada. */
              <span className="el-portrait__frame el-portrait__frame--photo">
                <Image src={profile.avatar_url} alt={profile.full_name} fill preload sizes="(min-width: 1080px) 620px, 94vw" />
                <span className="el-portrait__veil" aria-hidden />
              </span>
            ) : (
              <span className="el-initials" aria-hidden>
                {monogram(profile.full_name)}
              </span>
            )}
          </div>
        </div>

        <Modules profile={profile} />

        {/*
          O'NG USTUN: sanoqlar, promo kod va bo'limlar ro'yxati.

          Keng ekranda o'ng chetga mahkamlanadi — hero'ning o'ng yarmi
          bo'sh fon bo'lib qolmaydi. Mobilda esa oddiy qator bo'lib,
          portret va reytingdan KEYIN turadi.
        */}
        <aside className="el-side">
          <Counts profile={profile} />
          {promoCode && <ElPromo code={promoCode} name={profile.full_name} />}
          <HeroIndex sections={sections} />
        </aside>
      </div>
    </header>
  );
}

/**
 * O'NG TOMONDAGI BO'LIMLAR KO'RSATKICHI.
 *
 * Hero'ning o'ng yarmi shunchaki bo'sh fon bo'lib qolmaydi: shu profilda
 * HAQIQATAN mavjud bo'limlar raqamlangan ro'yxat bo'lib turadi va ularga
 * havola qiladi. Bo'lim yo'q bo'lsa — ro'yxatda ham yo'q.
 */
function HeroIndex({ sections }: { sections: Section[] }) {
  if (sections.length < 2) return null;
  return (
    <nav className="el-index" aria-label="Bo‘limlar">
      <ol>
        {sections.map((section, index) => (
          <li key={section.id}>
            <a href={`#${section.id}`}>
              <i>{chapterNumber(index)}</i>
              {section.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/**
 * O'NG TOMONDAGI SANOQLAR — portret atrofida suzadi.
 *
 * Hero'ning o'ng yarmi bo'sh qolmasligi uchun: profilning HAQIQIY
 * to'ldirilgan bo'limlari sanab ko'rsatiladi. Nol bo'lsa — chizilmaydi,
 * ya'ni bo'sh profilda soxta "0" paydo bo'lmaydi.
 */
function Counts({ profile }: { profile: ThemeProfile }) {
  const counts = [
    { k: "Yutuq", v: (profile.achievements ?? []).length },
    { k: "Sertifikat", v: (profile.certificates ?? []).length },
    { k: "Bo‘lim", v: profile.sections.length },
    { k: "Surat", v: withoutPortrait(profile.media ?? [], profile.avatar_url).length },
  ].filter((item) => item.v > 0);
  if (counts.length === 0) return null;

  return (
    <ul className="el-counts" aria-label="Profil tarkibi">
      {counts.slice(0, 3).map((item) => (
        <li key={item.k}>
          <b>{formatNumber(item.v)}</b>
          <span>{item.k}</span>
        </li>
      ))}
    </ul>
  );
}

/** Suzuvchi ma'lumot modullari — gorizontal panel EMAS. */
/** Eng uzun so'zdagi belgilar soni — sarlavha o'lchami shunga moslanadi. */
function longestWord(words: string[]): number {
  return Math.max(6, words.reduce((max, word) => Math.max(max, word.length), 0));
}

function Modules({ profile }: { profile: ThemeProfile }) {
  const ranking = rankingView(profile.position, profile.total_score, profile.ranking.hasRow);
  const delta = ranking.kind === "position" ? rankDelta(profile.position, profile.previous_position) : 0;

  return (
    <div className="el-mods">
      <div
        className={`el-mod${delta > 0 ? " el-mod--up" : delta < 0 ? " el-mod--down" : ""}`}
        style={{ "--i": 0 } as Vars}
      >
        <p className="el-mod__k">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden>
            <path d="M4 2h8v3a4 4 0 01-8 0zM4 3H2v1a3 3 0 003 3M12 3h2v1a3 3 0 01-3 3M6 14h4M8 9v5" />
          </svg>
          Umumiy reyting
        </p>
        <p className="el-mod__v">
          {ranking.kind === "position" ? (
            <>
              {ranking.value}
              <i>-o‘rin</i>
              {delta !== 0 && <i>{delta > 0 ? `↑${delta}` : `↓${Math.abs(delta)}`}</i>}
            </>
          ) : (
            <u>{ranking.kind === "pending" ? "hisoblanmoqda" : "shakllanmagan"}</u>
          )}
        </p>
      </div>

      <div className="el-mod" style={{ "--i": 1 } as Vars}>
        <p className="el-mod__k">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden>
            <path d="M8 1.8l1.9 3.9 4.3.6-3.1 3 .7 4.3L8 11.6l-3.8 2 .7-4.3-3.1-3 4.3-.6z" />
          </svg>
          Reyting balli
        </p>
        {/* MAXRAJ BILAN: raqam o'z shkalasi bilan ma'noga ega. */}
        <p className="el-mod__v">
          {scoreText(profile.total_score)}
          <i>{RANKING_SCORE_UNIT}</i>
        </p>
      </div>

      <div className="el-mod" style={{ "--i": 2 } as Vars}>
        <p className="el-mod__k">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden>
            <path d="M1 8s2.6-4.5 7-4.5S15 8 15 8s-2.6 4.5-7 4.5S1 8 1 8z" />
            <circle cx="8" cy="8" r="1.9" />
          </svg>
          Ko‘rishlar
        </p>
        <p className="el-mod__v">{formatNumber(profile.view_count)}</p>
      </div>
    </div>
  );
}

/* ========================================================================= *
 * DOSYE — tezkor ma'lumot, o'ng panel emas
 * ========================================================================= */

function Dossier({ profile }: { profile: ThemeProfile }) {
  const cells = [
    { label: "Tug‘ilgan yili", value: profile.birth_year_display },
    { label: "Tug‘ilgan joyi", value: profile.birth_place },
    { label: "Hudud", value: profile.current_location },
    { label: "Yo‘nalish", value: profile.category?.name ?? null },
    { label: "Ta’lim", value: profile.education_summary },
    { label: "Faoliyat sohasi", value: profile.activity_field },
    { label: "Tillar", value: (profile.languages ?? []).join(" · ") || null },
  ].filter((cell): cell is { label: string; value: string } => Boolean(cell.value?.trim()));
  if (cells.length === 0) return null;

  return (
    <section className="el-dossier" aria-label="Tezkor ma’lumot" data-el-reveal>
      <dl className="el-wrap el-dossier__row">
        {cells.map((cell) => (
          <div key={cell.label} className="el-dossier__cell">
            <dt>{cell.label}</dt>
            <dd>{cell.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/* ========================================================================= *
 * BO'LIM RAMKASI
 * ========================================================================= */

interface Section {
  id: string;
  title: string;
  kicker?: string;
  /** Ketma-ket fon — bo'limlar bir-biridan ajralib tursin. */
  alt?: boolean;
  body: ReactNode;
}

function Section({ section, index }: { section: Section; index: number }) {
  return (
    <section
      id={section.id}
      className={`el-sec${section.alt ? " el-sec--alt" : ""}`}
      aria-labelledby={`${section.id}-t`}
      data-el-reveal
    >
      <div className="el-wrap">
        <div className="el-sec__head">
          <div className="min-w-0">
            <p className="el-no" aria-hidden>
              {chapterNumber(index)}
            </p>
            <h2 id={`${section.id}-t`} className="el-h2">
              {section.title}
            </h2>
            {section.kicker && <p className="el-kicker">{section.kicker}</p>}
          </div>
        </div>
        <span className="el-sec__rule" aria-hidden />
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
    timeline(profile),
    honours(profile),
    certificates(profile),
    media(profile, extras),
    books(profile),
    gallery(profile),
    quotesSection(restQuotes),
  ].filter((section): section is Section => section !== null);
}

/* ------------------------------------------------- BIOGRAFIYA (keng editorial) */

function biography(profile: ThemeProfile): Section | null {
  const parts =
    profile.sections.length > 0
      ? profile.sections.map((s) => ({ id: s.id, title: s.title?.trim() || null, paragraphs: toParagraphs(s.content) }))
      : profile.articles.map((a) => ({ id: String(a.id), title: null, paragraphs: toParagraphs(a.content as string | null) }));
  const story = parts.filter((part) => part.title || part.paragraphs.length > 0);
  if (story.length === 0) return null;

  /*
   * KIRISH MATNI alohida: birinchi abzats to'liq kenglikda, katta serifda
   * o'qiladi. Qolgan matn esa ko'p ustunli — gazeta varag'i kabi.
   */
  const [first, ...rest] = story;
  const lead = first.paragraphs[0] ?? null;
  const firstRest = first.paragraphs.slice(1);
  const minutes = readingMinutes(story.flatMap((part) => part.paragraphs).join(" "));

  return {
    id: "biografiya",
    title: "Hayot yo‘li",
    kicker: `${minutes} daqiqa o‘qish`,
    body: (
      <>
        {lead && <p className="el-lead">{lead}</p>}
        <div className="el-story" lang="uz">
          {firstRest.length > 0 && (
            <div className="el-story__part">
              {firstRest.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          )}
          {rest.map((part, partIndex) => (
            <div key={part.id} className="el-story__part">
              {part.title && (
                <h3>
                  <small>{chapterNumber(partIndex + 1)}</small>
                  {part.title}
                </h3>
              )}
              {part.paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          ))}
        </div>
      </>
    ),
  };
}

/* ------------------------------------------------- GORIZONTAL VAQT O'QI */

function timeline(profile: ThemeProfile): Section | null {
  const education = toTimeline(profile.education ?? []).map((item) => ({ item, tag: "Ta’lim" }));
  const work = toTimeline(profile.workExperience ?? []).map((item) => ({ item, tag: "Faoliyat" }));
  const all = [...education, ...work];
  if (all.length === 0) return null;

  /* Eng eskisidan yangisiga — vaqt o'qi chapdan o'ngga oqadi. */
  const ordered = all.sort((a, b) => (a.item.from ?? "").localeCompare(b.item.from ?? ""));

  return {
    id: "talim-faoliyat",
    title: "Ta’lim va faoliyat",
    kicker: "Vaqt o‘qi",
    alt: true,
    body: (
      <ElRail label="Vaqt o‘qi">
        <ol className="el-time">
          {ordered.map(({ item, tag }) => (
            <li key={item.id} className="el-time__node">
              <p className="el-time__when">{item.from ? range(item.from, item.to) : "—"}</p>
              <div className="el-time__card">
                <span className="el-time__tag">{tag}</span>
                <b>{item.title}</b>
                {item.subtitle && <span>{item.subtitle}</span>}
                {item.description && <p>{item.description}</p>}
              </div>
            </li>
          ))}
        </ol>
      </ElRail>
    ),
  };
}

/* ------------------------------------------------- YUTUQLAR (zinapoya) */

function honours(profile: ThemeProfile): Section | null {
  const achievements = toTimeline(profile.achievements ?? []);
  const events = toTimeline(profile.events ?? []);
  const all = [...achievements, ...events];
  if (all.length === 0) return null;

  return {
    id: "yutuqlar",
    title: achievements.length > 0 ? "Yutuqlar" : "Tadbirlar",
    kicker: `${all.length} ta yozuv`,
    body: <Stairs items={all} />,
  };
}

function Stairs({ items }: { items: TimelineItem[] }) {
  return (
    <ol className="el-steps">
      {items.map((item, index) => {
        const url = safeUrl(item.url);
        return (
          <li key={item.id} className="el-stair">
            <span className="el-stair__n" aria-hidden>
              {chapterNumber(index)}
            </span>
            <div className="el-stair__b">
              <b>{item.title}</b>
              {item.subtitle && <span>{item.subtitle}</span>}
              {item.description && <p>{item.description}</p>}
            </div>
            {(item.from || url) && (
              <div className="el-stair__meta">
                {item.from && <span className="el-year">{year(item.from)}</span>}
                {url && <External href={url} label="Manba" />}
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

/* ------------------------------------------------- SERTIFIKATLAR (assimetrik) */

function certificates(profile: ThemeProfile): Section | null {
  const list = profile.certificates ?? [];
  if (list.length === 0) return null;

  return {
    id: "sertifikatlar",
    title: "Sertifikatlar",
    alt: true,
    body: (
      <ul className="el-certs">
        {list.map((certificate) => {
          const url = safeUrl(certificate.credential_url as string | null);
          return (
            <li key={certificate.id} className="el-cert">
              <b>{certificate.title}</b>
              {(certificate.issuer || certificate.issued_on) && (
                <span>{[certificate.issuer, year(certificate.issued_on as string | null)].filter(Boolean).join(" · ")}</span>
              )}
              <div className="el-cert__foot">
                {/* §8: ishonch belgisi dizayndan qat'i nazar ko'rsatiladi. */}
                <span className={`el-trust${isVerified(certificate.trust) ? " el-trust--ok" : ""}`}>
                  {trustLabel(certificate.trust)}
                </span>
                {url && <External href={url} label="Hujjat" />}
              </div>
            </li>
          );
        })}
      </ul>
    ),
  };
}

/* ------------------------------------------------- MEDIA (kinematik lenta) */

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
  const articles = extras?.journalArticles ?? [];
  const podcasts = extras?.podcasts ?? [];
  const own = profile.memberArticles ?? [];
  if (own.length === 0 && articles.length === 0 && podcasts.length === 0) return null;

  const films = [
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
    title: "Maqolalar va media",
    kicker: `${films.length} ta material`,
    body: (
      <ElRail label="Media">
        <ul className="el-reel">
          {films.map((film) => (
            <li key={film.id}>
              <Link href={film.href} className="el-film">
                <span className="el-film__shot">
                  {film.image && <Image src={film.image} alt="" fill sizes="(min-width: 768px) 480px, 84vw" loading="lazy" />}
                </span>
                <span className="el-film__body">
                  <span className="el-film__meta">{film.meta}</span>
                  <b>{film.title}</b>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </ElRail>
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
    alt: true,
    body: (
      <div className="grid gap-10">
        {own.length > 0 && <Shelf label="Ijodiy ishlari" items={own} />}
        {read.length > 0 && <Shelf label="O‘qigan kitoblari" items={read} />}
        {manual.length > 0 && (
          <div>
            <p className="el-kicker" style={{ marginBottom: ".9rem" }}>
              {read.length > 0 ? "Boshqa o‘qigan kitoblari" : "O‘qigan kitoblari"}
            </p>
            <ul className="el-list">
              {manual.map((book) => (
                <li key={String(book.id)}>
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
      <p className="el-kicker" style={{ marginBottom: ".9rem" }}>
        {label}
      </p>
      <ul className="el-books">
        {items.map((item) => {
          const href = safeUrl(item.externalUrl);
          const cover = safeUrl(item.coverUrl);
          const content = (
            <>
              <span className="el-book__cover">
                {cover ? (
                  // Muqovalar AdabiyotX domenida — `next/image` ruxsat ro'yxatida yo'q.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cover} alt="" loading="lazy" decoding="async" />
                ) : (
                  <span className="el-book__blank">{item.title}</span>
                )}
              </span>
              <b>{item.title}</b>
              {item.authorName && <span>{item.authorName}</span>}
            </>
          );
          return (
            <li key={item.id}>
              {href ? (
                <a href={href} target="_blank" rel="noopener noreferrer" className="el-book">
                  {content}
                </a>
              ) : (
                <div className="el-book">{content}</div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ------------------------------------------------- GALEREYA (mozaika) */

function gallery(profile: ThemeProfile): Section | null {
  // Hero'dagi portret galereyada takrorlanmaydi.
  const items = withoutPortrait(profile.media ?? [], profile.avatar_url);
  if (items.length === 0) return null;

  return {
    id: "galereya",
    title: "Galereya",
    kicker: `${items.length} ta surat`,
    body: (
      <ul className="el-mosaic">
        {items.map((item, index) => (
          <li key={String(item.url)}>
            <figure className="el-tile">
              <a href={String(item.url)} target="_blank" rel="noopener noreferrer">
                <Image
                  src={String(item.url)}
                  alt={item.caption ?? `${profile.full_name} — galereya rasmi`}
                  fill
                  sizes={index % 6 === 0 ? "(min-width: 760px) 50vw, 50vw" : "(min-width: 760px) 25vw, 50vw"}
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

function quotesSection(quotes: { id: string; text: string }[]): Section | null {
  if (quotes.length === 0) return null;
  return {
    id: "iqtiboslar",
    title: "So‘zlar",
    alt: true,
    body: (
      <ul className="el-certs">
        {quotes.map((quote) => (
          <li key={quote.id} className="el-cert">
            <b className="el-serif" style={{ fontStyle: "italic", fontSize: "1.2rem" }}>
              {quote.text}
            </b>
          </li>
        ))}
      </ul>
    ),
  };
}

function Interlude({ text, name }: { text: string; name: string }) {
  return (
    <section className="el-interlude" aria-label="Iqtibos" data-el-reveal>
      <span className="el-interlude__glow" aria-hidden />
      <div className="el-wrap">
        <figure>
          <blockquote>{text}</blockquote>
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
  const links = (profile.socialLinks ?? [])
    .map((link) => ({ id: String(link.id), url: safeUrl(String(link.url ?? "")), title: String(link.title ?? "Havola") }))
    .filter((link): link is { id: string; url: string; title: string } => Boolean(link.url));

  return (
    <footer className="el-outro" aria-label="Yakun">
      <span className="el-outro__horizon" aria-hidden>
        <i /><i /><i />
      </span>
      <div className="el-wrap" data-el-reveal>
        <p className="el-outro__words">
          <span>Meros · Bilim</span>
          <span>Intellektual nufuz</span>
        </p>
        {links.length > 0 && (
          <ul className="el-socials">
            {links.map((link) => (
              <li key={link.id}>
                {/* Foydalanuvchi kiritgan havola: SEO vazni berilmaydi. */}
                <a href={link.url} target="_blank" rel="noopener noreferrer nofollow">
                  {link.title}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </footer>
  );
}

function External({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer nofollow" className="el-go">
      {label}
      <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden>
        <path d="M3 9L9 3M4 3h5v5" />
      </svg>
    </a>
  );
}
