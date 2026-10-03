import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { recordAudit } from "@/lib/vip/audit-log";
import { requireEntitlement } from "@/lib/vip/entitlement-service";
import { resolveOwnCandidate } from "@/lib/profile-editor/edit-service";
import {
  authorCanEdit,
  authorCanSubmit,
  checkSubmittable,
  SUBMIT_PROBLEM_TEXT,
  TITLE_MAX_LENGTH,
  type ArticleState,
} from "./state";

/**
 * MAQOLA — MUALLIF TOMONI.
 *
 * MAZMUN ODDIY MATN SIFATIDA SAQLANADI va ommaviy sahifada
 * `ArticleBody` orqali abzatslarga ajratib ko'rsatiladi. U
 * `dangerouslySetInnerHTML` ishlatmaydi, ya'ni React matnni o'zi
 * ekranlaydi.
 *
 * SHUNING UCHUN HTML TOZALAGICH KERAK EMAS (§58): HTML hech qachon
 * ko'rsatilmaydi, demak saqlangan XSS imkonsiz. Boy matn muharriri
 * qo'shilsa, bu xususiyat yo'qoladi va tozalagich SHART bo'ladi —
 * shuni shu yerda yozib qo'yaman.
 */

export interface ArticleListRow {
  id: string;
  title: string;
  state: ArticleState;
  heroUrl: string | null;
  slug: string | null;
  reviewNote: string | null;
  updatedAt: string;
  publishedAt: string | null;
}

export interface ArticleDetail extends ArticleListRow {
  subtitle: string | null;
  excerpt: string | null;
  content: string;
  heroAlt: string | null;
}

export type ArticleResult<T = undefined> =
  | ({ ok: true } & (T extends undefined ? Record<string, never> : T))
  | { ok: false; error: string };

/* ========================================================================= *
 * O'QISH
 * ========================================================================= */

export async function loadOwnArticles(candidateId: string): Promise<ArticleListRow[]> {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("member_articles")
    .select("id, title, state, hero_url, slug, review_note, updated_at, published_at")
    .eq("candidate_id", candidateId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("[maqola] ro'yxat o'qilmadi:", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id as string,
    title: (row.title as string) ?? "",
    state: row.state as ArticleState,
    heroUrl: (row.hero_url as string | null) ?? null,
    slug: (row.slug as string | null) ?? null,
    reviewNote: (row.review_note as string | null) ?? null,
    updatedAt: row.updated_at as string,
    publishedAt: (row.published_at as string | null) ?? null,
  }));
}

/**
 * Bitta maqolani o'qiydi — EGALIK tekshiruvi bilan.
 *
 * `articleId` brauzerdan keladi, shuning uchun `candidate_id` sharti
 * so'rovning o'zida: tekshiruvni keyin qilish boshqa odamning
 * qoralamasini o'qishga yo'l ochardi (§44).
 */
export async function loadOwnArticle(
  articleId: string,
  candidateId: string,
): Promise<ArticleDetail | null> {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("member_articles")
    .select(
      "id, title, subtitle, excerpt, content, hero_url, hero_alt, state, slug, review_note, updated_at, published_at",
    )
    .eq("id", articleId)
    .eq("candidate_id", candidateId)
    .maybeSingle();

  if (error) {
    console.error("[maqola] o'qilmadi:", error.message);
    return null;
  }
  if (!data) return null;

  return {
    id: data.id as string,
    title: (data.title as string) ?? "",
    subtitle: (data.subtitle as string | null) ?? null,
    excerpt: (data.excerpt as string | null) ?? null,
    content: (data.content as string) ?? "",
    heroUrl: (data.hero_url as string | null) ?? null,
    heroAlt: (data.hero_alt as string | null) ?? null,
    state: data.state as ArticleState,
    slug: (data.slug as string | null) ?? null,
    reviewNote: (data.review_note as string | null) ?? null,
    updatedAt: data.updated_at as string,
    publishedAt: (data.published_at as string | null) ?? null,
  };
}

/* ========================================================================= *
 * YARATISH
 * ========================================================================= */

