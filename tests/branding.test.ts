import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import {
  BRANDING_ICON_KEYS,
  BRANDING_VERSION_KEY,
  parseSiteBranding,
  buildIconsMetadata,
  versioned,
  EMPTY_SITE_BRANDING,
} from "../src/lib/branding-config.ts";

const layout = readFileSync("src/app/layout.tsx", "utf8");
const branding = readFileSync("src/lib/branding.ts", "utf8");

/* ============ 1. KALITLAR — IKKI REPO ORASIDAGI SHARTNOMA ============== */

test("kalitlar admin paneldagi bilan AYNAN bir xil", () => {
  /*
   * Favicon admin panelda yuklanadi va `site_settings` ga yoziladi.
   * Kalit nomi ajralib ketsa, sayt jimgina standart belgiga
   * qaytadi va buni hech kim sezmaydi — xato ham chiqmaydi.
   *
   * Admin tomondagi manba: `src/lib/branding/config.ts`.
   */
  assert.deepEqual(BRANDING_ICON_KEYS, {
    16: "branding_icon_16_url",
    32: "branding_icon_32_url",
    180: "branding_icon_180_url",
    192: "branding_icon_192_url",
    512: "branding_icon_512_url",
  });
  assert.equal(BRANDING_VERSION_KEY, "branding_version");
});

test("admin repodagi kalitlar bilan solishtiriladi", () => {
  // Ikki repo alohida deploy bo'ladi; bu tekshiruv ular
  // ajralib ketganini ishlab chiqishdayoq ko'rsatadi.
  const adminConfig = "/Users/macbookair/Documents/liderlar-admin/src/lib/branding/config.ts";
  if (!existsSync(adminConfig)) return; // admin repo yonida bo'lmasa o'tkazamiz
  const src = readFileSync(adminConfig, "utf8");
  for (const key of [...Object.values(BRANDING_ICON_KEYS), BRANDING_VERSION_KEY]) {
    assert.ok(src.includes(key), `admin tomonda "${key}" yo‘q`);
  }
});

/* ==================== 2. O'QISH QOIDALARI ============================== */

test("bo‘sh satr “yo‘q” deb qaraladi", () => {
  // Sozlama tozalanganda qator o'chirilmay, qiymati bo'shatilishi
  // mumkin — u "logo bor" deb hisoblanmasligi kerak.
  const parsed = parseSiteBranding({
    branding_icon_32_url: "   ",
    branding_icon_192_url: "",
    branding_version: null,
  });
  assert.deepEqual(parsed.icons, {});
  assert.equal(parsed.version, null);
});

test("mavjud ikonkalar o‘lcham bo‘yicha o‘qiladi", () => {
  const parsed = parseSiteBranding({
    branding_icon_32_url: "https://cdn/32.png",
    branding_icon_180_url: "https://cdn/180.png",
    branding_version: "v7",
  });
  assert.equal(parsed.icons[32], "https://cdn/32.png");
  assert.equal(parsed.icons[180], "https://cdn/180.png");
  assert.equal(parsed.version, "v7");
});

test("versiya keshni buzadi", () => {
  // Brauzer favicon'ni juda uzoq keshlaydi; versiyasiz yangi logo
  // haftalab ko'rinmay qolishi mumkin.
  assert.equal(versioned("https://cdn/32.png", "v7"), "https://cdn/32.png?v=v7");
  assert.equal(versioned("https://cdn/32.png?x=1", "v7"), "https://cdn/32.png?x=1&v=v7");
  assert.equal(versioned("https://cdn/32.png", null), "https://cdn/32.png");
});

/* ==================== 3. METADATA SHAKLI =============================== */

test("ikonka bo‘lmasa STANDART favicon qoladi", () => {
  const icons = buildIconsMetadata(EMPTY_SITE_BRANDING);
  assert.equal(icons.icon, "/favicon.ico");
  assert.equal(icons.shortcut, "/favicon.ico");
});

test("admin yuklagan ikonkalar versiya bilan beriladi", () => {
  const icons = buildIconsMetadata({
    icons: { 32: "https://cdn/32.png", 180: "https://cdn/180.png", 512: "https://cdn/512.png" },
    version: "v9",
  });
  const list = icons.icon as Array<{ url: string; sizes: string }>;
  assert.ok(Array.isArray(list));
  // 512 brauzer yorlig'i uchun emas — u PWA uchun.
  assert.ok(!list.some((i) => i.sizes === "512x512"));
  assert.ok(list.every((i) => i.url.includes("?v=v9")));
  assert.equal((icons.apple as Array<{ sizes: string }>)[0].sizes, "180x180");
});

