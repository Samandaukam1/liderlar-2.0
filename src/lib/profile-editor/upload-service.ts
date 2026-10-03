import "server-only";
import { randomUUID } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireEntitlement } from "@/lib/vip/entitlement-service";
import { recordAudit } from "@/lib/vip/audit-log";
import { resolveOwnCandidate } from "./edit-service";
import {
  checkImageMeta,
  cleanAltText,
  IMAGE_RULES,
  isImageKind,
  AVATAR_CHANGES_PER_DAY,
  AVATAR_LIMIT_TEXT,
} from "./image-rules";

/**
 * PROFIL RASMLARINI YUKLASH.
 *
 * IMZOLANGAN URL YO'LI: server imzo beradi, brauzer faylni
 * TO'G'RIDAN-TO'G'RI Supabase'ga yuklaydi, keyin server tasdiqlaydi.
 *
 * NEGA baytlar server orqali o'tmaydi: Vercel so'rov tanasini ~4.5 MB
 * bilan cheklaydi, galereya rasmi esa 8 MB gacha bo'lishi mumkin.
 * Fayl server orqali yuborilsa, zamonaviy telefon suratlarining
 * ko'pi tushunarsiz xato bilan rad etilardi.
 *
 * Bu yo'l admin paneldagi quvurning aynan o'zi — u ishlab chiqarishda
 * sinalgan. Farqi: u yerda `media.upload` ruxsati, bu yerda VIP
 * huquqi va EGALIK tekshiriladi.
 */

export interface SignedUpload {
  bucket: string;
  path: string;
  token: string;
}

export type SignResult =
  | { ok: true; upload: SignedUpload }
  | { ok: false; error: string };

/**
 * Egalik asosidagi manzil.
 *
 * `candidates/<candidateId>/<uuid>.<ext>` — §59 "ownership paths".
 *
 * Uuid o'zi ham ustiga yozishni imkonsiz qiladi, lekin papkada
 * nomzod id si borligi KEYIN kerak bo'ladi: profil o'chirilganda
 * uning rasmlarini topish va tozalash uchun. Umumiy `oy/uuid`
 * papkasida bu ishni qilib bo'lmasdi.
 *
 * MANZIL BRAUZERDAN QABUL QILINMAYDI — u shu yerda yasaladi. Aks
 * holda odam `../` yoki boshqa nomzodning papkasini yozib yuborishi
 * mumkin bo'lardi.
 */
function buildPath(candidateId: string, mimeType: string): string {
  const ext =
    mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : "jpg";
  return `candidates/${candidateId}/${randomUUID()}.${ext}`;
}

/**
 * Galereyada allaqachon nechta rasm bor.
 *
 * Faqat galereya uchun: profil rasmi bitta o'rin va almashtiriladi
 * (qarang: `AVATAR_CHANGES_PER_DAY`).
 */
async function countGallery(candidateId: string): Promise<number> {
  const admin = createAdminClient();
  const { count, error } = await admin
    .from("candidate_media")
    .select("id", { count: "exact", head: true })
    .eq("candidate_id", candidateId)
    .eq("bucket", IMAGE_RULES.gallery.bucket)
    .is("deleted_at", null);

  if (error) {
    /*
     * SANOQ O'QILMASA — CHEGARA TO'LGAN DEB QARAYMIZ.
     *
     * 0 qaytarish cheksiz yuklashga yo'l ochardi. Fail closed.
     */
    console.error("[rasm] sanoq o'qilmadi:", error.message);
    return IMAGE_RULES.gallery.maxCount;
  }
  return count ?? 0;
}

/**
 * Oxirgi 24 soatda nechta profil rasmi yuklangan; o'qib bo'lmasa `null`.
 */
async function recentAvatarChanges(candidateId: string): Promise<number | null> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count, error } = await createAdminClient()
    .from("candidate_media")
    .select("id", { count: "exact", head: true })
    .eq("candidate_id", candidateId)
    .eq("kind", "avatar")
    .gte("created_at", since);

  if (error) {
    console.error("[rasm] avatar sanog'i o'qilmadi:", error.message);
    return null;
  }
  return count ?? 0;
}

/**
 * Yuklash uchun imzo beradi.
 *
 * TEKSHIRUVLAR TARTIBI: huquq -> egalik -> metama'lumot -> imzo.
 * Imzo oxirida beriladi, chunki u Supabase'da yozish huquqini
 * ochadi — rad etilishi kerak bo'lgan so'rov hech qachon imzo
 * olmasligi kerak.
 */
