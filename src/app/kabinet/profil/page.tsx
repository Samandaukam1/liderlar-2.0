import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Sparkles } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireEntitlement } from "@/lib/vip/entitlement-service";
import { loadPendingEdits, resolveOwnCandidate } from "@/lib/profile-editor/edit-service";
import { loadOwnEntries } from "@/lib/profile-editor/entry-service";
import { loadOwnSections } from "@/lib/profile-editor/section-service";
import { loadGallery } from "@/lib/profile-editor/upload-service";
import { loadOwnCertificates } from "@/lib/profile-editor/certificate-service";
import { ENTRY_KINDS, ENTRY_RULES } from "@/lib/profile-editor/field-policy";
import { BasicsSection } from "@/components/profile-editor/basics-section";
import { EntrySection } from "@/components/profile-editor/entry-section";
import { SectionsSection } from "@/components/profile-editor/sections-section";
import { ImagesSection } from "@/components/profile-editor/images-section";
import { CertificatesSection } from "@/components/profile-editor/certificates-section";
import { QuotesSection } from "@/components/profile-editor/quotes-section";
import { EditRequestButton } from "@/components/kabinet/edit-request-button";
import { loadOwnQuotes } from "@/lib/profile-editor/quote-service";
import { loadThemeSelection } from "@/lib/themes/preference-service";
import { THEMES } from "@/lib/themes/registry";
import { can } from "@/lib/vip/entitlement-service";

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
 * TUZILISH — IKKI USTUN (2026-10-04):
 *
 *   · BIOGRAFIYA MATNI eng tepada va keng ustunda. U ommaviy
 *     sahifaning asosiy mazmuni; avval u o'nta yopiq bo'lim ostida
 *     ko'rinmay yotardi.
 *   · Qolgan bo'limlar YON ustunda, ixcham kartalar sifatida —
 *     "qo'shimcha kiritish" ishi, asosiy ish emas.
 *   · PREMIUM DIZAYNLAR yon ustunning TEPASIDA. Avval u sahifaning
 *     eng ostida, o'nta bo'limdan keyin turardi va hech kim
 *     ko'rmasdi. Bu yerda u ixcham karta: to'liq galereya o'z
 *     sahifasida (`/kabinet/profil/dizayn`), ya'ni bitta galereya
 *     ikki joyda saqlanmaydi.
 *
 * Telefon ekranida ustunlar ustma-ust tushadi va tartib shu bo'ladi:
 * biografiya -> dizayn -> qolgan bo'limlar.
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
  const [candidateResult, pending, gallery, certificates, quotes, themeSelection, hasPremium, sections, ...entryLists] = await Promise.all([
    admin
      .from("candidates")
      .select("slug, full_name, short_bio, phone, email, birth_date, birth_year, birth_place, current_location, activity_field, education_summary, description_items, languages, status, avatar_url")
      .eq("id", candidateId)
      .single(),
    loadPendingEdits(candidateId),
    loadGallery(candidateId),
    loadOwnCertificates(candidateId),
    loadOwnQuotes(candidateId),
    loadThemeSelection(candidateId),
    can("profile.premium_themes"),
    loadOwnSections(candidateId),
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

  const publishedTheme = THEMES[themeSelection.published];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
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

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_23rem]">
        {/* ============================================ ASOSIY USTUN */}
        <div className="min-w-0">
          <SectionsSection sections={sections} />
        </div>

        {/* ============================================ YON USTUN */}
        <aside className="min-w-0 space-y-3">
          {/*
            PREMIUM DIZAYNLAR — YON USTUNNING TEPASIDA.

            To'liq galereya BU YERDA EMAS: u o'z sahifasida va a'zoning
            haqiqiy ma'lumotlari bilan jonli ko'rinishni talab qiladi,
            23rem ustunga sig'maydi. Bu yerda — hozirgi dizayn va
            havola, ya'ni odam uning borligini darhol ko'radi.
          */}
          <section className="rounded-lg border border-liderlar-blue/25 bg-ice/50 px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-navy">Premium dizaynlar</p>
                <p className="mt-0.5 truncate text-xs text-ink-soft">
                  Hozirgi: {publishedTheme.label}
                </p>
              </div>
              <Sparkles className="h-5 w-5 shrink-0 text-liderlar-blue" aria-hidden />
            </div>

            <p className="mt-2 text-xs leading-relaxed text-ink-soft">
              Dizayn faqat ko&apos;rinishni o&apos;zgartiradi — ma&apos;lumotlaringiz
              va profil havolangiz o&apos;zgarmaydi.
            </p>

            <Link
              href="/kabinet/profil/dizayn"
              className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-liderlar-blue px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90"
            >
              {hasPremium ? "Dizaynni tanlash" : "Dizaynlarni ko'rish"}
            </Link>
          </section>

          <div className="pt-1">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-ink-soft">
              Qo&apos;shimcha ma&apos;lumot
            </p>
            <p className="mt-1 text-xs leading-relaxed text-ink-soft">
              Kerakli kartani bosib oching. Mukofot, ta&apos;lim va sertifikat
              kabi <b>tasdiqlanadigan</b> ma&apos;lumotlar tahririyat
              tekshiruvidan o&apos;tadi.
            </p>
          </div>

          <BasicsSection
            initial={{
              fullName: (candidate.full_name as string | null) ?? "",
              shortBio: (candidate.short_bio as string | null) ?? "",
              phone: (candidate.phone as string | null) ?? "",
              email: (candidate.email as string | null) ?? "",
              birthDate: (candidate.birth_date as string | null) ?? "",
              birthYear: (candidate.birth_year as string | null) ?? "",
              birthPlace: (candidate.birth_place as string | null) ?? "",
              currentLocation: (candidate.current_location as string | null) ?? "",
              activityField: (candidate.activity_field as string | null) ?? "",
              educationSummary: (candidate.education_summary as string | null) ?? "",
              descriptionItems: ((candidate.description_items as string[] | null) ?? []).join("\n"),
              languages: ((candidate.languages as string[] | null) ?? []).join("\n"),
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

          <QuotesSection quotes={quotes.map((q) => ({ id: q.id, text: q.text, status: q.status }))} />

          {/*
            TAHRIR SO'ROVI QOLADI.

            Bo'limlar muharriri biografiya matnini qamraydi, lekin undan
            tashqaridagi narsalar (masalan ommaviy sahifadagi xato fakt
            yoki havola) uchun odam tilidagi so'rov yagona yo'l.
          */}
          <section className="rounded-lg border border-brand-soft bg-white px-4 py-3">
            <p className="font-semibold text-navy">Boshqa o&apos;zgarish kerak bo&apos;lsa</p>
            <p className="mt-0.5 text-xs text-ink-soft">
              Muharrirda yo&apos;q narsani o&apos;zgartirish uchun tahririyatga yozing.
            </p>
            <div className="mt-2">
              <EditRequestButton />
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
