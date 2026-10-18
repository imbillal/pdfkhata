"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, ErrorNote, Field, FileDrop, FileRow, Progress, ResultBox, Segmented, Sheet, SideSection, Workspace, inputClass } from "@/components/kit";
import { useT, type Translator } from "@/i18n/LocaleProvider";
import { downloadBytes, downloadZip, errorMessage, formatBytes, renameFile } from "@/lib/files";
import { PDF_MIME, loadPdfLib, parseRangeGroups, savePdf } from "@/lib/pdf";
import { formatRanges } from "@/lib/pdf-thumbs";

type Mode = "each" | "ranges" | "chunks";

interface Piece {
  name: string;
  bytes: Uint8Array;
}

/** Work out which pages go into each output file. Throws readable errors. */
function planGroups(mode: Mode, pageCount: number, ranges: string, chunk: number, t: Translator): number[][] {
  if (pageCount < 1) return [];
  if (mode === "each") return Array.from({ length: pageCount }, (_, i) => [i + 1]);
  if (mode === "chunks") {
    if (!Number.isInteger(chunk) || chunk < 1) throw new Error(t({ en: "Enter how many pages each part should have.", bn: "প্রতিটি অংশে কয়টি পৃষ্ঠা থাকবে লিখুন।" }));
    const groups: number[][] = [];
    for (let start = 1; start <= pageCount; start += chunk) {
      groups.push(Array.from({ length: Math.min(chunk, pageCount - start + 1) }, (_, i) => start + i));
    }
    return groups;
  }
  const groups = parseRangeGroups(ranges, pageCount).filter((g) => g.length > 0);
  if (groups.length === 0) throw new Error(t({ en: "Type at least one range, e.g. 1-3, 4-6.", bn: "অন্তত একটি সীমা লিখুন, যেমন 1-3, 4-6।" }));
  return groups;
}

function groupLabel(group: number[], t: Translator): string {
  const digits = (s: string) => s.replace(/\d+/g, (m) => t.n(Number(m), { useGrouping: false }));
  return group.length === 1
    ? t({ en: `page ${group[0]}`, bn: `পৃষ্ঠা ${t.n(group[0])}` })
    : t({ en: `pages ${formatRanges(group)}`, bn: `পৃষ্ঠা ${digits(formatRanges(group))}` });
}

