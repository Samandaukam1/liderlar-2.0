import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Bot,
  FileCheck2,
  FileText,
  HandHeart,
  Mic,
  Newspaper,
  Quote,
  Trophy,
} from "lucide-react";
import { DocumentHero } from "@/components/legal/document-hero";
import { LegalDocuments } from "@/components/legal/legal-documents";
import { LinkButton } from "@/components/ui/button";
import { getHomepageStats } from "@/lib/data/stats";
import { LEGAL_ENTITY } from "@/lib/legal/company";
import { cn, formatNumber } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Loyiha haqida",
  description:
    "Liderlar.uz — O‘zbekiston Lider Yoshlari Ensiklopediyasi: raqamli ensiklopediya, reyting platformasi va media markaz. Loyiha “MUKAMMAL MEDIA GROUP” MCHJ tasarrufida yuritiladi.",
  alternates: { canonical: "/loyiha-haqida" },
};

const PARTS = [
  {
    icon: BookOpen,
    title: "Ensiklopediya",
    text: "Hududlar va yo‘nalishlar kesimida yuritiladigan biografik maqolalar. Har bir maqola nomzod taqdim etgan ma’lumotlar asosida tayyorlanadi va tahrir qilinadi.",
    href: "/liderlar",
    wide: true,
  },
  {
    icon: Trophy,
    title: "Reyting va TOP 100",
    text: "Tasdiqlangan faoliyat va natijalar asosida hisoblanadi. Qoidalari ochiq.",
    href: "/reyting",
  },
  {
    icon: Mic,
    title: "Podcastlar",
    text: "Yosh liderlar ishtirokidagi suhbatlar va efirlar.",
    href: "/podcastlar",
  },
  {
    icon: Newspaper,
    title: "Liderlar Online",
    text: "Platformaning rasmiy raqamli jurnali.",
    href: "/jurnal",
  },
  {
    icon: Quote,
    title: "Iqtiboslar",
    text: "Yosh liderlarning fikrlari va motivatsion so‘zlari.",
    href: "/iqtiboslar",
  },
  {
    icon: HandHeart,
    title: "MEHR 365+",
    text: "Ijtimoiy tashabbus: ezgulik ishlari tekshiriladi, ishtirok tasdiqlanadi, ball va sertifikat beriladi.",
    href: "/mehr365",
    wide: true,
  },
  {
    icon: Bot,
    title: "Jaxongir AI",
    text: "Nomzodlar, reyting va ariza jarayoni haqidagi savollarga javob beradigan yordamchi.",
    href: "/ai",
  },
];

const STEPS = [
  { title: "Ariza", text: "Nomzod saytdagi forma orqali ariza qoldiradi." },
  { title: "Biografik anketa", text: "Nomzod 15 ta savolga javob beradi va talabga mos fotosurat taqdim etadi." },
  { title: "Shartlarni qabul qilish", text: "Nomzod ommaviy oferta bilan tanishadi va roziligini yozma tasdiqlaydi." },
  { title: "Tahririyat ishi", text: "Ma’lumotlar ko‘rib chiqiladi, maqola tayyorlanadi va tahrir qilinadi." },
  { title: "Nashr", text: "Ma’lumotlar to‘liq bo‘lsa, maqola kelishuvdan keyingi ish kuni e’lon qilinadi." },
  { title: "Yuritish", text: "Birinchi yil davomida o‘zgartirishlar bepul; murojaat oyiga bir marta qabul qilinadi." },
];

const PRINCIPLES = [
  {
    title: "Tahririyat nazorati",
    text: "Profil, yutuq va faoliyat haqidagi ma’lumotlar e’lon qilinishidan oldin tahririyat tomonidan ko‘rib chiqiladi.",
  },
  {
    title: "Ochiq reyting",
    text: "Reyting qoidalari va og‘irliklari ochiq e’lon qilinadi, har bir qo‘lda tuzatish yozma sabab bilan qayd etiladi. To‘lov reytingdagi o‘rinni kafolatlamaydi.",
  },
  {
    title: "Nomzod javobgarligi",
    text: "Ma’lumotlarning haqqoniyligi uchun ularni taqdim etgan nomzod javob beradi. Shu sababli har bir nomzod shartlarni ongli ravishda qabul qiladi.",
  },
  {
    title: "Ma’lumotlar himoyasi",
    text: "Ma’lumotlar uchinchi shaxslarga sotilmaydi va faqat ensiklopedik, axborotiy va ma’rifiy maqsadlarda ishlatiladi.",
  },
];

const GUARANTEES = [
  {
    title: "Aniq tomon",
    text: "Shartnomaning ikkinchi tomoni — STIR raqami va manzili ma’lum bo‘lgan yuridik shaxs.",
  },
  {
    title: "Yozma shartlar",
    text: "Xizmat, badal, muddat va tomonlarning majburiyatlari ommaviy ofertada ochiq e’lon qilingan.",
  },
  {
    title: "Mustaqil tekshiruv",
    text: "Guvohnoma va tasdiqnomani istalgan kishi davlat tizimlari orqali tekshira oladi.",
  },
];

