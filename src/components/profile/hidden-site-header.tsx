import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/**
 * "HEADERNI BERKITISH" — FAQAT SHU PROFIL SAHIFASIDA.
 *
 * Header ildiz layout'da chiziladi va sahifa uni o'chira olmaydi, shuning
 * uchun SERVERDA chiqariladigan `<style>` ishlatiladi: brauzer uni HTML
 * bilan birga oladi — header bir lahza ko'rinib yo'qolmaydi. Uslub faqat
 * shu sahifa ochiq turganda amal qiladi; boshqa sahifalarga ta'siri yo'q.
 *
 * Saytga qaytish yo'li YO'QOLMAYDI: chap yuqorida kichik "Liderlar.uz"
 * havolasi, mobil pastki menyu esa joyida qoladi.
 */
export function HiddenSiteHeader() {
  return (
    <>
      <style>{"[data-site-header]{display:none!important}"}</style>
      <Link
        href="/"
        data-hidden-header-link
        className="fixed left-3 top-3 z-50 inline-flex min-h-10 items-center gap-1.5 rounded-full bg-black/45 px-3.5 text-xs font-semibold text-white shadow-lg backdrop-blur-md transition hover:bg-black/65 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
        Liderlar.uz
      </Link>
    </>
  );
}