export async function signProfileUpload(input: {
  kind: unknown;
  mimeType: unknown;
  size: unknown;
}): Promise<SignResult> {
  const entitled = await requireEntitlement("profile.media_upload");
  if (!entitled.ok) return { ok: false, error: entitled.error };

  const resolved = await resolveOwnCandidate();
  if (!resolved.ok) return { ok: false, error: resolved.error };

  if (!isImageKind(input.kind)) return { ok: false, error: "Rasm turi tanlanmagan." };
  const kind = input.kind;

  /*
   * PROFIL RASMI — ALMASHTIRISH, o'rin sanog'i EMAS.
   *
   * Avval mavjud avatar "o'rin band" deb sanalardi va rasm qo'ygan
   * odam uni boshqa almashtira olmasdi. Endi faqat kunlik chegara.
   * O'qib bo'lmasa — rad (fail closed), lekin sababi aniq aytiladi.
   */
  let existingCount = 0;
  if (kind === "avatar") {
    const recent = await recentAvatarChanges(resolved.owned.candidateId);
    if (recent === null) {
      return { ok: false, error: "Hozir tekshirib bo'lmadi. Birozdan keyin qayta urinib ko'ring." };
    }
    if (recent >= AVATAR_CHANGES_PER_DAY) return { ok: false, error: AVATAR_LIMIT_TEXT };
  } else {
    existingCount = await countGallery(resolved.owned.candidateId);
  }

  const check = checkImageMeta({
    kind,
    mimeType: input.mimeType,
    size: input.size,
    existingCount,
  });
  if (!check.ok) return { ok: false, error: check.error ?? "Rasm qabul qilinmadi." };

  const bucket = IMAGE_RULES[kind].bucket;
  const path = buildPath(resolved.owned.candidateId, String(input.mimeType));

  const admin = createAdminClient();
  const { data, error } = await admin.storage.from(bucket).createSignedUploadUrl(path);

  if (error || !data) {
    console.error("[rasm] imzo berilmadi:", error?.message);
    return { ok: false, error: "Yuklashni boshlab bo'lmadi. Keyinroq urinib ko'ring." };
  }

  return { ok: true, upload: { bucket, path, token: data.token } };
}

/* ========================================================================= *
 * TASDIQLASH
 * ========================================================================= */

export type CommitResult = { ok: true; url: string } | { ok: false; error: string };

/**
 * Yuklash tugagandan keyin faylni ro'yxatga oladi.
 *
 * FAYL BORLIGI SAQLASH QATLAMIDAN SO'RALADI, chaqiruvchidan emas:
 * brauzer "yuklandi" deb aytib, aslida hech narsa yubormagan
 * bo'lishi mumkin — natijada profilda bo'sh rasm havolasi qolardi.
 */
