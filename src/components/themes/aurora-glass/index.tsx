import Image from "next/image";
import Link from "next/link";
import { isVerified, range, safeUrl, toTimeline, trustLabel, year } from "@/lib/themes/shape";
import { rankingDisplay } from "@/lib/themes/profile-compose";
import { formatDateUz } from "@/lib/utils";
import type { ThemeProps } from "@/lib/themes/types";

/**
 * AURORA GLASS — kelajak yetakchiligi, texnologiya.
 *
 * Kayfiyat: qatlamli shisha panellar, o'lchovli moviy va binafsha
 * yorug'lik.
 *
 * NIMA QILINMAGANI ATAYLAB (§10 "NO gaming/crypto aesthetic"):
 *
 *   - NEON YO'Q. Yorug'lik past to'yinganlikda va faqat chegara
 *     hamda kichik urg'uda. Yorqin neon kripto paneliga o'xshatardi.
 *   - "GLOW" SOYALARI YO'Q. Shisha hissi SHAFFOFLIK va blur bilan
 *     beriladi, porlash bilan emas.
 *   - ANIMATSIYA YO'Q (§68, §52).
 *
 * MAVJUD DIZAYNLARDAN FARQI: panellar bir-birining USTIDA turadi va
 * fon ko'rinib qoladi — qolgan hamma dizaynda bo'limlar yoki tekis
 * fonda, yoki kartochka ichida.
 */

const SPACE = "#0a1428";
const SPACE_SOFT = "#101d38";
const FROST = "#e6edf7";
const FROST_SOFT = "#93a4c0";
const CYAN = "#4fd1e0";
const VIOLET = "#8b7fd8";

/** Shisha panel uslubi — bir joyda ta'riflanadi, hamma panel bir xil. */
const GLASS: React.CSSProperties = {
  backgroundColor: "rgba(230, 237, 247, 0.05)",
  border: "1px solid rgba(230, 237, 247, 0.12)",
  backdropFilter: "blur(12px)",
};

export default function AuroraGlassTheme({ profile }: ThemeProps) {
  return (
    <div style={{ backgroundColor: SPACE, color: FROST }} className="relative min-h-screen">
      {/*
        FON YORUG'LIGI — BIR MARTA, SAHIFA ORQASIDA.

        Har panelga alohida gradient qo'yilsa, ular bir-biriga
        qo'shilib, fon loyqa bo'lib ketardi. Bitta katta, juda past
        to'yinganlikdagi yorug'lik esa chuqurlik beradi.
      */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background: `radial-gradient(60% 40% at 20% 0%, ${CYAN}1a, transparent 70%), radial-gradient(50% 35% at 85% 15%, ${VIOLET}1a, transparent 70%)`,
        }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <Hero profile={profile} />
        <Ranking profile={profile} />
        <Panel title="Haqida">
          <Biography profile={profile} />
        </Panel>
        <Path profile={profile} />
        <Achievements profile={profile} />
        <Certificates profile={profile} />
        <Articles profile={profile} />
        <Gallery profile={profile} />
        <Footer profile={profile} />
      </div>
    </div>
  );
}

/* ========================================================================= *
 * HERO
 * ========================================================================= */

function Hero({ profile }: ThemeProps) {
  return (
    <header className="rounded-2xl p-6 sm:p-10" style={GLASS}>
      <div className="grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
        {profile.avatar_url && (
          <span
            className="relative block h-28 w-28 shrink-0 overflow-hidden rounded-2xl sm:h-36 sm:w-36"
            style={{ border: `1px solid ${CYAN}55` }}
          >
            <Image
              src={profile.avatar_url}
              alt={profile.full_name}
              fill
              sizes="(max-width: 640px) 112px, 144px"
              priority
              className="object-cover"
            />
          </span>
        )}

        <div className="min-w-0">
          <h1 className="font-display text-3xl font-bold leading-tight text-balance sm:text-4xl">
            {profile.full_name}
          </h1>
          <p className="mt-3 flex flex-wrap gap-x-4 text-xs uppercase tracking-[0.25em]" style={{ color: CYAN }}>
            {profile.category?.name && <span>{profile.category.name}</span>}
            {profile.region?.name && <span style={{ color: FROST_SOFT }}>{profile.region.name}</span>}
          </p>

          {profile.short_bio?.trim() && (
            <p className="mt-4 leading-relaxed" style={{ color: FROST_SOFT }}>
              {profile.short_bio}
            </p>
          )}
        </div>
      </div>
    </header>
  );
}

/* ========================================================================= *
 * PANEL
 * ========================================================================= */

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-5 rounded-2xl p-6 sm:p-8" style={GLASS}>
      <h2 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.25em]" style={{ color: VIOLET }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

/* ========================================================================= *
 * UMUMIY REYTING
 *
 *    Shisha panel uslubida. SHARTSIZ ko'rsatiladi: 0,0 ham haqiqiy
 *    ball va uni yashirish nomzodga "reyting yo'q" degan yolg'on
 *    taassurot berardi.
 * ========================================================================= */

function Ranking({ profile }: ThemeProps) {
  const ranking = rankingDisplay(
    profile.position,
    profile.total_score,
    profile.ranking.hasRow,
  );

  return (
    <Panel title={ranking.label}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <p className="flex items-end gap-2">
          <span
            className="font-display text-5xl font-bold tabular-nums leading-none"
            style={{ color: CYAN }}
          >
            {ranking.score}
          </span>
          <span className="pb-1 text-sm" style={{ color: FROST_SOFT }}>
            {ranking.scoreUnit}
          </span>
        </p>
        <p className="text-[11px] uppercase tracking-[0.25em]" style={{ color: FROST_SOFT }}>
          {ranking.rank ? (
            <>
              <span className="text-base tracking-normal" style={{ color: FROST }}>
                {ranking.rank}
              </span>{" "}
              {ranking.rankLabel}
            </>
          ) : (
            ranking.rankNote
          )}
        </p>
      </div>
    </Panel>
  );
}

