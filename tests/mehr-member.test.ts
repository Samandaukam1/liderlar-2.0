import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import {
  issueLinkToken,
  hashLinkToken,
  telegramDeepLink,
  LINK_TOKEN_TTL_SECONDS,
} from "../src/lib/mehr/link-token.ts";
import { normalizeCode } from "../src/lib/mehr/certificate-code.ts";
import { periodKeyFor } from "../src/lib/mehr/period.ts";

const NOW = new Date("2026-09-20T10:00:00Z");

// ---------------------------------------------------------------
// IKKI ILOVA O'RTASIDAGI SHARTNOMA
// ---------------------------------------------------------------

test("token hash — AYNAN sha256 hex", () => {
  /*
   * Tokenni shu ilova yaratadi, bot esa admin ilovasida uni
   * tekshiradi. Ular bir-birining kodini ko'rmaydi — yagona
   * umumiy narsa shu hash. U o'zgarsa, bog'lash jimgina
   * ishlamay qo'yardi.
   */
  const token = "sinov-token-123";
  assert.equal(hashLinkToken(token), createHash("sha256").update(token).digest("hex"));
  assert.match(hashLinkToken(token), /^[0-9a-f]{64}$/);
});

test("token bazaga ochiq yozilmaydi", () => {
  const issued = issueLinkToken(NOW);

  assert.notEqual(issued.token, issued.tokenHash);
  assert.equal(issued.tokenHash, hashLinkToken(issued.token));
});

test("token URL uchun xavfsiz belgilardan iborat", () => {
  /*
   * Telegram `start` parametrida faqat cheklangan belgilar
   * o'tadi. `+` yoki `/` bo'lsa, havola buzilardi.
   */
  for (let i = 0; i < 50; i += 1) {
    assert.match(issueLinkToken(NOW).token, /^[A-Za-z0-9_-]+$/);
  }
});

test("har chaqiriqda boshqa token chiqadi", () => {
  const tokens = new Set(Array.from({ length: 200 }, () => issueLinkToken(NOW).token));
  assert.equal(tokens.size, 200);
});

test("token muddati qisqa — 10 daqiqa", () => {
  const issued = issueLinkToken(NOW);
  const ms = new Date(issued.expiresAt).getTime() - NOW.getTime();

  assert.equal(ms, LINK_TOKEN_TTL_SECONDS * 1000);
  assert.ok(ms <= 15 * 60 * 1000, "muddat juda uzun");
});

test("bot sozlanmagan bo'lsa havola berilmaydi", () => {
  assert.equal(telegramDeepLink(null, "abc"), null);
  assert.equal(telegramDeepLink("   ", "abc"), null);
  assert.equal(telegramDeepLink("@liderlar_bot", "abc"), "https://t.me/liderlar_bot?start=abc");
  assert.equal(telegramDeepLink("liderlar_bot", "abc"), "https://t.me/liderlar_bot?start=abc");
});

// ---------------------------------------------------------------
// SERTIFIKAT KODI
// ---------------------------------------------------------------

test("qo'lda ko'chirilgan kod qabul qilinadi", () => {
  /*
   * Odam kodni QR'dan emas, qog'ozdan ham ko'chiradi:
   * bo'shliq, kichik harf va tushib qolgan chiziqcha odatiy.
   */
  const canonical = "MEHR-ABCD234567";

  for (const variant of [
    "MEHR-ABCD234567",
    "mehr-abcd234567",
    "  MEHR-ABCD234567  ",
    "MEHRABCD234567",
    "ABCD234567",
    "abcd234567",
  ]) {
    assert.equal(normalizeCode(variant), canonical, variant);
  }
});

test("yaroqsiz kod rad etiladi", () => {
  for (const bad of ["", "MEHR-", "MEHR-123", "salom", "MEHR-ABCD23456", "MEHR-ABCD2345678"]) {
    assert.equal(normalizeCode(bad), null, bad);
  }
});

test("chalkashadigan harflar kodda qabul qilinmaydi", () => {
  // I/1 va O/0 ko'chirishda adashtiradi — alifboda yo'q.
  for (const ch of ["I", "O", "L", "U"]) {
    assert.equal(normalizeCode(`MEHR-${ch}BCD234567`), null, ch);
  }
});

// ---------------------------------------------------------------
// DAVR KALITI — JAMLANMA BILAN BIR XIL BO'LISHI SHART
// ---------------------------------------------------------------

test("davr kaliti Toshkent vaqti bo'yicha hisoblanadi", () => {
  /*
   * Jamlanma SQL tomonda 'Asia/Tashkent' bilan yoziladi.
   * Bu yerda UTC ishlatilsa, oyning birinchi kunida so'rov
   * bo'sh ro'yxat qaytarardi — reyting "yo'qolgandek"
   * ko'rinardi.
   */
  // 31-avgust 20:00 UTC = 1-sentabr 01:00 Toshkent.
  const boundary = new Date("2026-08-31T20:00:00Z");

  assert.equal(periodKeyFor("month", boundary), "2026-09");
  assert.equal(periodKeyFor("year", boundary), "2026");
  assert.equal(periodKeyFor("all", boundary), "all");
});

