import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import {
  LEGACY_PATH_PREFIX,
  buildLegacyPath,
  buildLegacySlug,
  extractLegacyPostId,
  slugifyLegacyTitle,
} from "../src/lib/legacy/slug.ts";

const LOADER = fs.readFileSync("src/lib/data/legacy-posts.ts", "utf8");
/**
 * Just getLegacyPostBySlug. The same file also holds the sitemap and search
 * helpers, whose own .eq()/ilike calls would otherwise be read as part of the
 * URL resolver.
 */
const RESOLVER = (() => {
  const from = LOADER.indexOf("export async function getLegacyPostBySlug");
  const to = LOADER.indexOf("/* ---", from);
  return LOADER.slice(from, to === -1 ? undefined : to);
})();
const CANDIDATES = fs.readFileSync("src/lib/data/candidates.ts", "utf8");
const LEGACY_PAGE = fs.readFileSync("src/app/nomzodlar/[legacySlug]/page.tsx", "utf8");
const CANDIDATE_PAGE = fs.readFileSync("src/app/liderlar/[slug]/page.tsx", "utf8");

/* ----------------------------- legacy URL shape ---------------------------- */

test("the slug rule reproduces the real 1.0 URLs found in the source data", () => {
  // These two are not invented: they are the full liderlar.uz links that
  // survived inside two article bodies in the export, where one duplicate
  // record of the same person links to the other.
  assert.equal(
    buildLegacySlug("9bidsfxtk1", "ASOMIDDINOV BEHRUZBEK NURIDDIN O‘G‘LI"),
    "9bidsfxtk1-asomiddinov-behruzbek-nuriddin-ogli",
  );
  assert.equal(
    buildLegacySlug("eux0ts6bh1", "ASOMIDDINOV BEHRUZBEK NURIDDIN O‘G‘LI"),
    "eux0ts6bh1-asomiddinov-behruzbek-nuriddin-ogli",
  );
  assert.equal(
    buildLegacyPath("9bidsfxtk1-asomiddinov-behruzbek-nuriddin-ogli"),
    "/nomzodlar/9bidsfxtk1-asomiddinov-behruzbek-nuriddin-ogli",
  );
});

test("uzbek apostrophes are dropped, not turned into separators", () => {
  // "O‘G‘LI" -> "ogli". A hyphen here would have produced "o-g-li" and every
  // legacy link for a male candidate would 404.
  for (const apostrophe of ["‘", "’", "ʻ", "ʼ", "'"]) {
    assert.equal(slugifyLegacyTitle(`ALIYEV BEK O${apostrophe}G${apostrophe}LI`), "aliyev-bek-ogli");
  }
  assert.equal(slugifyLegacyTitle("NURMUHAMMADOV SHOHRÓZ"), "nurmuhammadov-shohroz");
});

test("an explicit Tilda alias replaces the derived slug", () => {
  assert.equal(
    buildLegacySlug("jh8j2kasx1", "XASANOV SANJAR XASAN O‘G‘LI", "xasanov-sanjar"),
    "xasanov-sanjar",
  );
});

test("the post id prefix is recoverable, and a bare alias is not mistaken for one", () => {
  assert.equal(extractLegacyPostId("9bidsfxtk1-asomiddinov-behruzbek"), "9bidsfxtk1");
  assert.equal(extractLegacyPostId("xasanov-sanjar"), null, "an alias has no 10-char id");
  assert.equal(extractLegacyPostId("9bidsfxtk1"), null, "an id with no tail is not a legacy slug");
  assert.equal(extractLegacyPostId(""), null);
});

/* ------------------------------- namespaces ------------------------------- */

test("the two namespaces never cross-match", () => {
  // /nomzodlar reads legacy_posts and nothing else...
  assert.match(LOADER, /from\("legacy_posts"\)/);
  assert.ok(!LOADER.includes('from("candidates")'), "the legacy loader never queries candidates");

  // ...and /liderlar reads candidates and nothing else.
  assert.match(CANDIDATES, /from\("candidates"\)/);
  assert.ok(
    !CANDIDATES.includes("legacy_posts"),
    "the 2.0 candidate loader never queries legacy_posts",
  );

  // The pages use their own loader, not each other's.
  assert.match(LEGACY_PAGE, /getLegacyPostBySlug/);
  assert.ok(!LEGACY_PAGE.includes("getCandidateBySlug"));
  assert.ok(!CANDIDATE_PAGE.includes("getLegacyPostBySlug"));
});

