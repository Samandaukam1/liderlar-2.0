import Image from "next/image";
import Link from "next/link";
import {
  isVerified,
  range,
  safeUrl,
  toTimeline,
  trustLabel,
  year,
} from "@/lib/themes/shape";
import { rankingDisplay } from "@/lib/themes/profile-compose";
import { formatDateUz } from "@/lib/utils";
import type { ThemeProps } from "@/lib/themes/types";

/**
 * OBSIDIAN — minimal qorong'u hashamat.
 *
 * Kayfiyat: kinematografik portret, keng bo'sh joy, dramatik
 * tipografiya.
 *
 * IMPERIAL GOLD'DAN NIMASI BILAN FARQ QILADI (§9 "radically
 * different" talabi):
 *
 *   - KOMPOZITSIYA: u yerda portret yonda, bu yerda TO'LIQ EKRAN
 *     portret va ism uning ustida.
 *   - RANG: tilla urg'u YO'Q. Faqat qora, ko'mir va platina — ya'ni
 *     e'tibor rangda emas, o'lchamda.
 *   - TIPOGRAFIYA: Imperial Gold'da serif sarlavha va o'lchovli
 *     o'lcham; bu yerda sans-serif va O'LCHAMDAN KATTA matn.
 *   - BO'LIMLAR: u yerda kartochka va panjara; bu yerda ketma-ket
 *     katta raqamlar va ingichka ajratgichlar.
 *
 * ANIMATSIYA YO'Q (§68, §52).
 */

const VOID = "#07070a";
const COAL = "#141418";
const PLATINUM = "#e8e8ea";
const MUTED = "#8a8a94";
const LINE = "#232329";

export default function ObsidianTheme({ profile }: ThemeProps) {
  return (
    <div style={{ backgroundColor: VOID, color: PLATINUM }} className="min-h-screen">
      <Hero profile={profile} />

      <div className="mx-auto max-w-3xl px-4 pb-24 sm:px-6">
        <Intro profile={profile} />
        <Ranking profile={profile} />
        <Numbers profile={profile} />
        <Sections profile={profile} />
        <Path profile={profile} />
        <Achievements profile={profile} />
        <Certificates profile={profile} />
        <Articles profile={profile} />
        <Gallery profile={profile} />
      </div>

      <Footer profile={profile} />
    </div>
  );
}

/* ========================================================================= *
 * HERO — to'liq ekran portret
 * ========================================================================= */

