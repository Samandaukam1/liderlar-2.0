import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { applicationSchema } from "../src/lib/validation/application.ts";

const action = readFileSync("src/app/ariza/actions.ts", "utf8");
const route = readFileSync("src/app/api/application/submit/route.ts", "utf8");
const form = readFileSync("src/components/forms/application-form.tsx", "utf8");
const page = readFileSync("src/app/ariza/page.tsx", "utf8");

/** Yaroqli ariza — sintetik qiymatlar, haqiqiy mijoz ma'lumoti emas. */
const validApplication = (over: Record<string, unknown> = {}) => ({
  fullName: "KARIMOV AZIZ",
  phone: "+998901234567",
  telegram: "@karimov_test",
  gender: "male",
  ageRange: "19-24",
  regionId: "3f1c9a2e-5b47-4d81-9c30-7ae2f6b81d54",
  promoCode: "",
  consent: true,
  ...over,
});

/* ======================= 1. HUDUD MAJBURIY ============================= */

test("hududsiz ariza QABUL QILINMAYDI", () => {
  const withoutRegion = validApplication();
  delete (withoutRegion as Record<string, unknown>).regionId;

  const parsed = applicationSchema.safeParse(withoutRegion);
  assert.equal(parsed.success, false);
});

test("bo‘sh hudud ham qabul qilinmaydi", () => {
  // Brauzerdagi bo'sh `<option>` shu qiymatni yuboradi.
  for (const empty of ["", null, undefined]) {
    const parsed = applicationSchema.safeParse(validApplication({ regionId: empty }));
    assert.equal(parsed.success, false, String(empty));
  }
});

test("xato matni o‘zbekcha va aniq", () => {
  const parsed = applicationSchema.safeParse(validApplication({ regionId: "" }));
  assert.equal(parsed.success, false);
  if (!parsed.success) {
    const message = parsed.error.issues.find((i) => i.path[0] === "regionId")?.message;
    assert.equal(message, "Hududingizni tanlang");
  }
});

test("hudud IDENTIFIKATOR bo‘lishi kerak, matn emas", () => {
  /*
   * Nom o'zgarishi mumkin ("Farg'ona" -> "Farg'ona viloyati"),
   * identifikator esa o'zgarmaydi. Katalog filtri va nomzodga
   * aylantirish oqimi allaqachon shu ustunga tayanadi.
   */
  const byName = applicationSchema.safeParse(validApplication({ regionId: "Toshkent shahri" }));
  assert.equal(byName.success, false);

  const byId = applicationSchema.safeParse(validApplication());
  assert.equal(byId.success, true);
});

test("to‘liq ariza o‘tadi", () => {
  const parsed = applicationSchema.safeParse(validApplication());
  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.equal(parsed.data.regionId, "3f1c9a2e-5b47-4d81-9c30-7ae2f6b81d54");
  }
});

/* ==================== 2. IKKALA KIRISH NUQTASI ========================= */

test("hudud IKKALA yo‘lda ham saqlanadi", () => {
  // Forma server action orqali, tashqi so'rovlar API orqali keladi.
  // Bittasida unutilsa, arizalarning bir qismi hududsiz qolardi.
  for (const [name, src] of [["action", action], ["api", route]] as const) {
    assert.ok(src.includes("region_id: regionId"), `${name}: region_id yozilsin`);
    assert.ok(src.includes("regionId"), `${name}: schema'dan olinsin`);
  }
});

test("ikkala yo‘l BIR XIL sxemadan foydalanadi", () => {
  // Ikki sxema bo'lsa, biri majburiy qilinib ikkinchisi unutilardi.
  assert.ok(action.includes("applicationSchema"));
  assert.ok(route.includes("applicationSchema"));
});

/* ========================= 3. FORMA KO'RINISHI ========================= */

test("hudud ro‘yxati BAZADAN keladi", () => {
  /*
   * Kodga yozib qo'yilsa ikkita manba paydo bo'lardi va ular vaqt
   * o'tib ajralib ketardi: katalog filtri bir nomni, ariza formasi
   * boshqasini ko'rsatardi.
   */
  assert.ok(page.includes("getRegions()"));
  assert.ok(form.includes("regions.map("), "ro‘yxat prop’dan chiziladi");
  assert.ok(!form.includes("Qashqadaryo"), "kodda hudud nomi qotib qolmasin");
});

test("birinchi variant BO‘SH — jimgina standart tanlanmaydi", () => {
  // Aks holda brauzer birinchisini tanlab, hamma ariza "Toshkent
  // shahri" bo‘lib ketardi va buni hech kim sezmasdi.
  assert.ok(form.includes('defaultValue=""'));
  assert.ok(form.includes('<option value="" disabled>'));
});

test("maydon majburiy deb belgilangan", () => {
  assert.ok(form.includes("Hududingiz *"));
});

test("ro‘yxat yuklanmasa forma KO‘RSATILMAYDI", () => {
  // Hudud majburiy — ro'yxatsiz to'g'ri ariza qabul qilib bo'lmaydi.
  // Yarim ishlaydigan forma odam vaqtini oladi va baribir rad etiladi.
  assert.ok(page.includes("regionsFailed"));
  assert.ok(page.includes("regions.length === 0"));
  assert.ok(page.includes("qayta urinib ko"));
});

test("sahifa dinamik — ro‘yxat keshda qotib qolmaydi", () => {
  assert.ok(page.includes('export const dynamic = "force-dynamic"'));
});
