import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import {
  CANDIDATE_FIELDS,
  checkEntry,
  checkSection,
  ENTRY_KINDS,
  ENTRY_RULES,
  EDIT_STATE_TEXT,
  filterCandidateChanges,
  saveMessage,
  sectionPolicy,
  type FilterResult,
} from "../src/lib/profile-editor/field-policy.ts";

/* ------------------------------------------------------------------ *
 * RUXSAT RO'YXATI — eng muhim himoya
 * ------------------------------------------------------------------ */

/**
 * Foydalanuvchi HECH QACHON o'zgartirmasligi kerak bo'lgan maydonlar.
 *
 * Bu ro'yxat himoyaning o'zi EMAS (himoya — ruxsat ro'yxati), balki
 * uning tekshiruvi: kimdir ehtiyotsizlik bilan `status` ni ruxsat
 * ro'yxatiga qo'shsa, shu test yiqiladi.
 */
const MUST_NEVER_BE_EDITABLE = [
  "slug",
  "status",
  "is_top100",
  "top100_position",
  "user_id",
  "seo_title",
  "seo_description",
  "next_update_due_at",
  "last_updated_at",
  "deleted_at",
  "id",
  "created_at",
  "avatar_url",
];

test("taqiqlangan maydonlar ruxsat ro'yxatida YO'Q", () => {
  for (const field of MUST_NEVER_BE_EDITABLE) {
    assert.equal(
      Object.hasOwn(CANDIDATE_FIELDS, field),
      false,
      `${field} tahrirlanadigan qilib qo'yilgan`,
    );
  }
});

test("o'zini NASHR QILISH imkonsiz", () => {
  /*
   * Eng xavfli urinish: foydalanuvchi `status` ni 'published' qilib
   * yuboradi va tahririyat ko'rigini chetlab o'tadi.
   */
  const result = filterCandidateChanges(
    { status: "published", is_top100: true, top100_position: 1 },
    { status: "draft", is_top100: false, top100_position: null },
  );

  assert.deepEqual(result.direct, []);
  assert.deepEqual(result.review, []);
  assert.deepEqual(result.rejected.sort(), ["is_top100", "status", "top100_position"]);
});

test("slug o'zgartirilmaydi — ommaviy havola buzilmasin", () => {
  const result = filterCandidateChanges(
    { slug: "yangi-slug" },
    { slug: "eski-slug" },
  );
  assert.deepEqual(result.rejected, ["slug"]);
});

test("profilni boshqa odamga berib bo'lmaydi", () => {
  const result = filterCandidateChanges(
    { user_id: "00000000-0000-0000-0000-000000000001" },
    { user_id: "00000000-0000-0000-0000-000000000002" },
  );
  assert.deepEqual(result.rejected, ["user_id"]);
});

test("rad etilgan maydon JIM tashlab ketilmaydi", () => {
  // Chaqiruvchi o'zgarish saqlanmaganini bilishi kerak.
  const result = filterCandidateChanges({ allaqachon_yoq: 1 }, {});
  assert.deepEqual(result.rejected, ["allaqachon_yoq"]);
});

/* ------------------------------------------------------------------ *
 * SIYOSAT
 * ------------------------------------------------------------------ */

test("qisqa ma'lumot DARHOL nashr bo'ladi", () => {
  const result = filterCandidateChanges(
    { short_bio: "Yangi qisqa ma'lumot" },
    { short_bio: "Eski" },
  );
  assert.equal(result.direct.length, 1);
  assert.equal(result.direct[0]!.field, "short_bio");
  assert.equal(result.review.length, 0);
});

test("tug'ilgan sana KO'RIKKA boradi", () => {
  /*
   * U nashr qilingan fakt: darhol o'zgartirishga ruxsat berilsa,
   * tasdiqlangan ma'lumot jimgina boshqasiga aylanardi.
   */
  const result = filterCandidateChanges(
    { birth_date: "1990-01-01" },
    { birth_date: "1991-02-03" },
  );
  assert.equal(result.review.length, 1);
  assert.equal(result.direct.length, 0);
});

test("hudud va yo'nalish ham ko'rikka boradi", () => {
  const result = filterCandidateChanges(
    { region_id: "r2", category_id: "c2" },
    { region_id: "r1", category_id: "c1" },
  );
  assert.equal(result.review.length, 2);
  assert.equal(result.direct.length, 0);
});

