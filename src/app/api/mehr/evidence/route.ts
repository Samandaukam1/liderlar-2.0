import { NextResponse, type NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  checkEvidence,
  checkEvidenceFile,
  evidencePath,
  canSubmit,
  MAX_EVIDENCE_PHOTOS,
  type ActivityStatus,
} from "@/lib/mehr/submission-rules";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BUCKET = "mehr-media";

const payloadSchema = z.object({
  activityId: z.uuid(),
  title: z.string().trim().min(3).max(200),
  description: z.string().trim().min(1).max(20000),
  purpose: z.string().trim().min(1).max(2000),
  resultSummary: z.string().trim().max(5000).optional(),
  beneficiaryCount: z.number().int().min(0).max(1_000_000),
  notes: z.string().trim().max(5000).optional(),
});

/**
 * POST /api/mehr/evidence
 *
 * Tashkilotchi tadbirdan keyin dalilni to'ldirib, tekshiruvga
 * yuboradi (§10).
 *
 * TASHKILOTCHI SO'ROVDAN OLINMAYDI. U seansdagi foydalanuvchi —
 * `activityId` esa faqat "qaysi tadbir" degan savolga javob
 * beradi. Egalik bazada, yozuvning ICHIDA tekshiriladi.
 */
export async function POST(request: NextRequest) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { ok: false, error: "Tizimga kirmagansiz." },
      { status: 401 },
    );
  }

  const form = await request.formData().catch(() => null);
  if (!form) {
    return NextResponse.json({ ok: false, error: "So'rov formati noto'g'ri." }, { status: 400 });
  }

  const rawPayload = form.get("payload");
  if (typeof rawPayload !== "string") {
    return NextResponse.json({ ok: false, error: "Ma'lumot topilmadi." }, { status: 400 });
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(rawPayload);
  } catch {
    return NextResponse.json({ ok: false, error: "Ma'lumot formati noto'g'ri." }, { status: 400 });
  }

  const parsed = payloadSchema.safeParse(parsedJson);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Formada xatolik bor." },
      { status: 400 },
    );
  }

  const cover = form.get("cover");
  const photos = form.getAll("photos").filter((f): f is File => f instanceof File);
  const coverFile = cover instanceof File && cover.size > 0 ? cover : null;

  if (photos.length > MAX_EVIDENCE_PHOTOS) {
    return NextResponse.json(
      { ok: false, error: `Eng ko'pi ${MAX_EVIDENCE_PHOTOS} ta rasm yuklash mumkin.` },
      { status: 400 },
    );
  }

  for (const file of [coverFile, ...photos].filter(Boolean) as File[]) {
    const verdict = checkEvidenceFile({ name: file.name, size: file.size, type: file.type });
    if (!verdict.ok) return NextResponse.json({ ok: false, error: verdict.error }, { status: 400 });
  }

  const admin = createAdminClient();

  /*
   * EGALIK VA HOLAT — YOZISHDAN OLDIN.
   *
   * Bu o'qish foydalanuvchiga tushunarli javob berish uchun.
   * Haqiqiy kafolat esa pastdagi shartli UPDATE'da: ikki
   * so'rov bir vaqtda kelsa yoki shu orada admin tadbirni
   * rad etsa, u 0 qator o'zgartiradi va biz buni ko'ramiz.
   */
  const { data: activity } = await admin
    .from("mehr_activities")
    .select("id, organizer_profile_id, status, starts_at, cover_image_url")
    .eq("id", parsed.data.activityId)
    .maybeSingle();

  if (!activity) {
    return NextResponse.json({ ok: false, error: "Tadbir topilmadi." }, { status: 404 });
  }
  if (activity.organizer_profile_id !== user.id) {
    return NextResponse.json(
      { ok: false, error: "Bu tadbir sizga tegishli emas." },
      { status: 403 },
    );
  }
  if (!canSubmit(activity.status as ActivityStatus)) {
    return NextResponse.json(
      { ok: false, error: "Bu tadbir allaqachon yuborilgan yoki ko'rib chiqilgan." },
      { status: 409 },
    );
  }

  const { count: existingPhotos } = await admin
    .from("mehr_media")
    .select("id", { count: "exact", head: true })
    .eq("activity_id", activity.id);

  const verdict = checkEvidence({
    title: parsed.data.title,
    description: parsed.data.description,
    purpose: parsed.data.purpose,
    beneficiaryCount: parsed.data.beneficiaryCount,
    hasCover: Boolean(coverFile) || Boolean(activity.cover_image_url),
    photoCount: photos.length + (existingPhotos ?? 0),
    startsAt: activity.starts_at as string | null,
  });

  if (!verdict.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: `Quyidagilar yetishmayapti: ${verdict.missing.join(", ")}`,
        missing: verdict.missing,
      },
      { status: 400 },
    );
  }

  /* ---- Fayllarni yuklash ---- */

  async function upload(file: File): Promise<string | null> {
    const path = evidencePath(parsed.data!.activityId, randomUUID(), file.type);
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error } = await admin.storage
      .from(BUCKET)
      .upload(path, buffer, { contentType: file.type, upsert: false });

    if (error) {
      console.error("MEHR_EVIDENCE_UPLOAD_FAILED", { message: error.message });
      return null;
    }

    return admin.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  }

  let coverUrl = (activity.cover_image_url as string | null) ?? null;
  if (coverFile) {
    const url = await upload(coverFile);
    if (!url) {
      return NextResponse.json(
        { ok: false, error: "Muqova rasmini yuklab bo'lmadi. Qaytadan urinib ko'ring." },
        { status: 500 },
      );
    }
    coverUrl = url;
  }

  const photoUrls: string[] = [];
  for (const file of photos) {
    const url = await upload(file);
    if (url) photoUrls.push(url);
  }

  /*
   * Rasmlar yuklandi-yu birortasi ham o'tmadi — bu holatda
   * yuborish to'xtatiladi. Aks holda tadbir "dalilli" deb
   * tekshiruvga kirib, admin bo'sh galereya ko'rardi.
   */
  if (photos.length > 0 && photoUrls.length === 0 && (existingPhotos ?? 0) === 0) {
    return NextResponse.json(
      { ok: false, error: "Rasmlarni yuklab bo'lmadi. Qaytadan urinib ko'ring." },
      { status: 500 },
    );
  }

  if (photoUrls.length > 0) {
    await admin.from("mehr_media").insert(
      photoUrls.map((url, i) => ({
        activity_id: activity.id,
        url,
        kind: "photo",
        sort_order: (existingPhotos ?? 0) + i,
        uploaded_by: user.id,
      })),
    );
  }

  /* ---- Yuborish ---- */

  const { data: updated, error } = await admin
    .from("mehr_activities")
    .update({
      title: parsed.data.title,
      description: parsed.data.description,
      purpose: parsed.data.purpose,
      result_summary: parsed.data.resultSummary ?? null,
      notes: parsed.data.notes ?? null,
      beneficiary_count: parsed.data.beneficiaryCount,
      cover_image_url: coverUrl,
      status: "submitted",
      submitted_at: new Date().toISOString(),
    })
    .eq("id", activity.id)
    // Egalik va holat SHARTNING ICHIDA — chetlab o'tib bo'lmaydi.
    .eq("organizer_profile_id", user.id)
    .in("status", ["draft", "changes_requested"])
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("MEHR_EVIDENCE_SUBMIT_FAILED", { code: error.code, message: error.message });
    return NextResponse.json({ ok: false, error: "Saqlashda xatolik." }, { status: 500 });
  }

  if (!updated) {
    return NextResponse.json(
      { ok: false, error: "Tadbir holati o'zgargan — sahifani yangilang." },
      { status: 409 },
    );
  }

  await admin.from("mehr_reviews").insert({
    activity_id: activity.id,
    action: "submitted",
    actor_user_id: user.id,
  });

  return NextResponse.json({ ok: true });
}
