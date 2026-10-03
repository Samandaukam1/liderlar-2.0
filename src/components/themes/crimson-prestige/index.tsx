import Image from "next/image";
import Link from "next/link";
import { isVerified, range, safeUrl, toTimeline, trustLabel, year } from "@/lib/themes/shape";
import type { ThemeProps } from "@/lib/themes/types";

/**
 * CRIMSON PRESTIGE — dadil yetakchilik, yutuq.
 *
 * Kayfiyat: assimetrik editorial tuzilma, yutuqqa yo'naltirilgan
 * kompozitsiya, kuchli iqtibos bo'limlari.
 *
 * MAVJUD DIZAYNLARDAN FARQI (§9):
 *
 *   - ASSIMETRIYA: panjara 2:1 nisbatda va bo'limlar navbatma-navbat
 *     chap va o'ng ustunga tushadi. Qolgan hamma dizayn simmetrik
 *     yoki bitta ustunli.
 *   - YUTUQLAR BIRINCHI O'RINDA — biografiyadan OLDIN. Boshqa
 *     dizaynlarda ular pastda; bu dizaynning gapi aynan yutuqda.
 *   - Royal Navy ham to'q rangda, lekin u rasmiy va markazlashgan;
 *     bu esa dadil va siljigan.
 *
 * Sportchilar va tanlov g'oliblari uchun.
 */

const BURGUNDY = "#5a1220";
const BURGUNDY_DEEP = "#3d0c16";
const CREAM = "#f4ece4";
const CREAM_DEEP = "#e3d7cb";
const COAL = "#121212";
const BRONZE = "#a07040";

export default function CrimsonPrestigeTheme({ profile }: ThemeProps) {
  return (
    <div style={{ backgroundColor: CREAM, color: COAL }} className="min-h-screen">
      <Hero profile={profile} />

      <div className="mx-auto max-w-5xl px-4 pb-24 sm:px-6">
        {/*
          YUTUQLAR BIROF BIOGRAFIYADAN OLDIN.

          Bu dizayn yutuq uchun: ularni pastga tushirish uning
          ma'nosini yo'qotardi.
        */}
        <Achievements profile={profile} />
        <Biography profile={profile} />
        <Quotes profile={profile} />
        <Path profile={profile} />
        <Certificates profile={profile} />
        <Gallery profile={profile} />
      </div>

      <Footer profile={profile} />
    </div>
  );
}

/* ========================================================================= *
 * HERO — ASSIMETRIK
 * ========================================================================= */

function Hero({ profile }: ThemeProps) {
  return (
    <header style={{ backgroundColor: BURGUNDY, color: CREAM }}>
      {/*
        2:1 PANJARA — matn keng, portret tor.

        Teng ikki ustun muvozanatli, lekin bu dizaynning gapi
        dadillikda: siljigan nisbat harakat hissini beradi.
      */}
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-14 sm:px-6 md:grid-cols-[2fr_1fr] md:items-end">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.4em]" style={{ color: BRONZE }}>
            Liderlar
          </p>

          <h1 className="mt-4 font-display text-4xl font-bold leading-[0.98] text-balance sm:text-5xl md:text-6xl">
            {profile.full_name}
          </h1>

          {profile.short_bio?.trim() && (
            <p className="mt-5 max-w-xl text-lg leading-relaxed" style={{ color: CREAM_DEEP }}>
              {profile.short_bio}
            </p>
          )}

          <p className="mt-5 flex flex-wrap gap-x-5 text-xs uppercase tracking-[0.25em]" style={{ color: BRONZE }}>
            {profile.category?.name && <span>{profile.category.name}</span>}
            {profile.region?.name && <span style={{ color: CREAM_DEEP }}>{profile.region.name}</span>}
          </p>
        </div>

        {profile.avatar_url && (
          <span className="relative block aspect-[3/4] w-full overflow-hidden md:-mb-14">
            {/*
              `-mb-14` — portret bo'lim chegarasidan CHIQADI.

              Assimetriyani kuchaytiradi: rasm hero ichida qolsa,
              kompozitsiya tinch bo'lib qolardi.
            */}
            <Image
              src={profile.avatar_url}
              alt={profile.full_name}
              fill
              sizes="(max-width: 768px) 100vw, 320px"
              priority
              className="object-cover"
            />
          </span>
        )}
      </div>
    </header>
  );
}

/* ========================================================================= *
 * YUTUQLAR — ASOSIY BO'LIM
 * ========================================================================= */