export async function commitProfileUpload(input: {
  kind: unknown;
  path: unknown;
  altText?: unknown;
}): Promise<CommitResult> {
  const entitled = await requireEntitlement("profile.media_upload");
  if (!entitled.ok) return { ok: false, error: entitled.error };

  const resolved = await resolveOwnCandidate();
  if (!resolved.ok) return { ok: false, error: resolved.error };

  if (!isImageKind(input.kind)) return { ok: false, error: "Rasm turi tanlanmagan." };
  const kind = input.kind;
  const { candidateId, profileId } = resolved.owned;

  const path = String(input.path ?? "");
  const expectedPrefix = `candidates/${candidateId}/`;

  /*
   * MANZIL SHU NOMZODGA TEGISHLI BO'LISHI SHART.
   *
   * `path` brauzerdan qaytib keladi va u boshqa nomzodning
   * manzilini yuborishi mumkin — u holda bu funksiya begona
   * faylni shu profilga bog'lab qo'yardi.
   */
  if (!path.startsWith(expectedPrefix) || path.includes("..")) {
    console.warn("[rasm] begona manzil rad etildi:", { candidateId, path });
    return { ok: false, error: "Fayl manzili noto'g'ri." };
  }

  const bucket = IMAGE_RULES[kind].bucket;
  const admin = createAdminClient();

  const folder = path.slice(0, path.lastIndexOf("/"));
  const name = path.slice(path.lastIndexOf("/") + 1);

  const { data: listed, error: listError } = await admin.storage
    .from(bucket)
    .list(folder, { search: name, limit: 1 });

  if (listError) {
    console.error("[rasm] fayl tekshirilmadi:", listError.message);
    return { ok: false, error: "Faylni tekshirib bo'lmadi." };
  }

  const object = listed?.find((o) => o.name === name);
  if (!object) return { ok: false, error: "Yuklangan fayl topilmadi." };

  const sizeBytes = Number(object.metadata?.size ?? 0);
  const mimeType = String(object.metadata?.mimetype ?? "");

  /*
   * HAJM VA TUR QAYTA TEKSHIRILADI.
   *
   * Imzo berilgandan keyin brauzer BOSHQA fayl yuborishi mumkin
   * edi: imzo manzilga beriladi, mazmunga emas. Shuning uchun
   * haqiqiy fayl qoidadan o'tmasa, u O'CHIRILADI — aks holda
   * bucketda qoidaga sig'maydigan fayl qolib ketardi.
   */
  const recheck = checkImageMeta({ kind, mimeType, size: sizeBytes, existingCount: 0 });
  if (!recheck.ok) {
    await admin.storage.from(bucket).remove([path]);
    return { ok: false, error: recheck.error ?? "Rasm qabul qilinmadi." };
  }

  const { data: publicUrl } = admin.storage.from(bucket).getPublicUrl(path);
  const url = publicUrl.publicUrl;

  /*
   * TAVSIF O'Z USTUNIGA (`alt_text`) — fayl nomiga EMAS.
   *
   * Avval tavsif `file_name` ga yozilardi va ommaviy profil fayl
   * nomini izoh sifatida ko'rsatardi: tavsifsiz rasmda ekran
   * o'quvchisi "3f2a9c1e….webp" deb o'qirdi. Bo'sh tavsif — `null`.
   */
  const alt = kind === "gallery" ? cleanAltText(input.altText) : null;

  const { data: media, error: mediaError } = await admin
    .from("candidate_media")
    .insert({
      bucket,
      path,
      file_name: name,
      alt_text: alt,
      mime_type: mimeType,
      size_bytes: sizeBytes,
      candidate_id: candidateId,
      kind,
      uploaded_by: profileId,
    })
    .select("id")
    .single();

  if (mediaError) {
    console.error("[rasm] ro'yxatga olinmadi:", mediaError.message);
    /*
     * Reyestrga tushmagan fayl bucketda egasiz qolmasin.
     */
    const { error: removeError } = await admin.storage.from(bucket).remove([path]);
    if (removeError) {
      console.error("[rasm] egasiz fayl o'chirilmadi:", { path, message: removeError.message });
    }
    return { ok: false, error: "Rasmni saqlab bo'lmadi." };
  }

  if (kind === "avatar") {
    /*
     * PROFIL RASMI DARHOL ALMASHADI.
     *
     * Ko'rikka yuborilmaydi: rasm odamning o'zini taqdim etishi va
     * unda tekshirib bo'ladigan DA'VO yo'q (§6 taqsimoti). Eski
     * rasm `candidate_media` da qoladi — tarix yo'qolmaydi va
     * kerak bo'lsa qaytarish mumkin.
     */
    const { error: avatarError } = await admin
      .from("candidates")
      .update({ avatar_url: url, last_updated_at: new Date().toISOString() })
      .eq("id", candidateId);

    if (avatarError) {
      console.error("[rasm] avatar yozilmadi:", avatarError.message);
      return { ok: false, error: "Profil rasmini o'rnatib bo'lmadi." };
    }
  }

  await recordAudit("profile.media.uploaded", {
    actorId: profileId,
    entityId: candidateId,
    after: { kind, path, alt_text: alt },
    metadata: { media_id: (media?.id as string | undefined) ?? null, bucket, size_bytes: sizeBytes },
  });

  return { ok: true, url };
}

/* ========================================================================= *
 * O'CHIRISH
 * ========================================================================= */

/** Brauzerdan kelgan rasm id si uuid shaklidami. */
function isMediaId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
  );
}

export interface GalleryImage {
  id: string;
  url: string;
  path: string;
  /** Rasm tavsifi; `null` — kiritilmagan. */
  altText: string | null;
}

export async function loadGallery(candidateId: string): Promise<GalleryImage[]> {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("candidate_media")
    .select("id, path, alt_text")
    .eq("candidate_id", candidateId)
    .eq("bucket", IMAGE_RULES.gallery.bucket)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  /*
   * O'QISH XATOSI "RASM YO'Q" EMAS: bo'sh galereya odamni rasmlarini
   * qayta yuklashga undardi. Xato sahifaning xato holatiga chiqadi.
   */
  if (error) {
    console.error("[rasm] galereya o'qilmadi:", error.message);
    throw new Error("Galereyani o'qib bo'lmadi.");
  }

  return (data ?? []).map((row) => {
    const path = row.path as string;
    const { data: publicUrl } = admin.storage
      .from(IMAGE_RULES.gallery.bucket)
      .getPublicUrl(path);
    return {
      id: row.id as string,
      url: publicUrl.publicUrl,
      path,
      altText: (row.alt_text as string | null) ?? null,
    };
  });
}

