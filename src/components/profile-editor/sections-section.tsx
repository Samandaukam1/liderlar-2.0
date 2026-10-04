"use client";

import { useState, useTransition } from "react";
import { ChevronDown, Pencil, Plus, Trash2 } from "lucide-react";
import {
  addSection,
  editSection,
  removeSection,
} from "@/app/kabinet/profil/actions";
import type { SectionRow } from "@/lib/profile-editor/section-service";

/**
 * BIOGRAFIYA MATNI — BO'LIMLAR.
 *
 * Ommaviy biografiyadagi uzun matn shu bo'limlardan yig'iladi, ya'ni
 * bu yerda tahrirlangan narsa AYNAN sahifadagi matn. Boshqa
 * bo'limlardagi naqsh saqlanadi (§5): yopiq turadi, namuna
 * ko'rsatadi, ko'rik holatini halol aytadi.
 */
export function SectionsSection({ sections }: { sections: SectionRow[] }) {
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const pending = sections.filter((s) => s.reviewState === "pending_review").length;
  const rejected = sections.filter((s) => s.reviewState === "rejected").length;

  return (
    <section className="rounded-lg border border-brand-soft bg-white">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="min-w-0">
          <span className="block font-semibold text-navy">Biografiya matni</span>
          <span className="mt-0.5 block text-xs text-ink-soft">
            {sections.length === 0 ? "Hali to'ldirilmagan" : `${sections.length} ta bo'lim`}
            {pending > 0 && ` · ${pending} ta tekshiruvda`}
            {rejected > 0 && ` · ${rejected} ta qaytarilgan`}
          </span>
        </span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-ink-soft transition ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {open && (
        <div className="border-t border-brand-soft px-4 py-3">
          {/*
            MATN HALOL: "hammasi tekshiruvdan o'tadi" deyish YOLG'ON bo'lardi.

            Siyosat (`sectionPolicy`) o'zini TAQDIM ETISH bo'limlarini
            ("Men haqimda", "Qiziqishlarim") darhol nashr qiladi — ularda
            tekshirib bo'ladigan da'vo yo'q. Qolgan sarlavhalar ko'rikka
            boradi. Har bo'limning haqiqiy holati o'z yorlig'ida ko'rinadi.
          */}
          <p className="mb-3 text-xs leading-relaxed text-ink-soft">
            Ommaviy biografiyangizdagi matn shu bo&apos;limlardan yig&apos;iladi.
            &laquo;Men haqimda&raquo;, &laquo;Qiziqishlarim&raquo; kabi o&apos;zingiz
            haqidagi bo&apos;limlar <b>darhol</b> joylanadi; qolganlari{" "}
            <b>tahririyat tekshiruvidan</b> o&apos;tadi va tasdiqlangandan keyin
            ko&apos;rinadi. Tahririyat tayyorlagan matnni o&apos;zgartirsangiz, u
            qaytadan tekshiruvga boradi va shu vaqtda ommaviy sahifada
            ko&apos;rinmaydi.
          </p>

          {sections.length === 0 && !adding && (
            <p className="mb-3 rounded-md border border-brand-soft bg-paper px-3 py-2 text-xs text-ink-soft">
              Namuna: «Hayot yo&apos;li» — 1990-yilda Samarqandda tug&apos;ilgan…
            </p>
          )}

          <ul className="space-y-2">
            {sections.map((section) =>
              editingId === section.id ? (
                <li key={section.id}>
                  <SectionForm
                    initial={section}
                    onDone={() => setEditingId(null)}
                    onCancel={() => setEditingId(null)}
                  />
                </li>
              ) : (
                <li key={section.id}>
                  <SectionCard section={section} onEdit={() => setEditingId(section.id)} />
                </li>
              ),
            )}
          </ul>

          {adding ? (
            <div className="mt-2">
              <SectionForm onDone={() => setAdding(false)} onCancel={() => setAdding(false)} />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-brand-soft px-3 py-2 text-xs font-semibold text-liderlar-blue transition hover:bg-ice/50"
            >
              <Plus className="h-4 w-4" aria-hidden />
              Bo&apos;lim qo&apos;shish
            </button>
          )}
        </div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * BITTA BO'LIM
 * ------------------------------------------------------------------ */

function SectionCard({
  section,
  onEdit,
}: {
  section: SectionRow;
  onEdit: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="rounded-md border border-brand-soft bg-paper px-3 py-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-ink">{section.title || "(sarlavhasiz)"}</p>
          {section.content && (
            /*
             * MATNNING BOSHI — to'lig'i emas.
             *
             * Biografiya bo'limi 50 000 belgigacha bo'lishi mumkin;
             * ro'yxatda to'liq ko'rsatish sahifani o'qib bo'lmas
             * qilardi. To'lig'i tahrirlash formasida.
             */
            <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-ink-soft">
              {section.content}
            </p>
          )}

          {section.fromEditorial && section.reviewState === "published" && (
            <span className="mt-1.5 inline-block rounded-full bg-ice px-2 py-0.5 text-[11px] font-semibold text-navy">
              Tahririyat tayyorlagan
            </span>
          )}

          <ReviewBadge section={section} />
        </div>

        <span className="flex shrink-0 gap-1">
          <button
            type="button"
            onClick={onEdit}
            aria-label="Tahrirlash"
            className="rounded p-1.5 text-ink-soft transition hover:bg-white hover:text-ink"
          >
            <Pencil className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => setConfirming(true)}
            aria-label="O'chirish"
            className="rounded p-1.5 text-ink-soft transition hover:bg-white hover:text-rose-600"
          >
            <Trash2 className="h-4 w-4" aria-hidden />
          </button>
        </span>
      </div>

      {confirming && (
        /*
         * O'CHIRISH TASDIQ SO'RAYDI.
         *
         * Biografiya matni uzun va qaytarib bo'lmaydi — tasodifan
         * bosilgan tugma odamning butun hayot yo'lini yo'q qilardi.
         */
        <div className="mt-2 rounded-md border border-rose-200 bg-rose-50 px-2 py-2">
          <p className="text-xs text-rose-900">
            Bu bo&apos;lim o&apos;chiriladi. Qaytarib bo&apos;lmaydi.
          </p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  const result = await removeSection(section.id);
                  if (!result.ok) setError(result.error ?? "O'chirib bo'lmadi.");
                })
              }
              className="rounded bg-rose-700 px-2.5 py-1 text-xs font-semibold text-white disabled:opacity-50"
            >
              {pending ? "O'chirilmoqda…" : "O'chirish"}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => setConfirming(false)}
              className="rounded border border-rose-200 px-2.5 py-1 text-xs font-semibold text-rose-900"
            >
              Bekor qilish
            </button>
          </div>
        </div>
      )}

      {error && <p className="mt-1 text-xs font-semibold text-rose-600">{error}</p>}
    </div>
  );
}

