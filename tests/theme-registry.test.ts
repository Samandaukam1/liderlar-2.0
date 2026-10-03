import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  checkThemeChoice,
  DEFAULT_THEME,
  galleryThemes,
  isThemeKey,
  resolveTheme,
  selectableThemes,
  THEME_KEYS,
  THEMES,
  themeAfterExpiry,
} from "../src/lib/themes/registry.ts";

/* ------------------------------------------------------------------ *
 * XAVFSIZ ZAXIRA — §11
 * ------------------------------------------------------------------ */

test("noma'lum kalit standart dizaynga tushadi", () => {
  /*
   * Ommaviy sahifa dizayn kaliti sababli OCHILMAY qolmasligi kerak.
   * Shuning uchun bu funksiya hech qachon xato tashlamaydi.
   */
  for (const value of [null, undefined, "", "yoq-dizayn", 42, {}, []]) {
    assert.equal(resolveTheme(value), DEFAULT_THEME, String(value));
  }
});

test("qurilmagan dizayn ham standartga tushadi", () => {
  /*
   * Kalit koddan olib tashlanmasdan "qurilmagan" holatiga
   * qaytarilsa ham sahifa ishlashda davom etishi kerak.
   *
   * HOZIR BARCHA DIZAYN TAYYOR, ya'ni bu holat mavjud emas.
   * Shuning uchun mexanizmning O'ZI tekshiriladi: `resolveTheme`
   * `ready` bayrog'iga qarashi shart — aks holda kelajakda
   * olib tashlangan dizayn sahifani bo'sh qoldirardi.
   */
  const notReady = THEME_KEYS.find((key) => !THEMES[key].ready);

  if (notReady) {
    assert.equal(resolveTheme(notReady), DEFAULT_THEME);
    return;
  }

  const source = readFileSync("src/lib/themes/registry.ts", "utf8");
  assert.match(
    source,
    /return THEMES\[stored\]\.ready \? stored : DEFAULT_THEME/,
    "ready tekshiruvi yo'q",
  );
});

test("tayyor dizayn o'zi qaytadi", () => {
  assert.equal(resolveTheme("imperial-gold"), "imperial-gold");
  assert.equal(resolveTheme("classic"), "classic");
});

/* ------------------------------------------------------------------ *
 * TANLOV
 * ------------------------------------------------------------------ */

test("obunasiz premium dizayn tanlanmaydi", () => {
  const result = checkThemeChoice("imperial-gold", false);
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.problem, "needs_premium");
});

test("obuna bilan premium dizayn tanlanadi", () => {
  const result = checkThemeChoice("imperial-gold", true);
  assert.equal(result.ok, true);
});

test("standart dizayn obunasiz ham tanlanadi", () => {
  /*
   * Obuna tugaganda odam standartga qaytishi kerak — aks holda u
   * hech narsa tanlay olmasdi.
   */
  const result = checkThemeChoice("classic", false);
  assert.equal(result.ok, true);
});

test("qurilmagan dizaynni tanlash rad etiladi", () => {
  /*
   * Hozir barcha dizayn tayyor. Mexanizm saqlanishi kerak:
   * qurilmagan dizaynni tanlashga ruxsat berilsa, profil standart
   * dizaynga qaytib, foydalanuvchi "nega o'zgarmadi" degan savol
   * oldida qolardi.
   */
  const notReady = THEME_KEYS.find((key) => !THEMES[key].ready);

  if (notReady) {
    const result = checkThemeChoice(notReady, true);
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.problem, "not_ready");
    return;
  }

  const source = readFileSync("src/lib/themes/registry.ts", "utf8");
  assert.match(source, /if \(!theme\.ready\) return \{ ok: false, problem: "not_ready" \}/);
});

test("spec talab qilgan 10 premium dizayn QURILGAN", () => {
  /*
   * §9–§10: o'nta dizayn. Hammasi `ready` va yuklovchida
   * komponenti bor (buni yuqoridagi moslik testi tekshiradi).
   */
  const premium = THEME_KEYS.filter((key) => THEMES[key].premium);
  assert.equal(premium.length, 10);
  for (const key of premium) {
    assert.equal(THEMES[key].ready, true, key);
  }
});

