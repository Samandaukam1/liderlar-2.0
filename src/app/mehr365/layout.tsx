import type { ReactNode } from "react";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { getMehrLogoUrl } from "@/lib/mehr/settings";
import { MehrShell } from "@/components/mehr/mehr-shell";

/**
 * MEHR 365+ qobig'i.
 *
 * BAYROQ TEKSHIRUVI BU YERDA EMAS — ataylab.
 *
 * `/mehr365/sertifikat/[code]` ham shu qobiq ichida va u
 * BAYROQDAN QAT'I NAZAR ishlashi kerak: QR kodlar allaqachon
 * chop etilgan bo'lishi mumkin va bayroq o'chirilgani uchun
 * haqiqiy sertifikat "tekshirib bo'lmadi" ga aylanishi
 * mumkin emas.
 *
 * Shuning uchun har bir ommaviy sahifa bayroqni O'ZI
 * tekshiradi (`mehrPublicGate`), tekshiruv sahifasi esa
 * tekshirmaydi.
 */
export default async function Mehr365Layout({ children }: { children: ReactNode }) {
  const supabase = await createServerSupabase();
  const [{ data }, logoUrl] = await Promise.all([
    supabase.auth.getUser(),
    getMehrLogoUrl(),
  ]);

  return (
    <MehrShell logoUrl={logoUrl} signedIn={Boolean(data.user)}>
      {children}
    </MehrShell>
  );
}
