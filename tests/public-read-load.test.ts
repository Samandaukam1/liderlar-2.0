import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { PUBLIC_LIST_REVALIDATE_SECONDS } from "../src/lib/data/public-cache.ts";

/*
 * OMMAVIY SAYTNING BAZAGA YUKI.
 *
 * 2026-10-26: Supabase (Micro) qayta-qayta yiqildi — PGRST003, 57014,
 * Auth 5xx. Ommaviy sahifalar keshsiz edi va ikki so'rov og'ir edi:
 * reyting (3,5 s) va katalog (~520 KB). Bu testlar o'sha og'ir
 * shakllar qaytib kelmasligini qo'riqlaydi.
 */

const read = (path: string) => readFileSync(path, "utf8");

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(ts|tsx)$/.test(name) ? [path] : [];
  });
}

test("kesh muddati qisqa: soatlik reyting hisobidan ancha kam", () => {
  assert.ok(PUBLIC_LIST_REVALIDATE_SECONDS > 0);
  assert.ok(PUBLIC_LIST_REVALIDATE_SECONDS <= 600);
});

/* ------------------------------------------------------------------ *
 * SO'ROV SHAKLLARI
 * ------------------------------------------------------------------ */

test("nomzod kartasi ranking_scores ni ichma-ich so'ramaydi", () => {
  /*
   * `ranking_scores(candidate_id)` da indeks yo'q: ichma-ich so'rov har
   * nomzod uchun jadvalni to'liq aylanardi. Reyting 3,5 s -> 0,8 s.
   */
  const offenders = sourceFiles("src/lib/data").filter((path) =>
    // Izohlardagi `scores:ranking_scores(...)` emas, haqiqiy ustun ro'yxati.
    /:\s*ranking_scores\s*\(\s*[a-z_*]/.test(read(path)),
  );
  assert.deepEqual(offenders, []);
});

test("katalog sahifasi keshlanadi, reyting tartibi esa sahifa raqamisiz", () => {
  const source = read("src/lib/data/candidates.ts");
  assert.match(source, /getCachedCatalogPage = unstable_cache\(/);
  assert.match(source, /getCachedRankingOrder = unstable_cache\(\s*\(query: CatalogQuery\) => loadRankingOrder\(query\)/);
  assert.match(source, /type CatalogQuery = Omit<CandidateFilters, "page" \| "perPage">/);
  // Reyting sahifasidagi kartalar sahifa raqami emas, ID ro'yxati bo'yicha keshlanadi.
  assert.match(source, /getCachedCardsByIds = unstable_cache\(\s*\(ids: string\[\]\) => loadCardsByIds\(ids\)/);
  // Keshlanadigan joylarda cookie o'qiydigan mijoz bo'lmasligi kerak.
  for (const fn of ["async function loadCatalogPage", "async function loadRankingOrder", "async function loadCardsByIds"]) {
    const body = source.slice(source.indexOf(fn), source.indexOf("\n}\n", source.indexOf(fn)));
    assert.match(body, /createPublicClient\(\)/, fn);
    assert.doesNotMatch(body, /createServerSupabase\(/, fn);
  }
});

test("katalog to'liq ro'yxatni bitta so'rovda olmaydi (1000 qator chegarasi)", () => {
  const source = read("src/lib/data/candidates.ts");
  assert.doesNotMatch(source, /\.range\(0, 4999\)/);
  assert.match(source, /builder\.range\(from, to\)/);
  assert.match(source, /fetchAllRows<CatalogOrderRow>\(/);
});

test("reyting xatosi katalog keshiga yozilmaydi", () => {
  assert.match(read("src/lib/data/candidates.ts"), /toCandidateCards\(data \?\? \[\], \{ strict: true \}\)/);
  assert.match(read("src/lib/data/candidate-ranking.ts"), /if \(strict\) throw error;/);
});

test("reyting jadvali keshlanadi", () => {
  const source = read("src/lib/data/ranking.ts");
  assert.match(source, /return getCachedLeaderboard\(categoryCode, periodId, limit, regionId\)/);
  assert.match(source, /getCachedLeaderboard = unstable_cache\(/);
});

/* ------------------------------------------------------------------ *
 * REALTIME VA TASHQI SO'ROVLAR
 * ------------------------------------------------------------------ */

test("ommaviy sayt har tashrifchi uchun Realtime obunasi ochmaydi", () => {
  const offenders = [...sourceFiles("src/components"), ...sourceFiles("src/app")].filter((path) =>
    /["']postgres_changes["']|\.channel\(/.test(read(path)),
  );
  assert.deepEqual(offenders, []);
});

test("profildagi admin API so'rovi vaqt chegarasi bilan", () => {
  assert.match(read("src/lib/data/candidate-adabiyotx.ts"), /signal: AbortSignal\.timeout\(/);
});

/* ------------------------------------------------------------------ *
 * STORAGE EGRESS
 * ------------------------------------------------------------------ */

test("egasi yuklagan rasm 1 yillik kesh bilan, manzil esa har safar yangi", () => {
  assert.match(read("src/lib/profile-editor/upload-client.ts"), /cacheControl: "31536000"/);
  // Uzun kesh faqat manzil qayta ishlatilmagani uchun xavfsiz.
  assert.match(read("src/lib/profile-editor/upload-service.ts"), /candidates\/\$\{candidateId\}\/\$\{randomUUID\(\)\}/);
});
