import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  ARTICLE_STATES,
  authorCanEdit,
  authorCanSubmit,
  checkSubmittable,
  CONTENT_MIN_LENGTH,
  editorCan,
  isPublic,
  nextState,
  readingMinutes,
  requiresNote,
  slugify,
  STATE_TEXT,
  uniqueSlug,
  type EditorAction,
} from "../src/lib/articles/state.ts";

/* ------------------------------------------------------------------ *
 * HOLATLAR — §23
 * ------------------------------------------------------------------ */

test("spec talab qilgan sakkiz holat bor", () => {
  assert.equal(ARTICLE_STATES.length, 8);
  for (const state of [
    "draft",
    "submitted",
    "in_review",
    "changes_requested",
    "approved",
    "published",
    "rejected",
    "archived",
  ]) {
    assert.ok((ARTICLE_STATES as readonly string[]).includes(state), state);
  }
});

test("har bir holat uchun o'zbekcha matn bor", () => {
  for (const state of ARTICLE_STATES) {
    assert.ok(STATE_TEXT[state].trim().length > 0, state);
  }
});

test("faqat published ommada ko'rinadi", () => {
  for (const state of ARTICLE_STATES) {
    assert.equal(isPublic(state), state === "published", state);
  }
});

/* ------------------------------------------------------------------ *
 * MUALLIF HUQUQLARI
 * ------------------------------------------------------------------ */

test("ko'rilayotgan maqolani muallif TAHRIRLAY OLMAYDI", () => {
  /*
   * Tahririyat o'qiyotgan matn ostidan o'zgartirilsa, muharrir
   * allaqachon yo'q matnni ko'rib chiqqan bo'lardi.
   */
  assert.equal(authorCanEdit("in_review"), false);
  assert.equal(authorCanEdit("submitted"), false);
});

test("nashr qilingan maqolani muallif o'zgartira olmaydi", () => {
  /*
   * Jimgina o'zgartirish o'quvchi ko'rgan narsadan boshqasini
   * qoldirardi.
   */
  assert.equal(authorCanEdit("published"), false);
});

test("qoralama va qaytarilgan maqola tahrirlanadi", () => {
  assert.equal(authorCanEdit("draft"), true);
  assert.equal(authorCanEdit("changes_requested"), true);
  assert.equal(authorCanEdit("rejected"), true);
});

test("tahrirlanadigan holat yuborilishi ham mumkin", () => {
  // Teskarisi mantiqsiz bo'lardi: tahrirlab, yuborolmaslik.
  for (const state of ARTICLE_STATES) {
    if (authorCanEdit(state)) {
      assert.equal(authorCanSubmit(state), true, state);
    }
  }
});

test("arxivlangan maqola qayta yuborilmaydi", () => {
  assert.equal(authorCanSubmit("archived"), false);
  assert.equal(authorCanSubmit("approved"), false);
  assert.equal(authorCanSubmit("published"), false);
});

/* ------------------------------------------------------------------ *
 * TAHRIRIYAT — §27
 * ------------------------------------------------------------------ */

test("nashr FAQAT tasdiqlangandan keyin", () => {
  /*
   * Tasdiqlashni o'tkazib yuborish ikki qadamni bitta tugmaga
   * yig'ardi va "kim tasdiqladi" savoli javobsiz qolardi.
   */
  for (const state of ARTICLE_STATES) {
    assert.equal(editorCan("publish", state), state === "approved", state);
  }
});

test("qoralamani tahririyat ko'rib chiqa olmaydi", () => {
  // Muallif hali yubormagan matnni ko'rish uning ishiga aralashish bo'lardi.
  assert.equal(editorCan("start_review", "draft"), false);
  assert.equal(editorCan("approve", "draft"), false);
  assert.equal(editorCan("reject", "draft"), false);
});

test("nashrdan qaytarish va arxivlash ALOHIDA amallar", () => {
  /*
   * Arxiv "eskirgan", nashrdan qaytarish "xato chiqdi" degani —
   * ikkinchisida maqola tahrirga qaytadi.
   */
  assert.equal(nextState("archive"), "archived");
  assert.equal(nextState("unpublish"), "draft");
  assert.equal(editorCan("unpublish", "published"), true);
  assert.equal(editorCan("unpublish", "draft"), false);
});

