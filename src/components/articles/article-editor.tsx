"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ImagePlus, Send } from "lucide-react";
import { saveDraft, sendForReview, uploadHero } from "@/app/kabinet/maqolalar/actions";
import { uploadProfileImage, PROGRESS_TEXT } from "@/lib/profile-editor/upload-client";
import { checkHeroDimensions, heroAspect, HERO_RECOMMENDATION_TEXT } from "@/lib/articles/hero-rules";
import {
  authorCanEdit,
  authorCanSubmit,
  checkSubmittable,
  CONTENT_MIN_LENGTH,
  STATE_TEXT,
  type ArticleState,
} from "@/lib/articles/state";
import type { ArticleDetail } from "@/lib/articles/author-service";

/**
 * MAQOLA MUHARRIRI (§23).
 *
 * AVTOSAQLASH BOR, lekin u sahifani YANGILAMAYDI: har 30 soniyada
 * qayta yuklash foydalanuvchi yozayotgan matnni almashtirib
 * yuborardi.
 *
 * YUBORISH SHARTLARI OLDINDAN KO'RSATILADI: sarlavha, banner va matn
 * uzunligi. Odam tugmani bosib, keyin uchta xato ko'rishi kerak
 * emas — nima yetishmayotgani oldindan ko'rinib turadi.
 */
