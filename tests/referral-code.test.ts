import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  advancesStage,
  buildCode,
  charPicker,
  checkCodeShape,
  foldCode,
  CODE_MAX_LENGTH,
  CODE_MIN_LENGTH,
  milestoneKey,
  nameBase,
  normalizeCode,
  pointKey,
  qualifiesForPoints,
  type ReferralStage,
} from "../src/lib/referral/code.ts";
import { foldPromoCode, looksLikeSameCode } from "../src/lib/promo/code-match.ts";

/* ------------------------------------------------------------------ *
 * ISMDAN ASOS
 * ------------------------------------------------------------------ */

test("ismdan lotincha asos yasaladi va O'QILADI", () => {
  /*
   * Ism qismi BUTUN qoladi. Avval chalkash harflar olib tashlangan
   * edi va "Dilnoza" dan "DNA" chiqardi — kod egasini ko'rsatmaydi.
   */
  assert.equal(nameBase("Asadbek Azamov"), "ASADBEK");
  assert.equal(nameBase("  Dilnoza  "), "DILNOZA");
  assert.equal(nameBase("Ali"), "ALI");
});

test("kirillcha ism lotinchaga o'tadi", () => {
  assert.equal(nameBase("Асадбек"), "ASADBEK");
  assert.equal(nameBase("Ўктам"), "OKTAM");
});

test("qisqa ism ham minimal uzunlikdagi kod beradi", () => {
  // "Ali" uchun 2 belgi yetmaydi: qo'shimcha uzunligi oshiriladi.
  const code = buildCode("Ali", charPicker(() => 0));
  assert.ok(code.length >= CODE_MIN_LENGTH, code);
  assert.equal(checkCodeShape(code).ok, true);
});

test("kod egasining ismi bilan boshlanadi", () => {
  // §13: kod o'qiladigan bo'lishi kerak.
  const code = buildCode("Sarvar Toshmatov", charPicker(() => 0));
  assert.ok(code.startsWith("SARVAR"), code);
});

test("foldCode mavjud promo moslashtiruvchisi bilan bir xil sinflarni birlashtiradi", () => {
  // Ikkovi ajralib ketsa, to'qnashuv tekshiruvi teshik qolardi.
  for (const sample of ["ASADBEK0X", "ASADBEKOX", "L1DER", "LIDER", "S5", "B8"]) {
    assert.equal(foldCode(sample), foldPromoCode(sample), sample);
  }
});

test("faqat familiya emas, BIRINCHI so'z olinadi", () => {
  assert.equal(nameBase("Jahongir Qurbonnazarov"), nameBase("Jahongir"));
});

test("lotin harfsiz ism zaxira asos beradi", () => {
  // Kod HAR DOIM yasalishi kerak: kodsiz akkaunt qolmasin.
  const code = buildCode("!!! ???", charPicker(() => 0));
  assert.ok(code.startsWith("LIDER"), code);
});

/* ------------------------------------------------------------------ *
 * CHALKASHADIGAN BELGILAR — eng muhim xavf
 * ------------------------------------------------------------------ */

test("tasodifiy QO'SHIMCHADA chalkashadigan belgi yo'q", () => {
  /*
   * Ism qismida chalkash harf bo'lishi mumkin va bu ataylab: kod
   * o'qiladigan bo'lishi kerak. Farqlash kuchi esa qo'shimchada —
   * shuning uchun aynan u chalkashsiz alifbodan olinadi.
   *
   * Agar qo'shimchada 8 va B ikkisi ham uchrasa, bitta ismning ikki
   * kodi fold ostida bitta bo'lib qolardi va tavsiya boshqa odamga
   * yozilardi.
   */
  const banned = /[0O1IL5S8B2Z6G]/;
  const stem = nameBase("Testov"); // "TESTOV"
  let counter = 0;

  for (let i = 0; i < 200; i += 1) {
    const code = buildCode("Testov", charPicker((max) => counter++ % max));
    assert.ok(code.startsWith(stem), code);

    const suffix = code.slice(stem.length);
    assert.equal(banned.test(suffix), false, `qo'shimchada taqiqlangan belgi: ${code}`);
  }
});