/* ==================== 4. IKKITA RAQOBATCHI TEG ========================= */

test("favicon.ico app segmentida TURMAYDI", () => {
  /*
   * U `src/app/` da tursa, Next avtomatik `<link rel="icon">`
   * qo'shadi va bizning ikonkalarimiz bilan ikkita raqobatchi teg
   * paydo bo'ladi — qaysi biri g'olib chiqishi brauzerga bog'liq.
   */
  assert.ok(!existsSync("src/app/favicon.ico"), "app segmentidan olib tashlangan bo‘lsin");
});

test("/favicon.ico STATIK FAYL emas — brendingdan beriladi", () => {
  /*
   * Google va boshqa krauler'lar `<link rel="icon">` teglarini
   * emas, ildizdagi `/favicon.ico` ni so'raydi. Metadata to'g'ri
   * bo'lgani bilan o'sha manzilda Next'ning standart fayli
   * turgani uchun qidiruv natijasida Vercel uchburchagi
   * ko'rinib turardi.
   */
  assert.ok(!existsSync("public/favicon.ico"), "statik fayl /favicon.ico ni egallamasin");
  assert.ok(existsSync("public/favicon-default.ico"), "zaxira boshqa nomda qolsin");
  assert.ok(existsSync("src/app/api/favicon/route.ts"));

  const config = readFileSync("next.config.ts", "utf8");
  // `beforeFiles` SHART: oddiy rewrite public/ dagi fayldan KEYIN
  // ishlaydi va statik fayl baribir yutib ketardi.
  assert.match(config, /beforeFiles:\s*\[\{ source: "\/favicon\.ico", destination: "\/api\/favicon" \}\]/);
});

test("zaxira yo‘nalishi CHEKSIZ AYLANMA emas", () => {
  // `/favicon.ico` route'ga qayta yozilgani uchun o'sha nomga
  // yo'naltirish o'z-o'ziga qaytarardi.
  const route = readFileSync("src/app/api/favicon/route.ts", "utf8");
  assert.ok(route.includes("/favicon-default.ico"));
  assert.ok(!/redirect\([^)]*"\/favicon\.ico"/.test(route));
});

test("zaxira manzili so‘rovdan olinadi, kodda qotmaydi", () => {
  // Aks holda preview deploy'lar ham productionga yo'naltirardi.
  const route = readFileSync("src/app/api/favicon/route.ts", "utf8");
  assert.match(route, /new URL\("\/favicon-default\.ico", request\.url\)/);
  assert.ok(!route.includes('"https://liderlar.uz"'));
});

test("metadata DINAMIK — admin o‘zgarishi deploy’siz ko‘rinadi", () => {
  assert.match(layout, /export async function generateMetadata/);
  assert.match(layout, /getSiteBranding\(\)/);
  assert.match(layout, /icons: buildIconsMetadata\(branding\)/);
});

/* ======================== 5. ISHONCHLILIK ============================== */

test("baza javob bermasa sayt OCHILAVERADI", () => {
  // Brending — bezak: u tufayli oq ekran bo'lmasligi kerak.
  assert.match(branding, /catch\s*\{/);
  assert.match(branding, /return EMPTY_SITE_BRANDING/);
});

test("xato natijasi KESHLANMAYDI", () => {
  // Aks holda bir marta uzilgan aloqa standart belgini besh
  // daqiqaga qotirib qo'yardi.
  const fn = branding.slice(branding.indexOf("export async function getSiteBranding"));
  const catchBlock = fn.slice(fn.indexOf("} catch"));
  assert.ok(!catchBlock.includes("cached ="), "xatoda kesh yozilmasin");
});

test("COOKIE'SIZ klient — statik renderda ham ishlaydi", () => {
  /*
   * Loyihaning odatiy `createClient()` i `cookies()` ni o'qiydi va u
   * statik render paytida mavjud emas: chaqiruv xato beradi va
   * brending bo'sh qaytadi.
   *
   * Amalda shunday ko'rindi — dinamik sahifalarda favicon to'g'ri,
   * BOSH SAHIFADA standart belgi qotib qolgan edi.
   */
  assert.ok(!branding.includes("@/lib/supabase/server"), "cookie'li klient ishlatilmasin");
  assert.match(branding, /from "@supabase\/supabase-js"/);
  assert.match(branding, /persistSession: false/);
});

test("har so‘rovda baza so‘rovi QILINMAYDI", () => {
  // `generateMetadata` har sahifada ishlaydi.
  assert.match(branding, /CACHE_MS/);
  assert.match(branding, /Date\.now\(\) - cached\.at < CACHE_MS/);
});
