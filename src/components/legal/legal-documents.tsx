import Image from "next/image";
import { Download, ExternalLink, FileText, ShieldCheck } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { LEGAL_DOCUMENTS, type LegalDocument } from "@/lib/legal/company";
import { cn } from "@/lib/utils";

function DocumentPanel({ document }: { document: LegalDocument }) {
  const { verification, scope } = document;
  return (
    <article id={document.id} className="grid scroll-mt-24 gap-8 lg:grid-cols-[minmax(0,19rem)_minmax(0,1fr)] lg:gap-12">
      <a
        href={document.pdfHref}
        target="_blank"
        rel="noopener"
        aria-label={`${document.title} — PDF faylni ochish`}
        className="group mx-auto block w-full max-w-xs self-start lg:max-w-none"
      >
        <span className="block overflow-hidden rounded-sm border border-border-soft bg-white shadow-card transition-transform duration-300 ease-out group-hover:-translate-y-1">
          <Image
            src={document.previewSrc}
            alt={document.title}
            width={document.previewWidth}
            height={document.previewHeight}
            sizes="(min-width: 1024px) 304px, 320px"
            className="h-auto w-full"
          />
        </span>
        <span className="mt-3 flex items-center justify-center gap-2 text-sm font-semibold text-electric-blue group-hover:text-navy">
          <FileText className="h-4 w-4" aria-hidden />
          PDF faylni ochish
        </span>
      </a>

      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-electric-blue">{document.eyebrow}</p>
        <h3 className="mt-2 font-display text-2xl font-semibold leading-snug text-navy sm:text-[1.7rem]">
          {document.title}
        </h3>

        <dl className="mt-6 divide-y divide-border-soft border-y border-border-soft">
          {document.facts.map((fact) => (
            <div key={fact.label} className="grid gap-1 py-3 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-4">
              <dt className="text-sm text-ink-soft">{fact.label}</dt>
              <dd className="text-sm font-semibold text-navy">{fact.value}</dd>
            </div>
          ))}
        </dl>

        {scope && (
          <div className="mt-6">
            <p className="text-sm text-ink-soft">{scope.label}</p>
            <ul className="mt-2 gap-x-8 text-sm leading-relaxed text-ink sm:columns-2">
              {scope.items.map((item) => (
                <li key={item} className={cn("break-inside-avoid py-0.5", item === scope.emphasis && "font-bold text-navy")}>
                  {item}
                </li>
              ))}
            </ul>
            <figure className="mt-4 border-l-2 border-liderlar-blue pl-4">
              <blockquote className="text-sm leading-relaxed text-ink">“{scope.quote}”</blockquote>
              <figcaption className="mt-1 text-xs text-ink-soft">Tasdiqnoma: {scope.emphasis.toLowerCase()} ta’rifi</figcaption>
            </figure>
          </div>
        )}

        <div className="mt-5 flex gap-3 rounded-md bg-liderlar-blue/8 p-4">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-electric-blue" aria-hidden />
          <p className="text-sm leading-relaxed text-ink">
            {verification.text} <strong className="text-navy">“{verification.status}”</strong>.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <a
            href={verification.href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: "primary" }))}
          >
            <ExternalLink className="h-4 w-4" aria-hidden />
            {verification.action}
          </a>
          <a href={document.pdfHref} download={document.downloadName} className={cn(buttonVariants({ variant: "secondary" }))}>
            <Download className="h-4 w-4" aria-hidden />
            PDF yuklab olish
          </a>
        </div>
      </div>
    </article>
  );
}

/** Tashkilotning rasmiy hujjatlari: asl nusxa, undan olingan ma'lumot va tekshirish yo'li. */
export function LegalDocuments() {
  return (
    <div className="space-y-14 lg:space-y-20">
      {LEGAL_DOCUMENTS.map((document) => (
        <DocumentPanel key={document.id} document={document} />
      ))}
    </div>
  );
}
