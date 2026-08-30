import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { applicationSchema } from "@/lib/validation/application";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const input = await request.json().catch(() => null);
  if (input === null || typeof input !== "object") {
    return Response.json({ error: "So'rov formati noto'g'ri." }, { status: 400 });
  }

  const parsed = applicationSchema.safeParse(input);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Formada xatolik bor." },
      { status: 400 }
    );
  }

  const { fullName, phone, telegram, gender, ageRange, promoCode } = parsed.data;

  const admin = createAdminClient();
  const { error } = await admin.from("applications").insert({
    full_name: fullName,
    phone,
    telegram,
    gender,
    age_range: ageRange,
    promo_code: promoCode || null,
    status: "new",
  });

  if (error) {
    console.error("Application submit error:", error);
    return Response.json({ error: "Arizani saqlashda xatolik yuz berdi." }, { status: 500 });
  }

  return Response.json({ ok: true });
}
