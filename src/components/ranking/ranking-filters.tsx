"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Tabs } from "@/components/ui/tabs";

const PERIOD_OPTIONS = [
  { value: "joriy-oy", label: "Joriy oy" },
  { value: "otgan-oy", label: "O'tgan oy" },
  { value: "yil", label: "Yil" },
  { value: "barcha-vaqt", label: "Barcha vaqt" },
];

export function RankingCategoryTabs({
  categories,
}: {
  categories: { slug: string; name: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("kategoriya") ?? categories[0]?.slug ?? "overall";

  function onChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("kategoriya", value);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <Tabs
      items={categories.map((c) => ({ value: c.slug, label: c.name }))}
      value={current}
      onChange={onChange}
    />
  );
}

export function RankingPeriodTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("davr") ?? "barcha-vaqt";

  function onChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("davr", value);
    router.push(`${pathname}?${params.toString()}`);
  }

  return <Tabs items={PERIOD_OPTIONS} value={current} onChange={onChange} className="border-liderlar-blue/20" />;
}
