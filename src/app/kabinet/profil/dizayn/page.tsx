import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { can } from "@/lib/vip/entitlement-service";
import { resolveOwnCandidate } from "@/lib/profile-editor/edit-service";
import { loadThemeSelection } from "@/lib/themes/preference-service";
import { galleryThemes } from "@/lib/themes/registry";
import { ThemeGallery } from "@/components/profile-editor/theme-gallery";

export const metadata: Metadata = {
  title: "Premium dizaynlar",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * DIZAYNNI TANLASH (§12).
 *
 * SAHIFA OBUNASIZ HAM OCHILADI. Premium dizaynlar qulflangan
 * ko'rinadi, lekin ro'yxat ko'rinib turadi — odam nima
 * borligini bilmasa, obuna bo'lish haqida o'ylamaydi ham.
 *
 * Huquq esa SERVERDA, yozish paytida tekshiriladi: qulfni
 * ko'rsatish avtorizatsiya emas (§3).
 */
export default async function ThemeSelectionPage() {
  const resolved = await resolveOwnCandidate();
  if (!resolved.ok) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="font-display text-2xl font-bold text-navy">Premium dizaynlar</h1>
        <p className="mt-3 rounded-lg border border-brand-soft bg-paper px-4 py-3 text-sm text-ink-soft">
          {resolved.error}
        </p>
      </div>
    );
  }

  const { candidateId } = resolved.owned;
  const admin = createAdminClient();

  const [candidateResult, selection, hasPremium] = await Promise.all([
    admin.from("candidates").select("slug, status").eq("id", candidateId).single(),
    loadThemeSelection(candidateId),
    can("profile.premium_themes"),
  ]);

  const candidate = candidateResult.data;
  if (!candidate) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <p className="text-sm text-ink-soft">Profilni o&apos;qib bo&apos;lmadi.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link
        href="/kabinet/profil"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-liderlar-blue"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Profilni tahrirlash
      </Link>

      <h1 className="mt-3 font-display text-2xl font-bold text-navy sm:text-3xl">
        Premium dizaynlar
      </h1>
      <p className="mt-2 text-sm text-ink-soft">
        Dizayn faqat <b>ko&apos;rinishni</b> o&apos;zgartiradi — ma&apos;lumotlaringiz
        va profil havolangiz o&apos;zgarmaydi.
      </p>

      <div className="mt-6">
        <ThemeGallery
          themes={galleryThemes()}
          published={selection.published}
          draft={selection.draft}
          slug={candidate.slug as string}
          hasPremium={hasPremium}
          isPublished={candidate.status === "published"}
        />
      </div>
    </div>
  );
}