test("davr kaliti oddiy sanada to'g'ri", () => {
  const d = new Date("2026-09-20T10:00:00Z");
  assert.equal(periodKeyFor("month", d), "2026-09");
  assert.equal(periodKeyFor("year", d), "2026");
});

test("yil chegarasi ham Toshkent vaqti bo'yicha", () => {
  // 31-dekabr 19:00 UTC = 1-yanvar 00:00 Toshkent.
  const d = new Date("2026-12-31T19:00:00Z");
  assert.equal(periodKeyFor("year", d), "2027");
  assert.equal(periodKeyFor("month", d), "2027-01");
});

// ---------------------------------------------------------------
// PII VA MA'LUMOT INTIZOMI
// ---------------------------------------------------------------

function src(path: string): string {
  return readFileSync(path, "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
}

test("MEHR so'rovlari select(\"*\") ishlatmaydi", () => {
  /*
   * Tadbir qatorida tekshiruv koordinatalari bor. RLS qator
   * darajasida ishlaydi, ustun darajasida emas — qator
   * ochilsa, undagi hamma ustun ochiladi.
   */
  for (const file of [
    "src/lib/mehr/member-data.ts",
    "src/lib/mehr/certificate-verify.ts",
    "src/lib/mehr/public-stats.ts",
  ]) {
    assert.ok(!/\.select\(\s*["'`]\*/.test(src(file)), `${file} da select("*") bor`);
  }
});

test("ommaviy so'rovlar koordinata olib kelmaydi", () => {
  /*
   * Tadbir joyi ommaviy sahifada hudud darajasida ko'rsatiladi.
   * Aniq nuqta tekshiruv uchun — u brauzergacha yetib
   * bormasligi kerak (§36).
   */
  const code = src("src/lib/mehr/public-stats.ts");

  assert.ok(!/latitude/.test(code), "latitude ommaviy so'rovda");
  assert.ok(!/longitude/.test(code), "longitude ommaviy so'rovda");
  assert.ok(!/checkin_radius/.test(code), "radius ommaviy so'rovda");
});

test("ommaviy ro'yxat FAQAT tasdiqlangan tadbirni so'raydi", () => {
  const code = src("src/lib/mehr/public-stats.ts");
  const matches = code.match(/\.eq\("status", "approved"\)/g) ?? [];

  // RLS ham to'sadi, lekin so'rov ham ochiq shart qo'yadi:
  // himoya ikki qatlamda bo'lsin.
  assert.ok(matches.length >= 1, "so'rovda 'approved' sharti yo'q");
});

test("ko'rsatkich o'qilmasa, nol emas — null qaytadi", () => {
  /*
   * Xatolikda "0 volontyor" ko'rsatish yolg'on bo'lardi va
   * butun tizimning ishonchini yo'qotardi.
   */
  const code = readFileSync("src/lib/mehr/public-stats.ts", "utf8");
  assert.match(code, /return null/);
  assert.match(code, /MehrPublicStats \| null/);
});

test("reyting serverda jamlanmadan olinadi, mijozda emas", () => {
  const code = src("src/lib/mehr/public-stats.ts");

  assert.match(code, /from\("point_aggregates"\)/);
  assert.match(code, /\.order\("total_points", \{ ascending: false \}\)/);
  assert.match(code, /\.limit\(/);
});

test("nashr qilinmagan nomzodga havola berilmaydi", () => {
  /*
   * Slug berilsa-yu profil nashr qilinmagan bo'lsa, havola
   * 404 bo'lardi — volontyor kartasi buzuq ko'rinardi.
   */
  const code = src("src/lib/mehr/public-stats.ts");
  assert.match(code, /\.eq\("status", "published"\)/);
});

test("sertifikat balli DAFTARDAN o'qiladi, sertifikatdan emas", () => {
  /*
   * Sertifikatda ball saqlansa, teskari yozuv qilinganda
   * ikkisi bir-biriga zid bo'lib qolardi.
   */
  const code = src("src/lib/mehr/certificate-verify.ts");
  assert.match(code, /from\("point_ledger"\)/);
});

test("bekor qilingan sertifikat yashirilmaydi", () => {
  const code = src("src/lib/mehr/certificate-verify.ts");
  assert.match(code, /"revoked"/);
  assert.match(code, /revoked_reason/);
});

test("sertifikat sahifasi qidiruvga tushmaydi", () => {
  // Har bir sertifikat shaxsga oid — indekslash uchun emas.
  const code = readFileSync("src/app/mehr365/sertifikat/[code]/page.tsx", "utf8");
  assert.match(code, /robots:\s*\{\s*index:\s*false/);
});

test("bog'lash havolasi seansdan chiqadi, so'rovdan emas", () => {
  /*
   * Agar `profileId` argument bo'lsa, istalgan odam boshqa
   * a'zoning hisobiga havola yasab olardi.
   */
  const code = src("src/app/kabinet/actions.ts");
  const fn = code.match(/export async function createTelegramLink\([\s\S]*?\n\}/)?.[0] ?? "";

  assert.ok(fn.length > 0, "createTelegramLink topilmadi");
  assert.match(fn, /createTelegramLink\(\): Promise/);
  assert.match(fn, /supabase\.auth\.getUser\(\)/);
  assert.match(fn, /profile_id: user\.id/);
});
