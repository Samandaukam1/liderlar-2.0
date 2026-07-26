"use client";

import { useState } from "react";
import {
  BookOpen,
  Clapperboard,
  ExternalLink,
  Feather,
  FileText,
  Newspaper,
  type LucideIcon,
} from "lucide-react";
import type {
  AdabiyotXContentType,
  PublicCandidateAdabiyotXItem,
} from "@/lib/types";

const CONTENT_TYPE_DETAILS: Record<
  AdabiyotXContentType,
  { label: string; Icon: LucideIcon; gradient: string }
> = {
  book: {
    label: "Kitob",
    Icon: BookOpen,
    gradient: "from-[#082f4d] via-[#0b6682] to-[#20c5e8]",
  },
  article: {
    label: "Maqola",
    Icon: Newspaper,
    gradient: "from-[#123c60] via-[#287e9f] to-[#91dfed]",
  },
  poem: {
    label: "She’r",
    Icon: Feather,
    gradient: "from-[#302f6f] via-[#6878c9] to-[#6ed8e7]",
  },
  scenario: {
    label: "Ssenariy",
    Icon: Clapperboard,
    gradient: "from-[#101f35] via-[#305a7f] to-[#14a9cf]",
  },
  other: {
    label: "Material",
    Icon: FileText,
    gradient: "from-[#164662] via-[#3e7e92] to-[#70d2dc]",
  },
};

function safeHttpUrl(value: string | null): string | null {
  if (!value?.trim()) return null;

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.href
      : null;
  } catch {
    return null;
  }
}

function CandidateAdabiyotXCover({
  item,
}: {
  item: PublicCandidateAdabiyotXItem;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const coverUrl = safeHttpUrl(item.coverUrl);
  const { label, Icon, gradient } = CONTENT_TYPE_DETAILS[item.contentType];

  return (
    <div className="relative aspect-[2/3] overflow-hidden bg-navy">
      {coverUrl && !imageFailed ? (
        // The AdabiyotX image host is not fixed, so using a native image avoids
        // opening Next/Image remotePatterns to unknown domains.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={coverUrl}
          alt={`${item.title} — ${label.toLowerCase()} muqovasi`}
          width={424}
          height={636}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.035]"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div
          role="img"
          aria-label={`${item.title} — ${label.toLowerCase()} uchun muqova`}
          className={`relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br ${gradient}`}
        >
          <span
            aria-hidden
            className="absolute -right-12 -top-12 h-36 w-36 rounded-full border border-white/25"
          />
          <span
            aria-hidden
            className="absolute -bottom-16 -left-10 h-44 w-44 rounded-full border-[18px] border-white/10"
          />
          <span
            aria-hidden
            className="absolute inset-x-6 top-8 h-px bg-white/25"
          />
          <Icon className="relative h-12 w-12 text-white/90 drop-shadow-lg" aria-hidden />
          <span className="absolute bottom-7 left-6 right-6 text-center text-[0.6rem] font-bold uppercase tracking-[0.28em] text-white/65">
            AdabiyotX
          </span>
        </div>
      )}

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-navy-dark/45 to-transparent"
      />
      <span className="absolute left-3 top-3 rounded-full border border-white/30 bg-navy-dark/75 px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-[0.14em] text-white shadow-sm backdrop-blur-md">
        {label}
      </span>
    </div>
  );
}

function CandidateAdabiyotXCardContent({
  item,
  hasLink,
}: {
  item: PublicCandidateAdabiyotXItem;
  hasLink: boolean;
}) {
  return (
    <>
      <CandidateAdabiyotXCover item={item} />
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-3 font-display text-[1.12rem] font-bold leading-[1.08] text-navy sm:text-xl">
          {item.title}
        </h3>
        <p className="mt-2 line-clamp-2 min-h-8 text-xs leading-4 text-ink-soft">
          {item.authorName ?? "Muallif ko‘rsatilmagan"}
        </p>
        <span
          className={`mt-4 flex items-center gap-1.5 border-t border-border-soft pt-3 text-[0.68rem] font-bold ${
            hasLink ? "text-electric-blue" : "text-ink-soft"
          }`}
        >
          {hasLink ? "AdabiyotX’da o‘qish" : "Havola mavjud emas"}
          {hasLink && <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden />}
        </span>
      </div>
    </>
  );
}

export function CandidateAdabiyotXCard({
  item,
}: {
  item: PublicCandidateAdabiyotXItem;
}) {
  const externalUrl = safeHttpUrl(item.externalUrl);
  const className =
    "group flex h-full min-w-0 flex-col overflow-hidden rounded-[1.35rem] border border-brand-soft bg-paper shadow-card transition-[transform,box-shadow,border-color] duration-300";

  if (!externalUrl) {
    return (
      <article
        aria-label={`${item.title}. Tashqi havola mavjud emas`}
        className={className}
      >
        <CandidateAdabiyotXCardContent item={item} hasLink={false} />
      </article>
    );
  }

  return (
    <a
      href={externalUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${item.title} — AdabiyotX’da yangi oynada o‘qish`}
      className={`${className} hover:-translate-y-1 hover:border-liderlar-blue/55 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-liderlar-blue focus-visible:ring-offset-2 focus-visible:ring-offset-ice`}
    >
      <CandidateAdabiyotXCardContent item={item} hasLink />
    </a>
  );
}
