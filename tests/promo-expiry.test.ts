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

test("tekshiruv IKKALA yuborish yo‘lida ham bor", () => {
  /*
   * Forma ikki yo'ldan yuboriladi: API route va server action.
   * Faqat bittasini himoyalash teshik qoldirardi.
   */
  assert.match(src("src/app/api/application/submit/route.ts"), /checkPromoCodeUsable\(promoCode\)/);
  assert.match(src("src/app/ariza/actions.ts"), /checkPromoCodeUsable\(promoCode\)/);
});

test("xabar AYNAN promo maydonida ko‘rsatiladi", () => {
  /*
   * Umumiy oyna "xatolik bor" deydi va nomzod nima noto'g'ri
   * ekanini qidirishga majbur bo'ladi.
   */
  assert.match(src("src/app/api/application/submit/route.ts"), /field: "promoCode"/);
  assert.match(src("src/components/forms/application-form.tsx"), /setError\(result\.field/);
});

test("xizmat yiqilsa ariza YO‘QOLMAYDI", () => {
  /*
   * Bir nechta eskirgan kod o'tib ketgani nomzodni butunlay
   * yo'qotishdan arzonroq.
   */
  const check = src("src/lib/promo/expiry-check.ts");
  assert.match(check, /catch/);
  const catchBlock = check.match(/\} catch[\s\S]*?\}/);
  assert.ok(catchBlock);
  assert.match(catchBlock[0], /error: null/);
});

test("faqat MUDDATI TUGAGAN kodlar o‘qiladi", () => {
  // Amal qilayotgan kodlar ro'yxati bu yerda kerak emas.
  const check = src("src/lib/promo/expiry-check.ts");
  assert.match(check, /\.not\("expires_at", "is", null\)/);
  assert.match(check, /\.lte\("expires_at"/);
});

test("xabar matni talab qilinganidek", () => {
  assert.match(EXPIRED_PROMO_MESSAGE, /amal qilish muddati tugagan/);
});