test("har bir amal uchun keyingi holat belgilangan", () => {
  const actions: EditorAction[] = [
    "start_review",
    "request_changes",
    "approve",
    "publish",
    "reject",
    "archive",
    "unpublish",
  ];
  for (const action of actions) {
    const next = nextState(action);
    assert.ok((ARTICLE_STATES as readonly string[]).includes(next), action);
  }
});

test("tuzatish va rad etish izohsiz bo'lmaydi", () => {
  // §27: muallif nima qilishini bilishi kerak.
  assert.equal(requiresNote("request_changes"), true);
  assert.equal(requiresNote("reject"), true);
  assert.equal(requiresNote("approve"), false);
  assert.equal(requiresNote("publish"), false);
});

/* ------------------------------------------------------------------ *
 * YUBORISH SHARTLARI — §23
 * ------------------------------------------------------------------ */

const GOOD_CONTENT = "x".repeat(CONTENT_MIN_LENGTH);

test("banner rasmsiz maqola yuborilmaydi", () => {
  const result = checkSubmittable({
    title: "Yaxshi sarlavha",
    content: GOOD_CONTENT,
    heroUrl: "",
  });
  assert.equal(result.ok, false);
  assert.deepEqual(result.problems, ["hero"]);
});

test("qisqa matn yuborilmaydi", () => {
  const result = checkSubmittable({
    title: "Yaxshi sarlavha",
    content: "Juda qisqa",
    heroUrl: "https://x/y.webp",
  });
  assert.deepEqual(result.problems, ["content"]);
});

test("qisqa sarlavha yuborilmaydi", () => {
  const result = checkSubmittable({
    title: "Qis",
    content: GOOD_CONTENT,
    heroUrl: "https://x/y.webp",
  });
  assert.deepEqual(result.problems, ["title"]);
});

test("HAMMA muammo birdan qaytariladi", () => {
  /*
   * Birinchisini qaytarsak, odam uchta xatoni ketma-ket tuzatib,
   * uch marta yuborishga urinardi.
   */
  const result = checkSubmittable({});
  assert.deepEqual(result.problems.sort(), ["content", "hero", "title"]);
});

test("to'liq maqola o'tadi", () => {
  const result = checkSubmittable({
    title: "Mening yo'lim",
    content: GOOD_CONTENT,
    heroUrl: "https://x/y.webp",
  });
  assert.equal(result.ok, true);
  assert.deepEqual(result.problems, []);
});

/* ------------------------------------------------------------------ *
 * SLUG
 * ------------------------------------------------------------------ */

test("sarlavhadan o'qiladigan manzil yasaladi", () => {
  assert.equal(slugify("Mening yo'lim"), "mening-yolim");
  assert.equal(slugify("Yoshlar va kelajak"), "yoshlar-va-kelajak");
});

test("kirillcha sarlavha ham ishlaydi", () => {
  assert.equal(slugify("Менинг йўлим"), "mening-yolim");
});

test("o'zbek apostrofi olib tashlanadi", () => {
  /*
   * Apostrof manzilda kodlanib (`%27`), havolani o'qilmas
   * qilardi.
   */
  const slug = slugify("O'zbekiston g'ururi");
  assert.equal(slug.includes("'"), false);
  assert.equal(slug, "ozbekiston-gururi");
});

test("manzil tire bilan boshlanmaydi va tugamaydi", () => {
  for (const title of ["  Salom  ", "!!! Salom !!!", "---Salom---"]) {
    const slug = slugify(title);
    assert.equal(slug.startsWith("-"), false, title);
    assert.equal(slug.endsWith("-"), false, title);
  }
});

test("bo'sh sarlavhadan zaxira manzil chiqadi", () => {
  assert.equal(uniqueSlug(slugify("!!!"), new Set()), "maqola");
});

test("band manzilga raqam qo'shiladi", () => {
  const taken = new Set(["mening-yolim", "mening-yolim-2"]);
  assert.equal(uniqueSlug("mening-yolim", taken), "mening-yolim-3");
});

test("bo'sh manzil bo'lsa ham band bo'lmasa o'zi qaytadi", () => {
  assert.equal(uniqueSlug("yangi-maqola", new Set()), "yangi-maqola");
});

/* ------------------------------------------------------------------ *
 * O'QISH VAQTI — §31
 * ------------------------------------------------------------------ */

