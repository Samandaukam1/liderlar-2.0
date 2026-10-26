import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fetchAllRows, POSTGREST_MAX_ROWS, type RowsPage } from "../src/lib/data/paged-rows.ts";

/*
 * POSTGREST 1000 QATOR CHEGARASI.
 *
 * Production'da `ranking_scores` ning joriy umumiy reytingi 3160 qator,
 * PostgREST esa javobni 1000 da qirqadi. Avval `.range(0, 19999)` bu
 * chegarani yengadi deb o'ylangan va katalogdagi nomzodlarning uchdan
 * ikkisida "0 ball" turgan. Bu testlar o'sha serverni taqlid qiladi.
 */

/** PostgREST kabi: `.range()` dan qat'i nazar `cap` dan ko'p qaytarmaydi. */
function fakeServer(total: number, cap: number, opts: { withCount?: boolean } = {}) {
  const rows = Array.from({ length: total }, (_, i) => ({ id: i }));
  const calls: Array<[number, number]> = [];
  const fetchPage = async (from: number, to: number): Promise<RowsPage<{ id: number }>> => {
    calls.push([from, to]);
    const end = Math.min(to + 1, from + cap, total);
    return { data: rows.slice(from, end), error: null, count: opts.withCount === false ? null : total };
  };
  return { fetchPage, calls };
}

test("3160 qator 1000 lik chegara ortidan to'liq va takrorsiz keladi", async () => {
  const { fetchPage, calls } = fakeServer(3160, 1000);
  const rows = await fetchAllRows(fetchPage);

  assert.equal(rows.length, 3160);
  assert.equal(new Set(rows.map((r) => r.id)).size, 3160);
  assert.deepEqual(rows.map((r) => r.id), Array.from({ length: 3160 }, (_, i) => i));
  assert.deepEqual(calls, [[0, 999], [1000, 1999], [2000, 2999], [3000, 3999]]);
});

test("server chegarasi 1000 dan kichik bo'lsa ham hech narsa tushib qolmaydi", async () => {
  // Sahifa o'lchami 1000, server esa 400 beradi — `count` bilan davom etadi.
  const { fetchPage } = fakeServer(3160, 400);
  const rows = await fetchAllRows(fetchPage);
  assert.equal(rows.length, 3160);
  assert.equal(new Set(rows.map((r) => r.id)).size, 3160);
});

test("aniq 1000 qator — ortiqcha so'rov yuborilmaydi", async () => {
  const { fetchPage, calls } = fakeServer(POSTGREST_MAX_ROWS, 1000);
  assert.equal((await fetchAllRows(fetchPage)).length, 1000);
  assert.equal(calls.length, 1);
});

test("bo'sh natija — bitta so'rov, bo'sh ro'yxat", async () => {
  const { fetchPage, calls } = fakeServer(0, 1000);
  assert.deepEqual(await fetchAllRows(fetchPage), []);
  assert.equal(calls.length, 1);
});

test("count kelmasa — chala sahifa ro'yxat oxiri deb olinadi", async () => {
  const { fetchPage } = fakeServer(2500, 1000, { withCount: false });
  assert.equal((await fetchAllRows(fetchPage)).length, 2500);
});

test("xato yashirilmaydi — qirqilgan ro'yxat to'liq deb qaytmaydi", async () => {
  let call = 0;
  const failing = async (): Promise<RowsPage<number>> => {
    call += 1;
    return call === 2
      ? { data: null, error: { message: "57014 statement timeout" } }
      : { data: Array(1000).fill(0), error: null, count: 3160 };
  };
  // PostgREST xatosi `Error` emas, oddiy obyekt — o'zi qanday kelsa, shunday otiladi.
  await assert.rejects(fetchAllRows(failing), (err: { message?: string }) => /57014/.test(err.message ?? ""));
});

test("sahifalar chegarasidan oshsa xato — cheksiz sikl yo'q", async () => {
  const { fetchPage } = fakeServer(10_000, 1000);
  await assert.rejects(fetchAllRows(fetchPage, { maxPages: 3 }), /sahifadan oshdi/);
});

/* ------------------------------------------------------------------ *
 * ULANISH
 * ------------------------------------------------------------------ */

test("umumiy reyting katta ro'yxatda sahifalab, barqaror tartib bilan o'qiladi", () => {
  const source = readFileSync("src/lib/data/candidate-ranking.ts", "utf8");
  assert.match(source, /fetchAllRows<OverallRow>\(/);
  assert.match(source, /\{ count: "exact" \}\)[\s\S]{0,120}\.order\("id"\)[\s\S]{0,40}\.range\(from, to\)/);
  assert.doesNotMatch(source, /MAX_ROWS = 20_000/, "range() 1000 chegarani yengmaydi");
});

test("AI qidiruvi ham ballni ichma-ich so'ramaydi", () => {
  const source = readFileSync("src/lib/ai/retrieval.ts", "utf8");
  // Embed sintaksisi: `alias:ranking_scores(` yoki select satri ichida.
  assert.doesNotMatch(source, /:\s*ranking_scores\s*\(|"[^"\n]*ranking_scores\s*\(/);
  assert.match(source, /getOverallRankings\(/);
});
