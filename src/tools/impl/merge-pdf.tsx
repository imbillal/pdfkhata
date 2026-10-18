"use client";

// Reference tool: other tools follow this shape (FileDrop → list → options rail → ResultBox).

import { useCallback, useState } from "react";
import { Button, ErrorNote, FileDrop, FileRow, ResultBox, Sheet, SideSection, Workspace } from "@/components/kit";
import { downloadBytes, errorMessage, formatBytes } from "@/lib/files";
import { PDF_MIME, loadPdfLib, savePdf } from "@/lib/pdf";

interface Result {
  bytes: Uint8Array;
  pages: number;
}

export default function MergePdf() {
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
          throw new Error(`${file.name}: ${errorMessage(err, "couldn't be read as a PDF.")}`);
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
  }, [files]);

  if (files.length === 0) {
    return <FileDrop accept=".pdf,application/pdf" multiple onFiles={addFiles} hint="Add two or more PDFs. You can reorder them next." />;
  }

  return (
    <Workspace
      main={
        <Sheet>
          <p className="mb-2 text-sm text-ink-3">Files are merged top to bottom.</p>
          {files.map((file, i) => (
            <FileRow key={`${file.name}-${i}`} file={file} onRemove={() => remove(i)}>
              <Button variant="ghost" className="px-2 py-1" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)}>
                ↑
              </Button>
              <Button variant="ghost" className="px-2 py-1" aria-label="Move down" disabled={i === files.length - 1} onClick={() => move(i, 1)}>
                ↓
              </Button>
            </FileRow>
          ))}
          <div className="mt-4">
            <FileDrop accept=".pdf,application/pdf" multiple onFiles={addFiles} title="Add more PDFs" />
          </div>
        </Sheet>
      }
      side={
        <>
          <SideSection title="Merge">
            <p className="text-sm text-ink-2">
              {files.length} file{files.length === 1 ? "" : "s"} ready.
            </p>
            <Button onClick={merge} busy={busy} disabled={files.length < 2}>
              Merge PDFs
            </Button>
            {files.length < 2 && <p className="text-xs text-ink-3">Add at least one more PDF.</p>}
          </SideSection>
          <ErrorNote message={error} />
          {result && (
            <ResultBox title="Merged" detail={`${result.pages} pages · ${formatBytes(result.bytes.byteLength)}`}>
              <Button onClick={() => downloadBytes(result.bytes, "merged.pdf", PDF_MIME)}>Download PDF</Button>
            </ResultBox>
          )}
        </>
      }
    />
  );
}
