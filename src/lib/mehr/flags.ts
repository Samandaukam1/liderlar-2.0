import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { MEHR_FLAG_KEYS, ALL_FLAGS_OFF, type MehrFlags } from "./flag-keys";

/**
 * MEHR bayroqlari — web tomoni.
 *
 * Admin ilovasidagi `flags.ts` bilan BIR XIL jadvalni o'qiydi
 * (`site_settings`) va bir xil qoidani qo'llaydi: faqat aynan
 * "true" yoqilgan hisoblanadi.
 *
 * O'QILMASA — YOPIQ. Ochilib ketgan xususiyatni keyin qaytarib
 * yopish, yopiq turganini ochishdan ancha qimmatga tushadi.
 */

export * from "./flag-keys";

function isOn(value: string | null | undefined): boolean {
  return value?.trim().toLowerCase() === "true";
}

export async function getMehrFlags(): Promise<MehrFlags> {
  const db = createAdminClient();

  const { data, error } = await db
    .from("site_settings")
    .select("key, value")
    .in("key", Object.values(MEHR_FLAG_KEYS));

  if (error) {
    console.error("MEHR_FLAGS_LOAD_FAILED", { code: error.code, message: error.message });
    return { ...ALL_FLAGS_OFF };
  }

  const map = new Map((data ?? []).map((r) => [r.key as string, r.value as string]));
  const out = { ...ALL_FLAGS_OFF };

  for (const [field, key] of Object.entries(MEHR_FLAG_KEYS)) {
    out[field as keyof MehrFlags] = isOn(map.get(key));
  }

  return out;
}

/**
 * Ommaviy MEHR ochiqmi.
 *
 * Alohida funksiya, chunki uni ko'p joydan chaqiramiz va
 * har safar butun bayroqlar to'plamini o'qib o'tirish
 * keraksiz uzun bo'lardi.
 */
export async function isMehrPublicEnabled(): Promise<boolean> {
  return (await getMehrFlags()).publicEnabled;
}
