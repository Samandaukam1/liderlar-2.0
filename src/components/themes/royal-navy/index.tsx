import Image from "next/image";
import Link from "next/link";
import { isVerified, range, safeUrl, toTimeline, trustLabel, year } from "@/lib/themes/shape";
import { rankingDisplay } from "@/lib/themes/profile-compose";
import type { ThemeProps } from "@/lib/themes/types";

/**
 * ROYAL NAVY — davlat, diplomatiya, institut.
 *
 * Kayfiyat: to'liq kenglikdagi rasmiy tuzilma, markazlashgan
 * sarlavha, bosiq tilla detal.
 *
 * MAVJUD DIZAYNLARDAN FARQI (§9):
 *
 *   - MARKAZLASHGAN KOMPOZITSIYA. Qolgan hamma dizayn chapga
 *     tekislangan; rasmiy hujjat va davlat nashrlari esa
 *     markazlashgan sarlavhaga ega.
 *   - TO'LIQ KENGLIKDAGI BO'LIM FONLARI: bo'limlar kartochka emas,
 *     ekranni kesib o'tadigan yo'laklar — institutsional nashrlarning
 *     belgisi.
 *   - IMPERIAL GOLD ham tilla ishlatadi, lekin u QORA fonda va
 *     editorial; bu yerda fon DENGIZ KO'KI va tuzilma rasmiy.
 *
 * Davlat xizmati va diplomatiya uchun.
 */

const NAVY = "#0d1b33";
const NAVY_DEEP = "#081326";
const NAVY_SOFT = "#16294a";
const WHITE = "#f5f7fa";
const MUTED = "#9aa8bf";
const GOLD = "#b08d4f";

export default function RoyalNavyTheme({ profile }: ThemeProps) {
  return (
    <div style={{ backgroundColor: NAVY, color: WHITE }} className="min-h-screen">
      <Hero profile={profile} />
      <Ranking profile={profile} />
      <Biography profile={profile} />
      <Service profile={profile} />
      <Achievements profile={profile} />
      <Certificates profile={profile} />
      <Gallery profile={profile} />
      <Footer profile={profile} />
    </div>
  );
}

/* ========================================================================= *
 * HERO — MARKAZLASHGAN
 * ========================================================================= */

