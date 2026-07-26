import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import {
  GraduationCap,
  Briefcase,
  BookOpen,
  Radio,
  Newspaper,
  ArrowDown,
  BadgeCheck,
} from "lucide-react";
import { getCandidateBySlug, getSimilarCandidates } from "@/lib/data/candidates";
import {
  getCandidatePodcasts,
  getCandidateJournalArticles,
  getCandidateRankingBreakdown,
} from "@/lib/data/profile-extra";
import { SITE_URL } from "@/lib/constants";
import { formatDateUz, gradientFor, formatNumber } from "@/lib/utils";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ArticleBody, readingMinutes } from "@/components/ui/article-body";
import { ShareButtons } from "@/components/profile/share-buttons";
import { ProfileViewTracker } from "@/components/profile/profile-view-tracker";
import { RankingMiniCard } from "@/components/profile/ranking-mini-card";
import { CandidateAdabiyotXSection } from "@/components/profile/candidate-adabiyotx-section";
import { CandidateBooksRow } from "@/components/profile/candidate-books-row";
import { Timeline, type TimelineEntry } from "@/components/ui/timeline";
import { MediaGallery } from "@/components/ui/media-gallery";
import { LeaderQuoteCard } from "@/components/cards/leader-quote-card";
import { LeaderCard } from "@/components/cards/leader-card";
import { EmptyState } from "@/components/ui/empty-state";
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
  const ownWorks = candidate.adabiyotXItems.filter(
    (item) => item.relationshipType === "own_work"
  );
  const readBooks = candidate.adabiyotXItems.filter(
    (item) =>
      item.relationshipType === "read_book" && item.contentType === "book"
  );

  const profileFacts = [
    ...(candidate.position
      ? [{ label: "Reytingdagi o'rni", value: `#${candidate.position}` }]
      : []),
    { label: "Umumiy reyting", value: `${formatNumber(candidate.total_score)} ball` },
    { label: "Hudud", value: candidate.region?.name ?? "Ko'rsatilmagan" },
    { label: "Sahifa ko'rishlari", value: formatNumber(candidate.view_count) },
  ];

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
      <section className="relative isolate overflow-hidden bg-navy-dark text-white">
        <div aria-hidden className="absolute inset-0">
          {candidate.cover_url ? (
            <Image src={candidate.cover_url} alt="" fill sizes="100vw" className="object-cover opacity-25 grayscale" />
          ) : (
            <div className={`absolute inset-0 opacity-25 ${gradient}`} />
          )}
          <div className="absolute inset-0 bg-[linear-gradient(115deg,#062741_8%,rgba(11,53,85,0.86)_52%,#062741_96%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(65%_55%_at_50%_105%,rgba(19,188,228,0.22),transparent_72%)]" />
        </div>

        <div className="relative mx-auto flex min-h-[40rem] max-w-7xl flex-col px-5 pb-9 pt-6 sm:px-8 lg:min-h-[46rem] lg:pb-12">
          <Breadcrumbs tone="light" items={[{ label: "Liderlar", href: "/liderlar" }, { label: name }]} />

          <div className="mt-9 flex flex-1 flex-col gap-10 lg:mt-6 lg:grid lg:grid-cols-[minmax(0,13rem)_minmax(0,1fr)_minmax(0,21rem)] lg:items-end lg:gap-12">
            {/* -------------------------------------------- READ CTA (bottom-left) */}
            <div className="order-3 lg:order-1 lg:pb-6">
              <a href="#biografiya" className="group inline-flex items-center gap-3 text-left">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/30 text-white transition-colors group-hover:border-liderlar-blue group-hover:bg-liderlar-blue/20">
                  <ArrowDown className="h-4 w-4" aria-hidden />
                </span>
                <span className="text-sm font-semibold leading-tight">
                  Biografiyani
                  <br />
                  o&apos;qish
                </span>
              </a>

              <div className="mt-8 hidden lg:block">
                <div className="flex items-center gap-3">
                  <span className="text-[0.62rem] font-bold uppercase tracking-[0.24em] text-liderlar-blue">
                    Profil
                  </span>
                  <span className="h-px w-8 bg-white/30" aria-hidden />
                </div>
                <p className="mt-3 text-xs leading-5 text-white/50">
                  {candidate.region?.name ?? "Hudud ko'rsatilmagan"}
                  {candidate.category && (
                    <>
                      <br />
                      {candidate.category.name}
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* -------------------------------------------- PORTRAIT */}
            <div className="order-1 flex justify-center lg:order-2 lg:h-full lg:items-end">
              <div
                className={`relative aspect-[4/5] w-full max-w-[17rem] overflow-hidden rounded-[1.75rem] shadow-[0_40px_90px_rgba(2,20,35,0.55)] sm:max-w-[20rem] lg:max-w-[26rem] ${gradient}`}
              >
                {candidate.avatar_url && (
                  <Image
                    src={candidate.avatar_url}
                    alt={name}
                    fill
                    priority
                    sizes="(max-width: 1023px) 320px, 460px"
                    className="object-cover object-top"
                  />
                )}
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(6,39,65,0.55)_100%)]" />
              </div>
            </div>

            {/* -------------------------------------------- NAME + INDEX */}
            <div className="order-2 lg:order-3 lg:pb-6">
              <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                <span className="text-[0.62rem] font-bold uppercase tracking-[0.24em] text-liderlar-blue">
                  Lider profili
                </span>
                {candidate.is_verified && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/25 bg-white/10 px-2.5 py-1 text-[0.68rem] font-semibold text-white backdrop-blur">
                    <BadgeCheck className="h-3.5 w-3.5 text-liderlar-blue" aria-hidden />
                    Tasdiqlangan
                  </span>
                )}
              </div>

              <h1 className="mt-4 font-display text-[2.5rem] font-bold leading-[0.95] tracking-[-0.01em] sm:text-5xl lg:text-right lg:text-[3.2rem]">
                {name}
              </h1>
              <div className="mt-4 h-px w-full bg-white/70" aria-hidden />
              <p className="mt-2.5 text-sm text-white/55 lg:text-right">
                {candidate.category?.name ?? "Yosh lider"}
              </p>

              <ul className="mt-9">
                {profileFacts.map((fact, index) => (
                  <li key={fact.label} className="border-b border-white/12 py-4 first:border-t">
                    <div className="flex items-baseline justify-between gap-4 lg:justify-end lg:gap-5">
                      <span className="min-w-0 truncate text-[0.98rem] font-semibold lg:text-right">
                        {fact.value}
                      </span>
                      <span className="shrink-0 text-[0.68rem] font-bold tabular-nums text-white/40">
                        {String(index + 2).padStart(2, "0")}
                      </span>
                    </div>
                    <p className="mt-1 text-[0.68rem] uppercase tracking-[0.16em] text-white/40 lg:text-right">
                      {fact.label}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* -------------------------------------------- FOOTER BAR */}
          <div className="mt-10 flex flex-wrap items-center justify-between gap-5 border-t border-white/12 pt-6">
            <div className="flex flex-wrap items-center gap-2">
              {candidate.socialLinks.slice(0, 4).map((s) => (
                <a
                  key={s.id}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="rounded-full border border-white/20 px-3.5 py-1.5 text-xs font-semibold text-white/75 transition-colors hover:border-liderlar-blue hover:text-white"
                >
                  {s.title}
                </a>
              ))}
            </div>
            <div className="[&_button]:border-white/25 [&_button]:bg-white/10 [&_button]:text-white hover:[&_button]:border-liderlar-blue hover:[&_button]:bg-white/20">
              <ShareButtons url={profileUrl} qrDataUrl={qrDataUrl} />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_20rem]">
        {/* ---------------------------------------------------------------- MAIN COLUMN */}
        <div className="min-w-0 space-y-12">
          <section id="biografiya" className="scroll-mt-20">
            <div className="flex items-center gap-3">
              <span className="text-[0.62rem] font-bold uppercase tracking-[0.24em] text-liderlar-blue">
                Biografiya
              </span>
              <span className="h-px flex-1 bg-border-soft" aria-hidden />
              {candidate.articles.length > 0 && (
                <span className="flex items-center gap-1.5 text-[0.68rem] uppercase tracking-[0.14em] text-ink-soft">
                  <BookOpen className="h-3.5 w-3.5 text-liderlar-blue" aria-hidden />
                  {readingTime} daqiqa
                </span>
              )}
            </div>

            {candidate.short_bio && (
              <p className="mt-6 max-w-[38rem] font-display text-[1.35rem] leading-[1.5] text-navy [text-wrap:pretty] sm:text-2xl">
                {candidate.short_bio}
              </p>
            )}

            {candidate.articles.length > 0 ? (
              <div className="mt-8 space-y-9 border-t border-border-soft pt-8">
                {candidate.articles.map((article, idx) => (
                  <article key={article.id} className={idx > 0 ? "border-t border-border-soft pt-9" : undefined}>
                    <ArticleBody content={article.content} dropCap lead className="mx-0" />
                  </article>
                ))}
              </div>
            ) : (
              !candidate.short_bio && (
                <EmptyState className="mt-6" title="Biografiya hozircha kiritilmagan" />
              )
            )}
          </section>

          <CandidateAdabiyotXSection title="Ijodiy ishlari" items={ownWorks} />
          <CandidateBooksRow title="O‘qigan kitoblari" books={readBooks} />

          {candidate.booksRead.length > 0 && (
            <section>
              <h2 className="flex items-center gap-2 font-display text-xl font-bold text-navy">
                <BookOpen className="h-5 w-5 text-liderlar-blue" aria-hidden />
                {readBooks.length > 0
                  ? "Boshqa o‘qigan kitoblari"
                  : "O‘qigan kitoblari"}
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

          {candidate.socialLinks.length > 4 && (
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
