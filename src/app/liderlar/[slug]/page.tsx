import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { GraduationCap, Briefcase, BookOpen, Radio, Newspaper, Eye } from "lucide-react";
import { getCandidateBySlug, getSimilarCandidates } from "@/lib/data/candidates";
import {
  getCandidatePodcasts,
  getCandidateJournalArticles,
  getCandidateRankingBreakdown,
} from "@/lib/data/profile-extra";
import { SITE_URL } from "@/lib/constants";
import { formatDateUz, gradientFor, formatNumber } from "@/lib/utils";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { VerifiedBadge } from "@/components/ui/badge";
import { ShareButtons } from "@/components/profile/share-buttons";
import { ProfileViewTracker } from "@/components/profile/profile-view-tracker";
import { RankingMiniCard } from "@/components/profile/ranking-mini-card";
import { Timeline, type TimelineEntry } from "@/components/ui/timeline";
import { MediaGallery } from "@/components/ui/media-gallery";
import { LeaderQuoteCard } from "@/components/cards/leader-quote-card";
import { LeaderCard } from "@/components/cards/leader-card";
import { EmptyState } from "@/components/ui/empty-state";
import { ArticleBody, readingMinutes } from "@/components/ui/article-body";
import { SectionHeader } from "@/components/ui/section-header";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const candidate = await getCandidateBySlug(slug).catch(() => null);
  if (!candidate) return { title: "Lider topilmadi" };

  const name = candidate.full_name;
  const description = candidate.short_bio ?? `${name} — Liderlar.uz platformasidagi profil.`;
  const url = `${SITE_URL}/liderlar/${candidate.slug}`;

  return {
    title: name,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: name,
      description,
      url,
      type: "profile",
      images: candidate.avatar_url ? [{ url: candidate.avatar_url }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: name,
      description,
    },
  };
}

