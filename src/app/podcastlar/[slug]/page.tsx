import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, MapPin, Users, Video, Radio as RadioIcon } from "lucide-react";
import { getPodcastBySlug } from "@/lib/data/podcasts";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { StatusBadge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { formatDateTimeUz, gradientFor } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const podcast = await getPodcastBySlug(slug).catch(() => null);
  if (!podcast) return { title: "Podcast topilmadi" };
  return {
    title: podcast.title,
    description: podcast.description ?? undefined,
    openGraph: { images: podcast.banner_url ? [{ url: podcast.banner_url }] : undefined },
  };
}

export default async function PodcastDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const podcast = await getPodcastBySlug(slug).catch(() => null);
  if (!podcast) notFound();

  const gradient = gradientFor(podcast.slug);
  const canJoin = ["announced", "live"].includes(podcast.status) && podcast.online_url;
  const isDone = ["recorded", "published"].includes(podcast.status);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ label: "Podcastlar", href: "/podcastlar" }, { label: podcast.title }]} />

      <div className={`relative mt-6 aspect-[16/8] w-full overflow-hidden rounded-2xl ${gradient}`}>
        {podcast.banner_url ? (
          <Image src={podcast.banner_url} alt={podcast.title} fill sizes="800px" className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <RadioIcon className="h-14 w-14 text-white/80" aria-hidden />
          </div>
        )}
        <div className="absolute right-4 top-4">
          <StatusBadge status={podcast.status} />
        </div>
      </div>

      <div className="mt-6">
        <h1 className="font-display text-3xl font-bold text-navy sm:text-4xl">{podcast.title}</h1>
        {podcast.description && <p className="prose-article mt-4 leading-relaxed text-ink-soft">{podcast.description}</p>}
      </div>

      <div className="mt-8 grid gap-4 rounded-xl border border-brand-soft bg-paper p-6 shadow-card sm:grid-cols-2">
        <div className="flex items-start gap-3">
          <CalendarDays className="mt-0.5 h-5 w-5 text-liderlar-blue" aria-hidden />
          <div>
            <p className="text-sm font-semibold text-navy">Sana va vaqt</p>
            <p className="text-sm text-ink-soft">
              {podcast.starts_at ? formatDateTimeUz(podcast.starts_at) : "Belgilanmagan"}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <MapPin className="mt-0.5 h-5 w-5 text-liderlar-blue" aria-hidden />
          <div>
            <p className="text-sm font-semibold text-navy">Joy</p>
            <p className="text-sm text-ink-soft">{podcast.location ?? (podcast.online_url ? "Onlayn" : "Belgilanmagan")}</p>
          </div>
        </div>
        {podcast.host_name && (
          <div className="flex items-start gap-3">
            <Users className="mt-0.5 h-5 w-5 text-liderlar-blue" aria-hidden />
            <div>
              <p className="text-sm font-semibold text-navy">Boshlovchi</p>
              <p className="text-sm text-ink-soft">{podcast.host_name}</p>
            </div>
          </div>
        )}
        {podcast.registration_limit && (
          <div className="flex items-start gap-3">
            <Users className="mt-0.5 h-5 w-5 text-liderlar-blue" aria-hidden />
            <div>
              <p className="text-sm font-semibold text-navy">Sig&apos;im</p>
              <p className="text-sm text-ink-soft">{podcast.registration_limit} ishtirokchigacha</p>
            </div>
          </div>
        )}
      </div>

      {podcast.guests?.length > 0 && (
        <div className="mt-8">
          <h2 className="font-display text-xl font-bold text-navy">Mehmonlar</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {podcast.guests.map((g) => {
              const candidate = Array.isArray(g.candidate) ? g.candidate[0] : g.candidate;
              const label = candidate?.full_name ?? g.guest_name;
              const content = (
                <div className="flex items-center gap-2 rounded-full border border-brand-soft bg-paper px-3 py-2 text-sm">
                  <span className="font-semibold text-navy">{label}</span>
                  {g.role && <span className="text-ink-soft">— {g.role}</span>}
                </div>
              );
              return candidate ? (
                <Link key={g.id} href={`/liderlar/${candidate.slug}`}>
                  {content}
                </Link>
              ) : (
                <div key={g.id}>{content}</div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-10 flex flex-wrap gap-3">
        {canJoin && (
          <LinkButton href={podcast.online_url!} target="_blank" rel="noopener noreferrer" size="lg">
            Onlayn qatnashish
          </LinkButton>
        )}
        {isDone && podcast.media_url && (
          <LinkButton href={podcast.media_url} target="_blank" rel="noopener noreferrer" variant="secondary" size="lg">
            <Video className="h-4 w-4" aria-hidden />
            Yozuvni ko&apos;rish
          </LinkButton>
        )}
      </div>
    </div>
  );
}
