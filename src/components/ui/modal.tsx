"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { IconButton } from "@/components/ui/button";

function useEscapeToClose(open: boolean, onClose: () => void) {
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);
}

export function Modal({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  useEscapeToClose(open, onClose);

  // Guard directly against `document` (rather than a mounted-state + effect)
  // so the portal is skipped during SSR without an extra render/effect cycle.
  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-navy/40 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: "spring", stiffness: 340, damping: 30 }}
            className={cn(
              "relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-brand-soft bg-paper p-6 shadow-card-hover",
              className
            )}
          >
            <div className="mb-4 flex items-center justify-between">
              {title && <h3 className="font-display text-lg font-semibold text-navy">{title}</h3>}
              <IconButton aria-label="Yopish" variant="ghost" onClick={onClose} className="ml-auto">
                <X className="h-4 w-4" aria-hidden />
              </IconButton>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export function AlertDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Tasdiqlash",
  cancelLabel = "Bekor qilish",
  danger = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} className="max-w-sm">
      {description && <p className="mb-6 text-sm text-ink-soft">{description}</p>}
      <div className="flex justify-end gap-2">
        <button
          onClick={onClose}
          className="rounded-md border border-brand-soft px-4 py-2 text-sm font-semibold text-navy hover:bg-navy/5"
        >
          {cancelLabel}
        </button>
        <button
          onClick={onConfirm}
          className={cn(
            "rounded-md px-4 py-2 text-sm font-semibold text-white",
            danger ? "bg-coral hover:brightness-95" : "bg-gradient-blue"
          )}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
