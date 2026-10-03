"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ExternalLink, Lock } from "lucide-react";
import {
  chooseTheme,
  discardTheme,
  publishTheme,
  resetTheme,
  setHeaderHidden,
} from "@/app/kabinet/profil/dizayn/actions";
import { DEFAULT_THEME, type ThemeKey, type ThemeMeta } from "@/lib/themes/registry";

/**
 * DIZAYN GALEREYASI (§12).
 *
 * KO'RIB CHIQISH HAQIQIY MA'LUMOT BILAN: havola odamning o'z
 * profiliga `?preview=` bilan boradi. Soxta namuna ma'lumot
 * ishlatilmaydi (§12) — odam o'z ismi, o'z rasmi va o'z yutuqlari
 * bilan qanday ko'rinishini ko'rishi kerak.
 *
 * KO'RIB CHIQISH OMMAVIY SAHIFANI O'ZGARTIRMAYDI: tanlov `draft`
 * bo'lib saqlanadi, ommaviy sahifa esa `published` ni ko'rsatadi.
 * Ikkisi alohida maydon.
 */
export function ThemeGallery({
  themes,
  published,
  draft,
  slug,
  hasPremium,
  isPublished,
  hideSiteHeader,
}: {
  themes: ThemeMeta[];
  published: ThemeKey;
  draft: ThemeKey | null;
  slug: string;
  hasPremium: boolean;
  /** Nomzod sahifasi ommaviy nashr qilinganmi. */
  isPublished: boolean;
  /** Ommaviy profilda sayt headeri berkitilganmi. */
  hideSiteHeader: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(action: () => Promise<{ ok: boolean; error?: string }>) {
    startTransition(async () => {
      setError(null);
      const result = await action();
      if (!result.ok) {
        setError(result.error ?? "Bajarilmadi.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div>
      {draft !== null && (
        /*
         * NASHR QILINMAGAN TANLOV ENG TEPADA.
         *
         * Aks holda odam dizayn tanlab, uni nashr qilishni esdan
         * chiqarardi va "nega profilim o'zgarmadi" degan savol
         * javobsiz qolardi.
         */
        <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-900">
            Nashr qilinmagan tanlov: {themes.find((t) => t.key === draft)?.label ?? draft}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-amber-900">
            Bu dizayn hozir <b>faqat sizga</b> ko&apos;rinadi. Ommaviy
            profilingiz hali eski dizaynda.
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => publishTheme(slug))}
              className="rounded-md bg-liderlar-blue px-3 py-2 text-xs font-semibold text-white transition disabled:opacity-50"
            >
              {pending ? "Bajarilmoqda…" : "Nashr qilish"}
            </button>

            {isPublished && (
              <Link
                href={`/liderlar/${slug}?preview=${draft}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 rounded-md border border-amber-300 px-3 py-2 text-xs font-semibold text-amber-900"
              >
                Ko&apos;rib chiqish
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              </Link>
            )}

            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => discardTheme(slug))}
              className="rounded-md border border-amber-300 px-3 py-2 text-xs font-semibold text-amber-900 disabled:opacity-50"
            >
              Bekor qilish
            </button>
          </div>
        </div>
      )}

      {error && <p className="mb-3 text-sm font-semibold text-rose-600">{error}</p>}

      {/*
        SAYT HEADERI — faqat shu profil sahifasi uchun. Ko'rinishlar
        (pastdagi jonli kartochkalar) shu sozlamani aks ettiradi.
      */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-brand-soft bg-white p-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-navy">Sayt headeri</p>
          <p className="text-xs text-ink-soft">
            Profilingiz sahifasida standart Liderlar menyusi ko&apos;rinsinmi. Saytga qaytish havolasi baribir qoladi.
          </p>
        </div>
        <div className="inline-flex rounded-full border border-brand-soft p-1" role="group" aria-label="Sayt headeri">
          {[
            { value: false, label: "Ko‘rsatish" },
            { value: true, label: "Berkitish" },
          ].map((option) => (
            <button
              key={option.label}
              type="button"
              aria-pressed={hideSiteHeader === option.value}
              disabled={pending || !hasPremium || hideSiteHeader === option.value}
              onClick={() => run(() => setHeaderHidden(option.value, slug))}
              className={`min-h-9 rounded-full px-4 text-xs font-semibold transition ${
                hideSiteHeader === option.value ? "bg-liderlar-blue text-white" : "text-ink-soft hover:text-navy"
              } disabled:cursor-default`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {!hasPremium && (
        <p className="mb-4 rounded-lg border border-brand-soft bg-paper px-4 py-3 text-xs leading-relaxed text-ink-soft">
          Premium dizaynlar <b>Liderlar VIP</b> obunasi bilan ochiladi. Standart
          dizayn har doim mavjud.
        </p>
      )}

      <ul className="grid gap-4 sm:grid-cols-2">
        {themes.map((theme) => (
          <ThemeCard
            key={theme.key}
            theme={theme}
            isPublished={published === theme.key}
            isDraft={draft === theme.key}
            locked={theme.premium && !hasPremium}
            slug={slug}
            canPreview={isPublished}
            pending={pending}
            hideSiteHeader={hideSiteHeader}
            onChoose={() => run(() => chooseTheme(theme.key, slug))}
            onApply={() =>
              run(async () => {
                // "Qo'llash" = tanlash + nashr, bitta bosishda. Huquq ikkalasida serverda.
                const chosen = await chooseTheme(theme.key, slug);
                return chosen.ok ? publishTheme(slug) : chosen;
              })
            }
          />
        ))}
      </ul>

      {published !== DEFAULT_THEME && (
        <div className="mt-5 border-t border-brand-soft pt-4">
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => resetTheme(slug))}
            className="text-xs font-semibold text-ink-soft underline disabled:opacity-50"
          >
            Standart dizaynga qaytarish
          </button>
          <p className="mt-1 text-[11px] text-ink-soft">
            Profil mazmuni o&apos;zgarmaydi — faqat ko&apos;rinish.
          </p>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * KARTOCHKA
 * ------------------------------------------------------------------ */

function ThemeCard({
  theme,
  isPublished,
  isDraft,
  locked,
  slug,
  canPreview,
  pending,
  hideSiteHeader,
  onChoose,
  onApply,
}: {
  theme: ThemeMeta;
  isPublished: boolean;
  isDraft: boolean;
  locked: boolean;
  slug: string;
  canPreview: boolean;
  pending: boolean;
  hideSiteHeader: boolean;
  onChoose: () => void;
  onApply: () => void;
}) {
  const previewUrl = `/liderlar/${slug}?preview=${theme.key}&header=${hideSiteHeader ? "0" : "1"}`;
  return (
    <li
      className={`rounded-lg border p-4 ${
        isPublished || isDraft
          ? "border-liderlar-blue/40 bg-ice/30"
          : "border-brand-soft bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold text-navy">{theme.label}</h3>
          <p className="mt-0.5 text-xs text-ink-soft">{theme.mood}</p>
        </div>

        {isPublished && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
            <Check className="h-3 w-3" aria-hidden />
            Nashrda
          </span>
        )}
        {!isPublished && isDraft && (
          <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
            Tanlangan
          </span>
        )}
      </div>

      {canPreview && theme.ready && (
        /*
         * HAQIQIY KO'RINISH — a'zoning o'z ma'lumotlari bilan, shu dizaynda.
         *
         * Kichraytirilgan jonli sahifa (rasm yoki namuna emas). `loading="lazy"`
         * — faqat ekranga kelganda yuklanadi; bosib bo'lmaydi; ko'rishlar
         * hisobiga tushmaydi (`?preview=` sahifasi hisoblagichsiz).
         */
        <div className="relative mt-3 aspect-[16/11] w-full overflow-hidden rounded-md border border-brand-soft bg-ice">
          <iframe
            src={previewUrl}
            title={`${theme.label} dizayni ko'rinishi`}
            loading="lazy"
            tabIndex={-1}
            aria-hidden
            className="pointer-events-none absolute left-0 top-0 h-[400%] w-[400%] origin-top-left scale-25 border-0"
          />
        </div>
      )}

      <p className="mt-2 text-xs leading-relaxed text-ink">{theme.description}</p>
      <p className="mt-1.5 text-[11px] text-ink-soft">Kimga mos: {theme.suitedFor}</p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {!theme.ready ? (
          /*
           * QURILMAGAN DIZAYN TANLANMAYDI.
           *
           * §71: tanlanmagan narsani "tanlash mumkin" qilib
           * ko'rsatish yolg'on bo'lardi. Shuning uchun tugma emas,
           * holat matni.
           */
          <span className="text-xs font-semibold text-ink-soft">Tez kunda</span>
        ) : locked ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-soft">
            <Lock className="h-3.5 w-3.5" aria-hidden />
            VIP obuna kerak
          </span>
        ) : (
          <>
            <button
              type="button"
              disabled={pending || isPublished}
              onClick={onApply}
              className="min-h-9 rounded-md bg-liderlar-blue px-3 text-xs font-semibold text-white transition disabled:opacity-40"
            >
              {isPublished ? "Faol dizayn" : "Qo‘llash"}
            </button>
            {!isPublished && !isDraft && (
              <button
                type="button"
                disabled={pending}
                onClick={onChoose}
                className="min-h-9 rounded-md border border-brand-soft px-3 text-xs font-semibold text-liderlar-blue transition hover:bg-ice/50 disabled:opacity-40"
              >
                Qoralama
              </button>
            )}

            {canPreview && (
              /*
               * KO'RIB CHIQISH HAVOLASI HAQIQIY PROFILGA BORADI.
               *
               * Faqat nashr qilingan nomzodda ko'rsatiladi: nashr
               * qilinmagan profil sahifasi ochilmaydi va havola
               * xatoga olib borardi.
               */
              <Link
                href={previewUrl}
                target="_blank"
                className="inline-flex min-h-9 items-center gap-1 text-xs font-semibold text-ink-soft"
              >
                Ko&apos;rib chiqish
                <ExternalLink className="h-3 w-3" aria-hidden />
              </Link>
            )}
          </>
        )}
      </div>
    </li>
  );
}
