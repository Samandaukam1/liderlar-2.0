import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseRichText } from "../src/lib/articles/rich-text.ts";
import {
  articleOutline,
  DROP_CAP_MIN_LENGTH,
  headingIds,
  shouldDropCap,
  shouldDropCapText,
  slugifyHeading,
} from "../src/lib/articles/reading.ts";

/*
 * O'QISH OYNASI.
 *
 * Mundarija havolasi va sarlavha `id` si BIR XIL funksiyadan keladi —
 * bu test ular hech qachon ajralib ketmasligini qo'riqlaydi.
 */

/* ------------------------------------------------------------------ *
 * LANGARLAR
 * ------------------------------------------------------------------ */

test("sarlavha manzili: o'zbek apostroflari so'zni bo'lmaydi", () => {
  assert.equal(slugifyHeading("Mas'uliyat — lavozimdan oldin"), "masuliyat-lavozimdan-oldin");
  assert.equal(slugifyHeading("O‘zbekiston va g‘oyalar"), "ozbekiston-va-goyalar");
  assert.equal(slugifyHeading("  !!!  "), "bolim");
});

test("bir xil nomli sarlavhalar YAGONA id oladi", () => {
  const ids = [...headingIds(parseRichText("## Xulosa\nmatn\n## Xulosa\n## Xulosa")).values()];
  assert.deepEqual(ids, ["xulosa", "xulosa-2", "xulosa-3"]);
});

test("mundarija: kamida ikki sarlavha, darajasi bilan", () => {
  assert.deepEqual(articleOutline(parseRichText("## Bitta\nmatn")), [], "bitta bandli mundarija keraksiz");

  const outline = articleOutline(parseRichText("## Birinchi\nmatn\n### Ichki\n## Ikkinchi"));
  assert.deepEqual(
    outline.map((item) => `${item.level}:${item.id}`),
    ["2:birinchi", "3:ichki", "2:ikkinchi"],
  );
});

test("mundarija id lari chizuvchi beradigan id bilan bir xil", () => {
  const blocks = parseRichText("## A\nx\n## B\ny");
  const fromRenderer = [...headingIds(blocks).values()];
  const fromOutline = articleOutline(blocks).map((item) => item.id);
  assert.deepEqual(fromOutline, fromRenderer);
});

/* ------------------------------------------------------------------ *
 * BOSH HARF
 * ------------------------------------------------------------------ */

test("bosh harf faqat uzun birinchi abzatsda", () => {
  const long = "Y" + "a".repeat(DROP_CAP_MIN_LENGTH);
  assert.equal(shouldDropCap(parseRichText(long)), true);
  assert.equal(shouldDropCap(parseRichText("Qisqa kirish.")), false, "bir qatorli abzatsda bosh harf singan ko'rinadi");
  assert.equal(shouldDropCap(parseRichText(`## Sarlavha\n${long}`)), false, "matn sarlavha bilan boshlansa — yo'q");
  assert.equal(shouldDropCap(parseRichText(`2020-yil ${long}`)), false, "raqam bilan boshlansa — yo'q");
  assert.equal(shouldDropCapText(long), true);
  assert.equal(shouldDropCapText(null), false);
});

/* ------------------------------------------------------------------ *
 * BARCHA O'QISH SAHIFALARI — BITTA QOBIQ
 * ------------------------------------------------------------------ */

test("uchala maqola sahifasi umumiy o'qish oynasidan foydalanadi", () => {
  for (const page of [
    "src/app/liderlar-online/[slug]/page.tsx",
    "src/app/maqola/[slug]/page.tsx",
    "src/app/jurnal/maqola/[slug]/page.tsx",
  ]) {
    const source = readFileSync(page, "utf8");
    assert.match(source, /<ArticleReader\b/, `${page}: o'qish oynasi ishlatilmagan`);
    // Izohda tilga olinishi mumkin — faqat haqiqiy `className` tekshiriladi.
    assert.equal(/className="[^"]*whitespace-pre-wrap/.test(source), false, `${page}: xom matn chiqishi qaytgan`);
  }
});

test("matn o'lchami ichki matn blokiga ham yetib boradi", () => {
  /*
   * Faqat o'rovchiga qo'yilsa, ichki blokning Tailwind utilitasi uni
   * bosib ketardi va "A+" tugmasi matnga ta'sir qilmasdi (shunday
   * bo'lgan — brauzerda o'lchab topilgan).
   */
  const css = readFileSync("src/app/globals.css", "utf8");
  assert.match(css, /\[data-reader-size="lg"\] \.reader-body > \*/);
  assert.match(css, /\.reader-body,\s*\n\.reader-body > \* \{/);
});