test("aloqa ma'lumoti darhol yangilanadi", () => {
  // Nashr qilinadigan fakt emas: kutishga majbur qilish ma'nosiz.
  const result = filterCandidateChanges(
    { phone: "+998901234567", email: "a@b.uz" },
    { phone: null, email: null },
  );
  assert.equal(result.direct.length, 2);
});

test("eski qiymat o'zgarish bilan birga saqlanadi", () => {
  // §6: admin NIMA o'zgarganini ko'rishi kerak.
  const result = filterCandidateChanges(
    { birth_date: "1990-01-01" },
    { birth_date: "1991-02-03" },
  );
  assert.equal(result.review[0]!.before, "1991-02-03");
  assert.equal(result.review[0]!.after, "1990-01-01");
});

/* ------------------------------------------------------------------ *
 * O'ZGARMAGAN MAYDON
 * ------------------------------------------------------------------ */

test("o'zgarmagan maydon umuman yozilmaydi", () => {
  /*
   * Aks holda har saqlash tasdiqlangan faktni qayta ko'rikka
   * yuborardi va tasdiqni bekor qilardi (§6).
   */
  const result = filterCandidateChanges(
    { short_bio: "Bir xil", birth_date: "1990-01-01" },
    { short_bio: "Bir xil", birth_date: "1990-01-01" },
  );
  assert.deepEqual(result.direct, []);
  assert.deepEqual(result.review, []);
});

test("bo'sh matn va null bir xil ma'noda", () => {
  const result = filterCandidateChanges({ short_bio: "   " }, { short_bio: null });
  assert.deepEqual(result.direct, []);
});

test("matn atrofidagi bo'shliq olib tashlanadi", () => {
  const result = filterCandidateChanges({ short_bio: "  Matn  " }, { short_bio: null });
  assert.equal(result.direct[0]!.after, "Matn");
});

/* ------------------------------------------------------------------ *
 * QIYMAT TEKSHIRUVI
 * ------------------------------------------------------------------ */

test("uzun matn rad etiladi, jimgina qirqilmaydi", () => {
  /*
   * Qirqish odamning yozganini aytmasdan yo'q qilardi. Bazadagi
   * `check` ham buni rad etadi — ya'ni jimgina qirqish keyin
   * tushunarsiz xatoga olib kelardi.
   */
  const result = filterCandidateChanges(
    { short_bio: "x".repeat(601) },
    { short_bio: null },
  );
  assert.equal(result.invalid.length, 1);
  assert.equal(result.invalid[0]!.field, "short_bio");
  assert.equal(result.direct.length, 0);
});

test("chegaradagi uzunlik o'tadi", () => {
  const result = filterCandidateChanges(
    { short_bio: "x".repeat(600) },
    { short_bio: null },
  );
  assert.equal(result.invalid.length, 0);
  assert.equal(result.direct.length, 1);
});

/* ------------------------------------------------------------------ *
 * BO'LIMLAR
 * ------------------------------------------------------------------ */

test("taqdim etish bo'limlari darhol nashr bo'ladi", () => {
  for (const title of ["Men haqimda", "men haqimda", "Qiziqishlarim", "Maqsadim"]) {
    assert.equal(sectionPolicy(title), "direct", title);
  }
});

test("noma'lum sarlavha KO'RIKKA boradi", () => {
  /*
   * Ro'yxat to'liq bo'lishi mumkin emas — sarlavha erkin matn.
   * Shuning uchun qoida ehtiyotkor tomonga ishlaydi.
   */
  for (const title of ["Mukofotlarim", "Lavozimlarim", "Nimadir", ""]) {
    assert.equal(sectionPolicy(title), "review", title);
  }
});

test("bo'sh va yo'q sarlavha ko'rikka boradi", () => {
  assert.equal(sectionPolicy(null), "review");
  assert.equal(sectionPolicy(undefined), "review");
  assert.equal(sectionPolicy("   "), "review");
});

