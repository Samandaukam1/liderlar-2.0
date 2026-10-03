"use server";

import { revalidatePath } from "next/cache";
import {
  discardDraftTheme,
  publishDraftTheme,
  resetToDefaultTheme,
  setDraftTheme,
  type ThemeWriteResult,
} from "@/lib/themes/preference-service";

/**
 * DIZAYN AMALLARI.
 *
 * Huquq, egalik va kalit tekshiruvi xizmat qatlamida — bu fayl faqat
 * chaqiradi va keshni yangilaydi.
 *
 * `revalidatePath` OMMAVIY sahifani ham qamraydi: nashr qilingandan
 * keyin odam o'z profiliga kirib eski dizaynni ko'rmasligi kerak.
 */
function refresh(slug?: string) {
  revalidatePath("/kabinet/profil/dizayn");
  revalidatePath("/kabinet/profil");
  if (slug) revalidatePath(`/liderlar/${slug}`);
}

export async function chooseTheme(key: string, slug?: string): Promise<ThemeWriteResult> {
  const result = await setDraftTheme(key);
  if (result.ok) refresh(slug);
  return result;
}

export async function publishTheme(slug?: string): Promise<ThemeWriteResult> {
  const result = await publishDraftTheme();
  if (result.ok) refresh(slug);
  return result;
}

export async function discardTheme(slug?: string): Promise<ThemeWriteResult> {
  const result = await discardDraftTheme();
  if (result.ok) refresh(slug);
  return result;
}

export async function resetTheme(slug?: string): Promise<ThemeWriteResult> {
  const result = await resetToDefaultTheme();
  if (result.ok) refresh(slug);
  return result;
}
