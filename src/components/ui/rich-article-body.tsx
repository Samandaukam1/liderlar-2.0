import { Fragment } from "react";
import { cn } from "@/lib/utils";
import { parseRichText, type RichBlock, type RichInline } from "@/lib/articles/rich-text";
import { headingIds, shouldDropCap } from "@/lib/articles/reading";
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
 *
 * O'LCHAMLAR `em` DA: sarlavha, iqtibos va oraliqlar matn o'lchamiga
 * nisbatan. O'qish oynasida o'quvchi matnni kattalashtirsa, butun
 * tuzilma mutanosib o'sadi.
 */
export function RichArticleBody({
  content,
  className,
  dropCap = false,
  lead = false,
}: {
  content?: string | null;
  className?: string;
  /** Birinchi abzatsda katta bosh harf — faqat abzats yetarlicha uzun bo'lsa. */
  dropCap?: boolean;
  /** Birinchi abzats kirish matni sifatida biroz yirikroq. */
  lead?: boolean;
}) {
  const blocks = parseRichText(content);
  if (blocks.length === 0) return null;

  const ids = headingIds(blocks);
  const withDropCap = dropCap && shouldDropCap(blocks);

  return (
    <div className={cn(ARTICLE_BODY_CLASS, className)} lang="uz">
      {blocks.map((block, index) => (
        <Block
          key={index}
          block={block}
          id={ids.get(index)}
          first={index === 0}
          dropCap={withDropCap && index === 0}
          lead={lead && index === 0 && block.type === "paragraph"}
        />
      ))}
    </div>
  );
}

function Block({
  block,
  id,
  first,
  dropCap,
  lead,
}: {
  block: RichBlock;
  id: string | undefined;
  first: boolean;
  dropCap: boolean;
  lead: boolean;
}) {
  const gap = first ? undefined : "mt-[1.15em]";

  switch (block.type) {
    case "heading":
      /*
       * `id` — mundarija havolasi shu yerga olib keladi; `scroll-mt`
       * yopishqoq sayt sarlavhasi ostida qolmasligi uchun.
       */
      return block.level === 2 ? (
        <h2
          id={id}
          className={cn(
            "scroll-mt-28 font-display text-[1.55em] font-bold leading-[1.2] text-navy text-balance",
            !first && "mt-[1.9em]",
          )}
        >
          <Inline nodes={block.children} />
        </h2>
      ) : (
        <h3
          id={id}
          className={cn(
            "scroll-mt-28 font-display text-[1.28em] font-bold leading-[1.25] text-navy text-balance",
            !first && "mt-[1.6em]",
          )}
        >
          <Inline nodes={block.children} />
        </h3>
      );

    case "quote":
      /*
       * IQTIBOS — "PULL QUOTE" USLUBIDA.
       *
       * Matndan ajralib turadi: yirik serif, chap tomonda rangli
       * chiziq va bezak qo'shtirnoq. Qo'shtirnoq `aria-hidden` —
       * ekran o'quvchisi `<blockquote>` ning o'zini iqtibos deb biladi.
       */
      return (
        <blockquote
          className={cn(
            "relative my-[1.6em] whitespace-pre-line border-l-[3px] border-liderlar-blue py-[0.2em] pl-[1.15em] pr-[0.4em] font-display text-[1.32em] italic leading-[1.45] text-navy",
            first && "mt-0",
          )}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute -left-[0.1em] -top-[0.55em] select-none font-display text-[2.6em] leading-none text-liderlar-blue/20"
          >
            &ldquo;
          </span>
          <Inline nodes={block.children} />
        </blockquote>
      );

    case "list":
      return (
        <ul className={cn("space-y-[0.5em] pl-[1.4em]", gap)}>
          {block.items.map((item, index) => (
            <li
              key={index}
              className="relative break-words pl-[0.35em] before:absolute before:-left-[0.95em] before:top-[0.72em] before:h-[0.4em] before:w-[0.4em] before:rounded-full before:bg-liderlar-blue before:content-['']"
            >
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
            lead && "text-[1.08em] leading-[1.75] text-navy",
            dropCap &&
              "first-letter:float-left first-letter:mr-[0.12em] first-letter:mt-[0.08em] first-letter:font-display first-letter:text-[3.6em] first-letter:font-bold first-letter:leading-[0.8] first-letter:text-navy",
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
              className="font-medium text-electric-blue underline decoration-liderlar-blue/40 decoration-[0.08em] underline-offset-[0.2em] transition-colors hover:text-liderlar-blue hover:decoration-liderlar-blue"
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
