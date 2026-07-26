import type { Metadata } from "next";
import Link from "next/link";
import { LogOut, Sparkles, Bell, FileClock, UserCircle } from "lucide-react";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { StatusBadge } from "@/components/ui/badge";
import { RankingMiniCard } from "@/components/profile/ranking-mini-card";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/button";
import { EditRequestButton } from "@/components/kabinet/edit-request-button";
import { formatDateUz } from "@/lib/utils";
import { signOut } from "@/app/kabinet/actions";

export const metadata: Metadata = {
  title: "Shaxsiy kabinet",
  robots: { index: false, follow: false },
};

export default async function KabinetPage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null; // layout already redirects; satisfies type narrowing

  const admin = createAdminClient();
  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle();
  const { data: candidate } = await admin
    .from("candidates")
    .select("id, slug, status, full_name")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .maybeSingle();

  let rankingRows: {
    category: string;
    total_score: number;
    position: number | null;
    previous_position: number | null;
  }[] = [];
  let monthlyUpdates: {
    id: string;
    status: string;
    submitted_at: string | null;
    created_at: string;
  }[] = [];

  if (candidate) {
    const { data } = await admin
      .from("ranking_scores")
      .select("category, total_score, position, previous_position")
      .eq("candidate_id", candidate.id)
      .eq("is_current", true);
    rankingRows = (data ?? []).map((row) => ({ ...row, total_score: Number(row.total_score) }));

    const { data: updates } = await admin
      .from("monthly_updates")
      .select("id, status, submitted_at, created_at")
      .eq("candidate_id", candidate.id)
      .order("created_at", { ascending: false })
      .limit(10);
    monthlyUpdates = updates ?? [];
  }

  const { data: notifications } = await admin
    .from("notifications")
    .select("id, title, body, read_at, created_at, link")
    .or(`recipient_id.eq.${user.id},recipient_id.is.null`)
    .order("created_at", { ascending: false })
    .limit(8);
  const overallScore = rankingRows.find((row) => row.category === "overall")?.total_score ?? 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-navy">
            Xush kelibsiz, {profile?.full_name ?? "foydalanuvchi"}
          </h1>
          <p className="mt-1 text-ink-soft">Shaxsiy kabinetingiz — profil holati, reyting va bildirishnomalar.</p>
        </div>
        <div className="flex gap-2">
          <LinkButton href="/ai" variant="secondary" size="sm">
            <Sparkles className="h-4 w-4" aria-hidden />
            Jaxongir AI
          </LinkButton>
          <form action={signOut}>
            <button
              type="submit"
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-brand-soft px-4 text-sm font-semibold text-navy hover:border-coral hover:text-coral"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden />
              Chiqish
            </button>
          </form>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-8">
          <section className="rounded-xl border border-brand-soft bg-paper p-6 shadow-card">
            <div className="flex items-center gap-2">
              <UserCircle className="h-5 w-5 text-liderlar-blue" aria-hidden />
              <h2 className="font-display text-lg font-bold text-navy">Profil holati</h2>
            </div>
            {candidate ? (
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <StatusBadge status={candidate.status} />
                <Link href={`/liderlar/${candidate.slug}`} className="text-sm font-semibold text-liderlar-blue hover:underline">
                  Ommaviy profilni ko&apos;rish
                </Link>
                <EditRequestButton />
              </div>
            ) : (
              <EmptyState
                className="mt-4"
                title="Siz hali nomzod sifatida tasdiqlanmagansiz"
                description="Ariza topshiring — tahririyat ko'rib chiqib, tasdiqlagach shu yerda profil holatingizni kuzatib borasiz."
                action={
                  <LinkButton href="/ariza" size="sm">
                    Ariza topshirish
                  </LinkButton>
                }
              />
            )}
          </section>

          <section className="rounded-xl border border-brand-soft bg-paper p-6 shadow-card">
            <div className="flex items-center gap-2">
              <FileClock className="h-5 w-5 text-liderlar-blue" aria-hidden />
              <h2 className="font-display text-lg font-bold text-navy">Yuborgan oylik yangilanishlar</h2>
            </div>
            {monthlyUpdates.length === 0 ? (
              <p className="mt-4 text-sm text-ink-soft">Hozircha oylik yangilanish yubormagansiz.</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {monthlyUpdates.map((u) => (
                  <li key={u.id} className="flex items-center justify-between rounded-md border border-brand-soft px-4 py-3 text-sm">
                    <span className="text-navy">{formatDateUz(u.submitted_at ?? u.created_at)}</span>
                    <StatusBadge status={u.status} />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-xl border border-brand-soft bg-paper p-6 shadow-card">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-liderlar-blue" aria-hidden />
              <h2 className="font-display text-lg font-bold text-navy">Bildirishnomalar</h2>
            </div>
            {!notifications || notifications.length === 0 ? (
              <p className="mt-4 text-sm text-ink-soft">Yangi bildirishnoma yo&apos;q.</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {notifications.map((n) => (
                  <li key={n.id} className={`rounded-md border px-4 py-3 text-sm ${n.read_at ? "border-brand-soft" : "border-liderlar-blue/40 bg-liderlar-blue/5"}`}>
                    <p className="font-semibold text-navy">{n.title}</p>
                    {n.body && <p className="mt-0.5 text-ink-soft">{n.body}</p>}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside>
          {candidate ? (
            <RankingMiniCard rows={rankingRows} totalScore={overallScore} />
          ) : (
            <div className="rounded-xl border border-dashed border-brand-soft p-6 text-center text-sm text-ink-soft">
              Reyting ma&apos;lumotlari faqat tasdiqlangan nomzodlar uchun mavjud.
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
