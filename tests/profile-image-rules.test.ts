import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  ACCEPTED_MIME,
  AVATAR_CHANGES_PER_DAY,
  checkDimensions,
  checkImageMeta,
  cleanAltText,
  IMAGE_RULES,
  isImageKind,
  scaledSize,
} from "../src/lib/profile-editor/image-rules.ts";

/* ------------------------------------------------------------------ *
 * SVG — saqlangan XSS xavfi
 * ------------------------------------------------------------------ */

test("SVG qabul qilinmaydi", () => {
  /*
   * SVG ichida skript bo'lishi mumkin va u ommaviy profilda
   * ko'rsatilsa saqlangan XSS bo'lardi (§58).
   */
  assert.equal((ACCEPTED_MIME as readonly string[]).includes("image/svg+xml"), false);

  const result = checkImageMeta({
    kind: "avatar",
    mimeType: "image/svg+xml",
    size: 1000,
    existingCount: 0,
  });
  assert.equal(result.ok, false);
  assert.equal(result.problem, "mime");
});

test("faqat JPG, PNG va WebP o'tadi", () => {
  for (const mime of ["image/jpeg", "image/png", "image/webp"]) {
    const result = checkImageMeta({ kind: "avatar", mimeType: mime, size: 1000, existingCount: 0 });
    assert.equal(result.ok, true, mime);
  }
  for (const mime of ["image/gif", "application/pdf", "text/html", "", null]) {
    const result = checkImageMeta({ kind: "avatar", mimeType: mime, size: 1000, existingCount: 0 });
    assert.equal(result.ok, false, String(mime));
  }
});

/* ------------------------------------------------------------------ *
 * TUR
 * ------------------------------------------------------------------ */

test("noma'lum tur rad etiladi", () => {
  /*
   * `kind` bucket nomiga aylanadi, ya'ni tekshirilmasa ixtiyoriy
   * bucketga yozish imkoni paydo bo'lardi.
   */
  for (const kind of ["admin-private-files", "journal-pdfs", "", null, 1]) {
    assert.equal(isImageKind(kind), false, String(kind));
  }
  assert.equal(isImageKind("avatar"), true);
  assert.equal(isImageKind("gallery"), true);
});

test("tur faqat nomzod bucketlariga ishora qiladi", () => {
  for (const rule of Object.values(IMAGE_RULES)) {
    assert.match(rule.bucket, /^candidate-/, rule.bucket);
  }
});

/* ------------------------------------------------------------------ *
 * HAJM VA O'LCHAM
 * ------------------------------------------------------------------ */

test("katta fayl rad etiladi", () => {
  const result = checkImageMeta({
    kind: "avatar",
    mimeType: "image/jpeg",
    size: 5 * 1024 * 1024,
    existingCount: 0,
  });
  assert.equal(result.ok, false);
  assert.equal(result.problem, "too_large");
  // Xabar aniq chegarani aytadi.
  assert.match(result.error!, /4 MB/);
});

test("bo'sh fayl rad etiladi", () => {
  for (const size of [0, -1, NaN, null, "salom"]) {
    const result = checkImageMeta({
      kind: "avatar",
      mimeType: "image/jpeg",
      size,
      existingCount: 0,
    });
    assert.equal(result.ok, false, String(size));
  }
});

test("o'rin tugaganda rad etiladi", () => {
  const result = checkImageMeta({
    kind: "avatar",
    mimeType: "image/jpeg",
    size: 1000,
    existingCount: 1,
  });
  assert.equal(result.problem, "too_many");
});

test("galereyada 12 ta o'rin bor", () => {
  assert.equal(IMAGE_RULES.gallery.maxCount, 12);
  const ok = checkImageMeta({
    kind: "gallery",
    mimeType: "image/jpeg",
    size: 1000,
    existingCount: 11,
  });
  assert.equal(ok.ok, true);
});

test("juda kichik rasm rad etiladi", () => {
  // Cho'zilgan sifatsiz portret profilga soya tashlaydi (§7).
  const result = checkDimensions("avatar", 200, 200);
  assert.equal(result.ok, false);
  assert.equal(result.problem, "too_small_dimension");
});

test("eng kichik tomoni bo'yicha tekshiriladi", () => {
  // Keng, lekin past rasm ham rad etilishi kerak.
  assert.equal(checkDimensions("avatar", 2000, 300).ok, false);
  assert.equal(checkDimensions("avatar", 400, 400).ok, true);
});

/* ------------------------------------------------------------------ *
 * KICHRAYTIRISH — egress yechimining qismi
 * ------------------------------------------------------------------ */

