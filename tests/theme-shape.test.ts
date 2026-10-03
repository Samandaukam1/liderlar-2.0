import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  isVerified,
  range,
  safeUrl,
  toTimeline,
  trustLabel,
  year,
} from "../src/lib/themes/shape.ts";

test("yozuvlar bir xil shaklga keltiriladi", () => {
  const rows = [
    {
      id: "1",
      title: "Universitet",
      subtitle: "Bakalavr",
      date_from: "2015-09-01",
      date_to: "2019-06-30",
    },
  ];
  const [item] = toTimeline(rows);
  assert.equal(item!.title, "Universitet");
  assert.equal(item!.from, "2015-09-01");
  assert.equal(item!.to, "2019-06-30");
});

test("yetishmayotgan maydonlar null bo'ladi", () => {
  const [item] = toTimeline([{ id: "1", title: "Nom" }]);
  assert.equal(item!.subtitle, null);
  assert.equal(item!.from, null);
  assert.equal(item!.url, null);
});

test("sanadan faqat yil olinadi", () => {
  assert.equal(year("2015-09-01"), "2015");
  assert.equal(year(null), "");
});

test("tugash sanasi yo'q bo'lsa 'hozirgacha'", () => {
  /*
   * Bo'sh qoldirish "tugagan, lekin qachonligi noma'lum" degan
   * boshqa ma'no berardi.
   */
  assert.equal(range("2020-01-01", null), "2020 — hozirgacha");
  assert.equal(range("2015-01-01", "2019-01-01"), "2015 — 2019");
});

test("boshlanish sanasi yo'q bo'lsa oraliq bo'sh", () => {
  assert.equal(range(null, "2019-01-01"), "");
});

test("javascript: havolasi dizaynga YETIB BORMAYDI", () => {
  /*
   * Yozuvlar saqlanishda ham tekshiriladi, lekin dizayn shunga
   * tayanmaydi: eski ma'lumot tekshiruvdan oldin kiritilgan
   * bo'lishi mumkin (§58).
   */
  for (const url of [
    "javascript:alert(1)",
    "JavaScript:alert(1)",
    "data:text/html,<script>",
    "http://x.uz",
    "ftp://x.uz",
    "x.uz",
    "",
  ]) {
    assert.equal(safeUrl(url), null, url);
  }
  assert.equal(safeUrl("https://x.uz/a"), "https://x.uz/a");
});

test("ishonch belgisi UMUMIY modulda", () => {
  /*
   * Har dizayn matnni o'zicha yozsa, bittasida tasdiqlanmagan
   * sertifikat uchun "Tasdiqlangan" deb yozib qo'yilishi mumkin
   * edi (§8).
   */
  assert.equal(trustLabel("verified"), "Tasdiqlangan");
  assert.equal(trustLabel("user_entered"), "Foydalanuvchi kiritgan");
  assert.equal(trustLabel("pending_review"), "Foydalanuvchi kiritgan");
  assert.equal(trustLabel(null), "Foydalanuvchi kiritgan");
  assert.equal(isVerified("verified"), true);
  assert.equal(isVerified("user_entered"), false);
});