export default async function LeaderProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const candidate = await getCandidateBySlug(slug).catch(() => null);
  if (!candidate) notFound();

  const [podcasts, journalArticles, rankingBreakdown, similar] = await Promise.all([
    getCandidatePodcasts(candidate.id).catch(() => []),
    getCandidateJournalArticles(candidate.id).catch(() => []),
    getCandidateRankingBreakdown(candidate.id).catch(() => []),
    getSimilarCandidates(candidate.id, candidate.category?.slug ?? null).catch(() => []),
  ]);

  const name = candidate.full_name;
  const profileUrl = `${SITE_URL}/liderlar/${candidate.slug}`;
  const qrDataUrl = await QRCode.toDataURL(profileUrl, { margin: 1, width: 320 });
  const gradient = gradientFor(candidate.slug);
  const readingTime = readingMinutes(candidate.articles.map((a) => a.content ?? "").join(" "));

  const timelineEntries: TimelineEntry[] = [
    ...candidate.achievements.map((a) => ({
      id: `ach-${a.id}`,
      date: a.date_from,
      title: a.title,
      description: a.description,
      tone: "blue" as const,
    })),
    ...candidate.events.map((e) => ({
      id: `evt-${e.id}`,
      date: e.date_from,
      title: e.title,
      description: e.description,
      tone: "violet" as const,
    })),
  ]
    .filter((e) => e.date)
    .sort((a, b) => (a.date! < b.date! ? 1 : -1));

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    url: profileUrl,
    image: candidate.avatar_url ?? undefined,
    description: candidate.short_bio ?? undefined,
    address: candidate.region ? { "@type": "PostalAddress", addressRegion: candidate.region.name } : undefined,
    sameAs: candidate.socialLinks.map((s) => s.url).filter(Boolean),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Liderlar", item: `${SITE_URL}/liderlar` },
      { "@type": "ListItem", position: 2, name, item: profileUrl },
    ],
  };

  return (
    <div>
      <ProfileViewTracker candidateSlug={candidate.slug} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      {/* ---------------------------------------------------------------- HEADER */}
      <section className="relative">
        <div className={`relative h-56 w-full overflow-hidden sm:h-72 ${gradient}`}>
          {candidate.cover_url && (
            <Image src={candidate.cover_url} alt="" fill sizes="100vw" className="object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-portrait" />
        </div>

        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="relative -mt-20 flex flex-col gap-6 sm:-mt-24 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-end">
              <div className={`relative h-36 w-36 shrink-0 overflow-hidden rounded-2xl border-4 border-white shadow-card-hover sm:h-44 sm:w-44 ${gradient}`}>
                {candidate.avatar_url && (
                  <Image src={candidate.avatar_url} alt={name} fill sizes="176px" className="object-cover" />
                )}
              </div>
              <div className="pb-2 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <h1 className="font-display text-3xl font-bold text-navy sm:text-4xl">{name}</h1>
                  {candidate.is_verified && <VerifiedBadge />}
                </div>
                {candidate.short_bio && (
                  <p className="mt-1 line-clamp-2 max-w-xl text-[0.95rem] leading-relaxed text-ink-soft [text-wrap:pretty] sm:line-clamp-none sm:text-base">
                    {candidate.short_bio}
                  </p>
                )}
                <p className="mt-0.5 text-sm text-ink-soft">
                  {candidate.region?.name ?? "Hudud ko'rsatilmagan"}
                  {candidate.category && ` · ${candidate.category.name}`}
                </p>
              </div>
            </div>
            <div className="pb-2">
              <ShareButtons url={profileUrl} qrDataUrl={qrDataUrl} />
            </div>
          </div>

          <div className="mt-4">
            <Breadcrumbs items={[{ label: "Liderlar", href: "/liderlar" }, { label: name }]} />
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_20rem]">
        {/* ---------------------------------------------------------------- MAIN COLUMN */}
        <div className="space-y-12">
          {candidate.short_bio && (
            <section>
              <h2 className="font-display text-xl font-bold text-navy">Qisqacha ma&apos;lumot</h2>
              <p className="prose-article mt-3 text-base leading-relaxed text-ink-soft [text-wrap:pretty]">
                {candidate.short_bio}
              </p>
            </section>
          )}

          {candidate.articles.length > 0 && (
            <section
              id="maqola"
              className="-mx-4 border-y border-brand-soft bg-paper px-5 py-8 shadow-card sm:mx-0 sm:rounded-2xl sm:border sm:px-9 sm:py-10"
            >
              <span className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-liderlar-blue">
                Biografik maqola
              </span>
              <h2 className="mt-2 font-display text-[1.7rem] font-bold leading-[1.15] text-navy sm:text-3xl">
                {name} haqida
              </h2>
              <p className="mt-2.5 flex items-center gap-1.5 text-xs text-ink-soft">
                <BookOpen className="h-3.5 w-3.5 text-liderlar-blue" aria-hidden />
                {readingTime} daqiqalik o&apos;qish
              </p>

              <div className="mt-6 space-y-8 border-t border-brand-soft pt-7">
                {candidate.articles.map((article, idx) => (
                  <article key={article.id} className={idx > 0 ? "border-t border-brand-soft pt-8" : undefined}>
                    <ArticleBody content={article.content} dropCap lead />
                  </article>
                ))}
              </div>
            </section>
          )}

          {(candidate.education.length > 0 || candidate.workExperience.length > 0) && (
            <section className="grid gap-8 sm:grid-cols-2">
              {candidate.education.length > 0 && (
                <div>
                  <h2 className="flex items-center gap-2 font-display text-lg font-bold text-navy">
                    <GraduationCap className="h-5 w-5 text-liderlar-blue" aria-hidden /> Ta&apos;lim
                  </h2>
                  <ul className="mt-4 space-y-4">
                    {candidate.education.map((e) => (
                      <li key={e.id}>
                        <p className="font-semibold text-navy">{e.title}</p>
                        {e.subtitle && <p className="text-sm text-ink-soft">{e.subtitle}</p>}
                        <p className="text-xs text-ink-soft">
                          {e.date_from ? formatDateUz(e.date_from) : ""}
                          {e.date_to ? ` — ${formatDateUz(e.date_to)}` : ""}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {candidate.workExperience.length > 0 && (
                <div>
                  <h2 className="flex items-center gap-2 font-display text-lg font-bold text-navy">
                    <Briefcase className="h-5 w-5 text-liderlar-blue" aria-hidden /> Ish tajribasi
                  </h2>
                  <ul className="mt-4 space-y-4">
                    {candidate.workExperience.map((w) => (
                      <li key={w.id}>
                        <p className="font-semibold text-navy">{w.title}</p>
                        {w.subtitle && <p className="text-sm text-ink-soft">{w.subtitle}</p>}
                        <p className="text-xs text-ink-soft">
                          {w.date_from ? formatDateUz(w.date_from) : ""}
                          {w.date_to ? ` — ${formatDateUz(w.date_to)}` : ""}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          <section>
            <h2 className="font-display text-xl font-bold text-navy">Faoliyat va yutuqlar</h2>
            {timelineEntries.length === 0 ? (
              <EmptyState
                className="mt-4"
                title="Hozircha tasdiqlangan yutuq yoki faoliyat yo'q"
                description="Nomzod oylik yangilanish orqali ma'lumot yuborganidan va tahririyat tasdiqlaganidan so'ng bu yerda ko'rinadi."
              />
            ) : (
              <div className="mt-6">
                <Timeline entries={timelineEntries} />
              </div>
            )}
          </section>

          {candidate.quotes.length > 0 && (
            <section>
              <h2 className="font-display text-xl font-bold text-navy">Iqtiboslar</h2>
              <div className="mt-4 grid gap-5 sm:grid-cols-2">
                {candidate.quotes.map((q) => (
                  <LeaderQuoteCard
                    key={q.id}
                    quote={{
                      id: q.id,
                      text: q.text,
                      author_name: q.author_name,
                      accent: q.accent,
                      candidate,
                    }}
                  />
                ))}
              </div>
            </section>
          )}

          {candidate.booksRead.length > 0 && (
            <section>
              <h2 className="flex items-center gap-2 font-display text-xl font-bold text-navy">
                <BookOpen className="h-5 w-5 text-liderlar-blue" aria-hidden /> O&apos;qigan kitoblari
              </h2>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {candidate.booksRead.map((b) => (
                  <li key={b.id} className="rounded-md border border-brand-soft bg-paper px-4 py-3 text-sm">
                    <span className="font-semibold text-navy">{b.title}</span>
                    {b.subtitle && <span className="text-ink-soft"> — {b.subtitle}</span>}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {podcasts.length > 0 && (
            <section>
              <h2 className="flex items-center gap-2 font-display text-xl font-bold text-navy">
                <Radio className="h-5 w-5 text-liderlar-blue" aria-hidden /> Podcastlar
              </h2>
              <ul className="mt-4 space-y-2">
                {podcasts.map((p) => (
                  <li key={p.id}>
                    <Link href={`/podcastlar/${p.slug}`} className="flex items-center justify-between rounded-md border border-brand-soft bg-paper px-4 py-3 text-sm hover:border-liderlar-blue">
                      <span className="font-semibold text-navy">{p.title}</span>
                      <span className="text-xs text-ink-soft">{formatDateUz(p.starts_at)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {journalArticles.length > 0 && (
            <section>
              <h2 className="flex items-center gap-2 font-display text-xl font-bold text-navy">
                <Newspaper className="h-5 w-5 text-liderlar-blue" aria-hidden /> Liderlar Online jurnalidagi materiallar
              </h2>
              <ul className="mt-4 space-y-2">
                {journalArticles.map((a) => (
                  <li key={a.id}>
                    <Link href={`/jurnal/maqola/${a.slug}`} className="flex items-center justify-between rounded-md border border-brand-soft bg-paper px-4 py-3 text-sm hover:border-liderlar-blue">
                      <span className="font-semibold text-navy">{a.title}</span>
                      {a.journal && <span className="text-xs text-ink-soft">#{a.journal.issue_number}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {candidate.media.length > 0 && (
            <section>
              <h2 className="font-display text-xl font-bold text-navy">Rasmlar galereyasi</h2>
              <div className="mt-4">
                <MediaGallery
                  items={candidate.media
                    .filter((m) => m.url)
                    .map((m) => ({ id: m.id, url: m.url, caption: m.caption }))}
                />
              </div>
            </section>
          )}
        </div>

        {/* ---------------------------------------------------------------- SIDEBAR */}
        <aside className="space-y-6 lg:sticky lg:top-24 lg:h-fit">
          <RankingMiniCard rows={rankingBreakdown} totalScore={candidate.total_score} />

          <div className="rounded-xl border border-brand-soft bg-paper p-5 shadow-card">
            <div className="flex items-center gap-2 text-sm text-ink-soft">
              <Eye className="h-4 w-4" aria-hidden />
              Sahifa ko&apos;rishlar
            </div>
            <p className="mt-1 font-display text-2xl font-bold text-navy">{formatNumber(candidate.view_count)}</p>
          </div>

          {candidate.socialLinks.length > 0 && (
            <div className="rounded-xl border border-brand-soft bg-paper p-5 shadow-card">
              <p className="mb-3 text-sm font-semibold text-navy">Ijtimoiy tarmoqlar</p>
              <div className="flex flex-wrap gap-2">
                {candidate.socialLinks.map((s) => (
                  <a
                    key={s.id}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="rounded-full bg-liderlar-blue/8 px-3 py-1.5 text-xs font-semibold text-liderlar-blue hover:bg-liderlar-blue/15"
                  >
                    {s.title}
                  </a>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
          <SectionHeader eyebrow="O'xshash profillar" title="Shunga o'xshash liderlar" className="mb-6" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {similar.map((c) => (
              <LeaderCard key={c.id} candidate={c} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
