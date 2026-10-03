import Image from "next/image";
import Link from "next/link";
import { isVerified, range, safeUrl, toTimeline, trustLabel, year } from "@/lib/themes/shape";
import type { ThemeProps } from "@/lib/themes/types";

/**
 * ZARAFSHON — zamonaviy o'zbek o'zligi.
 *
 * Spec ALOHIDA OGOHLANTIRADI (§10): "Use Uzbek ornamental geometry
 * extremely subtly. Do not turn the page into a traditional wedding
 * invitation."
 *
 * SHUNGA KO'RA MILLIY GEOMETRIYA QANDAY QO'LLANDI:
 *
 *   - FON NAQSHI YO'Q. Takrorlanadigan naqsh fonda sahifani darhol
 *     taklifnomaga aylantirardi.
 *   - Naqsh FAQAT BO'LIM AJRATGICHIDA va u ingichka chiziqdan
 *     yasalgan — to'ldirilgan shakl emas.
 *   - Rang paytaxt me'morchiligidan: iliq qum (g'isht), chuqur
 *     turkuaz (koshin), to'q dengiz ko'ki (soya). To'yinganlik
 *     BOSIQ — yorqin turkuaz suvenir estetikasi bo'lardi.
 *   - Tipografiya butunlay zamonaviy: milliy shrift yoki bezakli
 *     harf YO'Q.
 *
 * Madaniyat, san'at va milliy loyihalar uchun.
 */

const SAND = "#efe6d4";
const SAND_DEEP = "#e2d5bc";
const TURQUOISE = "#1a6b70";
const NAVY_DARK = "#17263c";
const GOLD_SOFT = "#b8923f";
const TEXT_MUTED = "#5d5546";

