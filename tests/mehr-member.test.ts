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
import {
  checkEvidence,
  checkEvidenceFile,
  canSubmit,
  evidencePath,
} from "../src/lib/mehr/submission-rules.ts";

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

// ---------------------------------------------------------------
// DALIL YUBORISH QOIDALARI (§10)
// ---------------------------------------------------------------

const FULL_EVIDENCE = {
  title: "Qishki yordam aksiyasi",
  description: "40 nafar oilaga issiq kiyim va oziq-ovqat tarqatildi.",
  purpose: "Kam ta'minlangan oilalarni qish oldidan qo'llab-quvvatlash.",
  beneficiaryCount: 40,
  hasCover: true,
  photoCount: 6,
  startsAt: "2026-09-18T09:00:00Z",
};

test("to'liq dalil yuboriladi", () => {
  assert.equal(checkEvidence(FULL_EVIDENCE).ok, true);
});

test("dalilsiz tadbir yuborilmaydi va nima yetishmagani aytiladi", () => {
  const result = checkEvidence({ ...FULL_EVIDENCE, photoCount: 0, hasCover: false });

  assert.equal(result.ok, false);
  assert.ok(result.missing.some((m) => m.includes("dalil")));
  assert.ok(result.missing.some((m) => m.includes("Muqova")));
});

test("yolg'iz qilingan ezgulik ham qabul qilinadi", () => {
  /*
   * Ishtirokchi soni umuman tekshirilmaydi: tashkilotchining
   * o'zi yagona ishtirokchi bo'lishi rad etish sababi emas.
   */
  assert.equal(checkEvidence(FULL_EVIDENCE).ok, true);
  assert.ok(!checkEvidence({ ...FULL_EVIDENCE, photoCount: 1 }).missing.includes("Ishtirokchi"));
});

test("nafi tekkanlar 0 bo'lishi mumkin, lekin bo'sh bo'lmaydi", () => {
  assert.equal(checkEvidence({ ...FULL_EVIDENCE, beneficiaryCount: 0 }).ok, true);
  assert.equal(checkEvidence({ ...FULL_EVIDENCE, beneficiaryCount: null }).ok, false);
});

test("faqat qoralama va tuzatish so'ralgan tadbir yuboriladi", () => {
  assert.equal(canSubmit("draft"), true);
  assert.equal(canSubmit("changes_requested"), true);

  // Tasdiqlangan tadbirni qayta yuborish ball va sertifikatni
  // ostidan siljitardi.
  assert.equal(canSubmit("approved"), false);
  assert.equal(canSubmit("submitted"), false);
  assert.equal(canSubmit("rejected"), false);
});

test("faqat rasm qabul qilinadi", () => {
  assert.equal(checkEvidenceFile({ name: "a.jpg", size: 1000, type: "image/jpeg" }).ok, true);
  assert.equal(checkEvidenceFile({ name: "a.png", size: 1000, type: "image/png" }).ok, true);

  const pdf = checkEvidenceFile({ name: "hujjat.pdf", size: 1000, type: "application/pdf" });
  assert.equal(pdf.ok, false);
  assert.ok(pdf.ok === false && pdf.error.includes("hujjat.pdf"));
});

test("juda katta fayl rad etiladi va sabab aniq", () => {
  const big = checkEvidenceFile({ name: "katta.jpg", size: 50 * 1024 * 1024, type: "image/jpeg" });

  assert.equal(big.ok, false);
  assert.ok(big.ok === false && big.error.includes("MB"));
});

test("fayl nomi foydalanuvchidan OLINMAYDI", () => {
  /*
   * Nomda bo'shliq, kirill harf, `../` yoki juda uzun satr
   * bo'lishi mumkin. Tasodifiy qism esa manzilni taxmin qilib
   * bo'lmas qiladi — bucket ommaviy bo'lgani uchun bu muhim.
   */
  const path = evidencePath("11111111-1111-4111-8111-111111111111", "abc-123", "image/jpeg");

  assert.equal(path, "11111111-1111-4111-8111-111111111111/abc-123.jpg");
  assert.ok(!path.includes(".."));
});

