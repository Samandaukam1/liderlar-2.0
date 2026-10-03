"use client";

import { createClient } from "@/lib/supabase/client";
import { EVIDENCE_TYPE_ERROR, validEvidenceMeta } from "./evidence-rules";

/**
 * SERTIFIKAT DALILINI YUKLASH — BRAUZER TOMONI.
 *
 * imzo -> to'g'ridan-to'g'ri Supabase'ga yuklash -> tasdiqlash.
 * Fayl kichraytirilmaydi va o'zgartirilmaydi: dalil hujjat, uning
 * asl ko'rinishi muhim (PDF'ni qayta kodlash mumkin ham emas).
 */

export type EvidenceUploadStage = "signing" | "uploading" | "checking";

export const EVIDENCE_STAGE_TEXT: Record<EvidenceUploadStage, string> = {
  signing: "Tayyorlanmoqda…",
  uploading: "Yuklanmoqda…",
  checking: "Tekshirilmoqda…",
};

async function post(body: Record<string, unknown>): Promise<Record<string, unknown>> {
  const response = await fetch("/api/profile/certificate-evidence", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const result = (await response.json().catch(() => null)) as Record<string, unknown> | null;
  if (!response.ok || !result || result.ok !== true) {
    throw new Error(
      typeof result?.error === "string" ? result.error : "Yuklab bo'lmadi. Qaytadan urinib ko'ring.",
    );
  }
  return result;
}

export async function uploadEvidence(
  file: File,
  certificateId: string,
  onStage?: (stage: EvidenceUploadStage) => void,
): Promise<void> {
  // Bu faqat tez javob uchun; haqiqiy tekshiruv serverda, fayl baytlarida.
  if (!validEvidenceMeta(file.type, file.size)) throw new Error(EVIDENCE_TYPE_ERROR);

  onStage?.("signing");
  const signed = await post({
    step: "sign",
    certificateId,
    mimeType: file.type,
    size: file.size,
  });

  const bucket = String(signed.bucket ?? "");
  const path = String(signed.path ?? "");
  const token = String(signed.token ?? "");
  if (!bucket || !path || !token) throw new Error("Yuklashni boshlab bo'lmadi.");

  onStage?.("uploading");
  const { error } = await createClient()
    .storage.from(bucket)
    .uploadToSignedUrl(path, token, file, { contentType: file.type });
  if (error) throw new Error("Yuklash uzildi. Qaytadan urinib ko'ring.");

  onStage?.("checking");
  await post({ step: "commit", certificateId, path });
}