test("generatsiya qilingan kodlar fold ostida ham AJRALIB turadi", () => {
  /*
   * ENG MUHIM TEST.
   *
   * Unikal indeks satrlarni solishtiradi, moslashtiruvchi esa
   * shakllarni — ikkovi boshqa javob beradi. Shu sababli kodlar
   * `foldPromoCode` ostida ham takrorlanmasligi kerak.
   */
  const seen = new Map<string, string>();
  let counter = 0;
  const pick = charPicker((max) => counter++ % max);

  for (let i = 0; i < 300; i += 1) {
    const code = buildCode("Asadbek", pick);
    const folded = foldPromoCode(code);

    const clash = seen.get(folded);
    if (clash && clash !== code) {
      assert.fail(`fold to'qnashuvi: ${code} va ${clash} -> ${folded}`);
    }
    seen.set(folded, code);
  }
});

test("turli ismlardan chiqqan kodlar bir-biriga O'XSHAB ketmaydi", () => {
  /*
   * `looksLikeSameCode` saxiy: yaqin kodlarni bitta deb qaraydi.
   * Ikki boshqa odamning kodi shu tekshiruvdan bitta bo'lib
   * o'tmasligi kerak.
   */
  const a = buildCode("Asadbek", charPicker(() => 0));
  const b = buildCode("Dilnoza", charPicker(() => 0));

  assert.notEqual(a, b);
  assert.equal(looksLikeSameCode(a, b), false, `${a} ~ ${b}`);
});

/* ------------------------------------------------------------------ *
 * SHAKL
 * ------------------------------------------------------------------ */

test("yasalgan kod o'z shakl tekshiruvidan o'tadi", () => {
  let counter = 0;
  const pick = charPicker((max) => counter++ % max);

  for (const name of ["Asadbek", "Dilnoza Karimova", "Jahongir", "Ўктам"]) {
    const code = buildCode(name, pick);
    const check = checkCodeShape(code);
    assert.equal(check.ok, true, `${name} -> ${code}: ${check.problem}`);
    assert.ok(code.length >= CODE_MIN_LENGTH && code.length <= CODE_MAX_LENGTH, code);
  }
});

test("bo'sh va noto'g'ri shakl rad etiladi", () => {
  assert.equal(checkCodeShape("").problem, "empty");
  assert.equal(checkCodeShape("   ").problem, "empty");
  assert.equal(checkCodeShape("AB").problem, "too_short");
  assert.equal(checkCodeShape("A".repeat(50)).problem, "too_long");
  assert.equal(checkCodeShape("ASAD@BEK").problem, "shape");
});

test("normalizatsiya bo'shliq, tire va registrni tozalaydi", () => {
  assert.equal(normalizeCode(" asad-bek_7x "), "ASADBEK7X");
  assert.equal(normalizeCode("asad.bek"), "ASADBEK");
});

test("normalizatsiya chalkash belgilarni BIRLASHTIRMAYDI", () => {
  /*
   * Birlashtirish ikki haqiqiy kodni bitta qilib qo'yish xavfini
   * qaytarardi — aynan shundan qochish uchun alifbo toraytirilgan.
   */
  assert.notEqual(normalizeCode("ASADBEK0"), normalizeCode("ASADBEKO"));
});

/* ------------------------------------------------------------------ *
 * BALL SHARTI — egasining qarori
 * ------------------------------------------------------------------ */

test("ball FAQAT to'lov tasdiqlangan VA profil chop etilganda beriladi", () => {
  assert.equal(
    qualifiesForPoints({
      stage: "payment_confirmed",
      referredPublished: true,
      selfReferral: false,
    }),
    true,
  );
});

test("to'lov bor, lekin profil chop etilmagan — ball YO'Q", () => {
  assert.equal(
    qualifiesForPoints({
      stage: "payment_confirmed",
      referredPublished: false,
      selfReferral: false,
    }),
    false,
  );
});

test("ariza topshirish va tekin qabul ball BERMAYDI", () => {
  for (const stage of ["visited", "application", "registered", "activated"] as ReferralStage[]) {
    assert.equal(
      qualifiesForPoints({ stage, referredPublished: true, selfReferral: false }),
      false,
      stage,
    );
  }
});

test("o'ziga o'zi tavsiya ball bermaydi", () => {
  assert.equal(
    qualifiesForPoints({
      stage: "payment_confirmed",
      referredPublished: true,
      selfReferral: true,
    }),
    false,
  );
});

/* ------------------------------------------------------------------ *
 * TAKRORLANMASLIK KALITLARI
 * ------------------------------------------------------------------ */

