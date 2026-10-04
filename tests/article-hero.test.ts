import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  checkHeroDimensions,
  heroAspect,
  HERO_RECOMMENDATION_TEXT,
  HERO_RECOMMENDED,
} from "../src/lib/articles/hero-rules.ts";

test("tavsiya 16:9 — 1600 × 900, matnda aniq yozilgan", () => {
  assert.equal(HERO_RECOMMENDED.width / HERO_RECOMMENDED.height, 16 / 9);
  assert.match(HERO_RECOMMENDATION_TEXT, /1600 × 900 px \(16:9\)/);
  assert.match(HERO_RECOMMENDATION_TEXT, /1200 × 675/);
  assert.match(HERO_RECOMMENDATION_TEXT, /JPG, PNG, WebP/);
  assert.match(HERO_RECOMMENDATION_TEXT, /8 MB/);
});

test("16:9 nisbat maqola sahifasidagi bannerga mos (aspect-video)", () => {
  /*
   * Banner endi umumiy o'qish oynasida chiziladi (`ArticleReader`).
   * Sahifa unga muqovani beradi, nisbat esa qobiqda — ikkalasi ham
   * tekshiriladi, aks holda biri o'zgarsa test buni sezmasdi.
   */
  const page = readFileSync("src/app/liderlar-online/[slug]/page.tsx", "utf8");
  assert.match(page, /<ArticleReader[\s\S]*cover=\{\{ url: article\.heroUrl/);

  const reader = readFileSync("src/components/reader/article-reader.tsx", "utf8");
  const figure = reader.slice(reader.indexOf("<figure"), reader.indexOf("</figure>"));
  assert.match(figure, /aspect-video/);
});

test("kichik rasm rad etiladi, 16:9 dan farqlisi — ogohlantirish", () => {
  assert.equal(checkHeroDimensions(800, 450).ok, false);
  const ok = checkHeroDimensions(1600, 900);
  assert.deepEqual(ok, { ok: true, warning: null });
  const square = checkHeroDimensions(1500, 1500);
  assert.ok(square.ok && square.warning);
});

test("masonry nisbati: noma'lum o'lcham 16:9, haddan tashqari cho'ziq cheklanadi", () => {
  assert.equal(heroAspect(null, null), 16 / 9);
  assert.equal(heroAspect(4000, 100), 2.4);
  assert.equal(heroAspect(100, 4000), 0.5);
});
