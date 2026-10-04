import Image from "next/image";
import Link from "next/link";
import { isVerified, range, safeUrl, toTimeline, trustLabel, year } from "@/lib/themes/shape";
import { rankingDisplay } from "@/lib/themes/profile-compose";
import type { ThemeProps } from "@/lib/themes/types";

/**
 * IVORY EDITORIAL — premium jurnal, biografiya.
 *
 * Kayfiyat: jurnal muqovasiga o'xshash kompozitsiya, katta
 * iqtiboslar, ko'p ustunli editorial hissi.
 *
 * QOLGAN IKKI DIZAYNDAN FARQI (§9):
 *
 *   - FON YORUG'. Imperial Gold va Obsidian qorong'u; bu dizayn
 *     suyak rangida va matn qora — ya'ni u JURNAL VARAG'IGA o'xshaydi.
 *   - MUQOVA KOMPOZITSIYASI: ism rasm USTIDA emas, uning YONIDA va
 *     jurnal muqovasidagi kabi ustun-ustun joylashgan.
 *   - IQTIBOSLAR ASOSIY ELEMENT: Imperial Gold'da ular oxirida,
 *     bu yerda matn orasida va katta o'lchamda.
 *   - USTUNLAR: biografiya matni keng ekranda ikki ustunga
 *     ajraladi — gazeta va jurnalning asosiy belgisi.
 *
 * Jurnalistlar, yozuvchilar va tadqiqotchilar uchun.
 */

const IVORY = "#f7f3ec";
const PAPER = "#fffdf9";
const INK = "#15130f";
const SOFT = "#6b655c";
const BURGUNDY = "#7a2e3a";
const RULE = "#ddd5c7";

export default function IvoryEditorialTheme({ profile }: ThemeProps) {
  return (
    <div style={{ backgroundColor: IVORY, color: INK }} className="min-h-screen">
      <Cover profile={profile} />

      <div className="mx-auto max-w-5xl px-4 pb-24 sm:px-6">
        <Ranking profile={profile} />
        <Biography profile={profile} />
        <Quotes profile={profile} />
        <Path profile={profile} />
        <Achievements profile={profile} />
        <Certificates profile={profile} />
        <Gallery profile={profile} />
      </div>

      <Footer profile={profile} />
    </div>
  );
}

/* ========================================================================= *
 * MUQOVA
 * ========================================================================= */

