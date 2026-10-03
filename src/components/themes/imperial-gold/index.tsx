import Image from "next/image";
import Link from "next/link";
import {
  isVerified,
  safeUrl,
  toTimeline,
  trustLabel,
  year,
} from "@/lib/themes/shape";
import type { ThemeProps } from "@/lib/themes/types";

/**
 * IMPERIAL GOLD — premium dizayn.
 *
 * Kayfiyat: nufuz, yetakchilik, institutsional hashamat.
 * Palitra: chuqur qora, iliq suyak rangi, o'lchovli metall tilla.
 *
 * NIMA QILINMAGANI ATAYLAB (§10, §68):
 *
 *   - ARZON GRADIENT YO'Q. Tilla rang bir xil tonda, "porlash"
 *     effekti yo'q — u qimmat emas, arzon ko'rsatadi.
 *   - KAZINO ESTETIKASI YO'Q. Tilla faqat INGICHKA chiziq va kichik
 *     urg'uda; katta tilla maydonlar yo'q.
 *   - ANIMATSIYA YO'Q. §68 ortiqcha animatsiyani taqiqlaydi va §52
 *     harakatni kamaytirish talabini qo'yadi.
 *
 * MA'LUMOT UMUMIY (§11): bu komponent hech qanday so'rov qilmaydi,
 * hammasini `profile` dan oladi.
 */

/* ========================================================================= *
 * PALITRA
 *
 *    Ranglar SHU FAYLDA, Tailwind konfiguratsiyasida emas: dizayn
 *    o'zgarsa yoki olib tashlansa, loyiha ranglari ifloslanmasligi
 *    kerak. Har dizayn o'z palitrasini o'zi tashiydi.
 * ========================================================================= */

const INK = "#0a0a0a";
const SURFACE = "#121212";
const IVORY = "#f4efe6";
const IVORY_SOFT = "#b8b0a4";
const GOLD = "#c9a227";
const GOLD_SOFT = "#6d5717";

export default function ImperialGoldTheme({ profile }: ThemeProps) {
  return (
    <div style={{ backgroundColor: INK, color: IVORY }} className="min-h-screen">
      <Hero profile={profile} />

      <div className="mx-auto max-w-5xl px-4 pb-20 sm:px-6">
        <Biography profile={profile} />
        <Timeline profile={profile} />
        <Achievements profile={profile} />
        <Certificates profile={profile} />
        <Gallery profile={profile} />
        <Quotes profile={profile} />
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
    <header className="border-b" style={{ borderColor: GOLD_SOFT }}>
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-12 sm:px-6 sm:py-16 md:grid-cols-[1fr_auto] md:items-end">
        <div className="min-w-0">
          {/* VIP nishoni — kichik va o'lchovli (§34: har sahifani reklamaga aylantirmaslik). */}
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.3em]"
            style={{ color: GOLD }}
          >
            Liderlar
          </p>

          {/*
            ISM — SAHIFANING ASOSIY ELEMENTI.
            `text-balance` uzun ismlarni chiroyli bo'ladi: aks holda
            oxirgi so'z yakka qatorga tushib, kompozitsiya buzilardi.
          */}
          <h1
            className="mt-3 font-display text-4xl font-bold leading-[1.05] text-balance sm:text-5xl md:text-6xl"
            style={{ color: IVORY }}
          >
            {profile.full_name}
          </h1>

          <span
            className="mt-5 block h-px w-24"
            style={{ backgroundColor: GOLD }}
            aria-hidden
          />

          <p className="mt-5 flex flex-wrap gap-x-4 gap-y-1 text-sm" style={{ color: IVORY_SOFT }}>
            {profile.category?.name && <span>{profile.category.name}</span>}
            {profile.region?.name && <span>{profile.region.name}</span>}
          </p>
        </div>

        {profile.avatar_url && (
          <div className="relative shrink-0">
            {/*
              Portret ingichka tilla ramkada. `aspect-[3/4]` — portret
              nisbati; kvadrat ramka yuzni kesib qo'yardi.
            */}
            <span
              className="relative block aspect-[3/4] w-40 overflow-hidden sm:w-48 md:w-56"
              style={{ border: `1px solid ${GOLD_SOFT}` }}
            >
              <Image
                src={profile.avatar_url}
                alt={profile.full_name}
                fill
                /*
                 * `sizes` ANIQ: busiz optimizator eng katta variantni
                 * tanlardi va 224px kenglikdagi portret uchun ortiqcha
                 * katta fayl yuklanardi (§7 egress).
                 */
                sizes="(max-width: 640px) 160px, (max-width: 768px) 192px, 224px"
                priority
                className="object-cover"
              />
            </span>
          </div>
        )}
      </div>
    </header>
  );
}

