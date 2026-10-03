import { test } from "node:test";
import assert from "node:assert/strict";
import { addYears, annualFeeStatus, tashkentDay, ANNUAL_FEE_UZS } from "../src/lib/kabinet/annual-fee.ts";

const PUBLISHED = "2026-07-26T11:06:22Z"; // Toshkent: 2026-07-26

test("badal 38 000 so'm", () => {
  assert.equal(ANNUAL_FEE_UZS, 38000);
});

test("nashr sanasi noma'lum — sana o'ylab topilmaydi", () => {
  const s = annualFeeStatus({ publishedAt: null, paidCycleStarts: [], today: "2026-10-04" });
  assert.equal(s.state, "unknown");
  assert.equal(s.dueDate, null);
});

test("birinchi yilliq kungacha: qolgan kun to'g'ri", () => {
  const s = annualFeeStatus({ publishedAt: PUBLISHED, paidCycleStarts: [], today: "2026-10-04" });
  assert.equal(s.state, "upcoming");
  assert.equal(s.referenceDate, "2026-07-26");
  assert.equal(s.dueDate, "2027-07-26");
  assert.equal(s.daysLeft, 295);
});

test("30 kun qolganda ogohlantirish", () => {
  const s = annualFeeStatus({ publishedAt: PUBLISHED, paidCycleStarts: [], today: "2027-07-10" });
  assert.equal(s.state, "soon");
  assert.equal(s.daysLeft, 16);
});

test("yilliq kun o'tdi, to'lov qayd etilmagan — muddati o'tgan", () => {
  const s = annualFeeStatus({ publishedAt: PUBLISHED, paidCycleStarts: [], today: "2027-08-05" });
  assert.equal(s.state, "overdue");
  assert.equal(s.dueDate, "2027-07-26");
  assert.equal(s.daysLeft, -10);
});

test("to'lov FAQAT qayd etilgan yozuvdan — keyingi sikl hisoblanadi", () => {
  const s = annualFeeStatus({ publishedAt: PUBLISHED, paidCycleStarts: ["2027-07-26"], today: "2027-08-05" });
  assert.equal(s.state, "paid");
  assert.equal(s.dueDate, "2028-07-26");
});

test("Toshkent kuni: UTC 19:30 — ertasi kun", () => {
  assert.equal(tashkentDay("2026-07-25T19:30:00Z"), "2026-07-26");
});

test("29-fevral: yo'q yilda 28-fevral", () => {
  assert.equal(addYears("2028-02-29", 1), "2029-02-28");
  assert.equal(addYears("2028-02-29", 4), "2032-02-29");
});

test("annual-fee.ts hech narsa import qilmaydi", async () => {
  const { readFileSync } = await import("node:fs");
  assert.doesNotMatch(readFileSync("src/lib/kabinet/annual-fee.ts", "utf8"), /^\s*import\s/m);
});
