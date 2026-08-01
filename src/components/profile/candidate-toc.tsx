"use client";

import { useEffect, useState } from "react";
import { List } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Drawer } from "@/components/ui/drawer";

export interface CandidateTocItem {
  id: string;
  label: string;
}

export function CandidateToc({ items }: { items: CandidateTocItem[] }) {
  const [activeId, setActiveId] = useState<string | null>(items[0]?.id ?? null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (items.length === 0) return;
    const elements = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: [0, 1] }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  const handleNavigate = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setMobileOpen(false);
  };

  const list = (
    <ul className="space-y-0.5">
      {items.map((item) => {
        const isActive = item.id === activeId;
        return (
          <li key={item.id} className="relative">
            {isActive && (
              <motion.span
                layoutId="candidate-toc-active-glow"
                className="absolute inset-y-0.5 left-0 w-0.5 rounded-full bg-liderlar-blue shadow-[0_0_10px_2px_rgba(19,188,228,0.55)]"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            <a
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                handleNavigate(item.id);
              }}
              className={cn(
                "block truncate rounded-md py-1.5 pl-4 pr-2 text-[0.8rem] leading-snug transition-all duration-200",
                isActive
                  ? "font-semibold text-liderlar-blue"
                  : "text-ink-soft hover:translate-x-0.5 hover:text-navy"
              )}
            >
              {item.label}
            </a>
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      <nav
        aria-label="Sahifa mundarijasi"
        className="hidden lg:sticky lg:top-24 lg:block lg:h-fit lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:rounded-2xl lg:border lg:border-brand-soft/70 lg:bg-white/60 lg:p-4 lg:shadow-[0_8px_30px_-12px_rgba(11,53,85,0.15)] lg:backdrop-blur-xl"
      >
        <p className="mb-3 px-1 text-[0.62rem] font-bold uppercase tracking-[0.24em] text-liderlar-blue">
          Mundarija
        </p>
        {list}
      </nav>

      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Sahifa mundarijasini ochish"
        className="fixed bottom-5 left-5 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-brand-soft bg-paper/90 text-navy shadow-card-hover backdrop-blur-xl transition-transform active:scale-95 lg:hidden"
      >
        <List className="h-5 w-5" aria-hidden />
      </button>

      <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)} title="Mundarija" side="left">
        {list}
      </Drawer>
    </>
  );
}
