import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { recordAudit } from "@/lib/vip/audit-log";
import { requireEntitlement } from "@/lib/vip/entitlement-service";
import { resolveOwnCandidate } from "./edit-service";

/**
 * IQTIBOSLAR — VIP A'ZO O'ZI TAKLIF QILADI, TAHRIRIYAT CHOP ETADI.
 *
 * Biografiyada faqat `status = 'published'` iqtiboslar ko'rinadi. A'zo
 * yozgani `draft` bo'lib tushadi va admin panelidagi "Iqtiboslar"
 * bo'limida tasdiqlanadi — ya'ni mavjud moderatsiya yo'li, yangi
 * jadval yoki holat yaratilmaydi.
 *
 * A'zo faqat O'Z nomzodining iqtiboslarini ko'radi va faqat
 * QORALAMASINI o'chira oladi (chop etilganini — tahririyat).
 */

export interface OwnQuote {
  id: string;
  text: string;
  status: "draft" | "published";
  createdAt: string;
}

export const QUOTE_MIN = 5;
export const QUOTE_MAX = 1000;
/** Bir vaqtda ko'rikda turishi mumkin bo'lgan qoralamalar. */
const MAX_DRAFTS = 10;

export async function loadOwnQuotes(candidateId: string): Promise<OwnQuote[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("quotes")
    .select("id, text, status, created_at")
    .eq("candidate_id", candidateId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) {
    console.error("[profil] iqtiboslar o'qilmadi:", error.message);
    return [];
  }
  return (data ?? []).map((q) => ({
    id: q.id as string,
    text: q.text as string,
    status: q.status as OwnQuote["status"],
    createdAt: q.created_at as string,
  }));
}

export async function submitQuote(text: string): Promise<{ ok: boolean; message: string }> {
  const entitled = await requireEntitlement("profile.self_edit");
  if (!entitled.ok) return { ok: false, message: entitled.error };

  const resolved = await resolveOwnCandidate();
  if (!resolved.ok) return { ok: false, message: resolved.error };

  const clean = (text ?? "").trim().replace(/\s+/g, " ");
  if (clean.length < QUOTE_MIN) return { ok: false, message: `Iqtibos kamida ${QUOTE_MIN} belgi bo'lsin.` };
  if (clean.length > QUOTE_MAX) return { ok: false, message: `Iqtibos ${QUOTE_MAX} belgidan oshmasin.` };

  const { candidateId, profileId } = resolved.owned;
  const admin = createAdminClient();

  const { count } = await admin
    .from("quotes")
    .select("id", { count: "exact", head: true })
    .eq("candidate_id", candidateId)
    .eq("status", "draft");
  if ((count ?? 0) >= MAX_DRAFTS) {
    return { ok: false, message: "Tekshiruvda iqtiboslar ko'p. Avvalgilari ko'rib chiqilishini kuting." };
  }

  const { data: candidate } = await admin.from("candidates").select("full_name").eq("id", candidateId).maybeSingle();

  // `status` SERVERDA qat'iy 'draft' — a'zo o'zi chop eta olmaydi.
  const { data, error } = await admin
    .from("quotes")
    .insert({ candidate_id: candidateId, text: clean, author_name: candidate?.full_name ?? null, status: "draft" })
    .select("id")
    .single();
  if (error || !data) {
    console.error("[profil] iqtibos yozilmadi:", error?.message);
    return { ok: false, message: "Iqtibosni saqlab bo'lmadi." };
  }

  await recordAudit("profile.entry.created", {
    actorId: profileId,
    entityId: candidateId,
    metadata: { kind: "quotes", entry_id: data.id as string, review: true },
  });
  return { ok: true, message: "Iqtibos tahririyat tekshiruviga yuborildi." };
}

export async function deleteOwnQuote(quoteId: string): Promise<{ ok: boolean; message: string }> {
  const entitled = await requireEntitlement("profile.self_edit");
  if (!entitled.ok) return { ok: false, message: entitled.error };

  const resolved = await resolveOwnCandidate();
  if (!resolved.ok) return { ok: false, message: resolved.error };
  const { candidateId, profileId } = resolved.owned;

  // Faqat O'Z nomzodining QORALAMASI — shart bazaga yozishda.
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("quotes")
    .delete()
    .eq("id", quoteId)
    .eq("candidate_id", candidateId)
    .eq("status", "draft")
    .select("id")
    .maybeSingle();
  if (error) return { ok: false, message: "O'chirib bo'lmadi." };
  if (!data) return { ok: false, message: "Faqat tekshiruvdagi iqtibosni o'chirish mumkin." };

  await recordAudit("profile.entry.deleted", {
    actorId: profileId,
    entityId: candidateId,
    metadata: { kind: "quotes", entry_id: quoteId },
  });
  return { ok: true, message: "Iqtibos o'chirildi." };
}
