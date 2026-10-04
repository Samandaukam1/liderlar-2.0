"use client";

import { useRef, useState } from "react";
import { Bold, Eye, Heading2, Italic, Link2, List, PenLine, Quote } from "lucide-react";
import { isSafeLink } from "@/lib/articles/rich-text";
import {
  insertLink,
  toggleLinePrefix,
  toggleWrap,
  type EditResult,
  type LinePrefix,
} from "@/lib/articles/rich-text-edit";
import { RichArticleBody } from "@/components/ui/rich-article-body";

/**
 * MAQOLA MATNI MUHARRIRI — ASBOBLAR PANELI BILAN.
 *
 * NEGA WYSIWYG EMAS: `contenteditable` muharriri HTML yasaydi va uni
 * saqlash/tozalash saqlangan XSS xavfini olib keladi (§58), ustiga og'ir
 * kutubxona. Bu yerda matn MATN bo'lib qoladi, tugmalar esa unga
 * yengil belgi qo'yadi (`**qalin**`, `> iqtibos`). "Ko'rinish" yorlig'i
 * matnni ommaviy sahifadagi bilan BIR XIL chizuvchi orqali ko'rsatadi —
 * muallif natijani nashrdan oldin ko'radi.
 *
 * Tugmalar `onMouseDown` da `preventDefault` qiladi: aks holda bosish
 * matn maydonidan fokusni olib, tanlovni yo'qotardi.
 */
