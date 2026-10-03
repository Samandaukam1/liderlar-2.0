import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  ACCESS_TEXT,
  canDownload,
  journalAccess,
  subscriptionStatusText,
} from "../src/lib/journal/access.ts";

test("flag o'chiq bo'lsa jurnal OCHIQ qoladi", () => {
  /*
   * Jurnal sonlari hozirgacha tekin berilgan. Ularni to'satdan
   * yopish mavjud o'quvchilarni yo'qotardi — yopish ongli tijoriy
   * qaror bo'lishi kerak (§41, §67).
   */
  assert.equal(journalAccess({ gatingEnabled: false, hasEntitlement: false }), "open");
  assert.equal(journalAccess({ gatingEnabled: false, hasEntitlement: true }), "open");
});

test("flag yoniq va huquq bor bo'lsa ruxsat beriladi", () => {
  assert.equal(journalAccess({ gatingEnabled: true, hasEntitlement: true }), "granted");
});

test("flag yoniq va huquq yo'q bo'lsa yopiladi", () => {
  assert.equal(journalAccess({ gatingEnabled: true, hasEntitlement: false }), "locked");
});

test("yuklab olish faqat ochiq va ruxsatli holatda", () => {
  assert.equal(canDownload("open"), true);
  assert.equal(canDownload("granted"), true);
  assert.equal(canDownload("locked"), false);
});

test("har bir holat uchun matn bor", () => {
  for (const [state, text] of Object.entries(ACCESS_TEXT)) {
    assert.ok(text.trim().length > 0, state);
  }
});

test("JISMONIY yetkazib berish haqida hech narsa aytilmaydi", () => {
  /*
   * §33: "do NOT falsely claim physical delivery." Yetkazib berish
   * amalga oshirilmagan va u haqda gap bajarilmaydigan va'da
   * bo'lardi.
   */
  const texts = [
    ...Object.values(ACCESS_TEXT),
    subscriptionStatusText(true),
    subscriptionStatusText(false),
  ];

  for (const text of texts) {
    for (const banned of ["pochta", "yetkaz", "manzilingiz", "kuryer", "jo'nat"]) {
      assert.equal(
        text.toLowerCase().includes(banned),
        false,
        `"${text}" ichida "${banned}" bor`,
      );
    }
  }
});

test("obuna matni RAQAMLI kirishni aytadi", () => {
  assert.match(subscriptionStatusText(true), /raqamli/i);
  assert.match(subscriptionStatusText(false), /raqamli/i);
});

test("access.ts hech narsa import qilmaydi", () => {
  const source = readFileSync("src/lib/journal/access.ts", "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/[^\n]*/g, "");
  assert.equal(/^\s*import\s/m.test(source), false);
});

/* ------------------------------------------------------------------ *
 * IMZOLANGAN HAVOLA HTML'GA TUSHMASIN
 * ------------------------------------------------------------------ */

function code(path: string): string {
  return readFileSync(path, "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/[^\n]*/g, "");
}

test("jurnal sahifasi imzolangan havolani HTML'ga qo'ymaydi", () => {
  /*
   * ENG MUHIM TEST.
   *
   * Avval imzolangan havola sahifa yuklanishida yasalib HTML ichiga
   * tushardi — huquqi yo'q odam sahifa manbasidan uni olib, PDF'ni
   * yuklab olishi mumkin edi.
   */
  const page = code("src/app/jurnal/[slug]/page.tsx");

  // Havola marshrut orqali berilishi kerak.
  assert.match(page, /\/api\/jurnal\/\$\{journal\.issue_number\}\/pdf/);
  // `pdf_url` to'g'ridan-to'g'ri `href` ga berilmasligi kerak.
  assert.equal(
    /href=\{journal\.pdf_url\}/.test(page),
    false,
    "pdf_url to'g'ridan-to'g'ri href ga berilgan",
  );
});

test("marshrut huquqni tekshirgandan KEYIN havola yasaydi", () => {
  const route = code("src/app/api/jurnal/[issue]/pdf/route.ts");

  const checkAt = route.indexOf("canDownload(access)");
  const signAt = route.indexOf("createSignedUrl");

  assert.ok(checkAt > 0, "tekshiruv yo'q");
  assert.ok(signAt > checkAt, "havola tekshiruvdan oldin yasalyapti");
});

test("imzolangan havola muddati qisqa", () => {
  /*
   * Havola ulashilsa ham uzoq ishlamasligi kerak. Bir soat juda
   * uzun: u messenjerda qolib, keyin ham ishlab turardi.
   */
  const route = code("src/app/api/jurnal/[issue]/pdf/route.ts");
  const match = route.match(/createSignedUrl\([^,]+,\s*(\d+)\)/);
  assert.ok(match, "muddat topilmadi");
  assert.ok(Number(match![1]) <= 900, `muddat juda uzun: ${match![1]}s`);
});

test("huquq yo'q bo'lsa 403 qaytadi, yo'naltirish emas", () => {
  /*
   * Brauzer PDF kutib turgan joyda sahifaga yo'naltirish chalkash
   * bo'lardi.
   */
  const route = code("src/app/api/jurnal/[issue]/pdf/route.ts");
  assert.match(route, /status: 403/);
});
