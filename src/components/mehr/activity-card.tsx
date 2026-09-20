import Link from "next/link";
import Image from "next/image";
import { MapPin, Users, HeartHandshake } from "lucide-react";
import { MEHR_COLORS } from "@/lib/mehr/brand";
import { formatDateUz } from "@/lib/utils";
import type { PublicActivityCard } from "@/lib/mehr/public-types";

/**
 * Ezgulik ishi kartasi.
 *
 * Kartada FAQAT ommaviy maydonlar: nom, muqova, hudud,
 * tashkilotchi, sana, ishtirokchi va nafi tekkanlar soni.
 *
 * Aniq koordinata, dalil fayllari, tekshiruv izohlari va
 * xavf belgilari bu yerga UMUMAN kelmaydi — ular ma'lumot
 * qatlamida ham so'ralmaydi.
 */
export function ActivityCard({ activity }: { activity: PublicActivityCard }) {
  const href = activity.slug
    ? `/mehr365/ezgulik-ishlari/${activity.slug}`
    : `/mehr365/ezgulik-ishlari/${activity.id}`;

  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-2xl border bg-white transition hover:shadow-lg"
      style={{ borderColor: MEHR_COLORS.border }}
    >
      <div className="relative aspect-[16/10] overflow-hidden" style={{ background: MEHR_COLORS.surfaceSoft }}>
        {activity.coverImageUrl ? (
          <Image
            src={activity.coverImageUrl}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center" aria-hidden>
            <HeartHandshake className="h-10 w-10" style={{ color: MEHR_COLORS.border }} />
          </div>
        )}

        {activity.categoryName && (
          <span
            className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur"
            style={{ background: "rgba(15,43,61,0.65)" }}
          >
            {activity.categoryName}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3
          className="font-display text-base font-bold leading-snug"
          style={{ color: MEHR_COLORS.ink }}
        >
          {activity.title}
        </h3>

        <p className="mt-1.5 text-xs" style={{ color: MEHR_COLORS.inkSoft }}>
          {activity.organizerName ?? "Tashkilotchi ko'rsatilmagan"}
          {activity.startsAt ? ` · ${formatDateUz(activity.startsAt)}` : ""}
        </p>

        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-4 text-xs" style={{ color: MEHR_COLORS.inkSoft }}>
          {activity.regionName && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" aria-hidden />
              {activity.regionName}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5" aria-hidden />
            {activity.participantCount} ishtirokchi
          </span>
          {activity.beneficiaryCount !== null && activity.beneficiaryCount > 0 && (
            <span className="inline-flex items-center gap-1">
              <HeartHandshake className="h-3.5 w-3.5" aria-hidden />
              {activity.beneficiaryCount} nafarga yordam
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
