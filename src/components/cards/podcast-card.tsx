import Image from "next/image";
import Link from "next/link";
import { CalendarDays, MapPin, Radio } from "lucide-react";
import type { PodcastCardData } from "@/lib/types";
import { StatusBadge } from "@/components/ui/badge";
import { formatDateTimeUz, gradientFor } from "@/lib/utils";

export function PodcastCard({ podcast }: { podcast: PodcastCardData }) {
  const gradient = gradientFor(podcast.slug);

  return (
    <Link
      href={`/podcastlar/${podcast.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-brand-soft bg-paper shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-card-hover"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        {podcast.banner_url ? (
          <Image
            src={podcast.banner_url}
            alt={podcast.title}
            fill
            sizes="(max-width: 640px) 100vw, 360px"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className={`flex h-full w-full items-center justify-center ${gradient}`}>
            <Radio className="h-10 w-10 text-white/80" aria-hidden />
          </div>
        )}
        <div className="absolute right-3 top-3">
          <StatusBadge status={podcast.status} />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="font-display text-xl font-semibold leading-none text-navy">{podcast.title}</h3>
        <div className="mt-auto space-y-1.5 pt-2 text-xs text-ink-soft">
          <p className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" aria-hidden />
            {podcast.starts_at ? formatDateTimeUz(podcast.starts_at) : "Sana belgilanmagan"}
          </p>
          {(podcast.location || podcast.online_url) && (
            <p className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" aria-hidden />
              {podcast.location ?? "Onlayn"}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
