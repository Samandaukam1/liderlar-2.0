import Link from "next/link";
import { ArrowUpRight, BookOpenText, Compass, MapPin, Radio, ShieldCheck, Sparkles, Trophy, Users } from "lucide-react";
import { getFeaturedCandidates, getRecentCandidates, getTopCandidates } from "@/lib/data/candidates";
import { getHomepageStats } from "@/lib/data/stats";
import { getFeaturedQuotes } from "@/lib/data/quotes";
import { getUpcomingPodcasts } from "@/lib/data/podcasts";
import { getLatestJournal } from "@/lib/data/journals";
import { getPopularArticles } from "@/lib/data/articles";
import { getDirections, getSiteSetting } from "@/lib/data/reference";
import { HeroPortraitStack } from "@/components/home/hero-portrait-stack";
import { StatCard } from "@/components/ui/stat-card";
import { StatCardSkeleton } from "@/components/ui/skeleton";
import { SectionHeader } from "@/components/ui/section-header";
import { LeaderCard } from "@/components/cards/leader-card";
import { LeaderQuoteCard } from "@/components/cards/leader-quote-card";
import { PodcastCard } from "@/components/cards/podcast-card";
import { JournalCard } from "@/components/cards/journal-card";
import { ArticleCard } from "@/components/cards/article-card";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/button";
import { PatternBackground } from "@/components/ui/pattern-background";
import { gradientFor } from "@/lib/utils";
import { safe } from "@/lib/safe";

