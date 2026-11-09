import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import {
  BAR_ATTENTIONS,
  BAR_ENTRANCES,
  BAR_LOGO_POSITIONS,
  BAR_ROTATIONS,
  BAR_THEMES,
  DEFAULT_HIGHLIGHT_STYLE,
  eligibleAds,
  imageFrameHeight,
  mapHighlightAdRow,
  mapHighlightSettingsRow,
  nextCursor,
  nextXState,
  parseStyle,
  pickIndex,
  readableOn,
  type HighlightAd,
} from "../src/lib/profile-highlight/rules.ts";

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

function row(patch: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    kind: "text",
    text: "Ilovani yuklab oling",
    url: "https://liderlar.uz/ilova",
    button_label: "Yuklab olish",
    logo_url: "https://x.supabase.co/storage/v1/object/public/elon-media/a.webp",
    image_url: null,
    image_width: null,
    image_height: null,
    style: { theme: "glass-dark", entrance: "unfold", attention: "pulse" },
    close_opens_link: true,
    starts_at: null,
    ends_at: null,
    sort_order: 1,
    ...patch,
  };
}

test("style faqat oq ro'yxatdan; ranglar faqat 'custom' da", () => {
  assert.deepEqual(parseStyle(null), DEFAULT_HIGHLIGHT_STYLE);
  const s = parseStyle({ theme: "x", entrance: "unfold", attention: "y", bg: "#ffffff" });
  assert.equal(s.theme, "glass-light");
  assert.equal(s.entrance, "unfold");
  assert.equal(s.attention, "shimmer");
  assert.equal(s.bg, null);
  assert.equal(parseStyle({ theme: "custom", bg: "#ABCDEF", fg: "red" }).bg, "#abcdef");
});

test("xavfli yoki chala qatorlar ko'rsatilmaydi", () => {
  assert.ok(mapHighlightAdRow(row()));
  assert.equal(mapHighlightAdRow(row({ url: "javascript:alert(1)" })), null);
  assert.equal(mapHighlightAdRow(row({ text: "  " })), null);
  assert.equal(mapHighlightAdRow(row({ kind: "image", image_url: null })), null);
  assert.equal(mapHighlightAdRow(row({ kind: "video" })), null);
  const image = mapHighlightAdRow(row({ kind: "image", image_url: "https://x.uz/a.webp", text: null }));
  assert.ok(image);
  assert.equal(image?.buttonLabel, null);
  assert.equal(image?.logoUrl, null);
  const unsafeLogo = mapHighlightAdRow(row({ logo_url: "data:image/png;base64,AAA" }));
  assert.equal(unsafeLogo?.logoUrl, null);
});

test("sozlamalar chegaraga keltiriladi", () => {
  const s = mapHighlightSettingsRow({
    profile_bar_rotation: "cycle",
    profile_bar_appear_delay_ms: 999999,
    profile_bar_cycle_seconds: 1,
    profile_bar_dismiss_hours: 0,
    profile_bar_hide_on_scroll: false,
  });
  assert.equal(s.rotation, "cycle");
  assert.equal(s.appearDelayMs, 30000);
  assert.equal(s.cycleSeconds, 3);
  assert.equal(s.dismissHours, 1);
  assert.equal(s.hideOnScroll, false);
  assert.equal(mapHighlightSettingsRow(null).rotation, "sequential");
});

test("yopilgan reklama tanaffus davomida chiqmaydi, muddati tugagani ham", () => {
  const now = Date.parse("2026-11-09T12:00:00Z");
  const a = mapHighlightAdRow(row({ id: "a" })) as HighlightAd;
  const b = mapHighlightAdRow(row({ id: "b" })) as HighlightAd;
  const c = mapHighlightAdRow(row({ id: "c", ends_at: "2026-11-09T11:00:00Z" })) as HighlightAd;
  const list = eligibleAds([a, b, c], { a: now - 3_600_000 }, 12, now);
  assert.deepEqual(
    list.map((x) => x.id),
    ["b"],
  );
  const later = eligibleAds([a, b], { a: now - 13 * 3_600_000 }, 12, now);
  assert.deepEqual(
    later.map((x) => x.id),
    ["a", "b"],
  );
});

