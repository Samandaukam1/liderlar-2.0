import { createHash, randomUUID } from "node:crypto";
import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { applicationSchema } from "@/lib/validation/application";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

export async function POST(request: NextRequest) {
  const form = await request.formData().catch(() => null);
  if (!form) {
    return Response.json({ error: "So'rov formati noto'g'ri." }, { status: 400 });
  }

  const payload = form.get("payload");
  const files = form.getAll("files").filter((value): value is File => value instanceof File);
  if (typeof payload !== "string") {
    return Response.json({ error: "Ariza ma'lumotlari topilmadi." }, { status: 400 });
  }

  let input: unknown;
  try {
    input = JSON.parse(payload);
  } catch {
    return Response.json({ error: "Ariza formati noto'g'ri." }, { status: 400 });
  }

  const parsed = applicationSchema.safeParse(input);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Formada xatolik bor." },
      { status: 400 }
    );
  }

  for (const file of files) {
    if (file.size > MAX_FILE_SIZE) {
      return Response.json(
        { error: `"${file.name}" hajmi 20 MB dan oshmasligi kerak.` },
        { status: 400 }
      );
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return Response.json(
        { error: `"${file.name}" fayl turi qo'llab-quvvatlanmaydi.` },
        { status: 400 }
      );
    }
  }

  const {
    fullName,
    phone,
    email,
    birthYear,
    regionId,
    directionId,
    motivation,
    portfolioLinks,
  } = parsed.data;
  const details = [
    motivation,
    birthYear ? `Tug'ilgan yil: ${birthYear}` : null,
    portfolioLinks ? `Portfolio:\n${portfolioLinks}` : null,
  ].filter(Boolean);

  const admin = createAdminClient();
  const { data: application, error: applicationError } = await admin
    .from("applications")
    .insert({
      full_name: fullName,
      phone,
      email: email ?? null,
      region_id: regionId ?? null,
      category_id: directionId ?? null,
      motivation: details.join("\n\n"),
      status: "new",
    })
    .select("id")
    .single();

  if (applicationError || !application) {
    console.error("Application submit error:", applicationError);
    return Response.json(
      { error: "Arizani saqlashda xatolik yuz berdi." },
      { status: 500 }
    );
  }

  const failedUploads: string[] = [];
  for (const file of files) {
    const safeExtension = file.name.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "").slice(0, 10);
    const path = `${application.id}/${randomUUID()}${safeExtension ? `.${safeExtension}` : ""}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const checksum = createHash("sha256").update(buffer).digest("hex").slice(0, 12);

    const { error: uploadError } = await admin.storage
      .from("application-files")
      .upload(path, buffer, { contentType: file.type, upsert: false });
    if (uploadError) {
      console.error(`Application file upload failed (${checksum}):`, uploadError);
      failedUploads.push(file.name);
      continue;
    }

    const { error: registryError } = await admin.from("application_files").insert({
      application_id: application.id,
      bucket: "application-files",
      path,
      file_name: file.name,
      mime_type: file.type,
      size_bytes: file.size,
    });
    if (registryError) {
      console.error(`Application file registry failed (${checksum}):`, registryError);
      failedUploads.push(file.name);
    }
  }

  return Response.json({
    ok: true,
    warning:
      failedUploads.length > 0
        ? `${failedUploads.length} ta fayl yuklanmadi. Tahririyat siz bilan bog'lanadi.`
        : null,
  });
}