test("bo'sh bo'lim rad etiladi — sarlavha yoki matn kerak", () => {
  /*
   * Bazadagi shart aynan shunday. Tekshirmasak, so'rov baza xatosi
   * bilan yiqilardi va odam tushunarsiz xabar ko'rardi.
   */
  assert.equal(checkSection({}).ok, false);
  assert.equal(checkSection({ title: "   ", content: "  " }).ok, false);
});

test("sarlavhasiz, faqat matnli bo'lim QABUL qilinadi", () => {
  /*
   * Biografiyaning birinchi xatboshisi odatda sarlavhasiz bo'ladi —
   * sahifa ham shunday chizadi (`section.title && <h2>`).
   */
  const check = checkSection({ content: "1990-yilda Samarqandda tug'ilgan." });
  assert.equal(check.ok, true);
  assert.equal(check.value.title, "");
  assert.match(check.value.content, /Samarqandda/);
});

test("bo'lim matni va sarlavhasi tozalanadi", () => {
  const check = checkSection({ title: "  Hayot yo'li  ", content: "  matn  " });
  assert.deepEqual(check.value, { title: "Hayot yo'li", content: "matn" });
});

test("juda uzun bo'lim rad etiladi", () => {
  assert.equal(checkSection({ title: "a".repeat(241), content: "b" }).ok, false);
  assert.equal(checkSection({ title: "a", content: "b".repeat(50_001) }).ok, false);
  assert.equal(checkSection({ title: "a", content: "b".repeat(50_000) }).ok, true);
});

test("bo'lim `sort_order` ni QABUL QILMAYDI", () => {
  /*
   * Tartib alohida amal. Oddiy saqlash bilan birga qabul qilinsa,
   * odam boshqa bo'limlarning tartibini bilmasdan o'zgartirib
   * qo'yardi.
   */
  const check = checkSection({ title: "a", content: "b", sort_order: 5 } as never);
  assert.deepEqual(Object.keys(check.value).sort(), ["content", "title"]);
});

/* ------------------------------------------------------------------ *
 * BO'LIM XIZMATI — HUQUQ, EGALIK, KO'RIK
 * ------------------------------------------------------------------ */

test("bo'lim xizmatida huquq va egalik tekshiruvi bor", () => {
  /*
   * ENG MUHIM HIMOYA, VA U FRONTENDDA EMAS.
   *
   * Server amali to'g'ridan-to'g'ri chaqirilishi mumkin, shuning
   * uchun har bir yozish:
   *   · `requireEntitlement("profile.self_edit")` — faol VIP;
   *   · `resolveOwnCandidate()` — kimning profili (brauzerdan
   *     `candidate_id` OLINMAYDI);
   *   · `.eq("candidate_id", …)` — yozishdagi egalik sharti, ya'ni
   *     VIP a'zo BOSHQA nomzodning biografiyasiga tegib ko'rolmaydi.
   */
  const source = readFileSync("src/lib/profile-editor/section-service.ts", "utf8");

  const writers = source.split(/export async function /).slice(1);
  assert.ok(writers.length >= 4, "xizmat funksiyalari topilmadi");

  for (const fn of writers) {
    const name = fn.slice(0, fn.indexOf("("));
    if (name === "loadOwnSections") continue;

    assert.match(fn, /requireEntitlement\("profile\.self_edit"\)/, `${name}: huquq tekshiruvi yo'q`);
    assert.match(fn, /resolveOwnCandidate\(\)/, `${name}: egalik aniqlanmaydi`);
    assert.match(fn, /\.eq\("candidate_id", resolved\.owned\.candidateId\)/, `${name}: egalik sharti yo'q`);
  }
});

