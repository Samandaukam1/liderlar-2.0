import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  ADMIN_TRUST_CHOICES,
  checkCertificate,
  isAdminTrustChoice,
  isExpired,
  isPubliclyVisible,
  TRUST_BADGE,
  TRUST_LEVELS,
} from "../src/lib/profile-editor/certificate-rules.ts";

/* ------------------------------------------------------------------ *
 * O'ZINI TASDIQLASH IMKONSIZ — §8 ning asosiy talabi
 * ------------------------------------------------------------------ */

test("checkCertificate trust qabul QILMAYDI", () => {
  /*
   * Agar `trust` kirish parametri bo'lganida, foydalanuvchi o'zini
   * 'verified' qilib yuborardi va profilida "Tasdiqlangan" belgisi
   * chiqardi.
   */
  const result = checkCertificate({
    title: "Sertifikat",
    ...({ trust: "verified" } as Record<string, unknown>),
  });
  assert.equal(result.ok, true);
  assert.equal(Object.hasOwn(result.value, "trust"), false);
});

test("admin tanlovida pending_review YO'Q", () => {
  // U boshlang'ich holat, adminning qarori emas.
  assert.equal((ADMIN_TRUST_CHOICES as readonly string[]).includes("pending_review"), false);
  assert.equal(isAdminTrustChoice("pending_review"), false);
  assert.equal(isAdminTrustChoice("verified"), true);
});

test("noma'lum ishonch darajasi rad etiladi", () => {
  for (const value of ["admin_verified", "", null, 1, "VERIFIED"]) {
    assert.equal(isAdminTrustChoice(value), false, String(value));
  }
});

/* ------------------------------------------------------------------ *
 * OMMAVIY KO'RINISH
 * ------------------------------------------------------------------ */

test("ko'rilmagan va qaytarilgan sertifikat ommada KO'RINMAYDI", () => {
  /*
   * Tekshirilmagan da'vo admin ko'rmasdan ommaga chiqsa, kimdir
   * o'ziga katta mukofot yozib qo'yardi.
   */
  assert.equal(isPubliclyVisible("pending_review"), false);
  assert.equal(isPubliclyVisible("rejected"), false);
});

test("admin ochgan darajalar ommada ko'rinadi", () => {
  assert.equal(isPubliclyVisible("user_entered"), true);
  assert.equal(isPubliclyVisible("verified"), true);
});

test("'Tasdiqlangan' so'zi FAQAT verified da ishlatiladi", () => {
  /*
   * `user_entered` uchun "Tasdiqlangan" deb yozish o'quvchiga
   * da'voni platforma tekshirgan degan yolg'on xabar berardi.
   */
  assert.equal(TRUST_BADGE.verified, "Tasdiqlangan");
  for (const level of TRUST_LEVELS) {
    if (level === "verified") continue;
    assert.equal(
      TRUST_BADGE[level].includes("Tasdiqlangan"),
      false,
      `${level}: ${TRUST_BADGE[level]}`,
    );
  }
});

test("user_entered belgisi da'vo egasini aytadi", () => {
  assert.match(TRUST_BADGE.user_entered, /Foydalanuvchi/);
});

/* ------------------------------------------------------------------ *
 * MAYDONLAR
 * ------------------------------------------------------------------ */

test("nomsiz sertifikat rad etiladi", () => {
  assert.equal(checkCertificate({ title: "  " }).ok, false);
  assert.equal(checkCertificate({ title: "A" }).ok, false);
  assert.equal(checkCertificate({ title: "IT" }).ok, true);
});

test("ixtiyoriy maydonlar bo'sh bo'lishi mumkin", () => {
  // Beruvchi tashkilot tasdiqlanmagan da'vo — majburiy emas.
  const result = checkCertificate({ title: "Sertifikat" });
  assert.equal(result.ok, true);
  assert.equal(result.value.issuer, null);
  assert.equal(result.value.credential_number, null);
});

test("javascript: havolasi rad etiladi", () => {
  for (const url of ["javascript:alert(1)", "http://x.uz", "data:text/html,x"]) {
    const result = checkCertificate({ title: "Sertifikat", credentialUrl: url });
    assert.equal(result.ok, false, url);
  }
  assert.equal(
    checkCertificate({ title: "Sertifikat", credentialUrl: "https://x.uz/c/1" }).ok,
    true,
  );
});

test("muddat berilish sanasidan oldin bo'lsa rad etiladi", () => {
  const result = checkCertificate({
    title: "Sertifikat",
    issuedOn: "2024-01-01",
    expiresOn: "2023-01-01",
  });
  assert.equal(result.ok, false);
});

test("mavjud bo'lmagan sana rad etiladi", () => {
  assert.equal(checkCertificate({ title: "Sertifikat", issuedOn: "2026-02-31" }).ok, false);
  assert.equal(checkCertificate({ title: "Sertifikat", issuedOn: "01.01.2020" }).ok, false);
});

test("matn chegaradan oshsa QIRQILADI, rad etilmaydi", () => {
  /*
   * Nomdan farqli: izoh va tashkilot nomi ikkinchi darajali va
   * uzunligi uchun butun formani rad etish odamni bezor qilardi.
   */
  const result = checkCertificate({
    title: "Sertifikat",
    description: "x".repeat(5000),
  });
  assert.equal(result.ok, true);
  assert.equal(result.value.description!.length, 2000);
});

/* ------------------------------------------------------------------ *
 * MUDDAT
 * ------------------------------------------------------------------ */

const NOW = new Date("2026-10-02T12:00:00Z");

test("muddatsiz sertifikat hech qachon o'tmaydi", () => {
  assert.equal(isExpired(null, NOW), false);
});

test("o'tgan muddat aniqlanadi", () => {
  assert.equal(isExpired("2026-10-01", NOW), true);
  assert.equal(isExpired("2020-01-01", NOW), true);
});

test("bugun tugaydigan sertifikat hali amal qiladi", () => {
  // Kun oxirigacha amal qiladi: ertalab "muddati o'tgan" deb ko'rsatish xato.
  assert.equal(isExpired("2026-10-02", NOW), false);
});

test("kelgusi muddat o'tgan emas", () => {
  assert.equal(isExpired("2030-01-01", NOW), false);
});

/* ------------------------------------------------------------------ *
 * Chegara
 * ------------------------------------------------------------------ */

test("certificate-rules.ts hech narsa import qilmaydi", () => {
  const source = readFileSync("src/lib/profile-editor/certificate-rules.ts", "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/[^\n]*/g, "");
  assert.equal(/^\s*import\s/m.test(source), false);
});

test("migratsiyada yozish siyosati YO'Q", () => {
  /*
   * Foydalanuvchi to'g'ridan-to'g'ri yozsa, `trust` ni 'verified'
   * qilib qo'yardi. Barcha yozish server orqali bo'lishi kerak.
   */
  const sql = readFileSync(
    "../liderlar-admin/supabase/migrations/20261002160000_candidate_certificates.sql",
    "utf8",
  );
  assert.equal(/for (insert|update|delete)/i.test(sql), false, "yozish siyosati topildi");
  assert.match(sql, /enable row level security/);
});

test("ommaviy siyosat faqat admin ochgan darajalarni beradi", () => {
  const sql = readFileSync(
    "../liderlar-admin/supabase/migrations/20261002160000_candidate_certificates.sql",
    "utf8",
  );
  const policyAt = sql.indexOf('create policy "public certificates are visible"');
  assert.ok(policyAt > 0);
  const policy = sql.slice(policyAt, policyAt + 600);
  assert.match(policy, /trust in \('user_entered', 'verified'\)/);
});
