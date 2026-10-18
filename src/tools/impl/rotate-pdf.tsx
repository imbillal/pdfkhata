"use client";

import { useCallback, useState } from "react";
import { Button, ErrorNote, Field, FileDrop, FileRow, ResultBox, Segmented, Sheet, SideSection, Workspace, inputClass } from "@/components/kit";
import { PageThumb, ThumbGrid, ThumbsLoading, usePdfThumbs } from "@/components/PageThumbs";
import { useT } from "@/i18n/LocaleProvider";
import { downloadBytes, errorMessage, formatBytes, renameFile } from "@/lib/files";
import { PDF_MIME, loadPdfLib, parsePageRanges, savePdf } from "@/lib/pdf";
import { formatRanges, quarterTurn } from "@/lib/pdf-thumbs";

type Angle = "90" | "180" | "270";
type Scope = "all" | "some";

interface Result {
  bytes: Uint8Array;
  rotated: number;
}

export default function RotatePdf() {
  const t = useT();
  const [file, setFile] = useState<File | null>(null);
  const [angle, setAngle] = useState<Angle>("90");
  const [scope, setScope] = useState<Scope>("all");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const { thumbs, pageCount, error: loadError, loading } = usePdfThumbs(file);

  const pick = useCallback((files: File[]) => {
    setFile(files[0] ?? null);
    setText("");
    setResult(null);
    setError(null);
  }, []);

  // Selected pages are derived from the text field, so typing and clicking stay in sync.
  let selected: Set<number> = new Set();
  let rangeError: string | null = null;
  if (scope === "some" && pageCount > 0) {
    try {
      selected = new Set(parsePageRanges(text, pageCount));
    } catch (err) {
      rangeError = errorMessage(err);
    }
  }
  const affects = (p: number) => scope === "all" || selected.has(p);
  const targetCount = scope === "all" ? pageCount : selected.size;

  const toggle = (p: number) => {
    const next = new Set(selected);
    if (next.has(p)) next.delete(p);
    else next.add(p);
    setScope("some");
    setText(formatRanges(next));
    setResult(null);
  };

  const run = useCallback(async () => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const { degrees } = await import("pdf-lib");
      const doc = await loadPdfLib(file);
      const total = doc.getPageCount();
      const targets = scope === "all" ? doc.getPageIndices().map((i) => i + 1) : parsePageRanges(text, total);
      if (targets.length === 0) throw new Error(t({ en: "Choose at least one page to rotate.", bn: "ঘোরাতে অন্তত একটি পৃষ্ঠা বাছুন।" }));
      for (const p of targets) {
        const page = doc.getPage(p - 1);
        page.setRotation(degrees(quarterTurn(page.getRotation().angle + Number(angle))));
      }
      setResult({ bytes: await savePdf(doc), rotated: targets.length });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }, [file, scope, text, angle, t]);

  if (!file) {
    return (
      <FileDrop
        accept=".pdf,application/pdf"
        onFiles={pick}
        hint={t({ en: "Turn every page or only the ones you choose.", bn: "সব পৃষ্ঠা অথবা শুধু বাছাই করা পৃষ্ঠা ঘোরান।" })}
      />
    );
  }

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
                  {t({ en: "Click a page to rotate only the pages you pick.", bn: "শুধু নির্দিষ্ট পৃষ্ঠা ঘোরাতে সেগুলোতে ক্লিক করুন।" })}
                </p>
                <ThumbGrid>
                  {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
                    <PageThumb
                      key={p}
                      src={thumbs[p - 1]}
                      pageNumber={p}
                      rotation={affects(p) ? Number(angle === "270" ? -90 : angle) : 0}
                      tone={scope === "some" && selected.has(p) ? "keep" : "plain"}
                      onClick={() => toggle(p)}
                    />
                  ))}
                </ThumbGrid>
              </>
            )}
          </div>
        </Sheet>
      }
      side={
        <>
          <SideSection title={t({ en: "Rotate", bn: "ঘোরান" })}>
            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-medium text-ink-2">{t({ en: "Direction", bn: "দিক" })}</p>
                <Segmented
                  label={t({ en: "Direction", bn: "দিক" })}
                  value={angle}
                  onChange={(v) => {
                    setAngle(v);
                    setResult(null);
                  }}
                  options={[
                    { value: "270", label: t({ en: "↺ 90° left", bn: "↺ ৯০° বাঁয়ে" }) },
                    { value: "180", label: "180°" },
                    { value: "90", label: t({ en: "90° right ↻", bn: "৯০° ডানে ↻" }) },
                  ]}
                />
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-medium text-ink-2">{t({ en: "Pages", bn: "পৃষ্ঠা" })}</p>
                <Segmented
                  label={t({ en: "Pages", bn: "পৃষ্ঠা" })}
                  value={scope}
                  onChange={(v) => {
                    setScope(v);
                    setResult(null);
                  }}
                  options={[
                    { value: "all", label: t({ en: "All pages", bn: "সব পৃষ্ঠা" }) },
                    { value: "some", label: t({ en: "Some pages", bn: "কিছু পৃষ্ঠা" }) },
                  ]}
                />
            </div>
            {scope === "some" && (
              <Field label={t({ en: "Pages to rotate", bn: "যে পৃষ্ঠাগুলো ঘোরাবেন" })} hint={rangeError ?? t({ en: "e.g. 1-3, 8", bn: "যেমন 1-3, 8" })}>
                {(id) => (
                  <input
                    id={id}
                    className={`${inputClass} font-mono ${rangeError ? "border-margin" : ""}`}
                    value={text}
                    placeholder="1-3, 8"
                    aria-invalid={!!rangeError}
                    onChange={(e) => {
                      setText(e.target.value);
                      setResult(null);
                    }}
                  />
                )}
              </Field>
            )}
            <Button onClick={run} busy={busy} disabled={pageCount === 0 || targetCount === 0 || !!rangeError || !!loadError}>
              {scope === "all"
                ? t({ en: "Rotate all pages", bn: "সব পৃষ্ঠা ঘোরান" })
                : t({ en: `Rotate ${targetCount} page${targetCount === 1 ? "" : "s"}`, bn: `${t.n(targetCount)}টি পৃষ্ঠা ঘোরান` })}
            </Button>
          </SideSection>
          <ErrorNote message={error} />
          {result && (
            <ResultBox
              title={t({ en: "Pages rotated", bn: "পৃষ্ঠা ঘোরানো হয়েছে" })}
              detail={t({
                en: `${result.rotated} page${result.rotated === 1 ? "" : "s"} turned · ${formatBytes(result.bytes.byteLength)}`,
                bn: `${t.n(result.rotated)}টি পৃষ্ঠা ঘোরানো হয়েছে · ${formatBytes(result.bytes.byteLength)}`,
              })}
            >
              <Button onClick={() => downloadBytes(result.bytes, renameFile(file.name, "-rotated.pdf"), PDF_MIME)}>
                {t({ en: "Download PDF", bn: "PDF ডাউনলোড করুন" })}
              </Button>
            </ResultBox>
          )}
        </>
      }
    />
  );
}
