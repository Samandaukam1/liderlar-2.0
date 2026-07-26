"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Unhandled route error:", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-coral/15 text-coral">
        <AlertTriangle className="h-8 w-8" aria-hidden />
      </span>
      <h1 className="mt-4 font-display text-3xl font-bold text-navy">Nimadir xato ketdi</h1>
      <p className="mt-2 text-ink-soft">
        Sahifani yuklashda kutilmagan xatolik yuz berdi. Qayta urinib ko&apos;ring.
      </p>
      <Button className="mt-6" onClick={reset}>
        Qayta urinish
      </Button>
    </div>
  );
}
