import "server-only";
import { randomUUID } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { recordAudit } from "@/lib/vip/audit-log";
import {
  checkUsernameShape,
  INTERNAL_AUTH_DOMAIN,
  normalizeUsername,
  USERNAME_PROBLEM_TEXT,
  type UsernameCheck,
} from "./username";

/**
 * LOGIN — BAZAGA TEGADIGAN QISM.
 *
 * Shakl qoidalari sof modulda (`username.ts`); bu yerda faqat
 * band qilingan nomlar ro'yxati va bandlik tekshiruvi.
 */

/** Band qilingan nomlar kam o'zgaradi — bir marta o'qiladi. */
let reservedCache: { at: number; names: Set<string> } | null = null;
const RESERVED_TTL_MS = 5 * 60 * 1000;

async function loadReserved(): Promise<Set<string>> {
  if (reservedCache && Date.now() - reservedCache.at < RESERVED_TTL_MS) {
    return reservedCache.names;
  }

  const admin = createAdminClient();
  const { data, error } = await admin.from("reserved_usernames").select("username");

  if (error) {
    /*
     * RO'YXAT O'QILMASA — BO'SH EMAS, XATO.
     *
     * Bo'sh to'plam qaytarsak, "admin" loginini olish mumkin
     * bo'lib qolardi. Shuning uchun keshdagi eski ro'yxat
     * ishlatiladi; u ham bo'lmasa, xato yuqoriga qaytadi.
     */
    if (reservedCache) return reservedCache.names;
    throw new Error(`reserved_usernames o‘qilmadi: ${error.message}`);
  }

  const names = new Set((data ?? []).map((row) => normalizeUsername(row.username as string)));
  reservedCache = { at: Date.now(), names };
  return names;
}

export type UsernameAvailability =
  | { ok: true; username: string }
  | { ok: false; error: string };

/**
 * Login shaklini va bandligini tekshiradi.
 *
 * YAGONA MANBA emas: oxirgi so'z bazadagi unikal indeksda. Ikki
 * odam bir vaqtda bir xil loginni tanlasa, ikkoviga ham "bo'sh"
 * deb javob berilishi mumkin — yozishda esa faqat bittasi
 * yutadi.
 */
export async function checkUsernameAvailable(
  input: string | null | undefined,
): Promise<UsernameAvailability> {
  const reserved = await loadReserved();
  const shape: UsernameCheck = checkUsernameShape(input, reserved);
  if (!shape.ok) {
    return { ok: false, error: USERNAME_PROBLEM_TEXT[shape.problem ?? "shape"] };
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select("id")
    .ilike("username", shape.username)
    .limit(1);

  if (error) {
    console.error("[username] bandlik tekshiruvi:", error.message);
    return { ok: false, error: "Hozir tekshirib bo‘lmadi. Birozdan so‘ng urinib ko‘ring." };
  }

  /*
   * KIM EGALIGI AYTILMAYDI.
   *
   * "Bu login Asadbekniki" degan javob begona odamga kim qaysi
   * login ostida ekanini ochib berardi.
   */
  if ((data ?? []).length > 0) {
    return { ok: false, error: USERNAME_PROBLEM_TEXT.reserved };
  }

  return { ok: true, username: shape.username };
}

/**
 * ICHKI AUTH MANZILI.
 *
 * Supabase Auth parol bilan kirish uchun email talab qiladi.
 * Manzil TASODIFIY va logindan mustaqil: login o'zgarsa,
 * autentifikatsiya shaxsi joyida qoladi.
 *
 * Bu manzilga hech qachon xat yuborilmaydi — domenda MX yozuvi
 * yo'q va bu hisoblar uchun email orqali parol tiklash oqimi
 * ishlatilmaydi.
 */
export function buildInternalAuthEmail(): string {
  return `u-${randomUUID()}@${INTERNAL_AUTH_DOMAIN}`;
}

/**
 * Loginni profilga yozadi.
 *
 * Unikal indeks buzilishi — bu xato emas, POYGA: shu loginni
 * boshqa odam bir lahza oldin olgan. Chaqiruvchi buni
 * foydalanuvchiga tushunarli qilib aytadi.
 */
export async function assignUsername(
  userId: string,
  username: string,
): Promise<{ ok: boolean; taken: boolean }> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ username, username_set_at: new Date().toISOString() })
    .eq("id", userId);

  if (!error) {
    await recordAudit("account.username.set", {
      actorId: userId,
      entityId: userId,
      after: { username },
    });
    return { ok: true, taken: false };
  }
  if (error.code === "23505") return { ok: false, taken: true };

  console.error("[username] saqlanmadi:", error.message);
  return { ok: false, taken: false };
}
