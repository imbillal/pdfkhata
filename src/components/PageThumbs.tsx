"use client";

// Page thumbnails for the page-level PDF tools (remove, extract, organize, rotate…).
// Thumbnails are rendered one by one with pdf.js so the grid fills in progressively.

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { Field, inputClass } from "@/components/kit";
import { errorMessage } from "@/lib/files";
import { loadPdfJs, parsePageRanges, renderPage } from "@/lib/pdf";
import { formatRanges } from "@/lib/pdf-thumbs";
import { useT } from "@/i18n/LocaleProvider";

/** A rendered thumbnail data URL, `null` while pending, `""` if the page couldn't be drawn. */
export type ThumbSrc = string | null;

interface ThumbState {
  file: File | null;
  pageCount: number;
  thumbs: ThumbSrc[];
  error: string | null;
  done: boolean;
}

const EMPTY: ThumbState = { file: null, pageCount: 0, thumbs: [], error: null, done: false };

export interface PdfThumbs {
  pageCount: number;
  thumbs: ThumbSrc[];
  error: string | null;
  /** True until the page count is known. */
  loading: boolean;
  /** True once every thumbnail has been attempted. */
  done: boolean;
}

/** Render small previews of every page of `file`. `maxSize` is the longest side in device pixels. */
export function usePdfThumbs(file: File | null, maxSize = 260): PdfThumbs {
  const t = useT();
  const [state, setState] = useState<ThumbState>(EMPTY);

  useEffect(() => {
    if (!file) return;
    let cancelled = false;
    let doc: PDFDocumentProxy | null = null;

    (async () => {
      try {
        const opened = await loadPdfJs(file);
        doc = opened;
        if (cancelled) {
          void opened.loadingTask.destroy();
          return;
        }
        const n = opened.numPages;
        setState({ file, pageCount: n, thumbs: new Array<ThumbSrc>(n).fill(null), error: null, done: false });
        for (let i = 1; i <= n; i++) {
          if (cancelled) return;
          let url = "";
          try {
            const page = await opened.getPage(i);
            const vp = page.getViewport({ scale: 1 });
            const canvas = await renderPage(opened, i, maxSize / Math.max(vp.width, vp.height));
            url = canvas.toDataURL("image/jpeg", 0.78);
            canvas.width = 0;
            canvas.height = 0;
          } catch {
            if (cancelled) return;
            url = "";
          }
          if (cancelled) return;
          setState((prev) => {
            if (prev.file !== file) return prev;
            const thumbs = prev.thumbs.slice();
            thumbs[i - 1] = url;
            return { ...prev, thumbs };
          });
        }
        setState((prev) => (prev.file === file ? { ...prev, done: true } : prev));
      } catch (err) {
        if (!cancelled) {
          setState({ file, pageCount: 0, thumbs: [], error: errorMessage(err, ""), done: true });
        }
      }
    })();

    return () => {
      cancelled = true;
      void doc?.loadingTask.destroy();
    };
  }, [file, maxSize]);

  if (!file || state.file !== file) return { pageCount: 0, thumbs: [], error: null, loading: !!file, done: false };
  const error = state.error === null ? null : state.error || t({ en: "This file couldn't be read as a PDF.", bn: "ফাইলটি PDF হিসেবে পড়া গেল না।" });
  return { pageCount: state.pageCount, thumbs: state.thumbs, error, loading: false, done: state.done };
}

/* ---------- Presentation ---------- */

export function ThumbGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-[repeat(auto-fill,minmax(104px,1fr))] gap-3 sm:grid-cols-[repeat(auto-fill,minmax(124px,1fr))]">{children}</div>;
}

/** The picture part of a page card: a square well with the page centred and optionally turned. */
export function ThumbImage({ src, alt, rotation = 0, dim = false }: { src: ThumbSrc | undefined; alt: string; rotation?: number; dim?: boolean }) {
  const t = useT();
  return (
    <div className="grid aspect-square place-items-center overflow-hidden rounded bg-paper-2 p-2">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- data URL rendered in the browser
        <img
          src={src}
          alt={alt}
          draggable={false}
          className={`max-h-full max-w-full border border-rule bg-white shadow-sm transition-[transform,opacity] duration-200 ${dim ? "opacity-35" : ""}`}
          style={{ transform: rotation ? `rotate(${rotation}deg)` : undefined }}
        />
      ) : src === "" ? (
        <span className="px-1 text-center text-[11px] text-ink-3">{t({ en: "No preview", bn: "প্রিভিউ নেই" })}</span>
      ) : (
        <span className="h-4/5 w-3/5 animate-pulse rounded-sm bg-rule" aria-hidden />
      )}
    </div>
  );
}

type Tone = "plain" | "keep" | "drop";