export default async function HomePage() {
  const [stats, featured, top, recent, quotes, podcasts, journal, articles, directions, heroTitle, heroSubtitle] =
    await Promise.all([
      safe(getHomepageStats(), { candidates: 0, regions: 0, directions: 0, podcasts: 0, journalIssues: 0 }),
      safe(getFeaturedCandidates(7), []),
      safe(getTopCandidates(8), []),
      safe(getRecentCandidates(8), []),
      safe(getFeaturedQuotes(6), []),
      safe(getUpcomingPodcasts(3), []),
      safe(getLatestJournal(), null),
      safe(getPopularArticles(3), []),
      safe(getDirections(), []),
      safe(getSiteSetting<string>("hero_title"), null),
      safe(getSiteSetting<string>("hero_subtitle"), null),
    ]);

  const heroCollage = [...featured, ...top, ...recent]
    .filter((candidate, index, list) => list.findIndex((item) => item.id === candidate.id) === index)
    .slice(0, 7);

  return (
    <div className="relative isolate overflow-hidden bg-ice">
      <div className="home-pattern-content">
      {/* ---------------------------------------------------------------- HERO */}
      <section className="relative overflow-hidden bg-paper">
        <div className="home-hero-effects" aria-hidden="true">
          <div className="bg-gradient-hero-radial absolute inset-0" />
          <div className="home-orbit-glows">
            <span className="home-orbit-glow home-orbit-glow-one" />
            <span className="home-orbit-glow home-orbit-glow-two" />
            <span className="home-orbit-glow home-orbit-glow-three" />
          </div>
          <div className="absolute left-[8%] top-12 h-24 w-24 rounded-full border border-cyan/20 sm:h-36 sm:w-36" />
          <div className="absolute right-[7%] top-56 h-3 w-3 rounded-full bg-liderlar-blue/35 shadow-[0_0_0_10px_rgba(19,188,228,0.08)]" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 pb-7 pt-8 text-center sm:px-6 sm:pt-10 lg:pt-12">
          <div className="animate-fade-in">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-border-soft bg-paper/80 px-4 py-2 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-liderlar-blue shadow-sm backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              O&apos;zbekiston yetakchilari platformasi
            </span>

            <p className="font-display text-4xl font-medium italic leading-none text-navy sm:text-5xl lg:text-6xl">
              Yangi avlodni kashf eting,
            </p>
            <h1 className="mx-auto mt-1 max-w-5xl text-balance text-4xl font-extrabold leading-[0.98] tracking-[-0.055em] text-navy sm:text-5xl lg:text-7xl">
              {heroTitle ?? "O'zbekiston kelajagini yaratayotgan liderlar"}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-balance text-sm leading-7 text-ink-soft sm:text-base">
              {heroSubtitle ??
                "Faol, iqtidorli va yetakchi yoshlarning tekshirilgan profillari, shaffof reytingi va ilhomlantiruvchi hikoyalari bir makonda."}
            </p>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <LinkButton href="/liderlar" size="lg" className="group px-7">
                Liderlarni kashf etish
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
              </LinkButton>
              <LinkButton href="/ariza" size="lg" variant="ghost" className="px-6">
                Ariza topshirish
              </LinkButton>
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-x-7 gap-y-2 text-xs text-ink-soft">
              <span className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="h-4 w-4 text-liderlar-blue" aria-hidden />
                Tasdiqlangan ma&apos;lumotlar
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Compass className="h-4 w-4 text-liderlar-blue" aria-hidden />
                Ochiq va izohlanadigan reyting
              </span>
            </div>
          </div>
        </div>

        <div className="relative mt-2 sm:mt-4">
          <HeroPortraitStack candidates={heroCollage} />
        </div>

        <div className="relative mx-auto grid max-w-6xl border-y border-border-soft/80 px-4 sm:grid-cols-3 sm:px-6">
          {[
            {
              icon: ShieldCheck,
              title: "Tekshirilgan profillar",
              text: "Har bir lider haqidagi ma'lumot ishonchli manbalar asosida tasdiqlanadi.",
            },
            {
              icon: Trophy,
              title: "Shaffof reyting",
              text: "Yutuq, faollik va liderlik ko'rsatkichlari yagona mezonda baholanadi.",
            },
            {
              icon: BookOpenText,
              title: "Bilim va media markazi",
              text: "Biografiya, podkast, jurnal va fikrlar bitta boy ekotizimda jamlangan.",
            },
          ].map(({ icon: Icon, title, text }, index) => (
            <div
              key={title}
              className={`flex gap-4 px-3 py-7 text-left sm:px-7 ${
                index > 0 ? "border-t border-border-soft/80 sm:border-l sm:border-t-0" : ""
              }`}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-blue text-white shadow-[0_8px_22px_rgba(5,151,198,0.2)]">
                <Icon className="h-4.5 w-4.5" aria-hidden />
              </span>
              <div>
                <h2 className="text-sm font-bold text-navy">{title}</h2>
                <p className="mt-1 text-xs leading-5 text-ink-soft">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------------- STATS */}
      <section className="bg-linen py-12">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 px-4 sm:grid-cols-4 sm:gap-4 sm:px-6">
          {stats.candidates === 0 && stats.regions === 0 ? (
            Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          ) : (
            <>
              <StatCard value={stats.candidates} label="Tasdiqlangan liderlar" icon={<Users className="h-5 w-5" />} gradientClassName="bg-gradient-blue" />
              <StatCard value={stats.regions} label="Qamrab olingan hududlar" icon={<MapPin className="h-5 w-5" />} gradientClassName="bg-gradient-peach" />
              <StatCard value={stats.directions} label="Faoliyat yo'nalishlari" icon={<Compass className="h-5 w-5" />} gradientClassName="bg-gradient-violet" />
              <StatCard value={stats.podcasts} label="O'tkazilgan podcastlar" icon={<Radio className="h-5 w-5" />} gradientClassName="bg-gradient-mint" />
            </>
          )}
        </div>
      </section>

      {/* ---------------------------------------------------------------- TOP LEADERS */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
        <SectionHeader
          eyebrow="Reyting"
          title="Eng yuqori reytingdagi liderlar"
          description="Umumiy reyting yutuqlar, oylik faollik va faol liderlik ko'rsatkichlari asosida shakllanadi."
          action="To'liq reytingni ko'rish"
          actionHref="/reyting"
          className="mb-8"
        />
        {top.length === 0 ? (
          <EmptyState
            title="Hozircha reyting ma'lumotlari yo'q"
            description="Supabase migratsiyalari qo'llanilgach va nomzodlar qo'shilgach, bu yerda eng yuqori reytingdagi liderlar ko'rinadi."
          />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {top.map((c, i) => (
              <LeaderCard key={c.id} candidate={c} rank={i + 1} />
            ))}
          </div>
        )}
      </section>

      {/* ---------------------------------------------------------------- RECENT LEADERS */}
      <section className="bg-sand/35 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeader
            eyebrow="Yangi qo'shilganlar"
            title="Shu oyning faol va yangi liderlari"
            action="Barcha liderlar"
            actionHref="/liderlar"
            className="mb-8"
          />
          {recent.length === 0 ? (
            <EmptyState title="Hozircha yangi liderlar yo'q" />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {recent.map((c) => (
                <LeaderCard key={c.id} candidate={c} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ---------------------------------------------------------------- DIRECTIONS */}
      {directions.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
          <SectionHeader eyebrow="Yo'nalishlar" title="Faoliyat yo'nalishlari bo'yicha" action="Barchasi" actionHref="/yonalishlar" className="mb-8" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {directions.slice(0, 8).map((d) => (
              <Link
                key={d.id}
                href={`/liderlar?yonalish=${d.slug}`}
                className="group flex flex-col justify-between rounded-2xl border border-brand-soft bg-paper p-5 shadow-card transition-all hover:-translate-y-1 hover:border-liderlar-blue/40 hover:shadow-card-hover"
              >
                <span
                  className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-md text-white ${gradientFor(d.slug)}`}
                >
                  <Compass className="h-5 w-5" aria-hidden />
                </span>
                <span className="font-display text-sm font-bold text-navy">{d.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ---------------------------------------------------------------- PODCAST + JOURNAL */}
      <section className="bg-linen/70 py-16 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2">
          <div>
            <SectionHeader eyebrow="Media" title="Yaqinlashayotgan podcast" action="Barcha podcastlar" actionHref="/podcastlar" className="mb-6" />
            {podcasts.length === 0 ? (
              <EmptyState title="Yaqin orada podcast rejalashtirilmagan" />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {podcasts.slice(0, 2).map((p) => (
                  <PodcastCard key={p.id} podcast={p} />
                ))}
              </div>
            )}
          </div>
          <div>
            <SectionHeader eyebrow="Nashr" title="Liderlar Online — so'nggi son" action="Jurnal arxivi" actionHref="/jurnal" className="mb-6" />
            {journal ? (
              <div className="mx-auto max-w-xs">
                <JournalCard journal={journal} />
              </div>
            ) : (
              <EmptyState title="Hozircha nashr etilgan son yo'q" />
            )}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- ARTICLES */}
      {articles.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
          <SectionHeader eyebrow="Ensiklopediya" title="Mashhur biografik maqolalar" className="mb-8" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </section>
      )}

      {/* ---------------------------------------------------------------- QUOTES */}
      <section className="bg-navy py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeader
            eyebrow="Liderlar ovozi"
            title="Iqtiboslar"
            action="Barcha iqtiboslar"
            actionHref="/iqtiboslar"
            className="mb-8 [&_h2]:text-white [&_p]:text-white/70 [&_a]:text-cyan-light"
          />
          {quotes.length === 0 ? (
            <EmptyState title="Hozircha iqtiboslar yo'q" className="border-white/15 bg-white/5" />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {quotes.map((q) => (
                <LeaderQuoteCard key={q.id} quote={q} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ---------------------------------------------------------------- CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="relative grid gap-8 overflow-hidden rounded-[2rem] border border-border-soft bg-gradient-blue p-8 text-white shadow-card sm:grid-cols-2 sm:items-center sm:p-12">
          <div className="absolute -right-12 -top-24 h-64 w-64 rounded-full border border-white/15" aria-hidden />
          <div className="absolute -right-4 -top-16 h-44 w-44 rounded-full border border-white/10" aria-hidden />
          <div>
            <h2 className="font-display text-3xl font-semibold leading-none sm:text-4xl">
              Siz ham O&apos;zbekiston kelajagini yaratayotgan yoshlar qatorida bo&apos;lishni xohlaysizmi?
            </h2>
            <p className="mt-3 text-white/85">
              Ensiklopediyaga qo&apos;shiling, o&apos;z yutuqlaringizni ko&apos;rsating va reytingda o&apos;rningizni egallang.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:items-end">
            <LinkButton href="/ariza" variant="secondary" size="lg" className="w-full sm:w-auto">
              Ariza topshirish
            </LinkButton>
            <LinkButton href="/loyiha-haqida" variant="ghost" size="lg" className="w-full text-white hover:bg-white/10 sm:w-auto">
              Loyiha haqida batafsil
            </LinkButton>
          </div>
        </div>
      </section>
      </div>
      <PatternBackground
        className="home-pattern-background"
        gradient="linear-gradient(135deg, #0A2748 0%, #087EA4 45%, #00C7E8 78%, #A998F5 100%)"
        opacity={0.18}
        size="620px 620px"
      />
    </div>
  );
}
