import { NextResponse } from "next/server";
import { ownEvidenceLink } from "@/lib/profile-editor/evidence-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/profile/certificate-evidence/<sertifikat id>
 *
 * Egasini 60 soniyalik imzolangan havolaga yo'naltiradi. Bucket
 * yopiq: fayl manzili sahifada hech qachon ko'rinmaydi va havola
 * keshda qolmaydi.
 *
 * Boshqa odamning sertifikati, mavjud bo'lmagan sertifikat va
 * dalilsiz sertifikat — hammasi BIR XIL 404: javobdan sertifikat
 * borligini bilib bo'lmasin.
 */
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const link = await ownEvidenceLink(id);

  if (!link) {
    return NextResponse.json(
      { error: "Dalil topilmadi." },
      { status: 404, headers: { "Cache-Control": "no-store" } },
    );
  }

  return NextResponse.redirect(link, {
    status: 303,
    headers: {
      "Cache-Control": "private, no-store",
      // Imzoli havola boshqa saytga "Referer" bilan ketmasin.
      "Referrer-Policy": "no-referrer",
    },
  });
}