test("noma'lum kalitni tanlash rad etiladi", () => {
  for (const value of ["yoq", "", null, 1]) {
    const result = checkThemeChoice(value, true);
    assert.equal(result.ok, false, String(value));
    if (!result.ok) assert.equal(result.problem, "unknown");
  }
});

/* ------------------------------------------------------------------ *
 * RO'YXATLAR
 * ------------------------------------------------------------------ */

test("tanlanadigan ro'yxatda faqat tayyorlari bor", () => {
  for (const theme of selectableThemes()) {
    assert.equal(theme.ready, true, theme.key);
  }
});

test("galereyada hammasi bor — qurilmaganlari ham", () => {
  assert.equal(galleryThemes().length, THEME_KEYS.length);
});

test("spec talab qilgan 10 premium dizayn kaliti band qilingan", () => {
  /*
   * §10 aynan shu o'nta nomni sanaydi. Kalit oldindan band
   * qilinmasa, keyin boshqa nom qo'yilib, saqlangan qiymatlar
   * yaroqsiz bo'lib qolardi.
   */
  const premium = THEME_KEYS.filter((key) => THEMES[key].premium);
  assert.equal(premium.length, 10);

  for (const key of [
    "imperial-gold",
    "silver-executive",
    "emerald-legacy",
    "royal-navy",
    "obsidian",
    "ivory-editorial",
    "aurora-glass",
    "zarafshon",
    "monochrome-signature",
    "crimson-prestige",
  ]) {
    assert.ok(isThemeKey(key), key);
    assert.equal(THEMES[key as (typeof THEME_KEYS)[number]].premium, true, key);
  }
});

test("standart dizayn premium EMAS", () => {
  assert.equal(THEMES[DEFAULT_THEME].premium, false);
  assert.equal(THEMES[DEFAULT_THEME].ready, true);
});

test("har bir dizaynda o'zbekcha ma'lumotnoma bor", () => {
  for (const key of THEME_KEYS) {
    const theme = THEMES[key];
    assert.ok(theme.label.trim().length > 0, key);
    assert.ok(theme.mood.trim().length > 0, key);
    assert.ok(theme.description.trim().length > 20, key);
    assert.ok(theme.suitedFor.trim().length > 0, key);
    // Kalit o'zi bilan mos.
    assert.equal(theme.key, key);
  }
});

/* ------------------------------------------------------------------ *
 * OBUNA TUGASHI — §35
 * ------------------------------------------------------------------ */

test("obuna tugasa dizayn SAQLANADI", () => {
  /*
   * §35 mazmunni yo'q qilishni taqiqlaydi. Dizaynni to'satdan
   * o'zgartirish profilga tashqaridan kelgan odam uchun sahifani
   * tanimas holga keltirardi.
   */
  assert.equal(themeAfterExpiry("imperial-gold"), "imperial-gold");
});

test("obuna tugasa yaroqsiz dizayn standartga tushadi", () => {
  assert.equal(themeAfterExpiry("yoq-dizayn"), DEFAULT_THEME);
});

/* ------------------------------------------------------------------ *
 * ARXITEKTURA — §11
 * ------------------------------------------------------------------ */

