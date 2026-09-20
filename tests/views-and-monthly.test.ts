import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { isBotUserAgent, MIN_ENGAGEMENT_MS } from "../src/lib/analytics/bot-detection.ts";
import {
  periodKey,
  periodLabel,
  deriveStatus,
  MONTHLY_STATUS_LABEL,
} from "../src/lib/monthly/period.ts";

function src(path: string): string {
  return readFileSync(path, "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
}

// ---------------------------------------------------------------
// BOT ANIQLASH
// ---------------------------------------------------------------

test("mashhur botlar aniqlanadi", () => {
  for (const ua of [
    "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
    "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
    "TelegramBot (like TwitterBot)",
    "Mozilla/5.0 (X11; Linux x86_64) HeadlessChrome/120.0.0.0 Safari/537.36",
    "python-requests/2.31.0 something long enough",
    "Mozilla/5.0 AhrefsBot/7.0; +http://ahrefs.com/robot/",
  ]) {
    assert.equal(isBotUserAgent(ua), true, ua.slice(0, 40));
  }
});

test("haqiqiy brauzerlar bot deb belgilanmaydi", () => {
  for (const ua of [
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15",
  ]) {
    assert.equal(isBotUserAgent(ua), false, ua.slice(0, 40));
  }
});

test("bo'sh yoki juda qisqa User-Agent BOT deb hisoblanadi", () => {
  /*
   * Haqiqiy brauzer UA ni har doim yuboradi. Uni "noma'lum,
   * demak odam" deb qabul qilish eng oson chetlab o'tish
   * yo'li bo'lardi: UA ni o'chirish yetarli bo'lardi.
   */
  assert.equal(isBotUserAgent(null), true);
  assert.equal(isBotUserAgent(""), true);
  assert.equal(isBotUserAgent("   "), true);
  assert.equal(isBotUserAgent("Mozilla/5.0"), true);
});

test("e'tibor chegarasi bor va u oqilona", () => {
  /*
   * Sahifa ochilishi bilan darhol hisoblansa, orqa fonda
   * ochilgan yorliq ham ball berardi. Juda uzun bo'lsa,
   * haqiqiy o'quvchi ham hisobga olinmasdi.
   */
  assert.ok(MIN_ENGAGEMENT_MS >= 2000, "chegara juda qisqa");
  assert.ok(MIN_ENGAGEMENT_MS <= 10000, "chegara juda uzun");
});

// ---------------------------------------------------------------
// KUZATUVCHI VA API
// ---------------------------------------------------------------

test("kuzatuvchi DARHOL emas, e'tibordan keyin yuboradi", () => {
  const code = src("src/components/profile/profile-view-tracker.tsx");

  assert.match(code, /setTimeout\(send, MIN_ENGAGEMENT_MS\)/);
  assert.match(code, /visibilitychange/);
  // React ikki marta chizsa ham bir marta yuboriladi.
  assert.match(code, /sent\.current/);
});

test("shaxs SO'ROVDAN olinmaydi — seansdan olinadi", () => {
  /*
   * `viewerUserId` so'rov tanasidan kelsa, uni o'zgartirib
   * o'z-ko'rishni "begona ko'rish" qilib ko'rsatish mumkin
   * bo'lardi.
   */
  const code = src("src/app/api/profile-view/route.ts");

  assert.ok(!/body\?\.\s*userId|body\.userId/.test(code), "foydalanuvchi so'rovdan olinyapti");
  assert.match(code, /supabase\.auth\.getUser\(\)/);
  assert.match(code, /p_viewer_user_id: viewerUserId/);
});

test("server mijozga ISHONMAYDI — User-Agent'ni o'zi tekshiradi", () => {
  const code = src("src/app/api/profile-view/route.ts");

  assert.match(code, /isBotUserAgent\(req\.headers\.get\("user-agent"\)\)/);
  // Mijoz signali qo'shiladi, lekin uning o'rnini bosmaydi.
  assert.match(code, /serverSaysBot \|\| clientSaysAutomated/);
});

test("botga cookie berilmaydi", () => {
  /*
   * Har krauler so'rovi yangi cookie olsa, ular baribir har
   * safar yangi tashrifchi bo'lib ko'rinardi — cookie hech
   * narsa bermasdi, faqat javob hajmini oshirardi.
   */
  const code = src("src/app/api/profile-view/route.ts");
  assert.match(code, /if \(!existingViewerId && !isBot\)/);
});

test("cookie brauzer skriptiga ochiq emas", () => {
  const code = src("src/app/api/profile-view/route.ts");
  assert.match(code, /httpOnly: true/);
  assert.match(code, /secure: true/);
});

test("xom IP saqlanmaydi", () => {
  /*
   * Tashrifchi belgisi — tasodifiy cookie va uning hash'i.
   * IP dan olingan qiymat reyting uchun doimiy saqlanmaydi.
   */
  const code = src("src/app/api/profile-view/route.ts");

  assert.ok(!/x-forwarded-for|x-real-ip|\bip\b/i.test(code), "IP ishlatilyapti");
  assert.match(code, /createHash\("sha256"\)/);
});

// ---------------------------------------------------------------
// KO'RSATKICHLAR
// ---------------------------------------------------------------

test("ko'rish balli siyosati BAZADAN o'qiladi", () => {
  /*
   * Kodda takrorlansa, panel bir narsani, reyting boshqa
   * narsani hisoblab, sonlar mos kelmay qolardi.
   */
  const code = src("src/lib/analytics/profile-stats.ts");

  assert.match(code, /ranking\.views_per_point/);
  assert.match(code, /ranking\.view_points_cap/);
  assert.match(code, /ranking\.profile_views_enabled/);
  assert.ok(!/const VIEWS_PER_POINT\s*=\s*\d/.test(code), "nisbat kodda qotirilgan");
});

test("nomzodga tashrifchi ma'lumoti KO'RSATILMAYDI", () => {
  const types = src("src/lib/analytics/profile-stats.ts").match(
    /export interface ProfileStats \{[\s\S]*?\n\}/,
  )?.[0] ?? "";

  assert.ok(types.length > 0);
  for (const field of ["viewerHash", "ip", "userAgent", "excluded", "bot"]) {
    assert.ok(!types.includes(field), `ProfileStats da ${field} bor`);
  }
});

// ---------------------------------------------------------------
// OYLIK HAVOLALAR
// ---------------------------------------------------------------

test("davr kaliti Toshkent vaqti bo'yicha", () => {
  /*
   * UTC bilan hisoblansa, oyning birinchi kuni 5 soatlik
   * farq tufayli havola o'tgan oyga tushib qolardi.
   */
  assert.equal(periodKey(new Date("2026-08-31T20:00:00Z")), "2026-09");
  assert.equal(periodKey(new Date("2026-09-01T10:00:00Z")), "2026-09");
  assert.equal(periodKey(new Date("2026-12-31T19:00:00Z")), "2027-01");
});

test("davr nomi o'zbekcha", () => {
  assert.equal(periodLabel("2026-09"), "Sentabr 2026");
  assert.equal(periodLabel("2026-01"), "Yanvar 2026");
  // Buzuq kalit ham sahifani yiqitmasin.
  assert.equal(periodLabel("salom"), "salom");
});

test("holat AUTHORITATIV maydonlardan chiqariladi", () => {
  const now = new Date("2026-09-20T10:00:00Z");

  assert.equal(deriveStatus("active", "2026-10-01T00:00:00Z", now), "active");
  assert.equal(deriveStatus("active", "2026-09-01T00:00:00Z", now), "expired");
  assert.equal(deriveStatus("used", "2026-10-01T00:00:00Z", now), "used");
  assert.equal(deriveStatus("revoked", "2026-10-01T00:00:00Z", now), "revoked");

  // Ishlatilgan havola muddati o'tgan bo'lsa ham "yuborilgan".
  assert.equal(deriveStatus("used", "2026-01-01T00:00:00Z", now), "used");
});

test("holat yorliqlari to'liq", () => {
  assert.equal(Object.keys(MONTHLY_STATUS_LABEL).length, 4);
});

test("havola SO'ROVDAN kelgan nomzodga berilmaydi", () => {
  /*
   * `candidateId` argument bo'lsa, istalgan odam boshqa
   * birovning havolasini chiqarib olardi.
   */
  const code = src("src/app/kabinet/actions.ts");
  const fn = code.match(/export async function openMonthlyLink\([\s\S]*?\n\}/)?.[0] ?? "";

  assert.ok(fn.length > 0, "openMonthlyLink topilmadi");
  assert.match(fn, /openMonthlyLink\(period: string\)/, "action nomzod qabul qilyapti");
  assert.match(fn, /supabase\.auth\.getUser\(\)/);
  assert.match(fn, /\.eq\("user_id", user\.id\)/);
});

test("havola SHARTLI UPDATE bilan chiqariladi", () => {
  /*
   * Avval o'qib keyin yozsak, shu orada admin uni bekor
   * qilgan bo'lsa ham havola berilardi.
   */
  const code = src("src/app/kabinet/actions.ts");
  const fn = code.match(/export async function openMonthlyLink\([\s\S]*?\n\}/)?.[0] ?? "";

  assert.match(fn, /\.eq\("status", "active"\)/);
  assert.match(fn, /\.gt\("expires_at", nowIso\)/);
});

test("kabinet token hash'ini QAYTARMAYDI", () => {
  const data = src("src/lib/monthly/link-data.ts");

  assert.ok(!/token_hash/.test(data), "hash kabinetga uzatilyapti");
  assert.match(data, /select\("period_key, status, expires_at, opened_at, used_at"\)/);
});

test("token formati ikkala ilovada BIR XIL", (t) => {
  /*
   * Cron admin tomonda yozadi, kabinet web tomonda
   * almashtiradi. Format mos kelmasa, chiqarilgan havola
   * `/yangilash/[token]` da tanilmay qolardi.
   */
  const adminPath = "../liderlar-admin/src/lib/tokens.ts";
  if (!existsSync(adminPath)) {
    t.skip("admin repo yonma-yon emas");
    return;
  }

  const admin = readFileSync(adminPath, "utf8");
  const web = src("src/app/kabinet/actions.ts");

  assert.match(admin, /randomBytes\(32\)\.toString\("base64url"\)/);
  assert.match(web, /randomBytes\(32\)\.toString\("base64url"\)/);

  assert.match(admin, /createHash\("sha256"\)\.update\(raw\)\.digest\("hex"\)/);
  assert.match(web, /createHash\("sha256"\)\.update\(raw\)\.digest\("hex"\)/);
});
