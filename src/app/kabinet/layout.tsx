import { redirect } from "next/navigation";
import { createClient as createServerSupabase } from "@/lib/supabase/server";

// Defense in depth: src/proxy.ts already does an optimistic redirect for
// /kabinet, but per Next's guidance a Proxy redirect alone is not a full
// authorization solution — every server entry point re-checks the session.
export default async function KabinetLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/kirish?next=/kabinet");
  }

  return <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">{children}</div>;
}
