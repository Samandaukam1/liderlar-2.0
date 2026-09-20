import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import {
  hashActivationToken,
  tokensMatch,
  ACTIVATION_FAILURE_TEXT,
} from "../src/lib/accounts/activation-token.ts";

function src(path: string): string {
  return readFileSync(path, "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
}

// ---------------------------------------------------------------
// IKKI ILOVA O'RTASIDAGI SHARTNOMA
// ---------------------------------------------------------------

test("hash — AYNAN sha256 hex", () => {
  /*
   * Tokenni ADMIN ilovasi yaratadi, nomzod esa uni SHU ilovada
   * ishlatadi. Ular bir-birining kodini ko'rmaydi — yagona
   * umumiy narsa shu hash. U o'zgarsa, faollashtirish jimgina
   * ishlamay qo'yardi.
   */
  const token = "sinov-token-abc";
  assert.equal(hashActivationToken(token), createHash("sha256").update(token).digest("hex"));
  assert.match(hashActivationToken(token), /^[0-9a-f]{64}$/);
});

test("mos token taniladi, mos kelmagani yo'q", () => {
  const token = "abc-123";
  const hash = hashActivationToken(token);

  assert.equal(tokensMatch(token, hash), true);
  assert.equal(tokensMatch("abc-124", hash), false);
  assert.equal(tokensMatch("", hash), false);
});

test("har bir xato holati BOSHQACHA javob beradi", () => {
  /*
   * "Muddati tugagan" va "allaqachon ishlatilgan" odam uchun
   * butunlay boshqa ma'no: birinchisida yangi havola so'rash
   * kifoya, ikkinchisida u allaqachon hisob ochgan bo'lishi
   * mumkin.
   */
  const texts = Object.values(ACTIVATION_FAILURE_TEXT);
  assert.equal(new Set(texts).size, texts.length, "takrorlangan xabar bor");

  for (const [key, text] of Object.entries(ACTIVATION_FAILURE_TEXT)) {
    assert.ok(text.length > 20, `${key} xabari juda qisqa`);
    // Foydalanuvchiga texnik jargon ko'rsatilmaydi.
    assert.ok(!/token|hash|null|undefined|error/i.test(text), `${key} da jargon bor`);
  }
});

// ---------------------------------------------------------------
// XAVFSIZLIK
// ---------------------------------------------------------------

test("shaxs SO'ROVDAN olinmaydi", () => {
  /*
   * `userId` sxemada bo'lsa, istalgan odam boshqa birovning
   * nomidan faollashtirardi.
   */
  const code = src("src/app/akkaunt/faollashtirish/actions.ts");

  assert.ok(!/userId\s*:\s*z\./.test(code), "sxemada userId bor");
  assert.ok(!/candidateId\s*:\s*z\./.test(code), "sxemada candidateId bor");

  // Mavjud hisob yo'lida shaxs SEANSDAN keladi.
  const existing = code.match(/export async function activateWithExistingAccount\([\s\S]*?\n\}/)?.[0] ?? "";
  assert.ok(existing.length > 0);
  assert.match(existing, /supabase\.auth\.getUser\(\)/);
  assert.match(existing, /user\.id/);
});

test("avval taklifnoma tekshiriladi, KEYIN hisob yaratiladi", () => {
  /*
   * Teskarisi bo'lsa, yaroqsiz havola bilan ham hisob paydo
   * bo'lardi.
   */
  const code = src("src/app/akkaunt/faollashtirish/actions.ts");
  const fn = code.match(/export async function activateWithNewAccount\([\s\S]*?\n\}/)?.[0] ?? "";

  assert.ok(fn.length > 0);
  assert.ok(
    fn.indexOf("inspectActivation") < fn.indexOf("createUser"),
    "hisob tekshiruvdan oldin yaratilyapti",
  );
});

test("profil QO'LDA yaratilmaydi — trigger buni o'zi qiladi", () => {
  /*
   * `handle_new_user` triggeri auth.users ga qo'shilganda
   * profilni avtomatik yaratadi. Bu yerda ham yaratsak,
   * dublikat yoki konflikt bo'lardi.
   */
  const code = src("src/app/akkaunt/faollashtirish/actions.ts");
  assert.ok(!/from\("profiles"\)\s*\n?\s*\.insert/.test(code), "profil qo'lda yaratilyapti");
});

test("parol log'ga ham, javobga ham tushmaydi", () => {
  const code = src("src/app/akkaunt/faollashtirish/actions.ts");

  for (const logCall of code.match(/console\.(error|warn|log)\([\s\S]*?\);/g) ?? []) {
    assert.ok(!/password/i.test(logCall), `log'da parol bor: ${logCall.slice(0, 60)}`);
  }

  // Qaytariladigan tiplarda parol yo'q.
  const result = code.match(/export type ActivateResult[\s\S]*?;/)?.[0] ?? "";
  assert.ok(result.length > 0);
  assert.ok(!/password/i.test(result));
});

test("bayroq o'chiq bo'lsa faollashtirish ishlamaydi", () => {
  const code = src("src/app/akkaunt/faollashtirish/actions.ts");
  const fns = [...code.matchAll(/export async function activateWith\w+\([\s\S]*?\n\}/g)];

  assert.equal(fns.length, 2);
  for (const [body] of fns) {
    assert.match(body, /isActivationEnabled\(\)/);
  }
});

test("yaroqsiz havola nomzod haqida MA'LUMOT BERMAYDI", () => {
  /*
   * Ism ham, rasm ham ko'rsatilmaydi — aks holda havolalarni
   * taxmin qilib, kim kim ekanini bilib olish mumkin bo'lardi.
   */
  const page = src("src/app/akkaunt/faollashtirish/[token]/page.tsx");

  assert.match(page, /if \(!inspected\.ok\)/);
  // Xato holatida faqat matn — nomzod maydonlari yo'q.
  const failure = page.match(/function Failure\([\s\S]*?\n\}/)?.[0] ?? "";
  assert.ok(failure.length > 0, "Failure komponenti topilmadi");
  assert.ok(!/fullName|avatarUrl|slug/.test(failure), "xato sahifasida nomzod ma'lumoti bor");
});

test("tokenli manzil qidiruvga tushmaydi", () => {
  const page = readFileSync("src/app/akkaunt/faollashtirish/[token]/page.tsx", "utf8");
  assert.match(page, /robots:\s*\{\s*index:\s*false/);
});

test("muvaffaqiyatdan keyin token brauzer tarixidan olinadi", () => {
  /*
   * Aks holda u "orqaga" tugmasi, tarix va referrer orqali
   * qolib ketardi — holbuki u bir martalik kalit edi.
   */
  const form = src("src/app/akkaunt/faollashtirish/[token]/activation-form.tsx");
  assert.match(form, /router\.replace\(/);
  assert.ok(!/router\.push\(/.test(form), "push tarixga token bilan yozib qo'yadi");
});

test("mijoz komponenti server-only moduldan QIYMAT import qilmaydi", () => {
  const serverOnly = ["src/lib/accounts/activation-service.ts"]
    .filter((f) => /^import ["']server-only["']/m.test(readFileSync(f, "utf8")))
    .map((f) => f.replace(/^src\//, "@/").replace(/\.ts$/, ""));

  assert.equal(serverOnly.length, 1);

  const code = readFileSync("src/app/akkaunt/faollashtirish/[token]/activation-form.tsx", "utf8");
  assert.match(code, /^["']use client["']/m);

  for (const statement of code.match(/^import\s+[\s\S]*?from\s+["'][^"']+["'];/gm) ?? []) {
    if (/^import\s+type\s/.test(statement)) continue;
    const mod = statement.match(/from\s+["']([^"']+)["']/)?.[1];
    if (mod && serverOnly.includes(mod)) {
      assert.fail(`activation-form.tsx ${mod} dan QIYMAT import qilyapti`);
    }
  }
});
