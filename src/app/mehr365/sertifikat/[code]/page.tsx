import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, ShieldX, SearchX } from "lucide-react";
import { verifyCertificate } from "@/lib/mehr/certificate-verify";
import { formatDateUz } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ code: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  return {
    title: `Sertifikat ${code} — MEHR 365+`,
    description: "MEHR 365+ sertifikatining haqiqiyligini tekshirish.",
    // Har bir sertifikat sahifasi qidiruvga tushmasligi kerak:
    // ular shaxsga oid va indekslash uchun mo'ljallanmagan.
    robots: { index: false, follow: false },
  };
}

/**
 * Ommaviy sertifikat tekshiruvi.
 *
 * Bu sahifa QR skanerlagan odam uchun. Shuning uchun javob
 * ekranning eng tepasida, bitta so'z bilan ko'rinadi —
 * tafsilot pastda.
 */
export default async function CertificatePage({ params }: Props) {
  const { code } = await params;
  const result = await verifyCertificate(decodeURIComponent(code));

  const theme = {
    valid: {
      icon: BadgeCheck,
      title: "Sertifikat haqiqiy",
      wrap: "border-emerald-300 bg-emerald-50",
      text: "text-emerald-700",
    },
    revoked: {
      icon: ShieldX,
      title: "Sertifikat bekor qilingan",
      wrap: "border-rose-300 bg-rose-50",
      text: "text-rose-700",
    },
    not_found: {
      icon: SearchX,
      title: "Sertifikat topilmadi",
      wrap: "border-slate-300 bg-slate-50",
      text: "text-slate-700",
    },
  }[result.state];

  const Icon = theme.icon;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="mb-6 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink-soft">MEHR 365+</p>
        <p className="mt-1 text-sm text-ink-soft">Sertifikat tekshiruvi</p>
      </div>

      <div className={`rounded-2xl border-2 p-6 text-center ${theme.wrap}`}>
        <Icon className={`mx-auto h-12 w-12 ${theme.text}`} aria-hidden />
        <h1 className={`mt-3 font-display text-2xl font-bold ${theme.text}`}>{theme.title}</h1>

        {/*
          BEKOR QILINGAN SERTIFIKAT YASHIRILMAYDI.

          "Topilmadi" deyish soxta sertifikat bilan bekor
          qilinganni bir xil ko'rsatardi — tekshiruvchi uchun
          esa bu ikki butunlay boshqa javob.
        */}
        {result.state === "revoked" && result.revokedReason && (
          <p className="mt-2 text-sm text-rose-700">Sabab: {result.revokedReason}</p>
        )}

        {result.state === "not_found" && (
          <p className="mt-2 text-sm text-slate-600">
            Bu kod bo&apos;yicha sertifikat mavjud emas. Kodni qaytadan tekshiring.
          </p>
        )}
      </div>

      {result.state !== "not_found" && (
        <dl className="mt-6 divide-y divide-brand-soft rounded-2xl border border-brand-soft bg-paper">
          <Row label="Egasi" value={result.recipientName} />
          <Row label="Roli" value={result.roleLabel} />
          <Row label="Ezgulik ishi" value={result.activityTitle} />
          <Row label="Hudud" value={result.regionName} />
          <Row
            label="Tadbir sanasi"
            value={result.activityDate ? formatDateUz(result.activityDate) : null}
          />
          <Row
            label="Berilgan sana"
            value={result.issuedAt ? formatDateUz(result.issuedAt) : null}
          />
          {/*
            Ball DAFTARDAN o'qiladi. Teskari yozuv qilingan
            bo'lsa, bu yerda ham kamaygan holda ko'rinadi —
            sertifikatda qotib qolgan raqam bo'lsa, ikkisi
            bir-biriga zid bo'lardi.
          */}
          <Row label="Ball" value={result.points !== null ? `${result.points}` : null} />
          <Row label="Sertifikat kodi" value={result.code} mono />
        </dl>
      )}

      {result.activitySlug && result.state === "valid" && (
        <div className="mt-6 text-center">
          <Link
            href={`/mehr365/ezgulik/${result.activitySlug}`}
            className="text-sm font-semibold text-liderlar-blue hover:underline"
          >
            Ezgulik ishi haqida batafsil →
          </Link>
        </div>
      )}

      <p className="mt-8 text-center text-xs text-ink-soft">
        Bu sahifa Liderlar ensiklopediyasining MEHR 365+ tizimi tomonidan yaratilgan.
      </p>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string | null;
  mono?: boolean;
}) {
  // Ma'lumot yo'q bo'lsa, qator umuman ko'rsatilmaydi —
  // bo'sh "—" lar ro'yxatni o'qib bo'lmas holga keltiradi.
  if (!value) return null;

  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 px-5 py-3">
      <dt className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{label}</dt>
      <dd className={`text-sm font-semibold text-ink ${mono ? "font-mono tracking-wider" : ""}`}>
        {value}
      </dd>
    </div>
  );
}
