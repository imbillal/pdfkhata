"use client";

// Reference tool: other tools follow this shape (FileDrop → list → options rail → ResultBox).

import { useCallback, useState } from "react";
import { Button, ErrorNote, FileDrop, FileRow, ResultBox, Sheet, SideSection, Workspace } from "@/components/kit";
import { downloadBytes, errorMessage, formatBytes } from "@/lib/files";
import { PDF_MIME, loadPdfLib, savePdf } from "@/lib/pdf";
import { useT } from "@/i18n/LocaleProvider";

interface Result {
  bytes: Uint8Array;
  pages: number;
}

export default function MergePdf() {
  const t = useT();
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const addFiles = useCallback((added: File[]) => {
    setFiles((prev) => [...prev, ...added]);
    setResult(null);
  }, []);

  const move = useCallback((index: number, delta: number) => {
    setFiles((prev) => {
      const next = [...prev];
      const target = index + delta;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setResult(null);
  }, []);

  const remove = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setResult(null);
  }, []);

  const merge = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const out = await PDFDocument.create();
      for (const file of files) {
        const src = await loadPdfLib(file).catch((err: unknown) => {
          throw new Error(`${file.name}: ${errorMessage(err, t({ en: "couldn't be read as a PDF.", bn: "PDF হিসেবে পড়া যায়নি।" }))}`);
        });
        const pages = await out.copyPages(src, src.getPageIndices());
        pages.forEach((p) => out.addPage(p));
      }
      setResult({ bytes: await savePdf(out), pages: out.getPageCount() });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }, [files, t]);

  if (files.length === 0) {
    return <FileDrop accept=".pdf,application/pdf" multiple onFiles={addFiles} hint={t({ en: "Add two or more PDFs. You can reorder them next.", bn: "দুই বা তার বেশি PDF দিন। পরে ক্রম বদলাতে পারবেন।" })} />;
  }

  return (
    <Workspace
      main={
        <Sheet>
          <p className="mb-2 text-sm text-ink-3">{t({ en: "Files are merged top to bottom.", bn: "ফাইলগুলো ওপর থেকে নিচের ক্রমে জোড়া হবে।" })}</p>
          {files.map((file, i) => (
            <FileRow key={`${file.name}-${i}`} file={file} onRemove={() => remove(i)}>
              <Button variant="ghost" className="px-2 py-1" aria-label={t({ en: "Move up", bn: "ওপরে নিন" })} disabled={i === 0} onClick={() => move(i, -1)}>
                ↑
              </Button>
              <Button variant="ghost" className="px-2 py-1" aria-label={t({ en: "Move down", bn: "নিচে নিন" })} disabled={i === files.length - 1} onClick={() => move(i, 1)}>
                ↓
              </Button>
            </FileRow>
          ))}
          <div className="mt-4">
            <FileDrop accept=".pdf,application/pdf" multiple onFiles={addFiles} title={t({ en: "Add more PDFs", bn: "আরও PDF যোগ করুন" })} />
          </div>
        </Sheet>
      }
      side={
        <>
          <SideSection title={t({ en: "Merge", bn: "একত্র করা" })}>
            <p className="text-sm text-ink-2">
              {t({ en: `${files.length} file${files.length === 1 ? "" : "s"} ready.`, bn: `${t.n(files.length)}টি ফাইল প্রস্তুত।` })}
            </p>
            <Button onClick={merge} busy={busy} disabled={files.length < 2}>
              {t({ en: "Merge PDFs", bn: "PDF একত্র করুন" })}
            </Button>
            {files.length < 2 && <p className="text-xs text-ink-3">{t({ en: "Add at least one more PDF.", bn: "অন্তত আরও একটি PDF দিন।" })}</p>}
          </SideSection>
          <ErrorNote message={error} />
          {result && (
            <ResultBox
              title={t({ en: "Merged", bn: "একত্র হয়েছে" })}
              detail={`${t({ en: `${result.pages} pages`, bn: `${t.n(result.pages)} পৃষ্ঠা` })} · ${formatBytes(result.bytes.byteLength)}`}
            >
              <Button onClick={() => downloadBytes(result.bytes, "merged.pdf", PDF_MIME)}>{t({ en: "Download PDF", bn: "PDF ডাউনলোড করুন" })}</Button>
            </ResultBox>
          )}
        </>
      }
    />
  );
}