/**
 * Ko'rik holati belgisi.
 *
 * §22: nashr bo'lmagan matnni "profilda" deb ko'rsatish yolg'on
 * bo'lardi.
 */
function ReviewBadge({ section }: { section: SectionRow }) {
  if (section.reviewState === "published") return null;

  if (section.reviewState === "pending_review") {
    return (
      <span className="mt-1.5 inline-block rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
        Tekshiruvda — profilda hali ko&apos;rinmaydi
      </span>
    );
  }

  return (
    <span className="mt-1.5 block">
      <span className="inline-block rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-800">
        Qaytarildi
      </span>
      {/* Tahririyat izohi KO'RSATILADI (§27): odam nima tuzatishni bilishi kerak. */}
      {section.reviewNote && (
        <span className="mt-1 block text-[11px] leading-snug text-rose-900">
          {section.reviewNote}
        </span>
      )}
    </span>
  );
}

/* ------------------------------------------------------------------ *
 * FORMA
 * ------------------------------------------------------------------ */

function SectionForm({
  initial,
  onDone,
  onCancel,
}: {
  initial?: SectionRow;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [content, setContent] = useState(initial?.content ?? "");

  function submit() {
    startTransition(async () => {
      setError(null);
      const result = initial
        ? await editSection(initial.id, { title, content })
        : await addSection({ title, content });

      if (!result.ok) {
        setError(result.error ?? "Saqlab bo'lmadi.");
        return;
      }
      onDone();
    });
  }

  return (
    <div className="rounded-md border border-liderlar-blue/30 bg-ice/40 px-3 py-3">
      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-navy">Bo&apos;lim sarlavhasi</span>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={240}
          placeholder="Masalan: Hayot yo'li"
          className="w-full rounded-md border border-brand-soft px-2.5 py-2 text-sm"
        />
      </label>

      <label className="mt-2 block">
        <span className="mb-1 block text-xs font-semibold text-navy">Matn</span>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={50000}
          rows={10}
          placeholder="Bo'lim matnini yozing. Yangi xatboshi uchun bo'sh qator qoldiring."
          className="w-full rounded-md border border-brand-soft px-2.5 py-2 text-sm leading-relaxed"
        />
        <span className="mt-1 block text-right text-[11px] text-ink-soft">
          {content.length.toLocaleString("uz-UZ")} / 50 000
        </span>
      </label>

      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={submit}
          className="rounded-md bg-liderlar-blue px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
        >
          {pending ? "Saqlanmoqda…" : "Saqlash"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={onCancel}
          className="rounded-md border border-brand-soft px-3 py-2 text-xs font-semibold text-ink-soft"
        >
          Bekor qilish
        </button>
      </div>

      {error && <p className="mt-2 text-xs font-semibold text-rose-600">{error}</p>}
    </div>
  );
}
