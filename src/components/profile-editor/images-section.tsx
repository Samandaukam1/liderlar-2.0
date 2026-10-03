"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, ImagePlus, Pencil, Trash2, UserCircle, X } from "lucide-react";
import {
  PROGRESS_TEXT,
  uploadProfileImage,
  type UploadProgress,
} from "@/lib/profile-editor/upload-client";
import { ALT_MAX_LENGTH, IMAGE_RULES } from "@/lib/profile-editor/image-rules";
import { deleteGalleryImage, saveGalleryAltText } from "@/app/kabinet/profil/actions";
import type { GalleryImage } from "@/lib/profile-editor/upload-service";

/**
 * RASMLAR BO'LIMI.
 *
 * §7: ko'rish, yuklash jarayoni, tur va o'lcham tekshiruvi.
 *
 * KO'RISH (preview) YUKLASHDAN OLDIN KO'RSATILADI: odam qanday rasm
 * tanlaganini saqlashdan oldin ko'rishi kerak, aks holda xato faylni
 * yuklab, keyin o'chirishga majbur bo'lardi.
 */
export function ImagesSection({
  avatarUrl,
  gallery,
}: {
  avatarUrl: string | null;
  gallery: GalleryImage[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <section className="rounded-lg border border-brand-soft bg-white">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span>
          <span className="block font-semibold text-navy">Rasmlar</span>
          <span className="mt-0.5 block text-xs text-ink-soft">
            Profil rasmi
            {gallery.length > 0
              ? ` va ${gallery.length} ta qo'shimcha rasm`
              : " va qo'shimcha rasmlar"}
          </span>
        </span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-ink-soft transition ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {open && (
        <div className="border-t border-brand-soft px-4 py-3">
          <AvatarBlock avatarUrl={avatarUrl} />
          <GalleryBlock gallery={gallery} />

          <p className="mt-3 text-[11px] leading-relaxed text-ink-soft">
            Rasm yuklashdan oldin brauzeringizda kichraytiriladi — bu
            yuklashni tezlashtiradi va sayt tezligini saqlaydi. JPG, PNG yoki
            WebP qabul qilinadi.
          </p>
        </div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * PROFIL RASMI
 * ------------------------------------------------------------------ */

function AvatarBlock({ avatarUrl }: { avatarUrl: string | null }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onPick(file: File) {
    setError(null);

    /*
     * KO'RISH DARHOL — yuklashdan oldin.
     *
     * `createObjectURL` fayl mazmunini nusxalamaydi, ya'ni katta
     * rasm uchun ham tez ishlaydi.
     */
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    const result = await uploadProfileImage(file, "avatar", setProgress);
    setProgress(null);

    /*
     * VAQTINCHALIK MANZIL BO'SHATILADI.
     *
     * Bo'shatmasak, sahifa yopilmaguncha fayl xotirada qolib
     * ketardi — bir nechta rasm tanlangan holatda bu sezilarli.
     */
    URL.revokeObjectURL(objectUrl);
    setPreview(null);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    // Server yangi rasmni yozdi — sahifani qayta o'qiymiz.
    router.refresh();
  }

  const shown = preview ?? avatarUrl;

  return (
    <div className="mb-4">
      <p className="mb-2 text-xs font-semibold text-navy">Profil rasmi</p>

      <div className="flex items-center gap-3">
        <span className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-brand-soft bg-paper">
          {shown ? (
            /*
             * `unoptimized` — FAQAT ko'rish uchun.
             *
             * `blob:` manzilini Next optimizatori yuklay olmaydi.
             * Saqlangan rasm esa oddiy `Image` bilan ko'rsatiladi va
             * optimizatordan o'tadi.
             */
            <Image
              src={shown}
              alt="Profil rasmi"
              width={80}
              height={80}
              unoptimized={preview !== null}
              className="h-full w-full object-cover"
            />
          ) : (
            <UserCircle className="h-full w-full p-4 text-ink-soft/40" aria-hidden />
          )}
        </span>

        <span>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              // Maydon tozalanadi: bir xil faylni qayta tanlash ham ishlasin.
              event.target.value = "";
              if (file) void onPick(file);
            }}
          />
          <button
            type="button"
            disabled={progress !== null}
            onClick={() => inputRef.current?.click()}
            className="rounded-md border border-brand-soft px-3 py-2 text-xs font-semibold text-liderlar-blue transition hover:bg-ice/50 disabled:opacity-50"
          >
            {progress ? PROGRESS_TEXT[progress.stage] : avatarUrl ? "Almashtirish" : "Yuklash"}
          </button>
          <span className="mt-1 block text-[11px] text-ink-soft">
            Kamida {IMAGE_RULES.avatar.minDimension}×{IMAGE_RULES.avatar.minDimension} piksel
          </span>
        </span>
      </div>

      {error && <p className="mt-2 text-xs font-semibold text-rose-600">{error}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * GALEREYA
 *
 * Tanlangan rasm DARHOL yuklanmaydi: avval ko'rinadi va uning
 * tavsifi (alt) shu rasmga qarab yoziladi. Tavsif rasmdan oldin
 * so'ralsa, odam nimani tasvirlayotganini ko'rmay yozardi; ketma-ket
 * ikki rasm yuklaganda esa birinchisining tavsifi ikkinchisiga
 * o'tib ketardi.
 * ------------------------------------------------------------------ */

function GalleryBlock({ gallery }: { gallery: GalleryImage[] }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState<{ file: File; preview: string } | null>(null);
  const [altText, setAltText] = useState("");
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [removing, startTransition] = useTransition();

  const full = gallery.length >= IMAGE_RULES.gallery.maxCount;

  function pick(file: File) {
    setError(null);
    if (selected) URL.revokeObjectURL(selected.preview);
    setSelected({ file, preview: URL.createObjectURL(file) });
    setAltText("");
  }

  function clearSelection() {
    if (selected) URL.revokeObjectURL(selected.preview);
    setSelected(null);
    setAltText("");
  }

  async function upload() {
    if (!selected) return;
    setError(null);
    const result = await uploadProfileImage(selected.file, "gallery", setProgress, altText);
    setProgress(null);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    clearSelection();
    router.refresh();
  }

  return (
    <div className="border-t border-brand-soft pt-3">
      <p className="mb-2 text-xs font-semibold text-navy">
        Qo&apos;shimcha rasmlar{" "}
        <span className="font-normal text-ink-soft">
          ({gallery.length}/{IMAGE_RULES.gallery.maxCount})
        </span>
      </p>

      {gallery.length === 0 ? (
        <p className="mb-2 text-xs text-ink-soft">Hali rasm qo&apos;shmagansiz.</p>
      ) : (
        <ul className="mb-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {gallery.map((image) => (
            <li key={image.id} className="relative">
              <span className="block aspect-square overflow-hidden rounded-md border border-brand-soft bg-paper">
                <Image
                  src={image.url}
                  alt={image.altText ?? "Galereya rasmi"}
                  width={200}
                  height={200}
                  /*
                   * `sizes` ANIQ berilgan.
                   *
                   * Busiz optimizator eng katta variantni tanlardi va
                   * kichkina katakcha uchun ortiqcha katta fayl
                   * yuklanardi — §7 dagi egress muammosining yana bir
                   * ko'rinishi.
                   */
                  sizes="(max-width: 640px) 50vw, 33vw"
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </span>

              <button
                type="button"
                disabled={removing}
                aria-label="Rasmni o'chirish"
                onClick={() =>
                  startTransition(async () => {
                    setError(null);
                    const result = await deleteGalleryImage(image.id);
                    if (!result.ok) setError(result.error ?? "O'chirib bo'lmadi.");
                    else router.refresh();
                  })
                }
                className="absolute right-1 top-1 rounded-full bg-white/90 p-1 text-ink-soft shadow-sm transition hover:text-rose-600 disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden />
              </button>

              <AltEditor image={image} />
            </li>
          ))}
        </ul>
      )}

      {selected && (
        <div className="mb-2 rounded-md border border-liderlar-blue/30 bg-ice/30 p-2">
          <div className="flex gap-3">
            <span className="h-20 w-20 shrink-0 overflow-hidden rounded-md border border-brand-soft bg-paper">
              {/* `unoptimized` — `blob:` manzilini Next optimizatori yuklay olmaydi. */}
              <Image
                src={selected.preview}
                alt={altText.trim() || "Tanlangan rasm"}
                width={80}
                height={80}
                unoptimized
                className="h-full w-full object-cover"
              />
            </span>
            <label className="block min-w-0 flex-1 text-xs text-navy">
              <span className="font-semibold">Rasm tavsifi</span>{" "}
              <span className="text-ink-soft">(ixtiyoriy)</span>
              <input
                type="text"
                value={altText}
                onChange={(event) => setAltText(event.target.value)}
                maxLength={ALT_MAX_LENGTH}
                disabled={progress !== null}
                placeholder="Masalan: Toshkentdagi forumda ma'ruza qilmoqda"
                className="mt-1 block w-full rounded-md border border-brand-soft bg-white px-2 py-1.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-liderlar-blue focus:outline-none"
              />
              <span className="mt-1 block text-[11px] leading-snug text-ink-soft">
                Ko&apos;zi ojiz foydalanuvchilarga rasm mazmunini aytib beradi.
                &quot;Rasm&quot;, &quot;foto&quot; deb yozish shart emas.
              </span>
            </label>
          </div>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              disabled={progress !== null}
              onClick={() => void upload()}
              className="rounded-md bg-liderlar-blue px-3 py-1.5 text-xs font-semibold text-white transition disabled:opacity-50"
            >
              {progress ? PROGRESS_TEXT[progress.stage] : "Yuklash"}
            </button>
            <button
              type="button"
              disabled={progress !== null}
              onClick={clearSelection}
              className="rounded-md border border-brand-soft px-3 py-1.5 text-xs font-semibold text-ink-soft"
            >
              Bekor qilish
            </button>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) pick(file);
        }}
      />

      {!selected && (
        <button
          type="button"
          disabled={full}
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-md border border-brand-soft px-3 py-2 text-xs font-semibold text-liderlar-blue transition hover:bg-ice/50 disabled:opacity-50"
        >
          <ImagePlus className="h-4 w-4" aria-hidden />
          Rasm qo&apos;shish
        </button>
      )}

      {full && (
        <p className="mt-1 text-[11px] text-ink-soft">
          O&apos;rin tugadi. Yangisini qo&apos;shish uchun birini o&apos;chiring.
        </p>
      )}

      {error && <p className="mt-2 text-xs font-semibold text-rose-600">{error}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * MAVJUD RASM TAVSIFI
 * ------------------------------------------------------------------ */

function AltEditor({ image }: { image: GalleryImage }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(image.altText ?? "");
  const [saving, startSaving] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => {
          setValue(image.altText ?? "");
          setError(null);
          setEditing(true);
        }}
        className="mt-1 flex w-full items-start gap-1 text-left text-[11px] leading-snug text-ink-soft hover:text-ink"
      >
        <Pencil className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
        <span className="line-clamp-2">
          {image.altText ?? "Tavsif qo'shish"}
        </span>
      </button>
    );
  }

  return (
    <div className="mt-1">
      <input
        type="text"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        maxLength={ALT_MAX_LENGTH}
        disabled={saving}
        aria-label="Rasm tavsifi"
        placeholder="Rasmda nima tasvirlangan?"
        className="block w-full rounded border border-brand-soft bg-white px-1.5 py-1 text-[11px] text-ink focus:border-liderlar-blue focus:outline-none"
      />
      <span className="mt-1 flex gap-1">
        <button
          type="button"
          disabled={saving}
          aria-label="Tavsifni saqlash"
          onClick={() =>
            startSaving(async () => {
              setError(null);
              const result = await saveGalleryAltText(image.id, value);
              if (!result.ok) {
                setError(result.error ?? "Saqlab bo'lmadi.");
                return;
              }
              setEditing(false);
              router.refresh();
            })
          }
          className="rounded bg-liderlar-blue p-1 text-white disabled:opacity-50"
        >
          <Check className="h-3 w-3" aria-hidden />
        </button>
        <button
          type="button"
          disabled={saving}
          aria-label="Bekor qilish"
          onClick={() => setEditing(false)}
          className="rounded border border-brand-soft p-1 text-ink-soft"
        >
          <X className="h-3 w-3" aria-hidden />
        </button>
      </span>
      {error && <p className="mt-1 text-[11px] font-semibold text-rose-600">{error}</p>}
    </div>
  );
}
