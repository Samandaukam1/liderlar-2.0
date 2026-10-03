import type { Metadata } from "next";
import Link from "next/link";
import { LogOut, Sparkles, Bell, FileClock, UserCircle } from "lucide-react";
import { getSessionUser } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { StatusBadge } from "@/components/ui/badge";
import { RankingMiniCard } from "@/components/profile/ranking-mini-card";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/button";
import { EditRequestButton } from "@/components/kabinet/edit-request-button";
import { formatDateUz } from "@/lib/utils";
import { signOut } from "@/app/kabinet/actions";
import { MehrPanel, CertificatesPanel } from "@/components/kabinet/mehr-panel";
import { loadMemberMehrData } from "@/lib/mehr/member-data";
import { getMehrFlags } from "@/lib/mehr/flags";
import { loadProfileStats } from "@/lib/analytics/profile-stats";
import { ProfileStatsPanel } from "@/components/kabinet/profile-stats-panel";
import { MonthlyLinksPanel } from "@/components/kabinet/monthly-links-panel";
import { loadMonthlyLinks } from "@/lib/monthly/link-data";
import { loadReferralSummary } from "@/lib/referral/member-data";
import { PromoCodePanel } from "@/components/kabinet/promo-code-panel";

export const metadata: Metadata = {
  title: "Shaxsiy kabinet",
  robots: { index: false, follow: false },
};

export default async function KabinetPage() {
  const user = await getSessionUser();
  if (!user) return null; // layout already redirects; satisfies type narrowing

  const admin = createAdminClient();

  /*
   * IKKI TO'LQIN, KETMA-KET ZANJIR EMAS.
   *
   * Avval ~10 ta so'rov birin-ketin kutilardi (har biri bazagacha
   * borib-kelish) va login vaqtining asosiy qismi shu edi. Endi:
   *   1-to'lqin: nomzodga bog'liq bo'lmaganlar + nomzodning o'zi;
   *   2-to'lqin: nomzod id siga bog'liqlar.
   * Profil va nomzod id si SERVERDA tekshirilgan sessiyadan olinadi.
   */
  const [{ data: profile }, { data: candidate }, { data: notifications }, mehr, mehrFlags] =
    await Promise.all([
      admin.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
      admin
        .from("candidates")
        .select("id, slug, status, full_name")
        .eq("user_id", user.id)
        .is("deleted_at", null)
        .maybeSingle(),
      admin
        .from("notifications")
        .select("id, title, body, read_at, created_at, link")
        .or(`recipient_id.eq.${user.id},recipient_id.is.null`)
        .order("created_at", { ascending: false })
        .limit(8),
      /*
       * MEHR ma'lumoti NOMZODGA EMAS, PROFILGA bog'langan: hisobi bor
       * har bir a'zo qatnashadi.
       */
      loadMemberMehrData(user.id),
      getMehrFlags(),
    ]);

  const [rankingRes, updatesRes, profileStats, monthlyLinks, referral] = await Promise.all([
    candidate
      ? admin
          .from("ranking_scores")
          .select("category, total_score, position, previous_position")
          .eq("candidate_id", candidate.id)
          .eq("is_current", true)
      : Promise.resolve({ data: [] as never[] }),
    candidate
      ? admin
          .from("monthly_updates")
          .select("id, status, submitted_at, created_at")
          .eq("candidate_id", candidate.id)
          .order("created_at", { ascending: false })
          .limit(10)
      : Promise.resolve({ data: [] as never[] }),
    // Ko'rsatkichlar va oylik havolalar NOMZODGA bog'langan.
    candidate ? loadProfileStats(candidate.id) : Promise.resolve(null),
    candidate ? loadMonthlyLinks(candidate.id) : Promise.resolve([]),
    // Tavsiya kodi PROFILGA bog'langan (§75): har bir akkauntda bo'ladi.
    loadReferralSummary(user.id, profile?.full_name ?? null),
  ]);

  const rankingRows: {
    category: string;
    total_score: number;
    position: number | null;
    previous_position: number | null;
  }[] = ((rankingRes.data ?? []) as {
    category: string;
    total_score: number | string;
    position: number | null;
    previous_position: number | null;
  }[]).map((row) => ({ ...row, total_score: Number(row.total_score) }));
  const monthlyUpdates = (updatesRes.data ?? []) as {
    id: string;
    status: string;
    submitted_at: string | null;
    created_at: string;
  }[];

  /*
   * Bot havolasi sozlamadan quriladi — kodda qotirilmaydi.
   * Bot nomi o'zgarsa, havola ham o'zi o'zgaradi.
   */
  const botUsername = process.env.NEXT_PUBLIC_MEMBER_BOT_USERNAME?.replace(/^@/, "").trim();
  const botUrl = botUsername ? `https://t.me/${botUsername}` : null;
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

          {profileStats && <ProfileStatsPanel stats={profileStats} />}

          {candidate && <MonthlyLinksPanel rows={monthlyLinks} />}

          {/*
            PROFIL MUHARRIRI HAVOLASI.

            Faqat nomzod profili BOR odamda ko'rinadi: profilsiz
            odamni muharrirga yuborish uni "profilingiz yo'q" degan
            xabarga olib borardi.

            Huquq SAHIFADA tekshiriladi, bu yerda emas: havolani
            butunlay yashirish obunasi yo'q odamni imkoniyat
            borligidan ham bexabar qoldirardi.
          */}
          {candidate && (
            <section className="rounded-lg border border-brand-soft bg-white p-5">
              <h3 className="font-semibold text-navy">Profilni tahrirlash</h3>
              <p className="mt-1 text-sm text-ink-soft">
                Ta&apos;lim, ish tajribasi, yutuqlar va aloqa ma&apos;lumotlaringizni
                o&apos;zingiz yangilang.
              </p>
              <LinkButton href="/kabinet/profil" className="mt-3" size="sm">
                Muharrirni ochish
              </LinkButton>
            </section>
          )}

          {/*
            MAQOLALAR HAVOLASI.

            Nomzod profili bor odamda ko'rinadi. Huquq sahifada
            tekshiriladi — havolani yashirish obunasi yo'q odamni
            imkoniyat borligidan bexabar qoldirardi.
          */}
          {candidate && (
            <section className="rounded-lg border border-brand-soft bg-white p-5">
              <h3 className="font-semibold text-navy">Maqolalarim</h3>
              <p className="mt-1 text-sm text-ink-soft">
                Maqola yozing — tasdiqlangandan keyin Liderlar Online
                bo&apos;limida chiqadi.
              </p>
              <LinkButton href="/kabinet/maqolalar" className="mt-3" size="sm">
                Maqolalarga o&apos;tish
              </LinkButton>
            </section>
          )}

          <PromoCodePanel
            summary={referral}
            applyUrl={
              referral.code
                ? `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://liderlar.uz"}/ariza?ref=${referral.code}`
                : ""
            }
          />

          <MehrPanel
            data={mehr}
            canCreateActivity={mehrFlags.activityCreationEnabled}
            botUrl={botUrl}
          />

          <CertificatesPanel data={mehr} />

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
