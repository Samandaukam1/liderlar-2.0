import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { can, isFeatureEnabled } from "@/lib/vip/entitlement-service";
import { canDownload, journalAccess } from "@/lib/journal/access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/jurnal/<son>/pdf
 *
 * Jurnal PDF'iga yo'naltiradi.
 *
 * NEGA MARSHRUT, HTML'DAGI HAVOLA EMAS:
 *
 * Avval imzolangan havola sahifa yuklanishida yasalib, HTML ichiga
 * tushardi — ya'ni huquqi yo'q odam ham sahifa manbasidan havolani
 * olib, PDF'ni yuklab olishi mumkin edi. Marshrut esa havolani
 * FAQAT tekshiruvdan keyin yasaydi va u hech qachon sahifaga
 * tushmaydi.
 *
 * Imzolangan havolaning muddati qisqa (10 daqiqa): u ulashilsa ham
 * uzoq ishlamasligi kerak.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ issue: string }> },
) {
  const { issue } = await params;

  const issueNumber = Number(issue);
  if (!Number.isInteger(issueNumber) || issueNumber <= 0) {
    return NextResponse.json({ error: "Son noto'g'ri." }, { status: 400 });
  }

  const [gatingEnabled, hasEntitlement] = await Promise.all([
    isFeatureEnabled("vip.magazine_enabled"),
    can("magazine.subscription"),
  ]);

  const access = journalAccess({ gatingEnabled, hasEntitlement });

  if (!canDownload(access)) {
    /*
     * 403 VA TUSHUNARLI MATN.
     *
     * Yo'naltirish o'rniga xato qaytariladi: brauzer PDF kutib
     * turgan joyda sahifaga yo'naltirish chalkash bo'lardi.
     */
    return NextResponse.json(
      { error: "Bu son Liderlar VIP obunasi bilan ochiladi." },
      { status: 403 },
    );
  }

  const admin = createAdminClient();

  const { data: journal, error } = await admin
    .from("journals")
    .select("pdf_url")
    .eq("issue_number", issueNumber)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    console.error("[jurnal] son o'qilmadi:", error.message);
    return NextResponse.json({ error: "Hozir ochib bo'lmadi." }, { status: 500 });
  }

  const pdfUrl = journal?.pdf_url as string | null | undefined;
  if (!pdfUrl) {
    return NextResponse.json({ error: "Bu sonda PDF yo'q." }, { status: 404 });
  }

  /*
   * TASHQI HAVOLA BO'LSA — O'ZI.
   *
   * Eski sonlarning PDF'i tashqi manzilda bo'lishi mumkin va ularni
   * imzolashга urinish xato berardi.
   */
  if (/^https?:\/\//i.test(pdfUrl)) {
    return NextResponse.redirect(pdfUrl);
  }

  const path = pdfUrl.replace(/^journal-pdfs\//, "");
  const { data: signed, error: signError } = await admin.storage
    .from("journal-pdfs")
    .createSignedUrl(path, 600);

  if (signError || !signed?.signedUrl) {
    console.error("[jurnal] havola yasalmadi:", signError?.message);
    return NextResponse.json({ error: "Hozir ochib bo'lmadi." }, { status: 500 });
  }

  return NextResponse.redirect(signed.signedUrl);
}
