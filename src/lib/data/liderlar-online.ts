import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { readingMinutes } from "@/lib/articles/state";
import { richTextToPlain } from "@/lib/articles/rich-text";

/**
 * LIDERLAR ONLINE — OMMAVIY MA'LUMOT.
 *
 * §51: sahifalash kursor bilan, cheksiz `select *` yo'q.
 *
 * NEGA KURSOR, `offset` EMAS: `offset` oshgani sari baza oldidagi
 * barcha qatorlarni sanab o'tadi va oxirgi sahifalar sekinlashadi.
 * Kursor (`published_at` dan kichik) esa indeksdan to'g'ridan-to'g'ri
 * foydalanadi — `idx_member_articles_published` aynan shu uchun.
 */

export interface OnlineCard {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  excerpt: string | null;
  heroUrl: string;
  heroAlt: string | null;
  /** Banner o'lchami — masonry balandligi; `null` bo'lsa 16:9. */
  heroWidth: number | null;
  heroHeight: number | null;
  publishedAt: string;
  author: {
    name: string;
    slug: string;
    avatarUrl: string | null;
  };
}

export interface OnlineFeed {
  items: OnlineCard[];
  /** Keyingi sahifa uchun kursor. `null` — oxiri. */
  nextCursor: string | null;
}

/*
 * SO'RALADIGAN USTUNLAR ANIQ SANALGAN.
 *
 * `select("*")` mazmunni ham tortib kelardi — ro'yxat uchun u kerak
 * emas va har kartochka uchun o'n minglab belgi uzatilardi (§51).
 */
const CARD_COLUMNS =
  "id, slug, title, subtitle, excerpt, hero_url, hero_alt, hero_width, hero_height, published_at, candidates(full_name, slug, avatar_url)";

function toCard(row: Record<string, unknown>): OnlineCard | null {
  const candidate = row.candidates as
    | { full_name?: string; slug?: string; avatar_url?: string | null }
    | null;

  const slug = row.slug as string | null;
  const heroUrl = row.hero_url as string | null;
  const publishedAt = row.published_at as string | null;

  /*
   * NOTO'LIQ QATOR RO'YXATDAN CHIQARILADI.
   *
   * Manzil, banner yoki muallifsiz kartochka buzilgan havola yoki
   * bo'sh rasm bo'lib chiqardi. Bazadagi qo'riqchi bunga yo'l
   * qo'ymaydi, lekin ro'yxat shunga TAYANMAYDI: ommaviy sahifa
   * ma'lumot nuqsoni sababli buzilmasligi kerak.
   */
  if (!slug || !heroUrl || !publishedAt || !candidate?.slug) return null;

  return {
    id: row.id as string,
    slug,
    title: (row.title as string) ?? "",
    subtitle: (row.subtitle as string | null) ?? null,
    excerpt: (row.excerpt as string | null) ?? null,
    heroUrl,
    heroAlt: (row.hero_alt as string | null) ?? null,
    heroWidth: (row.hero_width as number | null) ?? null,
    heroHeight: (row.hero_height as number | null) ?? null,
    publishedAt,
    author: {
      name: candidate.full_name?.trim() || "Muallif",
      slug: candidate.slug,
      avatarUrl: candidate.avatar_url ?? null,
    },
  };
}

/**
 * Nashr qilingan maqolalar lentasi.
 *
 * `cursor` — oxirgi ko'rsatilgan maqolaning `published_at` qiymati.
 */
export async function getOnlineFeed(
  limit = 12,
  cursor?: string | null,
): Promise<OnlineFeed> {
  const admin = createAdminClient();

  let query = admin
    .from("member_articles")
    .select(CARD_COLUMNS)
    .eq("state", "published")
    .order("published_at", { ascending: false })
    .order("id", { ascending: false })
    /*
     * BITTA ORTIQCHA OLINADI.
     *
     * "Yana bormi" degan savolga javob berish uchun: alohida
     * `count` so'rovi butun jadvalni sanab o'tardi.
     */
    .limit(limit + 1);

  /*
   * KURSOR — (published_at, id). Faqat sana bo'lsa, bir xil soniyada
   * nashr qilingan maqolalar sahifalar chegarasida TUSHIB QOLARDI.
   * Eski shakl (faqat sana) ham qabul qilinadi — tashqi havolalar uchun.
   */
  const parsed = parseCursor(cursor);
  if (parsed?.id) {
    query = query.or(
      `published_at.lt."${parsed.publishedAt}",and(published_at.eq."${parsed.publishedAt}",id.lt.${parsed.id})`,
    );
  } else if (parsed) {
    query = query.lt("published_at", parsed.publishedAt);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[online] lenta o'qilmadi:", error.message);
    return { items: [], nextCursor: null };
  }

  const rows = data ?? [];
  const hasMore = rows.length > limit;
  const items = rows
    .slice(0, limit)
    .map((row) => toCard(row as Record<string, unknown>))
    .filter((card): card is OnlineCard => card !== null);

  const last = rows.slice(0, limit).at(-1) as { published_at?: string; id?: string } | undefined;
  return {
    items,
    nextCursor: hasMore && last?.published_at && last.id ? `${last.published_at}~${last.id}` : null,
  };
}