const DOCUMENTS = [
  { label: "Ommaviy oferta", href: "/ommaviy_ofertasi" },
  { label: "Maxfiylik siyosati", href: "/maxfiylik-siyosati" },
  { label: "Foydalanish shartlari", href: "/foydalanish-shartlari" },
];

export default async function AboutPage() {
  const stats = await getHomepageStats().catch(() => ({
    candidates: 0,
    regions: 0,
    directions: 0,
    podcasts: 0,
    journalIssues: 0,
  }));

  /* Hali to'ldirilmagan bo'lim "0" bo'lib turmasin: raqam faqat bor narsani ko'rsatadi. */
  const figures = [
    { value: stats.candidates, label: "Tasdiqlangan liderlar" },
    { value: stats.regions, label: "Hududlar" },
    { value: stats.directions, label: "Yo‘nalishlar" },
    { value: stats.podcasts, label: "Podcastlar" },
    { value: stats.journalIssues, label: "Jurnal sonlari" },
  ].filter((figure) => figure.value > 0);

  return (
    <div className="bg-paper">
      <DocumentHero
        crumb="Loyiha haqida"
        eyebrow="Loyiha haqida"
        title="O‘zbekiston Lider Yoshlari Ensiklopediyasi"
        lead="Liderlar.uz — mamlakatimizning faol, iqtidorli va yetakchi yoshlari haqidagi ma’lumotlarni bir joyga jamlaydigan raqamli ensiklopediya, reyting platformasi va media markaz."
        aside={
          <div className="rounded-lg border border-white/15 bg-white/[0.07] p-6 backdrop-blur-xl">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-light">
              <FileCheck2 className="h-4 w-4" aria-hidden />
              Yuridik maqom
            </p>
            <p className="mt-3 text-lg font-semibold leading-snug">{LEGAL_ENTITY.shortName}</p>
            <p className="mt-1 text-sm text-white/65">Davlat ro‘yxatidan o‘tgan yuridik shaxs</p>
            <dl className="mt-4 space-y-2 border-t border-white/15 pt-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-white/60">STIR</dt>
                <dd className="font-semibold tabular-nums">{LEGAL_ENTITY.tin}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-white/60">Guvohnoma</dt>
                <dd className="font-semibold tabular-nums">№ {LEGAL_ENTITY.certificateNumber}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-white/60">Berilgan sana</dt>
                <dd className="font-semibold tabular-nums">{LEGAL_ENTITY.registeredOn}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-white/60">Noshirlik tasdiqnomasi</dt>
                <dd className="font-semibold tabular-nums">№ {LEGAL_ENTITY.publishingNoticeNumber}</dd>
              </div>
            </dl>
            <a
              href="#huquqiy-asos"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-light hover:text-white"
            >
              Hujjatlarni ko‘rish
              <ArrowRight className="h-4 w-4" aria-hidden />
            </a>
          </div>
        }
      >
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <LinkButton href="/ariza" size="lg">
            Ariza topshirish
          </LinkButton>
          <LinkButton href="/ommaviy_ofertasi" size="lg" variant="ghost" className="text-white hover:bg-white/10">
            Ommaviy oferta
          </LinkButton>
        </div>
      </DocumentHero>

      <section aria-label="Platforma raqamlarda" className="border-b border-border-soft">
        <dl className="mx-auto flex max-w-6xl flex-wrap gap-x-16 gap-y-8 px-4 py-10 sm:px-6">
          {figures.map((figure) => (
            <div key={figure.label}>
              <dd className="font-display text-4xl font-semibold leading-none text-navy lining-nums sm:text-5xl">
                {formatNumber(figure.value)}
              </dd>
              <dt className="mt-2 text-sm text-ink-soft">{figure.label}</dt>
            </div>
          ))}
        </dl>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14 lg:py-24">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-electric-blue">Maqsad</p>
          <h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-navy sm:text-[2.6rem]">
            Yoshlarning yutug‘i yozib qolinishi kerak
          </h2>
        </div>
        <div className="space-y-5 text-[1.05rem] leading-[1.8] text-ink">
          <p>
            O‘zbekistonda ta’lim, tadbirkorlik, IT, san’at, sport va ijtimoiy faollik sohalarida natija ko‘rsatayotgan
            yoshlar kam emas. Ammo ularning mehnati turli joyga sochilgan: bir qismi ijtimoiy tarmoqlarda, bir qismi
            tadbir hisobotlarida qoladi, ko‘p qismi esa umuman yozilmaydi.
          </p>
          <p>
            Buning oqibati aniq: iqtidorli yoshni topish, faoliyatini tekshirish va u bilan hamkorlik qilish
            qiyinlashadi. Hujjatlashtirilmagan yutuq esa vaqt o‘tib unutiladi.
          </p>
          <p>
            Liderlar.uz shu bo‘shliqni to‘ldiradi. Har bir nomzod haqida tahririyat ko‘rib chiqqan yagona biografik
            maqola yuritiladi. Hamkor, ish beruvchi, jurnalist yoki tengdosh uchun bu — bitta manzilda turgan ochiq
            ma’lumot.
          </p>
          <figure className="border-l-2 border-liderlar-blue pl-5">
            <blockquote className="font-display text-xl leading-snug text-navy sm:text-2xl">
              “Maqola … ensiklopedik, axborotiy va ijtimoiy-ma’rifiy xarakterga ega bo‘ladi.”
            </blockquote>
            <figcaption className="mt-2 text-sm text-ink-soft">Ommaviy oferta shartnomasidan</figcaption>
          </figure>
        </div>
      </section>

      <section className="border-y border-border-soft bg-ice py-16 lg:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-electric-blue">Platforma</p>
          <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold leading-tight text-navy sm:text-[2.6rem]">
            Ensiklopediya, reyting va media bir joyda
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PARTS.map(({ icon: Icon, title, text, href, wide }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "group flex flex-col rounded-md border border-border-soft bg-paper p-6 transition-colors hover:border-liderlar-blue/60",
                  wide && "lg:col-span-2",
                )}
              >
                <span className="flex items-center justify-between">
                  <Icon className="h-5 w-5 text-electric-blue" aria-hidden />
                  <ArrowUpRight
                    className="h-4 w-4 text-ink-soft transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-navy"
                    aria-hidden
                  />
                </span>
                <span className="mt-6 text-lg font-bold text-navy">{title}</span>
                <span className="mt-1.5 text-sm leading-relaxed text-ink-soft">{text}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-electric-blue">Tartib</p>
        <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold leading-tight text-navy sm:text-[2.6rem]">
          Nomzod ensiklopediyaga qanday kiradi
        </h2>
        <ol className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title} className="border-t border-navy/20 pt-4">
              <span className="text-sm font-semibold tabular-nums text-electric-blue">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-2 text-lg font-bold text-navy">{step.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="relative isolate overflow-hidden bg-navy-dark py-16 text-white lg:py-24">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -right-48 -top-40 h-[30rem] w-[30rem] rounded-full bg-electric-blue/30 blur-[140px]" />
        </div>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-light">Tamoyillar</p>
          <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold leading-tight sm:text-[2.6rem]">
            Ishimizga asos bo‘lgan qoidalar
          </h2>
          <div className="mt-10 grid gap-x-12 gap-y-8 sm:grid-cols-2">
            {PRINCIPLES.map((principle) => (
              <div key={principle.title} className="border-t border-white/15 pt-4">
                <h3 className="text-lg font-bold">{principle.title}</h3>
                <p className="mt-1.5 text-[0.95rem] leading-relaxed text-white/70">{principle.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="huquqiy-asos" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6 lg:py-24">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-electric-blue">Huquqiy asos</p>
        <h2 className="mt-3 max-w-3xl font-display text-3xl font-semibold leading-tight text-navy sm:text-[2.6rem]">
          Loyiha davlat ro‘yxatidan o‘tgan yuridik shaxs tasarrufida
        </h2>
        <p className="mt-4 max-w-3xl text-[1.05rem] leading-[1.8] text-ink">
          Liderlar.uz norasmiy tashabbus emas. Loyiha O‘zbekiston Respublikasi qonunchiligiga muvofiq ro‘yxatdan o‘tgan{" "}
          {LEGAL_ENTITY.shortName} tasarrufida ishlaydi. Tashkilotning noshirlik faoliyati haqidagi xabarnomasi vakolatli
          organ tomonidan qabul qilingan va tasdiqnoma bilan rasmiylashtirilgan. Nomzod bilan shartnoma ham shu yuridik
          shaxs nomidan tuziladi.
        </p>

        <div className="mt-10">
          <LegalDocuments />
        </div>

        <div className="mt-14 grid gap-x-10 gap-y-6 border-t border-border-soft pt-8 sm:grid-cols-3">
          {GUARANTEES.map((item) => (
            <div key={item.title}>
              <h3 className="font-bold text-navy">{item.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border-soft bg-ice">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:gap-14">
          <div>
            <h2 className="font-display text-3xl font-semibold leading-tight text-navy">Ensiklopediyaga qo‘shiling</h2>
            <p className="mt-3 max-w-md leading-relaxed text-ink-soft">
              Ariza topshiring. Tahririyatimiz ma’lumotlaringizni ko‘rib chiqadi va keyingi qadamlar haqida xabar beradi.
            </p>
            <LinkButton href="/ariza" size="lg" className="mt-6">
              Ariza topshirish
            </LinkButton>
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-soft">Huquqiy hujjatlar</h2>
            <ul className="mt-3 divide-y divide-border-soft border-y border-border-soft">
              {DOCUMENTS.map((document) => (
                <li key={document.href}>
                  <Link
                    href={document.href}
                    className="flex items-center gap-3 py-3.5 font-semibold text-navy transition-colors hover:text-electric-blue"
                  >
                    <FileText className="h-4 w-4 text-electric-blue" aria-hidden />
                    {document.label}
                    <ArrowRight className="ml-auto h-4 w-4" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
