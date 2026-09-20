import Link from "next/link";
import { Sparkles } from "lucide-react";
import { MEHR_COLORS } from "@/lib/mehr/brand";

/**
 * Bo'sh holat.
 *
 * MEHR yangi tizim va ma'lumot dastlab kam bo'ladi. Bo'shlikni
 * "namuna" kartalar bilan to'ldirish vasvasa qiladi, lekin bu
 * foydalanuvchini aldaydi: u bosib ko'radi va hech nima
 * topmaydi.
 *
 * Shuning uchun bo'sh holat halol va KEYINGI QADAMNI aytadi.
 */
export function MehrEmpty({
  title,
  text,
  action,
}: {
  title: string;
  text: string;
  action?: { href: string; label: string };
}) {
  return (
    <div
      className="mt-10 rounded-2xl border border-dashed px-6 py-16 text-center"
      style={{ borderColor: MEHR_COLORS.border, background: "#fff" }}
    >
      <div
        className="mx-auto flex h-12 w-12 items-center justify-center rounded-full"
        style={{ background: "rgba(28,143,232,0.08)" }}
        aria-hidden
      >
        <Sparkles className="h-5 w-5" style={{ color: MEHR_COLORS.blue }} />
      </div>

      <p className="mt-4 font-display text-lg font-bold" style={{ color: MEHR_COLORS.ink }}>
        {title}
      </p>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed" style={{ color: MEHR_COLORS.inkSoft }}>
        {text}
      </p>

      {action && (
        <Link
          href={action.href}
          className="mt-5 inline-block rounded-full px-5 py-2.5 text-sm font-bold text-white"
          style={{ background: MEHR_COLORS.blue }}
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
