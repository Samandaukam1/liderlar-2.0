import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Clock } from "lucide-react";
import { formatDateUz } from "@/lib/utils";
import type { OutlineItem } from "@/lib/articles/reading";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ReadingProgress } from "./reading-progress";
import { ReaderShare } from "./reader-share";
import { ReaderToc } from "./reader-toc";
import { ReaderTools } from "./reader-tools";

export interface ReaderAuthor {
  name: string;
  href?: string | null;
  avatarUrl?: string | null;
}

/**
 * O'QISH OYNASI — ENSIKLOPEDIYADAGI BARCHA MAQOLALAR UCHUN BITTA QOBIQ.
 *
 * Liderlar Online (a'zo maqolasi), tahririyat maqolasi va jurnal
 * maqolasi bir xil o'qiladi: avval har birining o'z ko'rinishi bor edi
 * va o'quvchi bir bo'limdan ikkinchisiga o'tganda boshqa saytga
 * tushgandek bo'lardi.
 *
 * TUZILISH:
 *
 *   · sarlavha bloki tor ustunda (matn bilan bir chiziqda) — kicker,
 *     sarlavha, kichik sarlavha, muallif qatori;
 *   · muqova matndan kengroq — sahifaga vazn beradi;
 *   · matn ~42rem (qatorda ~70 belgi — qulay o'qish o'lchami);
 *   · kompyuterda chap tomonda yopishqoq ulashish va matn o'lchami,
 *     o'ngda mundarija (sarlavhalar bo'lsa); telefonda ular matn
 *     tepasida ixcham qatorda.
 *
 * Yopishqoq va interaktiv qismlar `data-reader-chrome` bilan
 * belgilangan — chop etishda ular yashiriladi (`globals.css`).
 */