/**
 * Rasmni profildan olib tashlaydi.
 *
 * `deleted_at` QO'YILADI, fayl o'chirilmaydi — "soft delete".
 *
 * Sabab: bu loyihada rasm boshqa joylarda ham ishlatilgan bo'lishi
 * mumkin (ijtimoiy post, sertifikat). Faylni darhol o'chirish o'sha
 * joylarda buzilgan rasm qoldirardi. Fayl keyin, bog'liqliklar
 * tekshirilgandan so'ng tozalanishi mumkin.
 */
export async function removeGalleryImage(
  mediaId: string,
): Promise<{ ok: boolean; error?: string }> {
  const entitled = await requireEntitlement("profile.media_upload");
  if (!entitled.ok) return { ok: false, error: entitled.error };

  if (!isMediaId(mediaId)) return { ok: false, error: "Rasm topilmadi." };

  const resolved = await resolveOwnCandidate();
  if (!resolved.ok) return { ok: false, error: resolved.error };

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("candidate_media")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", mediaId)
    // Egalik sharti — begona rasmni o'chirib bo'lmaydi.
    .eq("candidate_id", resolved.owned.candidateId)
    .is("deleted_at", null)
    .select("id, path, kind")
    .maybeSingle();

  if (error) {
    console.error("[rasm] o'chirilmadi:", error.message);
    return { ok: false, error: "Rasmni o'chirib bo'lmadi." };
  }
  if (!data) return { ok: false, error: "Rasm topilmadi." };

  await recordAudit("profile.media.removed", {
    actorId: resolved.owned.profileId,
    entityId: resolved.owned.candidateId,
    before: { kind: (data.kind as string | null) ?? null, path: data.path as string },
    metadata: { media_id: mediaId },
  });

  return { ok: true };
}

/**
 * Galereyadagi rasm tavsifini o'zgartiradi (§7, §52).
 *
 * Bo'sh qiymat tavsifni olib tashlaydi (`null`) — sahifa umumiy
 * tavsif ko'rsatadi. Fayl nomiga tegilmaydi.
 */
export async function updateGalleryAltText(
  mediaId: unknown,
  altText: unknown,
): Promise<{ ok: boolean; error?: string }> {
  const entitled = await requireEntitlement("profile.media_upload");
  if (!entitled.ok) return { ok: false, error: entitled.error };

  const resolved = await resolveOwnCandidate();
  if (!resolved.ok) return { ok: false, error: resolved.error };

  // Yaroqsiz id bazaga yuborilmaydi: u "rasm topilmadi" emas, uuid xatosi bo'lib qaytardi.
  if (!isMediaId(mediaId)) return { ok: false, error: "Rasm topilmadi." };
  if (altText !== null && altText !== undefined && typeof altText !== "string") {
    return { ok: false, error: "Tavsif noto'g'ri." };
  }

  const alt = cleanAltText(altText);
  const admin = createAdminClient();

  const { data: previous, error: readError } = await admin
    .from("candidate_media")
    .select("alt_text")
    .eq("id", mediaId)
    .eq("candidate_id", resolved.owned.candidateId)
    .eq("bucket", IMAGE_RULES.gallery.bucket)
    .is("deleted_at", null)
    .maybeSingle();

  if (readError) {
    console.error("[rasm] tavsif o'qilmadi:", readError.message);
    return { ok: false, error: "Tavsifni saqlab bo'lmadi." };
  }
  if (!previous) return { ok: false, error: "Rasm topilmadi." };

  const before = (previous.alt_text as string | null) ?? null;
  if (before === alt) return { ok: true };

  const { error } = await admin
    .from("candidate_media")
    .update({ alt_text: alt })
    .eq("id", mediaId)
    .eq("candidate_id", resolved.owned.candidateId)
    .is("deleted_at", null);

  if (error) {
    console.error("[rasm] tavsif yozilmadi:", error.message);
    return { ok: false, error: "Tavsifni saqlab bo'lmadi." };
  }

  await recordAudit("profile.media.alt_updated", {
    actorId: resolved.owned.profileId,
    entityId: resolved.owned.candidateId,
    before: { alt_text: before },
    after: { alt_text: alt },
    metadata: { media_id: mediaId },
  });

  return { ok: true };
}