export async function createArticle(
  title: string,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const entitled = await requireEntitlement("articles.create");
  if (!entitled.ok) return { ok: false, error: entitled.error };

  const resolved = await resolveOwnCandidate();
  if (!resolved.ok) return { ok: false, error: resolved.error };

  const clean = title.trim().slice(0, TITLE_MAX_LENGTH);
  /*
   * YARATISHDA SARLAVHA 5 BELGIDAN QISQA BO'LISHI MUMKIN EMAS,
   * chunki bazada `check (char_length(title) between 5 and 300)`.
   *
   * Shuni shu yerda aytamiz: bazadan kelgan xato foydalanuvchiga
   * ko'rsatilmaydi (§55).
   */
  if (clean.length < 5) {
    return { ok: false, error: "Sarlavha kamida 5 belgidan bo'lsin." };
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("member_articles")
    .insert({
      candidate_id: resolved.owned.candidateId,
      submitted_by: resolved.owned.profileId,
      title: clean,
      /*
       * `state` QO'LDA YOZILMAYDI — bazadagi default `draft`.
       *
       * Brauzerdan qabul qilinsa, muallif o'z maqolasini darhol
       * `published` qilib yuborardi (§27, §43).
       */
    })
    .select("id")
    .single();

  if (error) {
    console.error("[maqola] yaratilmadi:", error.message);
    return { ok: false, error: "Maqolani yaratib bo'lmadi." };
  }

  return { ok: true, id: data.id as string };
}

/* ========================================================================= *
 * SAQLASH
 * ========================================================================= */

export interface ArticleDraftInput {
  title?: unknown;
  subtitle?: unknown;
  excerpt?: unknown;
  content?: unknown;
  heroAlt?: unknown;
}

function text(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed.slice(0, max);
}

/**
 * Qoralamani saqlaydi.
 *
 * `autosave` — revizyani avtosaqlash deb belgilaydi. Tarixda ular
 * yashiriladi: har 30 soniyada bir yozuv tushsa, haqiqiy versiyalar
 * ular orasida ko'rinmay qolardi.
 */
export async function saveArticle(
  articleId: string,
  input: ArticleDraftInput,
  autosave = false,
): Promise<{ ok: boolean; error?: string }> {
  const entitled = await requireEntitlement("articles.create");
  if (!entitled.ok) return { ok: false, error: entitled.error };

  const resolved = await resolveOwnCandidate();
  if (!resolved.ok) return { ok: false, error: resolved.error };

  const existing = await loadOwnArticle(articleId, resolved.owned.candidateId);
  if (!existing) return { ok: false, error: "Maqola topilmadi." };

  /*
   * HOLAT TEKSHIRUVI — ENG MUHIM QISM.
   *
   * Ko'rilayotgan yoki nashr qilingan maqolani saqlashga ruxsat
   * berilsa, muharrir o'qiyotgan matn ostidan o'zgarardi yoki
   * o'quvchi ko'rgan matn jimgina boshqasiga aylanardi.
   */
  if (!authorCanEdit(existing.state)) {
    return {
      ok: false,
      error:
        existing.state === "in_review" || existing.state === "submitted"
          ? "Maqola tahririyatda — hozir tahrirlab bo'lmaydi."
          : "Bu maqolani tahrirlab bo'lmaydi.",
    };
  }

  const title = text(input.title, TITLE_MAX_LENGTH);
  if (title === null || title.length < 5) {
    return { ok: false, error: "Sarlavha kamida 5 belgidan bo'lsin." };
  }

  const admin = createAdminClient();

  const patch = {
    title,
    subtitle: text(input.subtitle, 500),
    excerpt: text(input.excerpt, 600),
    /*
     * MAZMUN TRIM QILINMAYDI, faqat chegaralanadi.
     *
     * Abzatslar orasidagi bo'sh qatorlar MA'NOLI — `ArticleBody`
     * ularga qarab abzatsga ajratadi. Trim ularni yo'q qilardi.
     */
    content: typeof input.content === "string" ? input.content.slice(0, 200_000) : "",
    hero_alt: text(input.heroAlt, 300),
  };

  const { error } = await admin
    .from("member_articles")
    .update(patch)
    .eq("id", articleId)
    // Egalik va holat sharti yozishda ham qaytariladi.
    .eq("candidate_id", resolved.owned.candidateId)
    .eq("state", existing.state);

  if (error) {
    console.error("[maqola] saqlanmadi:", error.message);
    return { ok: false, error: "Maqolani saqlab bo'lmadi." };
  }

  await writeRevision(articleId, patch, resolved.owned.profileId, autosave);
  return { ok: true };
}

/**
 * Revizya yozadi.
 *
 * XATO ASOSIY SAQLASHNI YIQITMAYDI: matn allaqachon saqlangan va
 * revizya tarix uchun. Uni majburiy qilsak, tarix jadvalidagi
 * nosozlik odamning yozganini saqlanmay qoldirardi.
 */
async function writeRevision(
  articleId: string,
  patch: { title: string; subtitle: string | null; excerpt: string | null; content: string },
  authorId: string,
  autosave: boolean,
): Promise<void> {
  const admin = createAdminClient();

  const { data: last } = await admin
    .from("member_article_revisions")
    .select("revision")
    .eq("article_id", articleId)
    .order("revision", { ascending: false })
    .limit(1)
    .maybeSingle();

  const revision = ((last?.revision as number | undefined) ?? 0) + 1;

  const { error } = await admin.from("member_article_revisions").insert({
    article_id: articleId,
    revision,
    title: patch.title,
    subtitle: patch.subtitle,
    excerpt: patch.excerpt,
    content: patch.content,
    is_autosave: autosave,
    created_by: authorId,
  });

  if (error) {
    /*
     * 23505 — poyga: ikki saqlash bir vaqtda bir xil raqamni oldi.
     * Bu xato emas; ikkinchisining matni asosiy jadvalda bor.
     */
    if (error.code !== "23505") {
      console.error("[maqola] revizya yozilmadi:", error.message);
    }
  }
}

/* ========================================================================= *
 * BANNER RASMI
 * ========================================================================= */

/**
 * Banner rasmini bog'laydi.
 *
 * Rasm mavjud yuklash quvuri orqali o'tadi (`gallery` turi) — u yerda
 * tur, hajm, o'lcham va egalik tekshiriladi.
 */
export async function setArticleHero(
  articleId: string,
  heroUrl: string,
): Promise<{ ok: boolean; error?: string }> {
  const entitled = await requireEntitlement("articles.create");
  if (!entitled.ok) return { ok: false, error: entitled.error };

  const resolved = await resolveOwnCandidate();
  if (!resolved.ok) return { ok: false, error: resolved.error };

  /*
   * MANZIL O'Z SAQLASH JOYIMIZDAN BO'LISHI SHART.
   *
   * Tashqi manzil qabul qilinsa, Liderlar Online bosh sahifasiga
   * istalgan saytdagi rasm qo'yilardi — u keyin o'zgartirilishi
   * yoki yo'qolishi mumkin.
   */
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co\/storage\/v1\/object\/public\//.test(heroUrl)) {
    return { ok: false, error: "Banner rasmi noto'g'ri." };
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("member_articles")
    .update({ hero_url: heroUrl })
    .eq("id", articleId)
    .eq("candidate_id", resolved.owned.candidateId)
    /*
     * FAQAT TAHRIRLANADIGAN HOLATDA.
     *
     * Bazadagi trigger bannersiz nashrni to'sadi, lekin nashr
     * qilingan maqolaning bannerini ALMASHTIRISH ham mumkin
     * bo'lmasligi kerak: o'quvchi ko'rgan kartochka jimgina
     * o'zgarardi.
     */
    .in("state", ["draft", "changes_requested", "rejected"])
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("[maqola] banner saqlanmadi:", error.message);
    return { ok: false, error: "Bannerni saqlab bo'lmadi." };
  }
  if (!data) {
    return { ok: false, error: "Maqola topilmadi yoki hozir tahrirlanmaydi." };
  }

  return { ok: true };
}

