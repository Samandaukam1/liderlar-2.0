"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { applicationSchema } from "@/lib/validation/application";
import { checkPromoCodeUsable } from "@/lib/promo/expiry-check";
import {
  checkPromoGate,
  classifyPromoCode,
  recordApplicationReferral,
} from "@/lib/referral/application-hook";

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


  /*
   * SHAXSIY TAVSIYA KODI — KOORDINATOR KODIDAN AJRATILADI.
   *
   * Tur aniqlanadi va faqat shaxsiy kod atributsiya beradi. Shaxsiy
   * kod tekin qabul yo'liga HECH QACHON tushmaydi.
   */
  const promoKind = await classifyPromoCode(promoCode);
  const gate = await checkPromoGate(promoCode, promoKind);
  if (!gate.ok) {
    return { ok: false, error: gate.error, field: gate.field };
  }

  /*
   * SERVICE ROLE BILAN — `/api/application/submit` dagi kabi.
   *
   * Atributsiya uchun ariza id si kerak (`.select("id")`). Anonim rol
   * bilan `insert ... returning` RLS'da yiqiladi: `applications`
   * jadvalini anonim O'QIY OLMAYDI (faqat yozadi) va Postgres qaytarilgan
   * qatorga ham o'qish siyosatini qo'llaydi — natijada HAR BIR ariza
   * "xatolik yuz berdi" bilan rad etilardi. Maydonlar yuqorida sxema
   * bilan tekshirilgan va `status` shu yerda qat'iy.
   */
  const supabase = createAdminClient();
  const { data: created, error } = await supabase.from("applications").insert({
    full_name: fullName,
    phone,
    telegram,
    gender,
    age_range: ageRange,
    region_id: regionId,
    promo_code: promoCode || null,
    status: "new",
  })
    .select("id")
    .single();

  if (error || !created) {
    console.error("Application submit error:", error);
    return { ok: false, error: "Arizani yuborishda xatolik yuz berdi. Birozdan so'ng qayta urinib ko'ring." };
  }

  await recordApplicationReferral({
    applicationId: created.id as string,
    code: promoCode,
    classification: promoKind,
  });

  return { ok: true };
}
