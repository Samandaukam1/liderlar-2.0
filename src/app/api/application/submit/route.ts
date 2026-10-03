import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { applicationSchema } from "@/lib/validation/application";
import {
  classifyPromoCode,
  recordApplicationReferral,
} from "@/lib/referral/application-hook";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const input = await request.json().catch(() => null);
  if (input === null || typeof input !== "object") {
    return Response.json({ error: "So'rov formati noto'g'ri." }, { status: 400 });
  }

  const parsed = applicationSchema.safeParse(input);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Formada xatolik bor." },
      { status: 400 }
    );
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

  const admin = createAdminClient();
  const { data: created, error } = await admin.from("applications").insert({
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
    return Response.json({ error: "Arizani saqlashda xatolik yuz berdi." }, { status: 500 });
  }

  // Ariza saqlangandan KEYIN: atributsiya `application_id` ga bog'lanadi.
  await recordApplicationReferral({
    applicationId: created.id as string,
    code: promoCode,
    classification: promoKind,
  });

  return Response.json({ ok: true });
}
