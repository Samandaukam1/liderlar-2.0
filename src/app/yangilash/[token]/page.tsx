import type { Metadata } from "next";
import { ShieldAlert } from "lucide-react";
import { createHash } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { MonthlyUpdateForm } from "@/components/forms/monthly-update-form";

export const metadata: Metadata = {
  title: "Oylik ma'lumot yangilash",
  robots: { index: false, follow: false },
};

export default async function MonthlyUpdateTokenPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const admin = createAdminClient();
  const tokenHash = createHash("sha256").update(token).digest("hex");

  const { data: verified } = await admin
    .rpc("verify_update_token", { p_token_hash: tokenHash })
    .maybeSingle();

  if (!verified) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-coral/15 text-coral">
          <ShieldAlert className="h-8 w-8" aria-hidden />
        </span>
        <h1 className="mt-4 font-display text-2xl font-bold text-navy">Havola yaroqsiz yoki muddati tugagan</h1>
        <p className="mt-2 text-ink-soft">
          Ushbu oylik yangilanish havolasi endi amal qilmaydi. Yangi havola olish uchun tahririyat bilan
          bog&apos;laning.
        </p>
      </div>
    );
  }

  const name =
    (verified as { candidate_name?: string }).candidate_name?.trim() || "Nomzod";

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-navy sm:text-4xl">Oylik ma&apos;lumot yangilash</h1>
      <p className="mt-2 text-ink-soft">
        Salom, {name}! Shu oy davomida erishgan yutuqlaringiz, o&apos;qigan kitoblaringiz va boshqa
        faoliyatingizni quyidagi forma orqali yuboring.
      </p>
      <MonthlyUpdateForm token={token} />
    </div>
  );
}
