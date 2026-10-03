import { test } from "node:test";
import assert from "node:assert/strict";
import { rankingView, splitName, withoutPortrait } from "../src/components/themes/imperial-gold/compose.ts";
import { pickPortraitCutout } from "../src/lib/themes/portrait-cutout.ts";

const AVATAR = "https://x.supabase.co/storage/v1/object/public/candidate-avatars/a/b.jpg";
const CUT = "https://x.supabase.co/storage/v1/object/public/candidate-post-assets/id/portrait-transparent.png?v=1";

test("ism: ikki katta qator, otasining ismi kichik qatorda", () => {
  assert.deepEqual(splitName("Ochilova Barno Bohodir qizi"), {
    primary: ["Ochilova", "Barno"],
    secondary: "Bohodir qizi",
    long: false,
  });
  assert.equal(splitName("Islomov Shamsiddinxon").secondary, null);
  assert.equal(splitName("Islomov Shamsiddinxon").long, true);
});

test("reyting: halol holatlar, jimgina 0 emas", () => {
  assert.deepEqual(rankingView(null, 10), { kind: "pending" });
  assert.deepEqual(rankingView(5, 0), { kind: "forming" });
  assert.equal(rankingView(12, 48.7).kind, "position");
});

test("galereyada hero portreti takrorlanmaydi", () => {
  const media = [{ url: `${AVATAR}?t=1` }, { url: "https://x.supabase.co/g.jpg" }];
  assert.deepEqual(withoutPortrait(media, AVATAR), [{ url: "https://x.supabase.co/g.jpg" }]);
});

test("portret: faqat mavjud Post Studio fayli, eskirgan va begona URL rad", () => {
  const row = { portrait_processed_url: CUT, portrait_source_url: AVATAR, status: "published", metadata: {} };
  assert.equal(pickPortraitCutout([row], AVATAR)?.url, CUT);
  assert.equal(pickPortraitCutout([row], null), null, "profil rasmi yo'q — portret ham yo'q");
  assert.equal(pickPortraitCutout([{ ...row, portrait_source_url: "https://x.supabase.co/storage/v1/object/public/candidate-avatars/old.jpg" }], AVATAR), null);
  assert.equal(pickPortraitCutout([{ ...row, portrait_source_url: "supabase-storage://candidate-intake-files/p.png" }], AVATAR)?.url, CUT);
  assert.equal(pickPortraitCutout([{ ...row, portrait_processed_url: "https://evil.com/x.png" }], AVATAR), null);
});
