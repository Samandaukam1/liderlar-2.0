import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";
import { Camera, Send, PlayCircle } from "lucide-react";

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Platforma",
    links: [
      { label: "Liderlar", href: "/liderlar" },
      { label: "Reyting", href: "/reyting" },
      { label: "TOP 100", href: "/top-100" },
      { label: "Yo'nalishlar", href: "/yonalishlar" },
    ],
  },
  {
    title: "Media",
    links: [
      { label: "Podcastlar", href: "/podcastlar" },
      { label: "Podcastlar taqvimi", href: "/podcastlar/taqvim" },
      { label: "Liderlar Online", href: "/jurnal" },
      { label: "Iqtiboslar", href: "/iqtiboslar" },
    ],
  },
  {
    title: "Loyiha",
    links: [
      { label: "Loyiha haqida", href: "/loyiha-haqida" },
      { label: "Ariza topshirish", href: "/ariza" },
      { label: "Jaxongir AI", href: "/ai" },
      { label: "Qidiruv", href: "/qidiruv" },
    ],
  },
  {
    title: "Huquqiy",
    links: [
      { label: "Ommaviy oferta", href: "/oferta" },
      { label: "Maxfiylik siyosati", href: "/maxfiylik-siyosati" },
      { label: "Foydalanish shartlari", href: "/foydalanish-shartlari" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-0 border-t border-white/10 bg-navy text-white/80">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-display text-2xl font-semibold text-white">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-blue text-sm font-bold text-white">
                L
              </span>
              {SITE_NAME}
            </Link>
            <p className="mt-4 max-w-xs text-sm text-white/60">
              O&apos;zbekistonning faol, iqtidorli va yetakchi yoshlarini birlashtiruvchi raqamli
              ensiklopediya, reyting platformasi va media markaz.
            </p>
            <div className="mt-5 flex gap-3">
              <a
                href="#"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
              >
                <Camera className="h-4 w-4" aria-hidden />
              </a>
              <a
                href="#"
                aria-label="Telegram"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
              >
                <Send className="h-4 w-4" aria-hidden />
              </a>
              <a
                href="#"
                aria-label="YouTube"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
              >
                <PlayCircle className="h-4 w-4" aria-hidden />
              </a>
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-bold uppercase tracking-[0.16em] text-white">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-white/60 transition-colors hover:text-cyan-light">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} {SITE_NAME}. Barcha huquqlar himoyalangan.</p>
          <p>O&apos;zbekiston kelajagini yaratayotgan yoshlar shu yerda jamlangan.</p>
        </div>
        <div className="mt-4 border-t border-white/10 pt-4 text-center text-[0.7rem] leading-relaxed text-white/40">
          <p>MUKAMMAL MEDIA GROUP MChJ</p>
          <p>Tasarrufidagi loyiha</p>
        </div>
      </div>
    </footer>
  );
}
