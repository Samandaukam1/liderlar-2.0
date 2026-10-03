import "server-only";
import { cache } from "react";
import { createClient as createServerSupabase } from "@/lib/supabase/server";

/**
 * JORIY FOYDALANUVCHI — SO'ROV ICHIDA BIR MARTA, TARMOQSIZ.
 *
 * NEGA `getClaims()`, `getUser()` EMAS: `getUser()` har chaqiruvda
 * Auth serveriga tarmoq so'rovi yuboradi. Kabinetga kirishda u proxy,
 * layout va sahifada — uch marta chaqirilardi. `getClaims()` esa JWT
 * imzosini loyihaning ES256 ochiq kaliti bilan MAHALLIY tekshiradi
 * (kalit keshlanadi) — xavfsizlik bir xil: soxta yoki muddati o'tgan
 * token rad etiladi.
 *
 * CHEKLOV: chiqib ketilgan (bekor qilingan) sessiyaning access tokeni
 * o'z muddati (≈1 soat) tugaguncha o'qish uchun amal qiladi. Shu sababli
 * pul va huquq bilan bog'liq YOZISH amallari `getUser()` da qoladi.
 *
 * `cache` — bitta render ichidagi barcha chaqiruvlar bitta natijani
 * ulashadi (layout + sahifa + komponentlar).
 */
export const getSessionUser = cache(async (): Promise<{ id: string; email: string | null } | null> => {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.getClaims();
  const sub = data?.claims?.sub;
  if (error || typeof sub !== "string") return null;
  const email = data?.claims?.email;
  return { id: sub, email: typeof email === "string" ? email : null };
});
