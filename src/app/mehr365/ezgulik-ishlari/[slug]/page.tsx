import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { MapPin, Users, HeartHandshake, CalendarDays, BadgeCheck } from "lucide-react";
import { getMehrFlags } from "@/lib/mehr/flags";
import { loadPublicActivity } from "@/lib/mehr/public-stats";
import { MEHR_COLORS, MEHR_ROLE_LABEL } from "@/lib/mehr/brand";
import { MehrClosed } from "@/components/mehr/mehr-closed";
import { formatDateUz } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const activity = await loadPublicActivity(decodeURIComponent(slug));

  if (!activity) return { title: "Topilmadi — MEHR 365+" };

  return {
    title: `${activity.title} — MEHR 365+`,
    description:
      activity.purpose?.slice(0, 160) ??
      activity.description?.slice(0, 160) ??
      "Tasdiqlangan ezgulik ishi.",
    alternates: { canonical: `/mehr365/ezgulik-ishlari/${activity.slug ?? activity.id}` },
    openGraph: {
      title: activity.title,
      description: activity.purpose ?? undefined,
      images: activity.coverImageUrl ? [activity.coverImageUrl] : undefined,
      type: "article",
    },
  };
}

/**
 * Ezgulik ishining ommaviy sahifasi.
 *
 * KO'RSATILMAYDI: aniq koordinata, ichki izohlar, tekshiruv
 * yozishmalari, xavf belgilari, ishtirokchilarning telefon
 * yoki email ma'lumotlari. Ular ma'lumot qatlamida ham
 * so'ralmaydi — ya'ni bu yerda "unutib qoldirish" mumkin emas.
 */
export default async function ActivityDetailPage({ params }: Props) {
  const flags = await getMehrFlags();
  if (!flags.publicEnabled) return <MehrClosed />;

  const { slug } = await params;
  const activity = await loadPublicActivity(decodeURIComponent(slug));
  if (!activity) notFound();

  return (
    <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <Link
        href="/mehr365/ezgulik-ishlari"
        className="text-sm font-semibold"
        style={{ color: MEHR_COLORS.blue }}
      >
        ← Ezgulik ishlari
      </Link>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold text-white"
          style={{ background: MEHR_COLORS.green }}
        >
          <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
          Tasdiqlangan
        </span>
        {activity.categoryName && (
          <span
            className="rounded-full border px-3 py-1 text-xs font-semibold"
            style={{ borderColor: MEHR_COLORS.border, color: MEHR_COLORS.inkSoft }}
          >
            {activity.categoryName}
          </span>
        )}
      </div>

      <h1
        className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl"
        style={{ color: MEHR_COLORS.ink }}
      >
        {activity.title}
      </h1>

      <div
        className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm"
        style={{ color: MEHR_COLORS.inkSoft }}
      >
        {activity.startsAt && (
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4" aria-hidden />
            {formatDateUz(activity.startsAt)}
          </span>
        )}
        {activity.regionName && (
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-4 w-4" aria-hidden />
            {activity.regionName}
            {activity.locationName ? `, ${activity.locationName}` : ""}
          </span>
        )}
        <span className="inline-flex items-center gap-1.5">
          <Users className="h-4 w-4" aria-hidden />
          {activity.participantCount} ishtirokchi
        </span>
        {activity.beneficiaryCount !== null && activity.beneficiaryCount > 0 && (
          <span className="inline-flex items-center gap-1.5">
            <HeartHandshake className="h-4 w-4" aria-hidden />
            {activity.beneficiaryCount} nafarga yordam
          </span>
        )}
      </div>

      {activity.coverImageUrl && (
        <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl">
          <Image
            src={activity.coverImageUrl}
            alt=""
            fill
            sizes="(max-width: 896px) 100vw, 896px"
            className="object-cover"
            priority
          />
        </div>
      )}

      {activity.purpose && (
        <Section title="Maqsad">
          <p>{activity.purpose}</p>
        </Section>
      )}

      {activity.description && (
        <Section title="Nima qilindi">
          <p className="whitespace-pre-line">{activity.description}</p>
        </Section>
      )}

      {activity.resultSummary && (
        <Section title="Natija">
          <p className="whitespace-pre-line">{activity.resultSummary}</p>
        </Section>
      )}

      {activity.media.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-xl font-bold" style={{ color: MEHR_COLORS.ink }}>
            Suratlar
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {activity.media.map((m, i) => (
              <div key={m.url} className="relative aspect-[4/3] overflow-hidden rounded-xl">
                <Image
                  src={m.url}
                  alt={m.caption ?? ""}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover"
                  loading={i < 2 ? "eager" : "lazy"}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ---------- ODAMLAR ---------- */}
      <section className="mt-12">
        <h2 className="font-display text-xl font-bold" style={{ color: MEHR_COLORS.ink }}>
          Tashkilotchi va ishtirokchilar
        </h2>

        <div className="mt-4 flex flex-wrap gap-2">
          <PersonChip
            name={activity.organizerName}
            avatarUrl={activity.organizerAvatarUrl}
            slug={activity.organizerSlug}
            role="organizer"
            highlight
          />

          {activity.participants
            .filter((p) => p.role !== "organizer")
            .map((p) => (
              <PersonChip
                key={p.profileId}
                name={p.fullName}
                avatarUrl={p.avatarUrl}
                slug={p.candidateSlug}
                role={p.role}
              />
            ))}
        </div>
      </section>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-xl font-bold" style={{ color: MEHR_COLORS.ink }}>
        {title}
      </h2>
      <div
        className="mt-2 text-base leading-relaxed"
        style={{ color: MEHR_COLORS.inkSoft }}
      >
        {children}
      </div>
    </section>
  );
}

/**
 * Odam belgisi.
 *
 * Ensiklopediya profili BO'LSA havola beriladi; bo'lmasa —
 * oddiy matn. Yangi ommaviy biografiya sahifasi
 * YARATILMAYDI: u mavjud profilning dublikati bo'lardi.
 */
function PersonChip({
  name,
  avatarUrl,
  slug,
  role,
  highlight,
}: {
  name: string | null;
  avatarUrl: string | null;
  slug: string | null;
  role: string;
  highlight?: boolean;
}) {
  if (!name) return null;

  const body = (
    <>
      {avatarUrl ? (
        <Image src={avatarUrl} alt="" width={24} height={24} className="h-6 w-6 rounded-full object-cover" />
      ) : (
        <span
          aria-hidden
          className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white"
          style={{ background: MEHR_COLORS.blue }}
        >
          {name.charAt(0)}
        </span>
      )}
      <span className="font-semibold">{name}</span>
      <span className="text-xs" style={{ color: MEHR_COLORS.inkSoft }}>
        {MEHR_ROLE_LABEL[role] ?? role}
      </span>
    </>
  );

  const className = "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm";
  const style = {
    borderColor: highlight ? MEHR_COLORS.blue : MEHR_COLORS.border,
    color: MEHR_COLORS.ink,
    background: "#fff",
  };

  return slug ? (
    <Link href={`/liderlar/${slug}`} className={`${className} transition hover:shadow-sm`} style={style}>
      {body}
    </Link>
  ) : (
    <span className={className} style={style}>
      {body}
    </span>
  );
}
