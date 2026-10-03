import type { Metadata } from "next";
import Link from "next/link";
import { LogOut, Sparkles, Bell, FileClock, PenLine, Newspaper, Palette, ChevronRight } from "lucide-react";
import { getSessionUser } from "@/lib/auth/session";
import { loadCabinet } from "@/lib/kabinet/cabinet-data";
import { StatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/button";
import { EditRequestButton } from "@/components/kabinet/edit-request-button";
import { formatDateUz } from "@/lib/utils";
import { signOut } from "@/app/kabinet/actions";
import { MehrPanel, CertificatesPanel } from "@/components/kabinet/mehr-panel";
import { ProfileStatsPanel } from "@/components/kabinet/profile-stats-panel";
import { MonthlyLinksPanel } from "@/components/kabinet/monthly-links-panel";
import { PromoCodePanel } from "@/components/kabinet/promo-code-panel";
import { CabinetHero } from "@/components/kabinet/cabinet-hero";
import { AnnualFeeCard } from "@/components/kabinet/annual-fee-card";
import { ChallengeCard, TelegramCard, VipCard } from "@/components/kabinet/status-cards";

export const metadata: Metadata = {
  title: "Shaxsiy kabinet",
  robots: { index: false, follow: false },
};

function ActionCard({
  href,
  icon,
  title,
  text,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <Link
      href={href}
      className="group flex min-h-24 items-center gap-4 rounded-3xl border border-brand-soft bg-white p-5 shadow-card transition hover:border-liderlar-blue/50"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-liderlar-blue/10 text-liderlar-blue">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-navy">{title}</span>
        <span className="block text-sm text-ink-soft">{text}</span>
      </span>
      <ChevronRight className="h-5 w-5 shrink-0 text-ink-soft transition group-hover:translate-x-0.5" aria-hidden />
    </Link>
  );
}

/**
 * SHAXSIY KABINET.
 *
 * Ma'lumot BITTA server payload'dan (`loadCabinet`, ikki parallel
 * to'lqin) — kartochkalar bazaga alohida bormaydi. Mobil birinchi:
 * kartochkalar ustma-ust, tugmalar ≥ 44px.
 */
export default async function KabinetPage() {
  const user = await getSessionUser();
  if (!user) return null; // layout allaqachon yo'naltiradi

  const data = await loadCabinet(user.id);
  const { candidate } = data;

  const botUsername = process.env.NEXT_PUBLIC_MEMBER_BOT_USERNAME?.replace(/^@/, "").trim();
  const botUrl = botUsername ? `https://t.me/${botUsername}` : null;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://liderlar.uz";

  return (
    <div className="space-y-5 sm:space-y-6">
      <CabinetHero data={data} />

      {candidate && data.annualFee && <AnnualFeeCard fee={data.annualFee} />}

      {!candidate && (
        <EmptyState
          title="Siz hali nomzod sifatida tasdiqlanmagansiz"
          description="Ariza topshiring — tahririyat ko'rib chiqib, tasdiqlagach shu yerda profilingizni kuzatasiz."
          action={
            <LinkButton href="/ariza" size="sm">
              Ariza topshirish
            </LinkButton>
          }
        />
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <VipCard vip={data.vip} history={data.vipHistory} />
        <ChallengeCard challenge={data.challenge} />
      </div>

      <PromoCodePanel
        summary={data.referral}
        applyUrl={data.referral.code ? `${siteUrl}/ariza?ref=${data.referral.code}` : ""}
      />

      {data.profileStats && <ProfileStatsPanel stats={data.profileStats} />}

      {candidate && (
        <div className="grid gap-3 md:grid-cols-2">
          <ActionCard
            href="/kabinet/profil"
            icon={<PenLine className="h-5 w-5" aria-hidden />}
            title="Profilni tahrirlash"
            text="Biografiya, ta'lim, ish tajribasi, yutuqlar, rasmlar"
          />
          <ActionCard
            href="/kabinet/profil/dizayn"
            icon={<Palette className="h-5 w-5" aria-hidden />}
            title="Premium dizaynlar"
            text="Profilingiz ko'rinishini tanlang"
          />
          <ActionCard
            href="/kabinet/maqolalar"
            icon={<Newspaper className="h-5 w-5" aria-hidden />}
            title="Maqolalarim"
            text="Liderlar Online uchun maqola yozing"
          />
          <div className="flex min-h-24 flex-col justify-center gap-2 rounded-3xl border border-brand-soft bg-white p-5 shadow-card">
            <div className="flex items-center gap-2 text-sm text-ink-soft">
              Profil holati: <StatusBadge status={candidate.status} />
            </div>
            <EditRequestButton />
          </div>
        </div>
      )}

      <CertificatesPanel data={data.mehr} />

      <div className="grid gap-5 md:grid-cols-2">
        <TelegramCard linked={data.telegram.linked} username={data.telegram.username} botUrl={botUrl} />
        {candidate && <MonthlyLinksPanel rows={data.monthlyLinks} />}
      </div>

      <MehrPanel data={data.mehr} canCreateActivity={data.mehrFlags.activityCreationEnabled} botUrl={botUrl} />

      <section className="rounded-3xl border border-brand-soft bg-white p-5 shadow-card">
        <h2 className="flex items-center gap-2 font-semibold text-navy">
          <Bell className="h-5 w-5 text-liderlar-blue" aria-hidden />
          Bildirishnomalar
        </h2>
        {data.notifications.length === 0 ? (
          <p className="mt-3 text-sm text-ink-soft">Yangi bildirishnoma yo&apos;q.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {data.notifications.map((n) => (
              <li
                key={n.id as string}
                className={`rounded-2xl border px-4 py-3 text-sm ${n.read_at ? "border-brand-soft" : "border-liderlar-blue/40 bg-liderlar-blue/5"}`}
              >
                <p className="font-semibold text-navy">{n.title as string}</p>
                {n.body && <p className="mt-0.5 text-ink-soft">{n.body as string}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>

      {candidate && data.monthlyUpdates.length > 0 && (
        <section className="rounded-3xl border border-brand-soft bg-white p-5 shadow-card">
          <h2 className="flex items-center gap-2 font-semibold text-navy">
            <FileClock className="h-5 w-5 text-liderlar-blue" aria-hidden />
            Yuborgan oylik yangilanishlar
          </h2>
          <ul className="mt-3 space-y-2">
            {data.monthlyUpdates.map((u) => (
              <li key={u.id} className="flex items-center justify-between rounded-2xl border border-brand-soft px-4 py-3 text-sm">
                <span className="text-navy">{formatDateUz(u.submitted_at ?? u.created_at)}</span>
                <StatusBadge status={u.status} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="flex flex-wrap gap-2 pb-4">
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
  );
}
