import { test } from "node:test";
import assert from "node:assert/strict";
import { orderByRanking, pageRange, totalPagesFor } from "../src/lib/data/catalog-order.ts";

/*
 * KATALOG TARTIBI VA SAHIFALASH.
 *
 * Katalog endi to'liq ro'yxatni bitta so'rovda olmaydi (PostgREST uni
 * 1000 da qirqardi). "Reyting" tartibi yengil qatorlardan quriladi — u
 * avvalgi `items.sort(...)` bilan AYNAN bir xil bo'lishi shart.
 */

const row = (id: string, full_name: string) => ({ id, full_name });

test("ball kamayishi bo'yicha, ballar teng bo'lsa ism bo'yicha (uz)", () => {
  const rows = [row("a", "Zokirov"), row("b", "Aliyev"), row("c", "Boboyev"), row("d", "Karimova")];
  const scores = new Map([["a", 10], ["b", 5], ["c", 10], ["d", 7]]);
  assert.deepEqual(orderByRanking(rows, scores), ["c", "a", "d", "b"]);
});

test("reyting qatori yo'q nomzod 0 ball bilan — oxirida, ism tartibida", () => {
  const rows = [row("x", "Yusupov"), row("y", "Abdullayev"), row("z", "Valiyev")];
  const scores = new Map([["z", 0.03]]);
  assert.deepEqual(orderByRanking(rows, scores), ["z", "y", "x"]);
});

test("ism ham teng bo'lsa kirish tartibi saqlanadi (barqaror)", () => {
  const rows = [row("new", "Aliyev Ali"), row("old", "Aliyev Ali")];
  assert.deepEqual(orderByRanking(rows, new Map()), ["new", "old"]);
});

test("avvalgi xotiradagi saralash bilan bir xil natija (3215 nomzod)", () => {
  // Haqiqiy hajmdagi tasodifiy to'plam: ko'p teng ballar va o'zbekcha ismlar.
  const names = ["O'g'iloy", "Oybek", "Shahzod", "Sh'ahlo", "G'ayrat", "Gulnoza", "Ch'ori", "Abbos", "Ziyoda", "Ulug'bek"];
  let seed = 42;
  const rand = () => ((seed = (seed * 1103515245 + 12345) % 2 ** 31) / 2 ** 31);
  const rows = Array.from({ length: 3215 }, (_, i) => row(`id-${i}`, `${names[i % names.length]} ${Math.floor(rand() * 50)}`));
  const scores = new Map(rows.filter(() => rand() < 0.4).map((r) => [r.id, Math.floor(rand() * 20)]));

  const legacy = rows
    .map((r) => ({ id: r.id, full_name: r.full_name, total_score: scores.get(r.id) ?? 0 }))
    .sort((a, b) => b.total_score - a.total_score || a.full_name.localeCompare(b.full_name, "uz"))
    .map((r) => r.id);

  const ordered = orderByRanking(rows, scores);
  assert.deepEqual(ordered, legacy);
  assert.equal(new Set(ordered).size, 3215, "takror yo'q");
});

test("sahifa chegaralari: 1-sahifa, o'rta, oxirgi", () => {
  assert.deepEqual(pageRange(1, 12), { from: 0, to: 11 });
  assert.deepEqual(pageRange(2, 12), { from: 12, to: 23 });
  assert.deepEqual(pageRange(268, 12), { from: 3204, to: 3215 });
  // 0 yoki manfiy — birinchi sahifa.
  assert.deepEqual(pageRange(0, 12), { from: 0, to: 11 });
});

test("sahifalar soni: 3215 nomzod -> 268 sahifa, bo'sh ro'yxat -> 1", () => {
  assert.equal(totalPagesFor(3215, 12), 268);
  assert.equal(totalPagesFor(12, 12), 1);
  assert.equal(totalPagesFor(13, 12), 2);
  assert.equal(totalPagesFor(0, 12), 1);
});

test("hamma sahifalar birga ro'yxatni takrorsiz va bo'shliqsiz qoplaydi", () => {
  const ids = Array.from({ length: 3215 }, (_, i) => i);
  const seen: number[] = [];
  for (let page = 1; page <= totalPagesFor(ids.length, 12); page++) {
    const { from, to } = pageRange(page, 12);
    seen.push(...ids.slice(from, to + 1));
  }
  assert.deepEqual(seen, ids);
});
