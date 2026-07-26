import { NextRequest, NextResponse } from "next/server";
import { createHash, randomUUID } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  monthlyUpdatePayloadSchema,
  MAX_FILE_SIZE_BYTES,
  ALLOWED_FILE_TYPES,
} from "@/lib/validation/monthly-update";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const form = await req.formData().catch(() => null);
  if (!form) {
    return NextResponse.json({ error: "So'rov formati noto'g'ri." }, { status: 400 });
  }

  const token = form.get("token");
  const payloadRaw = form.get("payload");
  const files = form.getAll("files").filter((f): f is File => f instanceof File);

  if (typeof token !== "string" || !token) {
    return NextResponse.json({ error: "Token topilmadi." }, { status: 400 });
  }
  if (typeof payloadRaw !== "string") {
    return NextResponse.json({ error: "Ma'lumot topilmadi." }, { status: 400 });
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(payloadRaw);
  } catch {
    return NextResponse.json({ error: "Ma'lumot formati noto'g'ri." }, { status: 400 });
  }

  const parsed = monthlyUpdatePayloadSchema.safeParse(parsedJson);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Formada xatolik bor." },
      { status: 400 }
    );
  }

  for (const file of files) {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: `"${file.name}" fayli hajmi juda katta (maks. 20 MB).` }, { status: 400 });
    }
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json({ error: `"${file.name}" fayl turi qo'llab-quvvatlanmaydi.` }, { status: 400 });
    }
  }

  const admin = createAdminClient();
  const tokenHash = createHash("sha256").update(token).digest("hex");

  const { data: verified, error: verifyError } = await admin
    .rpc("verify_update_token", { p_token_hash: tokenHash })
    .maybeSingle();

  if (verifyError || !verified) {
    return NextResponse.json(
      { error: "Havola amal qilish muddati tugagan yoki yaroqsiz." },
      { status: 410 }
    );
  }

  const { candidate_id: candidateId } = verified as {
    candidate_id: string;
  };

  const { data: updateId, error: startError } = await admin.rpc("start_monthly_update", {
    p_token_hash: tokenHash,
  });

  if (startError || !updateId) {
    console.error("start_monthly_update error:", startError);
    return NextResponse.json({ error: "Ma'lumotni saqlashda xatolik yuz berdi." }, { status: 500 });
  }

  const {
    periodMonth,
    booksRead,
    achievements,
    events,
    projects,
    volunteering,
    newRolesOrEducation,
    mediaAppearances,
    journalSubmission,
    freeformTitle,
    freeformContent,
    videoLinks,
  } = parsed.data;

  const items = [
    ...booksRead.map((item) => ({ kind: "book", title: item.title, description: item.detail })),
    ...achievements.map((item) => ({ kind: "achievement", title: item.title, description: item.detail })),
    ...events.map((item) => ({ kind: "event", title: item.title, description: item.detail })),
    ...projects.map((item) => ({ kind: "project", title: item.title, description: item.detail })),
    ...(volunteering
      ? [{ kind: "volunteering", title: "Volontyorlik ishlari", description: volunteering }]
      : []),
    ...(newRolesOrEducation
      ? [{ kind: "education", title: "Yangi ish yoki ta'lim", description: newRolesOrEducation }]
      : []),
    ...(mediaAppearances
      ? [{ kind: "other", title: "Podcast yoki intervyu", description: mediaAppearances }]
      : []),
    ...(journalSubmission
      ? [{ kind: "other", title: "Liderlar Online uchun material", description: journalSubmission }]
      : []),
    ...(freeformTitle || freeformContent
      ? [{ kind: "other", title: freeformTitle || "Qo'shimcha ma'lumot", description: freeformContent }]
      : []),
    ...videoLinks.map((item) => ({
      kind: "other",
      title: "Video havola",
      description: null,
      link_url: item.url,
    })),
  ].map((item, index) => ({
    update_id: updateId as string,
    ...item,
    sort_order: index,
  }));

  if (items.length > 0) {
    const { error: itemError } = await admin.from("monthly_update_items").insert(items);
    if (itemError) {
      console.error("monthly_update_items insert error:", itemError);
      return NextResponse.json({ error: "Yangilanish bandlarini saqlashda xatolik yuz berdi." }, { status: 500 });
    }
  }

  const { error: submitError } = await admin
    .from("monthly_updates")
    .update({
      status: "submitted",
      free_text: `Hisobot oyi: ${periodMonth}`,
      submitted_at: new Date().toISOString(),
    })
    .eq("id", updateId);
  if (submitError) {
    console.error("monthly_updates submit error:", submitError);
    return NextResponse.json({ error: "Yangilanishni yuborishda xatolik yuz berdi." }, { status: 500 });
  }

  for (const file of files) {
    const ext = file.name.split(".").pop();
    const path = `${candidateId}/${updateId}/${randomUUID()}${ext ? `.${ext}` : ""}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await admin.storage
      .from("monthly-update-media")
      .upload(path, buffer, { contentType: file.type, upsert: false });

    if (uploadError) {
      console.error("monthly-update-media upload error:", uploadError);
      continue;
    }

    await admin.from("monthly_update_media").insert({
      update_id: updateId,
      bucket: "monthly-update-media",
      path,
      file_name: file.name,
      mime_type: file.type,
      size_bytes: file.size,
    });
  }

  return NextResponse.json({ ok: true });
}
