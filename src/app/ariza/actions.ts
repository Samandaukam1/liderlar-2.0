"use server";

import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { applicationSchema } from "@/lib/validation/application";
import { checkPromoCodeUsable } from "@/lib/promo/expiry-check";

export type SubmitResult =
  | { ok: true }
  /** `field` berilsa, xabar aynan shu maydonda ko'rsatiladi. */
  | { ok: false; error: string; field?: "promoCode" };

export async function submitApplication(input: unknown): Promise<SubmitResult> {
  const parsed = applicationSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Formada xatolik bor." };
  }

  const { fullName, phone, telegram, gender, ageRange, regionId, promoCode } = parsed.data;

  // Ikkala yuborish yo'li ham bir xil tekshiruvdan o'tadi.
  const promoCheck = await checkPromoCodeUsable(promoCode);
  if (promoCheck.error) return { ok: false, error: promoCheck.error, field: "promoCode" };

  const supabase = await createServerSupabase();
  const { error } = await supabase.from("applications").insert({
    full_name: fullName,
    phone,
    telegram,
    gender,
    age_range: ageRange,
    region_id: regionId,
    promo_code: promoCode || null,
    status: "new",
  });

  if (error) {
    console.error("Application submit error:", error);
    return { ok: false, error: "Arizani yuborishda xatolik yuz berdi. Birozdan so'ng qayta urinib ko'ring." };
  }

  return { ok: true };
}