test("katta rasm nisbatni saqlab kichrayadi", () => {
  const result = scaledSize("gallery", { width: 6000, height: 4000 });
  assert.equal(result.width, 2000);
  assert.equal(result.height, 1333);
});

test("balandligi kattaroq rasm ham to'g'ri kichrayadi", () => {
  const result = scaledSize("avatar", { width: 2000, height: 4000 });
  assert.equal(result.height, 1200);
  assert.equal(result.width, 600);
});

test("kichik rasm KATTALASHTIRILMAYDI", () => {
  /*
   * Cho'zish sifatni oshirmaydi, faqat fayl hajmini — ya'ni
   * egressni — oshiradi.
   */
  const result = scaledSize("gallery", { width: 800, height: 600 });
  assert.deepEqual(result, { width: 800, height: 600 });
});

test("kichraytirilgan o'lcham chegaradan oshmaydi", () => {
  for (const source of [
    { width: 6001, height: 1 },
    { width: 1, height: 6001 },
    { width: 2001, height: 2001 },
  ]) {
    const result = scaledSize("gallery", source);
    assert.ok(Math.max(result.width, result.height) <= 2000, JSON.stringify(result));
    assert.ok(result.width >= 1 && result.height >= 1);
  }
});

/* ------------------------------------------------------------------ *
 * ALT MATN
 * ------------------------------------------------------------------ */

test("alt matn tozalanadi", () => {
  assert.equal(cleanAltText("  Ikki   so'z  "), "Ikki so'z");
  assert.equal(cleanAltText(""), null);
  assert.equal(cleanAltText("   "), null);
  assert.equal(cleanAltText(null), null);
  assert.equal(cleanAltText(42), null);
});

test("uzun alt matn qirqiladi", () => {
  const result = cleanAltText("x".repeat(500));
  assert.equal(result!.length, 200);
});

test("uzun alt matn emojini yarmidan kesmaydi", () => {
  // 199 harf + emoji (ikki UTF-16 birligi): 200-belgi emoji bo'lib qolishi kerak.
  const result = cleanAltText(`${"x".repeat(199)}😀${"y".repeat(10)}`)!;
  assert.equal(Array.from(result).length, 200);
  assert.ok(result.endsWith("😀"));
  assert.doesNotMatch(
    result,
    /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/,
    "juftsiz surrogat qoldi",
  );
  // Kesilgan joyda bo'sh joy qolmaydi (bazadagi CHECK btrim bilan o'lchaydi).
  assert.equal(cleanAltText(`${"x".repeat(199)} ${"y".repeat(10)}`), "x".repeat(199));
});

/* ------------------------------------------------------------------ *
 * EGRESS SOZLAMASI
 * ------------------------------------------------------------------ */

test("rasm keshi standart 4 soatdan uzun", () => {
  /*
   * Standart 14400 (4 soat) bo'lsa, optimizator ASL rasmni har 4
   * soatda Supabase'dan qayta yuklab oladi — ishlab chiqarishdagi
   * yuqori Cached Egress aynan shundan edi (§7).
   */
  const config = readFileSync("next.config.ts", "utf8");
  const match = config.match(/minimumCacheTTL:\s*(\d+)/);
  assert.ok(match, "minimumCacheTTL sozlanmagan");
  assert.ok(Number(match![1]) > 14400, `TTL juda qisqa: ${match![1]}`);
});

/* ------------------------------------------------------------------ *
 * Chegara
 * ------------------------------------------------------------------ */

