"use server";

import { revalidatePath } from "next/cache";
import { saveProfileFields } from "@/lib/profile-editor/edit-service";
import {
  createEntry,
  deleteEntry,
  reorderEntries,
  updateEntry,
} from "@/lib/profile-editor/entry-service";
import type { EntryInput, SectionInput } from "@/lib/profile-editor/field-policy";
import {
  createSection,
  deleteSection,
  reorderSections,
  updateSection,
} from "@/lib/profile-editor/section-service";
import {
  removeGalleryImage,
  updateGalleryAltText,
} from "@/lib/profile-editor/upload-service";
import {
  createCertificate,
  deleteCertificate,
  updateCertificate,
} from "@/lib/profile-editor/certificate-service";
import { removeCertificateEvidence } from "@/lib/profile-editor/evidence-service";
import type { CertificateInput } from "@/lib/profile-editor/certificate-rules";
import { deleteOwnQuote, submitQuote } from "@/lib/profile-editor/quote-service";

/**
 * PROFIL MUHARRIRI AMALLARI.
 *
 * Har biri xizmat qatlamiga o'tadi va u yerda huquq, egalik hamda
 * maydon siyosati tekshiriladi. Bu fayl faqat chaqiruv va sahifani
 * yangilash bilan shug'ullanadi — tekshiruvni bu yerga ko'chirish
 * uni ikki joyda saqlashga olib kelardi.
 *
 * `candidate_id` HECH QAYERDA PARAMETR EMAS: u serverda shaxsdan
 * keltirib chiqariladi (§44).
 */

function refresh() {
  revalidatePath("/kabinet/profil");
  // Ommaviy profil ham o'zgargan bo'lishi mumkin.
  revalidatePath("/kabinet");
}

export async function saveFields(
  patch: Record<string, unknown>,
): Promise<{ ok: boolean; message: string }> {
  const result = await saveProfileFields(patch);
  if (result.ok) refresh();
  return { ok: result.ok, message: result.message };
}

export async function addEntry(
  kind: string,
  input: EntryInput,
): Promise<{ ok: boolean; error?: string; reviewNeeded?: boolean }> {
  const result = await createEntry(kind, input);
  if (result.ok) refresh();
  return result.ok
    ? { ok: true, reviewNeeded: result.reviewNeeded }
    : { ok: false, error: result.error };
}

export async function editEntry(
  kind: string,
  entryId: string,
  input: EntryInput,
): Promise<{ ok: boolean; error?: string; reviewNeeded?: boolean }> {
  const result = await updateEntry(kind, entryId, input);
  if (result.ok) refresh();
  return result.ok
    ? { ok: true, reviewNeeded: result.reviewNeeded }
    : { ok: false, error: result.error };
}

export async function removeEntry(
  kind: string,
  entryId: string,
): Promise<{ ok: boolean; error?: string }> {
  const result = await deleteEntry(kind, entryId);
  if (result.ok) refresh();
  return result.ok ? { ok: true } : { ok: false, error: result.error };
}

export async function saveOrder(
  kind: string,
  orderedIds: string[],
): Promise<{ ok: boolean; error?: string }> {
  const result = await reorderEntries(kind, orderedIds);
  if (result.ok) refresh();
  return result.ok ? { ok: true } : { ok: false, error: result.error };
}

/**
 * Galereyadagi rasmni profildan olib tashlaydi.
 *
 * Fayl o'chirilmaydi — `deleted_at` qo'yiladi. Rasm boshqa joyda
 * (ijtimoiy post, sertifikat) ishlatilgan bo'lishi mumkin va faylni
 * darhol o'chirish o'sha joylarda buzilgan rasm qoldirardi.
 */
export async function deleteGalleryImage(
  mediaId: string,
): Promise<{ ok: boolean; error?: string }> {
  const result = await removeGalleryImage(mediaId);
  if (result.ok) refresh();
  return result;
}

