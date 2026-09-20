import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, QrCode, FileCheck2, Award, ArrowRight } from "lucide-react";
import { getMehrFlags } from "@/lib/mehr/flags";
import { loadMehrPublicStats, loadRecentApprovedActivities } from "@/lib/mehr/public-stats";
import { MEHR_COLORS, MEHR_GRADIENT } from "@/lib/mehr/brand";
import { MehrClosed } from "@/components/mehr/mehr-closed";
import { MehrHeroVisual, CountUp } from "@/components/mehr/mehr-hero";
import { ActivityCard } from "@/components/mehr/activity-card";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "MEHR 365+ — Har bir ezgulik iz qoldiradi",
  description:
    "MEHR 365+ — Liderlar.uz ijtimoiy tashabbusi. Ezgulik ishlari tekshiriladi, " +
    "ishtirok tasdiqlanadi, ball va sertifikat beriladi.",
  alternates: { canonical: "/mehr365" },
  openGraph: {
    title: "MEHR 365+ — Har bir ezgulik iz qoldiradi",
    description: "Tasdiqlangan ezgulik ishlari, volontyorlar va reyting.",
    url: "/mehr365",
    type: "website",
  },
};

/**
 * MEHR 365+ bosh sahifasi.
 *
 * BARCHA SONLAR BAZADAN. Hech qayerda "namuna" qiymat yo'q.
 * Ma'lumot bo'lmasa, nol ko'rsatiladi — nol ham haqiqat, va
 * uni chiroyli raqamga almashtirish butun tizimning
 * ishonchini yo'q qilardi.
 */
