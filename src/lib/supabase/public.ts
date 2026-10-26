import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cookie'siz anon mijoz — KESHLANADIGAN ommaviy o'qishlar uchun.
 *
 * `lib/supabase/server.ts` dagi mijoz `cookies()` ni o'qiydi, `unstable_cache`
 * ichida esa cookie o'qish taqiqlangan. Bu mijoz har doim anon rol bilan
 * o'qiydi, ya'ni natija tashrifchiga bog'liq emas va uni barcha so'rovlar
 * bo'lishib ishlatishi xavfsiz. Faqat chop etilgan, hamma ko'radigan
 * ma'lumot uchun.
 */
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
