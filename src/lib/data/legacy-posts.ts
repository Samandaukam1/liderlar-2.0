import "server-only";
import { createClient } from "@/lib/supabase/server";
import { extractLegacyPostId } from "@/lib/legacy/slug";

/**
 * Liderlar 1.0 (Tilda) postlarini o'qish.
 *
 * FAQAT `legacy_posts` jadvaliga tegadi. `candidates` ga umuman murojaat
 * qilinmaydi va aksincha — 2.0 yuklovchilari (`lib/data/candidates.ts`)
 * `legacy_posts` ni bilmaydi. Ikki namespace shu tarzda kesishmaydi:
 * /nomzodlar/<slug> hech qachon 2.0 nomzodini ochmaydi, /liderlar/<slug> esa
 * hech qachon 1.0 postini ochmaydi.
 */

export interface LegacyPost {
  id: string;
  legacy_source_id: string;
  legacy_slug: string;
  legacy_path: string;
  title: string;
  summary: string | null;
  /** Import paytida oq ro'yxat bo'yicha tozalangan HTML. */
  content_html: string;
  content_text: string;
  cover_image_url: string | null;
  /** 1.0 dagi HAQIQIY sana, yoki null. Import sanasi emas. */
  legacy_created_at: string | null;
  legacy_categories: string[];
  legacy_author: string | null;
  seo_title: string | null;
  seo_description: string | null;
  /** 2.0 profiliga ulangan bo'lsa — o'sha nomzod. */
  candidate: { slug: string; full_name: string } | null;
}

const SELECT =
  "id, legacy_source_id, legacy_slug, legacy_path, title, summary, content_html, " +
  "content_text, cover_image_url, legacy_created_at, legacy_categories, legacy_author, " +
  "seo_title, seo_description, candidate:candidates(slug, full_name)";

type Row = Omit<LegacyPost, "candidate"> & {
  candidate: { slug: string; full_name: string }[] | { slug: string; full_name: string } | null;
};

function shape(row: Row): LegacyPost {
  const candidate = Array.isArray(row.candidate) ? (row.candidate[0] ?? null) : row.candidate;
  return { ...row, candidate: candidate ?? null };
}

/**
 * Eski havolani yozuvga aylantiradi.
 *
 * Uch bosqich, ataylab shu tartibda:
 *   1. `legacy_slug` — importda yasalgan to'liq bo'lak.
 *   2. `legacy_alias` — Tilda'da qo'lda qo'yilgan alias (eksportda 1 ta).
 *   3. Post ID prefiksi — ZAXIRA. Slugning DUMI Tilda transliteratsiyasiga
 *      bog'liq va biz uni ikkita haqiqiy havoladan bilamiz; PREFIKS esa
 *      manbadagi Post ID ning o'zi, ya'ni aniq. Shu sababli dumida bir harf
 *      farq qilsa ham eski havola baribir ochiladi — 404 emas.
 *
 * RLS `legacy_status = 'published'` bo'lganini o'zi ta'minlaydi, shuning uchun
 * 1.0 dagi draft postlar ommaga ochilmaydi.
 */
export async function getLegacyPostBySlug(rawSlug: string): Promise<LegacyPost | null> {
  const slug = (rawSlug ?? "").trim();
  if (!slug) return null;

  const supabase = await createClient();

  const bySlug = await supabase
    .from("legacy_posts")
    .select(SELECT)
    .eq("legacy_slug", slug)
    .is("deleted_at", null)
    .maybeSingle();
  if (bySlug.data) return shape(bySlug.data as unknown as Row);

  const byAlias = await supabase
    .from("legacy_posts")
    .select(SELECT)
    .eq("legacy_alias", slug)
    .is("deleted_at", null)
    .maybeSingle();
  if (byAlias.data) return shape(byAlias.data as unknown as Row);

  const postId = extractLegacyPostId(slug);
  if (!postId) return null;

  const byId = await supabase
    .from("legacy_posts")
    .select(SELECT)
    .eq("legacy_source_id", postId)
    .is("deleted_at", null)
    .maybeSingle();
  return byId.data ? shape(byId.data as unknown as Row) : null;
}