function Achievements({ profile }: ThemeProps) {
  const items = toTimeline(profile.achievements ?? []);
  if (items.length === 0) return null;

  return (
    <section className="pt-16">
      <h2 className="mb-6 font-display text-2xl font-bold" style={{ color: BURGUNDY }}>
        Yutuqlar
      </h2>

      <ul className="space-y-4">
        {items.map((item, index) => (
          <li
            key={item.id}
            className="grid gap-2 px-5 py-4 sm:grid-cols-[5rem_1fr] sm:gap-6"
            style={{
              /*
               * BIRINCHI YUTUQ TO'Q FONDA.
               *
               * Ro'yxatning birinchi qatori eng muhim: unga vazn
               * berish o'quvchining ko'zini aynan shu yerga
               * qaratadi.
               */
              backgroundColor: index === 0 ? BURGUNDY : CREAM_DEEP + "55",
              color: index === 0 ? CREAM : COAL,
            }}
          >
            <span
              className="text-sm tabular-nums"
              style={{ color: index === 0 ? BRONZE : BURGUNDY }}
            >
              {year(item.from) || "—"}
            </span>
            <span className="min-w-0">
              <span className="block text-lg font-semibold leading-snug">{item.title}</span>
              {item.subtitle && (
                <span
                  className="mt-0.5 block text-sm"
                  style={{ color: index === 0 ? CREAM_DEEP : "#5a5046" }}
                >
                  {item.subtitle}
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ========================================================================= *
 * BIOGRAFIYA — SILJIGAN USTUN
 * ========================================================================= */

function Biography({ profile }: ThemeProps) {
  const sections = profile.sections ?? [];
  if (sections.length === 0) return null;

  return (
    <section className="mt-16">
      {sections.map((section, index) => (
        <div
          key={section.id}
          /*
            NAVBATMA-NAVBAT CHAP VA O'NG.
            Assimetriyani butun sahifa bo'ylab davom ettiradi.
          */
          className={`mt-8 max-w-2xl ${index % 2 === 1 ? "md:ml-auto" : ""}`}
        >
          {section.title?.trim() && (
            <h2 className="mb-2 font-display text-xl font-bold" style={{ color: BURGUNDY }}>
              {section.title}
            </h2>
          )}
          <div className="whitespace-pre-wrap leading-[1.8]" style={{ color: "#4a423a" }}>
            {section.content}
          </div>
        </div>
      ))}
    </section>
  );
}

/* ========================================================================= *
 * IQTIBOSLAR
 * ========================================================================= */

function Quotes({ profile }: ThemeProps) {
  const quotes = profile.quotes ?? [];
  if (quotes.length === 0) return null;

  return (
    <section className="mt-16 space-y-6">
      {quotes.map((quote) => (
        <blockquote
          key={String(quote.id)}
          className="px-6 py-6 sm:px-10"
          style={{ backgroundColor: BURGUNDY_DEEP, color: CREAM }}
        >
          <p className="font-display text-2xl font-semibold leading-tight text-balance sm:text-3xl">
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
  const items = [
    ...toTimeline(profile.workExperience ?? []),
    ...toTimeline(profile.education ?? []),
  ];
  if (items.length === 0) return null;

  return (
    <section className="mt-16">
      <h2 className="mb-5 font-display text-xl font-bold" style={{ color: BURGUNDY }}>
        Yo&apos;l
      </h2>

      <ol className="grid gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item.id} className="border-t pt-3" style={{ borderColor: CREAM_DEEP }}>
            <p className="text-xs tabular-nums" style={{ color: BRONZE }}>
              {range(item.from, item.to)}
            </p>
            <p className="mt-0.5 font-semibold">{item.title}</p>
            {item.subtitle && (
              <p className="text-sm" style={{ color: "#5a5046" }}>
                {item.subtitle}
              </p>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ========================================================================= *
 * SERTIFIKATLAR
 * ========================================================================= */

function Certificates({ profile }: ThemeProps) {
  const certificates = profile.certificates ?? [];
  if (certificates.length === 0) return null;

  return (
    <section className="mt-16">
      <h2 className="mb-5 font-display text-xl font-bold" style={{ color: BURGUNDY }}>
        Sertifikatlar
      </h2>

      <ul className="space-y-3">
        {certificates.map((certificate) => (
          <li
            key={certificate.id}
            className="flex flex-wrap items-baseline justify-between gap-2 border-b pb-3"
            style={{ borderColor: CREAM_DEEP }}
          >
            <span className="min-w-0">
              <span className="block font-semibold">{certificate.title}</span>
              {certificate.issuer && (
                <span className="block text-xs" style={{ color: "#5a5046" }}>
                  {certificate.issuer}
                </span>
              )}
            </span>
            <span
              className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.2em]"
              style={{ color: isVerified(certificate.trust) ? BURGUNDY : "#5a5046" }}
            >
              {trustLabel(certificate.trust)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ========================================================================= *
 * RASMLAR
 * ========================================================================= */

function Gallery({ profile }: ThemeProps) {
  const media = profile.media ?? [];
  if (media.length === 0) return null;

  return (
    <section className="mt-16">
      {/*
        ASSIMETRIK PANJARA: birinchi rasm ikki katak egallaydi.
      */}
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {media.map((item, index) => (
          <li
            key={item.url}
            className={`relative overflow-hidden ${
              index === 0 ? "col-span-2 aspect-[3/2]" : "aspect-square"
            }`}
            style={{ backgroundColor: CREAM_DEEP }}
          >
            <Image
              src={item.url}
              alt={item.caption ?? `${profile.full_name} — galereya rasmi`}
              fill
              sizes={index === 0 ? "(max-width: 640px) 100vw, 66vw" : "(max-width: 640px) 50vw, 33vw"}
              loading="lazy"
              className="object-cover"
            />
          </li>
        ))}
      </ul>
    </section>
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
    <footer style={{ backgroundColor: BURGUNDY_DEEP, color: CREAM }}>
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-8 sm:px-6">
        {links.length > 0 && (
          <ul className="flex flex-wrap gap-5">
            {links.map((link) => (
              <li key={link.id}>
                <a
                  href={link.url!}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="text-[11px] uppercase tracking-[0.2em]"
                  style={{ color: CREAM_DEEP }}
                >
                  {link.title}
                </a>
              </li>
            ))}
          </ul>
        )}

        <Link href="/liderlar" className="text-[11px] uppercase tracking-[0.25em]" style={{ color: BRONZE }}>
          Liderlar.uz
        </Link>
      </div>
    </footer>
  );
}
