"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Award, ChevronDown, ExternalLink, FileUp, Pencil, Plus, Trash2 } from "lucide-react";
import {
  addCertificate,
  editCertificate,
  removeCertificate,
  removeEvidence,
} from "@/app/kabinet/profil/actions";
import {
  EVIDENCE_STAGE_TEXT,
  uploadEvidence,
  type EvidenceUploadStage,
} from "@/lib/profile-editor/evidence-client";
import { EVIDENCE_ACCEPT } from "@/lib/profile-editor/evidence-rules";
import { isExpired, TRUST_BADGE } from "@/lib/profile-editor/certificate-rules";
import type { CertificateRow } from "@/lib/profile-editor/certificate-service";

/**
 * SERTIFIKATLAR BO'LIMI (§8).
 *
 * MUHIM: foydalanuvchi o'z sertifikatini "Tasdiqlangan" deb
 * BELGILAY OLMAYDI. Formada ishonch darajasi maydoni YO'Q va server
 * ham uni parametr sifatida qabul qilmaydi — yangi sertifikat har
 * doim tekshiruvga boradi.
 */
export function CertificatesSection({
  certificates,
}: {
  certificates: CertificateRow[];
}) {
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const pending = certificates.filter((c) => c.trust === "pending_review").length;
  const verified = certificates.filter((c) => c.trust === "verified").length;

  return (
    <section className="rounded-lg border border-brand-soft bg-white">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="min-w-0">
          <span className="block font-semibold text-navy">Sertifikatlar</span>
          <span className="mt-0.5 block text-xs text-ink-soft">
            {certificates.length === 0
              ? "Hali sertifikat qo'shmagansiz"
              : `${certificates.length} ta`}
            {verified > 0 && ` · ${verified} tasdiqlangan`}
            {pending > 0 && ` · ${pending} tekshiruvda`}
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
            Sertifikat raqami va tekshirish havolasini yozsangiz, tahririyat
            da&apos;voni <b>mustaqil tekshirib</b> tasdiqlashi mumkin.
            Tasdiqlanmagan sertifikat ham profilda ko&apos;rinishi mumkin, lekin
            yonida <b>«Foydalanuvchi kiritgan»</b> deb yoziladi.
          </p>

          <ul className="space-y-2">
            {certificates.map((certificate) =>
              editingId === certificate.id ? (
                <li key={certificate.id}>
                  <CertificateForm
                    initial={certificate}
                    onDone={() => setEditingId(null)}
                    onCancel={() => setEditingId(null)}
                  />
                </li>
              ) : (
                <li key={certificate.id}>
                  <CertificateCard
                    certificate={certificate}
                    onEdit={() => setEditingId(certificate.id)}
                  />
                </li>
              ),
            )}
          </ul>

          {adding ? (
            <div className="mt-2">
              <CertificateForm
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
              Sertifikat qo&apos;shish
            </button>
          )}
        </div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * BITTA SERTIFIKAT
 * ------------------------------------------------------------------ */

const TRUST_CLASS: Record<CertificateRow["trust"], string> = {
  pending_review: "bg-amber-50 text-amber-800",
  user_entered: "bg-ice text-navy",
  verified: "bg-emerald-50 text-emerald-800",
  rejected: "bg-rose-50 text-rose-800",
};

function CertificateCard({
  certificate,
  onEdit,
}: {
  certificate: CertificateRow;
  onEdit: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const expired = isExpired(certificate.expiresOn, new Date());

  return (
    <div className="rounded-md border border-brand-soft bg-paper px-3 py-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-ink">{certificate.title}</p>
          {certificate.issuer && (
            <p className="text-xs text-ink-soft">{certificate.issuer}</p>
          )}

          {certificate.issuedOn && (
            <p className="mt-0.5 text-xs text-ink-soft">
              Berilgan: {certificate.issuedOn.slice(0, 10)}
              {certificate.expiresOn && ` · Muddati: ${certificate.expiresOn.slice(0, 10)}`}
            </p>
          )}

          <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <span
              className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${TRUST_CLASS[certificate.trust]}`}
            >
              {TRUST_BADGE[certificate.trust]}
            </span>

            {/*
              MUDDATI O'TGANI ALOHIDA belgilanadi, lekin sertifikat
              yashirilmaydi: u o'tmishdagi haqiqiy yutuq va uni
              yo'q qilish tarixni buzardi.
            */}
            {expired && (
              <span className="inline-block rounded-full bg-surface px-2 py-0.5 text-[11px] text-ink-soft">
                Muddati o&apos;tgan
              </span>
            )}
          </span>

          {certificate.trust === "rejected" && certificate.reviewNote && (
            /* §27: foydalanuvchi tahririyat izohini ko'rishi kerak. */
            <p className="mt-1 text-[11px] leading-snug text-rose-900">
              {certificate.reviewNote}
            </p>
          )}

          <EvidenceBlock certificate={certificate} />
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
        <div className="mt-2 rounded-md border border-rose-200 bg-rose-50 px-2 py-2">
          <p className="text-xs text-rose-900">
            Sertifikat o&apos;chiriladi. Qaytarib bo&apos;lmaydi.
          </p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  const result = await removeCertificate(certificate.id);
                  if (!result.ok) setError(result.error ?? "O'chirib bo'lmadi.");
                  else router.refresh();
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

/* ------------------------------------------------------------------ *
 * DALIL FAYLI (§8)
 *
 * Fayl YOPIQ bucketda. Sahifaga uning manzili chiqmaydi — "Ochish"
 * server marshrutiga boradi, u egalikni tekshirib, 60 soniyalik
 * imzolangan havolaga yo'naltiradi.
 * ------------------------------------------------------------------ */

function EvidenceBlock({ certificate }: { certificate: CertificateRow }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [stage, setStage] = useState<EvidenceUploadStage | null>(null);
  const [removing, startRemoving] = useTransition();
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const busy = stage !== null || removing;
  const hasEvidence = certificate.evidence !== null;

  async function onPick(file: File) {
    setError(null);
    try {
      await uploadEvidence(file, certificate.id, setStage);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Yuklab bo'lmadi.");
    } finally {
      setStage(null);
    }
  }

  function onRemove() {
    startRemoving(async () => {
      setError(null);
      const result = await removeEvidence(certificate.id);
      if (!result.ok) {
        setError(result.error ?? "O'chirib bo'lmadi.");
        return;
      }
      setConfirmRemove(false);
      router.refresh();
    });
  }

  return (
    <div className="mt-2">
      {certificate.evidence ? (
        <p className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-soft">
          <span>Dalil: {certificate.evidence.label}</span>
          <a
            href={`/api/profile/certificate-evidence/${certificate.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 font-semibold text-liderlar-blue underline"
          >
            Ochish
            <ExternalLink className="h-3 w-3" aria-hidden />
          </a>
          <button
            type="button"
            disabled={busy}
            onClick={() => setConfirmRemove(true)}
            className="font-semibold text-rose-700 underline disabled:opacity-50"
          >
            O&apos;chirish
          </button>
        </p>
      ) : (
        certificate.evidenceUrl && (
          /*
           * ESKI OMMAVIY RASM — faqat ko'rsatiladi. `unoptimized`:
           * eski havola Next optimizatori ruxsat bergan hostda
           * bo'lmasligi mumkin va sahifa xatoga tushmasin.
           */
          <span className="mb-1 block h-20 w-28 overflow-hidden rounded border border-brand-soft bg-white">
            <Image
              src={certificate.evidenceUrl}
              alt={`${certificate.title} dalili`}
              width={112}
              height={80}
              sizes="112px"
              loading="lazy"
              unoptimized
              className="h-full w-full object-cover"
            />
          </span>
        )
      )}

      {confirmRemove && (
        <div className="mb-1 rounded-md border border-rose-200 bg-rose-50 px-2 py-1.5">
          <p className="text-[11px] text-rose-900">
            Dalil fayli o&apos;chiriladi va sertifikat qayta tekshiruvga yuboriladi.
          </p>
          <div className="mt-1.5 flex gap-2">
            <button
              type="button"
              disabled={removing}
              onClick={onRemove}
              className="rounded bg-rose-700 px-2 py-0.5 text-[11px] font-semibold text-white disabled:opacity-50"
            >
              {removing ? "O'chirilmoqda…" : "O'chirish"}
            </button>
            <button
              type="button"
              disabled={removing}
              onClick={() => setConfirmRemove(false)}
              className="rounded border border-rose-200 px-2 py-0.5 text-[11px] font-semibold text-rose-900"
            >
              Bekor qilish
            </button>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={EVIDENCE_ACCEPT}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) void onPick(file);
        }}
      />

      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-1 text-[11px] font-semibold text-liderlar-blue disabled:opacity-50"
      >
        <FileUp className="h-3.5 w-3.5" aria-hidden />
        {stage
          ? EVIDENCE_STAGE_TEXT[stage]
          : hasEvidence || certificate.evidenceUrl
            ? "Dalilni almashtirish"
            : "Dalil yuklash (PDF yoki rasm)"}
      </button>

      <p className="mt-1 text-[11px] leading-snug text-ink-soft">
        10 MB gacha. Faylni faqat siz va tahririyat ko&apos;radi. Dalil
        almashtirilsa, sertifikat qayta tekshiriladi.
      </p>
      {error && <p className="mt-1 text-[11px] font-semibold text-rose-600">{error}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * FORMA
 * ------------------------------------------------------------------ */

function CertificateForm({
  initial,
  onDone,
  onCancel,
}: {
  initial?: CertificateRow;
  onDone: () => void;
  onCancel: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [issuer, setIssuer] = useState(initial?.issuer ?? "");
  const [issuedOn, setIssuedOn] = useState(initial?.issuedOn ?? "");
  const [expiresOn, setExpiresOn] = useState(initial?.expiresOn ?? "");
  const [credentialNumber, setCredentialNumber] = useState(
    initial?.credentialNumber ?? "",
  );
  const [credentialUrl, setCredentialUrl] = useState(initial?.credentialUrl ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");

  function submit() {
    startTransition(async () => {
      setError(null);
      const input = {
        title,
        issuer,
        issuedOn,
        expiresOn,
        credentialNumber,
        credentialUrl,
        description,
      };

      const result = initial
        ? await editCertificate(initial.id, input)
        : await addCertificate(input);

      if (!result.ok) {
        setError(result.error ?? "Saqlab bo'lmadi.");
        return;
      }
      router.refresh();
      onDone();
    });
  }

  return (
    <div className="rounded-md border border-liderlar-blue/30 bg-ice/30 px-3 py-3">
      <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-navy">
        <Award className="h-4 w-4" aria-hidden />
        {initial ? "Sertifikatni tahrirlash" : "Yangi sertifikat"}
      </p>

      <Field label="Sertifikat nomi">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
          placeholder="Masalan: Loyiha boshqaruvi bo'yicha sertifikat"
        />
      </Field>

      <Field label="Beruvchi tashkilot (ixtiyoriy)">
        <input
          type="text"
          value={issuer}
          onChange={(e) => setIssuer(e.target.value)}
          className={inputClass}
          placeholder="Masalan: PMI"
        />
      </Field>

      <div className="grid grid-cols-2 gap-2">
        <Field label="Berilgan sana">
          <input
            type="date"
            value={issuedOn}
            onChange={(e) => setIssuedOn(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Amal qilish muddati">
          <input
            type="date"
            value={expiresOn}
            onChange={(e) => setExpiresOn(e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>

      <p className="mb-2 text-[11px] text-ink-soft">
        Muddatsiz sertifikat bo&apos;lsa, muddat maydonini bo&apos;sh qoldiring.
      </p>

      <Field label="Sertifikat raqami (ixtiyoriy)">
        <input
          type="text"
          value={credentialNumber}
          onChange={(e) => setCredentialNumber(e.target.value)}
          className={inputClass}
          placeholder="Masalan: 1234-5678"
        />
      </Field>

      <Field label="Tekshirish havolasi (ixtiyoriy)">
        <input
          type="url"
          value={credentialUrl}
          onChange={(e) => setCredentialUrl(e.target.value)}
          className={inputClass}
          placeholder="https://..."
        />
      </Field>

      <Field label="Izoh (ixtiyoriy)">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className={inputClass}
          placeholder="Qisqacha tushuntirish"
        />
      </Field>

      <p className="mb-2 rounded-md border border-brand-soft bg-white px-2 py-1.5 text-[11px] leading-relaxed text-ink-soft">
        Saqlagandan keyin sertifikat <b>tekshiruvga</b> yuboriladi. Ishonch
        belgisini tahririyat qo&apos;yadi.
      </p>

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