function Hero({ profile }: ThemeProps) {
  if (!profile.avatar_url) {
    /*
     * RASMSIZ ZAXIRA.
     *
     * Bu dizaynning asosi portret. Rasm bo'lmasa, to'liq ekran
     * bo'sh qora maydon chiqardi — shuning uchun oddiy sarlavha
     * ko'rsatiladi.
     */
    return (
      <header className="mx-auto max-w-3xl px-4 pt-24 pb-12 sm:px-6">
        <h1 className="font-display text-5xl font-bold leading-[0.95] text-balance sm:text-7xl">
          {profile.full_name}
        </h1>
        <p className="mt-4 text-sm uppercase tracking-[0.3em]" style={{ color: MUTED }}>
          {profile.category?.name ?? "Liderlar"}
        </p>
      </header>
    );
  }

  return (
    <header className="relative">
      {/*
        BALANDLIK EKRANGA NISBATAN, lekin to'liq 100vh EMAS.
        To'liq ekran bo'lsa, foydalanuvchi pastda mazmun borligini
        ko'rmaydi va sahifani yopib ketishi mumkin.
      */}
      <div className="relative h-[72vh] min-h-[420px] w-full overflow-hidden">
        <Image
          src={profile.avatar_url}
          alt={profile.full_name}
          fill
          sizes="100vw"
          priority
          className="object-cover object-top"
        />

        {/*
          GRADIENT — BEZAK EMAS, O'QILISHI UCHUN.

          Portret ustidagi oq matn yorug' rasmda ko'rinmasdi.
          Gradient pastdan yuqoriga va faqat matn turgan joyda
          quyuqlashadi.
        */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to top, ${VOID} 0%, ${VOID}cc 25%, transparent 65%)`,
          }}
          aria-hidden
        />

        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-3xl px-4 pb-10 sm:px-6">
          <h1 className="font-display text-5xl font-bold leading-[0.95] text-balance sm:text-7xl">
            {profile.full_name}
          </h1>

          <p className="mt-4 flex flex-wrap gap-x-5 text-xs uppercase tracking-[0.3em]" style={{ color: MUTED }}>
            {profile.category?.name && <span>{profile.category.name}</span>}
            {profile.region?.name && <span>{profile.region.name}</span>}
          </p>
        </div>
      </div>
    </header>
  );
}

/* ========================================================================= *
 * KIRISH
 * ========================================================================= */

function Intro({ profile }: ThemeProps) {
  if (!profile.short_bio?.trim()) return null;

  return (
    <p className="pt-16 text-2xl font-light leading-[1.45] text-balance sm:text-3xl">
      {profile.short_bio}
    </p>
  );
}

/* ========================================================================= *
 * KATTA RAQAMLAR
 * ========================================================================= */

function Numbers({ profile }: ThemeProps) {
  /*
   * FAQAT HAQIQIY SONLAR (§71).
   *
   * Nol bo'lgan ko'rsatkich KO'RSATILMAYDI: "0 yutuq" degan yozuv
   * odamni kamsitadi va hech qanday ma'lumot bermaydi.
   */
  const stats = [
    { value: (profile.achievements ?? []).length, label: "Yutuq" },
    { value: (profile.workExperience ?? []).length, label: "Faoliyat" },
    { value: (profile.certificates ?? []).length, label: "Sertifikat" },
  ].filter((stat) => stat.value > 0);

  if (stats.length === 0) return null;

  return (
    <dl className="mt-16 grid gap-8 border-t pt-10 sm:grid-cols-3" style={{ borderColor: LINE }}>
      {stats.map((stat) => (
        <div key={stat.label}>
          <dd className="font-display text-5xl font-bold tabular-nums sm:text-6xl">
            {stat.value}
          </dd>
          <dt className="mt-1 text-[11px] uppercase tracking-[0.25em]" style={{ color: MUTED }}>
            {stat.label}
          </dt>
        </div>
      ))}
    </dl>
  );
}

/* ========================================================================= *
 * UMUMIY REYTING
 *
 *    `Numbers` dan ALOHIDA va SHARTSIZ: u yerda nol ko'rsatkich
 *    yashiriladi ("0 yutuq" odamni kamsitadi), reyting balli esa
 *    har doim ko'rsatiladi. 0,0 — "reyting yo'q" degani emas,
 *    "hisobda turadi, ball hali yig'ilmagan" degani; yashirilsa,
 *    nomzod sahifasida reyting borligini bilmasdi.
 * ========================================================================= */

function Ranking({ profile }: ThemeProps) {
  const ranking = rankingDisplay(
    profile.position,
    profile.total_score,
    profile.ranking.hasRow,
  );

  return (
    <section className="mt-16 border-t pt-10" style={{ borderColor: LINE }}>
      <h2 className="mb-5 text-[11px] uppercase tracking-[0.3em]" style={{ color: MUTED }}>
        {ranking.label}
      </h2>
      <p className="flex items-end gap-2">
        <span className="font-display text-6xl font-bold tabular-nums leading-none sm:text-7xl">
          {ranking.score}
        </span>
        <span className="pb-1.5 text-sm tracking-wide" style={{ color: MUTED }}>
          {ranking.scoreUnit}
        </span>
      </p>
      <p className="mt-3 text-[11px] uppercase tracking-[0.25em]" style={{ color: MUTED }}>
        {ranking.rank ? (
          <>
            <span style={{ color: PLATINUM }}>{ranking.rank}</span> · {ranking.rankLabel}
          </>
        ) : (
          ranking.rankNote
        )}
      </p>
    </section>
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
    <Block title="Maqolalari">
      <ul className="divide-y" style={{ borderColor: LINE }}>
        {articles.map((m) => (
          <li key={m.id} style={{ borderColor: LINE }}>
            <Link href={m.href} className="group flex items-center gap-4 py-4">
              {m.heroUrl && (
                <span className="relative block h-14 w-24 shrink-0 overflow-hidden">
                  <Image src={m.heroUrl} alt="" fill sizes="96px" loading="lazy" className="object-cover opacity-80 transition group-hover:opacity-100" />
                </span>
              )}
              <span className="min-w-0">
                <span className="block text-lg font-semibold leading-snug group-hover:underline">{m.title}</span>
                <span className="mt-1 block text-[11px] uppercase tracking-[0.25em]" style={{ color: MUTED }}>
                  {m.publishedAt ? `Liderlar Online · ${formatDateUz(m.publishedAt)}` : "Liderlar Online"}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Block>
  );
}

/* ========================================================================= *
 * BO'LIM SARLAVHASI
 * ========================================================================= */

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-16 border-t pt-10" style={{ borderColor: LINE }}>
      <h2 className="mb-7 text-[11px] uppercase tracking-[0.3em]" style={{ color: MUTED }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Sections({ profile }: ThemeProps) {
  const sections = profile.sections ?? [];
  if (sections.length === 0) return null;

  return (
    <>
      {sections.map((section) => (
        <Block key={section.id} title={section.title?.trim() || "Haqida"}>
          <div className="whitespace-pre-wrap text-[17px] leading-[1.75]" style={{ color: PLATINUM }}>
            {section.content}
          </div>
        </Block>
      ))}
    </>
  );
}

/* ========================================================================= *
 * YO'L
 * ========================================================================= */

function Path({ profile }: ThemeProps) {
  const work = toTimeline(profile.workExperience ?? []);
  const education = toTimeline(profile.education ?? []);
  const items = [...work, ...education];

  if (items.length === 0) return null;

  return (
    <Block title="Yo'l">
      <ol className="space-y-8">
        {items.map((item) => (
          <li key={item.id} className="grid gap-1 sm:grid-cols-[7rem_1fr] sm:gap-6">
            {/*
              SANA ALOHIDA USTUNDA.

              Matn ichida bo'lsa, u ko'zni chalg'itardi; chapdagi
              ustunda esa vaqt o'qi o'z-o'zidan hosil bo'ladi.
            */}
            <span
              className="pt-1 text-xs tabular-nums sm:text-right"
              style={{ color: MUTED }}
            >
              {range(item.from, item.to)}
            </span>

            <span>
              <span className="block text-lg font-semibold">{item.title}</span>
              {item.subtitle && (
                <span className="mt-0.5 block text-sm" style={{ color: MUTED }}>
                  {item.subtitle}
                </span>
              )}
              {item.description && (
                <span className="mt-2 block text-sm leading-relaxed" style={{ color: MUTED }}>
                  {item.description}
                </span>
              )}
            </span>
          </li>
        ))}
      </ol>
    </Block>
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
      <ul className="space-y-6">
        {items.map((item) => (
          <li key={item.id} className="border-b pb-5 last:border-0" style={{ borderColor: LINE }}>
            {item.from && (
              <span className="text-xs tabular-nums" style={{ color: MUTED }}>
                {year(item.from)}
              </span>
            )}
            <p className="mt-0.5 text-xl font-semibold leading-snug text-balance">
              {item.title}
            </p>
            {item.subtitle && (
              <p className="mt-1 text-sm" style={{ color: MUTED }}>
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
      <ul className="space-y-4">
        {certificates.map((certificate) => (
          <li key={certificate.id} className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="min-w-0">
              <span className="block font-semibold">{certificate.title}</span>
              {certificate.issuer && (
                <span className="block text-xs" style={{ color: MUTED }}>
                  {certificate.issuer}
                </span>
              )}
            </span>

            {/* Ishonch belgisi UMUMIY moduldan — §8 talabi. */}
            <span
              className="shrink-0 text-[10px] uppercase tracking-[0.2em]"
              style={{ color: isVerified(certificate.trust) ? PLATINUM : MUTED }}
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
      {/*
        BIR USTUN, KATTA RASMLAR.

        Imperial Gold'da panjara; bu dizaynning gapi o'lchamda,
        shuning uchun rasmlar ketma-ket va keng.
      */}
      <ul className="space-y-5">
        {media.map((item) => (
          <li key={item.url} className="relative aspect-[3/2] overflow-hidden" style={{ backgroundColor: COAL }}>
            <Image
              src={item.url}
              alt={item.caption ?? `${profile.full_name} — galereya rasmi`}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
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
    <footer className="border-t" style={{ borderColor: LINE }}>
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-4 px-4 py-10 sm:px-6">
        {links.length > 0 && (
          <ul className="flex flex-wrap gap-5">
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

        <Link
          href="/liderlar"
          className="text-[11px] uppercase tracking-[0.2em]"
          style={{ color: PLATINUM }}
        >
          Liderlar.uz
        </Link>
      </div>
    </footer>
  );
}
