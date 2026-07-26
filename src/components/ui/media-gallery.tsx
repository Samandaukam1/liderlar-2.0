"use client";

import * as React from "react";
import Image from "next/image";
import { Modal } from "@/components/ui/modal";

export type MediaItem = { id: string; url: string; caption?: string | null };

export function MediaGallery({ items }: { items: MediaItem[] }) {
  const [active, setActive] = React.useState<MediaItem | null>(null);

  if (items.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setActive(item)}
            className="group relative aspect-square overflow-hidden rounded-lg border border-brand-soft"
          >
            <Image
              src={item.url}
              alt={item.caption ?? "Galereya rasmi"}
              fill
              sizes="200px"
              className="object-cover transition-transform duration-200 group-hover:scale-105"
            />
          </button>
        ))}
      </div>
      <Modal open={!!active} onClose={() => setActive(null)} className="max-w-2xl p-2">
        {active && (
          <div className="relative aspect-video w-full overflow-hidden rounded-md">
            <Image src={active.url} alt={active.caption ?? ""} fill sizes="640px" className="object-contain" />
          </div>
        )}
        {active?.caption && <p className="mt-3 px-2 text-sm text-ink-soft">{active.caption}</p>}
      </Modal>
    </>
  );
}
