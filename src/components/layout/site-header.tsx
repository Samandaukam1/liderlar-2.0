"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpenText,
  ChevronDown,
  CircleHelp,
  Compass,
  Medal,
  Mic2,
  Quote,
  Search,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { SITE_NAME } from "@/lib/constants";
import { LinkButton } from "@/components/ui/button";
import { Dropdown, DropdownItem } from "@/components/ui/dropdown";
import { BrandLogo } from "@/components/layout/brand-logo";
import { cn } from "@/lib/utils";

const MAIN_NAV = [
  { label: "Bosh sahifa", href: "/" },
  { label: "Liderlar", href: "/liderlar" },
  { label: "Reyting", href: "/reyting" },
];

type MenuEntry = {
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

const MEDIA_NAV: MenuEntry[] = [
  {
    label: "Podcastlar",
    description: "Suhbatlar va jonli efirlar",
    href: "/podcastlar",
    icon: Mic2,
  },
  {
    label: "Liderlar Online",
    description: "Jurnal va maxsus nashrlar",
    href: "/jurnal",
    icon: BookOpenText,
  },
  {
    label: "Iqtiboslar",
    description: "Liderlarning sara fikrlari",
    href: "/iqtiboslar",
    icon: Quote,
  },
];

const PLATFORM_NAV: MenuEntry[] = [
  {
    label: "Yo'nalishlar",
    description: "Faoliyat sohalari bo'yicha",
    href: "/yonalishlar",
    icon: Compass,
  },
  {
    label: "TOP 100",
    description: "Eng kuchli liderlar ro'yxati",
    href: "/top-100",
    icon: Medal,
  },
  {
    label: "Loyiha haqida",
    description: "Maqsad va imkoniyatlarimiz",
    href: "/loyiha-haqida",
    icon: CircleHelp,
  },
];

function pathMatches(pathname: string, href: string) {
  return pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
}

function MenuDropdown({
  label,
  entries,
  pathname,
}: {
  label: string;
  entries: MenuEntry[];
  pathname: string;
}) {
  const active = entries.some((entry) => pathMatches(pathname, entry.href));

  return (
    <Dropdown
      align="start"
      className="w-[18rem]"
      trigger={({ open }) => (
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          className={cn(
            "relative z-10 inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-[0.78rem] font-semibold transition-colors",
            active || open ? "bg-liderlar-blue/10 text-electric-blue" : "text-ink-soft hover:text-navy"
          )}
        >
          {label}
          <ChevronDown
            className={cn("h-3.5 w-3.5 transition-transform duration-200", open && "rotate-180")}
            aria-hidden
          />
        </button>
      )}
    >
      <p className="px-3 pb-1.5 pt-1 text-[0.62rem] font-bold uppercase tracking-[0.18em] text-ink-soft">
        {label}
      </p>
      {entries.map(({ label: itemLabel, description, href, icon: Icon }) => (
        <DropdownItem
          key={href}
          href={href}
          className="group flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-liderlar-blue/8"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-linen text-electric-blue transition-colors group-hover:bg-gradient-blue group-hover:text-white">
            <Icon className="h-4 w-4" aria-hidden />
          </span>
          <span>
            <span className="block text-[0.8rem] font-bold text-navy">{itemLabel}</span>
            <span className="mt-0.5 block text-[0.66rem] text-ink-soft">{description}</span>
          </span>
        </DropdownItem>
      ))}
    </Dropdown>
  );
}

export function MobileTopBar() {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-brand-soft bg-paper/90 px-4 backdrop-blur-xl lg:hidden">
      <Link href="/" aria-label={SITE_NAME} className="relative z-10 flex shrink-0 items-center">
        <BrandLogo variant="light" priority className="h-[38px]" />
      </Link>
      <div className="relative z-10 flex items-center gap-1.5">
        <Link
          href="/qidiruv"
          aria-label="Qidiruv"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-soft bg-paper text-ink-soft transition-all hover:border-liderlar-blue/50 hover:text-liderlar-blue"
        >
          <Search className="h-4 w-4" aria-hidden />
        </Link>
        <Link
          href="/ai"
          aria-label="Jaxongir AI"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-liderlar-blue/10 text-electric-blue transition-colors hover:bg-liderlar-blue/18"
        >
          <Sparkles className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </header>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 hidden w-full border-b border-brand-soft bg-paper/88 backdrop-blur-xl transition-all duration-300 lg:block",
        scrolled ? "shadow-[0_8px_30px_rgba(7,88,126,0.08)]" : ""
      )}
    >
      <div
        className={cn(
          "relative z-10 mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-6 transition-all duration-300",
          scrolled ? "h-16" : "h-[4.75rem]"
        )}
      >
        <Link href="/" aria-label={SITE_NAME} className="flex shrink-0 items-center">
          <BrandLogo variant="light" priority className="h-[52px]" />
        </Link>

        <nav
          aria-label="Asosiy menyu"
          className="flex items-center gap-0.5 rounded-full border border-brand-soft bg-linen/45 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
        >
          {MAIN_NAV.map((item) => {
            const active = pathMatches(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex h-9 items-center rounded-full px-3.5 text-[0.78rem] font-semibold transition-colors",
                  active ? "text-white" : "text-ink-soft hover:text-navy"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="header-active-pill"
                    className="absolute inset-0 rounded-full bg-gradient-blue shadow-[0_7px_18px_rgba(5,151,198,0.22)]"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </Link>
            );
          })}
          <MenuDropdown label="Media" entries={MEDIA_NAV} pathname={pathname} />
          <MenuDropdown label="Platforma" entries={PLATFORM_NAV} pathname={pathname} />
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/qidiruv"
            aria-label="Qidiruv"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-soft bg-paper text-ink-soft transition-all hover:border-liderlar-blue/50 hover:text-liderlar-blue"
          >
            <Search className="h-4 w-4" aria-hidden />
          </Link>
          <LinkButton href="/ai" variant="ghost" size="sm" className="gap-1.5 px-3">
            <Sparkles className="h-4 w-4 text-liderlar-blue" aria-hidden />
            <span className="hidden xl:inline">Jaxongir AI</span>
          </LinkButton>
          <LinkButton href="/kirish" variant="secondary" size="sm" className="px-4">
            Kirish
          </LinkButton>
          <LinkButton href="/ariza" variant="primary" size="sm" className="px-4">
            Ariza topshirish
          </LinkButton>
        </div>
      </div>
    </header>
  );
}