/* ========================================================================= *
 * YUBORISH
 * ========================================================================= */

export async function submitArticle(
  articleId: string,
): Promise<{ ok: boolean; error?: string }> {
  const entitled = await requireEntitlement("articles.submit");
  if (!entitled.ok) return { ok: false, error: entitled.error };

  const resolved = await resolveOwnCandidate();
  if (!resolved.ok) return { ok: false, error: resolved.error };

  const article = await loadOwnArticle(articleId, resolved.owned.candidateId);
  if (!article) return { ok: false, error: "Maqola topilmadi." };

  if (!authorCanSubmit(article.state)) {
    return { ok: false, error: "Bu maqola allaqachon yuborilgan." };
  }

  const check = checkSubmittable({
    title: article.title,
    content: article.content,
    heroUrl: article.heroUrl,
  });

  if (!check.ok) {
    /*
     * HAMMA MUAMMO BIRDAN AYTILADI.
     *
     * Birinchisini aytsak, odam uchta xatoni ketma-ket tuzatib,
     * uch marta yuborishga urinardi.
     */
    return {
      ok: false,
      error: check.problems.map((problem) => SUBMIT_PROBLEM_TEXT[problem]).join(" "),
    };
  }

  const admin = createAdminClient();
  const { data: submitted, error } = await admin
    .from("member_articles")
    .update({
      state: "submitted",
      submitted_at: new Date().toISOString(),
      /*
       * OLDINGI TAHRIRIYAT IZOHI TOZALANADI.
       *
       * Qolsa, muallif tuzatib yuborgandan keyin ham "tuzatish
       * kerak" degan eski xabar ko'rinib turardi.
       */
      review_note: null,
    })
    .eq("id", articleId)
    .eq("candidate_id", resolved.owned.candidateId)
    .eq("state", article.state)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("[maqola] yuborilmadi:", error.message);
    return { ok: false, error: "Yuborib bo'lmadi." };
  }

  /*
   * HECH NARSA YANGILANMADI — maqola holati shu orada o'zgargan
   * (masalan ikkinchi oynada allaqachon yuborilgan). Avval bu ham
   * "yuborildi" deb qaytardi.
   */
  if (!submitted) {
    return { ok: false, error: "Maqola holati o'zgargan. Sahifani yangilang." };
  }

  await recordAudit("article.submitted", {
    actorId: resolved.owned.profileId,
    entityId: articleId,
    before: { state: article.state },
    after: { state: "submitted" },
    metadata: { candidate_id: resolved.owned.candidateId, title: article.title },
  });

  return { ok: true };
}
