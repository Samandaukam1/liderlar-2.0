import Image from "next/image";
import Link from "next/link";
import { isVerified, range, safeUrl, toTimeline, trustLabel, year } from "@/lib/themes/shape";
import type { ThemeProps } from "@/lib/themes/types";

/**
 * MONOCHROME SIGNATURE — moda, editorial, shaxsiy brend.
 *
 * Kayfiyat: katta portret, o'lchamdan katta tipografiya, minimal
 * gorizontal kompozitsiyalar, deyarli bezaksiz.
 *
 * MAVJUD DIZAYNLARDAN FARQI (§9):
 *
 *   - RANG YO'Q. Faqat qora, oq va kulrang — urg'u rangi ham yo'q.
 *     Qolgan hamma dizaynda urg'u rangi bor (tilla, moviy,
 *     burgundiya).
 *   - GORIZONTAL KOMPOZITSIYA: bo'limlar tik ro'yxat emas, chapda
 *     yorliq va o'ngda mazmun — moda nashrlarining tuzilishi.
 *   - TIPOGRAFIYA ENG KATTA elementi: ism ekran kengligiga
 *     yaqinlashadi.
 *   - BEZAK UI YO'Q: kartochka, ramka, soya — hech biri yo'q.
 *     Faqat ingichka chiziqlar.
 */

const PAPER = "#fbfbfb";
const INK = "#0b0b0b";
const GREY = "#767676";
const HAIRLINE = "#e2e2e2";

export default function MonochromeSignatureTheme({ profile }: ThemeProps) {
  return (
    <div style={{ backgroundColor: PAPER, color: INK }} className="min-h-screen">
      <Hero profile={profile} />

      <div className="mx-auto max-w-5xl px-4 pb-24 sm:px-6">
        <Row label="Haqida">
          <Biography profile={profile} />
        </Row>

        <Experience profile={profile} />
        <Achievements profile={profile} />
        <Certificates profile={profile} />
      </div>

      <Gallery profile={profile} />
      <Footer profile={profile} />
    </div>
  );
}

/* ========================================================================= *
 * HERO
 * ========================================================================= */

function Hero({ profile }: ThemeProps) {
  return (
    <header className="mx-auto max-w-5xl px-4 pt-14 sm:px-6 sm:pt-20">
      {/*
        ISM — EKRAN KENGLIGIGA YAQIN.

        `clamp` ishlatilgan, chunki Tailwind o'lchamlari bu yerda
        yetarli emas: ism ekranga moslashib o'sishi kerak, lekin
        juda uzun ism ham sig'ishi kerak.
      */}
      <h1
        className="font-display font-bold uppercase leading-[0.88] tracking-[-0.02em] text-balance"
        style={{ fontSize: "clamp(2.5rem, 11vw, 7rem)" }}
      >
        {profile.full_name}
      </h1>

      <p className="mt-6 flex flex-wrap gap-x-6 text-xs uppercase tracking-[0.3em]" style={{ color: GREY }}>
        {profile.category?.name && <span>{profile.category.name}</span>}
        {profile.region?.name && <span>{profile.region.name}</span>}
      </p>

      {profile.avatar_url && (
        /*
          PORTRET KENG VA PAST — 21:9.

          Portret nisbatidan ataylab voz kechilgan: moda nashrlarida
          kadr keng bo'ladi va yuz kompozitsiyaning bir qismi, markazi
          emas.
        */
        <span className="relative mt-10 block aspect-[21/9] w-full overflow-hidden">
          <Image
            src={profile.avatar_url}
            alt={profile.full_name}
            fill
            sizes="(max-width: 1024px) 100vw, 1024px"
            priority
            className="object-cover object-top grayscale"
          />
        </span>
      )}
    </header>
  );
}

/* ========================================================================= *
 * GORIZONTAL QATOR
 * ========================================================================= */

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="grid gap-4 border-t py-10 sm:grid-cols-[10rem_1fr] sm:gap-10"
      style={{ borderColor: HAIRLINE }}
    >
      {/* Yorliq chapda, mazmun o'ngda — moda nashrlarining tuzilishi. */}
      <h2 className="text-[11px] uppercase tracking-[0.3em]" style={{ color: GREY }}>
        {label}
      </h2>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

function Biography({ profile }: ThemeProps) {
  const hasBio = Boolean(profile.short_bio?.trim());
  const sections = profile.sections ?? [];

  if (!hasBio && sections.length === 0) {
    return <p style={{ color: GREY }}>—</p>;
  }

  return (
    <>
      {hasBio && <p className="text-xl leading-[1.5] text-balance">{profile.short_bio}</p>}

      {sections.map((section) => (
        <div key={section.id} className={hasBio ? "mt-6" : ""}>
          {section.title?.trim() && (
            <h3 className="mb-1 text-sm font-semibold uppercase tracking-wide">
              {section.title}
            </h3>
          )}
          <div className="whitespace-pre-wrap leading-[1.8]" style={{ color: GREY }}>
            {section.content}
          </div>
        </div>
      ))}
    </>
  );
}