export function ArticleEditor({ article }: { article: ArticleDetail }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [title, setTitle] = useState(article.title);
  const [subtitle, setSubtitle] = useState(article.subtitle ?? "");
  const [excerpt, setExcerpt] = useState(article.excerpt ?? "");
  const [content, setContent] = useState(article.content);
  const [heroAlt, setHeroAlt] = useState(article.heroAlt ?? "");

  const [message, setMessage] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const editable = authorCanEdit(article.state);

  /* ---------------------------------------------------------------- *
   * AVTOSAQLASH
   * ---------------------------------------------------------------- */

  // Oxirgi saqlangan matn — o'zgarmasa so'rov yuborilmaydi.
  const lastSaved = useRef({ title: article.title, content: article.content });

  useEffect(() => {
    if (!editable) return;

    const timer = window.setInterval(() => {
      /*
       * O'ZGARMAGAN MATN SAQLANMAYDI.
       *
       * Aks holda ochiq qolgan oyna har 30 soniyada revizya yozib,
       * tarixni ma'nosiz yozuvlar bilan to'ldirardi.
       */
      if (
        title === lastSaved.current.title &&
        content === lastSaved.current.content
      ) {
        return;
      }
      if (title.trim().length < 5) return;

      void saveDraft(article.id, { title, subtitle, excerpt, content, heroAlt }, true).then(
        (result) => {
          if (result.ok) {
            lastSaved.current = { title, content };
            setSavedAt(new Date().toLocaleTimeString("uz-UZ"));
          }
        },
      );
    }, 30_000);

    return () => window.clearInterval(timer);
  }, [article.id, editable, title, subtitle, excerpt, content, heroAlt]);

  /* ---------------------------------------------------------------- *
   * AMALLAR
   * ---------------------------------------------------------------- */

  function save() {
    startTransition(async () => {
      setMessage(null);
      setFailed(false);
      const result = await saveDraft(article.id, {
        title,
        subtitle,
        excerpt,
        content,
        heroAlt,
      });

      if (!result.ok) {
        setMessage(result.error ?? "Saqlanmadi.");
        setFailed(true);
        return;
      }
      lastSaved.current = { title, content };
      setMessage("Saqlandi.");
      router.refresh();
    });
  }

  function submit() {
    startTransition(async () => {
      setMessage(null);
      setFailed(false);

      /*
       * YUBORISHDAN OLDIN SAQLANADI.
       *
       * Aks holda odam matnni yozib, saqlamasdan "Yuborish" ni
       * bosardi va tahririyat eski matnni ko'rardi.
       */
      const saved = await saveDraft(article.id, {
        title,
        subtitle,
        excerpt,
        content,
        heroAlt,
      });
      if (!saved.ok) {
        setMessage(saved.error ?? "Saqlanmadi.");
        setFailed(true);
        return;
      }

      const result = await sendForReview(article.id);
      if (!result.ok) {
        setMessage(result.error ?? "Yuborilmadi.");
        setFailed(true);
        return;
      }
      router.refresh();
    });
  }

  const check = checkSubmittable({ title, content, heroUrl: article.heroUrl });

  return (
    <div>
      <StateBanner state={article.state} reviewNote={article.reviewNote} />

      {!editable ? (
        <ReadOnlyView article={article} />
      ) : (
        <>
          <Field label="Sarlavha">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
              placeholder="Maqola sarlavhasi"
            />
          </Field>

          <Field label="Kichik sarlavha (ixtiyoriy)">
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className={inputClass}
              placeholder="Bir qatorli izoh"
            />
          </Field>

          <HeroBlock article={article} heroAlt={heroAlt} onAltChange={setHeroAlt} />

          <Field label="Qisqa tavsif (ixtiyoriy)">
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={2}
              maxLength={600}
              className={inputClass}
              placeholder="Ro'yxatda ko'rinadigan qisqa matn"
            />
          </Field>

          <Field label="Maqola matni">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={18}
              className={`${inputClass} font-serif leading-relaxed`}
              placeholder="Matnni shu yerga yozing. Abzatslarni bo'sh qator bilan ajrating."
            />
            <span className="mt-1 flex items-center justify-between text-[11px] text-ink-soft">
              <span>
                {content.trim().length < CONTENT_MIN_LENGTH
                  ? `Kamida ${CONTENT_MIN_LENGTH} belgi (hozir ${content.trim().length})`
                  : `${content.trim().length} belgi`}
              </span>
              {savedAt && <span>Avtosaqlandi: {savedAt}</span>}
            </span>
          </Field>

          {/*
            YUBORISH SHARTLARI RO'YXAT SIFATIDA.

            Tugmani o'chirib qo'yish yetarli emas: odam NEGA
            o'chirilganini bilishi kerak.
          */}
          {!check.ok && (
            <ul className="mb-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              {check.problems.includes("title") && <li>· Sarlavha juda qisqa</li>}
              {check.problems.includes("hero") && <li>· Banner rasmi yuklanmagan</li>}
              {check.problems.includes("content") && <li>· Matn juda qisqa</li>}
            </ul>
          )}

          {message && (
            <p
              className={`mb-3 text-sm font-semibold ${failed ? "text-rose-600" : "text-emerald-700"}`}
            >
              {message}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={save}
              className="rounded-md border border-brand-soft px-4 py-2 text-sm font-semibold text-ink transition hover:bg-ice/50 disabled:opacity-50"
            >
              {pending ? "Saqlanmoqda…" : "Saqlash"}
            </button>

            <button
              type="button"
              disabled={pending || !check.ok || !authorCanSubmit(article.state)}
              onClick={submit}
              className="inline-flex items-center gap-1.5 rounded-md bg-liderlar-blue px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-40"
            >
              <Send className="h-4 w-4" aria-hidden />
              Tekshiruvga yuborish
            </button>
          </div>

          <p className="mt-2 text-[11px] text-ink-soft">
            Yuborilgandan keyin maqola tahririyatga o&apos;tadi va siz uni
            tahrirlay olmaysiz. Tahririyat tuzatish so&apos;rasa, maqola yana
            sizga qaytadi.
          </p>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * HOLAT
 * ------------------------------------------------------------------ */

const STATE_CLASS: Record<ArticleState, string> = {
  draft: "border-brand-soft bg-paper text-ink-soft",
  submitted: "border-amber-200 bg-amber-50 text-amber-900",
  in_review: "border-amber-200 bg-amber-50 text-amber-900",
  changes_requested: "border-rose-200 bg-rose-50 text-rose-900",
  approved: "border-emerald-200 bg-emerald-50 text-emerald-900",
  published: "border-emerald-200 bg-emerald-50 text-emerald-900",
  rejected: "border-rose-200 bg-rose-50 text-rose-900",
  archived: "border-brand-soft bg-paper text-ink-soft",
};

function StateBanner({
  state,
  reviewNote,
}: {
  state: ArticleState;
  reviewNote: string | null;
}) {
  return (
    <div className={`mb-4 rounded-lg border px-4 py-3 ${STATE_CLASS[state]}`}>
      <p className="text-sm font-semibold">{STATE_TEXT[state]}</p>

      {/*
        TAHRIRIYAT IZOHI KO'RSATILADI (§27).

        Izohsiz "tuzatish kerak" odamni nima tuzatishni bilmay
        qoldirardi.
      */}
      {reviewNote && <p className="mt-1 text-xs leading-relaxed">{reviewNote}</p>}

      {state === "submitted" && (
        <p className="mt-1 text-xs">Tahririyat tez orada ko&apos;rib chiqadi.</p>
      )}
      {state === "approved" && (
        <p className="mt-1 text-xs">Tasdiqlandi — nashr qilinishini kuting.</p>
      )}
    </div>
  );
}

function ReadOnlyView({ article }: { article: ArticleDetail }) {
  return (
    <div className="rounded-lg border border-brand-soft bg-white p-4">
      <h2 className="font-display text-xl font-bold text-navy">{article.title}</h2>
      {article.subtitle && (
        <p className="mt-1 text-sm text-ink-soft">{article.subtitle}</p>
      )}

      {article.heroUrl && (
        <span className="mt-3 block aspect-video overflow-hidden rounded-md">
          <Image
            src={article.heroUrl}
            alt={article.heroAlt ?? ""}
            width={800}
            height={450}
            sizes="(max-width: 768px) 100vw, 672px"
            className="h-full w-full object-cover"
          />
        </span>
      )}

      <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink">
        {article.content}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * BANNER
 * ------------------------------------------------------------------ */

function HeroBlock({
  article,
  heroAlt,
  onAltChange,
}: {
  article: ArticleDetail;
  heroAlt: string;
  onAltChange: (value: string) => void;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<{ stage: keyof typeof PROGRESS_TEXT } | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const [warning, setWarning] = useState<string | null>(null);

  async function onPick(file: File) {
    setError(null);
    setWarning(null);

    /*
     * O'LCHAM YUKLASHDAN OLDIN tekshiriladi: kichik rasm umuman
     * yuklanmaydi (trafik va vaqt behuda ketmaydi).
     */
    let dims: { width: number; height: number };
    try {
      const bitmap = await createImageBitmap(file);
      dims = { width: bitmap.width, height: bitmap.height };
      bitmap.close();
    } catch {
      setError("Rasmni o‘qib bo‘lmadi. JPG, PNG yoki WebP yuklang.");
      return;
    }
    const check = checkHeroDimensions(dims.width, dims.height);
    if (!check.ok) {
      setError(check.error);
      return;
    }
    setWarning(check.warning);

    const uploaded = await uploadProfileImage(file, "gallery", setProgress);
    setProgress(null);

    if (!uploaded.ok) {
      setError(uploaded.error);
      return;
    }

    const saved = await uploadHero(article.id, uploaded.url, dims);
    if (!saved.ok) {
      setError(saved.error ?? "Bannerni saqlab bo'lmadi.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="mb-3">
      <p className="mb-1 text-xs font-semibold text-navy">
        Banner rasmi <span className="text-coral">*</span>
      </p>
      <p className="mb-2 text-[11px] leading-relaxed text-ink-soft">{HERO_RECOMMENDATION_TEXT}</p>

      {article.heroUrl ? (
        /*
         * BANNER 16:9 NISBATDA KO'RSATILADI (§24).
         *
         * Ro'yxat kartochkasi ham shu nisbatda — ya'ni muallif
         * rasm qanday kesilishini shu yerda ko'radi va keyin
         * kutilmagan natijaga uchramaydi.
         */
        <div className="grid gap-3 sm:grid-cols-[1fr_9rem]">
          <figure>
            <span className="block aspect-video overflow-hidden rounded-md border border-brand-soft">
              <Image
                src={article.heroUrl}
                alt={heroAlt || "Banner"}
                width={800}
                height={450}
                sizes="(max-width: 768px) 100vw, 672px"
                className="h-full w-full object-cover"
              />
            </span>
            <figcaption className="mt-1 text-[11px] text-ink-soft">Maqola sahifasi (16:9 — chetlari qirqilishi mumkin)</figcaption>
          </figure>
          <figure>
            <span
              className="block overflow-hidden rounded-xl border border-brand-soft"
              style={{ aspectRatio: String(heroAspect(article.heroWidth ?? null, article.heroHeight ?? null)) }}
            >
              <Image
                src={article.heroUrl}
                alt=""
                width={300}
                height={Math.round(300 / heroAspect(article.heroWidth ?? null, article.heroHeight ?? null))}
                sizes="144px"
                className="h-full w-full object-cover"
              />
            </span>
            <figcaption className="mt-1 text-[11px] text-ink-soft">Lentada (telefon)</figcaption>
          </figure>
        </div>
      ) : (
        <p className="rounded-md border border-dashed border-brand-soft bg-paper px-3 py-6 text-center text-xs text-ink-soft">
          Banner rasmi yuklanmagan. U maqola tepasida va Liderlar Online
          ro&apos;yxatida ko&apos;rinadi.
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) void onPick(file);
        }}
      />

      <button
        type="button"
        disabled={progress !== null}
        onClick={() => inputRef.current?.click()}
        className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-brand-soft px-3 py-1.5 text-xs font-semibold text-liderlar-blue transition hover:bg-ice/50 disabled:opacity-50"
      >
        <ImagePlus className="h-4 w-4" aria-hidden />
        {progress
          ? PROGRESS_TEXT[progress.stage]
          : article.heroUrl
            ? "Bannerni almashtirish"
            : "Banner yuklash"}
      </button>

      {article.heroUrl && (
        <label className="mt-2 block">
          <span className="mb-1 block text-[11px] font-semibold text-navy">
            Rasm tavsifi (ko&apos;rish imkoni cheklangan o&apos;quvchilar uchun)
          </span>
          <input
            type="text"
            value={heroAlt}
            onChange={(e) => onAltChange(e.target.value)}
            className={inputClass}
            placeholder="Rasmda nima ko'rinadi"
          />
        </label>
      )}

      {error && <p className="mt-1 text-xs font-semibold text-rose-600">{error}</p>}
      {warning && <p className="mt-1 text-xs text-amber-700">{warning}</p>}
    </div>
  );
}

const inputClass =
  "w-full rounded-md border border-brand-soft bg-white px-3 py-2 text-sm text-ink placeholder:text-ink-soft/60 focus:border-liderlar-blue focus:outline-none";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="mb-3 block">
      <span className="mb-1 block text-xs font-semibold text-navy">{label}</span>
      {children}
    </label>
  );
}
