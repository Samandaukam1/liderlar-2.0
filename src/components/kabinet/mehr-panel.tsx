import Link from "next/link";
import { Heart, Award, TrendingUp, ArrowRight, Plus } from "lucide-react";
import { formatDateUz } from "@/lib/utils";
import {
  MEHR_CATEGORY_LABEL,
  MEHR_ROLE_LABEL,
  type MemberMehrData,
} from "@/lib/mehr/member-types";
import { TelegramLinkButton } from "./telegram-link-button";
import { ActivityRow } from "./activity-row";

/**
 * Kabinetdagi MEHR 365+ bo'limi.
 *
 * HAR BIR SON BAZADAN. Hech qayerda "namuna" qiymat yo'q:
 * ma'lumot bo'lmasa, raqam emas, keyingi qadam ko'rsatiladi.
 */
export function MehrPanel({
  data,
  canCreateActivity,
  botUrl,
}: {
  data: MemberMehrData;
  /** `mehr.activity_creation_enabled` — serverda tekshirilgan. */
  canCreateActivity: boolean;
  botUrl: string | null;
}) {
  const hasAnything = data.totalPoints > 0 || data.activities.length > 0;

  return (
    <section className="rounded-xl border border-brand-soft bg-paper p-6 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-liderlar-blue" aria-hidden />
          <h2 className="font-display text-lg font-bold text-navy">MEHR 365+</h2>
          {/*
            Ommaviy bo'limga havola — foydalanuvchi o'z
            ballarini boshqalarniki bilan solishtira olsin va
            MEHR nima ekanini ko'rsin.
          */}
          <Link
            href="/mehr365"
            className="inline-flex items-center gap-1 text-xs font-semibold text-liderlar-blue hover:underline"
          >
            Bo&apos;limga o&apos;tish
            <ArrowRight className="h-3 w-3" aria-hidden />
          </Link>
        </div>
        <TelegramLinkButton linked={data.telegramLinked} />
      </div>

      {!hasAnything ? (
        <div className="mt-4 rounded-lg border border-dashed border-brand-soft p-5 text-center">
          <p className="text-sm font-semibold text-navy">Hozircha ezgulik ishi yo&apos;q</p>
          <p className="mt-1 text-sm text-ink-soft">
            Tadbirda qatnashing yoki o&apos;zingiz tashkil qiling — ball va sertifikat
            admin tasdig&apos;idan keyin shu yerda paydo bo&apos;ladi.
          </p>
          {!data.telegramLinked && (
            <p className="mt-2 text-xs text-ink-soft">
              Boshlash uchun avval Telegram hisobingizni bog&apos;lang.
            </p>
          )}
        </div>
      ) : (
        <>
          <div className="mt-4 grid gap-3 sm:grid-cols-4">
            <Stat label="Jami ball" value={data.totalPoints} />
            {/*
              REYTING — BALL BO'LSAGINA.

              Ball yo'q odamga "0-o'rin" ko'rsatish ma'nosiz va
              ruhini tushiradi; o'rin faqat u haqiqatan safda
              turgandagina bor.
            */}
            <Stat label="O'rin" value={data.rank} prefix="#" />
            <Stat label="Tashkil qilgan" value={data.organizedCount} />
            <Stat label="Qatnashgan" value={data.participatedCount} />
          </div>

          {data.byCategory.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2">
              {data.byCategory.map((c) => (
                <li
                  key={c.category}
                  className="rounded-md border border-brand-soft px-3 py-1.5 text-xs font-semibold text-navy"
                >
                  {MEHR_CATEGORY_LABEL[c.category] ?? c.category}: {c.points}
                </li>
              ))}
            </ul>
          )}

          {data.activities.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xs font-bold uppercase tracking-wide text-ink-soft">
                Ezgulik ishlarim
              </h3>
              <ul className="mt-2 space-y-2">
                {data.activities.slice(0, 8).map((a) => (
                  <ActivityRow key={a.id} activity={a} />
                ))}
              </ul>
            </div>
          )}

          {/*
            TADBIR OCHISH — FAQAT BAYROQ OCHIQ VA TELEGRAM
            BOG'LANGAN BO'LSA.

            Buzuq tugma ko'rsatish yo'q tugmadan yomonroq:
            bosilganda foydalanuvchi xato oladi va mahsulotni
            ishlamaydi deb biladi.
          */}
          {canCreateActivity && (
            <div className="mt-6 rounded-lg border border-liderlar-blue/30 bg-liderlar-blue/5 p-4">
              <p className="text-sm font-semibold text-navy">Ezgulik ishini boshlash</p>
              <p className="mt-1 text-xs text-ink-soft">
                Tadbir Telegram ilovasi ichida ochiladi: u yerda QR chiqadi va
                ishtirokchilar qayd etiladi.
              </p>

              {data.telegramLinked && botUrl ? (
                <a
                  href={botUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-md bg-liderlar-blue px-4 text-sm font-semibold text-white transition hover:bg-electric-blue"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden />
                  Botda ochish
                </a>
              ) : (
                <p className="mt-2 text-xs font-semibold text-amber-700">
                  Buning uchun avval Telegram hisobingizni bog&apos;lang.
                </p>
              )}
            </div>
          )}

          {data.ledger.length > 0 && (
            <div className="mt-6">
              <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-ink-soft">
                <TrendingUp className="h-3.5 w-3.5" aria-hidden />
                Ball tarixi
              </h3>
              <ul className="mt-2 space-y-1.5">
                {data.ledger.slice(0, 8).map((e, i) => (
                  <li
                    key={`${e.createdAt}-${i}`}
                    className="flex items-baseline justify-between gap-3 text-sm"
                  >
                    <span className="min-w-0 truncate text-ink-soft">
                      {e.activityTitle ?? e.note ?? MEHR_CATEGORY_LABEL[e.category] ?? e.category}
                    </span>
                    <span
                      className={`shrink-0 font-bold tabular-nums ${
                        e.points > 0 ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {e.points > 0 ? "+" : ""}
                      {e.points}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </section>
  );
}

/**
 * Sertifikatlar — kabinet va bot BIR XIL ro'yxatdan o'qiydi.
 *
 * Nusxa ko'chirilmaydi: ikkita ro'yxat bo'lsa, biri bekor
 * qilingan sertifikatni hamon "amalda" deb ko'rsatishi mumkin.
 */
export function CertificatesPanel({ data }: { data: MemberMehrData }) {
  return (
    <section className="rounded-xl border border-brand-soft bg-paper p-6 shadow-card">
      <div className="flex items-center gap-2">
        <Award className="h-5 w-5 text-liderlar-blue" aria-hidden />
        <h2 className="font-display text-lg font-bold text-navy">Sertifikatlarim</h2>
      </div>

      {data.certificates.length === 0 ? (
        <p className="mt-4 text-sm text-ink-soft">
          Hozircha sertifikat yo&apos;q. Sertifikat ezgulik ishi tasdiqlangandan keyin
          avtomatik beriladi.
        </p>
      ) : (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {data.certificates.map((c) => (
            <li
              key={c.code}
              className={`rounded-lg border p-4 ${
                c.status === "revoked"
                  ? "border-rose-200 bg-rose-50/50"
                  : "border-brand-soft"
              }`}
            >
              <p className="font-semibold text-navy">{c.activityTitle ?? "Ezgulik ishi"}</p>
              <p className="mt-0.5 text-xs text-ink-soft">
                {MEHR_ROLE_LABEL[c.role ?? ""] ?? "Ishtirokchi"} · {formatDateUz(c.issuedAt)}
              </p>

              {c.status === "revoked" ? (
                <p className="mt-2 text-xs font-bold text-rose-600">Bekor qilingan</p>
              ) : (
                <Link
                  href={`/mehr365/sertifikat/${c.code}`}
                  className="mt-2 inline-block text-xs font-semibold text-liderlar-blue hover:underline"
                >
                  Tekshirish sahifasi →
                </Link>
              )}

              <p className="mt-1 font-mono text-[11px] tracking-wider text-ink-soft">{c.code}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Stat({
  label,
  value,
  prefix,
}: {
  label: string;
  value: number | null;
  prefix?: string;
}) {
  return (
    <div className="rounded-lg border border-brand-soft px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">{label}</p>
      <p className="mt-0.5 text-xl font-bold tabular-nums text-navy">
        {value === null ? "—" : `${prefix ?? ""}${value.toLocaleString("uz-UZ")}`}
      </p>
    </div>
  );
}
