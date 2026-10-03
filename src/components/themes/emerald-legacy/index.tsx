import Image from "next/image";
import Link from "next/link";
import { isVerified, range, safeUrl, toTimeline, trustLabel, year } from "@/lib/themes/shape";
import type { ThemeProps } from "@/lib/themes/types";

/**
 * EMERALD LEGACY — meros, bilim, intellektual nufuz.
 *
 * Kayfiyat: kitobdek editorial oqim, iqtibos bloklari, ramkali
 * portret va katta kirish matni.
 *
 * MAVJUD DIZAYNLARDAN FARQI (§9):
 *
 *   - OQIM KITOB SAHIFASI KABI: bitta tor ustun, bo'limlar orasida
 *     bezakli ajratgich. Ivory Editorial jurnal (ikki ustun,
 *     muqova); bu esa KITOB — ketma-ket o'qiladigan matn.
 *   - Portret ikki qavatli RAMKADA — eski nashrlardagi gravyura
 *     ramkasiga ishora.
 *   - Yutuqlar kartochka ham, jadval ham emas: matn oqimiga
 *     singdirilgan ro'yxat.
 *
 * Olimlar va ustozlar uchun.
 */

const EMERALD = "#0f3d2e";
const EMERALD_DEEP = "#0a2a20";
const CREAM = "#f6f1e4";
const CREAM_SOFT = "#e5dcc6";
const BRASS = "#9c7f3f";
const TEXT_SOFT = "#4a5c52";

