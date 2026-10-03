import Image from "next/image";
import Link from "next/link";
import { isVerified, range, safeUrl, toTimeline, trustLabel, year } from "@/lib/themes/shape";
import type { ThemeProps } from "@/lib/themes/types";

/**
 * SILVER EXECUTIVE — zamonaviy korporativ premium.
 *
 * Kayfiyat: tuzilgan rahbar kartochkasi, toza panjara, ingichka
 * metall chiziqlar, ma'lumotga yo'naltirilgan yutuqlar.
 *
 * MAVJUD DIZAYNLARDAN FARQI (§9):
 *
 *   - IVORY EDITORIAL ham yorug', lekin u JURNAL varag'i: ustunlar,
 *     yirik bosh harf, iqtiboslar. Bu yerda esa HISOBOT estetikasi:
 *     panjara, yorliq-qiymat juftliklari, hech qanday kursiv.
 *   - Portret KVADRAT va kartochka ichida — jurnal portreti emas,
 *     hujjat rasmi kabi.
 *   - Yutuqlar ro'yxat emas, JADVAL ko'rinishida: yil, nom, izoh
 *     ustunlari tekis turadi.
 *
 * Biznes va boshqaruv uchun.
 */

const SLATE = "#f1f3f5";
const CARD = "#ffffff";
const GRAPHITE = "#1b1f24";
const STEEL = "#5c6670";
const SILVER = "#c3cad1";
const ACCENT = "#2f6f8f";

export default function SilverExecutiveTheme({ profile }: ThemeProps) {
  return (
    <div style={{ backgroundColor: SLATE, color: GRAPHITE }} className="min-h-screen">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <ExecutiveCard profile={profile} />
        <Summary profile={profile} />
        <Experience profile={profile} />
        <Achievements profile={profile} />
        <Certificates profile={profile} />
        <Gallery profile={profile} />
        <Footer profile={profile} />
      </div>
    </div>
  );
}

/* ========================================================================= *
 * RAHBAR KARTOCHKASI
 * ========================================================================= */

