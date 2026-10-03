import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  commitEvidenceUpload,
  signEvidenceUpload,
} from "@/lib/profile-editor/evidence-service";

export const runtime = "nodejs";

/**
 * POST /api/profile/certificate-evidence
 *
 * Sertifikat dalilini yuklash: `step: "sign"` — imzo, `step: "commit"`
 * — tekshirib biriktirish. Baytlar bu marshrut orqali O'TMAYDI.
 *
 * Huquq, egalik va fayl tekshiruvi xizmat qatlamida
 * (`evidence-service.ts`) — bu yerda faqat so'rov shakli.
 */
const NO_STORE = { "Cache-Control": "no-store" };

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ ok: false, error: "So'rov formati noto'g'ri." }, { status: 400, headers: NO_STORE });
  }

  const input = body as Record<string, unknown>;

  if (input.step === "sign") {
    const result = await signEvidenceUpload({
      certificateId: input.certificateId,
      mimeType: input.mimeType,
      size: input.size,
    });
    return NextResponse.json(result, { status: result.ok ? 200 : 400, headers: NO_STORE });
  }

  if (input.step === "commit") {
    const result = await commitEvidenceUpload({
      certificateId: input.certificateId,
      path: input.path,
    });
    if (result.ok) revalidatePath("/kabinet/profil");
    return NextResponse.json(result, { status: result.ok ? 200 : 400, headers: NO_STORE });
  }

  return NextResponse.json({ ok: false, error: "Noma'lum qadam." }, { status: 400, headers: NO_STORE });
}
