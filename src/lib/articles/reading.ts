/**
 * O'QISH OYNASI — SOF QOIDALAR.
 *
 * Mundarija, sarlavha langarlari va bosh harf (drop cap) qoidasi bitta
 * joyda: sahifa (mundarija ro'yxati) va matn chizuvchi
 * (`RichArticleBody`, sarlavha `id` si) AYNI SHU funksiyalardan
 * foydalanadi. Ikki joyda alohida yozilsa, mundarijadagi havola
 * sarlavhaga yetib bormay qolardi.
 *
 * Faqat `type` import qilinadi — u o'chib ketadi, ya'ni testlar `@/`
 * taxallusiga muhtoj emas.
 */
import type { RichBlock } from "./rich-text";

export interface OutlineItem {
  id: string;
  text: string;
  level: 2 | 3;
}

/* ========================================================================= *
 * SARLAVHA LANGARLARI
 * ========================================================================= */

/** O'zbek lotin harflari uchun soddalashtirilgan manzil bo'lagi. */
export function slugifyHeading(text: string): string {
  const slug = text
    .toLowerCase()
    // O‘ g‘ va apostroflar — so'z ichida, ajratuvchi emas.
    .replace(/[‘’ʻʼ'`]/g, "")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9Ѐ-ӿ]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
  return slug || "bolim";
}

/**
 * Har sarlavhaga barqaror va YAGONA `id`.
 *
 * Bir xil nomli ikki sarlavha ("Xulosa", "Xulosa") ikkinchisiga `-2`
 * oladi — aks holda mundarijadagi ikkinchi havola birinchisiga olib
 * borardi. Kalit — blokning tartib raqami.
 */
export function headingIds(blocks: readonly RichBlock[]): Map<number, string> {
  const ids = new Map<number, string>();
  const used = new Map<string, number>();

  blocks.forEach((block, index) => {
    if (block.type !== "heading") return;
    const base = slugifyHeading(block.children.map((child) => child.text).join(""));
    const count = (used.get(base) ?? 0) + 1;
    used.set(base, count);
    ids.set(index, count === 1 ? base : `${base}-${count}`);
  });

  return ids;
}

/**
 * Mundarija.
 *
 * KAMIDA IKKI sarlavha bo'lsa — bitta bandli mundarija joy egallaydi,
 * lekin hech qayerga olib bormaydi.
 */
export function articleOutline(blocks: readonly RichBlock[]): OutlineItem[] {
  const ids = headingIds(blocks);
  const items: OutlineItem[] = [];

  blocks.forEach((block, index) => {
    if (block.type !== "heading") return;
    const text = block.children.map((child) => child.text).join("").trim();
    const id = ids.get(index);
    if (text && id) items.push({ id, text, level: block.level });
  });

  return items.length >= 2 ? items : [];
}

/* ========================================================================= *
 * BOSH HARF
 * ========================================================================= */

/** Bosh harf faqat shu uzunlikdan uzun birinchi abzatsda. */
export const DROP_CAP_MIN_LENGTH = 160;

/**
 * Birinchi abzatsda katta bosh harf bo'lsinmi.
 *
 * Qisqa abzatsda bosh harf uch qator balandlikda yolg'iz qolib, matn
 * "singan" ko'rinadi. Shuning uchun faqat matn birinchi abzats bilan
 * boshlansa va u yetarlicha uzun bo'lsa.
 */
export function shouldDropCap(blocks: readonly RichBlock[]): boolean {
  const first = blocks[0];
  if (!first || first.type !== "paragraph") return false;
  const text = first.children.map((child) => child.text).join("").trim();
  // Raqam yoki tirnoq bilan boshlansa — bosh harf ma'nosiz.
  return text.length >= DROP_CAP_MIN_LENGTH && /^\p{L}/u.test(text);
}

/** Oddiy matn (belgisiz) uchun xuddi shu qoida — tahririyat maqolalarida. */
export function shouldDropCapText(firstParagraph: string | null | undefined): boolean {
  const text = (firstParagraph ?? "").trim();
  return text.length >= DROP_CAP_MIN_LENGTH && /^\p{L}/u.test(text);
}
