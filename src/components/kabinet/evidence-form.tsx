"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, Send } from "lucide-react";
import {
  checkEvidence,
  checkEvidenceFile,
  MAX_EVIDENCE_PHOTOS,
  ALLOWED_EVIDENCE_TYPES,
} from "@/lib/mehr/submission-rules";

/**
 * Dalil yuborish formasi (§10).
 *
 * BRAUZERDAGI TEKSHIRUV — QULAYLIK, CHEGARA EMAS.
 *
 * Xuddi shu qoidalar serverda ham qayta qo'llanadi. Bu yerdagi
 * tekshiruv odam "Yuborish" ni bosib, keyin xato olishidan
 * qutqaradi — xolos.
 */
export function EvidenceForm({
  activityId,
  initialTitle,
  hasCover,
  existingPhotoCount,
  startsAt,
  onClose,
}: {
  activityId: string;
  initialTitle: string;
  hasCover: boolean;
  existingPhotoCount: number;
  startsAt: string | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState("");
  const [purpose, setPurpose] = useState("");
  const [resultSummary, setResultSummary] = useState("");
  const [beneficiaries, setBeneficiaries] = useState("");
  const [notes, setNotes] = useState("");

  const [cover, setCover] = useState<File | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  const beneficiaryCount = beneficiaries.trim() === "" ? null : Number(beneficiaries);

  const verdict = checkEvidence({
    title,
    description,
    purpose,
    beneficiaryCount: Number.isFinite(beneficiaryCount) ? beneficiaryCount : null,
    hasCover: hasCover || cover !== null,
    photoCount: existingPhotoCount + photos.length,
    startsAt,
  });

  function addPhotos(files: FileList | null) {
    if (!files) return;
    setError(null);

    const accepted: File[] = [];
    for (const file of Array.from(files)) {
      const check = checkEvidenceFile({ name: file.name, size: file.size, type: file.type });
      if (!check.ok) {
        setError(check.error);
        continue;
      }
      accepted.push(file);
    }

    setPhotos((prev) => [...prev, ...accepted].slice(0, MAX_EVIDENCE_PHOTOS));
  }

  function submit() {
    startTransition(async () => {
      setError(null);

      const form = new FormData();
      form.set(
        "payload",
        JSON.stringify({
          activityId,
          title: title.trim(),
          description: description.trim(),
          purpose: purpose.trim(),
          resultSummary: resultSummary.trim() || undefined,
          beneficiaryCount: beneficiaryCount ?? 0,
          notes: notes.trim() || undefined,
        }),
      );
      if (cover) form.set("cover", cover);
      for (const p of photos) form.append("photos", p);

      const response = await fetch("/api/mehr/evidence", { method: "POST", body: form });
      const json = (await response.json()) as { ok?: boolean; error?: string };

      if (!response.ok || !json.ok) {
        setError(json.error ?? "Yuborib bo'lmadi.");
        return;
      }

      // Sahifa serverda qayta chizilsin: holat va ro'yxat yangilansin.
      router.refresh();
      onClose();
    });
  }

  return (
    <div className="mt-3 rounded-lg border border-liderlar-blue/40 bg-liderlar-blue/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="font-display text-base font-bold text-navy">Dalil yuborish</h4>
          <p className="mt-0.5 text-xs text-ink-soft">
            Ball va sertifikat admin tasdig&apos;idan keyin beriladi.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Yopish"
          className="rounded-md p-1 text-ink-soft hover:bg-white"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>

      <div className="mt-4 space-y-3">
        <Field label="Yakuniy nom *">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
            placeholder="Tadbirning yakuniy nomi"
          />
        </Field>

        <Field label="Maqsad *">
          <textarea
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            rows={2}
            className={inputClass}
            placeholder="Nima uchun o'tkazildi?"
          />
        </Field>

        <Field label="Nima qilindi *">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className={inputClass}
            placeholder="Tadbirda aynan nima qilingani — qisqa va aniq."
          />
        </Field>

        <Field label="Natija">
          <textarea
            value={resultSummary}
            onChange={(e) => setResultSummary(e.target.value)}
            rows={2}
            className={inputClass}
            placeholder="Qanday o'zgarish bo'ldi?"
          />
        </Field>

        <Field label="Nafi tekkanlar soni *">
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={beneficiaries}
            onChange={(e) => setBeneficiaries(e.target.value)}
            className={inputClass}
            placeholder="0"
          />
        </Field>

        <Field label={hasCover ? "Muqova rasmi (almashtirish)" : "Muqova rasmi *"}>
          <input
            type="file"
            accept={ALLOWED_EVIDENCE_TYPES.join(",")}
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              if (!file) return setCover(null);
              const check = checkEvidenceFile({
                name: file.name,
                size: file.size,
                type: file.type,
              });
              if (!check.ok) {
                setError(check.error);
                return;
              }
              setError(null);
              setCover(file);
            }}
            className="w-full text-sm text-ink-soft file:mr-3 file:rounded-md file:border-0 file:bg-liderlar-blue/10 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-liderlar-blue"
          />
          {cover && <p className="mt-1 text-xs text-ink-soft">{cover.name}</p>}
        </Field>

        <Field
          label={`Dalil rasmlari * (${existingPhotoCount + photos.length}/${MAX_EVIDENCE_PHOTOS})`}
        >
          <input
            type="file"
            multiple
            accept={ALLOWED_EVIDENCE_TYPES.join(",")}
            onChange={(e) => addPhotos(e.target.files)}
            className="w-full text-sm text-ink-soft file:mr-3 file:rounded-md file:border-0 file:bg-liderlar-blue/10 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-liderlar-blue"
          />
          {photos.length > 0 && (
            <ul className="mt-2 space-y-1">
              {photos.map((p, i) => (
                <li
                  key={`${p.name}-${i}`}
                  className="flex items-center justify-between gap-2 text-xs text-ink-soft"
                >
                  <span className="truncate">{p.name}</span>
                  <button
                    type="button"
                    onClick={() => setPhotos((prev) => prev.filter((_, j) => j !== i))}
                    className="shrink-0 text-rose-600 hover:underline"
                  >
                    olib tashlash
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Field>

        <Field label="Qo'shimcha izoh">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className={inputClass}
            placeholder="Adminga aytmoqchi bo'lgan narsangiz"
          />
        </Field>
      </div>

      {error && (
        <p className="mt-3 rounded-md bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
          {error}
        </p>
      )}

      {/*
        NIMA YETISHMAYOTGANI ANIQ AYTILADI.

        "To'ldiring" degan umumiy xabar odamni nima qilishini
        bilmay qoldiradi.
      */}
      {!verdict.ok && (
        <p className="mt-3 text-xs text-ink-soft">
          Yetishmayapti: <strong>{verdict.missing.join(", ")}</strong>
        </p>
      )}

      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          disabled={!verdict.ok || pending}
          onClick={submit}
          className="inline-flex h-9 items-center gap-1.5 rounded-md bg-liderlar-blue px-4 text-sm font-semibold text-white transition hover:bg-electric-blue disabled:cursor-not-allowed disabled:opacity-40"
        >
          {pending ? (
            <>
              <Upload className="h-3.5 w-3.5 animate-pulse" aria-hidden />
              Yuborilmoqda…
            </>
          ) : (
            <>
              <Send className="h-3.5 w-3.5" aria-hidden />
              Tasdiqlashga yuborish
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="h-9 rounded-md border border-brand-soft px-4 text-sm font-semibold text-navy"
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
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-navy">{label}</span>
      {children}
    </label>
  );
}
