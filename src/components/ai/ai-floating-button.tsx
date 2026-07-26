"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Drawer } from "@/components/ui/drawer";
import { AIChatPanel } from "@/components/ai/ai-chat-panel";

export function AIFloatingButton() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  // The /ai route already renders the full panel; avoid a redundant floating trigger there.
  if (pathname?.startsWith("/ai")) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Jaxongir AI bilan suhbat"
        className="fixed bottom-24 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-blue text-white shadow-[0_14px_34px_rgba(0,151,190,0.4)] transition-transform hover:scale-105 active:scale-95 lg:bottom-6 lg:right-6"
      >
        <Sparkles className="h-6 w-6" aria-hidden />
      </button>
      <Drawer open={open} onClose={() => setOpen(false)} title="Jaxongir AI" side="right" className="max-w-md p-0">
        <div className="-m-5 h-[calc(100vh-4.5rem)]">
          <AIChatPanel compact />
        </div>
      </Drawer>
    </>
  );
}
