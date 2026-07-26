import { createClient as createServerSupabase } from "@/lib/supabase/server";

export async function getRegions() {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.from("regions").select("*").order("sort_order");
  if (error) throw error;
  return data ?? [];
}

export async function getDirections() {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.from("categories").select("*").order("sort_order");
  if (error) throw error;
  return data ?? [];
}

export async function getDirectionsWithCounts() {
  const supabase = await createServerSupabase();
  const { data: directions, error } = await supabase.from("categories").select("*").order("sort_order");
  if (error) throw error;

  const counts = await Promise.all(
    (directions ?? []).map((d) =>
      supabase
        .from("candidates")
        .select("id", { count: "exact", head: true })
        .eq("status", "published")
        .eq("category_id", d.id)
        .then(({ count }) => count ?? 0)
    )
  );

  return (directions ?? []).map((d, i) => ({ ...d, candidateCount: counts[i] }));
}

export async function getDirectionBySlug(slug: string) {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.from("categories").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data;
}

export async function getSiteSetting<T = string>(key: string): Promise<T | null> {
  const supabase = await createServerSupabase();
  const { data } = await supabase.from("site_settings").select("value").eq("key", key).maybeSingle();
  return (data?.value as T) ?? null;
}
