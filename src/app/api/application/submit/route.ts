import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { applicationSchema } from "@/lib/validation/application";
import { checkPromoCodeUsable } from "@/lib/promo/expiry-check";
import {
  checkPromoGate,
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
   * MUDDATI TUGAGAN PROMO KOD — ARIZA QABUL QILINMAYDI.
   *
   * Tekshiruv sxemada emas, shu yerda: sxema brauzerda ham
   * ishlaydi va u bazani ko'rmaydi. `field` qaytariladi, shunda
   * forma xabarni AYNAN promo kod maydoniga qo'yadi — umumiy
   * "xatolik" oynasi nomzodni nima noto'g'ri ekanini qidirishga
   * majbur qilardi.
   */
  const promoCheck = await checkPromoCodeUsable(promoCode);
  if (promoCheck.error) {
    return Response.json({ error: promoCheck.error, field: "promoCode" }, { status: 400 });
  }


  /*
   * SHAXSIY TAVSIYA KODI — KOORDINATOR KODIDAN AJRATILADI.
   *
   * Tur aniqlanadi va faqat shaxsiy kod atributsiya beradi. Shaxsiy
   * kod tekin qabul yo'liga HECH QACHON tushmaydi.
   */
  const promoKind = await classifyPromoCode(promoCode);
  const gate = await checkPromoGate(promoCode, promoKind);
  if (!gate.ok) {
    return Response.json({ error: gate.error, field: gate.field }, { status: 400 });
  }

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