test("kengaytma MIME turidan olinadi, nomdan emas", () => {
  assert.ok(evidencePath("a", "b", "image/png").endsWith(".png"));
  assert.ok(evidencePath("a", "b", "image/webp").endsWith(".webp"));
  assert.ok(evidencePath("a", "b", "image/jpeg").endsWith(".jpg"));
});

test("dalil API'si tashkilotchini SO'ROVDAN olmaydi", () => {
  /*
   * `organizerProfileId` sxemada bo'lsa, istalgan odam boshqa
   * a'zoning tadbirini yuborardi.
   */
  const code = src("src/app/api/mehr/evidence/route.ts");

  assert.ok(!/organizerProfileId/.test(code), "tashkilotchi so'rovdan olinyapti");
  assert.match(code, /supabase\.auth\.getUser\(\)/);

  // Egalik va holat SHARTNING ICHIDA — chetlab o'tib bo'lmaydi.
  assert.match(code, /\.eq\("organizer_profile_id", user\.id\)/);
  assert.match(code, /\.in\("status", \["draft", "changes_requested"\]\)/);
});

// ---------------------------------------------------------------
// MIJOZ/SERVER CHEGARASI
// ---------------------------------------------------------------

test("mijoz komponentlari server-only moduldan import qilmaydi", () => {
  /*
   * `import "server-only"` bo'lgan modulni "use client"
   * faylidan hatto TIP uchun import qilish ham build'ni
   * yiqitadi: bundler butun modulni brauzer paketiga tortadi.
   *
   * Bu xatoni tsc KO'RMAYDI — u faqat build'da chiqadi.
   * Shuning uchun test.
   */
  const serverOnly = new Set<string>();
  for (const file of [
    "src/lib/mehr/member-data.ts",
    "src/lib/mehr/certificate-verify.ts",
    "src/lib/mehr/public-stats.ts",
  ]) {
    if (/^import "server-only"/m.test(readFileSync(file, "utf8"))) {
      serverOnly.add(file.replace(/^src\//, "@/").replace(/\.ts$/, ""));
    }
  }

  assert.ok(serverOnly.size > 0, "server-only modul topilmadi");

  for (const file of [
    "src/components/kabinet/activity-row.tsx",
    "src/components/kabinet/mehr-panel.tsx",
    "src/components/kabinet/evidence-form.tsx",
    "src/components/kabinet/telegram-link-button.tsx",
  ]) {
    const code = readFileSync(file, "utf8");
    if (!/^["']use client["']/m.test(code)) continue;

    /*
     * `import type { … }` BUTUNLAY O'CHADI — TypeScript uni
     * kompilyatsiyada olib tashlaydi va bundler ko'rmaydi.
     * Xavfli bo'lgani — QIYMAT importi.
     */
    for (const statement of code.match(/^import\s+[\s\S]*?from\s+["'][^"']+["'];/gm) ?? []) {
      if (/^import\s+type\s/.test(statement)) continue;

      const mod = statement.match(/from\s+["']([^"']+)["']/)?.[1];
      if (!mod || !serverOnly.has(mod)) continue;

      assert.fail(
        `${file} — "use client" bo'la turib ${mod} dan QIYMAT import qilyapti:\n  ${statement}`,
      );
    }
  }
});

test("tiplar moduli server-only EMAS", () => {
  /*
   * Ikkala tomon ham ishlatadi, shuning uchun toza qolishi kerak.
   *
   * Izohlar OLIB TASHLANADI: modul o'zining nega alohida
   * ekanini tushuntirganda "server-only" so'zini yozadi va
   * test o'z izohiga tushib qolardi. Qidirilayotgani — matn
   * emas, DIREKTIVA.
   */
  const code = src("src/lib/mehr/member-types.ts");

  assert.ok(!/import\s+["']server-only["']/.test(code), "server-only direktivasi bor");
  assert.ok(!/from\s+["']@\/lib\/supabase/.test(code), "tiplar modulida baza mijozi bor");
});
