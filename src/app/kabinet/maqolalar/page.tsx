import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, FileText } from "lucide-react";
import { requireEntitlement } from "@/lib/vip/entitlement-service";
import { resolveOwnCandidate } from "@/lib/profile-editor/edit-service";
import { loadOwnArticles } from "@/lib/articles/author-service";
import { STATE_TEXT } from "@/lib/articles/state";
import { NewArticleButton } from "@/components/articles/new-article-button";
import { ProfileVisibilityToggle } from "@/components/articles/profile-visibility-toggle";

export const metadata: Metadata = {
  title: "Maqolalarim",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * MAQOLALARIM.
 *
 * Huquq SERVERDA tekshiriladi va rad etilsa sabab odam tilida
 * aytiladi. Sahifani shunchaki yashirish yetarli emas: havola bilan
 * kelgan odam tushunarli xabar ko'rishi kerak.
 */
export default async function ArticlesPage() {
  const entitled = await requireEntitlement("articles.create");
  if (!entitled.ok) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <h1 className="font-display text-2xl font-bold text-navy">Maqolalarim</h1>
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
        <h1 className="font-display text-2xl font-bold text-navy">Maqolalarim</h1>
        <p className="mt-3 rounded-lg border border-brand-soft bg-paper px-4 py-3 text-sm text-ink-soft">
          {resolved.error}
        </p>
      </div>
    );
  }

  const articles = await loadOwnArticles(resolved.owned.candidateId);

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
        Maqolalarim
      </h1>
      <p className="mt-2 text-sm text-ink-soft">
        Tasdiqlangan maqolalar <b>Liderlar Online</b> bo&apos;limida va{" "}
        <b>biografik sahifangizda</b>{" "}
        avtomatik chiqadi. Sahifangizda
        ko&apos;rsatishni xohlamagan maqolani pastdagi tugma bilan yashiring.
      </p>

      <div className="mt-5">
        <NewArticleButton />
      </div>

      {articles.length === 0 ? (
        <div className="mt-6 rounded-lg border border-brand-soft bg-white px-4 py-10 text-center">
          <FileText className="mx-auto h-8 w-8 text-ink-soft/40" aria-hidden />
          <p className="mt-2 text-sm font-semibold text-navy">
            Birinchi maqolangizni yozishni boshlang.
          </p>
          <p className="mt-1 text-xs text-ink-soft">
            Sarlavha, banner rasmi va matn — tahririyat ko&apos;rib chiqadi.
          </p>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {articles.map((article) => (
            <li
              key={article.id}
              className="overflow-hidden rounded-lg border border-brand-soft bg-white transition hover:border-liderlar-blue/40"
            >
              <Link
                href={`/kabinet/maqolalar/${article.id}`}
                className="flex gap-3 p-3"
              >
                {article.heroUrl ? (
                  <span className="relative block h-16 w-24 shrink-0 overflow-hidden rounded">
                    <Image
                      src={article.heroUrl}
                      alt=""
                      fill
                      sizes="96px"
                      loading="lazy"
                      className="object-cover"
                    />
                  </span>
                ) : (
                  <span className="flex h-16 w-24 shrink-0 items-center justify-center rounded bg-paper text-[10px] text-ink-soft">
                    banner yo&apos;q
                  </span>
                )}

                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-navy">
                    {article.title}
                  </span>
                  <span className="mt-0.5 block text-xs text-ink-soft">
                    {STATE_TEXT[article.state]}
                  </span>
                  {/* Tahririyat izohi ro'yxatda ham ko'rinadi — e'tibordan qolmasin. */}
                  {article.reviewNote && (
                    <span className="mt-1 block line-clamp-2 text-[11px] leading-snug text-rose-800">
                      {article.reviewNote}
                    </span>
                  )}
                </span>
              </Link>

              {/*
                TUGMA HAVOLADAN TASHQARIDA.

                Havola ichidagi tugma ikki ish qilardi: bosish ham
                almashtirardi, ham muharrirni ochardi.
              */}
              <div className="border-t border-brand-soft bg-paper/60 px-3 py-2">
                <ProfileVisibilityToggle
                  articleId={article.id}
                  initial={article.showOnProfile}
                  published={article.state === "published"}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
