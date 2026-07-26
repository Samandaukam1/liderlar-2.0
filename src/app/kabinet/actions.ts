"use server";

import { redirect } from "next/navigation";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function signOut() {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  redirect("/");
}

export type EditRequestResult = { ok: true } | { ok: false; error: string };

export async function requestEdit(note: string): Promise<EditRequestResult> {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Tizimga kirmagansiz." };

  const admin = createAdminClient();
  const { data: candidate } = await admin
    .from("candidates")
    .select("id")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .maybeSingle();
  if (!candidate) return { ok: false, error: "Nomzod profili topilmadi." };

  // Ownership already verified above via the RLS-scoped client; the insert
  // itself uses the service role because audit_logs has no client-facing
  // insert policy (see 0008) — it is meant to be written only by trusted
  // server code / triggers, never directly by a browser client.
  const { error } = await admin.from("audit_logs").insert({
    actor_id: user.id,
    action: "profile_edit_request",
    entity_type: "candidates",
    entity_id: candidate.id,
    reason: note,
  });

  if (error) {
    return { ok: false, error: "So'rovni yuborishda xatolik yuz berdi." };
  }
  return { ok: true };
}
