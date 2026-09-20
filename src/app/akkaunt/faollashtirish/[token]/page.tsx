import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, AlertCircle } from "lucide-react";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { inspectActivation, isActivationEnabled } from "@/lib/accounts/activation-service";
import { ACTIVATION_FAILURE_TEXT } from "@/lib/accounts/activation-token";
import { ActivationForm } from "./activation-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Akkauntni faollashtirish",
  /*
   * Havola tokenni o'z ichiga oladi — bu sahifa qidiruvga
   * tushmasligi va referrer orqali tarqamasligi kerak.
   */
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ token: string }> };

/**
 * Akkauntni faollashtirish.
 *
 * Nomzod bu yerda O'Z parolini qo'yadi. Administrator uni
 * ko'rmaydi va ko'ra olmaydi — sahifa parolni serverga
 * to'g'ridan-to'g'ri Supabase Auth'ga uzatadi.
 */
export default async function ActivationPage({ params }: Props) {
  const { token } = await params;
  const raw = decodeURIComponent(token);

  const [enabled, inspected] = await Promise.all([
    isActivationEnabled(),
    inspectActivation(raw),
  ]);

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!enabled) {
    return <Failure message={ACTIVATION_FAILURE_TEXT.disabled} />;
  }

  /*
   * YAROQSIZ HAVOLA HECH QANDAY MA'LUMOT BERMAYDI.
   *
   * Nomzodning ismi ham, rasmi ham ko'rsatilmaydi — aks holda
   * havolalarni taxmin qilib, kim kim ekanini bilib olish
   * mumkin bo'lardi.
   */
  if (!inspected.ok) {
    return <Failure message={ACTIVATION_FAILURE_TEXT[inspected.reason]} />;
  }

  const { target } = inspected;

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <div className="rounded-2xl border border-brand-soft bg-paper p-8 shadow-card">
        <div className="flex items-center gap-2 text-liderlar-blue">
          <ShieldCheck className="h-5 w-5" aria-hidden />
          <span className="text-xs font-bold uppercase tracking-wide">Akkauntni faollashtirish</span>
        </div>

        <div className="mt-5 flex items-center gap-4">
          {target.avatarUrl ? (
            <Image
              src={target.avatarUrl}
              alt=""
              width={64}
              height={64}
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full bg-liderlar-blue/10 text-xl font-bold text-liderlar-blue"
              aria-hidden
            >
              {target.fullName.charAt(0)}
            </div>
          )}

          <div className="min-w-0">
            <h1 className="font-display text-xl font-bold text-navy">{target.fullName}</h1>
            {target.regionName && <p className="text-sm text-ink-soft">{target.regionName}</p>}
            {target.isPublished && target.slug && (
              <Link
                href={`/liderlar/${target.slug}`}
                className="text-sm font-semibold text-liderlar-blue hover:underline"
              >
                Ensiklopediyadagi profilingiz →
              </Link>
            )}
          </div>
        </div>

        <p className="mt-5 text-sm leading-relaxed text-ink-soft">
          Siz Liderlar.uz ensiklopediyasidagi profilingiz uchun shaxsiy akkauntni
          faollashtirmoqdasiz. Parolni <strong>o&apos;zingiz</strong> tanlaysiz va u{" "}
          <strong>faqat sizda</strong> qoladi — Liderlar administratorlari uni ko&apos;ra
          olmaydi.
        </p>

        <ul className="mt-3 space-y-1 text-xs text-ink-soft">
          <li>• Yangi nomzod sahifasi yaratilmaydi — mavjud profilingiz o&apos;zgarmaydi.</li>
          <li>• Telegramni keyinroq, kabinetdan ulashingiz mumkin.</li>
          <li>• MEHR 365+ imkoniyatlari bosqichma-bosqich ochiladi.</li>
        </ul>

        <div className="mt-6">
          <ActivationForm
            token={raw}
            signedIn={Boolean(user)}
            signedInEmail={user?.email ?? null}
          />
        </div>
      </div>
    </div>
  );
}

function Failure({ message }: { message: string }) {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
      <div className="rounded-2xl border border-amber-300 bg-amber-50 p-8 text-center">
        <AlertCircle className="mx-auto h-10 w-10 text-amber-600" aria-hidden />
        <h1 className="mt-3 font-display text-xl font-bold text-navy">Havola ishlamadi</h1>
        <p className="mt-2 text-sm text-ink-soft">{message}</p>

        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Link
            href="/kirish"
            className="rounded-md bg-liderlar-blue px-4 py-2 text-sm font-semibold text-white"
          >
            Kirish
          </Link>
          <Link
            href="/"
            className="rounded-md border border-brand-soft px-4 py-2 text-sm font-semibold text-navy"
          >
            Bosh sahifa
          </Link>
        </div>
      </div>
    </div>
  );
}