export function ArticleReader({
  crumbs,
  kicker,
  title,
  dek,
  authors,
  publishedAt,
  readingMinutes,
  cover,
  shareUrl,
  outline = [],
  children,
  footer,
}: {
  crumbs: { label: string; href?: string }[];
  kicker: string;
  title: string;
  dek?: string | null;
  authors: ReaderAuthor[];
  publishedAt?: string | null;
  readingMinutes?: number | null;
  cover?: { url: string; alt: string | null; caption?: string | null } | null;
  shareUrl: string;
  outline?: OutlineItem[];
  children: ReactNode;
  footer?: ReactNode;
}) {
  const hasOutline = outline.length > 0;

  return (
    <div id="reader" data-reader-size="md" className="pb-16">
      <div data-reader-chrome>
        <ReadingProgress targetId="reader-body" />
      </div>

      {/* ------------------------------------------------------------ SARLAVHA */}
      <header className="mx-auto max-w-3xl px-4 pt-6 sm:px-6 sm:pt-8">
        <Breadcrumbs items={crumbs} />

        <p className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.7rem] font-bold uppercase tracking-[0.22em] text-liderlar-blue sm:mt-10">
          <span aria-hidden className="h-px w-8 bg-liderlar-blue/50" />
          {kicker}
          {readingMinutes ? (
            <span className="flex items-center gap-1.5 font-semibold tracking-[0.14em] text-ink-soft">
              <Clock className="h-3.5 w-3.5" aria-hidden />
              {readingMinutes} daqiqa
            </span>
          ) : null}
        </p>

        <h1 className="mt-4 font-display text-[2.3rem] font-bold leading-[1.06] tracking-[-0.01em] text-navy text-balance sm:text-[3.1rem] lg:text-[3.5rem]">
          {title}
        </h1>

        {dek && (
          <p className="mt-5 text-lg leading-relaxed text-ink-soft text-pretty sm:text-xl">{dek}</p>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-4 border-t border-border-soft pt-5">
          <Byline authors={authors} publishedAt={publishedAt} />

          {/* Telefon va planshetda asboblar shu yerda; kompyuterda — chap ustunda. */}
          <div data-reader-chrome className="flex w-full items-center justify-between gap-3 sm:w-auto lg:hidden">
            <ReaderShare url={shareUrl} title={title} orientation="horizontal" />
            <span aria-hidden className="hidden h-6 w-px bg-border-soft sm:block" />
            <ReaderTools rootId="reader" orientation="horizontal" />
          </div>
        </div>
      </header>

      {/* -------------------------------------------------------------- MUQOVA */}
      {cover && (
        <figure className="mx-auto mt-8 max-w-5xl sm:mt-10 sm:px-6">
          <span className="relative block aspect-video overflow-hidden bg-ice shadow-[0_24px_60px_-28px_rgba(11,53,85,0.45)] sm:rounded-2xl">
            <Image
              src={cover.url}
              alt={cover.alt ?? ""}
              fill
              sizes="(max-width: 1024px) 100vw, 1024px"
              priority
              className="object-cover"
            />
          </span>
          {cover.caption && (
            <figcaption className="mx-auto mt-3 max-w-3xl px-4 text-center text-xs leading-relaxed text-ink-soft sm:px-0">
              {cover.caption}
            </figcaption>
          )}
        </figure>
      )}

      {/* ---------------------------------------------------------------- MATN */}
      <div className="mx-auto mt-10 grid max-w-6xl gap-x-10 px-4 sm:mt-14 sm:px-6 lg:grid-cols-[4rem_minmax(0,42rem)_4rem] lg:justify-center xl:grid-cols-[minmax(4rem,1fr)_minmax(0,42rem)_minmax(4rem,1fr)]">
        {/* Chap ustun: ulashish va matn o'lchami. */}
        <aside data-reader-chrome aria-label="O'qish asboblari" className="hidden lg:block lg:justify-self-end">
          <div className="sticky top-28 flex flex-col items-center gap-4">
            <ReaderShare url={shareUrl} title={title} orientation="vertical" />
            <span aria-hidden className="h-px w-6 bg-border-soft" />
            <ReaderTools rootId="reader" />
          </div>
        </aside>

        <div className="min-w-0">
          {hasOutline && (
            <div data-reader-chrome className="mb-8 xl:hidden">
              <ReaderToc items={outline} variant="inline" />
            </div>
          )}

          <div id="reader-body" className="reader-body">
            {children}
          </div>

          {/* MAQOLA TUGADI — vizual nuqta va ulashish taklifi. */}
          <div aria-hidden className="mt-14 flex items-center justify-center gap-3 text-liderlar-blue/50">
            <span className="h-px w-12 bg-current" />
            <span className="h-1.5 w-1.5 rotate-45 bg-current" />
            <span className="h-1.5 w-1.5 rotate-45 bg-current" />
            <span className="h-1.5 w-1.5 rotate-45 bg-current" />
            <span className="h-px w-12 bg-current" />
          </div>

          <div
            data-reader-chrome
            className="mt-10 flex flex-col items-center gap-3 rounded-2xl border border-brand-soft bg-white/70 px-5 py-5 text-center sm:flex-row sm:justify-between sm:text-left"
          >
            <p className="text-sm font-semibold text-navy">
              Maqola yoqdimi? <span className="font-normal text-ink-soft">Do&apos;stlaringiz bilan ulashing.</span>
            </p>
            <ReaderShare url={shareUrl} title={title} orientation="horizontal" />
          </div>
        </div>

        {/* O'ng ustun: mundarija (keng ekranda). */}
        <aside data-reader-chrome className="hidden xl:block">
          {hasOutline && (
            <div className="sticky top-28 max-w-[16rem]">
              <ReaderToc items={outline} variant="rail" />
            </div>
          )}
        </aside>
      </div>

      {footer && <div className="mx-auto mt-14 max-w-3xl px-4 sm:px-6">{footer}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * MUALLIF QATORI
 * ------------------------------------------------------------------ */

function Byline({ authors, publishedAt }: { authors: ReaderAuthor[]; publishedAt?: string | null }) {
  const date = publishedAt ? formatDateUz(publishedAt) : null;
  const shown = authors.slice(0, 3);

  return (
    <div className="flex min-w-0 items-center gap-3">
      {shown.length > 0 && (
        <span className="flex shrink-0 -space-x-2.5">
          {shown.map((author) => (
            <AvatarDot key={author.name} author={author} />
          ))}
        </span>
      )}
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-navy">
          {authors.length === 0
            ? "Liderlar.uz tahririyati"
            : authors.map((author, index) => (
                <span key={author.name}>
                  {index > 0 && ", "}
                  {author.href ? (
                    <Link href={author.href} className="transition hover:text-liderlar-blue">
                      {author.name}
                    </Link>
                  ) : (
                    author.name
                  )}
                </span>
              ))}
        </span>
        {date && (
          <time dateTime={publishedAt ?? undefined} className="block text-xs text-ink-soft">
            {date}
          </time>
        )}
      </span>
    </div>
  );
}

/** Ism-familiyaning bosh harflari — rasm yo'q bo'lganda. */
function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

function AvatarDot({ author }: { author: ReaderAuthor }) {
  const initials = initialsOf(author.name);

  return (
    <span className="relative block h-11 w-11 overflow-hidden rounded-full bg-gradient-to-br from-liderlar-blue to-navy ring-2 ring-paper">
      {author.avatarUrl ? (
        <Image src={author.avatarUrl} alt="" fill sizes="44px" className="object-cover" />
      ) : (
        <span className="flex h-full w-full items-center justify-center font-display text-sm font-bold text-white">
          {initials}
        </span>
      )}
    </span>
  );
}

/* ------------------------------------------------------------------ *
 * MAQOLA OXIRIDAGI MUALLIF KARTASI
 * ------------------------------------------------------------------ */

/**
 * Muallif kartasi — o'quvchini maqoladan muallifning biografik
 * sahifasiga olib boradi (§26: maqola muallifi ensiklopediyadagi
 * profilga havola qiladi).
 */
export function ReaderAuthorCard({
  name,
  href,
  avatarUrl,
  about,
  moreHref,
}: {
  name: string;
  href: string;
  avatarUrl?: string | null;
  about?: string | null;
  /** "Barcha maqolalari" — profildagi bo'limga. */
  moreHref?: string | null;
}) {
  return (
    <section
      aria-label="Muallif haqida"
      className="relative overflow-hidden rounded-2xl border border-brand-soft bg-gradient-to-br from-white via-paper to-ice px-5 py-6 sm:px-7"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-liderlar-blue/10 blur-2xl"
      />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
        <span className="relative block h-20 w-20 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-liderlar-blue to-navy ring-4 ring-white">
          {avatarUrl ? (
            <Image src={avatarUrl} alt="" fill sizes="80px" className="object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center font-display text-2xl font-bold text-white">
              {initialsOf(name)}
            </span>
          )}
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-liderlar-blue">Muallif</p>
          <p className="mt-1 font-display text-2xl font-bold leading-tight text-navy">{name}</p>
          {about && <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-ink-soft">{about}</p>}

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={href}
              className="inline-flex items-center rounded-full bg-navy px-4 py-2 text-xs font-semibold text-white transition hover:bg-navy-dark"
            >
              Biografik sahifa
            </Link>
            {moreHref && (
              <Link
                href={moreHref}
                className="inline-flex items-center rounded-full border border-brand-soft bg-white px-4 py-2 text-xs font-semibold text-navy transition hover:border-liderlar-blue/50"
              >
                Barcha maqolalari
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
