import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

/*
 * A'ZO MAQOLALARI BIOGRAFIK SAHIFADA.
 *
 * Egasining talabi: nashr qilingan maqola profilda AVTOMATIK chiqsin,
 * kabinetda esa har birini yashirish tugmasi bo'lsin. Bu test uchta
 * narsani qo'riqlaydi: yuklovchi to'g'ri filtrlaydi, barcha dizayn
 * ko'rsatadi, yashirish faqat egasiga ruxsat.
 */

test("yuklovchi faqat NASHR QILINGAN va KO'RSATILADIGAN maqolani oladi", () => {
  const source = readFileSync("src/lib/data/candidates.ts", "utf8");
  const query = source.slice(source.indexOf('.from("member_articles")'));
  const head = query.slice(0, 600);
  assert.match(head, /\.eq\("state", "published"\)/, "qoralama profilga chiqib ketadi");
  assert.match(head, /\.eq\("show_on_profile", true\)/, "yashirilgan maqola profilda qoladi");
});

test("har bir dizayn a'zo maqolalarini ko'rsatadi", () => {
  /*
   * Ro'yxat `loader.tsx` dan olinadi — yangi dizayn qo'shilsa, u ham
   * shu talabga tushadi.
   */
  const loader = readFileSync("src/components/themes/loader.tsx", "utf8");
  const match = loader.match(/const IMPLEMENTED: readonly ThemeKey\[\] = \[([^\]]*)\]/);
  assert.ok(match, "IMPLEMENTED ro'yxati topilmadi");
  const keys = [...match![1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);

  const missing = keys.filter(
    (key) => !readFileSync(`src/components/themes/${key}/index.tsx`, "utf8").includes("memberArticles"),
  );
  assert.deepEqual(missing, [], `maqolalarni ko'rsatmaydigan dizaynlar: ${missing.join(", ")}`);
});

test("standart sahifa maqolalar bo'limini chizadi", () => {
  const page = readFileSync("src/app/liderlar/[slug]/page.tsx", "utf8");
  assert.match(page, /<ProfileMemberArticles articles=\{candidate\.memberArticles\} \/>/);
});

test("yashirish: EGALIK yozishning o'zida, VIP talab qilinmaydi", () => {
  const source = readFileSync("src/lib/articles/author-service.ts", "utf8");
  const fn = source.slice(source.indexOf("export async function setArticleProfileVisibility"));

  assert.match(fn, /resolveOwnCandidate\(\)/, "kim ekani serverda aniqlanmaydi");
  assert.match(
    fn,
    /\.eq\("candidate_id", resolved\.owned\.candidateId\)/,
    "begona maqolani yashirish mumkin bo'lib qoladi",
  );
  /*
   * VIP huquqi ATAYLAB yo'q: obunasi tugagan a'zo ham o'z maqolasini
   * sahifasidan olib tashlay olishi kerak.
   */
  assert.equal(/requireEntitlement\(/.test(fn.slice(0, fn.indexOf("\n}\n"))), false);
});

test("Liderlar Online sahifasi belgilangan matnni chizadi, xom HTML emas", () => {
  const page = readFileSync("src/app/liderlar-online/[slug]/page.tsx", "utf8");
  assert.match(page, /<RichArticleBody content=\{article\.content\}/);

  const body = readFileSync("src/components/ui/rich-article-body.tsx", "utf8");
  assert.equal(body.includes("dangerouslySetInnerHTML="), false, "a'zo matni HTML sifatida chiqadi");
});