export default async function MehrHomePage() {
  const flags = await getMehrFlags();
  if (!flags.publicEnabled) return <MehrClosed />;

  const [stats, activities] = await Promise.all([
    loadMehrPublicStats(),
    loadRecentApprovedActivities(6),
  ]);

  return (
    <>
      {/* ---------- HERO ---------- */}
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-14 sm:px-6 sm:pt-20">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <span
              className="inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider text-white"
              style={{ background: MEHR_COLORS.green }}
            >
              Liderlar.uz tashabbusi
            </span>

            <h1
              className="mt-5 font-display text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl"
              style={{ color: MEHR_COLORS.ink }}
            >
              Har bir ezgulik —{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: MEHR_GRADIENT }}
              >
                iz qoldiradi
              </span>
            </h1>

            <p
              className="mt-5 max-w-lg text-base leading-relaxed sm:text-lg"
              style={{ color: MEHR_COLORS.inkSoft }}
            >
              MEHR 365+ da qilingan ish shunchaki aytilmaydi — u tekshiriladi.
              Ishtirok QR orqali tasdiqlanadi, dalillar ko&apos;rib chiqiladi va
              faqat shundan keyin ball, sertifikat va reytingdagi o&apos;rin beriladi.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/mehr365/ezgulik-ishlari"
                className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-white transition hover:opacity-90"
                style={{ background: MEHR_COLORS.blue }}
              >
                Ezgulik ishlarini ko&apos;rish
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/mehr365/haqida"
                className="inline-flex items-center rounded-full border px-5 py-3 text-sm font-bold transition hover:bg-white"
                style={{ borderColor: MEHR_COLORS.border, color: MEHR_COLORS.ink }}
              >
                MEHR qanday ishlaydi?
              </Link>
            </div>
          </div>

          <MehrHeroVisual />
        </div>
      </section>

      {/* ---------- SONLAR ---------- */}
      {stats && (
        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
          <div
            className="grid gap-px overflow-hidden rounded-2xl border sm:grid-cols-2 lg:grid-cols-4"
            style={{ borderColor: MEHR_COLORS.border, background: MEHR_COLORS.border }}
          >
            <Stat
              label="Volontyorlar"
              value={stats.volunteers}
              hint="tasdiqlangan faoliyati bor"
            />
            <Stat
              label="Ezgulik ishlari"
              value={stats.approvedActivities}
              hint="tekshiruvdan o'tgan"
            />
            <Stat label="Sertifikatlar" value={stats.certificates} hint="amaldagi" />
            <Stat label="Tasdiqlangan ballar" value={stats.totalPoints} hint="ball daftaridan" />
          </div>

          {/*
            NOL — YASHIRILMAYDI.

            Tizim yangi bo'lsa, sonlar nol bo'lishi tabiiy.
            Ularni chiroyli raqamga almashtirish bir marta
            ishlaydi, keyin esa butun tizimning ishonchini
            yo'q qiladi.
          */}
          {stats.approvedActivities === 0 && (
            <p className="mt-4 text-center text-sm" style={{ color: MEHR_COLORS.inkSoft }}>
              MEHR 365+ endi ishga tushdi. Birinchi tasdiqlangan ezgulik ishlari tez orada
              shu yerda paydo bo&apos;ladi.
            </p>
          )}
        </section>
      )}

      {/* ---------- QANDAY ISHLAYDI ---------- */}
      <section className="border-y bg-white py-20" style={{ borderColor: MEHR_COLORS.border }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2
            className="font-display text-3xl font-bold tracking-tight sm:text-4xl"
            style={{ color: MEHR_COLORS.ink }}
          >
            Ezgulik qanday qayd etiladi?
          </h2>
          <p className="mt-3 max-w-xl text-sm sm:text-base" style={{ color: MEHR_COLORS.inkSoft }}>
            Har bir qadam tekshiriladi. Ball tasdiqdan oldin berilmaydi.
          </p>

          <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Step
              n={1}
              icon={QrCode}
              title="Ishtirok QR bilan qayd etiladi"
              text="Tadbir joyida tashkilotchi QR ko'rsatadi. U qisqa muddatda yangilanadi, shuning uchun uni oldindan tarqatib bo'lmaydi."
            />
            <Step
              n={2}
              icon={FileCheck2}
              title="Tashkilotchi dalil yuboradi"
              text="Tadbirdan keyin rasmlar, tavsif va natija yuboriladi — bularsiz ish tekshiruvga kirmaydi."
            />
            <Step
              n={3}
              icon={ShieldCheck}
              title="Admin tekshiradi"
              text="Ishtirok, dalil va tashkilotchining avvalgi tarixi ko'rib chiqiladi. Rad etish sababsiz bo'lmaydi."
            />
            <Step
              n={4}
              icon={Award}
              title="Ball va sertifikat"
              text="Tasdiqdan keyin ball o'zgarmas daftarga tushadi, sertifikat beriladi va reyting yangilanadi."
            />
          </ol>
        </div>
      </section>

      {/* ---------- ISHONCH ZANJIRI ---------- */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div
            className="overflow-hidden rounded-3xl p-8 sm:p-12"
            style={{ background: MEHR_COLORS.ink }}
          >
            <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
              Nega MEHR ballariga ishonish mumkin?
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">
              Ball tugma bosilgani uchun emas, qilingan ish tasdiqlangani uchun beriladi.
              Zanjirning birorta bo&apos;g&apos;ini tashlab ketilmaydi.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-3">
              {[
                "Haqiqiy odam",
                "Haqiqiy tadbir",
                "Tasdiqlangan ishtirok",
                "Dalil",
                "Admin tasdig'i",
                "O'zgarmas ball daftari",
                "Sertifikat",
                "Reyting",
              ].map((item, i, all) => (
                <span key={item} className="flex items-center gap-3">
                  <span className="rounded-full bg-white/10 px-3.5 py-2 text-xs font-semibold text-white sm:text-sm">
                    {item}
                  </span>
                  {i < all.length - 1 && (
                    <ArrowRight className="h-3.5 w-3.5 text-white/30" aria-hidden />
                  )}
                </span>
              ))}
            </div>

            <p className="mt-8 max-w-2xl text-xs leading-relaxed text-white/50">
              Ball daftari o&apos;zgarmas: yozuvni tahrirlab yoki o&apos;chirib bo&apos;lmaydi.
              Xato bo&apos;lsa, ustiga ko&apos;rinadigan tuzatuvchi yozuv qo&apos;shiladi.
            </p>
          </div>
        </div>
      </section>

      {/* ---------- OXIRGI ISHLAR ---------- */}
      {activities.length > 0 && (
        <section className="pb-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2
                className="font-display text-3xl font-bold tracking-tight"
                style={{ color: MEHR_COLORS.ink }}
              >
                Oxirgi ezgulik ishlari
              </h2>
              <Link
                href="/mehr365/ezgulik-ishlari"
                className="text-sm font-bold"
                style={{ color: MEHR_COLORS.blue }}
              >
                Hammasi →
              </Link>
            </div>

            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {activities.map((a) => (
                <ActivityCard key={a.id} activity={a} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

function Stat({ label, value, hint }: { label: string; value: number; hint: string }) {
  return (
    <div className="bg-white p-6">
      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: MEHR_COLORS.inkSoft }}>
        {label}
      </p>
      <p className="mt-1.5 font-display text-3xl font-bold sm:text-4xl">
        <CountUp value={value} />
      </p>
      <p className="mt-0.5 text-xs" style={{ color: MEHR_COLORS.inkSoft }}>
        {hint}
      </p>
    </div>
  );
}

function Step({
  n,
  icon: Icon,
  title,
  text,
}: {
  n: number;
  icon: typeof QrCode;
  title: string;
  text: string;
}) {
  return (
    <li
      className="rounded-2xl border p-6"
      style={{ borderColor: MEHR_COLORS.border, background: MEHR_COLORS.surfaceSoft }}
    >
      <div className="flex items-center gap-3">
        <span
          className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white"
          style={{ background: MEHR_COLORS.blue }}
        >
          {n}
        </span>
        <Icon className="h-5 w-5" style={{ color: MEHR_COLORS.inkSoft }} aria-hidden />
      </div>
      <h3 className="mt-4 font-display text-base font-bold" style={{ color: MEHR_COLORS.ink }}>
        {title}
      </h3>
      <p className="mt-1.5 text-sm leading-relaxed" style={{ color: MEHR_COLORS.inkSoft }}>
        {text}
      </p>
    </li>
  );
}