/* ========================================================================= *
 * BO'LIM SARLAVHASI
 * ========================================================================= */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="mb-5 text-[11px] font-semibold uppercase tracking-[0.28em]"
      style={{ color: GOLD }}
    >
      {children}
    </h2>
  );
}

function Block({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t pt-10" style={{ borderColor: "#262626" }}>
      <SectionTitle>{title}</SectionTitle>
      {children}
    </section>
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
    <div className="pt-10">
      {hasBio && (
        /*
         * KIRISH MATNI KATTA O'LCHAMDA.
         *
         * Editorial nashrlarda birinchi paragraf kattaroq bo'ladi —
         * u o'quvchini matnga tortadi.
         */
        <p
          className="max-w-3xl text-lg leading-relaxed sm:text-xl"
          style={{ color: IVORY }}
        >
          {profile.short_bio}
        </p>
      )}

      {sections.length > 0 && (
        <div className="mt-10 space-y-8">
          {sections.map((section) => (
            <article key={section.id} className="max-w-3xl">
              {section.title?.trim() && (
                <h3 className="font-display text-xl font-semibold" style={{ color: IVORY }}>
                  {section.title}
                </h3>
              )}
              <div
                className="mt-2 whitespace-pre-wrap text-[15px] leading-relaxed"
                style={{ color: IVORY_SOFT }}
              >
                {section.content}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

/* ========================================================================= *
 * VAQT CHIZIG'I — ta'lim va ish tajribasi
 * ========================================================================= */

function Timeline({ profile }: ThemeProps) {
  const education = toTimeline(profile.education ?? []);
  const work = toTimeline(profile.workExperience ?? []);

  if (education.length === 0 && work.length === 0) return null;

  return (
    <Block title="Yo'l">
      <div className="grid gap-10 md:grid-cols-2">
        {work.length > 0 && <TimelineColumn label="Faoliyat" items={work} />}
        {education.length > 0 && <TimelineColumn label="Ta'lim" items={education} />}
      </div>
    </Block>
  );
}

function TimelineColumn({
  label,
  items,
}: {
  label: string;
  items: ReturnType<typeof toTimeline>;
}) {
  return (
    <div>
      <h3 className="mb-4 font-display text-lg font-semibold" style={{ color: IVORY }}>
        {label}
      </h3>

      <ol className="space-y-5">
        {items.map((item) => (
          <li
            key={item.id}
            className="relative pl-5"
            /*
             * Chap tomonda ingichka tilla chiziq — vaqt o'qi.
             * Nuqta yoki belgi ishlatilmagan: ular shovqin qo'shadi
             * va bu dizaynning gapi tinchlikda.
             */
            style={{ borderLeft: `1px solid ${GOLD_SOFT}` }}
          >
            <p className="text-sm font-semibold" style={{ color: IVORY }}>
              {item.title}
            </p>
            {item.subtitle && (
              <p className="text-xs" style={{ color: IVORY_SOFT }}>
                {item.subtitle}
              </p>
            )}
            {(item.from || item.to) && (
              <p className="mt-0.5 text-xs tabular-nums" style={{ color: GOLD }}>
                {year(item.from)}
                {item.to ? ` — ${year(item.to)}` : item.from ? " — hozirgacha" : ""}
              </p>
            )}
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
      <ul className="grid gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="px-4 py-3"
            style={{ backgroundColor: SURFACE, border: `1px solid #262626` }}
          >
            {item.from && (
              <p className="text-xs tabular-nums" style={{ color: GOLD }}>
                {year(item.from)}
              </p>
            )}
            <p className="mt-0.5 text-sm font-semibold" style={{ color: IVORY }}>
              {item.title}
            </p>
            {item.subtitle && (
              <p className="mt-0.5 text-xs" style={{ color: IVORY_SOFT }}>
                {item.subtitle}
              </p>
            )}
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
      <ul className="space-y-3">
        {certificates.map((certificate) => (
          <li
            key={certificate.id}
            className="flex flex-wrap items-baseline justify-between gap-2 border-b pb-3"
            style={{ borderColor: "#262626" }}
          >
            <span className="min-w-0">
              <span className="block text-sm font-semibold" style={{ color: IVORY }}>
                {certificate.title}
              </span>
              {certificate.issuer && (
                <span className="block text-xs" style={{ color: IVORY_SOFT }}>
                  {certificate.issuer}
                </span>
              )}
            </span>

            {/*
              ISHONCH BELGISI — DIZAYNDAN QAT'I NAZAR KO'RSATILADI.

              §8: "Foydalanuvchi kiritgan" va "Tasdiqlangan" farqi
              o'quvchiga aytilishi SHART. Dizayn chiroyliligi uchun
              uni yashirish o'quvchini chalg'itardi.
            */}
            <span
              className="shrink-0 text-[11px] uppercase tracking-wider"
              style={{ color: isVerified(certificate.trust) ? GOLD : IVORY_SOFT }}
            >
              {trustLabel(certificate.trust)}
            </span>
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
    <Block title="Rasmlar">
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {media.map((item) => (
          <li key={item.url} className="relative aspect-[4/3] overflow-hidden">
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
    </Block>
  );
}

/* ========================================================================= *
 * IQTIBOSLAR
 * ========================================================================= */

function Quotes({ profile }: ThemeProps) {
  const quotes = profile.quotes ?? [];
  if (quotes.length === 0) return null;

  return (
    <Block title="So'zlar">
      <ul className="space-y-8">
        {quotes.map((quote) => (
          <li key={String(quote.id)} className="max-w-3xl">
            {/*
              Katta serif iqtibos — editorial nashrlarning asosiy
              usuli. Qo'shtirnoq belgisi qo'yilmagan: u matnni
              bezaydi, lekin o'lchamning o'zi yetarli.
            */}
            <blockquote
              className="font-display text-xl italic leading-snug sm:text-2xl"
              style={{ color: IVORY }}
            >
              {String(quote.text ?? "")}
            </blockquote>
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
  const links = profile.socialLinks ?? [];

  return (
    <footer className="border-t" style={{ borderColor: GOLD_SOFT }}>
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-8 sm:px-6">
        {links.length > 0 && (
          <ul className="flex flex-wrap gap-4">
            {links.map((link) => {
              const url = safeUrl(String(link.url ?? ""));
              if (!url) return null;
              return (
                <li key={String(link.id)}>
                  {/*
                    `noreferrer nofollow` — foydalanuvchi kiritgan
                    havola: SEO vazni berilmaydi va manba sahifa
                    uzatilmaydi.
                  */}
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="text-xs uppercase tracking-wider underline"
                    style={{ color: IVORY_SOFT }}
                  >
                    {String(link.title ?? "Havola")}
                  </a>
                </li>
              );
            })}
          </ul>
        )}

        <Link
          href="/liderlar"
          className="text-xs uppercase tracking-wider"
          style={{ color: GOLD }}
        >
          Liderlar.uz
        </Link>
      </div>
    </footer>
  );
}
