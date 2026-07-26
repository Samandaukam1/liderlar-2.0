import { z } from "zod";

const emptyToUndefined = (v: unknown) => (v === "" ? undefined : v);

export const applicationSchema = z.object({
  fullName: z.string().trim().min(3, "To'liq ism-familiyangizni kiriting").max(160),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s-]{9,15}$/, "Telefon raqamini to'g'ri kiriting"),
  email: z.preprocess(
    emptyToUndefined,
    z.string().trim().email("Email manzilini to'g'ri kiriting").optional()
  ),
  birthYear: z.preprocess(
    emptyToUndefined,
    z.coerce
      .number()
      .int()
      .min(1960, "Tug'ilgan yilni to'g'ri kiriting")
      .max(new Date().getFullYear())
      .optional()
  ),
  regionId: z.preprocess(emptyToUndefined, z.string().uuid("Hududni tanlang").optional()),
  directionId: z.preprocess(emptyToUndefined, z.string().uuid("Yo'nalishni tanlang").optional()),
  motivation: z.string().trim().min(30, "Kamida 30 belgidan iborat matn kiriting").max(4000),
  portfolioLinks: z.string().trim().optional(),
  consent: z.literal(true, { error: "Davom etish uchun rozilikni tasdiqlang" }),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;
export type ApplicationFormValues = z.input<typeof applicationSchema>;
