import Link from "next/link";
import { Clock } from "lucide-react";
import { MEHR_COLORS } from "@/lib/mehr/brand";

/**
 * Bayroq o'chiq bo'lgandagi holat.
 *
 * "404" qaytarish mumkin edi, lekin bu yolg'on bo'lardi:
 * sahifa mavjud, u ATAYLAB yopilgan. Halol javob
 * foydalanuvchiga qachon qaytishni ham aytadi.
 */
export function MehrClosed() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
      <div
        className="mx-auto flex h-14 w-14 items-center justify-center rounded-full"
        style={{ background: "rgba(28,143,232,0.10)" }}
        aria-hidden
      >
        <Clock className="h-6 w-6" style={{ color: MEHR_COLORS.blue }} />
      </div>

      <h1 className="mt-6 font-display text-2xl font-bold" style={{ color: MEHR_COLORS.ink }}>
        MEHR 365+ hali ochilmagan
      </h1>

      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed" style={{ color: MEHR_COLORS.inkSoft }}>
        Bo&apos;lim tayyorlanmoqda. Ochilgach, ezgulik ishlari, volontyorlar va reyting
        shu yerda ko&apos;rinadi.
      </p>

      <Link
        href="/"
        className="mt-6 inline-block rounded-full px-5 py-2.5 text-sm font-bold text-white"
        style={{ background: MEHR_COLORS.blue }}
      >
        Ensiklopediyaga qaytish
      </Link>
    </div>
  );
}