test("reyestr sof MA'LUMOT — komponent yoki funksiya saqlamaydi", () => {
  /*
   * §11: o'n xil sahifa nusxasi bo'lmasligi kerak. Reyestr faqat
   * kalitlar va ma'lumotnoma; komponentlar dinamik yuklanadi, ya'ni
   * foydalanuvchi tanlagan BITTA dizayn paketga tushadi.
   *
   * Agar bu yerga komponent qo'yilsa, hamma dizayn har sahifada
   * paketga tushib ketardi.
   */
  const source = readFileSync("src/lib/themes/registry.ts", "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/[^\n]*/g, "");
  assert.equal(/^\s*import\s/m.test(source), false, "import topildi");

  // Har bir yozuv oddiy qiymatlardan iborat bo'lishi kerak.
  for (const key of THEME_KEYS) {
    for (const [field, value] of Object.entries(THEMES[key])) {
      assert.notEqual(typeof value, "function", `${key}.${field} funksiya`);
      assert.notEqual(typeof value, "object", `${key}.${field} obyekt`);
    }
  }
});

test("migratsiya CSS emas, KALIT saqlaydi", () => {
  /*
   * CSS saqlansa, u foydalanuvchi kiritgan kod bo'lib ommaviy
   * sahifaga tushardi — uslub orqali hujum yo'li ochilardi.
   */
  const sql = readFileSync(
    "../liderlar-admin/supabase/migrations/20261002180000_profile_themes.sql",
    "utf8",
  );
  assert.match(sql, /published_theme text/);
  assert.match(sql, /draft_theme text/);
  // Uzunlik chegarasi kalitga mos — CSS blobi sig'maydi.
  assert.match(sql, /char_length\(published_theme\) between 2 and 48/);
});

test("ko'rish va nashr ALOHIDA maydonlarda", () => {
  /*
   * §11: "Preview must not immediately change public page." Bitta
   * maydon bo'lganida ko'rib chiqish ommaviy sahifani darhol
   * o'zgartirardi.
   */
  const sql = readFileSync(
    "../liderlar-admin/supabase/migrations/20261002180000_profile_themes.sql",
    "utf8",
  );
  const columns = sql.slice(0, sql.indexOf("create index"));
  assert.ok(columns.includes("published_theme"), "published_theme yo'q");
  assert.ok(columns.includes("draft_theme"), "draft_theme yo'q");
});

test("migratsiyada yozish siyosati yo'q", () => {
  // Obunasiz premium dizayn qo'yib olish imkonsiz bo'lishi kerak.
  const sql = readFileSync(
    "../liderlar-admin/supabase/migrations/20261002180000_profile_themes.sql",
    "utf8",
  );
  assert.equal(/for (insert|update|delete)/i.test(sql), false);
  assert.match(sql, /enable row level security/);
});

/* ------------------------------------------------------------------ *
 * REYESTR VA KOMPONENTLAR MOS KELSIN
 * ------------------------------------------------------------------ */

test("ready: true bo'lgan premium dizaynning komponenti BOR", () => {
  /*
   * ENG MUHIM MOSLIK.
   *
   * Reyestrda `ready: true` bo'lsa, foydalanuvchi uni tanlashi
   * mumkin va `resolveTheme` uni standartga tushirmaydi. Komponenti
   * bo'lmasa, ommaviy sahifa BO'SH chiqardi.
   *
   * Yuklovchi mijoz moduli (`dynamic` ishlatadi), shuning uchun uni
   * import qilmaymiz — ro'yxatni matn sifatida o'qiymiz.
   */
  const loader = readFileSync("src/components/themes/loader.tsx", "utf8");
  const match = loader.match(/const IMPLEMENTED: readonly ThemeKey\[\] = \[([^\]]*)\]/);
  assert.ok(match, "IMPLEMENTED ro'yxati topilmadi");

  const implemented = new Set(
    [...match![1]!.matchAll(/"([a-z-]+)"/g)].map((m) => m[1]!),
  );

  for (const key of THEME_KEYS) {
    const theme = THEMES[key];
    if (!theme.premium || !theme.ready) continue;
    assert.ok(implemented.has(key), `${key}: ready, lekin komponenti yo'q`);
  }
});

test("komponenti bor dizayn reyestrda ready", () => {
  // Teskari tomoni: qurilgan dizayn tanlanadigan bo'lishi kerak.
  const loader = readFileSync("src/components/themes/loader.tsx", "utf8");
  const match = loader.match(/const IMPLEMENTED: readonly ThemeKey\[\] = \[([^\]]*)\]/);
  assert.ok(match);

  for (const [, key] of match![1]!.matchAll(/"([a-z-]+)"/g)) {
    assert.ok(isThemeKey(key), `${key}: reyestrda yo'q`);
    assert.equal(THEMES[key as (typeof THEME_KEYS)[number]].ready, true, key);
  }
});

test("dizaynlar dinamik yuklanadi, statik import qilinmaydi", () => {
  /*
   * §49: statik import bo'lsa, har profil sahifasi BARCHA
   * dizaynlarning kodini yuklab olardi.
   */
  const loader = readFileSync("src/components/themes/loader.tsx", "utf8");
  assert.match(loader, /dynamic\(\(\) => import\("\.\/imperial-gold"\)\)/);
  // To'g'ridan-to'g'ri import bo'lmasligi kerak.
  assert.equal(/^import ImperialGold from/m.test(loader), false);
});