/* ========================================================================= *
 * MAQOLALARI — a'zoning Liderlar Online'dagi o'z maqolalari
 *
 *    Avtomatik ko'rinadi; muallif kabinetda har birini yashira oladi.
 *    Maqola bo'lmasa bo'lim umuman chizilmaydi.
 * ========================================================================= */

function Articles({ profile }: ThemeProps) {
  const articles = profile.memberArticles ?? [];
  if (articles.length === 0) return null;

  return (
    <Panel title="Maqolalari">
      <ul className="grid gap-3 sm:grid-cols-2">
        {articles.map((m) => (
          <li key={m.id}>
            <Link
              href={m.href}
              className="group flex h-full gap-3 rounded-xl p-3 transition"
              style={{ backgroundColor: `${SPACE_SOFT}cc`, border: `1px solid ${FROST}14` }}
            >
              {m.heroUrl && (
                <span className="relative block h-16 w-20 shrink-0 overflow-hidden rounded-lg">
                  <Image src={m.heroUrl} alt="" fill sizes="80px" loading="lazy" className="object-cover" />
                </span>
              )}
              <span className="min-w-0">
                <span className="block font-semibold leading-snug group-hover:underline" style={{ color: FROST }}>{m.title}</span>
                <span className="mt-1 block text-[11px]" style={{ color: CYAN }}>
                  {m.publishedAt ? `Liderlar Online · ${formatDateUz(m.publishedAt)}` : "Liderlar Online"}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function Biography({ profile }: ThemeProps) {
  const sections = profile.sections ?? [];
  if (sections.length === 0) return <p style={{ color: FROST_SOFT }}>—</p>;

  return (
    <div className="space-y-5">
      {sections.map((section) => (
        <div key={section.id}>
          {section.title?.trim() && (
            <h3 className="mb-1 text-sm font-semibold">{section.title}</h3>
          )}
          <div className="whitespace-pre-wrap text-[15px] leading-[1.75]" style={{ color: FROST_SOFT }}>
            {section.content}
          </div>
        </div>
      ))}
    </div>
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
    <Panel title="Yo'l">
      <ol className="space-y-4">
        {items.map((item) => (
          <li
            key={item.id}
            className="rounded-xl px-4 py-3"
            style={{ backgroundColor: SPACE_SOFT }}
          >
            <p className="text-xs tabular-nums" style={{ color: CYAN }}>
              {range(item.from, item.to)}
            </p>
            <p className="mt-0.5 font-semibold">{item.title}</p>
            {item.subtitle && (
              <p className="text-sm" style={{ color: FROST_SOFT }}>
                {item.subtitle}
              </p>
            )}
          </li>
        ))}
      </ol>
    </Panel>
  );
}

/* ========================================================================= *
 * YUTUQLAR
 * ========================================================================= */

function Achievements({ profile }: ThemeProps) {
  const items = toTimeline(profile.achievements ?? []);
  if (items.length === 0) return null;

  return (
    <Panel title="Yutuqlar">
      <ul className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item.id} className="rounded-xl px-4 py-3" style={{ backgroundColor: SPACE_SOFT }}>
            {item.from && (
              <p className="text-xs tabular-nums" style={{ color: VIOLET }}>
                {year(item.from)}
              </p>
            )}
            <p className="mt-0.5 font-semibold leading-snug">{item.title}</p>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

/* ========================================================================= *
 * SERTIFIKATLAR
 * ========================================================================= */

function Certificates({ profile }: ThemeProps) {
  const certificates = profile.certificates ?? [];
  if (certificates.length === 0) return null;

  return (
    <Panel title="Sertifikatlar">
      <ul className="space-y-3">
        {certificates.map((certificate) => (
          <li key={certificate.id} className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="min-w-0">
              <span className="block font-semibold">{certificate.title}</span>
              {certificate.issuer && (
                <span className="block text-xs" style={{ color: FROST_SOFT }}>
                  {certificate.issuer}
                </span>
              )}
            </span>
            <span
              className="shrink-0 rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-wider"
              style={{
                color: isVerified(certificate.trust) ? SPACE : FROST_SOFT,
                backgroundColor: isVerified(certificate.trust) ? CYAN : "transparent",
                border: isVerified(certificate.trust) ? "none" : `1px solid ${FROST_SOFT}44`,
              }}
            >
              {trustLabel(certificate.trust)}
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

/* ========================================================================= *
 * RASMLAR
 * ========================================================================= */

function Gallery({ profile }: ThemeProps) {
  const media = profile.media ?? [];
  if (media.length === 0) return null;

  return (
    <Panel title="Rasmlar">
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {media.map((item) => (
          <li key={item.url} className="relative aspect-square overflow-hidden rounded-xl">
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
    </Panel>
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
    <footer className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl px-6 py-5" style={GLASS}>
      {links.length > 0 && (
        <ul className="flex flex-wrap gap-5">
          {links.map((link) => (
            <li key={link.id}>
              <a
                href={link.url!}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="text-[11px] uppercase tracking-[0.2em]"
                style={{ color: FROST_SOFT }}
              >
                {link.title}
              </a>
            </li>
          ))}
        </ul>
      )}

      <Link href="/liderlar" className="text-[11px] uppercase tracking-[0.2em]" style={{ color: CYAN }}>
        Liderlar.uz
      </Link>
    </footer>
  );
}
