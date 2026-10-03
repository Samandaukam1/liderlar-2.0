"use server";

import { revalidatePath } from "next/cache";
import {
  createArticle,
  saveArticle,
  setArticleHero,
  submitArticle,
  type ArticleDraftInput,
} from "@/lib/articles/author-service";

/**
 * MAQOLA AMALLARI.
 *
 * Huquq, egalik va holat tekshiruvi xizmat qatlamida — bu fayl faqat
 * chaqiradi va keshni yangilaydi.
 */

function refresh(articleId?: string) {
  revalidatePath("/kabinet/maqolalar");
  if (articleId) revalidatePath(`/kabinet/maqolalar/${articleId}`);
}

export async function newArticle(
  title: string,
): Promise<{ ok: boolean; id?: string; error?: string }> {
  const result = await createArticle(title);
  if (result.ok) refresh();
  return result.ok ? { ok: true, id: result.id } : { ok: false, error: result.error };
}

/**
 * Qoralamani saqlaydi.
 *
 * `autosave` — avtosaqlash. U keshni YANGILAMAYDI: har 30 soniyada
 * sahifani qayta yuklash foydalanuvchi yozayotgan matnni almashtirib
 * yuborardi.
 */
export async function saveDraft(
  articleId: string,
  input: ArticleDraftInput,
  autosave = false,
): Promise<{ ok: boolean; error?: string }> {
  const result = await saveArticle(articleId, input, autosave);
  if (result.ok && !autosave) refresh(articleId);
  return result;
}

export async function uploadHero(
  articleId: string,
  heroUrl: string,
  dimensions?: { width: number; height: number },
): Promise<{ ok: boolean; error?: string }> {
  const result = await setArticleHero(articleId, heroUrl, dimensions);
  if (result.ok) refresh(articleId);
  return result;
}

export async function sendForReview(
  articleId: string,
): Promise<{ ok: boolean; error?: string }> {
  const result = await submitArticle(articleId);
  if (result.ok) refresh(articleId);
  return result;
}
