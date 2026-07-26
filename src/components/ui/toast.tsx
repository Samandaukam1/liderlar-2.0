"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "info";
type Toast = { id: number; title: string; description?: string; variant: ToastVariant };

const ToastContext = React.createContext<{
  push: (toast: Omit<Toast, "id">) => void;
} | null>(null);

const ICONS: Record<ToastVariant, React.ReactNode> = {
  success: <CheckCircle2 className="h-5 w-5 text-[#1e9c66]" aria-hidden />,
  error: <XCircle className="h-5 w-5 text-coral" aria-hidden />,
  info: <Info className="h-5 w-5 text-liderlar-blue" aria-hidden />,
};

const subscribeToClient = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const mounted = React.useSyncExternalStore(subscribeToClient, getClientSnapshot, getServerSnapshot);

  const push = React.useCallback((toast: Omit<Toast, "id">) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5000);
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      {mounted &&
        createPortal(
          <div className="pointer-events-none fixed bottom-4 right-4 z-[200] flex w-full max-w-sm flex-col gap-2 sm:bottom-6 sm:right-6">
            <AnimatePresence>
              {toasts.map((t) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 16, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 40 }}
                  transition={{ duration: 0.24 }}
                  className={cn(
                    "pointer-events-auto flex items-start gap-3 rounded-2xl border border-brand-soft bg-paper p-4 shadow-card-hover"
                  )}
                >
                  {ICONS[t.variant]}
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-navy">{t.title}</p>
                    {t.description && <p className="mt-0.5 text-xs text-ink-soft">{t.description}</p>}
                  </div>
                  <button
                    onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
                    aria-label="Yopish"
                    className="text-ink-soft hover:text-navy"
                  >
                    <X className="h-4 w-4" aria-hidden />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