export default function EmeraldLegacyTheme({ profile }: ThemeProps) {
  return (
    <div style={{ backgroundColor: CREAM, color: EMERALD_DEEP }} className="min-h-screen">
      <Hero profile={profile} />

      <div className="mx-auto max-w-2xl px-4 pb-24 sm:px-6">
        <Lead profile={profile} />
        <Chapters profile={profile} />
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
 * HERO
 * ========================================================================= */

function Hero({ profile }: ThemeProps) {
  return (
    <header style={{ backgroundColor: EMERALD, color: CREAM }}>
      <div className="mx-auto max-w-2xl px-4 py-14 text-center sm:px-6 sm:py-20">
        {profile.avatar_url && (
          /*
            IKKI QAVATLI RAMKA.

            Eski nashrlardagi gravyura ramkasiga ishora: tashqi
            ingichka chiziq va ichki guruch chiziq orasida bo'sh joy.
            Bitta ramka oddiy chegara bo'lib qolardi.
          */
          <span
            className="mx-auto mb-8 block w-40 p-1.5 sm:w-48"
            style={{ border: `1px solid ${BRASS}66` }}
          >
            <span
              className="relative block aspect-[4/5] overflow-hidden"
              style={{ border: `1px solid ${BRASS}` }}
            >
              <Image
                src={profile.avatar_url}
                alt={profile.full_name}
                fill
                sizes="(max-width: 640px) 160px, 192px"
                priority
                className="object-cover"
              />
            </span>
          </span>
        )}

        <h1 className="font-display text-3xl font-bold leading-tight text-balance sm:text-4xl">
          {profile.full_name}
        </h1>

        <p className="mt-4 text-[11px] uppercase tracking-[0.3em]" style={{ color: BRASS }}>
          {profile.category?.name ?? "Liderlar"}
        </p>
      </div>
    </header>
  );
}

/* ========================================================================= *
 * KIRISH
 * ========================================================================= */

function Lead({ profile }: ThemeProps) {
  if (!profile.short_bio?.trim()) return null;

  return (
    <p className="pt-14 font-display text-xl leading-[1.6] text-balance sm:text-2xl">
      {profile.short_bio}
    </p>
  );
}

/* ========================================================================= *
 * AJRATGICH
 * ========================================================================= */

function Divider() {
  /*
   * BEZAKLI AJRATGICH — kitob boblari orasidagi belgi.
   *
   * Oddiy chiziq o'rniga markazda romb: u bo'limni "tugadi" deb
   * belgilaydi va o'quvchiga nafas beradi.
   */
  return (
    <span className="my-10 flex items-center justify-center gap-3" aria-hidden>
      <span className="h-px w-16" style={{ backgroundColor: CREAM_SOFT }} />
      <span className="h-1.5 w-1.5 rotate-45" style={{ backgroundColor: BRASS }} />
      <span className="h-px w-16" style={{ backgroundColor: CREAM_SOFT }} />
    </span>
  );
}

function Chapters({ profile }: ThemeProps) {
  const sections = profile.sections ?? [];
  if (sections.length === 0) return null;

  return (
    <>
      {sections.map((section) => (
        <section key={section.id}>
          <Divider />
          {section.title?.trim() && (
            <h2 className="mb-3 text-center font-display text-lg font-semibold">
              {section.title}
            </h2>
          )}
          <div
            className="whitespace-pre-wrap text-[1.05rem] leading-[1.85]"
            style={{ color: TEXT_SOFT }}
          >
            {section.content}
          </div>
        </section>
      ))}
    </>
  );
}

/* ========================================================================= *
 * IQTIBOSLAR
 * ========================================================================= */

function Quotes({ profile }: ThemeProps) {
  const quotes = profile.quotes ?? [];
  if (quotes.length === 0) return null;

  return (
    <>
      {quotes.map((quote) => (
        <blockquote
          key={String(quote.id)}
          className="my-10 px-6 py-5 text-center"
          style={{ backgroundColor: EMERALD, color: CREAM }}
        >
          <p className="font-display text-xl italic leading-snug text-balance">
            {String(quote.text ?? "")}
          </p>
        </blockquote>
      ))}
    </>
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
      <Divider />
      <h2 className="mb-5 text-center font-display text-lg font-semibold">Hayot yo&apos;li</h2>

      <ol className="space-y-5">
        {items.map((item) => (
          <li key={item.id}>
            <p className="font-semibold">{item.title}</p>
            {item.subtitle && (
              <p className="text-sm" style={{ color: TEXT_SOFT }}>
                {item.subtitle}
              </p>
            )}
            <p className="mt-0.5 text-xs tabular-nums" style={{ color: BRASS }}>
              {range(item.from, item.to)}
            </p>
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
      <Divider />
      <h2 className="mb-5 text-center font-display text-lg font-semibold">Yutuqlar</h2>

      {/*
        MATN OQIMIGA SINGDIRILGAN RO'YXAT.

        Kartochka yoki jadval kitob sahifasining ritmini buzardi.
      */}
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.id} className="flex gap-3">
            <span className="shrink-0 text-xs tabular-nums" style={{ color: BRASS }}>
              {year(item.from) || "—"}
            </span>
            <span className="min-w-0">
              <span className="block font-medium">{item.title}</span>
              {item.subtitle && (
                <span className="block text-sm" style={{ color: TEXT_SOFT }}>
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
 * SERTIFIKATLAR
 * ========================================================================= */

function Certificates({ profile }: ThemeProps) {
  const certificates = profile.certificates ?? [];
  if (certificates.length === 0) return null;

  return (
    <section>
      <Divider />
      <h2 className="mb-5 text-center font-display text-lg font-semibold">Sertifikatlar</h2>

      <ul className="space-y-3">
        {certificates.map((certificate) => (
          <li key={certificate.id}>
            <p className="font-medium">{certificate.title}</p>
            {certificate.issuer && (
              <p className="text-sm" style={{ color: TEXT_SOFT }}>
                {certificate.issuer}
              </p>
            )}
            <p
              className="mt-0.5 text-[10px] uppercase tracking-[0.2em]"
              style={{ color: isVerified(certificate.trust) ? BRASS : TEXT_SOFT }}
            >
              {trustLabel(certificate.trust)}
            </p>
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
      <Divider />
      <ul className="space-y-6">
        {media.map((item) => (
          <li key={item.url}>
            {/*
              RASM RAMKADA VA IZOH OSTIDA — kitob illyustratsiyasi
              kabi. Panjara bu dizaynning oqimiga to'g'ri kelmaydi.
            */}
            <span
              className="relative block aspect-[3/2] overflow-hidden p-1"
              style={{ border: `1px solid ${CREAM_SOFT}` }}
            >
              <Image
                src={item.url}
                alt={item.caption ?? `${profile.full_name} — galereya rasmi`}
                fill
                sizes="(max-width: 768px) 100vw, 672px"
                loading="lazy"
                className="object-cover"
              />
            </span>
            {item.caption && (
              <span className="mt-1.5 block text-center text-xs italic" style={{ color: TEXT_SOFT }}>
                {item.caption}
              </span>
            )}
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
    <footer style={{ backgroundColor: EMERALD, color: CREAM }}>
      <div className="mx-auto max-w-2xl px-4 py-10 text-center sm:px-6">
        {links.length > 0 && (
          <ul className="mb-4 flex flex-wrap justify-center gap-5">
            {links.map((link) => (
              <li key={link.id}>
                <a
                  href={link.url!}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="text-[11px] uppercase tracking-[0.2em]"
                  style={{ color: CREAM_SOFT }}
                >
                  {link.title}
                </a>
              </li>
            ))}
          </ul>
        )}

        <Link href="/liderlar" className="text-[11px] uppercase tracking-[0.3em]" style={{ color: BRASS }}>
          Liderlar.uz
        </Link>
      </div>
    </footer>
  );
}
