"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { SearchInput } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function HeroSearch() {
  const router = useRouter();
  const [value, setValue] = React.useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    router.push(trimmed ? `/qidiruv?q=${encodeURIComponent(trimmed)}` : "/qidiruv");
  }

  return (
    <form onSubmit={onSubmit} className="flex max-w-lg gap-2">
      <SearchInput
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Ism, hudud yoki yo'nalish bo'yicha qidiring..."
        containerClassName="flex-1"
        aria-label="Liderlar bo'yicha qidiruv"
      />
      <Button type="submit" size="md" className="shrink-0">
        Qidirish
      </Button>
    </form>
  );
}
