import { cn } from "@/lib/utils";

/**
 * Liderlar 1.0 maqolasining tanasi — 2.0 tipografiyasida.
 *
 * NEGA `ArticleBody` EMAS. `ArticleBody` oddiy matnni abzatslarga bo'ladi;
 * legacy maqolada esa sarlavhalar, ro'yxatlar, qalin matn va iqtiboslar bor —
 * ular matn sifatida render qilinsa maqola tuzilishini butunlay yo'qotardi.
 *
 * NEGA HTML XAVFSIZ. Bu yerdagi HTML brauzerdan ham, CSV'dan ham to'g'ridan
 * kelmaydi: u import paytida `sanitizeLegacyHtml` ning qat'iy oq ro'yxatidan
 * o'tib, `legacy_posts.content_html` ga yozilgan. `script`, `iframe`, `style`,
 * `on*` va `javascript:` — hech biri o'sha bosqichdan o'ta olmaydi, class va
 * inline style ham tashlanadi. Shuning uchun eski saytning ko'rinishi bu yerga
 * ko'chib o'tmaydi: butun uslub quyidagi sinflardan keladi.
 */
export function LegacyArticleBody({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  if (!html.trim()) return null;

  return (
    <div
      lang="uz"
      className={cn(
        "mx-auto max-w-[38rem] text-[1.06rem] leading-[1.85] text-ink [hyphens:auto] [text-wrap:pretty] sm:text-[1.1rem] sm:leading-[1.9]",
        // Abzatslar
        "[&_p]:break-words [&_p+p]:mt-5 sm:[&_p+p]:mt-6",
        // Sarlavhalar — 2.0 display shrifti
        "[&_h2]:mt-9 [&_h2]:font-display [&_h2]:text-[1.5rem] [&_h2]:font-bold [&_h2]:leading-[1.25] [&_h2]:text-navy sm:[&_h2]:text-[1.7rem]",
        "[&_h3]:mt-8 [&_h3]:font-display [&_h3]:text-[1.25rem] [&_h3]:font-semibold [&_h3]:leading-[1.3] [&_h3]:text-navy sm:[&_h3]:text-[1.35rem]",
        "[&_h4]:mt-7 [&_h4]:font-semibold [&_h4]:leading-[1.45] [&_h4]:text-navy",
        "[&_:is(h2,h3,h4):first-child]:mt-0",
        // Ro'yxatlar
        "[&_ul]:mt-5 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mt-5 [&_ol]:list-decimal [&_ol]:pl-5",
        "[&_li]:mt-2 [&_li]:pl-1 [&_li]:marker:text-liderlar-blue",
        // Ta'kid
        "[&_strong]:font-semibold [&_strong]:text-navy [&_b]:font-semibold [&_b]:text-navy",
        // Iqtibos
        "[&_blockquote]:mt-6 [&_blockquote]:border-l-2 [&_blockquote]:border-liderlar-blue [&_blockquote]:pl-4 [&_blockquote]:text-navy [&_blockquote]:italic",
        // Havolalar
        "[&_a]:font-medium [&_a]:text-liderlar-blue [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:no-underline [&_a]:break-words",
        // Matn ichidagi rasmlar
        "[&_img]:mt-6 [&_img]:h-auto [&_img]:w-full [&_img]:rounded-xl",
        "[&_hr]:my-8 [&_hr]:border-brand-soft",
        className
      )}
      // Kontent import bosqichida sanitizatsiya qilingan — yuqoridagi izohga qarang.
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/** ~180 so'z/daqiqa. `content_text` teglarsiz, shuning uchun hisob to'g'ri chiqadi. */
export function legacyReadingMinutes(text: string | null | undefined): number {
  const words = text?.trim().split(/\s+/).filter(Boolean).length ?? 0;
  return Math.max(1, Math.round(words / 180));
}
