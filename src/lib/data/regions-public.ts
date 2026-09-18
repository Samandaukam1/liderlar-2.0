import { createClient as createServerSupabase } from "@/lib/supabase/server";

/**
 * HUDUD BO'YICHA OMMAVIY MA'LUMOT.
 *
 * BU YERDAN CHIQADIGAN HAR MAYDON OMMAVIY. Shuning uchun so'rov
 * `select("*")` EMAS, aniq ustunlar ro'yxati: yangi ustun
 * qo'shilganda u avtomatik ommaviy bo'lib qolmasin.
 *
 * HECH QACHON CHIQMAYDI: telegram_user_id, ichki telefon,
 * komissiya, lid, CRM eslatmalari, to'lov ma'lumoti.
 */

export interface PublicCoordinator {
  fullName: string;
  photoUrl: string | null;
  /** FAQAT ochiq deb belgilangan raqam. */
  publicPhone: string | null;
  publicEmail: string | null;
  bio: string | null;
}

export interface PublicRegionLeader {
  slug: string;
  fullName: string;
  photoUrl: string | null;
  descriptor: string | null;
}

export interface PublicRegionInfo {
  slug: string;
  name: string;
  coordinators: PublicCoordinator[];
  leaders: PublicRegionLeader[];
  totalLeaders: number;
}

/** Nechta lider ko'rsatiladi. */
export const REGION_LEADERS_LIMIT = 5;

export async function getPublicRegionInfo(slug: string): Promise<PublicRegionInfo | null> {
  const supabase = await createServerSupabase();

  const { data: region } = await supabase
    .from("regions")
    .select("id, slug, name")
    .eq("slug", slug)
    .maybeSingle();
  if (!region) return null;

  /*
   * KOORDINATOR — FAQAT OCHIQ MAYDONLAR.
   *
   * `show_phone_publicly` alohida bayroq: ichki raqamni "ommaviy"
   * deb taxmin qilish shaxsiy ma'lumotni tarqatish demak.
   */
  const { data: coordinators } = await supabase
    .from("coordinators")
    .select("full_name, photo_url, public_phone, show_phone_publicly, public_email, bio")
    .eq("region_id", region.id)
    .eq("is_active", true);

  /*
   * LIDERLAR — FAQAT CHOP ETILGANLARI.
   *
   * TARTIB QOIDASI: eng so'nggi qo'shilgan 5 ta chop etilgan nomzod.
   *
   * `created_at` bo'yicha, `published_at` bo'yicha EMAS —
   * `candidates` jadvalida bunday ustun YO'Q (nashr sanasi
   * `articles` da yashaydi va har nomzodda maqola bo'lmasligi
   * mumkin).
   *
   * "Eng yaxshi nomzod" degan yashirin ball o'ylab TOPILMADI:
   * bunday ball nima ekanini hech kim tekshira olmasdi va u
   * ommaviy sahifada kimningdir oldinga chiqishini tushuntirib
   * bera olmasdi.
   */
  const { data: leaders, count } = await supabase
    .from("candidates")
    .select("slug, full_name, avatar_url, short_bio, created_at", { count: "exact" })
    .eq("region_id", region.id)
    .eq("status", "published")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(REGION_LEADERS_LIMIT);

  return {
    slug: region.slug as string,
    name: region.name as string,
    coordinators: (coordinators ?? []).map((c) => ({
      fullName: (c.full_name as string) ?? "",
      photoUrl: (c.photo_url as string | null) ?? null,
      // Bayroq o'chiq bo'lsa raqam UMUMAN qaytmaydi — uni
      // frontendda yashirish yetarli emas.
      publicPhone: c.show_phone_publicly ? ((c.public_phone as string | null) ?? null) : null,
      publicEmail: (c.public_email as string | null) ?? null,
      bio: (c.bio as string | null) ?? null,
    })),
    leaders: (leaders ?? []).map((l) => ({
      slug: (l.slug as string) ?? "",
      fullName: (l.full_name as string) ?? "",
      photoUrl: (l.avatar_url as string | null) ?? null,
      descriptor: (l.short_bio as string | null) ?? null,
    })),
    totalLeaders: count ?? 0,
  };
}

/** Xarita uchun: qaysi hududda koordinator bor. Son yoki KPI YO'Q. */
export async function getRegionsWithCoordinatorFlag(): Promise<
  Array<{ slug: string; name: string; hasCoordinator: boolean }>
> {
  const supabase = await createServerSupabase();
  const [{ data: regions }, { data: coordinators }] = await Promise.all([
    supabase.from("regions").select("id, slug, name").order("sort_order"),
    supabase.from("coordinators").select("region_id").eq("is_active", true),
  ]);

  const withCoordinator = new Set(
    (coordinators ?? []).map((c) => c.region_id as string).filter(Boolean),
  );

  return (regions ?? []).map((r) => ({
    slug: r.slug as string,
    name: r.name as string,
    hasCoordinator: withCoordinator.has(r.id as string),
  }));
}
