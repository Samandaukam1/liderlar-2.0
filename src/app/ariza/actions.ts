"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { applicationSchema } from "@/lib/validation/application";
import {
  classifyPromoCode,
  recordApplicationReferral,
} from "@/lib/referral/application-hook";

export type SubmitResult =
  | { ok: true }
  | { ok: false; error: string };

export async function submitApplication(input: unknown): Promise<SubmitResult> {
  const parsed = applicationSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Formada xatolik bor." };
  }

  const { fullName, phone, telegram, gender, ageRange, regionId, promoCode } = parsed.data;

  /*
   * PROMO KOD ARIZANI HECH QACHON TO'XTATMAYDI.
   *
   * Egasining qarori (2026-10-03): kod MAJBURIY EMAS va ISTALGAN kod
   * qabul qilinadi — noma'lum, muddati tugagan yoki hozir tekshirib
   * bo'lmagan kod ham. Kod yozilganidek saqlanadi; imtiyozni operator
   * arizani ko'rib hal qiladi.
   *
   * Tur faqat ATRIBUTSIYA uchun aniqlanadi: shaxsiy tavsiya kodi kod
   * egasiga bog'lanadi va tekin qabul yo'liga HECH QACHON tushmaydi.
   */
  const promoKind = await classifyPromoCode(promoCode);

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
