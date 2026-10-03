import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  decide,
  denialText,
  showsVipBadge,
  isSubscriptionGranting,
  isKnownEntitlement,
  ENTITLEMENTS,
  FEATURE_FLAGS,
  type Entitlement,
  type EntitlementContext,
  type FeatureFlag,
  type SubscriptionSnapshot,
  type SubscriptionState,
} from "../src/lib/vip/entitlements.ts";

/* ------------------------------------------------------------------ *
 * Yordamchilar
 * ------------------------------------------------------------------ */

const NOW = new Date("2026-10-01T12:00:00Z");

/** Barcha flaglar yoniq — rad etish sabablarini ajratib tekshirish uchun. */
function allFlagsOn(): Record<FeatureFlag, boolean> {
  return Object.fromEntries(FEATURE_FLAGS.map((f) => [f, true])) as Record<
    FeatureFlag,
    boolean
  >;
}

function subscription(
  state: SubscriptionState,
  overrides: Partial<SubscriptionSnapshot> = {},
): SubscriptionSnapshot {
  return {
    state,
    currentPeriodEnd: new Date("2027-01-01T00:00:00Z"),
    graceUntil: null,
    entitlements: [...ENTITLEMENTS],
    ...overrides,
  };
}

function context(overrides: Partial<EntitlementContext> = {}): EntitlementContext {
  return {
    subscription: subscription("active"),
    flags: allFlagsOn(),
    now: NOW,
    ...overrides,
  };
}

/* ------------------------------------------------------------------ *
 * Kalitlar
 * ------------------------------------------------------------------ */

test("noma'lum huquq kaliti XATO tashlaydi, jimgina rad etmaydi", () => {
  // Xato yozilgan kalit e'tiborsiz qolmasligi kerak: `false` qaytarilsa,
  // imkoniyat hech kimga ishlamay qolardi va buni hech kim sezmasdi.
  assert.throws(
    () => decide("profile.premum_themes" as Entitlement, context()),
    /Noma'lum huquq kaliti/,
  );
});

test("har bir huquq kaliti taniladi", () => {
  for (const key of ENTITLEMENTS) {
    assert.equal(isKnownEntitlement(key), true, key);
  }
  assert.equal(isKnownEntitlement("profile.anything_else"), false);
});

test("har bir huquq uchun flag biriktirilgan", () => {
  /*
   * Yangi huquq qo'shilib, flagi yozilmasa, `ENTITLEMENT_FLAG[key]`
   * `undefined` bo'lardi va `flags[undefined] !== true` tufayli huquq
   * HAR DOIM rad etilardi — ya'ni imkoniyat jimgina o'lik qolardi.
   *
   * Jadval eksport qilinmagani uchun xatti-harakat orqali tekshiramiz:
   * barcha flaglar yoniq va obuna faol bo'lsa, hech bir huquq
   * "feature_disabled" bermasligi kerak.
   */
  for (const key of ENTITLEMENTS) {
    const decision = decide(key, context());
    assert.deepEqual(decision, { allowed: true }, `${key} uchun flag yo'q`);
  }
});

/* ------------------------------------------------------------------ *
 * Flaglar
 * ------------------------------------------------------------------ */

test("vip.enabled o'chiq bo'lsa, qolgan flaglar yoniq bo'lsa ham rad etiladi", () => {
  const flags = { ...allFlagsOn(), "vip.enabled": false };
  const decision = decide("profile.self_edit", context({ flags }));
  assert.deepEqual(decision, { allowed: false, reason: "vip_disabled" });
});

test("flag yetishmasa O'CHIQ deb qaraladi (fail closed)", () => {
  // Bo'sh flag jadvali — baza o'qilmaganda shunday bo'ladi.
  const decision = decide("profile.self_edit", context({ flags: {} }));
  assert.equal(decision.allowed, false);
});

test("har bir huquq o'z flagiga bog'liq va boshqasiga ta'sir qilmaydi", () => {
  const flags = { ...allFlagsOn(), "vip.themes_enabled": false };

  const themes = decide("profile.premium_themes", context({ flags }));
  assert.deepEqual(themes, { allowed: false, reason: "feature_disabled" });

  // Boshqa huquq o'chmasligi kerak.
  const edit = decide("profile.self_edit", context({ flags }));
  assert.deepEqual(edit, { allowed: true });
});

/* ------------------------------------------------------------------ *
 * Obuna holati
 * ------------------------------------------------------------------ */

test("obuna yo'q bo'lsa rad etiladi", () => {
  const decision = decide("profile.self_edit", context({ subscription: null }));
  assert.deepEqual(decision, { allowed: false, reason: "no_subscription" });
});

test("pending obuna huquq BERMAYDI", () => {
  // To'lov kutilyapti: oldindan huquq berish to'lovsiz foydalanish bo'lardi.
  const decision = decide(
    "profile.self_edit",
    context({ subscription: subscription("pending") }),
  );
  assert.deepEqual(decision, { allowed: false, reason: "subscription_inactive" });
});

