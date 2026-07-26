import { NextRequest, NextResponse } from "next/server";
import { randomUUID, createHash } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

const COOKIE = "liderlar_viewer_id";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const candidateSlug = typeof body?.candidateSlug === "string" ? body.candidateSlug : null;
  if (!candidateSlug) {
    return NextResponse.json({ error: "candidateSlug talab qilinadi." }, { status: 400 });
  }

  const existingViewerId = req.cookies.get(COOKIE)?.value;
  const viewerId = existingViewerId ?? randomUUID();
  const viewerHash = createHash("sha256").update(viewerId).digest("hex");

  const admin = createAdminClient();
  const { data, error } = await admin.rpc("record_profile_view", {
    p_candidate_slug: candidateSlug,
    p_viewer_hash: viewerHash,
  });

  const res = NextResponse.json({ counted: Boolean(data), error: error?.message ?? null });
  if (!existingViewerId) {
    res.cookies.set(COOKIE, viewerId, {
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
      sameSite: "lax",
    });
  }
  return res;
}
