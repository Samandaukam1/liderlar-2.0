import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  apiKeyMatches,
  MAX_REVALIDATE_IDS,
  parseProfileRevalidation,
  profileCacheTag,
} from "../src/lib/data/profile-cache-keys.ts";

/*
 * PROFIL KESHI.
 *
 * Profil sahifasi API so'rovlarining ~55% ini berardi (har ochilishda ~25
 * so'rov). Endi asosiy ma'lumot keshlanadi; profil yashirilishi/o'chirilishi
 * va slug o'zgarishi esa har so'rovdagi yangi `slug -> id` o'qishi orqali
 * DARHOL ishlaydi. Bu testlar o'sha kafolatlarni qo'riqlaydi.
 */

const read = (path: string) => readFileSync(path, "utf8");
const ID = "2af89f57-9807-4dee-aed1-cdf533637b4b";

/* ------------------------------------------------------------------ *
 * YANGILASH SO'ROVI (admin -> web)
 * ------------------------------------------------------------------ */

test("teg nomzod ID si bo'yicha", () => {
  assert.equal(profileCacheTag(ID), `candidate-profile:${ID}`);
});

test("faqat UUID qabul qilinadi, takrorlar olib tashlanadi", () => {
  assert.deepEqual(parseProfileRevalidation({ candidateIds: [ID, ID.toUpperCase()] }), { ok: true, candidateIds: [ID] });
  for (const bad of [null, {}, { candidateIds: [] }, { candidateIds: "x" }, { candidateIds: [ID, "1; drop"] }, { candidateIds: [42] }]) {
    assert.equal(parseProfileRevalidation(bad).ok, false, JSON.stringify(bad));
  }
});

test("bitta so'rovda ko'pi bilan 50 ta profil", () => {
  const many = Array.from({ length: MAX_REVALIDATE_IDS + 1 }, (_, i) => `${ID.slice(0, -2)}${String(i).padStart(2, "0")}`);
  assert.equal(parseProfileRevalidation({ candidateIds: many }).ok, false);
  assert.equal(parseProfileRevalidation({ candidateIds: many.slice(0, MAX_REVALIDATE_IDS) }).ok, true);
});

test("kalit: aynan mos kelishi shart, bo'sh kalit hech narsani ochmaydi", () => {
  assert.equal(apiKeyMatches("secret-key", "secret-key"), true);
  assert.equal(apiKeyMatches("secret-key", "secret-kez"), false);
  assert.equal(apiKeyMatches("secret-key", null), false);
  assert.equal(apiKeyMatches("", ""), false);
  assert.equal(apiKeyMatches("", "anything"), false);
});

test("yangilash endpoint'i yopiq ishlaydi va darhol eskirtiradi", () => {
  const route = read("src/app/api/revalidate/profile/route.ts");
  assert.match(route, /if \(!expected\) \{[\s\S]{0,160}status: 503/);
  assert.match(route, /apiKeyMatches\(expected, request\.headers\.get\("x-liderlar-api-key"\)\)/);
  assert.match(route, /revalidateTag\(profileCacheTag\(candidateId\), \{ expire: 0 \}\)/);
});

/* ------------------------------------------------------------------ *
 * PROFIL YUKLOVCHISI
 * ------------------------------------------------------------------ */

const loader = read("src/lib/data/candidates.ts");
const fnBody = (name: string) => {
  const start = loader.indexOf(name);
  assert.ok(start >= 0, name);
  return loader.slice(start, loader.indexOf("\n}", start));
};

test("slug -> id har so'rovda yangi: yashirish, o'chirish, slug o'zgarishi darhol", () => {
  const head = fnBody("export const getCandidateBySlug = cache(");
  assert.match(head, /\.eq\("slug", slug\)\s*\.eq\("status", "published"\)\s*\.is\("deleted_at", null\)/);
  // Bu o'qish keshlanmaydi — keshlanadigan joy faqat `cachedForCandidate`.
  assert.ok(head.indexOf('.eq("slug", slug)') < head.indexOf("cachedForCandidate("));
});

test("asosiy ma'lumot kaliti slug va updated_at ni o'z ichiga oladi", () => {
  const head = fnBody("export const getCandidateBySlug = cache(");
  assert.match(head, /\[slug, String\(head\.updated_at \?\? ""\)\]/);
  assert.match(head, /loadProfileBundle\(candidateId, \{ strict: true \}\)/);
  // Kesh yiqilsa sahifa avvalgidek keshsiz ochiladi.
  assert.match(head, /\.catch\(\(\) => loadProfileBundle\(candidateId\)\)/);
});

test("keshga faqat anon rol ko'radigan ma'lumot tushadi", () => {
  const bundle = fnBody("async function loadProfileBundle");
  assert.match(bundle, /createPublicClient\(\)/);
  assert.doesNotMatch(bundle, /createServerSupabase\(/, "cookie/sessiyaga bog'liq mijoz keshga kirmasin");
  // Ko'rishlar soni va ball keshlangan profil ichida emas — alohida, qisqa muddat.
  assert.doesNotMatch(bundle, /profile_views/);
  assert.doesNotMatch(bundle, /getCandidateRanking\(/);
});

test("ball 5 daqiqa, ko'rishlar soni 60 soniya — xato keshlanmaydi", () => {
  const head = fnBody("export const getCandidateBySlug = cache(");
  assert.match(head, /cachedForCandidate\("ranking", candidateId, PUBLIC_LIST_REVALIDATE_SECONDS[\s\S]{0,80}getCandidateRanking\(candidateId, \{ strict: true \}\)/);
  assert.match(head, /cachedForCandidate\("views", candidateId, PROFILE_VIEWS_REVALIDATE_SECONDS/);
  const cache = read("src/lib/data/profile-cache.ts");
  assert.match(cache, /PROFILE_VIEWS_REVALIDATE_SECONDS = 60;/);
});

test("ko'rishni SANASH keshdan mustaqil — sahifa trekerni chaqiradi", () => {
  const page = read("src/app/liderlar/[slug]/page.tsx");
  assert.match(page, /<ThemeViewTracker candidateSlug=\{candidate\.slug\} \/>/);
  assert.match(page, /<ProfileViewTracker/);
  assert.doesNotMatch(read("src/app/api/profile-view/route.ts"), /unstable_cache|profile-cache/);
});

test("dizayn tanlovi keshlanmaydi (VIP tugasa yoki egasi almashtirsa — darhol)", () => {
  assert.doesNotMatch(read("src/lib/themes/preference-service.ts"), /unstable_cache|cachedForCandidate/);
});

/* ------------------------------------------------------------------ *
 * KABINETDAGI TAHRIRLAR KESHNI YANGILAYDI
 * ------------------------------------------------------------------ */

test("egasining to'g'ridan-to'g'ri ommaga chiqadigan tahrirlari keshni eskirtiradi", () => {
  const expected: Record<string, number> = {
    "src/lib/profile-editor/section-service.ts": 4,
    "src/lib/profile-editor/upload-service.ts": 3,
    "src/lib/profile-editor/certificate-service.ts": 3,
    "src/lib/articles/author-service.ts": 4,
    "src/lib/profile-editor/quote-service.ts": 1,
  };
  for (const [file, count] of Object.entries(expected)) {
    const calls = read(file).match(/expireCandidateProfile\(/g)?.length ?? 0;
    assert.equal(calls, count, file);
  }
});