test("navbat: ketma-ket, tasodifiy va chegaralar", () => {
  assert.equal(pickIndex("sequential", 0, 3, 0.9), 0);
  assert.equal(pickIndex("sequential", 4, 3, 0.9), 1);
  assert.equal(pickIndex("cycle", 2, 3, 0), 2);
  assert.equal(pickIndex("random", 0, 3, 0.99), 2);
  assert.equal(pickIndex("sequential", -5, 3, 0), 0);
  assert.equal(pickIndex("sequential", 0, 0, 0), -1);
  assert.equal(nextCursor(2, 3), 3);
});

test("X: birinchi bosish qurollantiradi, ikkinchisi yopadi", () => {
  assert.equal(nextXState("idle", true), "armed");
  assert.equal(nextXState("armed", true), "closed");
  assert.equal(nextXState("idle", false), "closed");
});

test("rasm balandligi nisbat bo'yicha, lekin chegarada", () => {
  assert.equal(imageFrameHeight(640, 1280, 160, { min: 56, max: 120 }), 80);
  assert.equal(imageFrameHeight(366, 1280, 160, { min: 56, max: 96 }), 56);
  assert.equal(imageFrameHeight(640, 1000, 1000, { min: 56, max: 120 }), 120);
  assert.equal(imageFrameHeight(640, null, null, { min: 56, max: 120 }), 80);
});

test("maxsus rangda tugma matni o'qiladigan rangda", () => {
  assert.equal(readableOn("#ffffff"), "#062741");
  assert.equal(readableOn("#0b3555"), "#ffffff");
});

test("bar biografik sahifaning IKKALA tarmog'ida ham, ko'rishlar hisobi o'zgarmagan", () => {
  const page = read("src/app/liderlar/[slug]/page.tsx");
  assert.equal(page.split("{highlightBar}").length - 1, 2);
  assert.match(page, /<ThemeViewTracker candidateSlug=\{candidate\.slug\} \/>/);
  assert.match(page, /<ProfileViewTracker candidateSlug=\{candidate\.slug\} \/>/);
  assert.match(page, /preview \? Promise\.resolve\(null\) : getProfileHighlight\(\)/);
});

test("yuklovchi anon mijoz va qisqa kesh bilan; Realtime yo'q", () => {
  const loader = read("src/lib/data/profile-highlight.ts");
  assert.match(loader, /createPublicClient\(\)/);
  assert.match(loader, /unstable_cache\(/);
  assert.match(loader, /tags: \["profile-highlight"\]/);
  assert.doesNotMatch(loader, /createServerSupabase|\.channel\(/);
  const route = read("src/app/api/revalidate/highlight/route.ts");
  assert.match(route, /revalidateTag\("profile-highlight", \{ expire: 0 \}\)/);
  assert.match(route, /apiKeyMatches\(/);
});

test("reklama bloklovchi yashiradigan nomlar ishlatilmagan", () => {
  const component = read("src/components/profile/profile-highlight-bar.tsx");
  const css = read("src/app/globals.css");
  assert.doesNotMatch(component, /className="[^"]*\b(ad|ads|adbar|banner|promo)[-_\s"]/i);
  assert.match(css, /@keyframes phb-drop/);
  assert.match(css, /\.phb-sweep::before \{\n    display: none;/);
  // Brauzer xotirasi faqat try/catch ichida.
  assert.equal((component.match(/window\.(localStorage|sessionStorage)/g) ?? []).length, 2);
  assert.match(component, /function storage\(store: Store\): Storage \| null \{\n  try \{/);
});

test("admin panel bilan oq ro'yxatlar bir xil", { skip: !existsSync("/Users/macbookair/Documents/liderlar-admin/src/lib/elonlar/types.ts") }, () => {
  const admin = readFileSync("/Users/macbookair/Documents/liderlar-admin/src/lib/elonlar/types.ts", "utf8");
  const list = (name: string) => {
    const match = new RegExp(`export const ${name} = (\\[[^\\]]*\\])`).exec(admin);
    assert.ok(match, name);
    return JSON.parse(match[1].replace(/'/g, '"')) as string[];
  };
  assert.deepEqual(list("BAR_THEMES"), [...BAR_THEMES]);
  assert.deepEqual(list("BAR_ENTRANCES"), [...BAR_ENTRANCES]);
  assert.deepEqual(list("BAR_ATTENTIONS"), [...BAR_ATTENTIONS]);
  assert.deepEqual(list("BAR_LOGO_POSITIONS"), [...BAR_LOGO_POSITIONS]);
  assert.deepEqual(list("BAR_ROTATIONS"), [...BAR_ROTATIONS]);
});
