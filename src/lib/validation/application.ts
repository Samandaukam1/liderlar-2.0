import { z } from "zod";

export const AGE_RANGES = ["14-18", "19-24", "25-28", "29-35", "35+"] as const;
export type AgeRange = (typeof AGE_RANGES)[number];

export const GENDER_OPTIONS = [
  { value: "male", label: "Erkak" },
  { value: "female", label: "Ayol" },
] as const;
export type Gender = (typeof GENDER_OPTIONS)[number]["value"];

const NAME_PATTERN = /^[A-Z][A-Z'’ʻ‘`-]*(?: [A-Z][A-Z'’ʻ‘`-]*)+$/;
const USERNAME_PATTERN = /^@[A-Za-z0-9_]{5,32}$/;
const PHONE_PATTERN = /^\+\d{9,15}$/;
const PROMO_PATTERN = /^$|^[A-Z0-9-]{2,32}$/;

/** Ism-familiya bosh harflarda va ortiqcha bo'shliqsiz saqlanadi. */
export function normalizeFullName(value: string): string {
  return value.replace(/\s+/g, " ").trim().toUpperCase();
}

/** 901234567 / 998901234567 / +998 90 123 45 67 → +998901234567 */
export function normalizePhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length === 9) return `+998${digits}`;
  return `+${digits.replace(/^0+/, "")}`;
}

/** @username, t.me havolasi yoki ochiq telefon raqamni bir ko'rinishga keltiradi. */
export function normalizeTelegram(value: string): string {
  const raw = value.trim();
  if (!raw) return "";
  const link = raw.match(/^(?:https?:\/\/)?(?:www\.)?(?:t\.me|telegram\.me)\/@?([A-Za-z0-9_]+)\/?$/i);
  if (link) return `@${link[1]}`;
  if (/[A-Za-z_]/.test(raw)) return `@${raw.replace(/^@+/, "")}`;
  return normalizePhone(raw);
}

/** Promo kod ham bosh harflarda, harflar orasida bo'shliqsiz. */
export function normalizePromoCode(value: string): string {
  return value.replace(/\s+/g, "").toUpperCase();
}

export const applicationSchema = z.object({
  fullName: z
    .string()
    .transform(normalizeFullName)
    .pipe(
      z
        .string()
        .max(160, "Ism-familiya juda uzun")
        .regex(NAME_PATTERN, "Ism va familiyani to'liq, lotin alifbosida va bosh harflarda yozing"),
    ),
  phone: z
    .string()
    .transform(normalizePhone)
    .pipe(z.string().regex(PHONE_PATTERN, "Ishlaydigan telefon raqam kiriting, masalan +998 90 123 45 67")),
  telegram: z
    .string()
    .transform(normalizeTelegram)
    .pipe(
      z
        .string()
        .refine(
          (value) => USERNAME_PATTERN.test(value) || PHONE_PATTERN.test(value),
          "Telegram username (@ bilan) yoki Telegramga ulangan ochiq telefon raqamni kiriting",
        ),
    ),
  gender: z.enum(["male", "female"], { error: "Jinsingizni tanlang" }),
  ageRange: z.enum(AGE_RANGES, { error: "Yosh oralig'ini tanlang" }),
  promoCode: z
    .string()
    .optional()
    .transform((value) => normalizePromoCode(value ?? ""))
    .pipe(z.string().regex(PROMO_PATTERN, "Promo kod faqat harf, raqam va tiredan iborat bo'ladi")),
  consent: z.literal(true, { error: "Davom etish uchun rozilikni tasdiqlang" }),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;
export type ApplicationFormValues = z.input<typeof applicationSchema>;
