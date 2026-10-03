import "server-only";
import { randomInt } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { recordAudit } from "@/lib/vip/audit-log";
import {
  buildCode,
  charPicker,
  checkCodeShape,
  CODE_PROBLEM_TEXT,
  normalizeCode,
} from "./code";

/**
 * SHAXSIY TAVSIYA KODLARI — BAZAGA TEGADIGAN QISM.
 *
 * Qoidalar `code.ts` da. Bu yerda: kod yaratish, kodni egasiga yechish
 * va ariza formasi uchun VIP kodlari ro'yxati.
 */

/* ========================================================================= *
 * KOD YARATISH
 * ========================================================================= */

/**
 * Necha marta urinish.
 *
 * Har urinish 23^n variantdan tanlaydi va to'qnashuv ehtimoli juda
 * kichik. 6 ta urinish yetib qolmasa, muammo tasodifda emas — ism
 * uchun variantlar tugagan bo'ladi va zaxira yo'l ishga tushadi.
 */
const MAX_ATTEMPTS = 6;

const pickChar = charPicker((max) => randomInt(max));

/**
 * Profilga shaxsiy kod beradi. Allaqachon bor bo'lsa, o'shani qaytaradi.
 *
 * IDEMPOTENT: ikki marta chaqirilsa, ikkinchi marta yangi kod
 * YARATILMAYDI. Kod barqaror bo'lishi kerak (§13) — u ommaviy joyda
 * turadi va odamlar uni ulashadi.
 */
export async function ensureReferralCode(
  profileId: string,
  fullName: string | null,
): Promise<{ ok: true; code: string } | { ok: false; error: string }> {
  const admin = createAdminClient();

  const { data: existing, error: readError } = await admin
    .from("referral_codes")
    .select("code")
    .eq("profile_id", profileId)
    .maybeSingle();

  if (readError) {
    console.error("[referral] kod o'qilmadi:", readError.message);
    return { ok: false, error: "Kodni o'qib bo'lmadi." };
  }
  if (existing) return { ok: true, code: existing.code as string };

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const code = buildCode(fullName, pickChar);

    const { error } = await admin
      .from("referral_codes")
      .insert({ profile_id: profileId, code });

    if (!error) {
      await recordAudit("referral.code.issued", {
        actorId: profileId,
        entityId: profileId,
        after: { code },
      });
      return { ok: true, code };
    }

    /*
     * 23505 — UNIKAL INDEKS. Uchta sabab bo'lishi mumkin:
     *
     *   - `profile_id` unique: bir vaqtda ikkinchi so'rov kod yaratdi.
     *     Bu XATO EMAS — o'sha kodni o'qib qaytaramiz.
     *   - `code` unique yoki fold indeksi: kod band, qaytadan urinamiz.
     */
    if (error.code !== "23505") {
      console.error("[referral] kod yozilmadi:", error.message);
      return { ok: false, error: "Kodni yaratib bo'lmadi." };
    }

    const { data: raced, error: racedError } = await admin
      .from("referral_codes")
      .select("code")
      .eq("profile_id", profileId)
      .maybeSingle();

    if (racedError) {
      console.error("[referral] kod qayta o'qilmadi:", racedError.message);
      return { ok: false, error: "Kodni o'qib bo'lmadi." };
    }
    if (raced) return { ok: true, code: raced.code as string };
    // Kod band edi — keyingi urinish boshqa tasodif bilan ketadi.
  }

  /*
   * Bu yerga yetish amalda kutilmaydi. Yetilsa, sababini LOGDA aytamiz:
   * jim qolish "kodsiz akkaunt" holatini tushunarsiz qilardi.
   */
  console.error("[referral] kod yaratilmadi, urinishlar tugadi:", { profileId });
  return { ok: false, error: "Kodni yaratib bo'lmadi. Keyinroq urinib ko'ring." };
}

/* ========================================================================= *
 * KODNI EGASIGA YECHISH
 * ========================================================================= */

export type CodeResolution =
  | { ok: true; ownerProfileId: string; code: string }
  /**
   * `unavailable` — kodni TEKSHIRIB BO'LMADI (baza xatosi). "Topilmadi"
   * dan farqli: kod to'g'ri bo'lishi mumkin va odamga "bunday kod yo'q"
   * deyish yolg'on bo'lardi.
   */
  | { ok: false; error: string; unavailable?: true };

/**
 * Kiritilgan kodning egasini topadi.
 *
 * NORMALLASHTIRISH SHU YERDA, SQL'da emas: SQL fold'i kirillchani
 * lotinchaga aylantirmaydi, TypeScript esa aylantiradi. Foydalanuvchi
 * kodni kirillcha yozsa va biz xom matnni yuborsak, kod topilmay
 * qolardi.
 */
export async function resolveReferralCode(input: string | null | undefined): Promise<CodeResolution> {
  const shape = checkCodeShape(input);
  if (!shape.ok) {
    return { ok: false, error: CODE_PROBLEM_TEXT[shape.problem ?? "shape"] };
  }

  const admin = createAdminClient();
  const { data, error } = await admin.rpc("resolve_referral_code", {
    p_code: normalizeCode(input),
  });

  if (error) {
    console.error("[referral] kod yechilmadi:", error.message);
    return { ok: false, error: "Kodni hozir tekshirib bo'lmadi.", unavailable: true };
  }

  const ownerProfileId = (data as string | null) ?? null;
  if (!ownerProfileId) {
    return { ok: false, error: "Bunday promo kod topilmadi." };
  }

  return { ok: true, ownerProfileId, code: shape.code };
}

/* ========================================================================= *
 * ARIZA FORMASI UCHUN TAKLIFLAR
 * ========================================================================= */

export interface CodeSuggestion {
  fullName: string;
  code: string;
}

/**
 * VIP obunachilarining kodlari — ariza formasida ro'yxat sifatida.
 *
 * `profile_id` QAYTARILMAYDI: u ichki identifikator va ommaviy
 * ro'yxatga qo'shishning sababi yo'q (§76).
 *
 * Ro'yxat bo'sh bo'lishi ODATIY holat — hali VIP obunachi bo'lmasligi
 * mumkin. Forma bunda qo'lda kiritishni so'raydi, xato ko'rsatmaydi.
 */
export async function loadVipCodeSuggestions(limit = 50): Promise<CodeSuggestion[]> {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("vip_referral_code_suggestions")
    .select("full_name, code")
    .order("full_name", { ascending: true })
    .limit(limit);

  if (error) {
    /*
     * Taklif ro'yxati — QULAYLIK, shart emas. O'qilmasa, forma
     * ishlashda davom etadi va foydalanuvchi kodni qo'lda yozadi.
     */
    console.error("[referral] takliflar o'qilmadi:", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    fullName: ((row.full_name as string) ?? "").trim(),
    code: row.code as string,
  }));
}
