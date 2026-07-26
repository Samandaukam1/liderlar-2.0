"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpenText,
  CircleHelp,
  Compass,
  Home,
  Medal,
  Menu,
  Mic2,
  Quote,
  Radio,
  Search,
  Sparkles,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Drawer } from "@/components/ui/drawer";
import { LinkButton } from "@/components/ui/button";

const ITEMS = [
  { href: "/", label: "Bosh", icon: Home },
  { href: "/liderlar", label: "Liderlar", icon: Users },
  { href: "/reyting", label: "Reyting", icon: Trophy },
  { href: "/podcastlar", label: "Podcast", icon: Radio },
];

type DrawerLink = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const DRAWER_GROUPS: { title: string; links: DrawerLink[] }[] = [
  {
    title: "Platforma",
    links: [
      { href: "/liderlar", label: "Liderlar", icon: Users },
      { href: "/reyting", label: "Reyting", icon: Trophy },
      { href: "/yonalishlar", label: "Yo'nalishlar", icon: Compass },
      { href: "/top-100", label: "TOP 100", icon: Medal },
    ],
  },
  {
    title: "Media",
    links: [
      { href: "/podcastlar", label: "Podcastlar", icon: Mic2 },
      { href: "/jurnal", label: "Liderlar Online", icon: BookOpenText },
      { href: "/iqtiboslar", label: "Iqtiboslar", icon: Quote },
      { href: "/ai", label: "Jaxongir AI", icon: Sparkles },
    ],
  },
  {
    title: "Loyiha",
    links: [
      { href: "/loyiha-haqida", label: "Loyiha haqida", icon: CircleHelp },
      { href: "/qidiruv", label: "Qidiruv", icon: Search },
    ],
  },
];

function pathMatches(pathname: string, href: string) {
  return pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
}

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const directRouteActive = ITEMS.some((item) => pathMatches(pathname, item.href));

  return (
    <>
      <nav
        aria-label="Mobil menyu"
        className="fixed bottom-3 left-3 right-3 z-40 flex items-center gap-1 rounded-[1.4rem] border border-brand-soft bg-paper/94 p-1.5 shadow-[0_16px_50px_rgba(7,88,126,0.18)] backdrop-blur-xl lg:hidden"
      >
        {ITEMS.map((item) => {
          const active = pathMatches(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-2xl py-1.5 text-[0.58rem] font-semibold transition-colors",
                active ? "text-electric-blue" : "text-ink-soft"
              )}
            >
              {active && (
                <motion.span
                  layoutId="mobile-nav-active"
                  className="absolute inset-0 rounded-2xl bg-liderlar-blue/9"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <span
                className={cn(
                  "relative z-10 flex h-7 w-7 items-center justify-center rounded-full transition-all",
                  active ? "bg-gradient-blue text-white shadow-[0_5px_14px_rgba(5,151,198,0.24)]" : ""
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <span className="relative z-10 truncate">{item.label}</span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn(
            "relative flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-2xl py-1.5 text-[0.58rem] font-semibold transition-colors",
            open || !directRouteActive ? "text-electric-blue" : "text-ink-soft"
          )}
        >
          {(open || !directRouteActive) && (
            <motion.span
              layoutId="mobile-nav-active"
              className="absolute inset-0 rounded-2xl bg-liderlar-blue/9"
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
            />
          )}
          <span
            className={cn(
              "relative z-10 flex h-7 w-7 items-center justify-center rounded-full",
              (open || !directRouteActive) &&
                "bg-gradient-blue text-white shadow-[0_5px_14px_rgba(5,151,198,0.24)]"
            )}
          >
            <Menu className="h-4 w-4" aria-hidden />
          </span>
          <span className="relative z-10">Ko&apos;proq</span>
        </button>
      </nav>

      <Drawer open={open} onClose={() => setOpen(false)} title="Menyu" side="bottom">
        <div className="mb-6 overflow-hidden rounded-2xl bg-gradient-blue p-5 text-white shadow-[0_16px_40px_rgba(5,151,198,0.2)]">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/18 font-display text-lg font-semibold">
              L
            </span>
            <div>
              <p className="font-display text-xl font-semibold leading-none">Liderlar.uz</p>
              <p className="mt-1 text-[0.68rem] text-white/75">Barcha imkoniyatlar bir menyuda</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {DRAWER_GROUPS.map((group) => (
            <section key={group.title}>
              <h4 className="mb-2 text-[0.62rem] font-bold uppercase tracking-[0.18em] text-ink-soft">
                {group.title}
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {group.links.map(({ href, label, icon: Icon }) => {
                  const active = pathMatches(pathname, href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-2.5 rounded-xl border px-3 py-3 text-xs font-semibold transition-all",
                        active
                          ? "border-liderlar-blue/35 bg-liderlar-blue/9 text-electric-blue"
                          : "border-brand-soft bg-paper text-navy hover:border-liderlar-blue/40"
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                          active ? "bg-gradient-blue text-white" : "bg-linen text-electric-blue"
                        )}
                      >
                        <Icon className="h-4 w-4" aria-hidden />
                      </span>
                      <span>{label}</span>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-6 flex gap-2 border-t border-brand-soft pt-5">
          <LinkButton href="/kirish" variant="secondary" className="flex-1" onClick={() => setOpen(false)}>
            Kirish
          </LinkButton>
          <LinkButton href="/ariza" variant="primary" className="flex-1" onClick={() => setOpen(false)}>
            Ariza topshirish
          </LinkButton>
        </div>
      </Drawer>
    </>
  );
}
