import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireEntitlement } from "@/lib/vip/entitlement-service";
import { loadPendingEdits, resolveOwnCandidate } from "@/lib/profile-editor/edit-service";
import { loadOwnEntries } from "@/lib/profile-editor/entry-service";
import { loadGallery } from "@/lib/profile-editor/upload-service";
import { loadOwnCertificates } from "@/lib/profile-editor/certificate-service";
import { ENTRY_KINDS, ENTRY_RULES } from "@/lib/profile-editor/field-policy";
import { BasicsSection } from "@/components/profile-editor/basics-section";
import { EntrySection } from "@/components/profile-editor/entry-section";
import { ImagesSection } from "@/components/profile-editor/images-section";
import { CertificatesSection } from "@/components/profile-editor/certificates-section";

export const metadata: Metadata = {
  title: "Profilni tahrirlash",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * PROFIL MUHARRIRI.
 *
 * §5: bitta katta forma emas, bo'limlarga ajratilgan. Har bo'lim
 * yopiq turadi va foydalanuvchi kerakligini ochadi.
 *
 * HUQUQ SERVERDA TEKSHIRILADI. Sahifani ko'rsatmaslik yetarli emas —
 * server amallari ham o'z tekshiruvini bajaradi (§3). Ikkisi ham bor,
 * chunki havola bilan kelgan odam tushunarli xabar ko'rishi kerak.
 */

/** Har bo'lim uchun namuna va tushuntirish — §5 "clear examples". */
const SECTION_COPY: Record<
  (typeof ENTRY_KINDS)[number],
  { description: string; example: string }
> = {
  education: {
    description: "Tamomlagan yoki o'qiyotgan ta'lim muassasalaringiz.",
    example: "Toshkent davlat universiteti — Bakalavr, Jurnalistika, 2015–2019",
  },
  work_experiences: {
    description: "Ish joylaringiz va lavozimlaringiz.",
    example: "«Yangi avlod» nashriyoti — Muharrir, 2020–hozirgacha",
  },
  achievements: {
    description: "Mukofotlar, g'oliblik va rasmiy tan olinishlar.",
    example: "«Yilning eng yaxshi yoshi» — Respublika tanlovi, 2024",
  },
  events: {
    description: "Siz tashkil qilgan yoki qatnashgan muhim tadbirlar.",
    example: "«Yoshlar forumi» — ma'ruzachi, 2025",
  },
  books_read: {
    description: "O'qigan va tavsiya qiladigan kitoblaringiz.",
    example: "Abdulla Qodiriy — «O'tkan kunlar»",
  },
  social_links: {
    description: "Ijtimoiy tarmoq va shaxsiy sayt havolalaringiz.",
    example: "Telegram kanal — https://t.me/kanal",
  },
};

export default async function ProfileEditorPage() {
  /*
   * HUQUQ — ENG AVVAL.
   *
   * Rad etilsa, sabab odam tilida aytiladi: "obuna bilan ochiladi"
   * yoki "muddati tugagan". Texnik sabab ko'rsatilmaydi (§55).
   */
  const entitled = await requireEntitlement("profile.self_edit");
  if (!entitled.ok) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <h1 className="font-display text-2xl font-bold text-navy">Profilni tahrirlash</h1>
        <p className="mt-3 rounded-lg border border-brand-soft bg-paper px-4 py-3 text-sm text-ink-soft">
          {entitled.error}
        </p>
        <Link
          href="/kabinet"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-liderlar-blue"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Kabinetga qaytish
        </Link>
      </div>
    );
  }

  const resolved = await resolveOwnCandidate();
  if (!resolved.ok) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <h1 className="font-display text-2xl font-bold text-navy">Profilni tahrirlash</h1>
        <p className="mt-3 rounded-lg border border-brand-soft bg-paper px-4 py-3 text-sm text-ink-soft">
          {resolved.error}
        </p>
      </div>
    );
  }

  const { candidateId } = resolved.owned;
  const admin = createAdminClient();

  /*
   * HAMMASI BITTA `Promise.all` DA.
   *
   * §49: bo'limlar ketma-ket yuklansa, sahifa oltita so'rovni navbat
   * bilan kutardi. Ular bir-biriga bog'liq emas.
   */
  const [candidateResult, pending, gallery, certificates, ...entryLists] = await Promise.all([
    admin
      .from("candidates")
      .select("slug, full_name, short_bio, phone, email, birth_date, status, avatar_url")
      .eq("id", candidateId)
      .single(),
    loadPendingEdits(candidateId),
    loadGallery(candidateId),
    loadOwnCertificates(candidateId),
    ...ENTRY_KINDS.map((kind) => loadOwnEntries(candidateId, kind)),
  ]);

  const candidate = candidateResult.data;
  if (!candidate) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <p className="text-sm text-ink-soft">Profilni o&apos;qib bo&apos;lmadi.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Link
        href="/kabinet"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-liderlar-blue"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Kabinet
      </Link>

      <h1 className="mt-3 font-display text-2xl font-bold text-navy sm:text-3xl">
        Profilni tahrirlash
      </h1>
      <p className="mt-1 text-sm text-ink-soft">{candidate.full_name}</p>

      {candidate.status === "published" && candidate.slug && (
        <Link
          href={`/liderlar/${candidate.slug}`}
          className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-liderlar-blue"
        >
          Ommaviy profilni ko&apos;rish
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        </Link>
      )}

      <p className="mt-4 rounded-lg border border-brand-soft bg-paper px-4 py-3 text-xs leading-relaxed text-ink-soft">
        Bo&apos;limlarni bosib oching va kerakli joyni to&apos;ldiring. Ba&apos;zi
        o&apos;zgarishlar <b>darhol</b> profilingizga joylanadi, mukofot va ta&apos;lim
        kabi ma&apos;lumotlar esa <b>tahririyat tekshiruvidan</b> o&apos;tadi — bu
        ensiklopediyadagi ma&apos;lumot ishonchli bo&apos;lishi uchun.
      </p>

      <Link
        href="/kabinet/profil/dizayn"
        className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-brand-soft px-3 py-2 text-xs font-semibold text-liderlar-blue transition hover:bg-ice/50"
      >
        Premium dizaynlar
      </Link>

      <div className="mt-5 space-y-3">
        <BasicsSection
          initial={{
            shortBio: (candidate.short_bio as string | null) ?? "",
            phone: (candidate.phone as string | null) ?? "",
            email: (candidate.email as string | null) ?? "",
            birthDate: (candidate.birth_date as string | null) ?? "",
          }}
          pending={pending.map((edit) => ({
            label: edit.label,
            afterValue: edit.afterValue,
          }))}
        />

        <ImagesSection
          avatarUrl={(candidate.avatar_url as string | null) ?? null}
          gallery={gallery}
        />

        <CertificatesSection certificates={certificates} />

        {ENTRY_KINDS.map((kind, index) => (
          <EntrySection
            key={kind}
            kind={kind}
            label={ENTRY_RULES[kind].label}
            description={SECTION_COPY[kind].description}
            example={SECTION_COPY[kind].example}
            hasDates={ENTRY_RULES[kind].hasDates}
            needsReview={ENTRY_RULES[kind].policy === "review"}
            entries={entryLists[index] ?? []}
          />
        ))}
      </div>
    </div>
  );
}