export function ContentEditor({
  value,
  onChange,
  footer,
}: {
  value: string;
  onChange: (next: string) => void;
  /** Belgilar soni va avtosaqlash vaqti — chaqiruvchidan. */
  footer?: React.ReactNode;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [mode, setMode] = useState<"write" | "preview">("write");
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("https://");
  const [linkError, setLinkError] = useState<string | null>(null);
  /*
   * HAVOLA OYNASI OCHILGANDAGI TANLOV.
   *
   * Manzil maydoniga yozish uchun fokus matn maydonidan ketadi va
   * brauzer tanlovni unutadi. Shuning uchun u oldindan saqlanadi.
   */
  const savedSelection = useRef({ start: 0, end: 0 });

  function selection() {
    const el = ref.current;
    return el ? { start: el.selectionStart, end: el.selectionEnd } : { start: value.length, end: value.length };
  }

  function apply(result: EditResult) {
    onChange(result.value);
    // Yangi matn chizilgandan keyin tanlovni qaytaramiz.
    requestAnimationFrame(() => {
      const el = ref.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(result.selection.start, result.selection.end);
    });
  }

  const wrap = (marker: "**" | "*", placeholder: string) =>
    apply(toggleWrap(value, selection(), marker, placeholder));
  const prefix = (p: LinePrefix) => apply(toggleLinePrefix(value, selection(), p));

  function openLink() {
    savedSelection.current = selection();
    setLinkUrl("https://");
    setLinkError(null);
    setLinkOpen(true);
  }

  function confirmLink() {
    const url = linkUrl.trim();
    if (!isSafeLink(url)) {
      setLinkError("Havola https:// bilan boshlanishi va to'liq manzil bo'lishi kerak.");
      return;
    }
    setLinkOpen(false);
    apply(insertLink(value, savedSelection.current, url, "havola"));
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (!(event.metaKey || event.ctrlKey)) return;
    const key = event.key.toLowerCase();
    if (key === "b") {
      event.preventDefault();
      wrap("**", "qalin matn");
    } else if (key === "i") {
      event.preventDefault();
      wrap("*", "kursiv matn");
    } else if (key === "k") {
      event.preventDefault();
      openLink();
    }
  }

  return (
    <div className="mb-3">
      <span className="mb-1 block text-xs font-semibold text-navy">Maqola matni</span>

      <div className="overflow-hidden rounded-md border border-brand-soft bg-white focus-within:border-liderlar-blue">
        {/* ------------------------------------------------ ASBOBLAR */}
        <div
          role="toolbar"
          aria-label="Matnni bezash"
          className="flex flex-wrap items-center gap-0.5 border-b border-brand-soft bg-paper px-1.5 py-1"
        >
          <ToolButton label="Qalin (Ctrl+B)" disabled={mode === "preview"} onClick={() => wrap("**", "qalin matn")}>
            <Bold className="h-4 w-4" aria-hidden />
          </ToolButton>
          <ToolButton label="Kursiv (Ctrl+I)" disabled={mode === "preview"} onClick={() => wrap("*", "kursiv matn")}>
            <Italic className="h-4 w-4" aria-hidden />
          </ToolButton>
          <ToolButton label="Havola (Ctrl+K)" disabled={mode === "preview"} onClick={openLink}>
            <Link2 className="h-4 w-4" aria-hidden />
          </ToolButton>

          <span className="mx-1 h-5 w-px bg-brand-soft" aria-hidden />

          <ToolButton label="Iqtibos" disabled={mode === "preview"} onClick={() => prefix("> ")}>
            <Quote className="h-4 w-4" aria-hidden />
          </ToolButton>
          <ToolButton label="Kichik sarlavha" disabled={mode === "preview"} onClick={() => prefix("## ")}>
            <Heading2 className="h-4 w-4" aria-hidden />
          </ToolButton>
          <ToolButton label="Ro'yxat" disabled={mode === "preview"} onClick={() => prefix("- ")}>
            <List className="h-4 w-4" aria-hidden />
          </ToolButton>

          {/* Yozish / ko'rinish — o'ng chetda. */}
          <span className="ml-auto flex rounded-md border border-brand-soft bg-white p-0.5 text-[11px] font-semibold">
            <button
              type="button"
              onClick={() => setMode("write")}
              aria-pressed={mode === "write"}
              className={`inline-flex items-center gap-1 rounded px-2 py-1 transition ${
                mode === "write" ? "bg-liderlar-blue text-white" : "text-ink-soft hover:text-navy"
              }`}
            >
              <PenLine className="h-3.5 w-3.5" aria-hidden />
              Yozish
            </button>
            <button
              type="button"
              onClick={() => {
                setLinkOpen(false);
                setMode("preview");
              }}
              aria-pressed={mode === "preview"}
              className={`inline-flex items-center gap-1 rounded px-2 py-1 transition ${
                mode === "preview" ? "bg-liderlar-blue text-white" : "text-ink-soft hover:text-navy"
              }`}
            >
              <Eye className="h-3.5 w-3.5" aria-hidden />
              Ko&apos;rinish
            </button>
          </span>
        </div>

        {/* ------------------------------------------------ HAVOLA */}
        {linkOpen && mode === "write" && (
          <div className="border-b border-brand-soft bg-ice/40 px-3 py-2">
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="url"
                inputMode="url"
                autoFocus
                value={linkUrl}
                onChange={(event) => {
                  setLinkUrl(event.target.value);
                  setLinkError(null);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    confirmLink();
                  } else if (event.key === "Escape") {
                    setLinkOpen(false);
                  }
                }}
                placeholder="https://"
                aria-label="Havola manzili"
                className="min-w-0 flex-1 rounded-md border border-brand-soft bg-white px-2.5 py-1.5 text-sm"
              />
              <button
                type="button"
                onClick={confirmLink}
                className="rounded-md bg-liderlar-blue px-3 py-1.5 text-xs font-semibold text-white"
              >
                Qo&apos;shish
              </button>
              <button
                type="button"
                onClick={() => setLinkOpen(false)}
                className="rounded-md border border-brand-soft px-3 py-1.5 text-xs font-semibold text-ink-soft"
              >
                Bekor
              </button>
            </div>
            <p className={`mt-1 text-[11px] ${linkError ? "font-semibold text-rose-600" : "text-ink-soft"}`}>
              {linkError ?? "Avval matnda havola bo'ladigan so'zni belgilang, keyin manzilni kiriting."}
            </p>
          </div>
        )}

        {/* ------------------------------------------------ MATN / KO'RINISH */}
        {mode === "write" ? (
          <textarea
            ref={ref}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={onKeyDown}
            rows={18}
            aria-label="Maqola matni"
            className="block w-full resize-y border-0 bg-white px-3 py-2 font-serif text-sm leading-relaxed text-ink placeholder:text-ink-soft/60 focus:outline-none"
            placeholder="Matnni shu yerga yozing. Abzatslarni bo'sh qator bilan ajrating."
          />
        ) : (
          <div className="min-h-[18rem] bg-white px-4 py-5">
            {value.trim() ? (
              <RichArticleBody content={value} className="max-w-none" />
            ) : (
              <p className="text-sm text-ink-soft">Hali matn yo&apos;q.</p>
            )}
          </div>
        )}
      </div>

      {footer}

      {/* Belgilarni qo'lda yozadiganlar uchun — qisqa eslatma. */}
      <details className="mt-1 text-[11px] text-ink-soft">
        <summary className="cursor-pointer select-none font-semibold">Belgilar haqida</summary>
        <ul className="mt-1 space-y-0.5 pl-1 font-mono">
          <li>**qalin** · *kursiv* · [matn](https://manzil)</li>
          <li>&gt; iqtibos · ## sarlavha · - ro&apos;yxat</li>
          <li>\* — yulduzchaning o&apos;zi</li>
        </ul>
      </details>
    </div>
  );
}

function ToolButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      // Fokus matn maydonida qolsin — tanlov yo'qolmasin.
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className="inline-flex h-8 w-8 items-center justify-center rounded text-ink-soft transition hover:bg-white hover:text-navy disabled:opacity-40"
    >
      {children}
    </button>
  );
}
