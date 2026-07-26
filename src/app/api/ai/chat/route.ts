import { NextRequest } from "next/server";
import OpenAI from "openai";
import { randomUUID } from "node:crypto";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildSystemPrompt, type UserContext } from "@/lib/ai/system-prompt";
import { retrieveGroundingCandidates } from "@/lib/ai/retrieval";
import { checkAndIncrementRateLimit } from "@/lib/ai/rate-limit";
import { AI_DAILY_MESSAGE_LIMIT_DEFAULT } from "@/lib/constants";

export const runtime = "nodejs";

const MAX_MESSAGE_LENGTH = 2000;
const ANON_COOKIE = "liderlar_ai_anon";

function sseEvent(event: Record<string, unknown>) {
  return `data: ${JSON.stringify(event)}\n\n`;
}

export async function POST(req: NextRequest) {
  let body: { message?: unknown; sessionId?: unknown } | null = null;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Noto'g'ri so'rov formati." }, { status: 400 });
  }

  const message = typeof body?.message === "string" ? body.message.trim() : "";
  const clientSessionId = typeof body?.sessionId === "string" ? body.sessionId : null;

  if (!message) {
    return Response.json({ error: "Xabar bo'sh bo'lishi mumkin emas." }, { status: 400 });
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return Response.json(
      { error: `Xabar juda uzun. Maksimal ${MAX_MESSAGE_LENGTH} belgi.` },
      { status: 400 }
    );
  }
  if (!process.env.OPENAI_API_KEY || !process.env.OPENAI_MODEL) {
    return Response.json(
      { error: "Jaxongir AI hozircha to'liq sozlanmagan." },
      { status: 503 }
    );
  }

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const existingAnonCookie = req.cookies.get(ANON_COOKIE)?.value ?? null;
  const anonId = user ? null : existingAnonCookie ?? randomUUID();
  const identifier = user ? `user:${user.id}` : `anon:${anonId}`;

  const admin = createAdminClient();

  // ---- rate limiting -------------------------------------------------
  const { data: limitSetting } = await admin
    .from("site_settings")
    .select("value")
    .eq("key", "ai_daily_message_limit")
    .maybeSingle();
  const dailyLimit = Number(limitSetting?.value ?? AI_DAILY_MESSAGE_LIMIT_DEFAULT) || AI_DAILY_MESSAGE_LIMIT_DEFAULT;

  const rate = await checkAndIncrementRateLimit(identifier, dailyLimit, user?.id ?? null);
  if (!rate.allowed) {
    return Response.json(
      { error: "Kunlik Jaxongir AI xabar limitiga yetdingiz. Iltimos, ertaga qayta urinib ko'ring." },
      { status: 429 }
    );
  }

  // ---- user context (role-aware personalization) ---------------------
  const userContext: UserContext = { role: "guest" };
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle();

    userContext.fullName = profile?.full_name ?? null;

    const { data: roleRows } = await admin
      .from("user_roles")
      .select("role:roles(slug)")
      .eq("user_id", user.id);
    const roleSlugs = (roleRows ?? [])
      .map((row) => {
        const role = Array.isArray(row.role) ? row.role[0] : row.role;
        return role?.slug;
      })
      .filter(Boolean);
    userContext.role = roleSlugs.some((role) => role === "super_admin" || role === "admin")
      ? "admin"
      : roleSlugs.includes("editor")
        ? "editor"
        : "user";

    const { data: candidate } = await admin
      .from("candidates")
      .select("id, slug")
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .maybeSingle();

    if (candidate) {
      userContext.role = "candidate";
      userContext.candidateSlug = candidate.slug;
      const { data: scoreRow } = await admin
        .from("ranking_scores")
        .select("total_score, position")
        .eq("candidate_id", candidate.id)
        .eq("category", "overall")
        .eq("is_current", true)
        .maybeSingle();
      userContext.candidateScore = Number(scoreRow?.total_score ?? 0);
      userContext.candidateRank = scoreRow?.position ?? null;
    }
  }

  // ---- retrieval grounding --------------------------------------------
  const candidates = await retrieveGroundingCandidates(message);
  const systemPrompt = buildSystemPrompt({ candidates, userContext });

  // ---- session resolution (server-trusted; RLS intentionally excludes
  //      anon/authenticated direct access to these tables, see 0007) ----
  let sessionId = clientSessionId;
  if (sessionId && user) {
    const { data: existingSession } = await admin
      .from("ai_chat_sessions")
      .select("id, created_by")
      .eq("id", sessionId)
      .maybeSingle();

    const owns = existingSession && existingSession.created_by === user.id;

    if (!owns) sessionId = null;
  } else if (!user) {
    sessionId = null;
  }

  if (!sessionId && user) {
    const { data: newSession } = await admin
      .from("ai_chat_sessions")
      .insert({
        created_by: user.id,
        title: message.slice(0, 60),
      })
      .select("id")
      .single();
    sessionId = newSession?.id ?? null;
  }

  const { data: history } = sessionId
    ? await admin
        .from("ai_chat_messages")
        .select("role, content")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true })
        .limit(20)
    : { data: [] };

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.OPENAI_MODEL;

  const encoder = new TextEncoder();
  const sources = candidates.map((c) => ({ label: c.full_name, href: `/liderlar/${c.slug}` }));

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      controller.enqueue(encoder.encode(sseEvent({ type: "sources", sources })));
      controller.enqueue(encoder.encode(sseEvent({ type: "session", sessionId })));

      let fullText = "";
      try {
        const completion = await openai.chat.completions.create({
          model,
          // Newer reasoning-style models only support the default
          // temperature (and reject max_tokens in favor of
          // max_completion_tokens), so we deliberately omit temperature
          // rather than hardcode a value that not every OPENAI_MODEL accepts.
          max_completion_tokens: 700,
          stream: true,
          messages: [
            { role: "system", content: systemPrompt },
            ...(history ?? []).map((m) => ({
              role: m.role as "user" | "assistant" | "system",
              content: m.content,
            })),
            { role: "user", content: message },
          ],
        });

        for await (const chunk of completion) {
          const delta = chunk.choices[0]?.delta?.content ?? "";
          if (delta) {
            fullText += delta;
            controller.enqueue(encoder.encode(sseEvent({ type: "delta", text: delta })));
          }
        }
      } catch (err) {
        console.error("Jaxongir AI OpenAI error:", err);
        controller.enqueue(
          encoder.encode(
            sseEvent({
              type: "error",
              message: "Jaxongir AI hozircha javob bera olmadi. Birozdan so'ng qayta urinib ko'ring.",
            })
          )
        );
        controller.close();
        return;
      }

      if (sessionId) {
        await admin.from("ai_chat_messages").insert([
          { session_id: sessionId, role: "user", content: message },
          { session_id: sessionId, role: "assistant", content: fullText },
        ]);
      }

      controller.enqueue(encoder.encode(sseEvent({ type: "done" })));
      controller.close();
    },
  });

  const headers = new Headers({
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
  });

  if (!user && !existingAnonCookie && anonId) {
    headers.append(
      "Set-Cookie",
      `${ANON_COOKIE}=${anonId}; Path=/; Max-Age=${60 * 60 * 24 * 180}; SameSite=Lax`
    );
  }

  return new Response(stream, { headers });
}
