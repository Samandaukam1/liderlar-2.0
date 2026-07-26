import { z } from "zod";

const titledEntry = z.object({
  title: z.string().trim().min(1, "Sarlavha kiritilishi shart"),
  detail: z.string().trim().optional(),
});

export const monthlyUpdatePayloadSchema = z.object({
  periodMonth: z.string().regex(/^\d{4}-\d{2}$/, "Oyni tanlang"),
  booksRead: z.array(titledEntry).default([]),
  achievements: z.array(titledEntry).default([]),
  events: z.array(titledEntry).default([]),
  projects: z.array(titledEntry).default([]),
  volunteering: z.string().trim().max(2000).optional(),
  newRolesOrEducation: z.string().trim().max(2000).optional(),
  mediaAppearances: z.string().trim().max(2000).optional(),
  journalSubmission: z.string().trim().max(4000).optional(),
  freeformTitle: z.string().trim().max(200).optional(),
  freeformContent: z.string().trim().max(4000).optional(),
  videoLinks: z.array(z.object({ url: z.string().trim().url("To'g'ri havola kiriting") })).default([]),
  consentToPublish: z.literal(true, { error: "Rozilikni tasdiqlashingiz kerak" }),
});

export type MonthlyUpdatePayload = z.infer<typeof monthlyUpdatePayloadSchema>;
/** Pre-default shape, used for the RHF form itself (array fields are optional until defaulted on parse). */
export type MonthlyUpdateFormValues = z.input<typeof monthlyUpdatePayloadSchema>;

export const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;
export const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