function ExecutiveCard({ profile }: ThemeProps) {
  /*
   * ASOSIY MA'LUMOTLAR YORLIQ-QIYMAT JUFTLIGIDA.
   *
   * Bo'sh qiymatlar ro'yxatdan chiqariladi: "Hudud: —" degan qator
   * hech qanday ma'lumot bermaydi va panjarani buzadi.
   */
  const facts = [
    { label: "Yo'nalish", value: profile.category?.name ?? null },
    { label: "Hudud", value: profile.region?.name ?? null },
    { label: "Tillar", value: (profile.languages ?? []).join(", ") || null },
  ].filter((fact) => fact.value);

  return (
    <header
      className="grid gap-6 p-6 sm:grid-cols-[auto_1fr] sm:p-8"
      style={{ backgroundColor: CARD, border: `1px solid ${SILVER}` }}
    >
      {profile.avatar_url && (
        <span className="relative block h-32 w-32 shrink-0 overflow-hidden sm:h-40 sm:w-40">
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

        <span className="mt-3 block h-px w-full" style={{ backgroundColor: SILVER }} aria-hidden />

        {facts.length > 0 && (
          <dl className="mt-4 grid gap-x-8 gap-y-2 sm:grid-cols-2">
            {facts.map((fact) => (
              <div key={fact.label} className="flex gap-2 text-sm">
                <dt className="shrink-0" style={{ color: STEEL }}>
                  {fact.label}:
                </dt>
                <dd className="min-w-0 font-medium">{fact.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </header>
  );
}

/* ========================================================================= *
 * BO'LIM
 * ========================================================================= */

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8 p-6 sm:p-8" style={{ backgroundColor: CARD, border: `1px solid ${SILVER}` }}>
      <h2 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: ACCENT }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Summary({ profile }: ThemeProps) {
  const hasBio = Boolean(profile.short_bio?.trim());
  const sections = profile.sections ?? [];
  if (!hasBio && sections.length === 0) return null;

  return (
    <Block title="Qisqa ma'lumot">
      {hasBio && <p className="text-[15px] leading-[1.75]">{profile.short_bio}</p>}

      {sections.map((section) => (
        <div key={section.id} className={hasBio ? "mt-5" : ""}>
          {section.title?.trim() && (
            <h3 className="mb-1 text-sm font-semibold">{section.title}</h3>
          )}
          <div className="whitespace-pre-wrap text-[15px] leading-[1.75]" style={{ color: STEEL }}>
            {section.content}
          </div>
        </div>
      ))}
    </Block>
  );
}

/* ========================================================================= *
 * TAJRIBA — PANJARA
 * ========================================================================= */

function Experience({ profile }: ThemeProps) {
  const work = toTimeline(profile.workExperience ?? []);
  const education = toTimeline(profile.education ?? []);
  if (work.length === 0 && education.length === 0) return null;

  return (
    <Block title="Tajriba va ta'lim">
      <div className="grid gap-8 sm:grid-cols-2">
        {work.length > 0 && <Rows label="Faoliyat" items={work} />}
        {education.length > 0 && <Rows label="Ta'lim" items={education} />}
      </div>
    </Block>
  );
}

function Rows({ label, items }: { label: string; items: ReturnType<typeof toTimeline> }) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold">{label}</h3>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.id} className="border-l-2 pl-3" style={{ borderColor: SILVER }}>
            <p className="text-sm font-semibold">{item.title}</p>
            {item.subtitle && (
              <p className="text-xs" style={{ color: STEEL }}>
                {item.subtitle}
              </p>
            )}
            <p className="mt-0.5 text-xs tabular-nums" style={{ color: ACCENT }}>
              {range(item.from, item.to)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ========================================================================= *
 * YUTUQLAR — JADVAL
 * ========================================================================= */

function Achievements({ profile }: ThemeProps) {
  const items = toTimeline(profile.achievements ?? []);
  if (items.length === 0) return null;

  return (
    <Block title="Yutuqlar">
      {/*
        JADVAL KO'RINISHI.

        Boshqa dizaynlarda yutuqlar kartochka yoki ro'yxat; bu yerda
        ustunlar tekis turadi va yillar bir chiziqda — hisobot
        estetikasining asosi.
      */}
      <ul className="divide-y" style={{ borderColor: SILVER }}>
        {items.map((item) => (
          <li key={item.id} className="grid gap-1 py-3 first:pt-0 last:pb-0 sm:grid-cols-[4.5rem_1fr]">
            <span className="text-sm tabular-nums" style={{ color: ACCENT }}>
              {year(item.from)}
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold">{item.title}</span>
              {item.subtitle && (
                <span className="block text-xs" style={{ color: STEEL }}>
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
      <ul className="divide-y" style={{ borderColor: SILVER }}>
        {certificates.map((certificate) => (
          <li
            key={certificate.id}
            className="flex flex-wrap items-baseline justify-between gap-2 py-3 first:pt-0 last:pb-0"
          >
            <span className="min-w-0">
              <span className="block text-sm font-semibold">{certificate.title}</span>
              {certificate.issuer && (
                <span className="block text-xs" style={{ color: STEEL }}>
                  {certificate.issuer}
                </span>
              )}
            </span>
            <span
              className="shrink-0 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
              style={{
                color: isVerified(certificate.trust) ? CARD : STEEL,
                backgroundColor: isVerified(certificate.trust) ? ACCENT : SLATE,
              }}
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
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {media.map((item) => (
          <li
            key={item.url}
            className="relative aspect-square overflow-hidden"
            style={{ backgroundColor: SLATE, border: `1px solid ${SILVER}` }}
          >
            <Image
              src={item.url}
              alt={item.caption ?? `${profile.full_name} — galereya rasmi`}
              fill
              sizes="(max-width: 640px) 50vw, 25vw"
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
    <footer className="mt-8 flex flex-wrap items-center justify-between gap-4 pt-2">
      {links.length > 0 && (
        <ul className="flex flex-wrap gap-4">
          {links.map((link) => (
            <li key={link.id}>
              <a
                href={link.url!}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="text-xs underline"
                style={{ color: STEEL }}
              >
                {link.title}
              </a>
            </li>
          ))}
        </ul>
      )}

      <Link href="/liderlar" className="text-xs font-semibold" style={{ color: ACCENT }}>
        Liderlar.uz
      </Link>
    </footer>
  );
}
