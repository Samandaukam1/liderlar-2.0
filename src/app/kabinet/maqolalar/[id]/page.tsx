import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireEntitlement } from "@/lib/vip/entitlement-service";
import { resolveOwnCandidate } from "@/lib/profile-editor/edit-service";
import { loadOwnArticle } from "@/lib/articles/author-service";
import { ArticleEditor } from "@/components/articles/article-editor";

export const metadata: Metadata = {
  title: "Maqolani tahrirlash",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * MAQOLA MUHARRIRI.
 *
 * Maqola EGALIK sharti bilan o'qiladi: `id` brauzerdan keladi va
 * tekshirilmasa boshqa odamning qoralamasi ochilardi (§44).
 */
export default async function ArticleEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const entitled = await requireEntitlement("articles.create");
  if (!entitled.ok) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <p className="rounded-lg border border-brand-soft bg-paper px-4 py-3 text-sm text-ink-soft">
          {entitled.error}
        </p>
      </div>
    );
  }

  const resolved = await resolveOwnCandidate();
  if (!resolved.ok) notFound();

  const article = await loadOwnArticle(id, resolved.owned.candidateId);
  if (!article) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Link
        href="/kabinet/maqolalar"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-liderlar-blue"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Maqolalarim
      </Link>

      <h1 className="mt-3 font-display text-xl font-bold text-navy sm:text-2xl">
        Maqolani tahrirlash
      </h1>

      <div className="mt-5">
        <ArticleEditor article={article} />
      </div>
    </div>
  );
}
