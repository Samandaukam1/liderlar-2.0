import { Fragment } from "react";
import { cn } from "@/lib/utils";
import { parseRichText, type RichBlock, type RichInline } from "@/lib/articles/rich-text";
import { ARTICLE_BODY_CLASS } from "@/components/ui/article-body";

/**
 * BELGILANGAN MAQOLA MATNI — A'ZO MAQOLALARI UCHUN.
 *
 * Matn `rich-text.ts` da tahlil qilinadi va shu yerda React
 * elementlariga aylanadi. `dangerouslySetInnerHTML` YO'Q: a'zo yozgan
 * matn hech qachon HTML sifatida talqin qilinmaydi (§58), havola esa
 * tahlilchida `https://` ekani tekshirilgan.
 *
 * NEGA `ArticleBody` O'ZGARTIRILMADI: u tahririyat biografiyalarini
 * ham chizadi (1594 profil). Ularda "*" belgisi oddiy matn bo'lishi
 * mumkin va birdan kursivga aylanib qolardi. Belgilash faqat yangi
 * muharrirda yoziladigan matnga tegishli.
 */
export function RichArticleBody({
  content,
  className,
  dropCap = false,
}: {
  content?: string | null;
  className?: string;
  dropCap?: boolean;
}) {
  const blocks = parseRichText(content);
  if (blocks.length === 0) return null;

  const firstParagraph = blocks.findIndex((block) => block.type === "paragraph");

  return (
    <div className={cn(ARTICLE_BODY_CLASS, className)} lang="uz">
      {blocks.map((block, index) => (
        <Block
          key={index}
          block={block}
          first={index === 0}
          dropCap={dropCap && index === firstParagraph && index === 0}
        />
      ))}
    </div>
  );
}

function Block({ block, first, dropCap }: { block: RichBlock; first: boolean; dropCap: boolean }) {
  const gap = first ? undefined : "mt-5 sm:mt-6";

  switch (block.type) {
    case "heading":
      return block.level === 2 ? (
        <h2 className={cn("font-display text-[1.35rem] font-bold leading-snug text-navy sm:text-[1.5rem]", !first && "mt-9")}>
          <Inline nodes={block.children} />
        </h2>
      ) : (
        <h3 className={cn("font-display text-[1.15rem] font-bold leading-snug text-navy sm:text-[1.25rem]", !first && "mt-7")}>
          <Inline nodes={block.children} />
        </h3>
      );

    case "quote":
      return (
        <blockquote
          className={cn(
            "whitespace-pre-line border-l-4 border-liderlar-blue/60 bg-ice/40 py-3 pl-5 pr-4 font-display text-[1.12rem] italic leading-[1.7] text-navy sm:text-[1.2rem]",
            gap,
          )}
        >
          <Inline nodes={block.children} />
        </blockquote>
      );

    case "list":
      return (
        <ul className={cn("list-disc space-y-2 pl-6 marker:text-liderlar-blue", gap)}>
          {block.items.map((item, index) => (
            <li key={index} className="break-words pl-1">
              <Inline nodes={item} />
            </li>
          ))}
        </ul>
      );

    case "paragraph":
      return (
        <p
          className={cn(
            "break-words",
            gap,
            dropCap &&
              "first-letter:float-left first-letter:mr-2.5 first-letter:mt-1 first-letter:font-display first-letter:text-[3.4rem] first-letter:font-bold first-letter:leading-[0.82] first-letter:text-navy sm:first-letter:text-[4rem]",
          )}
        >
          <Inline nodes={block.children} />
        </p>
      );
  }
}

function Inline({ nodes }: { nodes: readonly RichInline[] }) {
  return (
    <>
      {nodes.map((node, index) => {
        let element: React.ReactNode = node.text;
        if (node.italic) element = <em>{element}</em>;
        if (node.bold) element = <strong className="font-semibold text-navy">{element}</strong>;
        if (node.href) {
          element = (
            /*
             * TASHQI HAVOLA — yangi oynada.
             *
             * `nofollow ugc`: a'zo yozgan havola — qidiruv tizimiga
             * platforma uni tavsiya qilyapti degan signal bermaymiz.
             * `noopener noreferrer`: ochilgan sahifa bizning oynaga
             * tegolmaydi va manzilimizni ko'rmaydi.
             */
            <a
              href={node.href}
              target="_blank"
              rel="noopener noreferrer nofollow ugc"
              className="font-medium text-liderlar-blue underline decoration-liderlar-blue/40 underline-offset-2 hover:decoration-liderlar-blue"
            >
              {element}
            </a>
          );
        }
        return <Fragment key={index}>{element}</Fragment>;
      })}
    </>
  );
}
