"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { SearchInput, Select } from "@/components/ui/input";
import { Drawer } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

type Option = { value: string; label: string };

export function CatalogFilters({
  regions,
  directions,
}: {
  regions: Option[];
  directions: Option[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [q, setQ] = React.useState(searchParams.get("q") ?? "");

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      if (q !== (searchParams.get("q") ?? "")) updateParam("q", q);
    }, 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const filterBody = (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Select
        value={searchParams.get("hudud") ?? ""}
        onChange={(e) => updateParam("hudud", e.target.value)}
        aria-label="Hudud bo'yicha filtr"
      >
        <option value="">Barcha hududlar</option>
        {regions.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </Select>
      <Select
        value={searchParams.get("yonalish") ?? ""}
        onChange={(e) => updateParam("yonalish", e.target.value)}
        aria-label="Yo'nalish bo'yicha filtr"
      >
        <option value="">Barcha yo&apos;nalishlar</option>
        {directions.map((d) => (
          <option key={d.value} value={d.value}>
            {d.label}
          </option>
        ))}
      </Select>
      <Select
        value={searchParams.get("tugilgan_yil") ?? ""}
        onChange={(e) => updateParam("tugilgan_yil", e.target.value)}
        aria-label="Tug'ilgan yil bo'yicha filtr"
      >
        <option value="">Tug&apos;ilgan yil</option>
        {Array.from({ length: 30 }, (_, i) => 2010 - i).map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </Select>
      <Select
        value={searchParams.get("saralash") ?? "reyting"}
        onChange={(e) => updateParam("saralash", e.target.value)}
        aria-label="Saralash"
      >
        <option value="reyting">Reyting bo&apos;yicha</option>
        <option value="eng-yangi">Eng yangi</option>
        <option value="eng-kop-oqilgan">Eng ko&apos;p o&apos;qilgan</option>
        <option value="alifbo">Alifbo bo&apos;yicha</option>
      </Select>
    </div>
  );

  return (
    <div className="mb-8 space-y-4">
      <div className="flex gap-2">
        <SearchInput
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ism yoki familiya bo'yicha qidirish..."
          containerClassName="flex-1"
          aria-label="Liderlar qidiruvi"
        />
        <Button
          type="button"
          variant="secondary"
          className="shrink-0 lg:hidden"
          onClick={() => setDrawerOpen(true)}
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden />
          Filtr
        </Button>
      </div>

      <div className="hidden lg:block">{filterBody}</div>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Filtrlar" side="bottom">
        {filterBody}
        <Button className="mt-5 w-full" onClick={() => setDrawerOpen(false)}>
          Natijalarni ko&apos;rish
        </Button>
      </Drawer>
    </div>
  );
}
