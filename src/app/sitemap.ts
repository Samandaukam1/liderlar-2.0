import type { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { SITE_URL } from "@/lib/constants";
import { getPublishedLegacyPostsForSitemap } from "@/lib/data/legacy-posts";

const STATIC_ROUTES = [
  "",
  "/liderlar",
  "/reyting",
  "/yonalishlar",
  "/podcastlar",
  "/podcastlar/taqvim",
  "/jurnal",
  "/iqtiboslar",
  "/top-100",
  "/ariza",
  "/loyiha-haqida",
  "/ommaviy_ofertasi",
  "/maxfiylik-siyosati",
  "/foydalanish-shartlari",
  "/qidiruv",
  "/kirish",
  "/royxatdan-otish",
  "/ai",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  try {
    const admin = createAdminClient();

    const [candidates, journals, podcasts, articles, legacyPosts] = await Promise.all([
      admin.from("candidates").select("slug, updated_at").eq("status", "published").limit(5000),
      admin.from("journals").select("issue_number").eq("status", "published").limit(1000),
      admin
        .from("podcasts")
        .select("id")
        .in("status", ["announced", "live", "recorded", "published"])
        .limit(1000),
      admin.from("articles").select("slug, updated_at").eq("status", "published").limit(5000),
      // Liderlar 1.0 arxivi — 2.0 bilan YONMA-YON, uning o'rniga emas.
      getPublishedLegacyPostsForSitemap(),
    ]);

    const dynamicEntries: MetadataRoute.Sitemap = [
      ...(candidates.data ?? []).map((c) => ({
        url: `${SITE_URL}/liderlar/${c.slug}`,
        lastModified: c.updated_at ? new Date(c.updated_at) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
      ...(journals.data ?? []).map((j) => ({
        url: `${SITE_URL}/jurnal/issue-${j.issue_number}`,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
      ...(podcasts.data ?? []).map((p) => ({
        url: `${SITE_URL}/podcastlar/${p.id}`,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
      ...(articles.data ?? []).map((a) => ({
        url: `${SITE_URL}/maqola/${a.slug}`,
        lastModified: a.updated_at ? new Date(a.updated_at) : new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
      // Eski manzillar o'z holicha indekslanadi: ular /liderlar ga
      // yo'naltirilmaydi, shuning uchun sitemapda ham o'zlari turadi.
      ...legacyPosts.map((post) => ({
        url: `${SITE_URL}${post.legacy_path}`,
        // Manbadagi HAQIQIY sana. Yo'q bo'lsa lastModified umuman
        // yozilmaydi — import sanasini qo'yish tarixni buzish bo'lardi.
        ...(post.legacy_created_at
          ? { lastModified: new Date(post.legacy_created_at) }
          : {}),
        changeFrequency: "yearly" as const,
        priority: 0.5,
      })),
    ];

    return [...staticEntries, ...dynamicEntries];
  } catch (err) {
    console.error("sitemap: falling back to static routes only —", err);
    return staticEntries;
  }
}
