import { createHash, timingSafeEqual } from "node:crypto";

/**
 * PROFIL KESHI — TEGLAR VA YANGILASH SO'ROVI (toza modul, testlanadi).
 *
 * Profil ma'lumoti nomzod ID si bo'yicha teglanadi. Uni yangilash uchun
 * ikki yo'l bor:
 *   - web'ning o'zi (kabinetda egasi tahrir qilganda) — `revalidateTag`;
 *   - admin panel — `POST /api/revalidate/profile` (server-server kaliti
 *     `LIDERLAR_PUBLIC_CONTENT_API_KEY`, ikkala loyihada bir xil).
 */

export const PROFILE_TAG_PREFIX = "candidate-profile:";

export function profileCacheTag(candidateId: string): string {
  return `${PROFILE_TAG_PREFIX}${candidateId}`;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Bitta so'rovda yangilanadigan profillar chegarasi. */
export const MAX_REVALIDATE_IDS = 50;

export type ProfileRevalidation =
  | { ok: true; candidateIds: string[] }
  | { ok: false; error: string };

/** `{ candidateIds: string[] }` — faqat UUID, takrorsiz, ko'pi bilan 50 ta. */
export function parseProfileRevalidation(body: unknown): ProfileRevalidation {
  const raw = (body as { candidateIds?: unknown } | null)?.candidateIds;
  if (!Array.isArray(raw) || raw.length === 0) {
    return { ok: false, error: "candidateIds bo'sh bo'lmagan ro'yxat bo'lishi kerak" };
  }
  if (raw.length > MAX_REVALIDATE_IDS) {
    return { ok: false, error: `Ko'pi bilan ${MAX_REVALIDATE_IDS} ta ID` };
  }
  if (!raw.every((id) => typeof id === "string" && UUID.test(id))) {
    return { ok: false, error: "candidateIds faqat UUID dan iborat bo'lishi kerak" };
  }
  return { ok: true, candidateIds: [...new Set((raw as string[]).map((id) => id.toLowerCase()))] };
}

/** Kalitni vaqtga bog'liq bo'lmagan usulda solishtiradi. */
export function apiKeyMatches(expected: string, provided: string | null | undefined): boolean {
  if (!expected || !provided) return false;
  const a = createHash("sha256").update(expected).digest();
  const b = createHash("sha256").update(provided).digest();
  return timingSafeEqual(a, b);
}
