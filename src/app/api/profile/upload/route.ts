import { NextResponse } from "next/server";
import {
  commitProfileUpload,
  signProfileUpload,
} from "@/lib/profile-editor/upload-service";

export const runtime = "nodejs";

/**
 * POST /api/profile/upload
 *
 * Ikki qadamli yuklash: `step: "sign"` imzo beradi, `step: "commit"`
 * yuklangan faylni ro'yxatga oladi.
 *
 * BITTA MARSHRUT, ikki qadam: ikkisi bir xil huquq va egalik
 * tekshiruvidan o'tadi va ularni alohida fayllarga ajratish o'sha
 * tekshiruvni ikki joyda saqlashga olib kelardi.
 *
 * BAYTLAR BU MARSHRUT ORQALI O'TMAYDI — brauzer imzolangan URL bilan
 * to'g'ridan-to'g'ri Supabase'ga yuklaydi. Shuning uchun Vercel'ning
 * ~4.5 MB so'rov chekvasi bu yerda to'siq bo'lmaydi.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (body === null || typeof body !== "object") {
    return NextResponse.json({ error: "So'rov formati noto'g'ri." }, { status: 400 });
  }

  const input = body as Record<string, unknown>;

  if (input.step === "sign") {
    const result = await signProfileUpload({
      kind: input.kind,
      mimeType: input.mimeType,
      size: input.size,
    });
    return result.ok
      ? NextResponse.json(result.upload)
      : NextResponse.json({ error: result.error }, { status: 400 });
  }

  if (input.step === "commit") {
    const result = await commitProfileUpload({
      kind: input.kind,
      path: input.path,
      altText: input.altText,
    });
    return result.ok
      ? NextResponse.json({ url: result.url })
      : NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ error: "Noma'lum qadam." }, { status: 400 });
}
