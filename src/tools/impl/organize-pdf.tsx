"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import { Button, ErrorNote, FileDrop, FileRow, ResultBox, Sheet, SideSection, Workspace } from "@/components/kit";
import { ThumbGrid, ThumbImage, ThumbsLoading, usePdfThumbs } from "@/components/PageThumbs";
import { useT } from "@/i18n/LocaleProvider";
import { downloadBytes, errorMessage, formatBytes, renameFile } from "@/lib/files";
import { PDF_MIME, loadPdfLib, savePdf } from "@/lib/pdf";
import { quarterTurn } from "@/lib/pdf-thumbs";

interface Item {
  /** Stable key for React and drag-and-drop. */
  id: number;
  /** 0-based page index in the source PDF. */
  src: number;
  /** Extra clockwise rotation in degrees (kept unwrapped so the turn animates the short way). */
  rot: number;
}

interface Result {
  bytes: Uint8Array;
  pages: number;
}

function initialItems(count: number): Item[] {
  return Array.from({ length: count }, (_, i) => ({ id: i, src: i, rot: 0 }));
}

function IconButton({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="grid size-7 place-items-center rounded text-ink-2 hover:bg-paper-2 hover:text-ink disabled:pointer-events-none disabled:opacity-30"
    >
      <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        {children}
      </svg>
    </button>
  );
}