/** A clickable page card used by the page pickers. */
export function PageThumb({
  src,
  pageNumber,
  rotation = 0,
  tone = "plain",
  onClick,
  footer,
}: {
  src: ThumbSrc | undefined;
  pageNumber: number;
  rotation?: number;
  tone?: Tone;
  onClick?: (e: React.MouseEvent) => void;
  footer?: ReactNode;
}) {
  const t = useT();
  const label = t({ en: `Page ${pageNumber}`, bn: `পৃষ্ঠা ${t.n(pageNumber)}` });
  const ring =
    tone === "keep" ? "border-ok ring-2 ring-ok/30" : tone === "drop" ? "border-margin ring-2 ring-margin/30" : "border-rule hover:border-rule-strong";
  const body = (
    <>
      <div className="relative">
        <ThumbImage src={src} alt={label} rotation={rotation} dim={tone === "drop"} />
        {tone !== "plain" && (
          <span
            className={`absolute top-1.5 right-1.5 grid size-6 place-items-center rounded-full text-white shadow ${tone === "keep" ? "bg-ok" : "bg-margin"}`}
            aria-hidden
          >
            <svg viewBox="0 0 20 20" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2.4">
              {tone === "keep" ? <path d="m4.5 10 3.5 3.5 7.5-7.5" strokeLinecap="round" strokeLinejoin="round" /> : <path d="m6 6 8 8M14 6l-8 8" strokeLinecap="round" />}
            </svg>
          </span>
        )}
      </div>
      <span className={`mt-1.5 block text-center font-mono text-xs ${tone === "drop" ? "text-margin line-through" : "text-ink-2"}`}>{t.n(pageNumber)}</span>
    </>
  );
  return (
    <div className={`rounded-md border bg-sheet p-1.5 transition ${ring}`}>
      {onClick ? (
        <button
          type="button"
          onClick={onClick}
          aria-pressed={tone !== "plain"}
          aria-label={label}
          className="block w-full cursor-pointer rounded text-left outline-none focus-visible:ring-2 focus-visible:ring-margin"
        >
          {body}
        </button>
      ) : (
        body
      )}
      {footer}
    </div>
  );
}

/* ---------- Picker ---------- */

/**
 * Click thumbnails (shift-click for a run) or type ranges to choose pages.
 * `selected` holds 1-based page numbers. Key this component by file so its text resets.
 */
export function PagePicker({
  thumbs,
  pageCount,
  selected,
  onChange,
  tone,
  rangeLabel,
}: {
  thumbs: ThumbSrc[];
  pageCount: number;
  selected: Set<number>;
  onChange: (next: Set<number>) => void;
  tone: "keep" | "drop";
  rangeLabel: string;
}) {
  const t = useT();
  const [text, setText] = useState(() => formatRanges(selected));
  const [textError, setTextError] = useState<string | null>(null);
  const anchor = useRef<number | null>(null);

  const commit = (next: Set<number>) => {
    onChange(next);
    setText(formatRanges(next));
    setTextError(null);
  };

  const toggle = (page: number, shift: boolean) => {
    const next = new Set(selected);
    if (shift && anchor.current !== null) {
      const on = selected.has(anchor.current);
      const [a, b] = anchor.current < page ? [anchor.current, page] : [page, anchor.current];
      for (let p = a; p <= b; p++) {
        if (on) next.add(p);
        else next.delete(p);
      }
    } else if (next.has(page)) next.delete(page);
    else next.add(page);
    anchor.current = page;
    commit(next);
  };

  const quick = (pick: (p: number) => boolean) => {
    const next = new Set<number>();
    for (let p = 1; p <= pageCount; p++) if (pick(p)) next.add(p);
    commit(next);
  };

  const quickBtn = "rounded border border-rule-strong px-2.5 py-1 text-xs text-ink-2 hover:border-ink-3 hover:text-ink";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <Field label={rangeLabel} hint={textError ?? t({ en: "Click pages below (shift-click for a run) or type e.g. 1-3, 7, 10-", bn: "নিচের পৃষ্ঠায় ক্লিক করুন (একটানা বাছতে Shift চেপে ক্লিক), অথবা লিখুন যেমন 1-3, 7, 10-" })}>
            {(id) => (
              <input
                id={id}
                className={`${inputClass} font-mono ${textError ? "border-margin" : ""}`}
                value={text}
                placeholder={t({ en: "e.g. 2, 5-7", bn: "যেমন 2, 5-7" })}
                inputMode="numeric"
                aria-invalid={!!textError}
                onChange={(e) => {
                  const value = e.target.value;
                  setText(value);
                  try {
                    onChange(new Set(parsePageRanges(value, pageCount)));
                    setTextError(null);
                  } catch (err) {
                    setTextError(errorMessage(err));
                  }
                }}
              />
            )}
          </Field>
        </div>
        <div className="flex flex-wrap gap-1.5 sm:pb-0.5">
          <button type="button" className={quickBtn} onClick={() => quick(() => true)}>
            {t({ en: "All", bn: "সব" })}
          </button>
          <button type="button" className={quickBtn} onClick={() => quick(() => false)}>
            {t({ en: "None", bn: "কোনোটি না" })}
          </button>
          <button type="button" className={quickBtn} onClick={() => quick((p) => p % 2 === 1)}>
            {t({ en: "Odd", bn: "বিজোড়" })}
          </button>
          <button type="button" className={quickBtn} onClick={() => quick((p) => p % 2 === 0)}>
            {t({ en: "Even", bn: "জোড়" })}
          </button>
          <button type="button" className={quickBtn} onClick={() => quick((p) => !selected.has(p))}>
            {t({ en: "Invert", bn: "উল্টে দিন" })}
          </button>
        </div>
      </div>
      <ThumbGrid>
        {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
          <PageThumb key={p} src={thumbs[p - 1]} pageNumber={p} tone={selected.has(p) ? tone : "plain"} onClick={(e) => toggle(p, e.shiftKey)} />
        ))}
      </ThumbGrid>
    </div>
  );
}

/** Placeholder shown while the page count is still unknown. */
export function ThumbsLoading() {
  const t = useT();
  return (
    <div className="flex items-center gap-2 py-8 text-sm text-ink-3">
      <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
      {t({ en: "Reading pages…", bn: "পৃষ্ঠাগুলো পড়া হচ্ছে…" })}
    </div>
  );
}