test("ko'rik holatini FOYDALANUVCHI tanlamaydi", () => {
  /*
   * `review_state` brauzerdan kelgan qiymatdan OLINMAYDI: aks holda
   * odam tekshirilmagan matnni darhol `published` qilib yuborardi
   * (§43). U faqat `sectionPolicy` natijasidan kelib chiqadi.
   */
  const source = readFileSync("src/lib/profile-editor/section-service.ts", "utf8");
  const assignments = [...source.matchAll(/review_state: ([A-Za-z0-9_."]+)/g)].map((m) => m[1]);

  assert.ok(assignments.length >= 2, "review_state yozilmaydi");
  for (const value of assignments) {
    assert.equal(value, "reviewState", `review_state kutilmagan qiymatdan: ${value}`);
  }
  assert.match(
    source,
    /const reviewState =\s*\n?\s*sectionPolicy\(/,
    "ko'rik holati siyosatdan olinmaydi",
  );
});

test("ommaviy biografiya FAQAT nashr bo'lgan bo'limni oladi", () => {
  /*
   * Ilova filtri va RLS — IKKISI ham bor. RLS ilovadan mustaqil
   * ishlashi kerak, ilova filtri esa niyatni kodda ko'rinadigan
   * qiladi va so'rovni tejaydi.
   */
  const source = readFileSync("src/lib/data/candidates.ts", "utf8");
  const query = source.slice(source.indexOf('.from("candidate_sections")'));
  assert.match(
    query.slice(0, 400),
    /\.eq\("review_state", "published"\)/,
    "tekshiruvdagi matn ommaga chiqib ketadi",
  );
});

/* ------------------------------------------------------------------ *
 * XABARLAR — §22
 * ------------------------------------------------------------------ */

function emptyResult(): FilterResult {
  return { direct: [], review: [], rejected: [], invalid: [] };
}

test("ko'rikka ketgan o'zgarish 'joylandi' deb AYTILMAYDI", () => {
  /*
   * §22 aynan shuni taqiqlaydi: nashr bo'lmagan narsani nashr
   * bo'lgan deb aytish yolg'on.
   */
  const result = emptyResult();
  result.review.push({
    field: "birth_date",
    label: "Tug'ilgan sana",
    policy: "review",
    before: null,
    after: "1990-01-01",
  });

  const message = saveMessage(result);
  assert.match(message, /tekshiruvga/i);
  assert.equal(/joylandi/.test(message), false);
});

test("aralash holatda ikkisi ham aytiladi", () => {
  const result = emptyResult();
  result.direct.push({
    field: "short_bio",
    label: "Qisqa ma'lumot",
    policy: "direct",
    before: null,
    after: "a",
  });
  result.review.push({
    field: "birth_date",
    label: "Tug'ilgan sana",
    policy: "review",
    before: null,
    after: "1990-01-01",
  });

  const message = saveMessage(result);
  assert.match(message, /joylandi/);
  assert.match(message, /tekshiruvga/);
});

test("o'zgarish bo'lmasa shu aytiladi", () => {
  assert.match(saveMessage(emptyResult()), /kiritilmadi/i);
});

test("har bir holat uchun o'zbekcha matn bor", () => {
  for (const [state, text] of Object.entries(EDIT_STATE_TEXT)) {
    assert.ok(text.trim().length > 0, state);
  }
});

/* ------------------------------------------------------------------ *
 * TEXNIK NOMLAR SIZIB CHIQMASIN — §5
 * ------------------------------------------------------------------ */

test("maydon nomlari odam tilida", () => {
  /*
   * §5: `candidate_id`, `user_id`, ustun nomlari va JSON
   * foydalanuvchiga KO'RSATILMAYDI.
   */
  for (const [field, rule] of Object.entries(CANDIDATE_FIELDS)) {
    assert.ok(rule.label.trim().length > 0, field);
    assert.equal(rule.label.includes("_"), false, `${field}: texnik nom`);
    assert.equal(/^[a-z_]+$/.test(rule.label), false, `${field}: ustun nomi`);
  }
});

/* ------------------------------------------------------------------ *
 * Chegara
 * ------------------------------------------------------------------ */

test("field-policy.ts hech narsa import qilmaydi", () => {
  const source = readFileSync("src/lib/profile-editor/field-policy.ts", "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/[^\n]*/g, "");

  assert.equal(/^\s*import\s/m.test(source), false, "import topildi");
  assert.equal(source.includes("server-only"), false);
});

/* ------------------------------------------------------------------ *
 * XIZMAT QATLAMI SIYOSAT BILAN MOS KELSIN
 * ------------------------------------------------------------------ */

test("o'qiladigan ustunlar ro'yxati CANDIDATE_FIELDS bilan bir xil", () => {
  /*
   * `edit-service.ts` ustunlarni QO'LDA sanaydi (dinamik qatorda
   * Supabase tiplari yo'qoladi). Ro'yxat siyosatdan qolib ketsa,
   * o'sha maydonning hozirgi qiymati `undefined` bo'lardi — natijada
   * o'zgarmagan maydon ham "o'zgargan" deb hisoblanib, har saqlashda
   * tasdiqlangan fakt qayta ko'rikka ketardi.
   */
  const source = readFileSync("src/lib/profile-editor/edit-service.ts", "utf8");
  const match = source.match(/\.select\("([^"]+)"\)\s*\n\s*\.eq\("id", candidateId\)/);
  assert.ok(match, "select ro'yxati topilmadi");

  const selected = match![1]!
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part !== "")
    .sort();

  assert.deepEqual(selected, Object.keys(CANDIDATE_FIELDS).sort());
});

test("ko'rik talab qiladigan har bir maydon SQL da qo'llanadi", () => {
  /*
   * `apply_candidate_profile_edit` har bir maydonni ALOHIDA yozadi
   * (dinamik SQL in'ektsiyaga yo'l ochardi). Siyosatda `review`
   * bo'lgan maydon u yerda bo'lmasa, admin tasdiqlay olmaydi va
   * o'zgarish navbatda abadiy qolib ketardi.
   */
  /*
   * ENG OXIRGI ta'rif tekshiriladi: funksiya keyingi migratsiyalarda qayta
   * yozilgan (PT409, biografiya maydonlari) va eski fayl endi amaldagi
   * ta'rif emas.
   */
  const dir = "../liderlar-admin/supabase/migrations";
  const latest = readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort()
    .filter((f) => readFileSync(`${dir}/${f}`, "utf8").includes("create or replace function public.apply_candidate_profile_edit("))
    .pop();
  assert.ok(latest, "apply_candidate_profile_edit ta'rifi topilmadi");
  const sql = readFileSync(`${dir}/${latest}`, "utf8");

  for (const [field, rule] of Object.entries(CANDIDATE_FIELDS)) {
    if (rule.policy !== "review") continue;
    assert.ok(
      sql.includes(`v_edit.field = '${field}'`),
      `SQL da qo'llash yo'q: ${field}`,
    );
  }
});

/* ------------------------------------------------------------------ *
 * TUZILGAN YOZUVLAR
 * ------------------------------------------------------------------ */

test("tekshirib bo'ladigan DA'VO bor turlar ko'rikka boradi", () => {
  /*
   * §6 ning "HIGH-TRUST" ro'yxati: mukofotlar, tashkilot da'volari,
   * lavozimlar. Ularni darhol nashr qilish odamga o'ziga istalgan
   * lavozim yozib qo'yish imkonini berardi va u ensiklopediyada
   * fakt sifatida turardi.
   */
  for (const kind of ["education", "work_experiences", "achievements", "events"] as const) {
    assert.equal(ENTRY_RULES[kind].policy, "review", kind);
  }
});

test("o'zini taqdim etish turlari darhol nashr bo'ladi", () => {
  for (const kind of ["books_read", "social_links"] as const) {
    assert.equal(ENTRY_RULES[kind].policy, "direct", kind);
  }
});

test("har bir tur uchun o'zbekcha nom bor", () => {
  for (const kind of ENTRY_KINDS) {
    const label = ENTRY_RULES[kind].label;
    assert.ok(label.trim().length > 0, kind);
    assert.equal(label.includes("_"), false, kind);
  }
});

test("nomsiz yozuv rad etiladi", () => {
  const result = checkEntry("education", { title: "   " });
  assert.equal(result.ok, false);
  assert.ok(result.errors.length > 0);
});

test("juda uzun nom rad etiladi", () => {
  const result = checkEntry("education", { title: "x".repeat(301) });
  assert.equal(result.ok, false);
});

test("to'g'ri yozuv o'tadi va tozalanadi", () => {
  const result = checkEntry("education", {
    title: "  Toshkent davlat universiteti  ",
    subtitle: "",
    date_from: "2015-09-01",
    date_to: "2019-06-30",
  });
  assert.equal(result.ok, true);
  assert.equal(result.value.title, "Toshkent davlat universiteti");
  // Bo'sh matn null bo'ladi: "" va null bir xil ma'noda.
  assert.equal(result.value.subtitle, null);
});

test("javascript: havolasi RAD ETILADI", () => {
  /*
   * Havola ommaviy profilda `href` bo'lib chiqadi — tekshirilmagan
   * sxema saqlangan XSS bo'lardi (§58).
   */
  for (const url of [
    "javascript:alert(1)",
    "JavaScript:alert(1)",
    "data:text/html,<script>",
    "vbscript:msgbox",
    "file:///etc/passwd",
  ]) {
    const result = checkEntry("social_links", { title: "Havola", url });
    assert.equal(result.ok, false, url);
  }
});

test("http:// ham rad etiladi, faqat https://", () => {
  assert.equal(checkEntry("social_links", { title: "Sayt", url: "http://x.uz" }).ok, false);
  assert.equal(checkEntry("social_links", { title: "Sayt", url: "https://x.uz" }).ok, true);
});

test("teskari sana oralig'i rad etiladi", () => {
  // Aks holda ommaviy profilda "2020–2015" ko'rinardi.
  const result = checkEntry("work_experiences", {
    title: "Ish",
    date_from: "2020-01-01",
    date_to: "2015-01-01",
  });
  assert.equal(result.ok, false);
});

test("mavjud bo'lmagan sana rad etiladi", () => {
  // Shakl to'g'ri, lekin 31-fevral yo'q.
  const result = checkEntry("education", { title: "Maktab", date_from: "2026-02-31" });
  assert.equal(result.ok, false);
});

test("noto'g'ri sana shakli rad etiladi", () => {
  for (const date of ["01.01.2020", "2020", "2020-1-1", "kecha"]) {
    assert.equal(checkEntry("education", { title: "Maktab", date_from: date }).ok, false, date);
  }
});

test("sanasiz turlarda sana maydonlari qabul qilinmaydi", () => {
  /*
   * `books_read` da sana ma'noga ega emas. Qiymat berilsa ham
   * natijaga tushmasligi kerak — aks holda bazaga ma'nosiz
   * ma'lumot yozilardi.
   */
  const result = checkEntry("books_read", { title: "Kitob", date_from: "2020-01-01" });
  assert.equal(result.ok, true);
  assert.equal(Object.hasOwn(result.value, "date_from"), false);
});

test("sort_order qabul qilinmaydi", () => {
  /*
   * Tartib alohida amal. Oddiy saqlash bilan qabul qilinsa,
   * foydalanuvchi boshqa yozuvlarning tartibini bilmasdan
   * o'zgartirib qo'yardi.
   */
  const result = checkEntry("education", {
    title: "Maktab",
    ...({ sort_order: 999 } as Record<string, unknown>),
  });
  assert.equal(result.ok, true);
  assert.equal(Object.hasOwn(result.value, "sort_order"), false);
});

/* ------------------------------------------------------------------ *
 * TEKSHIRUVDAGI YOZUV OMMAGA CHIQMASIN
 * ------------------------------------------------------------------ */

test("ommaviy profil so'rovlari review_state bo'yicha filtrlaydi", () => {
  /*
   * YAGONA NUQTA: `candidates.ts` dagi oltita so'rov. Biri filtrsiz
   * qolsa, o'sha bo'limdagi tasdiqlanmagan da'vo (masalan o'ziga
   * yozib qo'yilgan mukofot) ensiklopediyada FAKT sifatida
   * ko'rinardi.
   */
  const source = readFileSync("src/lib/data/candidates.ts", "utf8");

  for (const table of [
    "education",
    "work_experiences",
    "achievements",
    "books_read",
    "events",
    "social_links",
  ]) {
    const pattern = new RegExp(
      `from\\("${table}"\\)[^;\\n]*\\.eq\\("review_state",\\s*"published"\\)`,
    );
    assert.match(source, pattern, `${table}: review_state filtri yo'q`);
  }
});

test("RLS siyosati yangi nom bilan QO'SHILMAYDI, mavjudi qayta ta'riflanadi", () => {
  /*
   * RLS siyosatlari OR bilan birlashadi. Yangi, qat'iyroq siyosat
   * qo'shilsa, `review_state` ni bilmaydigan eski siyosat
   * tekshiruvdagi yozuvlarni BARIBIR ko'rsatib turardi — butun
   * himoya befoyda bo'lardi.
   */
  const sql = readFileSync(
    "../liderlar-admin/supabase/migrations/20261002140000_entry_review_state.sql",
    "utf8",
  );

  // Eski siyosat tashlanadi va shu NOM bilan qaytadan yaratiladi.
  assert.match(sql, /drop policy if exists "public candidate sections"/);
  assert.match(sql, /create policy "public candidate sections"/);

  // Yangi ta'rifda review_state sharti bor.
  const policyBlock = sql.slice(sql.indexOf('create policy "public candidate sections"'));
  assert.match(policyBlock, /review_state = 'published'/);
});

test("mavjud yozuvlar default bo'yicha ommaviy qoladi", () => {
  /*
   * `pending_review` default bo'lganida, migratsiya qo'llanishi
   * bilan barcha mavjud yozuvlar ommaviy profillardan YO'QOLARDI —
   * ular admin kiritgan va allaqachon tasdiqlangan.
   */
  const sql = readFileSync(
    "../liderlar-admin/supabase/migrations/20261002140000_entry_review_state.sql",
    "utf8",
  );
  assert.match(sql, /review_state text not null default 'published'/);
});

test("biografiya bo'limlarida ham ko'rik holati va qayta ta'riflangan siyosat bor", () => {
  /*
   * `candidate_sections` — ommaviy biografiyadagi UZUN MATN. Unda
   * ko'rik holati yo'q edi, ya'ni a'zo matnni muharrirdan boshqara
   * olmasdi. Qo'shilganda ikki xato mumkin edi:
   *
   *   · default `pending_review` — barcha tahririyat matni ommaviy
   *     biografiyalardan YO'QOLARDI;
   *   · yangi nomli RLS siyosati — eski siyosat (u `review_state` ni
   *     bilmaydi) OR bilan qo'shilib, tekshiruvdagi matnni BARIBIR
   *     ko'rsatardi.
   */
  const sql = readFileSync(
    "../liderlar-admin/supabase/migrations/20261004120000_candidate_section_review.sql",
    "utf8",
  );

  assert.match(sql, /review_state text not null default 'published'/);
  assert.match(sql, /drop policy if exists "published candidate sections are public"/);
  assert.match(sql, /create policy "published candidate sections are public"/);

  const policyBlock = sql.slice(
    sql.indexOf('create policy "published candidate sections are public"'),
  );
  assert.match(policyBlock.slice(0, 600), /review_state = 'published'/);

  // Egasi o'zining kutayotgan matnini ko'radi — alohida siyosat.
  assert.match(sql, /c\.user_id = auth\.uid\(\)/);
});

/* ------------------------------------------------------------------ *
 * ENTRY_KINDS JADVAL NOMIGA AYLANADI
 * ------------------------------------------------------------------ */

test("ENTRY_KINDS 0003 dagi jadvallar ro'yxati bilan AYNAN bir xil", () => {
  /*
   * `entry-service.ts` da brauzerdan kelgan `kind` shu ro'yxatdan
   * o'tgandan keyin `from(kind)` ga beriladi — ya'ni JADVAL NOMIGA
   * aylanadi.
   *
   * Ro'yxatga ortiqcha nom qo'shilsa (masalan "candidates"),
   * foydalanuvchi o'sha jadvalga yozish imkonini olardi. Kam
   * bo'lsa, bo'lim muharrirda umuman ko'rinmasdi.
   *
   * Shuning uchun ro'yxat migratsiyadagi halqa bilan solishtiriladi.
   */
  const sql = readFileSync(
    "../liderlar-admin/supabase/migrations/0003_content_schema.sql",
    "utf8",
  );

  const match = sql.match(/foreach t in array array\[\s*([^\]]+)\]/);
  assert.ok(match, "0003 dagi jadvallar halqasi topilmadi");

  const tables = [...match![1]!.matchAll(/'([a-z_]+)'/g)].map((m) => m[1]!).sort();

  assert.deepEqual([...ENTRY_KINDS].sort(), tables);
});

test("ENTRY_KINDS da candidates yoki profiles YO'Q", () => {
  // Ikkinchi himoya: yuqoridagi test migratsiya o'zgarsa ham tutmasligi mumkin.
  for (const forbidden of ["candidates", "profiles", "point_ledger", "vip_subscriptions"]) {
    assert.equal(
      (ENTRY_KINDS as readonly string[]).includes(forbidden),
      false,
      forbidden,
    );
  }
});