test("ball kaliti atributsiya va bosqichga bog'langan", () => {
  assert.equal(pointKey("abc", "payment_confirmed"), "referral:abc:payment_confirmed");
  // Boshqa bosqich — boshqa kalit, ya'ni ikkovi alohida yozuv.
  assert.notEqual(pointKey("abc", "activated"), pointKey("abc", "payment_confirmed"));
});

test("milestone kaliti profil va darajaga bog'langan", () => {
  assert.equal(milestoneKey("p1", 10), "referral:p1:milestone:10");
  assert.notEqual(milestoneKey("p1", 10), milestoneKey("p1", 25));
});

/* ------------------------------------------------------------------ *
 * BOSQICH TARTIBI
 * ------------------------------------------------------------------ */

test("bosqich faqat oldinga siljiydi", () => {
  assert.equal(advancesStage("application", "payment_confirmed"), true);
  assert.equal(advancesStage("visited", "application"), true);
});

test("orqaga siljish RAD etiladi", () => {
  /*
   * To'lov tasdiqlangandan keyin bosqich "ariza"ga qaytsa, ball
   * berilgan atributsiya ball bermaydigan holatga tushib qolardi.
   */
  assert.equal(advancesStage("payment_confirmed", "application"), false);
  assert.equal(advancesStage("activated", "registered"), false);
});

test("bir xil bosqich siljish emas — takroriy hodisa yozuv qoldirmaydi", () => {
  assert.equal(advancesStage("payment_confirmed", "payment_confirmed"), false);
});

/* ------------------------------------------------------------------ *
 * Chegara
 * ------------------------------------------------------------------ */

test("code.ts hech narsa import qilmaydi", () => {
  const source = readFileSync("src/lib/referral/code.ts", "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/[^\n]*/g, "");

  assert.equal(/^\s*import\s/m.test(source), false, "import topildi");
});

/* ------------------------------------------------------------------ *
 * IKKI YUBORISH YO'LI AJRALIB KETMASIN
 * ------------------------------------------------------------------ */

function stripComments(path: string): string {
  return readFileSync(path, "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/[^\n]*/g, "");
}

const SUBMIT_PATHS = [
  "src/app/api/application/submit/route.ts",
  "src/app/ariza/actions.ts",
];

test("ariza ikki yo'li ham bir xil tavsiya tekshiruvidan o'tadi", () => {
  /*
   * Arizani yuborishning ikki yo'li bor va mavjud izoh ularning bir
   * xil tekshiruvdan o'tishini TALAB qiladi. Biriga qo'shib
   * ikkinchisini esdan chiqarish eng ehtimolli xato: u holda
   * atributsiya faqat yarim hollarda yozilardi va sabab topilmasdi.
   */
  for (const path of SUBMIT_PATHS) {
    const source = stripComments(path);
    for (const fn of ["classifyPromoCode", "checkPromoGate", "recordApplicationReferral"]) {
      assert.ok(source.includes(fn), `${path} da ${fn} yo'q`);
    }
  }
});

test("atributsiya ariza SAQLANGANDAN KEYIN yoziladi", () => {
  /*
   * `application_id` ga bog'lanadi, ya'ni ariza id si kerak. Agar
   * `recordApplicationReferral` insert'dan OLDIN chaqirilsa, id hali
   * yo'q bo'lardi.
   */
  for (const path of SUBMIT_PATHS) {
    const source = stripComments(path);
    const insertAt = source.indexOf('.from("applications")');
    const recordAt = source.indexOf("recordApplicationReferral({");

    assert.ok(insertAt >= 0, `${path}: insert topilmadi`);
    assert.ok(recordAt >= 0, `${path}: atributsiya chaqiruvi topilmadi`);
    assert.ok(recordAt > insertAt, `${path}: atributsiya insert'dan oldin`);
  }
});

test("tekshiruv ariza saqlashdan OLDIN bajariladi", () => {
  // Rad etilgan ariza bazaga tushmasligi kerak.
  for (const path of SUBMIT_PATHS) {
    const source = stripComments(path);
    const gateAt = source.indexOf("checkPromoGate(");
    const insertAt = source.indexOf('.from("applications")');
    assert.ok(gateAt < insertAt, `${path}: tekshiruv insert'dan keyin`);
  }
});
