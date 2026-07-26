import { cn } from "@/lib/utils";

/** Splits raw article text into clean paragraphs (blank line = new paragraph). */
export function toParagraphs(content?: string | null): string[] {
  if (!content) return [];
  return content
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .flatMap((block) => block.split("\n"))
    .map((p) => p.trim())
    .filter(Boolean);
}

/** ~180 so'z/daqiqa o'qish tezligi bo'yicha taxminiy vaqt. */
export function readingMinutes(content?: string | null) {
  const words = content?.trim().split(/\s+/).filter(Boolean).length ?? 0;
  return Math.max(1, Math.round(words / 180));
}

/**
 * Mobil o'qish uchun moslangan maqola matni: qulay o'lchamdagi satr uzunligi,
 * bo'g'inlarga bo'lish va abzatslar orasidagi nafas oladigan bo'shliq.
 */
export function ArticleBody({
  content,
  className,
  dropCap = false,
  lead = false,
}: {
  content?: string | null;
  className?: string;
  /** Birinchi harfni yirik bosh harf sifatida ko'rsatish (jurnal uslubi). */
  dropCap?: boolean;
  /** Birinchi abzatsni kirish matni sifatida yiriklashtirish. */
  lead?: boolean;
}) {
  const paragraphs = toParagraphs(content);
  if (paragraphs.length === 0) return null;

  return (
    <div
      className={cn(
        "mx-auto max-w-[38rem] text-[1.06rem] leading-[1.85] text-ink [hyphens:auto] [text-wrap:pretty] sm:text-[1.1rem] sm:leading-[1.9]",
        className
      )}
      lang="uz"
    >
      {paragraphs.map((paragraph, idx) => (
        <p
          key={idx}
          className={cn(
            "break-words",
            idx > 0 && "mt-5 sm:mt-6",
            idx === 0 && lead && "text-[1.14rem] leading-[1.8] text-navy sm:text-[1.2rem]",
            idx === 0 &&
              dropCap &&
              "first-letter:float-left first-letter:mr-2.5 first-letter:mt-1 first-letter:font-display first-letter:text-[3.4rem] first-letter:font-bold first-letter:leading-[0.82] first-letter:text-navy sm:first-letter:text-[4rem]"
          )}
        >
          {paragraph}
        </p>
      ))}
    </div>
  );
}