test("ommaviy sahifa dizaynni yechadi va standartga qaytadi", () => {
  const page = readFileSync("src/app/liderlar/[slug]/page.tsx", "utf8");
  assert.match(page, /hasThemeComponent\(themeKey\)/);
  assert.match(page, /loadThemeSelection/);
  // Ko'rish hisobi dizayndan tashqarida bo'lishi kerak.
  assert.match(page, /ThemeViewTracker/);
});

test("ommaviy profil sertifikatlarni faqat ochiq darajalarda oladi", () => {
  /*
   * Bu dizaynlar uchun ham muhim: har dizayn sertifikatlarni
   * ko'rsatadi va tekshirilmagan da'vo ularning hammasida chiqib
   * ketardi.
   */
  const source = readFileSync("src/lib/data/candidates.ts", "utf8");
  const at = source.indexOf('from("candidate_certificates")');
  assert.ok(at > 0, "sertifikat so'rovi yo'q");
  const query = source.slice(at, at + 400);
  assert.match(query, /\.in\("trust", \["user_entered", "verified"\]\)/);
});

/* ------------------------------------------------------------------ *
 * KO'RISH VA NASHR AJRALGANLIGI
 * ------------------------------------------------------------------ */

test("tanlash QORALAMAGA yoziladi, nashrga emas", () => {
  /*
   * §11: "Preview must not immediately change public page."
   * `setDraftTheme` `published_theme` ga yozsa, tanlash darhol
   * ommaviy sahifani o'zgartirardi va odam sinab ko'ra olmasdi.
   */
  const service = readFileSync("src/lib/themes/preference-service.ts", "utf8");
  const at = service.indexOf("export async function setDraftTheme");
  assert.ok(at > 0);
  const body = service.slice(at, service.indexOf("\n}", service.indexOf("return { ok: true }", at)));

  assert.match(body, /draft_theme: choice\.key/);
  assert.equal(/published_theme/.test(body), false, "setDraftTheme published_theme ga yozyapti");
});

test("nashr qoralamani TOZALAYDI", () => {
  /*
   * Qolsa, "nashr qilinmagan o'zgarish bor" degan holat abadiy
   * ko'rinib turardi.
   */
  const service = readFileSync("src/lib/themes/preference-service.ts", "utf8");
  const at = service.indexOf("export async function publishDraftTheme");
  const body = service.slice(at, at + 2000);
  assert.match(body, /published_theme: choice\.key/);
  assert.match(body, /draft_theme: null/);
});

test("nashr paytida huquq QAYTA tekshiriladi", () => {
  /*
   * Qoralama obuna faol bo'lganda qo'yilgan, lekin nashrga
   * bosilgunicha obuna tugagan bo'lishi mumkin.
   */
  const service = readFileSync("src/lib/themes/preference-service.ts", "utf8");
  const at = service.indexOf("export async function publishDraftTheme");
  const body = service.slice(at, at + 2000);
  assert.match(body, /can\("profile\.premium_themes"\)/);
  assert.match(body, /checkThemeChoice\(/);
});

test("qoralama yo'q bo'lsa nashr RAD etiladi", () => {
  /*
   * Aks holda tugma tasodifan bosilganda nashr qilingan dizayn
   * standartga tushib ketardi.
   */
  const service = readFileSync("src/lib/themes/preference-service.ts", "utf8");
  const at = service.indexOf("export async function publishDraftTheme");
  const body = service.slice(at, at + 2000);
  assert.match(body, /current\.draft === null/);
});

test("standartga qaytarish premium huquqini TALAB QILMAYDI", () => {
  /*
   * Obuna tugagan odam standartga qaytishi kerak — u premium
   * huquqiga ega emas, ya'ni oddiy tanlash yo'lidan o'tolmaydi.
   */
  const service = readFileSync("src/lib/themes/preference-service.ts", "utf8");
  const at = service.indexOf("export async function resetToDefaultTheme");
  const body = service.slice(at, at + 1200);
  assert.equal(
    /requireEntitlement\("profile\.premium_themes"\)/.test(body),
    false,
    "standartga qaytarish premium talab qilyapti",
  );
  // Egalik esa tekshirilishi SHART.
  assert.match(body, /resolveOwnCandidate\(\)/);
});
