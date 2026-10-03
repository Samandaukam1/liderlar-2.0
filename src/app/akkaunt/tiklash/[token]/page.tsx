import type { Metadata } from "next";
import Link from "next/link";
import { KeyRound, AlertCircle } from "lucide-react";
import { inspectRecovery, recoveryFailureText } from "@/lib/accounts/recovery-service";
import { RecoveryForm } from "./recovery-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Parolni tiklash",
  /*
   * Manzilda token bor: sahifa qidiruvga tushmasin va boshqa saytga
   * o'tganda `Referer` sarlavhasi orqali tarqalmasin.
   */
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

type Props = { params: Promise<{ token: string }> };

/**
 * Parolni tiklash — administrator Telegram orqali yuborgan havola.
 *
 * A'zo bu yerda YANGI parolni O'ZI qo'yadi. Administrator uni ko'rmaydi
 * va ko'ra olmaydi. Yangi hisob yoki profil yaratilmaydi — mavjud
 * hisobning paroli almashadi.
 */
export default async function RecoveryPage({ params }: Props) {
  const { token } = await params;
  const raw = decodeURIComponent(token);
  const inspected = await inspectRecovery(raw);

  // Yaroqsiz havola hech qanday ma'lumot (ism, login) bermaydi.
  if (!inspected.ok) return <Failure message={recoveryFailureText(inspected.reason)} />;

  const { target } = inspected;

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <div className="rounded-2xl border border-brand-soft bg-paper p-8 shadow-card">
        <div className="flex items-center gap-2 text-liderlar-blue">
          <KeyRound className="h-5 w-5" aria-hidden />
          <span className="text-xs font-bold uppercase tracking-wide">Parolni tiklash</span>
        </div>

        <h1 className="mt-4 font-display text-xl font-bold text-navy">{target.fullName}</h1>

        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          Yangi parolni <strong>o&apos;zingiz</strong> tanlang. U <strong>faqat sizda</strong>{" "}
          qoladi — Liderlar administratorlari uni ko&apos;ra olmaydi. Profilingiz, maqolalaringiz
          va ballaringiz o&apos;zgarmaydi.
        </p>

        <ul className="mt-3 space-y-1 text-xs text-ink-soft">
          <li>• Havola bir marta ishlaydi.</li>
          <li>• Parol saqlangach, boshqa qurilmalardagi kirishlar yopiladi.</li>
        </ul>

        <div className="mt-6">
          <RecoveryForm token={raw} loginHint={target.loginHint} />
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
          <Link href="/kirish" className="rounded-md bg-liderlar-blue px-4 py-2 text-sm font-semibold text-white">
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