/**
 * Kursorni xavfsiz o'qiydi: faqat ISO vaqt va uuid. Boshqa narsa
 * PostgREST filtr satriga tushmasligi kerak.
 */
export function parseCursor(cursor: string | null | undefined): { publishedAt: string; id: string | null } | null {
  if (!cursor) return null;
  const [rawTime, rawId] = cursor.split("~");
  const time = Date.parse(rawTime ?? "");
  if (!Number.isFinite(time)) return null;
  const id = rawId && /^[0-9a-f-]{36}$/i.test(rawId) ? rawId : null;
  return { publishedAt: new Date(time).toISOString(), id };
}

/**
 * Bosh sahifadagi asosiy maqola (§29).
 *
 * Eng yangisi olinadi. "Tahririyat tanlovi" yo'q, chunki uning
 * ma'lumoti hali mavjud emas — §29 "Editor's selection if editorial
 * data exists" deydi va yo'q narsani o'ylab chiqarish §71 ga zid.
 */
export async function getFeaturedArticle(): Promise<OnlineCard | null> {
  const feed = await getOnlineFeed(1);
  return feed.items[0] ?? null;
}

/* ========================================================================= *
 * BITTA MAQOLA
 * ========================================================================= */

export interface OnlineArticle extends OnlineCard {
  content: string;
  /** `null` — matn juda qisqa, vaqt ko'rsatilmaydi (§31). */
  readingMinutes: number | null;
  seoTitle: string | null;
  seoDescription: string | null;
}

export async function getOnlineArticle(slug: string): Promise<OnlineArticle | null> {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("member_articles")
    .select(`${CARD_COLUMNS}, content, seo_title, seo_description`)
    .eq("slug", slug)
    .eq("state", "published")
    .maybeSingle();

  if (error) {
    console.error("[online] maqola o'qilmadi:", error.message);
    return null;
  }
  if (!data) return null;

  const card = toCard(data as Record<string, unknown>);
  if (!card) return null;

  const content = (data.content as string) ?? "";

  return {
    ...card,
    content,
    // Belgilar va havola manzillari so'z bo'lib sanalmasin.
    readingMinutes: readingMinutes(richTextToPlain(content)),
    seoTitle: (data.seo_title as string | null) ?? null,
    seoDescription: (data.seo_description as string | null) ?? null,
  };
}

/**
 * O'xshash maqolalar (§31).
 *
 * SHU MUALLIFNING boshqa maqolalari. Mavzu bo'yicha o'xshashlik
 * YO'Q, chunki maqolalarda hali kategoriya yo'q — tasodifiy
 * maqolalarni "o'xshash" deb ko'rsatish yolg'on bo'lardi (§31
 * "related articles based on real taxonomy").
 */
export async function getMoreFromAuthor(
  candidateSlug: string,
  excludeSlug: string,
  limit = 3,
): Promise<OnlineCard[]> {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("member_articles")
    .select(CARD_COLUMNS)
    .eq("state", "published")
    .neq("slug", excludeSlug)
    .order("published_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("[online] muallif maqolalari o'qilmadi:", error.message);
    return [];
  }

  /*
   * MUALLIF BO'YICHA FILTR XOTIRADA.
   *
   * PostgREST ichma-ich jadval ustunidan filtrlashni qo'llab
   * quvvatlaydi, lekin u indeksdan foydalanmaydi va so'rov
   * sekinlashadi. 20 qator olib, shu yerda ajratish arzonroq.
   */
  return (data ?? [])
    .map((row) => toCard(row as Record<string, unknown>))
    .filter((card): card is OnlineCard => card !== null && card.author.slug === candidateSlug)
    .slice(0, limit);
}

/** Sitemap uchun manzillar (§32). */
export async function getOnlineSlugs(limit = 5000): Promise<
  Array<{ slug: string; publishedAt: string }>
> {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("member_articles")
    .select("slug, published_at")
    .eq("state", "published")
    .not("slug", "is", null)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[online] sitemap o'qilmadi:", error.message);
    return [];
  }

  return (data ?? [])
    .filter((row) => row.slug && row.published_at)
    .map((row) => ({
      slug: row.slug as string,
      publishedAt: row.published_at as string,
    }));
}
