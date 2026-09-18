import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  UZ_MAP_REGIONS,
  UZ_MAP_BY_SLUG,
} from "../src/components/map/uzbekistan-map-data.ts";

const dataLayerSrc = readFileSync("src/lib/data/regions-public.ts", "utf8");

/**
 * Izohlar tashlanadi: tekshiruv KODNI o'qishi kerak.
 *
 * Aks holda tushuntirish izohidagi ibora ("`select(\"*\")` emas")
 * tekshiruvni yiqitardi va test o'z izohini ushlardi.
 */
const dataLayer = dataLayerSrc
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/(^|[^:])\/\/.*$/gm, "$1");
const apiRoute = readFileSync("src/app/api/hududlar/[slug]/route.ts", "utf8");
const mapComponent = readFileSync("src/components/map/uzbekistan-map.tsx", "utf8");

/* ========================= 1. XARITA =================================== */

test("ommaviy xaritada ham 14 hudud", () => {
  assert.equal(UZ_MAP_REGIONS.length, 14);
  assert.ok(UZ_MAP_BY_SLUG["toshkent-shahri"]);
  assert.ok(UZ_MAP_BY_SLUG["toshkent-viloyati"]);
});

test("har hudud alohida path — ko‘rinmas to‘rtburchak emas", () => {
  for (const region of UZ_MAP_REGIONS) {
    assert.ok(region.d.startsWith("M") && region.d.endsWith("Z"), region.slug);
  }
});

test("hududlar klaviatura bilan tanlanadi", () => {
  // Sensorli ekranda hover yo'q; skrin-riderga rang hech narsa
  // aytmaydi.
  assert.ok(mapComponent.includes("tabIndex={0}"));
  assert.ok(mapComponent.includes('role="button"'));
  assert.ok(mapComponent.includes("aria-label={label}"));
  assert.ok(mapComponent.includes('event.key === "Enter"'));
});

test("holat RANGDAN TASHQARI matn bilan ham beriladi", () => {
  assert.ok(mapComponent.includes("statusLabel"));
  assert.ok(mapComponent.includes("info?.statusLabel"));
});

/* ====================== 2. MAXFIYLIK — ASOSIY ========================== */

test("ommaviy so‘rov ICHKI maydonlarni SO‘RAMAYDI", () => {
  /*
   * `select("*")` ishlatilmaydi: yangi ustun qo'shilganda u
   * avtomatik ommaviy bo'lib qolardi va buni hech kim sezmasdi.
   */
  assert.ok(!dataLayer.includes('select("*")'), "yulduzcha bilan tanlanmasin");

  for (const forbidden of [
    "telegram_user_id",
    "telegram_username",
    "commission",
    "amount_uzs",
    // "lead" emas, "coordinator_leads": birinchisi `leaders`
    // (hudud liderlari) ichida ham uchraydi va ular OMMAVIY.
    "coordinator_leads",
    "lead_region",
    "notes",
    "payment",
    "daily_lead_limit",
    "backup_priority",
  ]) {
    assert.ok(
      !dataLayer.includes(forbidden),
      `ommaviy qatlamda "${forbidden}" bo‘lmasligi kerak`,
    );
  }
});

test("ichki telefon ommaviy raqamdan AJRATILGAN", () => {
  // Ichki raqamni "ommaviy" deb taxmin qilish shaxsiy ma'lumotni
  // tarqatish demak.
  assert.ok(dataLayer.includes("show_phone_publicly"));
  assert.ok(dataLayer.includes("public_phone"));
  // Bayroq o'chiq bo'lsa raqam UMUMAN qaytmaydi.
  assert.match(dataLayer, /c\.show_phone_publicly \?[^:]*public_phone[^:]*: null/);
  assert.ok(!dataLayer.includes('"phone"'), "ichki telefon so‘ralmasin");
});

test("faqat CHOP ETILGAN nomzodlar ko‘rsatiladi", () => {
  assert.ok(dataLayer.includes('.eq("status", "published")'));
  assert.ok(dataLayer.includes('.is("deleted_at", null)'));
});

test("faqat FAOL koordinator ko‘rsatiladi", () => {
  assert.ok(dataLayer.includes('.eq("is_active", true)'));
});

test("xarita so‘rovi KPI qaytarmaydi", () => {
  // Ommaviy xarita ichki boshqaruv paneli emas.
  const fn = dataLayer.slice(dataLayer.indexOf("getRegionsWithCoordinatorFlag"));
  assert.ok(fn.includes("hasCoordinator"));
  for (const kpi of ["confirmed", "conversion", "target", "commission"]) {
    assert.ok(!fn.includes(kpi), `xaritada "${kpi}" bo‘lmasin`);
  }
});

test("API slugni tekshiradi", () => {
  // Ixtiyoriy matn bazaga so'rovga aylanmasin.
  assert.match(apiRoute, /\[a-z0-9-\]\{2,64\}/);
  assert.match(apiRoute, /status: 400/);
});

test("lider tartibi HUJJATLASHTIRILGAN va mavjud ustun bo‘yicha", () => {
  /*
   * `candidates` jadvalida `published_at` YO'Q — nashr sanasi
   * `articles` da. Uni bu yerda ishlatish so'rovni yiqitardi.
   */
  assert.ok(dataLayer.includes('.order("created_at"'));
  assert.ok(!dataLayer.includes('order("published_at"'));
  // Qoida IZOHDA hujjatlashtirilgan — xom manbada tekshiriladi.
  assert.match(dataLayerSrc, /TARTIB QOIDASI/);
});

test("nechta lider ko‘rsatilishi bitta joyda", () => {
  assert.ok(dataLayer.includes("REGION_LEADERS_LIMIT = 5"));
  assert.ok(dataLayer.includes(".limit(REGION_LEADERS_LIMIT)"));
});
