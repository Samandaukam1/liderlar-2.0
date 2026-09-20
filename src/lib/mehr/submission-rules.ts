/**
 * Dalil yuborish qoidalari — SOF MODUL.
 *
 * Bu yerda ATAYLAB faqat TO'LIQLIK tekshiriladi, xavfsizlik
 * emas. Kim yuborayotgani va tadbir qaysi holatda ekani
 * bazada — shartli UPDATE yozuvning ichida tekshiradi va uni
 * chetlab o'tib bo'lmaydi.
 *
 * Shuning uchun bu ro'yxat "to'siq" emas, "yordam": odam
 * nimasi yetishmayotganini aniq bilib tursin. "To'ldiring"
 * degan umumiy xabar uni nima qilishini bilmay qoldiradi.
 */

export type ActivityStatus =
  | "draft"
  | "submitted"
  | "changes_requested"
  | "approved"
  | "rejected";

/**
 * Qaysi holatdagi tadbir yuboriladi.
 *
 * Tasdiqlangan tadbir qayta yuborilmaydi: ball berilgan,
 * sertifikat chiqqan va ommaviy sahifa ochilgan.
 */
export function canSubmit(status: ActivityStatus): boolean {
  return status === "draft" || status === "changes_requested";
}

export interface EvidenceDraft {
  title: string;
  description: string;
  purpose: string;
  beneficiaryCount: number | null;
  hasCover: boolean;
  photoCount: number;
  startsAt: string | null;
}

export interface SubmissionCheck {
  ok: boolean;
  missing: string[];
}

export function checkEvidence(draft: EvidenceDraft): SubmissionCheck {
  const missing: string[] = [];

  if (draft.title.trim().length < 3) missing.push("Tadbir nomi");
  if (!draft.description.trim()) missing.push("Tavsif — nima qilindi");
  if (!draft.purpose.trim()) missing.push("Maqsad");
  if (!draft.hasCover) missing.push("Muqova rasmi");
  if (draft.photoCount < 1) missing.push("Kamida bitta dalil rasmi");
  if (draft.beneficiaryCount === null || draft.beneficiaryCount < 0) {
    missing.push("Nafi tekkanlar soni");
  }
  if (!draft.startsAt) missing.push("Tadbir sanasi");

  /*
   * ISHTIROKCHI SONI TEKSHIRILMAYDI.
   *
   * Yolg'iz qilingan ezgulik ham ezgulik. Tashkilotchining
   * o'zi yagona ishtirokchi bo'lishi rad etish sababi emas.
   */

  return { ok: missing.length === 0, missing };
}

/** Dalil rasmlari uchun cheklovlar. */
export const MAX_EVIDENCE_FILE_BYTES = 12 * 1024 * 1024;
export const MAX_EVIDENCE_PHOTOS = 12;
export const ALLOWED_EVIDENCE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export type FileCheck = { ok: true } | { ok: false; error: string };

/**
 * Fayl turini NOMIGA emas, MIME turiga qarab tekshiradi —
 * lekin ikkalasi ham mijozdan keladi va ishonchli emas.
 * Shuning uchun bu ham faqat birinchi qatlam: haqiqiy himoya
 * bucketning ommaviy-lekin-topib-bo'lmas tabiati va hajm
 * chegarasi.
 */
export function checkEvidenceFile(file: { name: string; size: number; type: string }): FileCheck {
  if (file.size > MAX_EVIDENCE_FILE_BYTES) {
    return {
      ok: false,
      error: `"${file.name}" juda katta — eng ko'pi ${Math.round(MAX_EVIDENCE_FILE_BYTES / 1024 / 1024)} MB.`,
    };
  }

  if (!(ALLOWED_EVIDENCE_TYPES as readonly string[]).includes(file.type)) {
    return { ok: false, error: `"${file.name}" — faqat JPG, PNG yoki WebP rasm yuklang.` };
  }

  return { ok: true };
}

/**
 * Storage yo'li.
 *
 * Fayl nomi FOYDALANUVCHIDAN OLINMAYDI: unda bo'shliq, kirill
 * harf, `../` yoki juda uzun satr bo'lishi mumkin. Tasodifiy
 * qism esa manzilni taxmin qilib bo'lmas qiladi — bucket
 * ommaviy bo'lgani uchun bu muhim.
 */
export function evidencePath(activityId: string, randomId: string, mimeType: string): string {
  const ext =
    mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : "jpg";
  return `${activityId}/${randomId}.${ext}`;
}
