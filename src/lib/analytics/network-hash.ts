import "server-only";
import { createHmac } from "node:crypto";

/**
 * TARMOQ XESHI — XOM IP SAQLANMAYDI.
 *
 * HMAC(server siri, "Toshkent kuni:IP"). Kun almashganda natija ham
 * almashadi — kunlar orasida bitta tarmoqni kuzatib bo'lmaydi. Faqat
 * kunlik chegaralar uchun (bitta tarmoqdan bitta nomzodga ko'rishlar,
 * soatlik tezlik): bular Premium Challenge ko'rishlarini qalbaki
 * oshirishga qarshi.
 *
 * Kalit — server muhitidagi sir (brauzerga chiqmaydi). IP aniqlanmasa —
 * `null` (chegara qo'llanmaydi, ko'rish boshqa qoidalar bilan sanaladi).
 */
export function networkHash(headers: Headers, now: Date = new Date()): string | null {
  const secret = process.env.VIEW_HASH_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) return null;

  // Vercel: birinchi qiymat — haqiqiy mijoz manzili.
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || headers.get("x-real-ip")?.trim();
  if (!ip) return null;

  const day = new Date(now.getTime() + 5 * 3_600_000).toISOString().slice(0, 10); // Asia/Tashkent (UTC+5)
  return createHmac("sha256", secret).update(`${day}:${ip}`).digest("hex");
}
