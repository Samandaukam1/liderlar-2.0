import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Scale } from "lucide-react";
import { DocumentHero } from "@/components/legal/document-hero";
import { LegalDocuments } from "@/components/legal/legal-documents";
import { SITE_NAME } from "@/lib/constants";
import { getLegalPage } from "@/lib/data/legal";
import { LAW_LINKS, LEGAL_ENTITY } from "@/lib/legal/company";
import {
  OFFER_LAW_QUOTES,
  OFFER_PREAMBLE,
  OFFER_REVISION_AT,
  OFFER_SECTIONS,
  OFFER_SUBTITLE,
  OFFER_SUMMARY,
  OFFER_TITLE,
  type OfferClause,
} from "@/lib/legal/offer";
import { formatDateUz } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Ommaviy oferta",
  description: `${SITE_NAME} platformasida biografik maqola joylashtirish bo‘yicha ommaviy oferta shartnomasi. Ijrochi: “MUKAMMAL MEDIA GROUP” MCHJ.`,
  alternates: { canonical: "/ommaviy_ofertasi" },
};

const REQUISITES_ID = "rekvizitlar";
const CONTENTS = [
  ...OFFER_SECTIONS.map((section, index) => ({ id: section.id, label: `${index + 1}. ${section.title}` })),
  { id: REQUISITES_ID, label: `${OFFER_SECTIONS.length + 1}. Tashkilot rekvizitlari` },
];

function Contents() {
  return (
    <ol className="space-y-0.5 text-sm">
      {CONTENTS.map((entry) => (
        <li key={entry.id}>
          <a
            href={`#${entry.id}`}
            className="block rounded-md px-2 py-1.5 leading-snug text-ink-soft transition-colors hover:bg-liderlar-blue/8 hover:text-navy"
          >
            {entry.label}
          </a>
        </li>
      ))}
    </ol>
  );
}

