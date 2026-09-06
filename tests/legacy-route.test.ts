import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  LEGACY_PATH_PREFIX,
  buildLegacyPath,
  buildLegacySlug,
  extractLegacyPostId,
  slugifyLegacyTitle,
} from "../src/lib/legacy/slug.ts";

const LOADER = fs.readFileSync("src/lib/data/legacy-posts.ts", "utf8");
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
  const resolver = LOADER.slice(LOADER.indexOf("export async function getLegacyPostBySlug"));
  const lookups = [...resolver.matchAll(/\.eq\("([a-z_]+)"/g)].map((m) => m[1]);
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