test("image-rules.ts hech narsa import qilmaydi", () => {
  const source = readFileSync("src/lib/profile-editor/image-rules.ts", "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/[^\n]*/g, "");
  assert.equal(/^\s*import\s/m.test(source), false);
});

/* ------------------------------------------------------------------ *
 * YUKLASH XAVFSIZLIGI
 * ------------------------------------------------------------------ */

function source(path: string): string {
  return readFileSync(path, "utf8");
}

const UPLOAD_SERVICE = "src/lib/profile-editor/upload-service.ts";

test("manzil SERVERDA yasaladi, brauzerdan qabul qilinmaydi", () => {
  /*
   * Manzil brauzerdan kelsa, odam `../` yoki boshqa nomzodning
   * papkasini yozib yuborishi mumkin bo'lardi.
   */
  const code = source(UPLOAD_SERVICE);
  assert.match(code, /function buildPath\(candidateId: string/);
  assert.match(code, /randomUUID\(\)/);
});

test("tasdiqlashda manzil shu nomzodga tegishliligi tekshiriladi", () => {
  /*
   * `path` tasdiqlash so'rovida brauzerdan QAYTIB keladi. Tekshirilmasa,
   * begona fayl shu profilga bog'lanib qolardi.
   */
  const code = source(UPLOAD_SERVICE);
  assert.match(code, /expectedPrefix = `candidates\/\$\{candidateId\}\//);
  assert.match(code, /startsWith\(expectedPrefix\)/);
  // `..` ham to'siladi.
  assert.match(code, /includes\("\.\."\)/);
});

test("tasdiqlashda hajm va tur QAYTA tekshiriladi", () => {
  /*
   * Imzo MANZILGA beriladi, mazmunga emas — ya'ni brauzer imzo
   * olgandan keyin boshqa fayl yuborishi mumkin.
   */
  const code = source(UPLOAD_SERVICE);
  const commitAt = code.indexOf("export async function commitProfileUpload");
  assert.ok(commitAt > 0);
  const commitBody = code.slice(commitAt);
  assert.match(commitBody, /checkImageMeta\(/);
  // Qoidadan o'tmagan fayl o'chiriladi.
  assert.match(commitBody, /storage\.from\(bucket\)\.remove\(\[path\]\)/);
});

test("sanoq o'qilmasa chegara TO'LGAN deb qaraladi", () => {
  // 0 qaytarish cheksiz yuklashga yo'l ochardi (fail closed).
  const code = source(UPLOAD_SERVICE);
  const countAt = code.indexOf("async function countGallery");
  assert.ok(countAt > 0, "countGallery topilmadi");
  const countBody = code.slice(countAt, code.indexOf("\n}", countAt));
  assert.match(countBody, /return IMAGE_RULES\.gallery\.maxCount/);

  // Profil rasmi sanog'i o'qilmasa ham yuklash rad etiladi.
  const avatarAt = code.indexOf("async function recentAvatarChanges");
  const avatarBody = code.slice(avatarAt, code.indexOf("\n}", avatarAt));
  assert.match(avatarBody, /return null;/);
});

test("galereya rasmlarida sizes va lazy berilgan", () => {
  /*
   * `sizes` bo'lmasa optimizator eng katta variantni tanlardi va
   * kichkina katakcha uchun ortiqcha katta fayl yuklanardi — §7
   * egress muammosining yana bir ko'rinishi.
   */
  const code = source("src/components/profile-editor/images-section.tsx");
  /*
   * Katakcha kengligi to'r ustunlariga mos: telefonda 2 ustun (50vw),
   * kattaroq ekranda 3 ustun (33vw). Tavsif katakcha ostida turgani
   * uchun to'r kengaytirilgan.
   */
  assert.match(code, /grid-cols-2 gap-2 sm:grid-cols-3/);
  assert.match(code, /sizes="\(max-width: 640px\) 50vw, 33vw"/);
  assert.match(code, /loading="lazy"/);
});

test("rasm o'chirish FAYLNI o'chirmaydi", () => {
  /*
   * Rasm boshqa joyda ishlatilgan bo'lishi mumkin; faylni darhol
   * o'chirish o'sha joylarda buzilgan rasm qoldirardi.
   */
  const code = source(UPLOAD_SERVICE);
  const removeAt = code.indexOf("export async function removeGalleryImage");
  const removeBody = code.slice(removeAt);
  assert.match(removeBody, /deleted_at: new Date\(\)/);
  assert.equal(/storage\.from\([^)]*\)\.remove/.test(removeBody), false);
});

test("profil rasmi almashtiriladi — mavjud rasm o'rinni band qilmaydi", () => {
  /*
   * Avval imzo bosqichi mavjud avatarni "o'rin band" deb sanardi va
   * rasm qo'ygan odam "Almashtirish" ni bosganda "o'rin tugadi, avval
   * o'chiring" xatosini olardi — avatarni o'chirish tugmasi esa yo'q.
   */
  const service = readFileSync("src/lib/profile-editor/upload-service.ts", "utf8");
  const sign = service.slice(
    service.indexOf("export async function signProfileUpload"),
    service.indexOf("export async function commitProfileUpload"),
  );
  assert.match(sign, /if \(kind === "avatar"\) \{[\s\S]*?recentAvatarChanges\(/);
  assert.match(sign, /recent >= AVATAR_CHANGES_PER_DAY/);
  // O'qib bo'lmasa — rad (fail closed).
  assert.match(sign, /if \(recent === null\)/);
  assert.doesNotMatch(
    service.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, ""),
    /select\("avatar_url"\)/,
  );

  assert.ok(AVATAR_CHANGES_PER_DAY >= 1 && AVATAR_CHANGES_PER_DAY <= 10);
  assert.equal(
    checkImageMeta({ kind: "avatar", mimeType: "image/jpeg", size: 1000, existingCount: 0 }).ok,
    true,
  );
});
