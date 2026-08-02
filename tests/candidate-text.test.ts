import { test } from "node:test";
import assert from "node:assert/strict";
import {
  SHORT_BIO_MAX_ITEMS,
  splitPipeValues,
  stripCandidateMarkers,
  toShortBioItems,
} from "../src/lib/candidates/text.ts";

test("candidate markers never reach the public profile", () => {
  assert.equal(stripCandidateMarkers("!!!Ali Valiyev"), "Ali Valiyev");
  assert.equal(stripCandidateMarkers("&&&Filolog | Kitobxon"), "Filolog | Kitobxon");
  assert.equal(stripCandidateMarkers("^^^Ta'lim yo'li\n\nMatn"), "Ta'lim yo'li\n\nMatn");
});

test("the badge row is split, de-duplicated and marker-free", () => {
  assert.deepEqual(
    toShortBioItems("&&&Filolog | Kitobxon | filolog"),
    ["Filolog", "Kitobxon"],
  );
});

test("a legacy paragraph short_bio renders no badges instead of one giant pill", () => {
  const paragraph =
    "U kelajak sari intilayotgan, hayotda katta maqsadlarni ko'zlagan, jamiyatga foyda keltirishni xohlaydigan yosh qiz.";
  assert.deepEqual(toShortBioItems(paragraph), []);
});

test("badges are capped at five", () => {
  const items = toShortBioItems("Bir | Ikki | Uch | To'rt | Besh | Olti | Yetti");
  assert.equal(items.length, SHORT_BIO_MAX_ITEMS);
});

test("over-long and over-wordy items are dropped, trailing periods trimmed", () => {
  assert.deepEqual(
    toShortBioItems([
      "Filolog.",
      "Xalqaro tanlovlar sovrindori va yosh tadbirkorlar rahnamosi",
      "Yosh va faol jamoat ish yurituvchi",
    ]),
    ["Filolog"],
  );
});

test("splitPipeValues still returns every language, uncapped", () => {
  const languages = splitPipeValues("O'zbek | Rus | Ingliz | Turk | Arab | Fors");
  assert.equal(languages.length, 6);
});
