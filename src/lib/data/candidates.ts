import { unstable_cache } from "next/cache";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createPublicClient } from "@/lib/supabase/public";
import { PUBLIC_LIST_REVALIDATE_SECONDS } from "@/lib/data/public-cache";
import { orderByRanking, pageRange, totalPagesFor, type CatalogOrderRow } from "@/lib/data/catalog-order";
import { fetchAllRows } from "@/lib/data/paged-rows";
import { getCandidateAdabiyotXItems } from "@/lib/data/candidate-adabiyotx";
import { getAllOverallRankingRows, getCandidateRanking, getOverallRankings } from "@/lib/data/candidate-ranking";
import { isStoredHeroUrl } from "@/lib/articles/hero-rules";
import { splitPipeValues, stripCandidateMarkers, toShortBioItems } from "@/lib/candidates/text";
import type { CandidateCardData, CandidateSectionData } from "@/lib/types";

const CANDIDATE_BASE_SELECT = `
  id, slug, full_name, short_bio, avatar_url, status, is_top100, top100_position,
  region:regions(name, slug),
  category:categories(name, slug, color)
`;

/**
 * KARTA SO'ROVIDA `ranking_scores` YO'Q — ataylab.
 *
 * Avval bu yerda `scores:ranking_scores(...)` ichma-ich so'rovi turardi.
 * `ranking_scores` da `candidate_id` bilan boshlanadigan indeks yo'q, shuning
 * uchun Postgres HAR NOMZOD uchun jadvalni to'liq aylanardi: katalogda ~1000
 * marta, reytingda ~3160 marta (LIMIT dan oldin). Reyting so'rovi shu sababli
 * 3,5 s ishlardi (o'lchangan: 3,5 s -> 0,8 s).
 *
 * Natija esa baribir ishlatilmasdi: anon rol uni RLS sababli bo'sh ko'radi,
 * ball esa hamma joyda ishonchli manbadan qo'yiladi — kartalarda
 * `toCandidateCards` (getOverallRankings), biografiyada `getCandidateRanking`,
 * reyting sahifasida qatorning o'z `total_score`/`position` i.
 */
export const CANDIDATE_CARD_SELECT = CANDIDATE_BASE_SELECT;

// Supabase/PostgREST returns embedded to-one relations as an object, but the
// generic types widen it to array-or-object — normalize defensively here.
function one<T>(value: T | T[] | null): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeCandidateRow(row: any): CandidateCardData {
  const scores = Array.isArray(row.scores) ? row.scores : row.scores ? [row.scores] : [];
  const overall = scores.find((score: { category?: string; is_current?: boolean }) =>
    score.category === "overall" && score.is_current !== false
  );
  return {
    id: row.id,
    slug: row.slug,
    full_name: row.full_name,
    short_bio: row.short_bio,
    avatar_url: row.avatar_url,
    is_verified: row.status === "published",
    total_score: Number(row.total_score ?? overall?.total_score ?? 0),
    position: row.position ?? overall?.position ?? null,
    previous_position: row.previous_position ?? overall?.previous_position ?? null,
    is_top100: Boolean(row.is_top100),
    top100_position: row.top100_position ?? null,
    region: one(row.region),
    category: one(row.category),
  };
}

/**
 * Qatorlarni kartaga aylantiradi VA ballni ishonchli manbadan qo'yadi.
 *
 * Karta so'rovida ball yo'q (`CANDIDATE_CARD_SELECT` izohiga qarang).
 * Avval u ichma-ich so'rovdan (`scores:ranking_scores(...)`) olinardi,
 * u esa anon rol bilan o'qilib, `ranking_scores` ustidagi ommaviy RLS
 * siyosatiga tushardi: siyosat davr E'LON QILINGAN bo'lishini talab
 * qiladi, joriy davrda esa u bo'sh edi — natijada BARCHA kartada "0"
 * turardi va reyting bo'yicha saralash alifboga aylanib qolardi.
 *
 * Shuning uchun ball reyting sahifasi bilan BIR XIL manbadan
 * (`service_role`) qo'yiladi — bitta ma'lumot ikki xil javob
 * bermasligi uchun. Qo'shimcha so'rov BITTA va faqat shu sahifadagi
 * nomzodlar uchun.
 */