function Clause({ number, clause }: { number: string; clause: OfferClause }) {
  const ListTag = clause.ordered ? "ol" : "ul";
  return (
    <li className="grid grid-cols-[2.6rem_minmax(0,1fr)] gap-x-2 sm:grid-cols-[3.25rem_minmax(0,1fr)]">
      <span className="pt-[0.2rem] text-sm font-semibold tabular-nums text-electric-blue">{number}</span>
      <div className="min-w-0">
        <p>{clause.text}</p>

        {clause.items && (
          <ListTag
            className={
              clause.ordered
                ? "mt-3 list-decimal gap-x-10 space-y-1.5 pl-5 marker:text-ink-soft sm:columns-2 [&>li]:break-inside-avoid"
                : "mt-3 list-disc space-y-1.5 pl-5 marker:text-liderlar-blue"
            }
          >
            {clause.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ListTag>
        )}

        {clause.details && (
          <dl className="mt-3 grid gap-px overflow-hidden rounded-md border border-border-soft bg-border-soft sm:grid-cols-2">
            {clause.details.map((detail) => (
              <div key={detail.label} className="bg-white px-4 py-3">
                <dt className="text-xs text-ink-soft">{detail.label}</dt>
                <dd className="mt-0.5 font-semibold tabular-nums text-navy">{detail.value}</dd>
              </div>
            ))}
          </dl>
        )}

        {clause.note && <p className="mt-3">{clause.note}</p>}

        {clause.link && (
          <Link
            href={clause.link.href}
            className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-electric-blue hover:text-navy"
          >
            {clause.link.label}
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        )}
      </div>
    </li>
  );
}

export default async function PublicOfferPage() {
  /*
   * ADMIN MATNI FAQAT SHU TAHRIRDAN YANGIROQ BO'LSA USTUN.
   *
   * Prod'da `legal_pages.oferta` da 2026-09-05 dagi eski matn turibdi. Avvalgi
   * "bazada matn bo'lsa, o'shani ko'rsat" qoidasi shu kod tahririni butunlay
   * yashirardi. Sanani solishtirish ikkalasini saqlaydi: yangi tahrir ko'rinadi
   * va admin paneldan keyin saqlangan matn baribir kuchga kiradi.
   */
  const stored = await getLegalPage("oferta").catch(() => null);
  const adminText =
    stored &&
    stored.content.length > 100 &&
    !stored.content.includes("admin panel orqali") &&
    Date.parse(stored.updated_at) > Date.parse(OFFER_REVISION_AT)
      ? stored
      : null;

  const revisionDate = formatDateUz(adminText?.updated_at ?? OFFER_REVISION_AT);

  return (
    <div className="bg-paper">
      <DocumentHero crumb="Ommaviy oferta" eyebrow="Huquqiy hujjat" title={adminText?.title ?? OFFER_TITLE} lead={OFFER_SUBTITLE}>
        <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4 border-t border-white/15 pt-6 text-sm">
          <div>
            <dt className="text-white/55">Tashkilot</dt>
            <dd className="mt-0.5 font-semibold">{LEGAL_ENTITY.shortName}</dd>
          </div>
          <div>
            <dt className="text-white/55">Huquqiy asos</dt>
            <dd className="mt-0.5 font-semibold">Fuqarolik kodeksi, 369–370-moddalar</dd>
          </div>
          <div>
            <dt className="text-white/55">Amaldagi tahrir</dt>
            <dd className="mt-0.5 font-semibold">{revisionDate}</dd>
          </div>
        </dl>
      </DocumentHero>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-16">
        {adminText ? (
          <article className="mx-auto max-w-3xl whitespace-pre-wrap text-[1rem] leading-[1.8] text-ink">
            {adminText.content}
          </article>
        ) : (
          <div className="grid gap-10 lg:grid-cols-[15.5rem_minmax(0,1fr)] lg:gap-14">
            <aside className="hidden lg:block">
              <nav aria-label="Mundarija" className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2">
                <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink-soft">Mundarija</p>
                <Contents />
              </nav>
            </aside>

            <article className="min-w-0 max-w-3xl">
              <section aria-labelledby="qisqacha">
                <h2 id="qisqacha" className="font-display text-2xl font-semibold text-navy sm:text-3xl">
                  Asosiy shartlar
                </h2>
                <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border-soft bg-border-soft sm:grid-cols-3">
                  {OFFER_SUMMARY.map((item) => (
                    <div key={item.label} className="bg-white p-4">
                      <dt className="text-xs text-ink-soft">{item.label}</dt>
                      <dd className="mt-1 text-[0.95rem] font-semibold leading-snug text-navy">{item.value}</dd>
                      {item.hint && <dd className="mt-1 text-xs leading-snug text-ink-soft">{item.hint}</dd>}
                    </div>
                  ))}
                </dl>
                <p className="mt-3 text-sm text-ink-soft">
                  Qisqacha mazmun tanishish uchun berilgan va Shartnoma matnining o‘rnini bosmaydi.
                </p>
              </section>

              <details className="mt-8 rounded-md border border-border-soft bg-white p-3 lg:hidden">
                <summary className="cursor-pointer px-2 py-1 text-sm font-semibold text-navy">Mundarija</summary>
                <div className="mt-2">
                  <Contents />
                </div>
              </details>

              <div className="mt-10 space-y-4 text-[1rem] leading-[1.8] text-ink">
                {OFFER_PREAMBLE.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>

              <aside className="mt-8 rounded-md border-l-2 border-liderlar-blue bg-white p-5 sm:p-6">
                <p className="flex items-center gap-2 text-sm font-semibold text-navy">
                  <Scale className="h-4 w-4 text-electric-blue" aria-hidden />
                  O‘zbekiston Respublikasi Fuqarolik kodeksidan
                </p>
                <div className="mt-4 space-y-4">
                  {OFFER_LAW_QUOTES.map((quote) => (
                    <figure key={quote.article}>
                      <blockquote className="font-display text-lg leading-snug text-navy sm:text-xl">
                        “{quote.text}”
                      </blockquote>
                      <figcaption className="mt-1.5 text-xs text-ink-soft">{quote.article}</figcaption>
                    </figure>
                  ))}
                </div>
                <a
                  href={LAW_LINKS.civilCode}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-electric-blue hover:text-navy"
                >
                  To‘liq matn: lex.uz
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                </a>
              </aside>

              {OFFER_SECTIONS.map((section, sectionIndex) => (
                <section key={section.id} id={section.id} className="mt-12 scroll-mt-24">
                  <h2 className="border-b border-border-soft pb-3 font-display text-2xl font-semibold text-navy lining-nums sm:text-[1.7rem]">
                    {sectionIndex + 1}. {section.title}
                  </h2>
                  <ol className="mt-5 space-y-4 text-[1rem] leading-[1.8] text-ink">
                    {section.clauses.map((clause, clauseIndex) => (
                      <Clause key={clause.text} number={`${sectionIndex + 1}.${clauseIndex + 1}`} clause={clause} />
                    ))}
                  </ol>
                </section>
              ))}

              <section id={REQUISITES_ID} className="mt-12 scroll-mt-24">
                <h2 className="border-b border-border-soft pb-3 font-display text-2xl font-semibold text-navy lining-nums sm:text-[1.7rem]">
                  {OFFER_SECTIONS.length + 1}. Tashkilot rekvizitlari
                </h2>
                <p className="mt-5 text-[1rem] leading-[1.8] text-ink">
                  Quyidagi ma’lumotlar Tashkilotning davlat ro‘yxatidan o‘tkazilganligi to‘g‘risidagi guvohnomasi va noshirlik
                  faoliyati bo‘yicha tasdiqnomasidan olingan. Hujjatlarning elektron nusxalari ushbu sahifaga ilova qilingan.
                </p>
                <div className="mt-8">
                  <LegalDocuments />
                </div>
              </section>
            </article>
          </div>
        )}
      </div>
    </div>
  );
}
