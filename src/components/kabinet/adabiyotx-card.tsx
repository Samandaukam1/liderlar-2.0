"use client";

import { useEffect, useState, useTransition } from "react";
import { BookOpen, Check, Link2Off, QrCode, RefreshCw, Smartphone } from "lucide-react";
import {
  createAdabiyotXLink,
  refreshAdabiyotXLibrary,
  unlinkAdabiyotX,
  type AdabiyotXLinkIssue,
} from "@/app/kabinet/adabiyotx/actions";
import type { CabinetAdabiyotX } from "@/lib/kabinet/cabinet-data";

const card = "rounded-3xl border border-brand-soft bg-white p-5 shadow-card";

function remainingLabel(expiresAt: string, now: number): string {
  const left = Math.max(0, Math.round((new Date(expiresAt).getTime() - now) / 1000));
  const m = Math.floor(left / 60);
  const s = left % 60;
  return left === 0 ? "muddati tugadi" : `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * AdabiyotX HISOBI — kabinet kartasi.
 *
 * Bog'lanmagan: "Bog'lash" bosilganda QR + 8 belgili kod + shu telefon
 * uchun havola chiqadi (kod BOSILGANDA yaratiladi, sahifa ochilganda
 * emas — Telegram kartasi bilan bir xil sabab). Bog'langan: AdabiyotX
 * nomi, o'qilgan kitoblar va ball, "Yangilash" va "Uzish".
 */
export function AdabiyotXCard({ data }: { data: CabinetAdabiyotX }) {
  const [pending, startTransition] = useTransition();
  const [issue, setIssue] = useState<Extract<AdabiyotXLinkIssue, { ok: true }> | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!issue) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [issue]);

  const run = (action: () => Promise<{ ok: true; message: string } | { ok: false; error: string }>) =>
    startTransition(async () => {
      setError(null);
      setMessage(null);
      const result = await action();
      if (result.ok) setMessage(result.message);
      else setError(result.error);
    });

  return (
    <section className={card}>
      <h2 className="flex items-center gap-2 font-semibold text-navy">
        <BookOpen className="h-5 w-5 text-liderlar-blue" aria-hidden />
        AdabiyotX
      </h2>

      {data.linked ? (
        <>
          <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
            <Check className="h-4 w-4" aria-hidden />
            Bog&apos;langan{data.fullName ? `: ${data.fullName}` : ""}
            {data.username ? <span className="font-normal text-ink-soft">@{data.username}</span> : null}
          </p>
          <p className="mt-2 text-sm text-ink-soft">
            AdabiyotX&apos;da kitob o&apos;qib bo&apos;lib 10 savollik testdan o&apos;tsangiz, kitob biografiyangizga tushadi va har to&apos;g&apos;ri javob
            reytingga 1 ball qo&apos;shadi.
          </p>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-2xl bg-paper px-3 py-2">
              <dt className="text-[0.68rem] font-bold uppercase tracking-wide text-ink-soft">O&apos;qilgan kitoblar</dt>
              <dd className="mt-0.5 font-semibold text-navy">{data.readCount} ta</dd>
            </div>
            <div className="rounded-2xl bg-paper px-3 py-2">
              <dt className="text-[0.68rem] font-bold uppercase tracking-wide text-ink-soft">Testlardan ball</dt>
              <dd className="mt-0.5 font-semibold text-navy">{data.points} ball</dd>
            </div>
          </dl>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={() => run(refreshAdabiyotXLibrary)}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-brand-soft px-4 text-sm font-semibold text-navy transition hover:border-liderlar-blue hover:text-liderlar-blue disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${pending ? "animate-spin" : ""}`} aria-hidden />
              Kitoblarni yangilash
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                if (!window.confirm("AdabiyotX hisobi uzilsinmi? Yig'ilgan ballar va o'qilgan kitoblar saqlanib qoladi.")) return;
                run(unlinkAdabiyotX);
              }}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-full px-4 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
            >
              <Link2Off className="h-4 w-4" aria-hidden />
              Uzish
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="mt-2 text-sm text-ink-soft">
            AdabiyotX ilovasini ulang: o&apos;qib tugatgan kitoblaringiz biografiyangizda chiqadi, har kitob testidagi to&apos;g&apos;ri javob
            reytingga 1 ball beradi, muallif sifatida biriktirilgan kitoblaringiz esa &quot;Ijodiy ishlari&quot;da ko&apos;rinadi.
          </p>
          {!issue ? (
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  setError(null);
                  const result = await createAdabiyotXLink();
                  if (result.ok) {
                    setIssue(result);
                    setNow(Date.now());
                  } else setError(result.error);
                })
              }
              className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full bg-liderlar-blue px-5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              <QrCode className="h-4 w-4" aria-hidden />
              {pending ? "Kod tayyorlanmoqda…" : "AdabiyotX bilan bog'lash"}
            </button>
          ) : (
            <div className="mt-4 rounded-2xl border border-liderlar-blue/30 bg-liderlar-blue/5 p-4">
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={issue.qrDataUrl} alt="AdabiyotX bog'lash QR kodi" width={180} height={180} className="h-44 w-44 rounded-xl bg-white p-2" />
                <div className="min-w-0 flex-1 text-sm">
                  <p className="font-semibold text-navy">AdabiyotX ilovasida skaner qiling</p>
                  <ol className="mt-2 list-decimal space-y-1 pl-5 text-ink-soft">
                    <li>Telefonda AdabiyotX ilovasini oching.</li>
                    <li>Sozlamalar → &quot;liderlar.uz bilan bog&apos;lash&quot;.</li>
                    <li>QR kodni skaner qiling yoki kodni kiriting.</li>
                  </ol>
                  <p className="mt-3 text-[0.68rem] font-bold uppercase tracking-wide text-ink-soft">Qo&apos;lda kiritish kodi</p>
                  <p className="mt-1 font-mono text-2xl font-bold tracking-[0.2em] text-navy">{issue.code}</p>
                  <a
                    href={issue.appLink}
                    className="mt-3 inline-flex min-h-10 items-center gap-1.5 rounded-full border border-brand-soft bg-white px-4 text-sm font-semibold text-navy transition hover:border-liderlar-blue hover:text-liderlar-blue"
                  >
                    <Smartphone className="h-4 w-4" aria-hidden />
                    Shu telefonda ilovani ochish
                  </a>
                  <p className="mt-2 text-xs text-ink-soft">
                    Kod {remainingLabel(issue.expiresAt, now)} amal qiladi va bir marta ishlaydi. Bog&apos;langach sahifani yangilang.
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {message && <p className="mt-3 text-sm font-semibold text-emerald-600">{message}</p>}
      {error && <p className="mt-3 text-sm font-semibold text-rose-600">{error}</p>}
    </section>
  );
}
