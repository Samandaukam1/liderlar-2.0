import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { paginate, PUBLIC_LIST_REVALIDATE_SECONDS } from "../src/lib/data/public-cache.ts";

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

/* ------------------------------------------------------------------ *
 * SAHIFALASH — keshlangan ro'yxatdan qirqish
 * ------------------------------------------------------------------ */

test("sahifalash avvalgi hisob bilan bir xil", () => {
  const all = Array.from({ length: 30 }, (_, i) => i + 1);

  assert.deepEqual(paginate(all, 1, 12), {
    items: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    total: 30,
    page: 1,
    perPage: 12,
    totalPages: 3,
  });
  assert.deepEqual(paginate(all, 3, 12).items, [25, 26, 27, 28, 29, 30]);
});

test("sahifa ko'rsatilmasa yoki 1 dan kichik bo'lsa — birinchi sahifa", () => {
  const all = [1, 2, 3];
  assert.equal(paginate(all, undefined, 2).page, 1);
  assert.equal(paginate(all, 0, 2).page, 1);
  assert.equal(paginate(all, -5, 2).page, 1);
  assert.deepEqual(paginate(all, 0, 2).items, [1, 2]);
});

test("bo'sh ro'yxatda ham kamida bitta sahifa", () => {
  assert.deepEqual(paginate([], 4, 12), {
    items: [],
    total: 0,
    page: 4,
    perPage: 12,
    totalPages: 1,
  });
});

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

test("katalog ro'yxati keshlanadi va sahifa raqami kesh kalitiga kirmaydi", () => {
  const source = read("src/lib/data/candidates.ts");
  assert.match(source, /unstable_cache\(\s*\(filters: CatalogQuery\) => loadCatalog\(filters\)/);
  assert.match(source, /type CatalogQuery = Omit<CandidateFilters, "page" \| "perPage">/);
  assert.match(source, /return paginate\(all, filters\.page/);
  // Keshlanadigan joyda cookie o'qiydigan mijoz bo'lmasligi kerak.
  const loader = source.slice(source.indexOf("async function loadCatalog"));
  const body = loader.slice(0, loader.indexOf("\n}\n"));
  assert.match(body, /createPublicClient\(\)/);
  assert.doesNotMatch(body, /createServerSupabase\(/);
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
