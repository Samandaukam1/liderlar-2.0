"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Menu, X } from "lucide-react";
import { MEHR_NAV, MEHR_COLORS, MEHR_GRADIENT } from "@/lib/mehr/brand";
import { MehrLogo } from "./mehr-logo";

/**
 * MEHR bo'limining qobig'i.
 *
 * RANGLAR FAQAT SHU KONTEYNERDA. Ular global CSS'ga
 * yozilmaydi — aks holda butun Liderlar ensiklopediyasi
 * rangini o'zgartirib yuborardi.
 *
 * Yuqorida doimo "Ensiklopediyaga qaytish" turadi: foydalanuvchi
 * MEHR alohida sayt emas, Liderlar ichidagi bo'lim ekanini
 * bilib tursin.
 */
export function MehrShell({
  logoUrl,
  signedIn,
  children,
}: {
  logoUrl: string | null;
  signedIn: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div
      className="min-h-screen"
      style={{
        background: MEHR_COLORS.surfaceSoft,
        color: MEHR_COLORS.ink,
      }}
    >
      {/* Brend chizig'i — gradient faqat shu yerda, yupqa urg'u sifatida. */}
      <div aria-hidden className="h-1 w-full" style={{ background: MEHR_GRADIENT }} />

      <header
        className="sticky top-0 z-40 border-b backdrop-blur"
        style={{
          borderColor: MEHR_COLORS.border,
          background: "rgba(255,255,255,0.86)",
        }}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
          <Link href="/mehr365" aria-label="MEHR 365+ bosh sahifa" className="shrink-0">
            <MehrLogo logoUrl={logoUrl} />
          </Link>

          <nav className="ml-4 hidden flex-1 items-center gap-1 lg:flex" aria-label="MEHR bo'limlari">
            {MEHR_NAV.map((item) => {
              const active =
                item.href === "/mehr365"
                  ? pathname === "/mehr365"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className="rounded-full px-3.5 py-2 text-sm font-semibold transition"
                  style={{
                    color: active ? MEHR_COLORS.ink : MEHR_COLORS.inkSoft,
                    background: active ? "rgba(28,143,232,0.10)" : "transparent",
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/"
              className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold transition hover:opacity-70 md:inline-flex"
              style={{ color: MEHR_COLORS.inkSoft }}
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
              Ensiklopediyaga qaytish
            </Link>

            <Link
              href={signedIn ? "/kabinet" : "/kirish"}
              className="rounded-full px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:opacity-90"
              style={{ background: MEHR_COLORS.blue }}
            >
              {signedIn ? "Kabinet" : "Kirish"}
            </Link>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Menyuni yopish" : "Menyuni ochish"}
              aria-expanded={open}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full lg:hidden"
              style={{ color: MEHR_COLORS.ink }}
            >
              {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
            </button>
          </div>
        </div>

        {open && (
          <div
            className="border-t lg:hidden"
            style={{ borderColor: MEHR_COLORS.border, background: "#fff" }}
          >
            <nav className="mx-auto max-w-6xl px-4 py-3 sm:px-6" aria-label="MEHR bo'limlari">
              {MEHR_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-semibold"
                  style={{ color: MEHR_COLORS.ink }}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="mt-1 flex items-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-semibold"
                style={{ color: MEHR_COLORS.inkSoft }}
              >
                <ArrowLeft className="h-4 w-4" aria-hidden />
                Ensiklopediyaga qaytish
              </Link>
            </nav>
          </div>
        )}
      </header>

      <main>{children}</main>

      <footer className="border-t py-10" style={{ borderColor: MEHR_COLORS.border }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <MehrLogo logoUrl={logoUrl} size={28} />
          <p className="mt-3 max-w-md text-sm" style={{ color: MEHR_COLORS.inkSoft }}>
            MEHR 365+ — Liderlar.uz ensiklopediyasining ijtimoiy tashabbusi. Har bir ezgulik
            ishi tekshiriladi va tasdiqlanadi.
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold"
            style={{ color: MEHR_COLORS.blue }}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Liderlar Ensiklopediyasiga qaytish
          </Link>
        </div>
      </footer>
    </div>
  );
}