test("grace_period huquq BERADI", () => {
  const sub = subscription("grace_period", {
    currentPeriodEnd: new Date("2026-09-25T00:00:00Z"), // o'tgan
    graceUntil: new Date("2026-10-10T00:00:00Z"), // hali tugamagan
  });
  assert.deepEqual(decide("profile.self_edit", context({ subscription: sub })), {
    allowed: true,
  });
});

test("imtiyoz muddati ham tugasa, rad etiladi", () => {
  const sub = subscription("grace_period", {
    currentPeriodEnd: new Date("2026-09-01T00:00:00Z"),
    graceUntil: new Date("2026-09-15T00:00:00Z"),
  });
  const decision = decide("profile.self_edit", context({ subscription: sub }));
  assert.deepEqual(decision, { allowed: false, reason: "subscription_inactive" });
});

test("holat 'active' bo'lsa ham MUDDATI o'tgan obuna huquq bermaydi", () => {
  /*
   * ENG MUHIM TEST.
   *
   * Muddatni yopadigan fon vazifasi kechiksa, bazada holat hali
   * 'active' turadi. Faqat holatga qarasak, tugagan obuna huquq
   * berib turardi.
   */
  const sub = subscription("active", {
    currentPeriodEnd: new Date("2026-09-30T00:00:00Z"), // kecha tugagan
  });
  const decision = decide("profile.self_edit", context({ subscription: sub }));
  assert.deepEqual(decision, { allowed: false, reason: "subscription_inactive" });
});

test("muddatsiz obuna (null) har qachon huquq beradi", () => {
  const sub = subscription("active", { currentPeriodEnd: null });
  assert.equal(isSubscriptionGranting(sub, new Date("2099-01-01T00:00:00Z")), true);
});

test("suspended va cancelled huquq bermaydi", () => {
  for (const state of ["suspended", "cancelled", "expired"] as SubscriptionState[]) {
    const decision = decide(
      "profile.self_edit",
      context({ subscription: subscription(state) }),
    );
    assert.deepEqual(
      decision,
      { allowed: false, reason: "subscription_inactive" },
      state,
    );
  }
});

test("tarifda yo'q huquq rad etiladi", () => {
  const sub = subscription("active", { entitlements: ["articles.create"] });
  const decision = decide("profile.premium_themes", context({ subscription: sub }));
  assert.deepEqual(decision, { allowed: false, reason: "not_in_plan" });
});

/* ------------------------------------------------------------------ *
 * Badge
 * ------------------------------------------------------------------ */

test("badge faol obunaga bog'langan, huquqlarga emas", () => {
  // Tarifdan barcha huquq olib tashlansa ham, obuna faol — badge qoladi.
  const sub = subscription("active", { entitlements: [] });
  assert.equal(showsVipBadge(context({ subscription: sub })), true);
});

test("obuna tugasa badge yo'qoladi", () => {
  const sub = subscription("active", {
    currentPeriodEnd: new Date("2026-09-01T00:00:00Z"),
  });
  assert.equal(showsVipBadge(context({ subscription: sub })), false);
});

test("vip.enabled o'chiq bo'lsa badge ko'rinmaydi", () => {
  const flags = { ...allFlagsOn(), "vip.enabled": false };
  assert.equal(showsVipBadge(context({ flags })), false);
});

/* ------------------------------------------------------------------ *
 * Matnlar
 * ------------------------------------------------------------------ */

test("rad etish matni ichki chiqarish holatini oshkor qilmaydi", () => {
  // Flag o'chiqligi "hali yoqilmagan" demaydi — bu ichki ma'lumot.
  assert.equal(denialText("vip_disabled"), denialText("feature_disabled"));
  assert.ok(!denialText("vip_disabled").toLowerCase().includes("flag"));
});

test("har bir sabab uchun matn bor va bo'sh emas", () => {
  const reasons = [
    "vip_disabled",
    "feature_disabled",
    "no_subscription",
    "subscription_inactive",
    "not_in_plan",
  ] as const;
  for (const reason of reasons) {
    assert.ok(denialText(reason).trim().length > 0, reason);
  }
});

/* ------------------------------------------------------------------ *
 * Chegara: sof modul sof qolsin
 * ------------------------------------------------------------------ */

test("entitlements.ts hech narsa import qilmaydi", () => {
  /*
   * Bu modulning testlanishi uning sofligiga bog'liq: testlar `@/`
   * taxallusini yecha olmaydi, ya'ni bitta `@/lib/...` importi butun
   * test faylini ishga tushmas qilardi.
   */
  const source = readFileSync("src/lib/vip/entitlements.ts", "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/[^\n]*/g, "");

  assert.equal(/^\s*import\s/m.test(source), false, "import topildi");
  assert.equal(source.includes("server-only"), false);
});
