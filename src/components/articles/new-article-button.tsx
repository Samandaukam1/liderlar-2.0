"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { newArticle } from "@/app/kabinet/maqolalar/actions";

/**
 * YANGI MAQOLA.
 *
 * Avval SARLAVHA so'raladi, keyin muharrir ochiladi. Bo'sh maqola
 * yaratib, keyin sarlavha so'rash yarim to'ldirilgan qoralamalar
 * qoldirardi — odam oynani yopib ketsa, ro'yxatda nomsiz yozuv
 * turardi.
 */
export function NewArticleButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-md bg-liderlar-blue px-4 py-2 text-sm font-semibold text-white transition"
      >
        <Plus className="h-4 w-4" aria-hidden />
        Maqola yozish
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-liderlar-blue/30 bg-ice/30 p-4">
      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-navy">
          Maqola sarlavhasi
        </span>
        <input
          type="text"
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-md border border-brand-soft bg-white px-3 py-2 text-sm text-ink focus:border-liderlar-blue focus:outline-none"
          placeholder="Masalan: Yoshlar tashabbusi nimadan boshlanadi"
        />
      </label>
      <p className="mt-1 text-[11px] text-ink-soft">
        Keyin o&apos;zgartirishingiz mumkin.
      </p>

      {error && <p className="mt-2 text-xs font-semibold text-rose-600">{error}</p>}

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending || title.trim().length < 5}
          onClick={() =>
            startTransition(async () => {
              setError(null);
              const result = await newArticle(title);
              if (!result.ok || !result.id) {
                setError(result.error ?? "Yaratib bo'lmadi.");
                return;
              }
              router.push(`/kabinet/maqolalar/${result.id}`);
            })
          }
          className="rounded-md bg-liderlar-blue px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
        >
          {pending ? "Yaratilmoqda…" : "Davom etish"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            setOpen(false);
            setError(null);
          }}
          className="rounded-md border border-brand-soft px-3 py-1.5 text-xs font-semibold text-ink-soft"
        >
          Bekor qilish
        </button>
      </div>
    </div>
  );
}
