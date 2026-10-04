import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  RANKING_SCORE_UNIT,
  rankingDisplay,
  rankingView,
  scoreText,
} from "../src/lib/themes/profile-compose.ts";

/*
 * UMUMIY REYTING KO'RSATILISHI.
 *
 * MUAMMO EDI: har bir chop etilgan biografiyada "0 ball" turardi.
 * Sabab ma'lumotda emas — `ranking_scores` ustidagi ommaviy RLS
 * siyosati davr E'LON QILINGAN bo'lishini talab qiladi va joriy
 * davrda u bo'sh edi, ya'ni anon rol noLta qator ko'rardi. Shuning
 * uchun biografiya endi reyting sahifasi bilan BIR XIL manbadan
 * (`lib/data/candidate-ranking.ts`, service_role) o'qiydi.
 *
 * Bu test KO'RSATISH qoidasini qo'riqlaydi: ball hech qachon
 * yashirilmaydi, o'rin esa faqat ma'noga ega bo'lganda chiqadi.
 */

/* ------------------------------------------------------------------ *
 * BALL — 0 HAM RAQAM
 * ------------------------------------------------------------------ */

test("ball nol bo'lsa ham ko'rsatiladi: \"0.0\"", () => {
  /*
   * ENG MUHIM SHART. Nolni "yo'q" deb yashirish nomzodga reyting
   * borligini bildirmasdi va raqamning yo'qligi "tizim ishlamayapti"
   * degan taassurot qoldirardi.
   */
  assert.equal(scoreText(0), "0.0");
  assert.equal(rankingDisplay(null, 0, true).score, "0.0");
  assert.equal(rankingDisplay(24, 0, true).score, "0.0");
});

test("ball bitta kasr xona bilan, maxraj bilan birga", () => {
  assert.equal(scoreText(78.42), "78.4");
  // Ko'rishlardan yig'ilgan kichik ball "0" bo'lib ko'rinmasin.
  assert.equal(scoreText(0.07), "0.1");
  assert.equal(scoreText(7), "7.0");
  assert.equal(RANKING_SCORE_UNIT, "/ 100 ball");
  assert.equal(rankingDisplay(1, 78.42, true).scoreUnit, "/ 100 ball");
});

test("buzilgan qiymat ham sahifani yiqitmaydi", () => {
  // Bazadagi `numeric` matn bo'lib kelib, `Number()` dan NaN chiqishi mumkin.
  assert.equal(scoreText(Number.NaN), "0.0");
  assert.equal(rankingDisplay(null, Number.NaN, false).score, "0.0");
});

/* ------------------------------------------------------------------ *
 * O'RIN — FAQAT MA'NOGA EGA BO'LGANDA
 * ------------------------------------------------------------------ */

test("o'rin bor va ball > 0 -> \"#N\"", () => {
  const view = rankingDisplay(24, 78.4, true);
  assert.equal(view.rank, "#24");
  assert.equal(view.rankNote, null);
  assert.equal(view.rankLabel, "Umumiy reytingda");
});

test("ball 0 bo'lsa o'rin KO'RSATILMAYDI", () => {
  /*
   * Nollar orasidagi tartib raqami hech narsani anglatmaydi: u
   * `candidate_id` tartibidan kelib chiqadi. "#1402" ko'rsatish
   * odamga mavjud bo'lmagan ma'no berardi.
   */
  const view = rankingDisplay(1402, 0, true);
  assert.equal(view.rank, null);
  assert.equal(view.rankNote, "O‘rin hali shakllanmagan");
});

test("qator yo'qligi va ball 0 ARALASHTIRILMAYDI", () => {
  /*
   * Ikki holat ikki xil javob talab qiladi:
   *   qator yo'q  -> hisob hali o'tmagan;
   *   qator bor   -> hisobga kirgan, ball yig'ilmagan.
   * Ikkisini bir xil aytish odamni chalg'itardi.
   */
  assert.equal(rankingDisplay(null, 0, false).rankNote, "Reyting hisoblanmoqda");
  assert.equal(rankingDisplay(null, 0, true).rankNote, "O‘rin hali shakllanmagan");
  assert.deepEqual(rankingView(null, 0, false), { kind: "pending" });
  assert.deepEqual(rankingView(null, 0, true), { kind: "forming" });
});

/* ------------------------------------------------------------------ *
 * BARCHA DIZAYNLAR — BIRORTASI ESDAN CHIQMASIN
 * ------------------------------------------------------------------ */

test("har bir premium dizayn reyting ballini ko'rsatadi", () => {
  /*
   * ASOSIY TALAB: ball VIP va oddiy profilda, barcha premium
   * dizaynlarda va standart sahifada ko'rinadi.
   *
   * Avval o'nta dizayndan faqat UCHTASI reytingni ko'rsatardi —
   * qolgan yettitasida nomzod o'z ballini hech qayerda ko'rmasdi.
   * Bu test yangi dizayn qo'shilganda ham shuni qo'riqlaydi:
   * ro'yxat `loader.tsx` dan olinadi, ya'ni qo'lda yuritiladigan
   * ikkinchi ro'yxat yo'q.
   */
  const loader = readFileSync("src/components/themes/loader.tsx", "utf8");
  const match = loader.match(/const IMPLEMENTED: readonly ThemeKey\[\] = \[([^\]]*)\]/);
  assert.ok(match, "IMPLEMENTED ro'yxati topilmadi");

  const keys = [...match![1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  assert.ok(keys.length >= 10, `dizaynlar soni kutilganidan kam: ${keys.length}`);

  const missing = keys.filter((key) => {
    const source = readFileSync(`src/components/themes/${key}/index.tsx`, "utf8");
    return !/rankingDisplay\(|scoreText\(/.test(source);
  });

  assert.deepEqual(missing, [], `reytingni ko'rsatmaydigan dizaynlar: ${missing.join(", ")}`);
});

test("standart sahifa ballni ishonchli manbadan oladi", () => {
  /*
   * `getCandidateRankingBreakdown` anon rol bilan o'qirdi va RLS
   * sababli HAR DOIM bo'sh qaytardi. U qaytib kelmasin.
   */
  const page = readFileSync("src/app/liderlar/[slug]/page.tsx", "utf8");
  assert.ok(
    !/from "@\/lib\/data\/profile-extra"[\s\S]{0,200}getCandidateRankingBreakdown/.test(page),
    "sahifa yana RLS bilan to'silgan o'qishga qaytgan",
  );
  assert.match(page, /candidate\.ranking\.totalScore/, "ball ishonchli manbadan olinmaydi");

  const loader = readFileSync("src/lib/data/candidates.ts", "utf8");
  assert.match(loader, /getCandidateRanking\(/, "nomzod yuklovchisi reytingni o'qimaydi");
});