export default function SplitPdf() {
  const t = useT();
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [mode, setMode] = useState<Mode>("ranges");
  const [ranges, setRanges] = useState("");
  const [chunk, setChunk] = useState("2");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Piece[] | null>(null);

  const pick = useCallback((files: File[]) => {
    setFile(files[0] ?? null);
    setPageCount(0);
    setResult(null);
    setError(null);
  }, []);

  // Read the page count once per file.
  useEffect(() => {
    if (!file) return;
    let cancelled = false;
    loadPdfLib(file)
      .then((doc) => {
        if (cancelled) return;
        const n = doc.getPageCount();
        setPageCount(n);
        setRanges(n > 1 ? `1-${Math.ceil(n / 2)}, ${Math.ceil(n / 2) + 1}-${n}` : "1");
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(errorMessage(err, t({ en: "This file couldn't be read as a PDF.", bn: "ফাইলটি PDF হিসেবে পড়া গেল না।" })));
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-read when the file changes
  }, [file]);

  const plan = useMemo((): { groups: number[][]; error: string | null } => {
    try {
      return { groups: planGroups(mode, pageCount, ranges, Number(chunk), t), error: null };
    } catch (err) {
      return { groups: [], error: errorMessage(err) };
    }
  }, [mode, pageCount, ranges, chunk, t]);

  const run = useCallback(async () => {
    if (!file) return;
    setBusy(true);
    setError(null);
    setProgress(0);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const src = await loadPdfLib(file);
      const groups = planGroups(mode, src.getPageCount(), ranges, Number(chunk), t);
      const pad = String(mode === "each" ? src.getPageCount() : groups.length).length;
      const pieces: Piece[] = [];
      for (let i = 0; i < groups.length; i++) {
        const group = groups[i];
        const out = await PDFDocument.create();
        const pages = await out.copyPages(
          src,
          group.map((p) => p - 1),
        );
        pages.forEach((p) => out.addPage(p));
        const suffix = mode === "each" ? `-page-${String(group[0]).padStart(pad, "0")}` : `-part-${String(i + 1).padStart(pad, "0")}`;
        pieces.push({ name: renameFile(file.name, `${suffix}.pdf`), bytes: await savePdf(out) });
        setProgress((i + 1) / groups.length);
      }
      setResult(pieces);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }, [file, mode, ranges, chunk, t]);

  const downloadAll = useCallback(async () => {
    if (!result || !file) return;
    try {
      if (result.length === 1) downloadBytes(result[0].bytes, result[0].name, PDF_MIME);
      else await downloadZip(result.map((p) => ({ name: p.name, data: p.bytes })), renameFile(file.name, "-split.zip"));
    } catch (err) {
      setError(errorMessage(err));
    }
  }, [result, file]);

  if (!file) {
    return (
      <FileDrop
        accept=".pdf,application/pdf"
        onFiles={pick}
        hint={t({ en: "Split by page, by ranges, or into equal parts.", bn: "প্রতি পৃষ্ঠা, পৃষ্ঠার সীমা, বা সমান ভাগে ভাগ করুন।" })}
      />
    );
  }

  const total = result?.reduce((s, p) => s + p.bytes.byteLength, 0) ?? 0;
  const n = plan.groups.length;

  return (
    <Workspace
      main={
        <Sheet>
          <FileRow file={file} onRemove={() => pick([])} />
          <div className="mt-4">
            {pageCount === 0 ? (
              !error && <p className="text-sm text-ink-3">{t({ en: "Reading pages…", bn: "পৃষ্ঠাগুলো পড়া হচ্ছে…" })}</p>
            ) : (
              <>
                <p className="mb-3 text-sm text-ink-2">
                  {t({
                    en: `${pageCount} page${pageCount === 1 ? "" : "s"} · this will make `,
                    bn: `${t.n(pageCount)}টি পৃষ্ঠা · তৈরি হবে `,
                  })}
                  <strong className="text-ink">{t({ en: `${n} PDF${n === 1 ? "" : "s"}`, bn: `${t.n(n)}টি PDF` })}</strong>
                </p>
                {plan.error ? (
                  <p className="text-sm text-margin">{plan.error}</p>
                ) : (
                  <ol className="flex flex-col">
                    {plan.groups.slice(0, 60).map((g, i) => (
                      <li key={i} className="flex items-baseline gap-3 border-b border-rule py-1.5 text-sm last:border-b-0">
                        <span className="w-8 shrink-0 text-right font-mono text-xs text-ink-3">{t.n(i + 1)}.</span>
                        <span className="text-ink-2">
                          {groupLabel(g, t)} <span className="text-ink-3">({t.n(g.length)})</span>
                        </span>
                      </li>
                    ))}
                    {n > 60 && <li className="py-1.5 pl-11 text-sm text-ink-3">{t({ en: `…and ${n - 60} more`, bn: `…আরও ${t.n(n - 60)}টি` })}</li>}
                  </ol>
                )}
              </>
            )}
          </div>
        </Sheet>
      }
      side={
        <>
          <SideSection title={t({ en: "Split", bn: "ভাগ করুন" })}>
            <Segmented
              label={t({ en: "Split mode", bn: "ভাগের ধরন" })}
              value={mode}
              onChange={(v) => {
                setMode(v);
                setResult(null);
              }}
              options={[
                { value: "ranges", label: t({ en: "Ranges", bn: "সীমা" }) },
                { value: "each", label: t({ en: "Every page", bn: "প্রতি পৃষ্ঠা" }) },
                { value: "chunks", label: t({ en: "Every N", bn: "প্রতি N পৃষ্ঠা" }) },
              ]}
            />
            {mode === "ranges" && (
              <Field
                label={t({ en: "Ranges", bn: "পৃষ্ঠার সীমা" })}
                hint={t({ en: "Each comma starts a new PDF. “1-3, 4-6” gives two files.", bn: "প্রতিটি কমা মানে নতুন PDF। “1-3, 4-6” দিলে দুটি ফাইল হবে।" })}
              >
                {(id) => (
                  <input
                    id={id}
                    className={`${inputClass} font-mono`}
                    value={ranges}
                    placeholder="1-3, 4-6"
                    onChange={(e) => {
                      setRanges(e.target.value);
                      setResult(null);
                    }}
                  />
                )}
              </Field>
            )}
            {mode === "chunks" && (
              <Field label={t({ en: "Pages per file", bn: "প্রতি ফাইলে পৃষ্ঠা" })}>
                {(id) => (
                  <input
                    id={id}
                    type="number"
                    min={1}
                    max={Math.max(1, pageCount)}
                    className={inputClass}
                    value={chunk}
                    onChange={(e) => {
                      setChunk(e.target.value);
                      setResult(null);
                    }}
                  />
                )}
              </Field>
            )}
            {mode === "each" && <p className="text-sm text-ink-2">{t({ en: "Every page becomes its own PDF.", bn: "প্রতিটি পৃষ্ঠা আলাদা PDF হবে।" })}</p>}
            <Button onClick={run} busy={busy} disabled={pageCount === 0 || !!plan.error || n === 0}>
              {t({ en: "Split PDF", bn: "PDF ভাগ করুন" })}
            </Button>
            {busy && <Progress value={progress} label={t({ en: "Splitting…", bn: "ভাগ করা হচ্ছে…" })} />}
          </SideSection>
          <ErrorNote message={error} />
          {result && (
            <ResultBox
              title={t({ en: "Split done", bn: "ভাগ করা হয়েছে" })}
              detail={t({
                en: `${result.length} file${result.length === 1 ? "" : "s"} · ${formatBytes(total)}`,
                bn: `${t.n(result.length)}টি ফাইল · ${formatBytes(total)}`,
              })}
            >
              <Button onClick={downloadAll}>
                {result.length === 1 ? t({ en: "Download PDF", bn: "PDF ডাউনলোড করুন" }) : t({ en: "Download ZIP", bn: "ZIP ডাউনলোড করুন" })}
              </Button>
            </ResultBox>
          )}
        </>
      }
    />
  );
}
