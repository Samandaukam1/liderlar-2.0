/**
 * SERTIFIKATLAR — QOIDALAR. SOF MODUL.
 *
 * Bu yerdagi yozuv — DA'VO, tasdiq emas. Platforma beradigan
 * sertifikatlar butunlay boshqa jadvalda (`certificates`) va ularga
 * foydalanuvchi yoza olmaydi.
 *
 * Hech narsa import qilinmaydi: testlar `@/` taxallusini yecha olmaydi.
 */

/* ========================================================================= *
 * ISHONCH DARAJASI — §8 ning uch belgisi
 * ========================================================================= */

export const TRUST_LEVELS = [
  "pending_review",
  "user_entered",
  "verified",
  "rejected",
] as const;

export type TrustLevel = (typeof TRUST_LEVELS)[number];

/**
 * Foydalanuvchiga ko'rinadigan belgilar.
 *
 * "Tasdiqlangan" so'zi FAQAT `verified` da ishlatiladi. `user_entered`
 * uchun "Foydalanuvchi kiritgan" deb aniq aytiladi — aks holda
 * o'quvchi da'voni platforma tekshirgan deb o'ylardi.
 */
export const TRUST_BADGE: Record<TrustLevel, string> = {
  pending_review: "Tekshiruvda",
  user_entered: "Foydalanuvchi kiritgan",
  verified: "Tasdiqlangan",
  rejected: "Qaytarildi",
};

/** Ommaviy profilda ko'rinadigan darajalar. */
const PUBLIC_LEVELS: ReadonlySet<TrustLevel> = new Set(["user_entered", "verified"]);

export function isPubliclyVisible(trust: TrustLevel): boolean {
  return PUBLIC_LEVELS.has(trust);
}

/**
 * Admin qo'yishi mumkin bo'lgan darajalar.
 *
 * `pending_review` RO'YXATDA YO'Q: u boshlang'ich holat va adminning
 * qarori emas. Orqaga qaytarish kerak bo'lsa, bu boshqa amal.
 */
export const ADMIN_TRUST_CHOICES = ["user_entered", "verified", "rejected"] as const;

export type AdminTrustChoice = (typeof ADMIN_TRUST_CHOICES)[number];

export function isAdminTrustChoice(value: unknown): value is AdminTrustChoice {
  return (
    typeof value === "string" && (ADMIN_TRUST_CHOICES as readonly string[]).includes(value)
  );
}

/* ========================================================================= *
 * MAYDON CHEGARALARI
 * ========================================================================= */

export const CERT_LIMITS = {
  title: { min: 2, max: 300 },
  issuer: 300,
  credentialNumber: 160,
  credentialUrl: 1000,
  description: 2000,
  maxCount: 30,
} as const;

export interface CertificateInput {
  title?: unknown;
  issuer?: unknown;
  issuedOn?: unknown;
  expiresOn?: unknown;
  credentialNumber?: unknown;
  credentialUrl?: unknown;
  description?: unknown;
}

export interface CertificateCheck {
  ok: boolean;
  /** Bazaga yozishga tayyor, tozalangan qiymatlar. */
  value: Record<string, string | null>;
  errors: string[];
}

function asText(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed === "") return null;
  return trimmed.slice(0, max);
}

/** `YYYY-MM-DD`. Boshqa shakl — xato. */
function asDate(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const text = value.trim();
  if (text === "") return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return null;

  const parsed = new Date(`${text}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return null;
  // Shakl to'g'ri bo'lsa ham sana mavjud bo'lmasligi mumkin (2026-02-31).
  return parsed.toISOString().slice(0, 10) === text ? text : null;
}

/**
 * Tekshirish havolasi xavfsizmi.
 *
 * FAQAT `https://`. Bu havola ommaviy profilda `href` bo'lib chiqadi,
 * ya'ni `javascript:` sxemasi saqlangan XSS bo'lardi (§58).
 */
function isSafeUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Sertifikat ma'lumotini tekshiradi.
 *
 * `trust` QABUL QILINMAYDI — u yo'q. Ishonch darajasini server
 * qo'yadi: parametr sifatida qabul qilinsa, foydalanuvchi o'zini
 * o'zi tasdiqlab qo'yardi.
 */
export function checkCertificate(input: CertificateInput): CertificateCheck {
  const errors: string[] = [];
  const value: Record<string, string | null> = {};

  const title = asText(input.title, CERT_LIMITS.title.max);
  if (title === null) {
    errors.push("Sertifikat nomini yozing.");
  } else if (title.length < CERT_LIMITS.title.min) {
    errors.push("Sertifikat nomi juda qisqa.");
  } else {
    value.title = title;
  }

  value.issuer = asText(input.issuer, CERT_LIMITS.issuer);
  value.credential_number = asText(input.credentialNumber, CERT_LIMITS.credentialNumber);
  value.description = asText(input.description, CERT_LIMITS.description);

  const url = asText(input.credentialUrl, CERT_LIMITS.credentialUrl);
  if (url !== null && !isSafeUrl(url)) {
    errors.push("Tekshirish havolasi https:// bilan boshlanishi kerak.");
  } else {
    value.credential_url = url;
  }

  const issued = asDate(input.issuedOn);
  const expires = asDate(input.expiresOn);

  if (input.issuedOn != null && input.issuedOn !== "" && issued === null) {
    errors.push("Berilgan sana noto'g'ri.");
  }
  if (input.expiresOn != null && input.expiresOn !== "" && expires === null) {
    errors.push("Amal qilish muddati noto'g'ri.");
  }

  /*
   * MUDDAT BERILISH SANASIDAN OLDIN BO'LMASIN.
   *
   * Bazada ham shart bor, lekin bu yerda aytish tushunarliroq:
   * baza xatosi foydalanuvchiga ko'rsatilmaydi (§55).
   */
  if (issued && expires && expires < issued) {
    errors.push("Amal qilish muddati berilgan sanadan oldin bo'lmasin.");
  }

  value.issued_on = issued;
  value.expires_on = expires;

  return { ok: errors.length === 0, value, errors };
}

/* ========================================================================= *
 * MUDDAT HOLATI
 * ========================================================================= */

/**
 * Sertifikat muddati o'tganmi.
 *
 * `null` — muddatsiz sertifikat (ko'pchiligi shunday).
 *
 * MUDDATI O'TGANI O'CHIRILMAYDI va YASHIRILMAYDI: u o'tmishdagi
 * haqiqiy yutuq va uni yo'q qilish tarixni buzardi. Faqat belgisi
 * qo'yiladi.
 */
export function isExpired(expiresOn: string | null, now: Date): boolean {
  if (!expiresOn) return false;
  // Kun oxirigacha amal qiladi deb qaraymiz: muddati "bugun" bo'lsa, hali o'tmagan.
  return new Date(`${expiresOn}T23:59:59Z`).getTime() < now.getTime();
}

/**
 * Saqlashdan keyin foydalanuvchiga aytiladigan matn.
 *
 * §22: ko'rikka ketgan narsani "profilga joylandi" deb aytish yolg'on.
 */
export function submitMessage(): string {
  return "Sertifikat tekshiruvga yuborildi. Tasdiqlangandan keyin profilingizda ko'rinadi.";
}