/** Galereyadagi rasm tavsifini saqlaydi (bo'sh — tavsifni olib tashlaydi). */
export async function saveGalleryAltText(
  mediaId: string,
  altText: string,
): Promise<{ ok: boolean; error?: string }> {
  const result = await updateGalleryAltText(mediaId, altText);
  if (result.ok) refresh();
  return result;
}

/* ========================================================================= *
 * BIOGRAFIYA MATNI — BO'LIMLAR
 *
 *    Ommaviy biografiyadagi matn aynan shu bo'limlardan yig'iladi.
 *    `review_state` HECH QAYERDA parametr emas: ko'rik kerakmi — buni
 *    siyosat hal qiladi, foydalanuvchi emas (§43).
 * ========================================================================= */

export async function addSection(
  input: SectionInput,
): Promise<{ ok: boolean; error?: string; reviewNeeded?: boolean }> {
  const result = await createSection(input);
  if (result.ok) refresh();
  return result.ok
    ? { ok: true, reviewNeeded: result.reviewNeeded }
    : { ok: false, error: result.error };
}

export async function editSection(
  sectionId: string,
  input: SectionInput,
): Promise<{ ok: boolean; error?: string; reviewNeeded?: boolean }> {
  const result = await updateSection(sectionId, input);
  if (result.ok) refresh();
  return result.ok
    ? { ok: true, reviewNeeded: result.reviewNeeded }
    : { ok: false, error: result.error };
}

export async function removeSection(
  sectionId: string,
): Promise<{ ok: boolean; error?: string }> {
  const result = await deleteSection(sectionId);
  if (result.ok) refresh();
  return result.ok ? { ok: true } : { ok: false, error: result.error };
}

export async function saveSectionOrder(
  orderedIds: string[],
): Promise<{ ok: boolean; error?: string }> {
  const result = await reorderSections(orderedIds);
  if (result.ok) refresh();
  return result.ok ? { ok: true } : { ok: false, error: result.error };
}

/* ========================================================================= *
 * SERTIFIKATLAR
 *
 *    Ishonch darajasi (`trust`) HECH QAYERDA parametr emas — yangi va
 *    o'zgartirilgan sertifikat har doim tekshiruvga boradi. Daraja
 *    faqat admin panelida qo'yiladi (§8, §43).
 * ========================================================================= */

/**
 * Yangi sertifikat — id si qaytariladi: forma saqlangandan keyin
 * shu sertifikatga darhol dalil yuklashni taklif qiladi.
 */
export async function addCertificate(
  input: CertificateInput,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const result = await createCertificate(input);
  if (result.ok) refresh();
  return result;
}

export async function editCertificate(
  certificateId: string,
  input: CertificateInput,
): Promise<{ ok: boolean; error?: string }> {
  const result = await updateCertificate(certificateId, input);
  if (result.ok) refresh();
  return result.ok ? { ok: true } : { ok: false, error: result.error };
}

export async function removeCertificate(
  certificateId: string,
): Promise<{ ok: boolean; error?: string }> {
  const result = await deleteCertificate(certificateId);
  if (result.ok) refresh();
  return result.ok ? { ok: true } : { ok: false, error: result.error };
}

/**
 * Dalil faylini olib tashlaydi (yopiq bucketdan ham).
 *
 * Yuklash bu yerda EMAS — u `/api/profile/certificate-evidence`
 * orqali: baytlar brauzerdan to'g'ridan-to'g'ri storage'ga ketadi.
 */
export async function removeEvidence(
  certificateId: string,
): Promise<{ ok: boolean; error?: string }> {
  const result = await removeCertificateEvidence(certificateId);
  if (result.ok) refresh();
  return result.ok ? { ok: true } : { ok: false, error: result.error };
}

export async function addQuote(text: string): Promise<{ ok: boolean; message: string }> {
  const result = await submitQuote(text);
  if (result.ok) refresh();
  return result;
}

export async function removeQuote(quoteId: string): Promise<{ ok: boolean; message: string }> {
  const result = await deleteOwnQuote(quoteId);
  if (result.ok) refresh();
  return result;
}