function Cover({ profile }: ThemeProps) {
  return (
    <header style={{ backgroundColor: PAPER, borderBottom: `1px solid ${RULE}` }}>
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        {/* Jurnal "logotipi" — kichik, bosiq. */}
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.4em]"
          style={{ color: BURGUNDY }}
        >
          Liderlar · Portret
        </p>

        <div className="mt-8 grid gap-8 md:grid-cols-[1.1fr_1fr] md:items-center">
          <div className="min-w-0">
            <h1 className="font-display text-4xl font-bold leading-[1.02] text-balance sm:text-5xl md:text-6xl">
              {profile.full_name}
            </h1>

            {profile.short_bio?.trim() && (
              /*
                KIRISH MATNI MUQOVADA.

                Jurnal muqovasida sarlavha ostida qisqa "tizer"
                bo'ladi. Uni pastga tushirish muqovani bo'sh
                qoldirardi.
              */
              <p className="mt-5 max-w-xl text-lg leading-relaxed" style={{ color: SOFT }}>
                {profile.short_bio}
              </p>
            )}

            <p className="mt-6 flex flex-wrap gap-x-5 text-[11px] uppercase tracking-[0.2em]" style={{ color: SOFT }}>
              {profile.category?.name && <span>{profile.category.name}</span>}
              {profile.region?.name && <span>{profile.region.name}</span>}
            </p>
          </div>

          {profile.avatar_url && (
            <div className="relative">
              {/*
                PORTRET 4:5 NISBATDA.

                Jurnal portretlari odatda tik va kvadratdan uzun —
                bu kompozitsiyaga vazn beradi.
              */}
              <span className="relative block aspect-[4/5] w-full overflow-hidden">
                <Image
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  fill
                  sizes="(max-width: 768px) 100vw, 480px"
                  priority
                  className="object-cover"
                />
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

/* ========================================================================= *
 * BO'LIM
 * ========================================================================= */

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-14">
      <h2
        className="mb-6 border-b pb-2 text-[11px] font-semibold uppercase tracking-[0.3em]"
        style={{ color: BURGUNDY, borderColor: RULE }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

/* ========================================================================= *
 * UMUMIY REYTING
 *
 *    Jurnal "ma'lumot chizig'i" uslubida: katta raqam va yonida
 *    maxraj. SHARTSIZ ko'rsatiladi — 0,0 ham haqiqiy ball va uni
 *    yashirish nomzodga "reyting yo'q" degan yolg'on taassurot
 *    berardi.
 * ========================================================================= */

function Ranking({ profile }: ThemeProps) {
  const ranking = rankingDisplay(
    profile.position,
    profile.total_score,
    profile.ranking.hasRow,
  );

  return (
    <section
      className="mt-12 flex flex-wrap items-end justify-between gap-4 border-y py-5"
      style={{ borderColor: RULE }}
    >
      <div>
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.3em]"
          style={{ color: BURGUNDY }}
        >
          {ranking.label}
        </p>
        <p className="mt-2 flex items-end gap-2">
          <span className="font-display text-5xl font-bold tabular-nums leading-none">
            {ranking.score}
          </span>
          <span className="pb-1 text-sm" style={{ color: SOFT }}>
            {ranking.scoreUnit}
          </span>
        </p>
      </div>

      <p className="text-[11px] uppercase tracking-[0.2em]" style={{ color: SOFT }}>
        {ranking.rank ? (
          <>
            <span className="font-display text-2xl font-bold tracking-normal" style={{ color: INK }}>
              {ranking.rank}
            </span>{" "}
            {ranking.rankLabel}
          </>
        ) : (
          ranking.rankNote
        )}
      </p>
    </section>
  );
}

/* ========================================================================= *
 * BIOGRAFIYA — IKKI USTUN
 * ========================================================================= */

function Biography({ profile }: ThemeProps) {
  const sections = profile.sections ?? [];
  if (sections.length === 0) return null;

  return (
    <>
      {sections.map((section, index) => (
        <Block key={section.id} title={section.title?.trim() || "Haqida"}>
          {/*
            IKKI USTUN FAQAT KENG EKRANDA.

            `columns-2` mobil qurilmada o'qishni qiyinlashtirardi:
            ustun tor bo'lsa, har qatorga uch-to'rt so'z tushadi.
          */}
          <div
            className="whitespace-pre-wrap text-[1.02rem] leading-[1.8] lg:columns-2 lg:gap-10"
            style={{ color: INK }}
          >
            {/*
              BIRINCHI BO'LIMNING BIRINCHI HARFI — YIRIK.

              Jurnal uslubining asosiy belgisi. Faqat birinchi
              bo'limda: har bo'limda takrorlansa, u bezak bo'lib
              qolardi.
            */}
            {index === 0 ? (
              <span className="[&::first-letter]:float-left [&::first-letter]:mr-3 [&::first-letter]:mt-1 [&::first-letter]:font-display [&::first-letter]:text-[3.6rem] [&::first-letter]:font-bold [&::first-letter]:leading-[0.8]">
                {section.content}
              </span>
            ) : (
              section.content
            )}
          </div>
        </Block>
      ))}
    </>
  );
}

/* ========================================================================= *
 * IQTIBOSLAR — ASOSIY ELEMENT
 * ========================================================================= */

function Quotes({ profile }: ThemeProps) {
  const quotes = profile.quotes ?? [];
  if (quotes.length === 0) return null;

  return (
    <section className="mt-14 space-y-10">
      {quotes.map((quote) => (
        <blockquote
          key={String(quote.id)}
          className="mx-auto max-w-3xl border-l-2 pl-6"
          style={{ borderColor: BURGUNDY }}
        >
          <p className="font-display text-2xl italic leading-[1.35] text-balance sm:text-3xl">
            {String(quote.text ?? "")}
          </p>
        </blockquote>
      ))}
    </section>
  );
}

/* ========================================================================= *
 * YO'L
 * ========================================================================= */

function Path({ profile }: ThemeProps) {
  const work = toTimeline(profile.workExperience ?? []);
  const education = toTimeline(profile.education ?? []);

  if (work.length === 0 && education.length === 0) return null;

  return (
    <Block title="Hayot yo'li">
      <div className="grid gap-10 sm:grid-cols-2">
        {work.length > 0 && <Column label="Faoliyat" items={work} />}
        {education.length > 0 && <Column label="Ta'lim" items={education} />}
      </div>
    </Block>
  );
}

function Column({
  label,
  items,
}: {
  label: string;
  items: ReturnType<typeof toTimeline>;
}) {
  return (
    <div>
      <h3 className="mb-4 font-display text-lg font-semibold">{label}</h3>
      <ol className="space-y-4">
        {items.map((item) => (
          <li key={item.id}>
            <p className="font-semibold">{item.title}</p>
            {item.subtitle && (
              <p className="text-sm" style={{ color: SOFT }}>
                {item.subtitle}
              </p>
            )}
            <p className="mt-0.5 text-xs tabular-nums" style={{ color: BURGUNDY }}>
              {range(item.from, item.to)}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ========================================================================= *
 * YUTUQLAR
 * ========================================================================= */

function Achievements({ profile }: ThemeProps) {
  const items = toTimeline(profile.achievements ?? []);
  if (items.length === 0) return null;

  return (
    <Block title="Yutuqlar">
      <ul className="space-y-4">
        {items.map((item) => (
          <li
            key={item.id}
            className="grid gap-1 border-b pb-4 last:border-0 sm:grid-cols-[4rem_1fr] sm:gap-5"
            style={{ borderColor: RULE }}
          >
            <span className="text-sm tabular-nums" style={{ color: BURGUNDY }}>
              {year(item.from)}
            </span>
            <span>
              <span className="block font-semibold">{item.title}</span>
              {item.subtitle && (
                <span className="block text-sm" style={{ color: SOFT }}>
                  {item.subtitle}
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </Block>
  );
}

/* ========================================================================= *
 * SERTIFIKATLAR
 * ========================================================================= */

function Certificates({ profile }: ThemeProps) {
  const certificates = profile.certificates ?? [];
  if (certificates.length === 0) return null;

  return (
    <Block title="Sertifikatlar">
      <ul className="grid gap-3 sm:grid-cols-2">
        {certificates.map((certificate) => (
          <li
            key={certificate.id}
            className="px-4 py-3"
            style={{ backgroundColor: PAPER, border: `1px solid ${RULE}` }}
          >
            <p className="font-semibold">{certificate.title}</p>
            {certificate.issuer && (
              <p className="text-xs" style={{ color: SOFT }}>
                {certificate.issuer}
              </p>
            )}
            <p
              className="mt-1.5 text-[10px] uppercase tracking-[0.2em]"
              style={{ color: isVerified(certificate.trust) ? BURGUNDY : SOFT }}
            >
              {trustLabel(certificate.trust)}
            </p>
          </li>
        ))}
      </ul>
    </Block>
  );
}

/* ========================================================================= *
 * RASMLAR
 * ========================================================================= */

function Gallery({ profile }: ThemeProps) {
  const media = profile.media ?? [];
  if (media.length === 0) return null;

  return (
    <Block title="Suratlar">
      {/*
        BIRINCHI RASM TO'LIQ KENGLIKDA, qolganlari panjarada.

        Jurnal sahifasida bir "asosiy" surat va atrofida kichiklari
        bo'ladi — bu ritm yaratadi.
      */}
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {media.map((item, index) => (
          <li
            key={item.url}
            className={`relative overflow-hidden ${
              index === 0 ? "col-span-2 aspect-[16/9] sm:col-span-3" : "aspect-square"
            }`}
            style={{ backgroundColor: PAPER }}
          >
            <Image
              src={item.url}
              alt={item.caption ?? `${profile.full_name} — galereya rasmi`}
              fill
              sizes={
                index === 0
                  ? "(max-width: 1024px) 100vw, 896px"
                  : "(max-width: 640px) 50vw, 33vw"
              }
              loading="lazy"
              className="object-cover"
            />
          </li>
        ))}
      </ul>
    </Block>
  );
}

/* ========================================================================= *
 * FOOTER
 * ========================================================================= */

function Footer({ profile }: ThemeProps) {
  const links = (profile.socialLinks ?? [])
    .map((link) => ({
      id: String(link.id),
      title: String(link.title ?? "Havola"),
      url: safeUrl(String(link.url ?? "")),
    }))
    .filter((link) => link.url !== null);

  return (
    <footer style={{ backgroundColor: PAPER, borderTop: `1px solid ${RULE}` }}>
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-8 sm:px-6">
        {links.length > 0 && (
          <ul className="flex flex-wrap gap-5">
            {links.map((link) => (
              <li key={link.id}>
                <a
                  href={link.url!}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="text-[11px] uppercase tracking-[0.2em] underline"
                  style={{ color: SOFT }}
                >
                  {link.title}
                </a>
              </li>
            ))}
          </ul>
        )}

        <Link
          href="/liderlar"
          className="text-[11px] font-semibold uppercase tracking-[0.2em]"
          style={{ color: BURGUNDY }}
        >
          Liderlar.uz
        </Link>
      </div>
    </footer>
  );
}
