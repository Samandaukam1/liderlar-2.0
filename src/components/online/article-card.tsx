import Image from "next/image";
import Link from "next/link";
import { formatDateUz } from "@/lib/utils";
import type { OnlineCard } from "@/lib/data/liderlar-online";

/**
 * MAQOLA KARTOCHKASI — RASMGA YO'NALTIRILGAN (§30).
 *
 * MUHIM: BUTUN KARTOCHKA BITTA HAVOLA.
 *
 * §30 rasm bosilganda maqola ochilishini talab qiladi va sarlavha
 * ham bosiladigan bo'lishi kerak. Ikkita alohida `<a>` qo'yish
 * ekran o'quvchisiga bitta maqolani ikki marta o'qib berardi va
 * klaviatura bilan yurishda ortiqcha to'xtash qo'shardi.
 *
 * Shuning uchun bitta `<Link>` butun kartochkani o'raydi — rasm ham,
 * sarlavha ham ichida. Natijada §30 ning ikki talabi ham bajariladi
 * va "kartochkani tugmalar bilan to'ldirmaslik" talabi ham.
 */
export function ArticleCard({
  article,
  priority = false,
}: {
  article: OnlineCard;
  /** Bosh sahifadagi birinchi kartochka uchun — LCP ni tezlashtiradi. */
  priority?: boolean;
}) {
  return (
    <article>
      <Link href={`/liderlar-online/${article.slug}`} className="group block">
        {/*
          16:9 — §24 dagi ro'yxat nisbati. Muharrirdagi ko'rinish ham
          shu nisbatda, ya'ni muallif rasm qanday kesilishini
          oldindan ko'rgan.
        */}
        <span className="relative block aspect-video overflow-hidden rounded-lg bg-paper">
          <Image
            src={article.heroUrl}
            alt={article.heroAlt ?? ""}
            fill
            /*
             * `sizes` ANIQ: busiz optimizator eng katta variantni
             * tanlardi va kartochka uchun ortiqcha katta fayl
             * yuklanardi (§7 egress).
             */
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={priority}
            loading={priority ? undefined : "lazy"}
            className="object-cover transition duration-300 group-hover:scale-[1.02]"
          />
        </span>

        <h3 className="mt-3 font-display text-lg font-bold leading-snug text-navy text-balance group-hover:text-liderlar-blue">
          {article.title}
        </h3>

        {article.subtitle && (
          <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{article.subtitle}</p>
        )}

        <p className="mt-2 text-xs text-ink-soft">
          {article.author.name} · {formatDateUz(article.publishedAt)}
        </p>
      </Link>
    </article>
  );
}
