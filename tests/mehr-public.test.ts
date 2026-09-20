import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { MEHR_NAV, MEHR_TERMS, MEHR_ROLE_LABEL, MEHR_COLORS } from "../src/lib/mehr/brand.ts";
import { MEHR_FLAG_KEYS, ALL_FLAGS_OFF } from "../src/lib/mehr/flag-keys.ts";
import { RANKING_PERIOD_LABEL } from "../src/lib/mehr/public-types.ts";

function src(path: string): string {
  return readFileSync(path, "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
}

const PUBLIC_PAGES = [
  "src/app/mehr365/page.tsx",
  "src/app/mehr365/ezgulik-ishlari/page.tsx",
  "src/app/mehr365/ezgulik-ishlari/[slug]/page.tsx",
  "src/app/mehr365/volontyorlar/page.tsx",
  "src/app/mehr365/reyting/page.tsx",
  "src/app/mehr365/haqida/page.tsx",
];

// ---------------------------------------------------------------
// BAYROQ HAQIQATAN TO'SADIMI (§47)
// ---------------------------------------------------------------

test("HAR BIR ommaviy MEHR sahifasi bayroqni tekshiradi", () => {
  /*
   * Avvalgi auditda `mehr.public_enabled` hech nimani
   * to'smasdi — sahifalar hali yo'q edi. Endi ular bor va
   * bayroq HAQIQATAN ishlashi kerak.
   *
   * Navigatsiyani yashirib, marshrutni ochiq qoldirish
   * yetarli emas: manzilni to'g'ridan-to'g'ri kiritgan odam
   * baribir kirardi.
   */
  for (const page of PUBLIC_PAGES) {
    const code = src(page);
    assert.match(code, /getMehrFlags\(\)/, `${page} bayroqni o'qimaydi`);
    assert.match(code, /if \(!flags\.publicEnabled\) return <MehrClosed \/>/, `${page} to'smaydi`);
  }
});

test("sertifikat tekshiruvi bayroqqa BOG'LANMAYDI", () => {
  /*
   * QR kodlar allaqachon chop etilgan bo'lishi mumkin.
   * Bayroq o'chirilgani uchun haqiqiy sertifikat
   * "tekshirib bo'lmadi" ga aylanishi mumkin emas.
   */
  const code = src("src/app/mehr365/sertifikat/[code]/page.tsx");

  assert.ok(!/getMehrFlags/.test(code), "sertifikat sahifasi bayroqqa bog'langan");
  assert.ok(!/MehrClosed/.test(code));
});

test("qobiq bayroqni tekshirmaydi — aks holda sertifikat ham yopilardi", () => {
  const layout = src("src/app/mehr365/layout.tsx");
  assert.ok(!/publicEnabled/.test(layout), "qobiqda bayroq tekshiruvi bor");
});

test("bayroq kalitlari ikkala ilovada BIR XIL", (t) => {
  /*
   * Ikkala ilova bitta `site_settings` jadvalini o'qiydi.
   * Kalit mos kelmasa, bayroq bir ilovada yoqilib,
   * ikkinchisida o'chiq ko'rinardi.
   *
   * Admin repo YONMA-YON turmasligi mumkin (masalan CI'da
   * faqat shu repo klonlanadi). U holda test YIQILMAYDI,
   * o'tkazib yuboriladi: mavjud bo'lmagan faylni "xato" deb
   * belgilash haqiqiy nosozlikni ko'rsatmaydi, faqat
   * shovqin qo'shadi.
   */
  const adminPath = "../liderlar-admin/src/lib/mehr/flag-keys.ts";
  if (!existsSync(adminPath)) {
    t.skip("admin repo yonma-yon emas");
    return;
  }

  const adminKeys = readFileSync(adminPath, "utf8");

  for (const [field, key] of Object.entries(MEHR_FLAG_KEYS)) {
    assert.ok(
      adminKeys.includes(`${field}: "${key}"`),
      `admin tomonda mos kelmayapti: ${field} → ${key}`,
    );
  }
});

test("standart holat — HAMMASI O'CHIQ", () => {
  assert.ok(Object.values(ALL_FLAGS_OFF).every((v) => v === false));
  assert.equal(Object.keys(ALL_FLAGS_OFF).length, Object.keys(MEHR_FLAG_KEYS).length);
});

// ---------------------------------------------------------------
// OMMAVIY MA'LUMOT XAVFSIZLIGI
// ---------------------------------------------------------------

test("ommaviy so'rovlar FAQAT tasdiqlangan ishni oladi", () => {
  /*
   * RLS ham to'sadi, lekin so'rov ham ochiq shart qo'yadi:
   * himoya ikki qatlamda bo'lsin.
   */
  const code = src("src/lib/mehr/public-stats.ts");
  const approved = code.match(/\.eq\("status", "approved"\)/g) ?? [];

  assert.ok(approved.length >= 3, `'approved' sharti kam: ${approved.length}`);
});

test("ommaviy yo'lda koordinata YO'Q", () => {
  /*
   * Tadbir joyi hudud va joy NOMI darajasida ko'rsatiladi.
   * Aniq nuqta check-in tekshiruvi uchun — u ommaviy
   * sahifaga chiqmasligi kerak.
   */
  const stats = src("src/lib/mehr/public-stats.ts");
  const types = src("src/lib/mehr/public-types.ts");

  for (const [name, code] of [["public-stats", stats], ["public-types", types]] as const) {
    assert.ok(!/latitude/i.test(code), `${name} da latitude bor`);
    assert.ok(!/longitude/i.test(code), `${name} da longitude bor`);
    assert.ok(!/checkin_radius|signing_secret/i.test(code), `${name} da tekshiruv maydoni bor`);
  }
});

test("ommaviy sahifalarda ichki tekshiruv maydonlari yo'q", () => {
  for (const page of PUBLIC_PAGES) {
    const code = src(page);
    for (const field of ["risk_flags", "riskFlags", "review_reason", "notes", "signing_secret"]) {
      assert.ok(!code.includes(field), `${page} da ${field} bor`);
    }
  }
});

test("ommaviy so'rovlar select(\"*\") ishlatmaydi", () => {
  assert.ok(!/\.select\(\s*["'`]\*/.test(src("src/lib/mehr/public-stats.ts")));
});

test("nashr qilinmagan nomzodga havola berilmaydi", () => {
  /*
   * Slug berilsa-yu profil nashr qilinmagan bo'lsa, havola
   * 404 bo'lardi — volontyor kartasi buzuq ko'rinardi.
   */
  const code = src("src/lib/mehr/public-stats.ts");
  const published = code.match(/\.eq\("status", "published"\)/g) ?? [];

  assert.ok(published.length >= 2, `'published' sharti kam: ${published.length}`);
});

// ---------------------------------------------------------------
// SITEMAP VA SEO
// ---------------------------------------------------------------

test("sitemapda token saqlaydigan manzillar YO'Q", () => {
  /*
   * `/akkaunt/faollashtirish/...` bir martalik kalit
   * saqlaydi, `/mehr365/sertifikat/...` esa shaxsga oid.
   * Ularni sitemapga qo'shish tokenlarni qidiruv
   * tizimlariga berish bilan barobar.
   */
  const code = src("src/app/sitemap.ts");

  assert.ok(!/faollashtirish/.test(code), "sitemapda faollashtirish havolasi bor");
  assert.ok(!/sertifikat/.test(code), "sitemapda sertifikat havolasi bor");
  assert.ok(!/kabinet/.test(code), "sitemapda shaxsiy kabinet bor");
});

test("MEHR yopiq bo'lsa sitemapga tushmaydi", () => {
  const code = src("src/app/sitemap.ts");

  assert.match(code, /isMehrPublicEnabled\(\)/);
  assert.match(code, /filter\(\(path\) => !path\.startsWith\("\/mehr365"\)\)/);
});

test("ommaviy MEHR sahifalarida canonical va metadata bor", () => {
  for (const page of PUBLIC_PAGES) {
    const code = readFileSync(page, "utf8");
    assert.ok(
      /export const metadata|export async function generateMetadata/.test(code),
      `${page} da metadata yo'q`,
    );
  }
});

test("shaxsiy sahifalar qidiruvga tushmaydi", () => {
  for (const page of [
    "src/app/mehr365/sertifikat/[code]/page.tsx",
    "src/app/akkaunt/faollashtirish/[token]/page.tsx",
  ]) {
    assert.match(readFileSync(page, "utf8"), /robots:\s*\{\s*index:\s*false/, page);
  }
});

// ---------------------------------------------------------------
// NAVIGATSIYA
// ---------------------------------------------------------------

test("MEHR asosiy menyuda — desktop va mobil", () => {
  assert.match(src("src/components/layout/site-header.tsx"), /href: "\/mehr365"/);
  assert.match(src("src/components/layout/mobile-nav.tsx"), /href: "\/mehr365"/);
});

test("MEHR manzillari liderlar.uz ostida qoladi", () => {
  /*
   * Tashqi domenga chiqarish brendni ikkiga bo'lardi va
   * mavjud autentifikatsiya ishlamay qolardi.
   */
  for (const item of MEHR_NAV) {
    assert.ok(item.href.startsWith("/mehr365"), `tashqi havola: ${item.href}`);
  }
});

test("Podcast mobil menyudan yo'qolmadi", () => {
  /*
   * MEHR pastki panelga qo'shilganda Podcast o'rnini
   * egalladi — lekin u yon menyuda qolishi SHART, aks
   * holda mobil foydalanuvchi uni umuman topa olmasdi.
   */
  const code = src("src/components/layout/mobile-nav.tsx");
  assert.match(code, /href: "\/podcastlar"/);
});

// ---------------------------------------------------------------
// BREND VA ATAMALAR
// ---------------------------------------------------------------

test("MEHR ranglari GLOBAL CSS ga yozilmaydi", () => {
  /*
   * Aks holda butun Liderlar ensiklopediyasi rangini
   * o'zgartirib yuborardi.
   */
  const globals = readFileSync("src/app/globals.css", "utf8");

  for (const value of Object.values(MEHR_COLORS)) {
    if (!value.startsWith("#")) continue;
    assert.ok(!globals.includes(value), `MEHR rangi global CSS da: ${value}`);
  }
});

test("atamalar bir xil ishlatiladi", () => {
  assert.equal(MEHR_TERMS.participant, "Ishtirokchi");
  assert.equal(MEHR_TERMS.coOrganizer, "Hamtashkilotchi");
  assert.equal(MEHR_TERMS.organizer, "Tashkilotchi");

  assert.equal(MEHR_ROLE_LABEL.participant, MEHR_TERMS.participant);
  assert.equal(MEHR_ROLE_LABEL.co_organizer, MEHR_TERMS.coOrganizer);
  assert.equal(MEHR_ROLE_LABEL.organizer, MEHR_TERMS.organizer);
});

test("logotip TAXMIN QILIB chizilmaydi", () => {
  /*
   * Rasmiy asset repoda yo'q. Uni chizib qo'yish brendni
   * buzardi: rasmiy belgining o'rnida unga o'xshash, lekin
   * boshqa narsa turgan bo'lardi.
   */
  const code = src("src/components/mehr/mehr-logo.tsx");

  assert.match(code, /logoUrl/);
  // Yurak shakli yoki murakkab yo'l chizilmaydi.
  assert.ok(!/<path|<svg|clipPath/.test(code), "logotip chizilgan");
});

test("davr yorliqlari to'liq", () => {
  assert.equal(Object.keys(RANKING_PERIOD_LABEL).length, 3);
  assert.equal(RANKING_PERIOD_LABEL.all, "Umumiy");
});

// ---------------------------------------------------------------
// MIJOZ/SERVER CHEGARASI
// ---------------------------------------------------------------

test("mijoz komponentlari server-only moduldan QIYMAT import qilmaydi", () => {
  const serverOnly = [
    "src/lib/mehr/public-stats.ts",
    "src/lib/mehr/flags.ts",
    "src/lib/mehr/settings.ts",
  ]
    .filter((f) => /^import ["']server-only["']/m.test(readFileSync(f, "utf8")))
    .map((f) => f.replace(/^src\//, "@/").replace(/\.ts$/, ""));

  assert.equal(serverOnly.length, 3);

  for (const file of [
    "src/components/mehr/mehr-shell.tsx",
    "src/components/mehr/mehr-hero.tsx",
    "src/components/mehr/activity-card.tsx",
  ]) {
    const code = readFileSync(file, "utf8");
    for (const statement of code.match(/^import\s+[\s\S]*?from\s+["'][^"']+["'];/gm) ?? []) {
      if (/^import\s+type\s/.test(statement)) continue;
      const mod = statement.match(/from\s+["']([^"']+)["']/)?.[1];
      if (mod && serverOnly.includes(mod)) {
        assert.fail(`${file} — ${mod} dan QIYMAT import qilyapti`);
      }
    }
  }
});

test("harakat sozlamasi render paytida o'qiladi", () => {
  /*
   * Effektda o'qib setState qilinsa, ekran avval harakat
   * bilan chizilib, keyin to'xtardi — foydalanuvchi aynan
   * harakatni cheklaganini aytgan bo'lsa ham.
   */
  const code = src("src/components/mehr/use-motion.ts");

  assert.match(code, /useSyncExternalStore/);
  assert.match(code, /prefers-reduced-motion/);
  // Server surati: harakat yo'q deb hisoblanadi.
  assert.match(code, /function getServerSnapshot\(\): boolean \{\s*return false;/);
});
