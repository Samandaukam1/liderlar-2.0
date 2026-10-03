"use client";

import { createClient } from "@/lib/supabase/client";
import {
  checkDimensions,
  IMAGE_RULES,
  scaledSize,
  type ImageKind,
} from "./image-rules";

/**
 * RASM YUKLASH — BRAUZER TOMONI.
 *
 * Tartib: o'qish -> o'lchamni tekshirish -> KICHRAYTIRISH -> imzo
 * olish -> Supabase'ga yuklash -> tasdiqlash.
 *
 * KICHRAYTIRISH BRAUZERDA, serverda emas. Uch foydasi bor:
 *
 *   1. EGRESS. Saqlanadigan fayl kichik bo'lsa, Next optimizatori
 *      ham kichik faylni yuklab oladi (§7).
 *   2. Yuklash tezligi — 8 MB o'rniga ~400 KB ketadi.
 *   3. Server hech qanday hisob qilmaydi: serverda kichraytirish
 *      avval faylni to'liq qabul qilishni talab qilardi va bu
 *      Vercel chekvasiga urilardi.
 */

export interface UploadProgress {
  stage: "reading" | "resizing" | "uploading" | "saving";
}

export type UploadOutcome = { ok: true; url: string } | { ok: false; error: string };

/**
 * Faylni rasm sifatida o'qiydi va o'lchamini qaytaradi.
 *
 * `createImageBitmap` ishlatiladi: u `<img>` yaratishdan tezroq va
 * asosiy ipni band qilmaydi.
 */
async function readImage(file: File): Promise<ImageBitmap | null> {
  try {
    return await createImageBitmap(file);
  } catch {
    /*
     * O'qilmasa — bu rasm emas yoki buzilgan.
     *
     * MIME turiga ishonib bo'lmaydi: u fayl nomidan kelib chiqadi va
     * `.jpg` deb nomlangan matn fayli ham `image/jpeg` bo'lib
     * ko'rinishi mumkin.
     */
    return null;
  }
}

/**
 * Rasmni kichraytirib WebP ga aylantiradi.
 *
 * WEBP — chiqish formati. Fayl hajmi JPEG'dan sezilarli kichik va
 * barcha zamonaviy brauzerlar uni yasay oladi. Bucket qoidasi ham
 * `image/webp` ni qabul qiladi.
 */
async function resizeToWebp(
  bitmap: ImageBitmap,
  kind: ImageKind,
): Promise<{ blob: Blob; mimeType: string } | null> {
  const target = scaledSize(kind, { width: bitmap.width, height: bitmap.height });

  const canvas = document.createElement("canvas");
  canvas.width = target.width;
  canvas.height = target.height;

  const context = canvas.getContext("2d");
  if (!context) return null;

  /*
   * Sifatli kichraytirish uchun silliqlash yoqiladi. Busiz natija
   * "pogonali" chiqadi — ayniqsa portretda ko'zga tashlanadi.
   */
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(bitmap, 0, 0, target.width, target.height);

  const blob = await new Promise<Blob | null>((resolve) => {
    // 0.85 — ko'z bilan farq sezilmaydigan, lekin hajmi ancha kichik daraja.
    canvas.toBlob((result) => resolve(result), "image/webp", 0.85);
  });

  if (!blob) return null;
  return { blob, mimeType: "image/webp" };
}

/**
 * Rasmni yuklaydi.
 *
 * `onProgress` — bosqichni ko'rsatish uchun (§7 "upload progress").
 * Haqiqiy foiz berilmaydi: Supabase SDK uni bermaydi va o'ylab
 * chiqarilgan foiz yolg'on bo'lardi (§71).
 */
export async function uploadProfileImage(
  file: File,
  kind: ImageKind,
  onProgress?: (progress: UploadProgress) => void,
  altText?: string,
): Promise<UploadOutcome> {
  onProgress?.({ stage: "reading" });

  const bitmap = await readImage(file);
  if (!bitmap) return { ok: false, error: "Bu fayl rasm emas yoki buzilgan." };

  const dimensionCheck = checkDimensions(kind, bitmap.width, bitmap.height);
  if (!dimensionCheck.ok) {
    bitmap.close();
    return { ok: false, error: dimensionCheck.error ?? "Rasm o'lchami mos emas." };
  }

  onProgress?.({ stage: "resizing" });
  const resized = await resizeToWebp(bitmap, kind);
  bitmap.close();

  if (!resized) return { ok: false, error: "Rasmni tayyorlab bo'lmadi." };

  /*
   * KICHRAYTIRILGANDAN KEYIN HAJM QAYTA TEKSHIRILADI.
   *
   * Juda katta va murakkab rasm WebP'da ham chegaradan oshishi
   * mumkin. Serverda ham tekshiriladi, lekin bu yerda aytish
   * tezroq va tushunarliroq.
   */
  if (resized.blob.size > IMAGE_RULES[kind].maxBytes) {
    return { ok: false, error: "Rasm juda katta. Kichikroq rasm tanlang." };
  }

  const signResponse = await fetch("/api/profile/upload", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      step: "sign",
      kind,
      mimeType: resized.mimeType,
      size: resized.blob.size,
    }),
  });

  const signBody = (await signResponse.json().catch(() => null)) as
    | { bucket?: string; path?: string; token?: string; error?: string }
    | null;

  if (!signResponse.ok || !signBody?.token || !signBody.path || !signBody.bucket) {
    return { ok: false, error: signBody?.error ?? "Yuklashni boshlab bo'lmadi." };
  }

  onProgress?.({ stage: "uploading" });

  const supabase = createClient();
  const { error: uploadError } = await supabase.storage
    .from(signBody.bucket)
    .uploadToSignedUrl(signBody.path, signBody.token, resized.blob, {
      contentType: resized.mimeType,
    });

  if (uploadError) {
    return { ok: false, error: "Yuklash uzildi. Qaytadan urinib ko'ring." };
  }

  onProgress?.({ stage: "saving" });

  const commitResponse = await fetch("/api/profile/upload", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ step: "commit", kind, path: signBody.path, altText }),
  });

  const commitBody = (await commitResponse.json().catch(() => null)) as
    | { url?: string; error?: string }
    | null;

  if (!commitResponse.ok || !commitBody?.url) {
    return { ok: false, error: commitBody?.error ?? "Rasmni saqlab bo'lmadi." };
  }

  return { ok: true, url: commitBody.url };
}

export const PROGRESS_TEXT: Record<UploadProgress["stage"], string> = {
  reading: "Rasm o'qilmoqda…",
  resizing: "Tayyorlanmoqda…",
  uploading: "Yuklanmoqda…",
  saving: "Saqlanmoqda…",
};