/* ========================================================================= *
 * TAJRIBA
 * ========================================================================= */

function Experience({ profile }: ThemeProps) {
  const items = [
    ...toTimeline(profile.workExperience ?? []),
    ...toTimeline(profile.education ?? []),
  ];
  if (items.length === 0) return null;

  return (
    <Row label="Yo'l">
      <ol className="space-y-5">
        {items.map((item) => (
          <li key={item.id} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <span className="min-w-0">
              <span className="block text-lg font-semibold">{item.title}</span>
              {item.subtitle && (
                <span className="block text-sm" style={{ color: GREY }}>
                  {item.subtitle}
                </span>
              )}
            </span>
            <span className="shrink-0 text-xs tabular-nums" style={{ color: GREY }}>
              {range(item.from, item.to)}
            </span>
          </li>
        ))}
      </ol>
    </Row>
  );
}

/* ========================================================================= *
 * YUTUQLAR
 * ========================================================================= */

function Achievements({ profile }: ThemeProps) {
  const items = toTimeline(profile.achievements ?? []);
  if (items.length === 0) return null;

  return (
    <Row label="Yutuqlar">
      <ol className="space-y-4">
        {items.map((item) => (
          <li key={item.id} className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
            <span className="shrink-0 text-xs tabular-nums" style={{ color: GREY }}>
              {year(item.from)}
            </span>
            <span className="min-w-0 text-lg font-semibold leading-snug">{item.title}</span>
          </li>
        ))}
      </ol>
    </Row>
  );
}

/* ========================================================================= *
 * SERTIFIKATLAR
 * ========================================================================= */

function Certificates({ profile }: ThemeProps) {
  const certificates = profile.certificates ?? [];
  if (certificates.length === 0) return null;

  return (
    <Row label="Sertifikatlar">
      <ul className="space-y-3">
        {certificates.map((certificate) => (
          <li key={certificate.id} className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="min-w-0">
              <span className="block font-semibold">{certificate.title}</span>
              {certificate.issuer && (
                <span className="block text-xs" style={{ color: GREY }}>
                  {certificate.issuer}
                </span>
              )}
            </span>
            {/*
              URG'U RANGI YO'Q, shuning uchun tasdiq QALIN HARF bilan
              ajratiladi — bu dizaynning yagona vositasi.
            */}
            <span
              className={`shrink-0 text-[10px] uppercase tracking-[0.2em] ${
                isVerified(certificate.trust) ? "font-bold" : ""
              }`}
              style={{ color: isVerified(certificate.trust) ? INK : GREY }}
            >
              {trustLabel(certificate.trust)}
            </span>
          </li>
        ))}
      </ul>
    </Row>
  );
}

/* ========================================================================= *
 * RASMLAR — TO'LIQ KENGLIK
 * ========================================================================= */

function Gallery({ profile }: ThemeProps) {
  const media = profile.media ?? [];
  if (media.length === 0) return null;

  return (
    <section className="border-t" style={{ borderColor: HAIRLINE }}>
      {/*
        RASMLAR EKRANNI TO'LIQ EGALLAYDI.

        Konteyner chegarasidan chiqadi: moda nashrlarida surat
        matndan muhimroq va u sahifa chetiga tegadi.
      */}
      <ul className="grid grid-cols-1 sm:grid-cols-2">
        {media.map((item) => (
          <li key={item.url} className="relative aspect-[4/5] overflow-hidden">
            <Image
              src={item.url}
              alt={item.caption ?? `${profile.full_name} — galereya rasmi`}
              fill
              sizes="(max-width: 640px) 100vw, 50vw"
              loading="lazy"
              className="object-cover grayscale"
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
    <footer className="border-t" style={{ borderColor: HAIRLINE }}>
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-10 sm:px-6">
        {links.length > 0 && (
          <ul className="flex flex-wrap gap-6">
            {links.map((link) => (
              <li key={link.id}>
                <a
                  href={link.url!}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="text-[11px] uppercase tracking-[0.25em]"
                  style={{ color: GREY }}
                >
                  {link.title}
                </a>
              </li>
            ))}
          </ul>
        )}

        <Link href="/liderlar" className="text-[11px] uppercase tracking-[0.25em] font-bold">
          Liderlar.uz
        </Link>
      </div>
    </footer>
  );
}
