import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

type AnonymousWindow = { date: string; count: number };
const anonymousWindows = new Map<string, AnonymousWindow>();

/**
 * Authenticated usage is counted from persisted chat messages. Anonymous
 * usage has no database session in the shared admin schema, so it is bounded
 * per server process and browser cookie.
 */
export async function checkAndIncrementRateLimit(
  identifier: string,
  dailyLimit: number,
  userId: string | null
) {
  const admin = createAdminClient();
  const windowStart = new Date();
  windowStart.setUTCHours(0, 0, 0, 0);
  const windowStartIso = windowStart.toISOString();

  if (userId) {
    const { count, error } = await admin
      .from("ai_chat_messages")
      .select("id, session:ai_chat_sessions!inner(created_by)", { count: "exact", head: true })
      .eq("role", "user")
      .eq("session.created_by", userId)
      .gte("created_at", windowStartIso);
    if (!error) {
      const used = count ?? 0;
      return {
        allowed: used < dailyLimit,
        remaining: Math.max(0, dailyLimit - used - 1),
      };
    }
  }

  const date = windowStartIso.slice(0, 10);
  const existing = anonymousWindows.get(identifier);
  const used = existing?.date === date ? existing.count : 0;
  if (used >= dailyLimit) return { allowed: false, remaining: 0 };
  anonymousWindows.set(identifier, { date, count: used + 1 });
  return { allowed: true, remaining: dailyLimit - used - 1 };
}
