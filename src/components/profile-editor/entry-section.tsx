"use client";

import { useState, useTransition } from "react";
import { ChevronDown, Pencil, Plus, Trash2 } from "lucide-react";
import { addEntry, editEntry, removeEntry } from "@/app/kabinet/profil/actions";
import type { EntryRow } from "@/lib/profile-editor/entry-service";

/**
 * BITTA BO'LIM — TA'LIM, ISH TAJRIBASI, YUTUQLAR…
 *
 * §5: bitta katta qo'rqinchli forma EMAS. Har bo'lim yopiq turadi va
 * foydalanuvchi faqat o'zi kerak bo'lganini ochadi.
 *
 * TEXNIK NOMLAR KO'RSATILMAYDI: `candidate_id`, jadval nomi, `jsonb`,
 * ichki id lar hech qayerda chiqmaydi. Bo'lim turi `kind` propida
 * bor, lekin u ekranda ko'rinmaydi.
 */
export function EntrySection({
  kind,
  label,
  description,
  entries,
  hasDates,
  needsReview,
  example,
}: {
  kind: string;
  label: string;
  description: string;
  entries: EntryRow[];
  hasDates: boolean;
  /** Bu bo'lim o'zgarishlari tekshiruvdan o'tadimi. */
  needsReview: boolean;
  /** Foydalanuvchiga namuna — §5 "clear examples". */
  example: string;
}) {
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const pending = entries.filter((e) => e.reviewState === "pending_review").length;
  const rejected = entries.filter((e) => e.reviewState === "rejected").length;

  return (
    <section className="rounded-lg border border-brand-soft bg-white">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="min-w-0">
          <span className="block font-semibold text-navy">{label}</span>
          <span className="mt-0.5 block text-xs text-ink-soft">
            {entries.length === 0 ? "Hali to'ldirilmagan" : `${entries.length} ta yozuv`}
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
          <p className="mb-3 text-xs leading-relaxed text-ink-soft">
            {description}
            {needsReview && (
              <>
                {" "}
                <b>Bu bo&apos;limdagi o&apos;zgarishlar tahririyat tekshiruvidan o&apos;tadi</b> —
                tasdiqlangandan keyin profilingizda ko&apos;rinadi.
              </>
            )}
          </p>

          {entries.length === 0 && !adding && (
            <p className="mb-3 rounded-md border border-brand-soft bg-paper px-3 py-2 text-xs text-ink-soft">
              Namuna: {example}
            </p>
          )}

          <ul className="space-y-2">
            {entries.map((entry) =>
              editingId === entry.id ? (
                <li key={entry.id}>
                  <EntryForm
                    kind={kind}
                    hasDates={hasDates}
                    initial={entry}
                    onDone={() => setEditingId(null)}
                    onCancel={() => setEditingId(null)}
                  />
                </li>
              ) : (
                <li key={entry.id}>
                  <EntryCard
                    entry={entry}
                    kind={kind}
                    onEdit={() => setEditingId(entry.id)}
                  />
                </li>
              ),
            )}
          </ul>

          {adding ? (
            <div className="mt-2">
              <EntryForm
                kind={kind}
                hasDates={hasDates}
                onDone={() => setAdding(false)}
                onCancel={() => setAdding(false)}
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-brand-soft px-3 py-2 text-xs font-semibold text-liderlar-blue transition hover:bg-ice/50"
            >
              <Plus className="h-4 w-4" aria-hidden />
              Qo&apos;shish
            </button>
          )}
        </div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * BITTA YOZUV
 * ------------------------------------------------------------------ */

function EntryCard({
  entry,
  kind,
  onEdit,
}: {
  entry: EntryRow;
  kind: string;
  onEdit: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="rounded-md border border-brand-soft bg-paper px-3 py-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-ink">{entry.title}</p>
          {entry.subtitle && (
            <p className="text-xs text-ink-soft">{entry.subtitle}</p>
          )}
          {(entry.dateFrom || entry.dateTo) && (
            <p className="mt-0.5 text-xs text-ink-soft">
              {formatYear(entry.dateFrom)}
              {entry.dateTo ? ` – ${formatYear(entry.dateTo)}` : " – hozirgacha"}
            </p>
          )}
          {entry.description && (
            <p className="mt-1 text-xs leading-relaxed text-ink">{entry.description}</p>
          )}

          <ReviewBadge entry={entry} />
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
         * Yozuvni qaytarib bo'lmaydi va tasodifan bosilgan tugma
         * odamning yillar davomida yiqqan ma'lumotini yo'q qilardi.
         */
        <div className="mt-2 rounded-md border border-rose-200 bg-rose-50 px-2 py-2">
          <p className="text-xs text-rose-900">
            Bu yozuv o&apos;chiriladi. Qaytarib bo&apos;lmaydi.
          </p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  const result = await removeEntry(kind, entry.id);
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
 * §22: nashr bo'lmagan narsani "profilga joylandi" deb ko'rsatish
 * yolg'on bo'lardi. Shuning uchun har holat aynan o'z nomi bilan
 * aytiladi.
 */
function ReviewBadge({ entry }: { entry: EntryRow }) {
  if (entry.reviewState === "published") return null;

  if (entry.reviewState === "pending_review") {
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
      {entry.reviewNote && (
        <span className="mt-1 block text-[11px] leading-snug text-rose-900">
          {entry.reviewNote}
        </span>
      )}
    </span>
  );
}

/* ------------------------------------------------------------------ *
 * FORMA
 * ------------------------------------------------------------------ */

function EntryForm({
  kind,
  hasDates,
  initial,
  onDone,
  onCancel,
}: {
  kind: string;
  hasDates: boolean;
  initial?: EntryRow;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [subtitle, setSubtitle] = useState(initial?.subtitle ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [dateFrom, setDateFrom] = useState(initial?.dateFrom ?? "");
  const [dateTo, setDateTo] = useState(initial?.dateTo ?? "");
  const [url, setUrl] = useState(initial?.url ?? "");

  function submit() {
    startTransition(async () => {
      setError(null);
      const input = {
        title,
        subtitle,
        description,
        url,
        ...(hasDates ? { date_from: dateFrom, date_to: dateTo } : {}),
      };

      const result = initial
        ? await editEntry(kind, initial.id, input)
        : await addEntry(kind, input);

      if (!result.ok) {
        setError(result.error ?? "Saqlab bo'lmadi.");
        return;
      }
      onDone();
    });
  }

  return (
    <div className="rounded-md border border-liderlar-blue/30 bg-ice/30 px-3 py-3">
      <Field label="Nomi">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
          placeholder="Masalan: Toshkent davlat universiteti"
        />
      </Field>

      <Field label="Qo'shimcha (ixtiyoriy)">
        <input
          type="text"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          className={inputClass}
          placeholder="Masalan: Bakalavr, Jurnalistika"
        />
      </Field>

      {hasDates && (
        <div className="grid grid-cols-2 gap-2">
          {/*
            `type="date"` — brauzerning o'z sana tanlagichi.
            O'zimizning tanlagichni yozish mobil qurilmalarda
            yomonroq ishlardi: brauzer tanlagichi tizimga mos
            keladi va klaviatura bilan ham ishlaydi.
          */}
          <Field label="Boshlanishi">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Tugashi">
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
      )}

      {hasDates && (
        <p className="mb-2 text-[11px] text-ink-soft">
          Hali davom etayotgan bo&apos;lsa, tugash sanasini bo&apos;sh qoldiring.
        </p>
      )}

      <Field label="Havola (ixtiyoriy)">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className={inputClass}
          placeholder="https://..."
        />
      </Field>

      <Field label="Izoh (ixtiyoriy)">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className={inputClass}
          placeholder="Qisqacha tushuntirish"
        />
      </Field>

      {error && <p className="mb-2 text-xs font-semibold text-rose-600">{error}</p>}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending || title.trim().length < 2}
          onClick={submit}
          className="rounded-md bg-liderlar-blue px-3 py-1.5 text-xs font-semibold text-white transition disabled:opacity-50"
        >
          {pending ? "Saqlanmoqda…" : "Saqlash"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={onCancel}
          className="rounded-md border border-brand-soft px-3 py-1.5 text-xs font-semibold text-ink-soft"
        >
          Bekor qilish
        </button>
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-md border border-brand-soft bg-white px-3 py-2 text-sm text-ink placeholder:text-ink-soft/60 focus:border-liderlar-blue focus:outline-none";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="mb-2 block">
      <span className="mb-1 block text-xs font-semibold text-navy">{label}</span>
      {children}
    </label>
  );
}

/** Sanadan faqat yilni ko'rsatadi: ro'yxatda kun ortiqcha shovqin. */
function formatYear(value: string | null): string {
  if (!value) return "";
  return value.slice(0, 4);
}