export default function ZarafshonTheme({ profile }: ThemeProps) {
  return (
    <div style={{ backgroundColor: SAND, color: NAVY_DARK }} className="min-h-screen">
      <Hero profile={profile} />

      <div className="mx-auto max-w-3xl px-4 pb-24 sm:px-6">
        <Biography profile={profile} />
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
 * NAQSH AJRATGICHI
 * ========================================================================= */

/**
 * Milliy geometriyaga ishora — INGICHKA CHIZIQDAN.
 *
 * Sakkiz burchakli yulduz (o'zbek koshinlaridagi asosiy shakl)
 * markazda, ikki tomonda ingichka chiziq. Shakl TO'LDIRILMAGAN:
 * to'ldirilgan naqsh og'ir ko'rinardi va spec ogohlantirgan
 * taklifnoma estetikasiga yaqinlashardi.
 */
function Ornament() {
  return (
    <span className="my-10 flex items-center justify-center gap-4" aria-hidden>
      <span className="h-px w-20" style={{ backgroundColor: SAND_DEEP }} />

      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        {/* Ikki kvadrat 45° burchakda — sakkiz burchakli yulduz. */}
        <rect
          x="4"
          y="4"
          width="14"
          height="14"
          stroke={TURQUOISE}
          strokeWidth="1"
        />
        <rect
          x="4"
          y="4"
          width="14"
          height="14"
          stroke={GOLD_SOFT}
          strokeWidth="1"
          transform="rotate(45 11 11)"
        />
      </svg>

      <span className="h-px w-20" style={{ backgroundColor: SAND_DEEP }} />
    </span>
  );
}

/* ========================================================================= *
 * HERO
 * ========================================================================= */

function Hero({ profile }: ThemeProps) {
  return (
    <header style={{ backgroundColor: NAVY_DARK, color: SAND }}>
      <div className="mx-auto grid max-w-3xl gap-8 px-4 py-14 sm:grid-cols-[auto_1fr] sm:items-center sm:px-6 sm:py-18">
        {profile.avatar_url && (
          <span
            className="relative block h-32 w-32 shrink-0 overflow-hidden sm:h-40 sm:w-40"
            style={{ border: `1px solid ${TURQUOISE}` }}
          >
            <Image
              src={profile.avatar_url}
              alt={profile.full_name}
              fill
              sizes="(max-width: 640px) 128px, 160px"
              priority
              className="object-cover"
            />
          </span>
        )}

        <div className="min-w-0">
          <h1 className="font-display text-3xl font-bold leading-tight text-balance sm:text-4xl">
            {profile.full_name}
          </h1>

          <span className="mt-4 block h-px w-24" style={{ backgroundColor: GOLD_SOFT }} aria-hidden />

          <p className="mt-4 flex flex-wrap gap-x-5 text-xs uppercase tracking-[0.25em]">
            {profile.category?.name && <span style={{ color: TURQUOISE }}>{profile.category.name}</span>}
            {profile.region?.name && <span style={{ color: SAND_DEEP }}>{profile.region.name}</span>}
          </p>
        </div>
      </div>
    </header>
  );
}

/* ========================================================================= *
 * BIOGRAFIYA
 * ========================================================================= */

function Biography({ profile }: ThemeProps) {
  const hasBio = Boolean(profile.short_bio?.trim());
  const sections = profile.sections ?? [];
  if (!hasBio && sections.length === 0) return null;

  return (
    <section className="pt-12">
      {hasBio && (
        <p className="text-lg leading-[1.7] text-balance">{profile.short_bio}</p>
      )}

      {sections.map((section) => (
        <div key={section.id} className="mt-8">
          {section.title?.trim() && (
            <h2 className="mb-2 font-display text-lg font-semibold" style={{ color: TURQUOISE }}>
              {section.title}
            </h2>
          )}
          <div className="whitespace-pre-wrap leading-[1.8]" style={{ color: TEXT_MUTED }}>
            {section.content}
          </div>
        </div>
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
    <section>
      <Ornament />
      <h2 className="mb-5 text-center text-[11px] font-semibold uppercase tracking-[0.3em]" style={{ color: TURQUOISE }}>
        Hayot yo&apos;li
      </h2>

      <ol className="space-y-4">
        {items.map((item) => (
          <li
            key={item.id}
            className="px-4 py-3"
            style={{ backgroundColor: SAND_DEEP + "66", borderLeft: `2px solid ${TURQUOISE}` }}
          >
            <p className="text-xs tabular-nums" style={{ color: GOLD_SOFT }}>
              {range(item.from, item.to)}
            </p>
            <p className="mt-0.5 font-semibold">{item.title}</p>
            {item.subtitle && (
              <p className="text-sm" style={{ color: TEXT_MUTED }}>
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
 * YUTUQLAR
 * ========================================================================= */

function Achievements({ profile }: ThemeProps) {
  const items = toTimeline(profile.achievements ?? []);
  if (items.length === 0) return null;

  return (
    <section>
      <Ornament />
      <h2 className="mb-5 text-center text-[11px] font-semibold uppercase tracking-[0.3em]" style={{ color: TURQUOISE }}>
        Yutuqlar
      </h2>

      <ul className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item.id} className="px-4 py-3" style={{ border: `1px solid ${SAND_DEEP}` }}>
            {item.from && (
              <p className="text-xs tabular-nums" style={{ color: GOLD_SOFT }}>
                {year(item.from)}
              </p>
            )}
            <p className="mt-0.5 font-semibold leading-snug">{item.title}</p>
            {item.subtitle && (
              <p className="mt-0.5 text-sm" style={{ color: TEXT_MUTED }}>
                {item.subtitle}
              </p>
            )}
          </li>
        ))}
      </ul>
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
    <section>
      <Ornament />
      <h2 className="mb-5 text-center text-[11px] font-semibold uppercase tracking-[0.3em]" style={{ color: TURQUOISE }}>
        Sertifikatlar
      </h2>

      <ul className="space-y-3">
        {certificates.map((certificate) => (
          <li key={certificate.id} className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="min-w-0">
              <span className="block font-semibold">{certificate.title}</span>
              {certificate.issuer && (
                <span className="block text-xs" style={{ color: TEXT_MUTED }}>
                  {certificate.issuer}
                </span>
              )}
            </span>
            <span
              className="shrink-0 text-[10px] uppercase tracking-[0.2em]"
              style={{ color: isVerified(certificate.trust) ? TURQUOISE : TEXT_MUTED }}
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
    <section>
      <Ornament />
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {media.map((item) => (
          <li
            key={item.url}
            className="relative aspect-[4/3] overflow-hidden"
            style={{ border: `1px solid ${SAND_DEEP}` }}
          >
            <Image
              src={item.url}
              alt={item.caption ?? `${profile.full_name} — galereya rasmi`}
              fill
              sizes="(max-width: 640px) 50vw, 33vw"
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
    <footer style={{ backgroundColor: NAVY_DARK, color: SAND }}>
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-4 px-4 py-8 sm:px-6">
        {links.length > 0 && (
          <ul className="flex flex-wrap gap-5">
            {links.map((link) => (
              <li key={link.id}>
                <a
                  href={link.url!}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="text-[11px] uppercase tracking-[0.2em]"
                  style={{ color: SAND_DEEP }}
                >
                  {link.title}
                </a>
              </li>
            ))}
          </ul>
        )}

        <Link href="/liderlar" className="text-[11px] uppercase tracking-[0.25em]" style={{ color: TURQUOISE }}>
          Liderlar.uz
        </Link>
      </div>
    </footer>
  );
}