export default function OrganizePdf() {
  const t = useT();
  const [file, setFile] = useState<File | null>(null);
  const [items, setItems] = useState<Item[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);
  const dragFrom = useRef<number | null>(null);
  const { thumbs, pageCount, error: loadError, loading } = usePdfThumbs(file);

  // Until the user edits anything, the list is simply every page in order.
  const list = items ?? initialItems(pageCount);

  const pick = useCallback((files: File[]) => {
    setFile(files[0] ?? null);
    setItems(null);
    setResult(null);
    setError(null);
  }, []);

  const update = useCallback(
    (fn: (prev: Item[]) => Item[]) => {
      setItems((prev) => fn(prev ?? initialItems(pageCount)));
      setResult(null);
    },
    [pageCount],
  );

  const moveTo = useCallback(
    (from: number, to: number) =>
      update((prev) => {
        if (from === to || to < 0 || to >= prev.length) return prev;
        const next = [...prev];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        return next;
      }),
    [update],
  );

  const rotate = useCallback((index: number, delta: number) => update((prev) => prev.map((it, i) => (i === index ? { ...it, rot: it.rot + delta } : it))), [update]);
  const rotateAll = useCallback((delta: number) => update((prev) => prev.map((it) => ({ ...it, rot: it.rot + delta }))), [update]);
  const remove = useCallback((index: number) => update((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index))), [update]);

  const save = useCallback(async () => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const { PDFDocument, degrees } = await import("pdf-lib");
      const src = await loadPdfLib(file);
      if (list.length === 0) throw new Error(t({ en: "Keep at least one page.", bn: "অন্তত একটি পৃষ্ঠা রাখুন।" }));
      const out = await PDFDocument.create();
      const pages = await out.copyPages(
        src,
        list.map((it) => it.src),
      );
      pages.forEach((page, i) => {
        const turn = quarterTurn(page.getRotation().angle + list[i].rot);
        page.setRotation(degrees(turn));
        out.addPage(page);
      });
      setResult({ bytes: await savePdf(out), pages: out.getPageCount() });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }, [file, list, t]);

  if (!file) {
    return (
      <FileDrop
        accept=".pdf,application/pdf"
        onFiles={pick}
        hint={t({ en: "Reorder, rotate and delete pages, then save.", bn: "পৃষ্ঠা সাজান, ঘোরান বা মুছুন, তারপর সেভ করুন।" })}
      />
    );
  }

  const changed = items !== null;
  const removedCount = pageCount - list.length;

  return (
    <Workspace
      main={
        <Sheet>
          <FileRow file={file} onRemove={() => pick([])} />
          <div className="mt-4">
            {loadError ? (
              <ErrorNote message={loadError} />
            ) : loading ? (
              <ThumbsLoading />
            ) : (
              <>
                <p className="mb-3 text-xs text-ink-3">
                  {t({
                    en: "Drag pages to reorder them, or use the arrows. Changes are saved into a new PDF.",
                    bn: "পৃষ্ঠা টেনে এনে ক্রম বদলান, অথবা তীর চিহ্ন ব্যবহার করুন। পরিবর্তনগুলো নতুন PDF-এ সেভ হবে।",
                  })}
                </p>
                <ThumbGrid>
                  {list.map((it, i) => {
                    const pageLabel = t({ en: `Page ${it.src + 1}`, bn: `পৃষ্ঠা ${t.n(it.src + 1)}` });
                    return (
                      <div
                        key={it.id}
                        draggable
                        onDragStart={(e) => {
                          dragFrom.current = i;
                          e.dataTransfer.effectAllowed = "move";
                          e.dataTransfer.setData("text/plain", String(i));
                        }}
                        onDragOver={(e) => {
                          if (dragFrom.current === null) return;
                          e.preventDefault();
                          e.dataTransfer.dropEffect = "move";
                          if (dragOver !== i) setDragOver(i);
                        }}
                        onDragLeave={() => setDragOver((v) => (v === i ? null : v))}
                        onDrop={(e) => {
                          e.preventDefault();
                          const from = dragFrom.current;
                          dragFrom.current = null;
                          setDragOver(null);
                          if (from !== null) moveTo(from, i);
                        }}
                        onDragEnd={() => {
                          dragFrom.current = null;
                          setDragOver(null);
                        }}
                        className={`cursor-grab rounded-md border bg-sheet p-1.5 transition active:cursor-grabbing ${
                          dragOver === i ? "border-margin ring-2 ring-margin/30" : "border-rule hover:border-rule-strong"
                        }`}
                      >
                        <ThumbImage src={thumbs[it.src]} alt={pageLabel} rotation={it.rot} />
                        <div className="mt-1 flex items-center justify-between gap-1">
                          <span className="font-mono text-xs text-ink-3">{t.n(i + 1)}</span>
                          <span className="truncate text-[11px] text-ink-3">
                            {it.src !== i ? t({ en: `was ${it.src + 1}`, bn: `আগে ${t.n(it.src + 1)}` }) : ""}
                          </span>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center justify-center gap-0.5 border-t border-rule pt-1">
                          <IconButton label={t({ en: `Move ${pageLabel} earlier`, bn: `${pageLabel} আগে আনুন` })} disabled={i === 0} onClick={() => moveTo(i, i - 1)}>
                            <path d="M12 5 7 10l5 5" />
                          </IconButton>
                          <IconButton label={t({ en: `Rotate ${pageLabel} left`, bn: `${pageLabel} বাঁয়ে ঘোরান` })} onClick={() => rotate(i, -90)}>
                            <path d="M4 8a7 7 0 1 1 1.5 6.5" />
                            <path d="M4 3.5V8h4.5" />
                          </IconButton>
                          <IconButton label={t({ en: `Rotate ${pageLabel} right`, bn: `${pageLabel} ডানে ঘোরান` })} onClick={() => rotate(i, 90)}>
                            <path d="M16 8a7 7 0 1 0-1.5 6.5" />
                            <path d="M16 3.5V8h-4.5" />
                          </IconButton>
                          <IconButton label={t({ en: `Delete ${pageLabel}`, bn: `${pageLabel} মুছুন` })} disabled={list.length <= 1} onClick={() => remove(i)}>
                            <path d="M5 6h10M8 6V4.5h4V6M6.5 6l.7 9.5h5.6l.7-9.5" />
                          </IconButton>
                          <IconButton label={t({ en: `Move ${pageLabel} later`, bn: `${pageLabel} পরে নিন` })} disabled={i === list.length - 1} onClick={() => moveTo(i, i + 1)}>
                            <path d="m8 5 5 5-5 5" />
                          </IconButton>
                        </div>
                      </div>
                    );
                  })}
                </ThumbGrid>
              </>
            )}
          </div>
        </Sheet>
      }
      side={
        <>
          <SideSection title={t({ en: "Organize", bn: "সাজান" })}>
            <p className="text-sm text-ink-2">
              {t({
                en: `${list.length} page${list.length === 1 ? "" : "s"}${removedCount > 0 ? ` · ${removedCount} deleted` : ""}`,
                bn: `${t.n(list.length)}টি পৃষ্ঠা${removedCount > 0 ? ` · ${t.n(removedCount)}টি মোছা হয়েছে` : ""}`,
              })}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" className="px-2" disabled={pageCount === 0} onClick={() => rotateAll(-90)}>
                {t({ en: "↺ All left", bn: "↺ সব বাঁয়ে" })}
              </Button>
              <Button variant="secondary" className="px-2" disabled={pageCount === 0} onClick={() => rotateAll(90)}>
                {t({ en: "All right ↻", bn: "সব ডানে ↻" })}
              </Button>
            </div>
            <Button onClick={save} busy={busy} disabled={pageCount === 0 || !!loadError}>
              {t({ en: "Save PDF", bn: "PDF সেভ করুন" })}
            </Button>
            {changed && (
              <Button
                variant="ghost"
                onClick={() => {
                  setItems(null);
                  setResult(null);
                }}
              >
                {t({ en: "Reset changes", bn: "পরিবর্তন বাতিল করুন" })}
              </Button>
            )}
          </SideSection>
          <ErrorNote message={error} />
          {result && (
            <ResultBox
              title={t({ en: "PDF ready", bn: "PDF তৈরি" })}
              detail={t({
                en: `${result.pages} page${result.pages === 1 ? "" : "s"} · ${formatBytes(result.bytes.byteLength)}`,
                bn: `${t.n(result.pages)}টি পৃষ্ঠা · ${formatBytes(result.bytes.byteLength)}`,
              })}
            >
              <Button onClick={() => downloadBytes(result.bytes, renameFile(file.name, "-organized.pdf"), PDF_MIME)}>
                {t({ en: "Download PDF", bn: "PDF ডাউনলোড করুন" })}
              </Button>
            </ResultBox>
          )}
        </>
      }
    />
  );
}