test("qisqa matn uchun o'qish vaqti KO'RSATILMAYDI", () => {
  /*
   * §31 "reading time if accurately calculated" deydi — 50 so'zli
   * matn uchun "1 daqiqa" ma'nosiz.
   */
  assert.equal(readingMinutes("qisqa matn"), null);
  assert.equal(readingMinutes(Array(50).fill("so'z").join(" ")), null);
});

test("uzun matn uchun daqiqa hisoblanadi", () => {
  const minutes = readingMinutes(Array(540).fill("so'z").join(" "));
  assert.equal(minutes, 3);
});

/* ------------------------------------------------------------------ *
 * Chegara
 * ------------------------------------------------------------------ */

test("state.ts hech narsa import qilmaydi", () => {
  const source = readFileSync("src/lib/articles/state.ts", "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/[^\n]*/g, "");
  assert.equal(/^\s*import\s/m.test(source), false);
});

/* ------------------------------------------------------------------ *
 * MAVJUD JADVALGA TEGILMAGANLIGI
 * ------------------------------------------------------------------ */

test("a'zo maqolalari ALOHIDA jadvalda", () => {
  /*
   * Mavjud `articles` — nomzod BIOGRAFIYASI va u profil sahifasida
   * biografiya matni sifatida ko'rsatiladi. A'zo maqolasini o'sha
   * jadvalga qo'shish insholarni biografiya o'rniga chiqarardi.
   */
  const sql = readFileSync(
    "../liderlar-admin/supabase/migrations/20261002200000_member_articles.sql",
    "utf8",
  );
  assert.match(sql, /create table if not exists public\.member_articles/);
  // Mavjud jadvalga ALTER qilinmaganligi.
  assert.equal(/alter table (only )?public\.articles/.test(sql), false);
});

test("nashr sharti BAZA darajasida ham qo'yilgan", () => {
  /*
   * §23: bannersiz maqola nashr qilinmasligi kerak. Shart faqat
   * ilovada bo'lsa, admin paneldan yoki keyingi koddan bannersiz
   * maqola nashr qilinishi mumkin bo'lardi.
   */
  const sql = readFileSync(
    "../liderlar-admin/supabase/migrations/20261002200000_member_articles.sql",
    "utf8",
  );
  assert.match(sql, /member_article_publish_guard/);
  assert.match(sql, /banner rasmi bo/);
});

test("kanal modeli nusxa maqola yaratmaydi", () => {
  /*
   * §25: bitta kanonik maqola + kanal metama'lumoti. Ikki nusxa
   * maqola bo'lsa, ular vaqt o'tib bir-biridan ajralib ketardi.
   */
  const sql = readFileSync(
    "../liderlar-admin/supabase/migrations/20261002200000_member_articles.sql",
    "utf8",
  );
  assert.match(sql, /create table if not exists public\.member_article_channels/);
  assert.match(sql, /primary key \(article_id, channel\)/);
  assert.match(sql, /channel in \('liderlar_online', 'adabiyotx'\)/);
});

/* ------------------------------------------------------------------ *
 * LIDERLAR ONLINE — OMMAVIY BO'LIM
 * ------------------------------------------------------------------ */

function src(path: string): string {
  return readFileSync(path, "utf8");
}

test("ommaviy lenta faqat nashr qilinganlarni oladi", () => {
  const data = src("src/lib/data/liderlar-online.ts");
  // Har bir so'rovda holat sharti bo'lishi kerak.
  const queries = [...data.matchAll(/from\("member_articles"\)/g)];
  assert.ok(queries.length >= 3, `so'rovlar kam: ${queries.length}`);

  const statusFilters = [...data.matchAll(/\.eq\("state", "published"\)/g)];
  assert.equal(
    statusFilters.length,
    queries.length,
    "ba'zi so'rovda holat filtri yo'q",
  );
});

test("ro'yxat MAZMUNNI tortmaydi", () => {
  /*
   * `select("*")` har kartochka uchun o'n minglab belgi uzatardi
   * (§51). Ustunlar aniq sanalgan bo'lishi kerak.
   */
  const data = src("src/lib/data/liderlar-online.ts");
  assert.equal(/\.select\("\*"\)/.test(data), false, "select(*) topildi");
  assert.match(data, /const CARD_COLUMNS =/);
  // Kartochka ustunlarida `content` bo'lmasligi kerak.
  const columns = data.slice(data.indexOf("const CARD_COLUMNS ="), data.indexOf(";", data.indexOf("const CARD_COLUMNS =")));
  assert.equal(columns.includes("content"), false, "kartochka mazmunni tortyapti");
});

test("sahifalash KURSOR bilan, offset emas", () => {
  /*
   * `offset` oshgani sari baza oldidagi barcha qatorlarni sanab
   * o'tadi va oxirgi sahifalar sekinlashadi.
   */
  const data = src("src/lib/data/liderlar-online.ts");
  assert.match(data, /\.lt\("published_at", cursor\)/);
  assert.equal(/\.range\(/.test(data), false, "range/offset topildi");
});

test("noto'liq maqola ro'yxatdan chiqariladi", () => {
  /*
   * Manzil, banner yoki muallifsiz kartochka buzilgan havola yoki
   * bo'sh rasm bo'lib chiqardi.
   */
  const data = src("src/lib/data/liderlar-online.ts");
  assert.match(data, /if \(!slug \|\| !heroUrl \|\| !publishedAt \|\| !candidate\?\.slug\) return null/);
});

test("bo'lim flag ostida va o'chiq bo'lsa 404", () => {
  /*
   * §41: flag server tomonda majburlanadi. "Tez kunda" sahifasi
   * emas — bo'sh bo'lim qidiruv tizimlariga ham keraksiz.
   */
  for (const page of [
    "src/app/liderlar-online/page.tsx",
    "src/app/liderlar-online/[slug]/page.tsx",
    "src/app/liderlar-online/sahifa/page.tsx",
  ]) {
    const source = src(page);
    assert.match(source, /isFeatureEnabled\("liderlar_online\.enabled"\)/, page);
    assert.match(source, /notFound\(\)/, page);
  }
});

test("kartochha BITTA havola — rasm ham, sarlavha ham ichida", () => {
  /*
   * §30: rasm bosilganda maqola ochilishi kerak va sarlavha ham
   * bosiladigan bo'lsin. Ikki alohida `<a>` ekran o'quvchisiga
   * bitta maqolani ikki marta o'qib berardi.
   */
  const card = src("src/components/online/article-card.tsx");
  const links = [...card.matchAll(/<Link\s/g)];
  assert.equal(links.length, 1, `kartochkada ${links.length} havola bor`);
  // Rasm va sarlavha havola ichida bo'lishi kerak.
  const linkAt = card.indexOf("<Link");
  assert.ok(card.indexOf("<Image") > linkAt);
  assert.ok(card.indexOf("<h3") > linkAt);
});

test("maqola sahifasida kanonik manzil va OG bor", () => {
  /*
   * §32: maqola keyin AdabiyotX ga ham uzatiladi. Kanonik
   * manzilsiz qidiruv tizimi ikkisini takroriy mazmun deb
   * hisoblardi.
   */
  const page = src("src/app/liderlar-online/[slug]/page.tsx");
  assert.match(page, /alternates: \{ canonical: url \}/);
  assert.match(page, /openGraph:/);
  assert.match(page, /twitter:/);
  assert.match(page, /application\/ld\+json/);
});

test("sahifalangan ro'yxat indekslanmaydi", () => {
  /*
   * Ikkinchi, uchinchi sahifalar bosh sahifa bilan raqobat
   * qilardi va takroriy mazmun sifatida ko'rinardi.
   */
  const page = src("src/app/liderlar-online/sahifa/page.tsx");
  assert.match(page, /robots: \{ index: false, follow: true \}/);
});

test("muallif o'z profiliga havola qiladi", () => {
  // §26, §31: muallif ensiklopediyadagi profilga bog'lanadi.
  const page = src("src/app/liderlar-online/[slug]/page.tsx");
  assert.match(page, /\/liderlar\/\$\{article\.author\.slug\}/);
});

test("sitemap flag o'chiq bo'lsa manzil qo'shmaydi", () => {
  /*
   * Bo'lim o'chiq bo'lsa sahifalar 404 qaytaradi — ularni
   * sitemap'ga qo'shish qidiruv tizimini mavjud bo'lmagan
   * manzillarga yuborardi.
   */
  const sitemap = src("src/app/sitemap.ts");
  assert.match(sitemap, /isFeatureEnabled\("liderlar_online\.enabled"\)/);
  assert.match(sitemap, /getOnlineSlugs\(\)/);
});