test("shape.ts hech narsa import qilmaydi", () => {
  const source = readFileSync("src/lib/themes/shape.ts", "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/[^\n]*/g, "");
  assert.equal(/^\s*import\s/m.test(source), false);
});

/* ------------------------------------------------------------------ *
 * DIZAYNLAR UMUMIY QOIDALARGA TAYANSIN
 * ------------------------------------------------------------------ */

import { readdirSync } from "node:fs";

const THEME_DIR = "src/components/themes";

function themeFiles(): string[] {
  return readdirSync(THEME_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => `${THEME_DIR}/${entry.name}/index.tsx`);
}

function code(path: string): string {
  return readFileSync(path, "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/[^\n]*/g, "");
}

test("kamida uch dizayn qurilgan", () => {
  assert.ok(themeFiles().length >= 3, `dizayn soni: ${themeFiles().length}`);
});

test("har bir dizayn ishonch belgisini UMUMIY moduldan oladi", () => {
  /*
   * ENG MUHIM TEST.
   *
   * Dizayn "Tasdiqlangan" so'zini o'zi yozsa, tasdiqlanmagan
   * sertifikat ham tasdiqlangan ko'rinardi — §8 aynan shuni
   * taqiqlaydi.
   */
  for (const file of themeFiles()) {
    const source = code(file);
    // Sertifikat ko'rsatadigan dizaynda belgi umumiy moduldan kelsin.
    if (!source.includes("certificates")) continue;

    assert.match(source, /trustLabel\(/, `${file}: trustLabel ishlatilmagan`);
    assert.equal(
      /"Tasdiqlangan"/.test(source),
      false,
      `${file}: "Tasdiqlangan" qo'lda yozilgan`,
    );
  }
});

test("har bir dizayn havolani UMUMIY tekshiruvdan o'tkazadi", () => {
  /*
   * Foydalanuvchi kiritgan havola `href` bo'lib chiqadi.
   * `javascript:` sxemasi saqlangan XSS bo'lardi (§58).
   */
  for (const file of themeFiles()) {
    const source = code(file);
    if (!source.includes("socialLinks")) continue;

    const usesShared = /safeUrl\(/.test(source);
    const usesInline = /startsWith\("https:\/\/"\)/.test(source);
    assert.ok(
      usesShared || usesInline,
      `${file}: havola tekshirilmagan`,
    );
  }
});

test("dizaynlar o'z palitrasini o'zi tashiydi", () => {
  /*
   * Ranglar Tailwind konfiguratsiyasida bo'lsa, dizayn olib
   * tashlanganda loyiha ranglari ifloslanib qolardi.
   */
  for (const file of themeFiles()) {
    const source = code(file);
    // Fayl ichida hex rang ta'riflari bo'lishi kerak.
    assert.match(source, /= "#[0-9a-f]{6}"/i, `${file}: palitra topilmadi`);
  }
});

test("dizaynlar bir-biridan FARQ qiladi — palitra takrorlanmaydi", () => {
  /*
   * §9: "theme 1 = blue, theme 2 = red" EMAS. Palitralar bir xil
   * bo'lsa, dizaynlar shunchaki rang almashtirishdan iborat
   * bo'lardi.
   */
  const palettes = new Map<string, string>();

  for (const file of themeFiles()) {
    const colors = [...code(file).matchAll(/= "(#[0-9a-f]{6})"/gi)]
      .map((m) => m[1]!.toLowerCase())
      .sort()
      .join(",");

    const clash = palettes.get(colors);
    assert.equal(clash, undefined, `${file} va ${clash} palitrasi bir xil`);
    palettes.set(colors, file);
  }
});

test("hech bir dizayn o'zi so'rov qilmaydi", () => {
  /*
   * §49: dizayn ma'lumotni `profile` propidan oladi. O'zi so'rov
   * qilsa, har bo'lim uchun alohida so'rov paydo bo'lardi.
   */
  for (const file of themeFiles()) {
    const source = code(file);
    assert.equal(/createAdminClient|createClient|from\("/.test(source), false, file);
    assert.equal(/await /.test(source), false, `${file}: async ish topildi`);
  }
});

test("galereya rasmida tavsif bo'lmasa ham alt bo'sh qolmaydi", () => {
  /*
   * Tavsif (`alt_text`) majburiy emas. U kiritilmaganda `alt=""` rasmni
   * ekran o'quvchisidan butunlay yashirardi — galereya esa mazmunli
   * rasmlar (tadbir, mukofot). Umumiy matn nomzod ismi bilan beriladi.
   */
  for (const file of themeFiles()) {
    const source = code(file);
    assert.equal(source.includes('alt={item.caption ?? ""}'), false, `${file}: bo'sh alt`);
    assert.match(source, /alt=\{item\.caption \?\? `\$\{profile\.full_name\} — galereya rasmi`\}/, file);
  }
});
