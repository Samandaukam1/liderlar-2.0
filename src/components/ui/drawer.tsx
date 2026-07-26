"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { IconButton } from "@/components/ui/button";

export function Drawer({
  open,
  onClose,
  title,
  side = "right",
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  side?: "left" | "right" | "bottom";
  children: React.ReactNode;
  className?: string;
}) {
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Guard directly against `document` (rather than a mounted-state + effect)
  // so the portal is skipped during SSR without an extra render/effect cycle.
  if (typeof document === "undefined") return null;

  const variants = {
    right: { hidden: { x: "100%" }, visible: { x: 0 } },
    left: { hidden: { x: "-100%" }, visible: { x: 0 } },
    bottom: { hidden: { y: "100%" }, visible: { y: 0 } },
  }[side];

  const positionClass = {
    right: "right-0 top-0 h-full w-full max-w-md",
    left: "left-0 top-0 h-full w-full max-w-md",
    bottom: "bottom-0 left-0 w-full max-h-[85vh] rounded-t-2xl",
  }[side];

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-navy/40 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={variants}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className={cn("absolute overflow-y-auto bg-paper shadow-card-hover", positionClass, className)}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-brand-soft bg-paper/95 p-5 backdrop-blur">
              {title && <h3 className="font-display text-lg font-semibold text-navy">{title}</h3>}
              <IconButton aria-label="Yopish" variant="ghost" onClick={onClose} className="ml-auto">
                <X className="h-4 w-4" aria-hidden />
              </IconButton>
            </div>
            <div className="p-5">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
