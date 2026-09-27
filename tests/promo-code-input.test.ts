import { test } from "node:test";
import assert from "node:assert/strict";
import { applicationSchema, normalizePromoCode } from "../src/lib/validation/application.ts";

/*
 * Arizada promo kod — nomzod koordinator bergan kodni AYNAN
 * ko'chiradi. Uni "noto'g'ri shakl" deb qaytarish nomzodni ham,
 * koordinatorni ham yo'qotadi.
 */

const BASE = {
  fullName: "Nomzodov Nomzod",
  phone: "+998901112233",
  telegram: "@nomzod",
  gender: "male" as const,
  ageRange: "19-24" as const,
  regionId: "0f2b1f4e-7c1a-4f4e-9b2a-8f5d6c7e1a2b",
  consent: true as const,
};

function parsePromo(promoCode: string) {
  return applicationSchema.safeParse({ ...BASE, promoCode });
}

test("promo kod BO‘SH bo‘lishi mumkin", () => {
  const result = parsePromo("");
  assert.equal(result.success, true, JSON.stringify(result.error?.issues));
});

test("istalgan shakldagi kod QABUL QILINADI", () => {
  /*
   * Ilgari `^[A-Z0-9-]{2,32}$` talab qilinardi va quyidagilarning
   * hammasi rad etilardi.
   */
  const codes = [
    "ALI_2026",
    "ALI.2026",
    "ali 2026",
    "АЛИ2026",
    "A",
    "ALI+2026",
    "ALI/2026",
    "2026",
    "Oʻzak",
  ];
  for (const code of codes) {
    const result = parsePromo(code);
    assert.equal(
      result.success,
      true,
      `"${code}" rad etildi: ${JSON.stringify(result.error?.issues.map((i) => i.message))}`,
    );
  }
});

test("juda uzun kod hali ham rad etiladi", () => {
  // Bu maydon baza ustuniga yoziladi — cheksiz matn qabul qilinmaydi.
  const result = parsePromo("A".repeat(65));
  assert.equal(result.success, false);
});

test("kod bosh harfga o‘tadi va bo‘shliqsiz saqlanadi", () => {
  /*
   * Solishtirish admin tomonda bo'ladi, lekin saqlanadigan shakl
   * barqaror bo'lishi kerak: "ali 2026" va "ALI2026" bitta qator.
   */
  assert.equal(normalizePromoCode("ali 2026"), "ALI2026");
  assert.equal(normalizePromoCode("  ALI-2026 "), "ALI-2026");

  const result = parsePromo("ali 2026");
  assert.equal(result.success, true);
  if (result.success) assert.equal(result.data.promoCode, "ALI2026");
});

test("eski xato matni endi chiqmaydi", () => {
  const result = parsePromo("ALI_2026");
  const messages = (result.error?.issues ?? []).map((issue) => issue.message).join(" ");
  assert.ok(!messages.includes("tiredan iborat"), messages);
});
