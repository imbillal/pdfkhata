"use client";

import { useCallback, useState } from "react";
import { Button, ErrorNote, FileDrop, FileRow, ResultBox, Sheet, SideSection, Workspace } from "@/components/kit";
import { PagePicker, ThumbsLoading, usePdfThumbs } from "@/components/PageThumbs";
import { useT } from "@/i18n/LocaleProvider";
import { downloadBytes, errorMessage, formatBytes, renameFile } from "@/lib/files";
import { PDF_MIME, loadPdfLib, savePdf } from "@/lib/pdf";

interface Result {
  bytes: Uint8Array;
  pages: number;
  removed: number;
}

export default function RemovePages() {
  const t = useT();
  const [file, setFile] = useState<File | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
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
      const doc = await loadPdfLib(file);
      const total = doc.getPageCount();
      const drop = [...selected].filter((p) => p >= 1 && p <= total).sort((a, b) => b - a);
      if (drop.length === 0) throw new Error(t({ en: "Pick at least one page to remove.", bn: "মুছতে অন্তত একটি পৃষ্ঠা বাছুন।" }));
      if (drop.length >= total) throw new Error(t({ en: "You can't remove every page. Leave at least one.", bn: "সব পৃষ্ঠা মোছা যাবে না। অন্তত একটি রাখুন।" }));
      for (const p of drop) doc.removePage(p - 1);
      setResult({ bytes: await savePdf(doc), pages: doc.getPageCount(), removed: drop.length });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }, [file, selected, t]);

  if (!file) {
    return (
      <FileDrop
        accept=".pdf,application/pdf"
        onFiles={pick}
        hint={t({ en: "Then click the pages you want gone.", bn: "তারপর যে পৃষ্ঠাগুলো বাদ দিতে চান সেগুলোতে ক্লিক করুন।" })}
      />
    );
  }

  const count = selected.size;
  const all = pageCount > 0 && count >= pageCount;

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
                tone="drop"
                rangeLabel={t({ en: "Pages to remove", bn: "যে পৃষ্ঠাগুলো মুছবেন" })}
              />
            )}
          </div>
        </Sheet>
      }
      side={
        <>
          <SideSection title={t({ en: "Remove pages", bn: "পৃষ্ঠা মুছুন" })}>
            <p className="text-sm text-ink-2">
              {count === 0
                ? t({ en: "No pages marked yet.", bn: "এখনো কোনো পৃষ্ঠা বাছা হয়নি।" })
                : t({
                    en: `${count} of ${pageCount} page${pageCount === 1 ? "" : "s"} marked. ${Math.max(0, pageCount - count)} will stay.`,
                    bn: `${t.n(pageCount)}টির মধ্যে ${t.n(count)}টি পৃষ্ঠা বাছা হয়েছে। ${t.n(Math.max(0, pageCount - count))}টি থাকবে।`,
                  })}
            </p>
            <Button onClick={run} busy={busy} disabled={count === 0 || all || !!loadError}>
              {count > 0
                ? t({ en: `Remove ${count} page${count === 1 ? "" : "s"}`, bn: `${t.n(count)}টি পৃষ্ঠা মুছুন` })
                : t({ en: "Remove pages", bn: "পৃষ্ঠা মুছুন" })}
            </Button>
            {all && <p className="text-xs text-margin">{t({ en: "That's every page. Leave at least one.", bn: "এগুলো সব পৃষ্ঠা। অন্তত একটি রাখুন।" })}</p>}
          </SideSection>
          <ErrorNote message={error} />
          {result && (
            <ResultBox
              title={t({ en: "Pages removed", bn: "পৃষ্ঠা মোছা হয়েছে" })}
              detail={t({
                en: `${result.removed} removed · ${result.pages} left · ${formatBytes(result.bytes.byteLength)}`,
                bn: `${t.n(result.removed)}টি মোছা হয়েছে · ${t.n(result.pages)}টি আছে · ${formatBytes(result.bytes.byteLength)}`,
              })}
            >
              <Button onClick={() => downloadBytes(result.bytes, renameFile(file.name, "-trimmed.pdf"), PDF_MIME)}>
                {t({ en: "Download PDF", bn: "PDF ডাউনলোড করুন" })}
              </Button>
            </ResultBox>
          )}
        </>
      }
    />
  );
}
