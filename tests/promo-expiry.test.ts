import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  EXPIRED_PROMO_MESSAGE,
  findExpiredPromo,
  foldPromoCode,
  looksLikeSameCode,
  toleranceFor,
} from "../src/lib/promo/code-match.ts";

function src(path: string): string {
  return readFileSync(path, "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
}

const EXPIRED = [
  { code: "TSULTAVSIYA", rawCode: "TSUL-TAVSIYA", expiresAt: "2026-09-01T00:00:00.000Z" },
  { code: "ALI2026", rawCode: "ALI2026", expiresAt: "2026-08-01T00:00:00.000Z" },
];

/* ===================================================================== *
 * BIR KODNING KO'RINISHLARI
 * ===================================================================== */

test("bitta kodning turli yozuvlari BIR XIL deb qaraladi", () => {
  /*
   * Nomzod kodni eshitib yozadi yoki ko'chirib oladi. Bitta kod
   * o'nlab ko'rinishda keladi va ularning hammasi to'silishi
   * kerak — aks holda muddati tugagan kod bemalol o'tib ketardi.
   */
  const variants = [
    "TSULTAVSIYA",
    "tsul-tavsiya",
    "TSUL TAVSIYA",
    "tsul_tavsiya",
    "TSULTAVSIYASIYA",
    "TSULTAVS1YA",
  ];
  for (const variant of variants) {
    assert.equal(
      looksLikeSameCode("TSULTAVSIYA", variant),
      true,
      `"${variant}" tutilmadi (${foldPromoCode(variant)})`,
    );
  }
});

test("KIRILLCHA yozuv ham o‘sha kod", () => {
  /*
   * Kod lotinda e'lon qilinadi, lekin klaviaturasi kirillda
   * bo'lgan odam uni kirillda yozadi.
   */
  assert.equal(looksLikeSameCode("TSULTAVSIYA", "ЦУЛТАВСИЯ"), true);
  assert.equal(looksLikeSameCode("TSULTAVSIYA", "ЦУЛТАВСИЯСИЯ"), true);
});

test("BOSHQA kodlar birlashib ketmaydi", () => {
  /*
   * Eng qimmat xato shu tomonda emas (natija — rad etish), lekin
   * butunlay boshqa kampaniyani to'sib qo'yish ham nomzodni
   * yo'qotadi.
   */
  for (const other of ["ALI2026", "BOSHQAKOD", "TAVSIYA", "SIYA", "TS"]) {
    assert.equal(
      looksLikeSameCode("TSULTAVSIYA", other),
      false,
      `"${other}" noto‘g‘ri mos keldi`,
    );
  }
});

test("«TAVSIYA» alohida kod bo‘lib qoladi", () => {
  /*
   * "ichida bor" qoidasi juda keng edi: "TAVSIYA" kodi
   * "TSULTAVSIYA" ichida uchraydi. Endi faqat BOSHIDAN
   * tekshiriladi.
   */
  assert.equal(looksLikeSameCode("TAVSIYA", "TSULTAVSIYA"), false);
  // Bo'g'in takrorlanishi esa oxiriga qo'shiladi va tutiladi.
  assert.equal(looksLikeSameCode("TAVSIYA", "TAVSIYASIYA"), true);
});

test("qisqa kodlar chalkashtirilmaydi", () => {
  assert.equal(toleranceFor(3), 0);
  assert.equal(looksLikeSameCode("AB1", "AB2"), false);
});

/* ===================================================================== *
 * TO'SISH QARORI
 * ===================================================================== */

test("muddati tugagan kod TOPILADI", () => {
  const match = findExpiredPromo("ЦУЛТАВСИЯСИЯ", EXPIRED);
  assert.ok(match, "topilmadi");
  assert.equal(match.code.code, "TSULTAVSIYA");
  assert.equal(match.exact, false);
});

test("aynan mos kod ALOHIDA belgilanadi", () => {
  const match = findExpiredPromo("tsul tavsiya", EXPIRED);
  assert.ok(match);
  assert.equal(match.exact, true);
});

test("ro‘yxatda bo‘lmagan kod TO‘SILMAYDI", () => {
  /*
   * Har kodni oldindan ro'yxatga olish shart emas; noma'lum kod
   * uchun arizani rad etish nomzodni yo'qotardi.
   */
  assert.equal(findExpiredPromo("YANGIKOD2026", EXPIRED), null);
});

test("bo‘sh kod tekshirilmaydi", () => {
  assert.equal(findExpiredPromo("", EXPIRED), null);
  assert.equal(findExpiredPromo(null, EXPIRED), null);
  assert.equal(findExpiredPromo("   ", EXPIRED), null);
});

/* ===================================================================== *
 * ULANISH
 * ===================================================================== */

test("ISTALGAN kod qabul qilinadi — muddati tugagani ham arizani to'xtatmaydi", () => {
  /*
   * Egasining qarori (2026-10-03): promo kod ixtiyoriy va istalgan kod
   * qabul qilinadi. Avval muddati tugagan kod bu yerda rad etilardi
   * (`checkPromoCodeUsable`); endi kod yozilganidek saqlanadi va
   * imtiyozni operator hal qiladi.
   */
  for (const path of ["src/app/api/application/submit/route.ts", "src/app/ariza/actions.ts"]) {
    const code = src(path);
    assert.doesNotMatch(code, /checkPromoCodeUsable|checkPromoGate/, `${path}: promo to'sig'i qolgan`);
    assert.doesNotMatch(code, /field: "promoCode"/, `${path}: promo maydoni uchun xato qaytaryapti`);
    // Kod saqlanadi.
    assert.match(code, /promo_code: promoCode \|\| null/);
  }
});

test("xabar matni talab qilinganidek", () => {
  assert.match(EXPIRED_PROMO_MESSAGE, /amal qilish muddati tugagan/);
});
