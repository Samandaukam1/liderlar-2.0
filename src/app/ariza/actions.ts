"use server";

import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { applicationSchema } from "@/lib/validation/application";

export type SubmitResult = { ok: true } | { ok: false; error: string };

export async function submitApplication(input: unknown): Promise<SubmitResult> {
  const parsed = applicationSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Formada xatolik bor." };
  }

  const { fullName, phone, telegram, gender, ageRange, promoCode } = parsed.data;

  const supabase = await createServerSupabase();
  const { error } = await supabase.from("applications").insert({
    full_name: fullName,
    phone,
    telegram,
    gender,
    age_range: ageRange,
    promo_code: promoCode || null,
    status: "new",
  });

  if (error) {
    console.error("Application submit error:", error);
    return { ok: false, error: "Arizani yuborishda xatolik yuz berdi. Birozdan so'ng qayta urinib ko'ring." };
  }

  return { ok: true };
}
