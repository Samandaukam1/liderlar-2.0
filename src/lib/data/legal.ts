import { createClient as createServerSupabase } from "@/lib/supabase/server";

export async function getLegalPage(slug: "oferta" | "privacy" | "terms") {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("legal_pages")
    .select("slug, title, content, updated_at")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data;
}