test("a legacy URL is served, never redirected to /liderlar", () => {
  // The old links live in search indexes and on other sites, and most of them
  // have no 2.0 counterpart at all — a redirect would land on the wrong person
  // or on a 404.
  assert.ok(!LEGACY_PAGE.includes("redirect("), "the legacy page never redirects");
  assert.ok(!LEGACY_PAGE.includes("permanentRedirect"));

  const nextConfig = fs.readFileSync("next.config.ts", "utf8");
  const redirects = nextConfig.slice(nextConfig.indexOf("async redirects()"));
  assert.ok(
    !redirects.includes(LEGACY_PATH_PREFIX),
    "no config-level redirect claims the legacy prefix",
  );

  // The canonical tag points at the legacy URL itself: this page lives here.
  assert.match(LEGACY_PAGE, /canonical: `\$\{SITE_URL\}\$\{post\.legacy_path\}`/);
});

test("the legacy slug resolves by slug, then alias, then post id", () => {
  // The tail of a derived slug depends on Tilda's transliteration, which is
  // only known from two samples; the post id prefix is exact, so it is the
  // fallback that keeps an old link working even if the tail differs.
  // Only the resolver body counts — every column name also appears above it in
  // the interface and the SELECT string.
  const lookups = [...RESOLVER.matchAll(/\.eq\("([a-z_]+)"/g)].map((m) => m[1]);
  assert.deepEqual(lookups, ["legacy_slug", "legacy_alias", "legacy_source_id"]);
});

/* --------------------------- date + presentation --------------------------- */

test("the article date comes from the source, never from the import", () => {
  assert.match(LEGACY_PAGE, /post\.legacy_created_at && /, "the date is rendered only when present");
  assert.ok(!LEGACY_PAGE.includes("imported_at"), "the import timestamp is never shown as the date");
  assert.ok(!LEGACY_PAGE.includes("new Date()"), "no fabricated date");
  assert.match(LOADER, /legacy_created_at/);
});

test("the legacy page is rendered in the 2.0 design, not the old site's", () => {
  const body = fs.readFileSync("src/components/ui/legacy-article-body.tsx", "utf8");
  // Header and footer come from the root layout, and the page uses the same
  // typography tokens as the 2.0 article page.
  for (const token of ["font-display", "text-navy", "bg-paper", "border-brand-soft", "shadow-card"]) {
    assert.ok(LEGACY_PAGE.includes(token), `legacy page uses the 2.0 token ${token}`);
  }
  assert.match(LEGACY_PAGE, /Breadcrumbs/);
  // Responsive: the article column is capped and the layout has sm: breakpoints.
  assert.match(LEGACY_PAGE, /max-w-3xl/);
  assert.match(body, /sm:text-\[1\.1rem\]/);
  // Nothing from Tilda's own stylesheet survives.
  assert.ok(!body.includes("t-redactor"), "no Tilda class names are styled");
});

/* ------------------------- the third real 1.0 URL ------------------------- */

test("the slug rule also reproduces a 1.0 URL supplied from outside the file", () => {
  // Given independently of the export as a real old link. Post ID lp3txctvv1 is
  // in the dataset (BAXTIYOROVA NOZIMAXON SHAROFJON QIZI, published), and the
  // rule derived from the two in-file links reproduces this one exactly — a
  // third confirmation, from a source that could not have been fitted to.
  assert.equal(
    buildLegacyPath(buildLegacySlug("lp3txctvv1", "BAXTIYOROVA NOZIMAXON SHAROFJON QIZI")),
    "/nomzodlar/lp3txctvv1-baxtiyorova-nozimaxon-sharofjon-qizi",
  );
});

test("the post id prefix cannot resolve to a different record", () => {
  // The fallback matches legacy_source_id EXACTLY, and Post IDs are unique
  // across all 1991 records, so /nomzodlar/<id>-anything can only ever reach
  // the one record that owns that id.
  assert.equal(extractLegacyPostId("lp3txctvv1-butunlay-boshqa-matn"), "lp3txctvv1");
  assert.equal(extractLegacyPostId("lp3txctvv1-baxtiyorova-nozimaxon"), "lp3txctvv1");
  // Not ten characters, so it is not a post id and resolves to nothing.
  assert.equal(extractLegacyPostId("lp3txctvv-short-tail"), null);
  assert.equal(extractLegacyPostId("lp3txctvv1x-too-long"), null);

  assert.match(RESOLVER, /\.eq\("legacy_source_id", postId\)/, "an exact id match, never a prefix scan");
  assert.ok(!RESOLVER.includes("ilike"), "no fuzzy matching in the resolver");
});

/* ------------------------------- sitemap --------------------------------- */

test("published legacy posts enter the sitemap and drafts never do", () => {
  const loader = fs.readFileSync("src/lib/data/legacy-posts.ts", "utf8");
  const fn = loader.slice(loader.indexOf("getPublishedLegacyPostsForSitemap"));
  // The admin client bypasses RLS, so the published filter is written by hand.
  assert.match(fn, /\.eq\("legacy_status", "published"\)/);
  assert.match(fn, /\.is\("deleted_at", null\)/);

  const sitemap = fs.readFileSync("src/app/sitemap.ts", "utf8");
  assert.match(sitemap, /getPublishedLegacyPostsForSitemap\(\)/);
  assert.match(sitemap, /\$\{SITE_URL\}\$\{post\.legacy_path\}/);
  // 2.0 entries are still there — the two run in parallel.
  assert.match(sitemap, /\$\{SITE_URL\}\/liderlar\/\$\{c\.slug\}/);
  assert.match(sitemap, /\$\{SITE_URL\}\/maqola\/\$\{a\.slug\}/);
  // lastModified comes from the source date, and is omitted when there is none.
  assert.match(sitemap, /post\.legacy_created_at\s*\?\s*\{ lastModified: new Date\(post\.legacy_created_at\) \}/);
});

/* -------------------------------- search ---------------------------------- */

test("search finds legacy posts and sends them to their own URLs", () => {
  const search = fs.readFileSync("src/lib/data/search.ts", "utf8");
  const page = fs.readFileSync("src/app/qidiruv/page.tsx", "utf8");

  assert.match(search, /searchLegacyPosts/);
  // A separate group, never merged into `candidates` — ranking, TOP-100 and the
  // published-candidate statistics are all computed from that table.
  assert.match(search, /legacyPosts,/);
  // The top-level result object — indented two spaces. `lastIndexOf` would
  // land inside the journalArticles map instead.
  const resultObject = search.slice(search.search(/\n  return \{/));
  assert.match(resultObject, /legacyPosts,/);
  assert.match(
    resultObject,
    /candidates: \(candidates\.data \?\? \[\]\)\.map\(normalizeCandidateRow\)/,
    "the candidate list is built only from the candidates query",
  );
  assert.match(page, /href=\{post\.legacy_path\}/);
  assert.ok(!page.includes("/liderlar/${post"), "a legacy hit never links into /liderlar");
});

test("legacy search is only ever a published, fail-soft read", () => {
  const loader = fs.readFileSync("src/lib/data/legacy-posts.ts", "utf8");
  const fn = loader.slice(loader.indexOf("export async function searchLegacyPosts"));
  assert.match(fn, /\.eq\("legacy_status", "published"\)/);
  // globalSearch fans out with Promise.all and the page catches the whole
  // thing, so a throw here would take the 2.0 results down with it.
  assert.match(fn, /catch \(err\)[\s\S]*return \[\]/);
  assert.match(fn, /if \(error\)[\s\S]*return \[\]/);
});

test("legacy rows stay out of ranking, TOP-100 and the candidate statistics", () => {
  for (const file of ["src/lib/data/stats.ts", "src/lib/data/ranking.ts"]) {
    const source = fs.readFileSync(file, "utf8");
    assert.ok(!source.includes("legacy_posts"), `${file} never reads legacy_posts`);
  }
  const top100 = fs.readFileSync("src/app/top-100/page.tsx", "utf8");
  assert.ok(!top100.includes("legacy"), "TOP-100 never reads the archive");
});

/* ---------------------------- production origin --------------------------- */

test("a production build refuses to publish localhost as the public origin", () => {
  // Not hypothetical: liderlar.uz was live and serving
  // <loc>http://localhost:3000</loc> in its sitemap because the production
  // environment still carried the dev value.
  const read = (nodeEnv: "production" | "development", siteUrl: string) =>
    execFileSync(
      process.execPath,
      ["-e", 'import("./src/lib/constants.ts").then(m => console.log(m.SITE_URL))'],
      { env: { ...process.env, NODE_ENV: nodeEnv, NEXT_PUBLIC_SITE_URL: siteUrl }, encoding: "utf8" },
    ).trim();

  assert.equal(read("production", "http://localhost:3000"), "https://liderlar.uz");
  assert.equal(read("production", "http://127.0.0.1:3000"), "https://liderlar.uz");
  assert.equal(read("production", "https://liderlar-web.vercel.app"), "https://liderlar.uz");
  assert.equal(read("production", ""), "https://liderlar.uz");
  assert.equal(read("production", "https://liderlar.uz"), "https://liderlar.uz");
  // Local development keeps localhost, which is what makes dev links work.
  assert.equal(read("development", "http://localhost:3000"), "http://localhost:3000");
});
