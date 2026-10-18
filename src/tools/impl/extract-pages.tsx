"use client";

import { useCallback, useState } from "react";
import { Button, ErrorNote, FileDrop, FileRow, ResultBox, Segmented, Sheet, SideSection, Workspace } from "@/components/kit";
import { PagePicker, ThumbsLoading, usePdfThumbs } from "@/components/PageThumbs";
import { useT } from "@/i18n/LocaleProvider";
import { downloadBytes, downloadZip, errorMessage, formatBytes, renameFile } from "@/lib/files";
import { PDF_MIME, loadPdfLib, savePdf } from "@/lib/pdf";

type Output = "one" | "each";

interface Result {
  files: { name: string; bytes: Uint8Array }[];
  pages: number;
  size: number;
}

export default function ExtractPages() {
  const t = useT();
  const [file, setFile] = useState<File | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [output, setOutput] = useState<Output>("one");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const { thumbs, pageCount, error: loadError, loading } = usePdfThumbs(file);

  const pick = useCallback((files: File[]) => {
    setFile(files[0] ?? null);
    setSelected(new Set());
    setResult(null);
    setError(null);
  }, []);

  const change = useCallback((next: Set<number>) => {
    setSelected(next);
    setResult(null);
  }, []);

  const run = useCallback(async () => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const src = await loadPdfLib(file);
      const total = src.getPageCount();
      const keep = [...selected].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
      if (keep.length === 0) throw new Error(t({ en: "Pick at least one page to extract.", bn: "আলাদা করতে অন্তত একটি পৃষ্ঠা বাছুন।" }));
      const groups = output === "one" ? [keep] : keep.map((p) => [p]);
      const pad = String(total).length;
      const files: Result["files"] = [];
      for (const group of groups) {
        const out = await PDFDocument.create();
        const pages = await out.copyPages(
          src,
          group.map((p) => p - 1),
        );
        pages.forEach((p) => out.addPage(p));
        const name =
          output === "one" ? renameFile(file.name, "-extract.pdf") : renameFile(file.name, `-page-${String(group[0]).padStart(pad, "0")}.pdf`);
        files.push({ name, bytes: await savePdf(out) });
      }
      setResult({ files, pages: keep.length, size: files.reduce((s, f) => s + f.bytes.byteLength, 0) });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }, [file, selected, output, t]);

  const download = useCallback(async () => {
    if (!result || !file) return;
    try {
      if (result.files.length === 1) downloadBytes(result.files[0].bytes, result.files[0].name, PDF_MIME);
      else await downloadZip(result.files.map((f) => ({ name: f.name, data: f.bytes })), renameFile(file.name, "-pages.zip"));
    } catch (err) {
      setError(errorMessage(err));
    }
  }, [result, file]);

  if (!file) {
    return (
      <FileDrop
        accept=".pdf,application/pdf"
        onFiles={pick}
        hint={t({ en: "Then click the pages you want to keep.", bn: "তারপর যে পৃষ্ঠাগুলো রাখতে চান সেগুলোতে ক্লিক করুন।" })}
      />
    );
  }

  const count = selected.size;

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
              <PagePicker
                key={file.name + file.size}
                thumbs={thumbs}
                pageCount={pageCount}
                selected={selected}
                onChange={change}
                tone="keep"
                rangeLabel={t({ en: "Pages to extract", bn: "যে পৃষ্ঠাগুলো আলাদা করবেন" })}
              />
            )}
          </div>
        </Sheet>
      }
      side={
        <>
          <SideSection title={t({ en: "Extract pages", bn: "পৃষ্ঠা আলাদা করুন" })}>
            <p className="text-sm text-ink-2">
              {count === 0
                ? t({ en: "No pages picked yet.", bn: "এখনো কোনো পৃষ্ঠা বাছা হয়নি।" })
                : t({
                    en: `${count} of ${pageCount} page${pageCount === 1 ? "" : "s"} picked.`,
                    bn: `${t.n(pageCount)}টির মধ্যে ${t.n(count)}টি পৃষ্ঠা বাছা হয়েছে।`,
                  })}
            </p>
            <Segmented
              label={t({ en: "Output", bn: "আউটপুট" })}
              value={output}
              onChange={(v) => {
                setOutput(v);
                setResult(null);
              }}
              options={[
                { value: "one", label: t({ en: "One PDF", bn: "একটি PDF" }) },
                { value: "each", label: t({ en: "PDF per page", bn: "প্রতি পৃষ্ঠায় PDF" }) },
              ]}
            />
            <Button onClick={run} busy={busy} disabled={count === 0 || !!loadError}>
              {count > 0
                ? t({ en: `Extract ${count} page${count === 1 ? "" : "s"}`, bn: `${t.n(count)}টি পৃষ্ঠা আলাদা করুন` })
                : t({ en: "Extract pages", bn: "পৃষ্ঠা আলাদা করুন" })}
            </Button>
          </SideSection>
          <ErrorNote message={error} />
          {result && (
            <ResultBox
              title={t({ en: "Pages extracted", bn: "পৃষ্ঠা আলাদা হয়েছে" })}
              detail={
                result.files.length > 1
                  ? t({
                      en: `${result.pages} pages · ${result.files.length} files · ${formatBytes(result.size)}`,
                      bn: `${t.n(result.pages)}টি পৃষ্ঠা · ${t.n(result.files.length)}টি ফাইল · ${formatBytes(result.size)}`,
                    })
                  : t({
                      en: `${result.pages} page${result.pages === 1 ? "" : "s"} · ${formatBytes(result.size)}`,
                      bn: `${t.n(result.pages)}টি পৃষ্ঠা · ${formatBytes(result.size)}`,
                    })
              }
            >
              <Button onClick={download}>
                {result.files.length > 1 ? t({ en: "Download ZIP", bn: "ZIP ডাউনলোড করুন" }) : t({ en: "Download PDF", bn: "PDF ডাউনলোড করুন" })}
              </Button>
            </ResultBox>
          )}
        </>
      }
    />
  );
}
