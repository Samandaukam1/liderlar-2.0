import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeCode, CERTIFICATE_ROLE_LABEL } from "./certificate-code";

/**
 * Ommaviy sertifikat tekshiruvi (§13).
 *
 * NIMA KO'RSATILADI VA NIMA KO'RSATILMAYDI.
 *
 * Tekshiruvchi uchun kerak: sertifikat haqiqiymi, kim oldi,
 * qaysi ish uchun, qachon. Kerak EMAS: telefon, e-pochta,
 * Telegram, tadbir koordinatalari, boshqa ishtirokchilar.
 *
 * Shuning uchun ustunlar atma-ati sanaladi va natija
 * tayyor, tor shaklda qaytariladi — chaqiruvchi "ortiqcha
 * maydon bor ekan" deb ko'rsatib qo'ya olmaydi.
 */

export type VerificationState = "valid" | "revoked" | "not_found";

export interface CertificateVerification {
  state: VerificationState;
  code: string;
  recipientName: string | null;
  roleLabel: string | null;
  activityTitle: string | null;
  activitySlug: string | null;
  activityDate: string | null;
  regionName: string | null;
  issuedAt: string | null;
  points: number | null;
  revokedReason: string | null;
}

export async function verifyCertificate(rawCode: string): Promise<CertificateVerification> {
  const code = normalizeCode(rawCode);

  const notFound: CertificateVerification = {
    state: "not_found",
    code: rawCode.trim().slice(0, 40),
    recipientName: null,
    roleLabel: null,
    activityTitle: null,
    activitySlug: null,
    activityDate: null,
    regionName: null,
    issuedAt: null,
    points: null,
    revokedReason: null,
  };

  if (!code) return notFound;

  const db = createAdminClient();

  const { data, error } = await db
    .from("certificates")
    .select(
      "code, role, status, issued_at, revoked_reason, recipient_profile_id, activity_id, " +
        "profiles(full_name), " +
        "mehr_activities(title, slug, starts_at, regions(name))",
    )
    .eq("code", code)
    .maybeSingle();

  if (error) {
    console.error("CERTIFICATE_VERIFY_FAILED", { code: error.code, message: error.message });
    return notFound;
  }
  if (!data) return notFound;

  const row = data as unknown as {
    code: string;
    role: string | null;
    status: string;
    issued_at: string;
    revoked_reason: string | null;
    recipient_profile_id: string;
    activity_id: string | null;
    profiles: { full_name?: string } | null;
    mehr_activities: {
      title?: string;
      slug?: string | null;
      starts_at?: string | null;
      regions?: { name?: string } | null;
    } | null;
  };

  /*
   * BALL DAFTARDAN O'QILADI, sertifikatdan emas.
   *
   * Sertifikatda ball saqlanmaydi — agar saqlansa, keyin
   * teskari yozuv qilinganda ikkisi bir-biriga zid bo'lib
   * qolardi. Yagona haqiqat manbai — daftar.
   */
  let points: number | null = null;
  if (row.activity_id) {
    const { data: ledger } = await db
      .from("point_ledger")
      .select("points")
      .eq("profile_id", row.recipient_profile_id)
      .eq("source_id", row.activity_id);

    const rows = (ledger ?? []) as { points: number }[];
    if (rows.length > 0) points = rows.reduce((sum, r) => sum + Number(r.points), 0);
  }

  return {
    state: row.status === "revoked" ? "revoked" : "valid",
    code: row.code,
    recipientName: row.profiles?.full_name?.trim() || null,
    roleLabel: row.role ? (CERTIFICATE_ROLE_LABEL[row.role] ?? row.role) : null,
    activityTitle: row.mehr_activities?.title ?? null,
    activitySlug: row.mehr_activities?.slug ?? null,
    activityDate: row.mehr_activities?.starts_at ?? null,
    regionName: row.mehr_activities?.regions?.name ?? null,
    issuedAt: row.issued_at,
    points,
    revokedReason: row.status === "revoked" ? row.revoked_reason : null,
  };
}
