import "server-only";
import { revalidateTag, unstable_cache } from "next/cache";
import { profileCacheTag } from "@/lib/data/profile-cache-keys";

/**
 * PROFIL KESHI.
 *
 * Profil sahifasi bazaga eng ko'p so'rov yuboradigan sahifa edi (API
 * so'rovlarining ~55% i, har ochilishda ~25 so'rov). Endi:
 *
 *   - `slug -> id, updated_at` har so'rovda YANGI o'qiladi: profil yashirilsa,
 *     o'chirilsa yoki slug o'zgarsa — darhol;
 *   - asosiy ma'lumot `(id, slug, updated_at)` kaliti bilan keshlanadi:
 *     `candidates` qatoridagi har tahrir (ism, bio, avatar...) o'zi yangi
 *     kalit beradi; bog'liq jadvallar (bo'limlar, yutuqlar, media...) esa
 *     tahrir joyidan `candidate-profile:<id>` tegi orqali yangilanadi;
 *   - muddat — faqat ZAXIRA: yangilash chaqiruvi yetib bormasa ham
 *     ma'lumot shu vaqtdan ortiq eskirmaydi.
 *
 * Keshga faqat anon rol ko'radigan, chop etilgan ma'lumot tushadi.
 * Xato natija keshga yozilmaydi (yuklovchilar `strict` rejimda).
 */

/** Asosiy profil ma'lumoti — zaxira muddat. */
export const PROFILE_BUNDLE_REVALIDATE_SECONDS = 3600;

/** Ko'rishlar soni — faqat KO'RSATISH; sanashning o'zi keshlanmaydi. */
export const PROFILE_VIEWS_REVALIDATE_SECONDS = 60;

export function cachedForCandidate<T>(
  part: string,
  candidateId: string,
  revalidate: number,
  load: () => Promise<T>,
  keyParts: readonly string[] = [],
): Promise<T> {
  return unstable_cache(load, ["public-profile", part, candidateId, ...keyParts], {
    revalidate,
    tags: [profileCacheTag(candidateId)],
  })();
}

/**
 * Nomzodning ommaviy profil keshini DARHOL eskirtiradi (keyingi ochilish
 * yangi ma'lumotni kutadi). Server Action va Route Handler'larda ishlaydi.
 * Hech qachon otmaydi: kesh yangilanmasa ham tahrirning o'zi yiqilmasin —
 * zaxira muddat baribir ishlaydi.
 */
export function expireCandidateProfile(candidateId: string | null | undefined): void {
  if (!candidateId) return;
  try {
    revalidateTag(profileCacheTag(candidateId), { expire: 0 });
  } catch (error) {
    console.error("[profil-kesh] yangilanmadi:", error instanceof Error ? error.message : String(error));
  }
}
