"use client";

import { useState, useTransition } from "react";
import { Eye, EyeOff } from "lucide-react";
import { setProfileVisibility } from "@/app/kabinet/maqolalar/actions";

/**
 * "PROFILDA KO'RSATISH" ALMASHTIRGICHI.
 *
 * Darhol javob beradi (optimistik), server rad etsa — eski holatga
 * qaytadi va sababini aytadi. Kutib turish tugmani "ishlamayapti"
 * degan taassurot qoldirardi.
 *
 * Faqat NASHR QILINGAN maqolada faol: qoralama profilda baribir
 * ko'rinmaydi va tugma u yerda chalg'itardi.
 */
export function ProfileVisibilityToggle({
  articleId,
  initial,
  published,
}: {
  articleId: string;
  initial: boolean;
  published: boolean;
}) {
  const [visible, setVisible] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = !visible;
    setVisible(next);
    setError(null);
    startTransition(async () => {
      const result = await setProfileVisibility(articleId, next);
      if (!result.ok) {
        setVisible(!next);
        setError(result.error ?? "Saqlab bo'lmadi.");
      }
    });
  }

  if (!published) {
    return (
      <p className="text-[11px] text-ink-soft">
        Nashr qilingandan keyin profilingizda avtomatik ko&apos;rinadi.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        role="switch"
        aria-checked={visible}
        onClick={toggle}
        disabled={pending}
        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold transition disabled:opacity-60 ${
          visible
            ? "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
            : "border-brand-soft bg-paper text-ink-soft hover:bg-white"
        }`}
      >
        {visible ? <Eye className="h-3.5 w-3.5" aria-hidden /> : <EyeOff className="h-3.5 w-3.5" aria-hidden />}
        {visible ? "Profilda ko'rinadi" : "Profilda yashirilgan"}
      </button>
      <span className="text-[11px] text-ink-soft">
        {visible ? "Bosing — profildan yashirish" : "Bosing — profilda ko'rsatish"}
      </span>
      {error && <span className="w-full text-[11px] font-semibold text-rose-600">{error}</span>}
    </div>
  );
}