export async function toCandidateCards(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rows: readonly any[],
  options: { strict?: boolean } = {},
): Promise<CandidateCardData[]> {
  const items = rows.map(normalizeCandidateRow);
  if (items.length === 0) return items;

  const rankings = await getOverallRankings(items.map((item) => item.id), options);
  if (rankings.size === 0) return items;

  return items.map((item) => {
    const ranking = rankings.get(item.id);
    return ranking
      ? {
          ...item,
          total_score: ranking.totalScore,
          position: ranking.position,
          previous_position: ranking.previousPosition,
        }
      : item;
  });
}

export type CandidateFilters = {
  q?: string;
  regionSlug?: string;
  directionSlug?: string;
  birthYear?: number;
  sort?: "reyting" | "eng-yangi" | "alifbo" | "eng-kop-oqilgan";
  page?: number;
  perPage?: number;
};

/** Katalog ro'yxatini belgilovchi filtrlar — sahifa raqamisiz. */
type CatalogQuery = Omit<CandidateFilters, "page" | "perPage">;

export type CatalogPage = {
  items: CandidateCardData[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

/**
 * KATALOG — SERVER TOMONIDA SAHIFALASH.
 *
 * Avval to'liq ro'yxat bitta so'rovda olinardi, PostgREST esa uni jimgina
 * 1000 qatorda qirqardi: 3215 nomzoddan 2215 tasi katalogda umuman yo'q edi.
 * Endi:
 *   - "alifbo", "eng-yangi", "eng-kop-oqilgan" — bazada `range()` + `count`,
 *     ya'ni sahifaga bitta kichik so'rov;
 *   - "reyting" (standart) — tartib yengil qatorlardan quriladi va
 *     keshlanadi (`catalog-order.ts`), sahifaga faqat 12 ta karta so'raladi.
 * Har sahifa natijasi 5 daqiqa keshlanadi (`public-cache.ts`).
 */
export async function getCandidates(filters: CandidateFilters = {}): Promise<CatalogPage> {
  const query: CatalogQuery = {
    q: filters.q,
    regionSlug: filters.regionSlug,
    directionSlug: filters.directionSlug,
    birthYear: filters.birthYear,
    sort: filters.sort,
  };
  const page = Math.max(1, filters.page ?? 1);
  const perPage = filters.perPage ?? 12;
  return isRankingSort(query.sort)
    ? loadRankingPage(query, page, perPage)
    : getCachedCatalogPage(query, page, perPage);
}

const getCachedCatalogPage = unstable_cache(
  (query: CatalogQuery, page: number, perPage: number) => loadCatalogPage(query, page, perPage),
  ["public-candidate-catalog-page"],
  { revalidate: PUBLIC_LIST_REVALIDATE_SECONDS },
);

/** "Reyting" tartibi — filtr to'plami bo'yicha, sahifa raqamisiz. */
const getCachedRankingOrder = unstable_cache(
  (query: CatalogQuery) => loadRankingOrder(query),
  ["public-candidate-catalog-ranking-order"],
  { revalidate: PUBLIC_LIST_REVALIDATE_SECONDS },
);

/**
 * Joriy umumiy reyting — barcha filtr to'plamlari uchun bitta yozuv.
 * `[candidate_id, total_score, position, previous_position]`.
 */
type OverallTuple = [string, number, number | null, number | null];
const getCachedOverallScores = unstable_cache(
  async (): Promise<OverallTuple[]> =>
    (await getAllOverallRankingRows()).map((row) => [
      row.candidate_id,
      Number(row.total_score ?? 0),
      row.position ?? null,
      row.previous_position ?? null,
    ]),
  ["public-overall-rankings"],
  { revalidate: PUBLIC_LIST_REVALIDATE_SECONDS },
);

/**
 * Sahifa kartalari — kalit SAHIFA RAQAMI EMAS, ID lar ro'yxati. Shunda bir
 * tartib versiyasi ichida qo'shni sahifalar doim bir-biriga mos keladi
 * (takror yoki tushib qolgan nomzod yo'q).
 */
const getCachedCardsByIds = unstable_cache(
  (ids: string[]) => loadCardsByIds(ids),
  ["public-candidate-cards-by-ids"],
  { revalidate: PUBLIC_LIST_REVALIDATE_SECONDS },
);

function isRankingSort(sort: CatalogQuery["sort"]) {
  return sort === "reyting" || !sort;
}

type PublicClient = ReturnType<typeof createPublicClient>;
type CatalogFilterIds = { regionId: string | null; categoryId: string | null };

/**
 * Hudud/yo'nalish slug'ini ID ga aylantiradi. Avvalgidek: slug topilmasa
 * o'sha filtr QO'LLANMAYDI (ro'yxat bo'sh bo'lib qolmaydi).
 */
async function resolveCatalogFilterIds(supabase: PublicClient, query: CatalogQuery): Promise<CatalogFilterIds> {
  const [region, category] = await Promise.all([
    query.regionSlug
      ? supabase.from("regions").select("id").eq("slug", query.regionSlug).maybeSingle()
      : Promise.resolve({ data: null }),
    query.directionSlug
      ? supabase.from("categories").select("id").eq("slug", query.directionSlug).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);
  return {
    regionId: (region.data?.id as string | undefined) ?? null,
    categoryId: (category.data?.id as string | undefined) ?? null,
  };
}

/** Avvalgi `getCandidates` dagi filtrlar — o'zgarishsiz. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyCatalogFilters<Q extends { eq: any; is: any; ilike: any; gte: any; lte: any }>(
  builder: Q,
  query: CatalogQuery,
  ids: CatalogFilterIds,
): Q {
  let q = builder.eq("status", "published").is("deleted_at", null);
  if (query.q) {
    const text = query.q.replace(/[%_,()]/g, " ").trim();
    if (text) q = q.ilike("full_name", `%${text}%`);
  }
  if (query.birthYear) {
    q = q.gte("birth_date", `${query.birthYear}-01-01`).lte("birth_date", `${query.birthYear}-12-31`);
  }
  if (ids.regionId) q = q.eq("region_id", ids.regionId);
  if (ids.categoryId) q = q.eq("category_id", ids.categoryId);
  return q;
}

/**
 * Bitta katalog sahifasi. Cookie'siz anon mijoz: ro'yxat faqat chop etilgan
 * nomzodlardan iborat va tashrifchiga bog'liq emas. Reyting `strict`
 * rejimda — xato bo'lsa sahifa KESHGA TUSHMAYDI.
 */
async function loadCatalogPage(query: CatalogQuery, page: number, perPage: number): Promise<CatalogPage> {
  const supabase = createPublicClient();
  const { from, to } = pageRange(page, perPage);
  const ids = await resolveCatalogFilterIds(supabase, query);
  let builder = applyCatalogFilters(
    supabase.from("candidates").select(CANDIDATE_CARD_SELECT, { count: "exact" }),
    query,
    ids,
  );
  /*
   * "eng-kop-oqilgan" — HOZIRCHA "eng-yangi" TARTIBIDA, ya'ni bugun
   * production'da qanday ishlayotgan bo'lsa shunday (ikkala sahifa bir xil
   * edi). Avvalgi kod ko'rishlarni `.in()` bilan 1000 ID uchun so'rardi va
   * natija bo'sh qaytardi. To'g'ri saralash uchun bazada nomzod bo'yicha
   * ko'rishlar sonini beradigan funksiya kerak — bu sxema o'zgarishi,
   * egasining roziligisiz qilinmaydi.
   */
  builder =
    query.sort === "alifbo"
      ? builder.order("full_name", { ascending: true }).order("id")
      : builder.order("created_at", { ascending: false }).order("id");

  const { data, error, count } = await builder.range(from, to);
  if (error) {
    // Oxirgi sahifadan keyingi sahifa: PostgREST 416 (PGRST103) qaytaradi.
    // Avvalgidek bo'sh sahifa + to'g'ri sahifalar soni.
    if (error.code === "PGRST103") {
      const head = await applyCatalogFilters(
        supabase.from("candidates").select("id", { count: "exact", head: true }),
        query,
        ids,
      );
      if (head.error) throw head.error;
      const total = head.count ?? 0;
      return { items: [], total, page, perPage, totalPages: totalPagesFor(total, perPage) };
    }
    throw error;
  }

  const total = count ?? 0;
  const items = await toCandidateCards(data ?? [], { strict: true });
  return { items, total, page, perPage, totalPages: totalPagesFor(total, perPage) };
}

/**
 * "Reyting" saralashidagi sahifa. Tartib ham, kartadagi ball ham BIR XIL
 * keshlangan reyting nusxasidan — sahifadagi tartib va ko'rsatilgan ball
 * hech qachon bir-biriga zid bo'lmaydi.
 */
async function loadRankingPage(query: CatalogQuery, page: number, perPage: number): Promise<CatalogPage> {
  const { from, to } = pageRange(page, perPage);
  const [order, rankings] = await Promise.all([getCachedRankingOrder(query), getCachedOverallScores()]);
  const byId = new Map(rankings.map((tuple) => [tuple[0], tuple]));
  const cards = await getCachedCardsByIds(order.slice(from, to + 1));
  const items = cards.map((card) => {
    const ranking = byId.get(card.id);
    return ranking
      ? { ...card, total_score: ranking[1], position: ranking[2], previous_position: ranking[3] }
      : card;
  });
  return { items, total: order.length, page, perPage, totalPages: totalPagesFor(order.length, perPage) };
}

/** "Reyting" tartibidagi barcha mos nomzodlarning ID ro'yxati. */
async function loadRankingOrder(query: CatalogQuery): Promise<string[]> {
  const supabase = createPublicClient();
  const ids = await resolveCatalogFilterIds(supabase, query);
  const [rows, rankings] = await Promise.all([
    fetchAllRows<CatalogOrderRow>((from, to) =>
      applyCatalogFilters(supabase.from("candidates").select("id, full_name", { count: "exact" }), query, ids)
        .order("created_at", { ascending: false })
        .order("id")
        .range(from, to),
    ),
    getCachedOverallScores(),
  ]);
  return orderByRanking(rows, new Map(rankings.map(([id, score]) => [id, score])));
}

/**
 * Berilgan ID lar uchun kartalar — aynan shu tartibda. Ball bu yerda
 * qo'yilmaydi: uni chaqiruvchi tartib bilan bir xil reyting nusxasidan
 * qo'yadi (`loadRankingPage`).
 */
async function loadCardsByIds(ids: readonly string[]): Promise<CandidateCardData[]> {
  if (ids.length === 0) return [];
  const { data, error } = await createPublicClient()
    .from("candidates")
    .select(CANDIDATE_CARD_SELECT)
    .in("id", ids as string[])
    .eq("status", "published")
    .is("deleted_at", null);
  if (error) throw error;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const byId = new Map((data ?? []).map((row: any) => [row.id as string, row]));
  return ids
    .map((id) => byId.get(id))
    .filter((row) => row !== undefined)
    .map(normalizeCandidateRow);
}

export async function getFeaturedCandidates(limit = 6) {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("candidates")
    .select(CANDIDATE_CARD_SELECT)
    .eq("status", "published")
    .eq("is_top100", true)
    .order("top100_position", { ascending: true, nullsFirst: false })
    .limit(limit);
  if (error) throw error;
  return toCandidateCards(data ?? []);
}

export async function getTopCandidates(limit = 8) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("ranking_scores")
    .select(
      `total_score, position, previous_position,
       candidate:candidates!inner(${CANDIDATE_BASE_SELECT})`
    )
    .eq("category", "overall")
    .eq("is_current", true)
    .eq("candidate.status", "published")
    .order("position", { ascending: true, nullsFirst: false })
    .limit(limit);
  if (error) throw error;
  const ranked = (data ?? [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((row: any) => {
      const candidate = one(row.candidate);
      return candidate
        ? normalizeCandidateRow({
            ...candidate,
            total_score: row.total_score,
            position: row.position,
            previous_position: row.previous_position,
          })
        : null;
    })
    .filter((candidate): candidate is CandidateCardData => candidate !== null);

  return ranked.length > 0 ? ranked : getFeaturedCandidates(limit);
}

export async function getRecentCandidates(limit = 8) {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("candidates")
    .select(CANDIDATE_CARD_SELECT)
    .eq("status", "published")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return toCandidateCards(data ?? []);
}

export async function getCandidateBySlug(slug: string) {
  const supabase = await createServerSupabase();
  const candidateRequest = supabase
    .from("candidates")
    .select(
      `${CANDIDATE_CARD_SELECT}, birth_date, created_at,
       description_items, birth_year, birth_place, current_location,
       education_summary, activity_field, languages`
    )
    .eq("slug", slug)
    .eq("status", "published")
    .is("deleted_at", null)
    .maybeSingle();
  const integrationKeyRequest = supabase
    .from("candidates")
    .select("integration_key")
    .eq("slug", slug)
    .eq("status", "published")
    .is("deleted_at", null)
    .maybeSingle();
  const [{ data, error }, integrationKeyResult] = await Promise.all([
    candidateRequest,
    integrationKeyRequest,
  ]);
  if (error) throw error;
  if (!data) return null;

  const integrationKey =
    !integrationKeyResult.error &&
    typeof integrationKeyResult.data?.integration_key === "string"
      ? integrationKeyResult.data.integration_key
      : null;
  const admin = createAdminClient();
  const [education, workExperience, achievements, booksRead, events, socialLinks, certificates, media, quotes, articles, sections, views, adabiyotXItems, ranking, memberArticles] =
    await Promise.all([
      /*
       * `review_state = 'published'` — TEKSHIRUVDAGI YOZUV OMMAGA
       * CHIQMAYDI.
       *
       * Foydalanuvchi profil muharririda "Yutuqlar" ga yozuv
       * qo'shsa, u tasdiqlanmaguncha shu yerda ko'rinmaydi (§6).
       *
       * Bu filtr YAGONA himoya emas: RLS siyosati ham shu shartni
       * tekshiradi. Ikkisi ham bor, chunki RLS ilovadan mustaqil
       * ishlashi kerak, ilova filtri esa so'rovni tejaydi va
       * niyatni kodda ko'rinadigan qiladi.
       */
      supabase.from("education").select("*").eq("candidate_id", data.id).eq("review_state", "published").order("sort_order"),
      supabase.from("work_experiences").select("*").eq("candidate_id", data.id).eq("review_state", "published").order("sort_order"),
      supabase.from("achievements").select("*").eq("candidate_id", data.id).eq("review_state", "published").order("date_from", { ascending: false }),
      supabase.from("books_read").select("*").eq("candidate_id", data.id).eq("review_state", "published").order("date_from", { ascending: false }),
      supabase.from("events").select("*").eq("candidate_id", data.id).eq("review_state", "published").order("date_from", { ascending: false }),
      supabase.from("social_links").select("*").eq("candidate_id", data.id).eq("review_state", "published").order("sort_order"),
      /*
       * SERTIFIKATLAR — FAQAT ADMIN OCHGAN DARAJALAR.
       *
       * `pending_review` va `rejected` ommada ko'rinmaydi: birinchisi
       * hali ko'rilmagan da'vo, ikkinchisi rad etilgan. RLS siyosati
       * ham shu shartni tekshiradi — bu filtr niyatni kodda
       * ko'rinadigan qiladi va so'rovni tejaydi.
       */
      supabase
        .from("candidate_certificates")
        .select("id, title, issuer, issued_on, expires_on, credential_url, trust")
        .eq("candidate_id", data.id)
        .in("trust", ["user_entered", "verified"])
        .order("sort_order"),
      admin
        .from("candidate_media")
        .select("*")
        .eq("candidate_id", data.id)
        .in("bucket", ["candidate-avatars", "candidate-gallery"])
        .is("deleted_at", null)
        .order("created_at"),
      supabase
        .from("quotes")
        .select("*")
        .eq("candidate_id", data.id)
        .eq("status", "published")
        .order("created_at", { ascending: false }),
      supabase
        .from("articles")
        .select("id, slug, title, excerpt, cover_url, published_at, content")
        .eq("candidate_id", data.id)
        .eq("status", "published")
        .is("deleted_at", null)
        .order("published_at", { ascending: false }),
      /*
       * `review_state = 'published'` — TEKSHIRUVDAGI MATN OMMAGA
       * CHIQMAYDI.
       *
       * A'zo biografiya bo'limini o'zgartirsa, u tasdiqlanmaguncha shu
       * yerda ko'rinmaydi (§6). RLS siyosati ham shu shartni tekshiradi
       * — ikkisi ham bor, chunki RLS ilovadan mustaqil ishlashi kerak.
       */
      supabase
        .from("candidate_sections")
        .select("id, title, content, sort_order")
        .eq("candidate_id", data.id)
        .eq("review_state", "published")
        .order("sort_order")
        .order("created_at"),
      admin
        .from("profile_views")
        .select("id", { count: "exact", head: true })
        .eq("candidate_id", data.id)
        .eq("is_counted", true),
      getCandidateAdabiyotXItems(integrationKey),
      /*
       * REYTING — YAGONA MANBADAN, KARTA SO'ROVIDAN EMAS.
       *
       * Karta so'rovida ball yo'q; avvalgi ichma-ich so'rov
       * (`scores:ranking_scores(...)`) anon rol bilan RLS siyosatiga
       * tushardi: davr e'lon qilinmagan bo'lsa, NOLTA qator qaytardi va
       * biografiyada "0 ball" turardi. Reyting sahifasi esa shu jadvalni
       * `service_role` bilan o'qib, to'g'ri raqamni ko'rsatadi.
       * Bitta ma'lumot ikki xil javob bermasligi uchun biografiya
       * ham reyting sahifasi bilan BIR XIL manbaga ulandi.
       */
      getCandidateRanking(data.id as string),
      /*
       * A'ZONING O'Z MAQOLALARI — Liderlar Online'da nashr qilinganlari.
       *
       * Avtomatik ko'rinadi; muallif kabinetda har birini yashira oladi
       * (`show_on_profile`). Mazmun olinmaydi — sahifada faqat karta,
       * to'liq matn o'z manzilida (`/liderlar-online/<slug>`).
       *
       * Anon rol bilan o'qiladi: RLS faqat nashr qilingan maqolani va
       * faqat nashr qilingan nomzodnikini ochadi.
       */
      supabase
        .from("member_articles")
        .select("id, slug, title, subtitle, excerpt, hero_url, hero_alt, published_at")
        .eq("candidate_id", data.id)
        .eq("state", "published")
        .eq("show_on_profile", true)
        .not("slug", "is", null)
        .order("published_at", { ascending: false })
        .limit(24),
    ]);

  const publicMedia = (media.data ?? []).map((item) => ({
    ...item,
    url: /^https?:\/\//.test(item.path)
      ? item.path
      : admin.storage.from(item.bucket).getPublicUrl(item.path).data.publicUrl,
    /*
     * IZOH — `alt_text` dan, fayl nomidan EMAS.
     *
     * Fayl nomi ("3f2a9c1e….webp", "telegram-gallery.jpg", "IMG_2041.JPG")
     * ekran o'quvchisi uchun shovqin va kattalashtirilgan oynada izoh
     * bo'lib chiqardi. Tavsif kiritilmagan bo'lsa — `null`, komponent
     * o'zining umumiy matnini ishlatadi.
     */
    caption: (item.alt_text as string | null | undefined) ?? null,
  }));

  const normalized = normalizeCandidateRow(data);
  const birthYearFromDate = data.birth_date ? String(new Date(data.birth_date).getUTCFullYear()) : null;
  const descriptionItems = toShortBioItems(
    data.description_items?.length ? data.description_items : normalized.short_bio,
  );
  const sectionRows: CandidateSectionData[] = (sections.data ?? [])
    .map((s) => ({
      id: s.id as string,
      title: stripCandidateMarkers(s.title as string),
      content: stripCandidateMarkers(s.content as string),
    }))
    .filter((s) => s.title || s.content);

  return {
    ...normalized,
    /*
     * BALL VA O'RIN KARTA SO'ROVIDAGI QIYMATNI BOSADI.
     *
     * `normalizeCandidateRow` ularni anon rol ko'rgan ichma-ich
     * so'rovdan oladi; u RLS sababli bo'sh bo'lishi mumkin. Shuning
     * uchun ustiga ishonchli manbadagi qiymat yoziladi.
     */
    total_score: ranking.totalScore,
    position: ranking.position,
    previous_position: ranking.previousPosition,
    ranking,
    birth_date: data.birth_date as string | null,
    description_items: descriptionItems,
    birth_year_display: stripCandidateMarkers(data.birth_year as string | null) || birthYearFromDate,
    birth_place: stripCandidateMarkers(data.birth_place as string | null) || null,
    current_location: stripCandidateMarkers(data.current_location as string | null) || normalized.region?.name || null,
    education_summary: stripCandidateMarkers(data.education_summary as string | null) || null,
    activity_field: stripCandidateMarkers(data.activity_field as string | null) || normalized.category?.name || null,
    languages: splitPipeValues(data.languages as string[] | null),
    sections: sectionRows,
    cover_url: publicMedia[0]?.url ?? null,
    view_count: views.count ?? 0,
    education: education.data ?? [],
    workExperience: workExperience.data ?? [],
    achievements: achievements.data ?? [],
    booksRead: booksRead.data ?? [],
    events: events.data ?? [],
    socialLinks: socialLinks.data ?? [],
    certificates: certificates.data ?? [],
    media: publicMedia,
    quotes: quotes.data ?? [],
    articles: articles.data ?? [],
    memberArticles: (memberArticles.data ?? []).map((row) => ({
      id: row.id as string,
      slug: row.slug as string,
      title: (row.title as string) ?? "",
      subtitle: (row.subtitle as string | null) ?? null,
      excerpt: (row.excerpt as string | null) ?? null,
      /*
       * Faqat bizning storage'dagi rasm — begona host `next/image` da
       * butun biografiyani yiqitardi (o'n bitta ko'rinishning hammasi
       * shu qiymatdan foydalanadi, himoya bitta joyda).
       */
      heroUrl: isStoredHeroUrl(row.hero_url as string | null) ? (row.hero_url as string) : null,
      heroAlt: (row.hero_alt as string | null) ?? null,
      publishedAt: (row.published_at as string | null) ?? null,
      href: `/liderlar-online/${row.slug as string}`,
    })),
    adabiyotXItems,
  };
}

export async function getSimilarCandidates(candidateId: string, directionSlug: string | null, limit = 4) {
  if (!directionSlug) return [];
  const supabase = await createServerSupabase();
  const { data: category } = await supabase.from("categories").select("id").eq("slug", directionSlug).maybeSingle();
  if (!category) return [];

  const { data, error } = await supabase
    .from("candidates")
    .select(CANDIDATE_CARD_SELECT)
    .eq("status", "published")
    .eq("category_id", category.id)
    .neq("id", candidateId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return toCandidateCards(data ?? []);
}
