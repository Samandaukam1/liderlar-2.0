"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type TabItem = { value: string; label: string };

export function Tabs({
  items,
  value,
  onChange,
  className,
}: {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={cn(
        "flex w-full gap-1 overflow-x-auto rounded-full border border-brand-soft bg-paper p-1 no-scrollbar sm:w-fit",
        className
      )}
    >
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.value)}
            className={cn(
              "relative shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              active ? "text-white" : "text-ink-soft hover:text-navy"
            )}
          >
            {active && (
              <motion.span
                layoutId="tabs-indicator"
                className="absolute inset-0 rounded-full bg-gradient-blue"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative z-10">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