function Hero({ profile }: ThemeProps) {
  return (
    <header style={{ backgroundColor: NAVY_DEEP }}>
      <div className="mx-auto max-w-4xl px-4 py-14 text-center sm:px-6 sm:py-20">
        {profile.avatar_url && (
          /*
            PORTRET DOIRA SHAKLIDA VA MARKAZDA.

            Rasmiy nashrlarda portret odatda markazda va doira
            ichida bo'ladi — bu "rasmiy fotosurat" hissini beradi.
          */
          <span
            className="relative mx-auto mb-8 block h-32 w-32 overflow-hidden rounded-full sm:h-40 sm:w-40"
            style={{ border: `2px solid ${GOLD}` }}
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

        <p className="text-[10px] font-semibold uppercase tracking-[0.4em]" style={{ color: GOLD }}>
          Liderlar
        </p>

        <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-balance sm:text-5xl">
          {profile.full_name}
        </h1>

        {/* Ikki tomonda ingichka tilla chiziq — rasmiy ajratgich. */}
        <span className="mx-auto mt-6 flex max-w-xs items-center gap-3" aria-hidden>
          <span className="h-px flex-1" style={{ backgroundColor: GOLD }} />
          <span className="h-1.5 w-1.5 rotate-45" style={{ backgroundColor: GOLD }} />
          <span className="h-px flex-1" style={{ backgroundColor: GOLD }} />
        </span>

        <p className="mt-5 flex flex-wrap justify-center gap-x-5 text-xs uppercase tracking-[0.25em]" style={{ color: MUTED }}>
          {profile.category?.name && <span>{profile.category.name}</span>}
          {profile.region?.name && <span>{profile.region.name}</span>}
        </p>
      </div>
    </header>
  );
}

/* ========================================================================= *
 * BO'LIM — TO'LIQ KENGLIKDAGI YO'LAK
 * ========================================================================= */

function Band({
  title,
  children,
  alt = false,
}: {
  title: string;
  children: React.ReactNode;
  /** Navbatma-navbat fon — yo'laklar ajralib turishi uchun. */
  alt?: boolean;
}) {
  return (
    <section style={{ backgroundColor: alt ? NAVY_SOFT : NAVY }}>
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <h2
          className="mb-6 text-center text-[11px] font-semibold uppercase tracking-[0.35em]"
          style={{ color: GOLD }}
        >
          {title}
        </h2>
        {children}
      </div>
    </section>
  );
}

/* ========================================================================= *
 * UMUMIY REYTING
 *
 *    Yo'lak uslubida, markazlashgan — bu dizaynning asosiy tuzilishi.
 *    SHARTSIZ ko'rsatiladi: 0,0 ham haqiqiy ball va uni yashirish
 *    nomzodga "reyting yo'q" degan yolg'on taassurot berardi.
 * ========================================================================= */

function Ranking({ profile }: ThemeProps) {
  const ranking = rankingDisplay(
    profile.position,
    profile.total_score,
    profile.ranking.hasRow,
  );

  return (
    <Band title={ranking.label} alt>
      <p className="flex items-end justify-center gap-2">
        <span className="font-display text-6xl font-bold tabular-nums leading-none">
          {ranking.score}
        </span>
        <span className="pb-1.5 text-sm" style={{ color: MUTED }}>
          {ranking.scoreUnit}
        </span>
      </p>
      <p
        className="mt-4 text-center text-[11px] uppercase tracking-[0.3em]"
        style={{ color: MUTED }}
      >
        {ranking.rank ? (
          <>
            <span style={{ color: GOLD }}>{ranking.rank}</span> · {ranking.rankLabel}
          </>
        ) : (
          ranking.rankNote
        )}
      </p>
    </Band>
  );
}

function Biography({ profile }: ThemeProps) {
  const hasBio = Boolean(profile.short_bio?.trim());
  const sections = profile.sections ?? [];
  if (!hasBio && sections.length === 0) return null;

  return (
    <Band title="Haqida">
      {hasBio && (
        <p className="mx-auto max-w-2xl text-center text-lg leading-relaxed">
          {profile.short_bio}
        </p>
      )}

      {sections.map((section) => (
        <div key={section.id} className="mx-auto mt-8 max-w-2xl">
          {section.title?.trim() && (
            <h3 className="mb-2 text-center font-display text-lg font-semibold">
              {section.title}
            </h3>
          )}
          <div className="whitespace-pre-wrap text-[15px] leading-[1.8]" style={{ color: MUTED }}>
            {section.content}
          </div>
        </div>
      ))}
    </Band>
  );
}

/* ========================================================================= *
 * XIZMAT YO'LI
 * ========================================================================= */

function Service({ profile }: ThemeProps) {
  const work = toTimeline(profile.workExperience ?? []);
  const education = toTimeline(profile.education ?? []);
  const items = [...work, ...education];
  if (items.length === 0) return null;

  return (
    <Band title="Xizmat yo'li" alt>
      <ol className="mx-auto max-w-2xl space-y-6">
        {items.map((item) => (
          <li key={item.id} className="text-center">
            <p className="text-xs tabular-nums" style={{ color: GOLD }}>
              {range(item.from, item.to)}
            </p>
            <p className="mt-1 font-display text-lg font-semibold">{item.title}</p>
            {item.subtitle && (
              <p className="text-sm" style={{ color: MUTED }}>
                {item.subtitle}
              </p>
            )}
          </li>
        ))}
      </ol>
    </Band>
  );
}

/* ========================================================================= *
 * YUTUQLAR
 * ========================================================================= */

function Achievements({ profile }: ThemeProps) {
  const items = toTimeline(profile.achievements ?? []);
  if (items.length === 0) return null;

  return (
    <Band title="Mukofotlar va yutuqlar">
      <ul className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="px-5 py-4 text-center"
            style={{ backgroundColor: NAVY_SOFT, border: `1px solid ${GOLD}33` }}
          >
            {item.from && (
              <p className="text-xs tabular-nums" style={{ color: GOLD }}>
                {year(item.from)}
              </p>
            )}
            <p className="mt-1 font-semibold">{item.title}</p>
            {item.subtitle && (
              <p className="mt-0.5 text-xs" style={{ color: MUTED }}>
                {item.subtitle}
              </p>
            )}
          </li>
        ))}
      </ul>
    </Band>
  );
}

/* ========================================================================= *
 * SERTIFIKATLAR
 * ========================================================================= */

function Certificates({ profile }: ThemeProps) {
  const certificates = profile.certificates ?? [];
  if (certificates.length === 0) return null;

  return (
    <Band title="Sertifikatlar" alt>
      <ul className="mx-auto max-w-2xl space-y-3">
        {certificates.map((certificate) => (
          <li key={certificate.id} className="text-center">
            <p className="font-semibold">{certificate.title}</p>
            {certificate.issuer && (
              <p className="text-xs" style={{ color: MUTED }}>
                {certificate.issuer}
              </p>
            )}
            <p
              className="mt-1 text-[10px] uppercase tracking-[0.2em]"
              style={{ color: isVerified(certificate.trust) ? GOLD : MUTED }}
            >
              {trustLabel(certificate.trust)}
            </p>
          </li>
        ))}
      </ul>
    </Band>
  );
}

/* ========================================================================= *
 * RASMLAR
 * ========================================================================= */

function Gallery({ profile }: ThemeProps) {
  const media = profile.media ?? [];
  if (media.length === 0) return null;

  return (
    <Band title="Suratlar">
      <ul className="mx-auto grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-3">
        {media.map((item) => (
          <li
            key={item.url}
            className="relative aspect-[4/3] overflow-hidden"
            style={{ border: `1px solid ${GOLD}33` }}
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
    </Band>
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
    <footer style={{ backgroundColor: NAVY_DEEP }}>
      <div className="mx-auto max-w-4xl px-4 py-10 text-center sm:px-6">
        {links.length > 0 && (
          <ul className="mb-4 flex flex-wrap justify-center gap-5">
            {links.map((link) => (
              <li key={link.id}>
                <a
                  href={link.url!}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="text-[11px] uppercase tracking-[0.2em]"
                  style={{ color: MUTED }}
                >
                  {link.title}
                </a>
              </li>
            ))}
          </ul>
        )}

        <Link href="/liderlar" className="text-[11px] uppercase tracking-[0.3em]" style={{ color: GOLD }}>
          Liderlar.uz
        </Link>
      </div>
    </footer>
  );
}
