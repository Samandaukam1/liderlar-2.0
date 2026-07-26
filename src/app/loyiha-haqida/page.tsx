import type { Metadata } from "next";
import { ShieldCheck, Users, Trophy, Radio, BookOpen, Sparkles } from "lucide-react";
import { getHomepageStats } from "@/lib/data/stats";
import { StatCard } from "@/components/ui/stat-card";
import { LinkButton } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Loyiha haqida",
  description: "Liderlar.uz — O'zbekistonning faol, iqtidorli va yetakchi yoshlarini birlashtiruvchi raqamli ensiklopediya, reyting platformasi va media markazi haqida.",
};

const PRINCIPLES = [
  {
    icon: ShieldCheck,
    title: "Faqat tasdiqlangan ma'lumot",
    text: "Har bir profil, yutuq va faoliyat tahririyat tomonidan ko'rib chiqiladi va tasdiqlanadi.",
  },
  {
    icon: Trophy,
    title: "Ochiq va izohlanadigan reyting",
    text: "Reyting formulasi va og'irliklari ochiq e'lon qilinadi, har bir qo'lda tuzatish sabab bilan qayd etiladi.",
  },
  {
    icon: Users,
    title: "Yoshlar energiyasi",
    text: "Ta'lim, tadbirkorlik, IT, san'at, sport va ijtimoiy faollik sohalaridagi yosh yetakchilarni birlashtiramiz.",
  },
  {
    icon: Radio,
    title: "Media markaz",
    text: "Podcastlar, Liderlar Online jurnali va biografik maqolalar orqali hikoyalarni keng auditoriyaga yetkazamiz.",
  },
];

export default async function AboutPage() {
  const stats = await getHomepageStats().catch(() => ({ candidates: 0, regions: 0, directions: 0, podcasts: 0, journalIssues: 0 }));

  return (
    <div>
      <section className="bg-gradient-blue py-16 text-white sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Loyiha haqida
          </span>
          <h1 className="font-display text-3xl font-bold sm:text-5xl">
            O&apos;zbekiston kelajagini yaratayotgan yoshlar shu yerda jamlangan
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-white/85 sm:text-lg">
            Liderlar.uz — O&apos;zbekistonning faol, iqtidorli va yetakchi yoshlarini birlashtiruvchi raqamli
            ensiklopediya, reyting platformasi va media markazi.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          <StatCard value={stats.candidates} label="Tasdiqlangan liderlar" gradientClassName="bg-gradient-blue" />
          <StatCard value={stats.regions} label="Hududlar" gradientClassName="bg-gradient-peach" />
          <StatCard value={stats.directions} label="Yo'nalishlar" gradientClassName="bg-gradient-violet" />
          <StatCard value={stats.podcasts} label="Podcastlar" gradientClassName="bg-gradient-mint" />
          <StatCard value={stats.journalIssues} label="Jurnal sonlari" gradientClassName="bg-gradient-coral" />
        </div>
      </section>

      <section className="bg-paper py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-center font-display text-2xl font-bold text-navy sm:text-3xl">Bizning tamoyillarimiz</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PRINCIPLES.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-xl border border-brand-soft bg-ice p-6 shadow-card">
                <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-md bg-gradient-blue text-white">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="font-display text-base font-bold text-navy">{title}</h3>
                <p className="mt-2 text-sm text-ink-soft">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6">
        <BookOpen className="mx-auto h-10 w-10 text-liderlar-blue" aria-hidden />
        <h2 className="mt-4 font-display text-2xl font-bold text-navy">Ensiklopediyaga qo&apos;shiling</h2>
        <p className="mt-3 text-ink-soft">
          Siz ham O&apos;zbekiston kelajagini yaratayotgan yoshlar qatoriga qo&apos;shilishni xohlaysizmi? Ariza
          topshiring — tahririyatimiz sizning profilingizni ko&apos;rib chiqadi.
        </p>
        <LinkButton href="/ariza" size="lg" className="mt-6">
          Ariza topshirish
        </LinkButton>
      </section>
    </div>
  );
}
