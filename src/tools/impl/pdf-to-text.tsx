"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { Button, ErrorNote, FileDrop, FileRow, Progress, ResultBox, Segmented, Sheet, SideSection, TextArea, Workspace } from "@/components/kit";
import { downloadText, errorMessage, renameFile } from "@/lib/files";
import { loadPdfJs } from "@/lib/pdf";
import { useT } from "@/i18n/LocaleProvider";

/* ---------- Line reconstruction (pure; no DOM) ---------- */

// LAYOUT-START
/** The parts of a pdf.js TextItem that layout needs. */
export interface LayoutItem {
  str: string;
  /** PDF text matrix [a, b, c, d, e, f]; e/f are the baseline origin. */
  transform: number[];
  width: number;
  height: number;
  hasEOL: boolean;
}

/**
 * Turn one page's text items into readable lines.
 *
 * Items are kept in content-stream order (which follows reading order far better
 * than sorting the whole page, e.g. with columns). A new line starts when an item
 * says so (hasEOL) or its baseline moves by more than half a font size. Inside a
 * line, items are ordered left to right and a space is added where the visual gap
 * between two items is wider than a fraction of the font size. A noticeably larger
 * vertical jump becomes a blank line, so paragraphs survive.
 */
export function layoutText(items: LayoutItem[]): string {
  interface Run {
    x: number;
    end: number;
    str: string;
    size: number;
  }
  interface Line {
    y: number;
    size: number;
    runs: Run[];
  }

  const lines: Line[] = [];
  let current: Line | null = null;
  let breakAfter = false;

  for (const item of items) {
    const [a, b, c, d, x, y] = item.transform;
    const size = Math.abs(item.height) || Math.hypot(c, d) || Math.hypot(a, b) || 10;
    const str = item.str;

    if (str.trim().length > 0) {
      const sameLine = current !== null && !breakAfter && Math.abs(y - current.y) <= Math.max(current.size, size) * 0.5;
      if (!sameLine) {
        current = { y, size, runs: [] };
        lines.push(current);
      }
      const line = current as Line;
      line.size = Math.max(line.size, size);
      if (str.length > 0) line.runs.push({ x, end: x + item.width, str, size });
      breakAfter = false;
    }
    if (item.hasEOL) breakAfter = true;
  }

  const out: string[] = [];
  let prev: Line | null = null;
  for (const line of lines) {
    const runs = [...line.runs].sort((p, q) => p.x - q.x);
    let text = "";
    let lastEnd: number | null = null;
    for (const run of runs) {
      if (lastEnd !== null) {
        const gap = run.x - lastEnd;
        const needsSpace = gap > run.size * 0.18 && !/\s$/.test(text) && !/^\s/.test(run.str);
        // Wide gaps (table cells, tab stops) get a few spaces so columns stay apart.
        if (needsSpace) text += gap > run.size * 2 ? "    " : " ";
      }
      text += run.str;
      lastEnd = lastEnd === null ? run.end : Math.max(lastEnd, run.end);
    }
    text = text.replace(/\s+$/, "");

    if (prev) {
      const drop = prev.y - line.y;
      const lineHeight = Math.max(prev.size, line.size);
      // Big drop (paragraph gap) or a jump back up the page (next column/box).
      if (drop > lineHeight * 1.9 || drop < -lineHeight) out.push("");
    }
    out.push(text);
    prev = line;
  }

  return out
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
// LAYOUT-END

/* ---------- Tool ---------- */

interface PageText {
  page: number;
  text: string;
}

type Separators = "on" | "off";

export default function PdfToText() {
  const t = useT();
  const [file, setFile] = useState<File | null>(null);
  const [separators, setSeparators] = useState<Separators>("on");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pages, setPages] = useState<PageText[] | null>(null);
  const [copied, setCopied] = useState(false);

  const extract = useCallback(
    async (input: File) => {
      setBusy(true);
      setError(null);
      setPages(null);
      setProgress(0);
      let doc: Awaited<ReturnType<typeof loadPdfJs>> | null = null;
      try {
        doc = await loadPdfJs(input);
        const out: PageText[] = [];
        for (let n = 1; n <= doc.numPages; n++) {
          const page = await doc.getPage(n);
          const content = await page.getTextContent();
          const items: LayoutItem[] = [];
          for (const item of content.items) {
            if ("str" in item) items.push({ str: item.str, transform: item.transform as number[], width: item.width, height: item.height, hasEOL: item.hasEOL });
          }
          out.push({ page: n, text: layoutText(items) });
          page.cleanup();
          setProgress(n / doc.numPages);
        }
        setPages(out);
      } catch (err) {
        setError(errorMessage(err, t({ en: "This file couldn't be read as a PDF.", bn: "এই ফাইলটি PDF হিসেবে পড়া যায়নি।" })));
      } finally {
        await doc?.loadingTask.destroy();
        setBusy(false);
      }
    },
    [t],
  );

  const pick = useCallback(
    (files: File[]) => {
      const f = files[0];
      if (!f) return;
      setFile(f);
      void extract(f);
    },
    [extract],
  );

  const reset = useCallback(() => {
    setFile(null);
    setPages(null);
    setError(null);
  }, []);

  if (!file) {
    return (
      <FileDrop
        accept=".pdf,application/pdf"
        onFiles={pick}
        hint={t({ en: "Text is read from the PDF's own text layer, right in your browser.", bn: "PDF-এর নিজস্ব টেক্সট লেয়ার থেকে লেখা পড়া হয়, আপনার ব্রাউজারেই।" })}
      />
    );
  }

  const text = !pages
    ? ""
    : separators === "off"
      ? pages
          .map((p) => p.text)
          .filter(Boolean)
          .join("\n\n")
      : pages.map((p) => `--- ${t({ en: "Page", bn: "পৃষ্ঠা" })} ${t.n(p.page)} ---\n${p.text}`).join("\n\n");
  const charCount = pages ? pages.reduce((sum, p) => sum + p.text.replace(/\s/g, "").length, 0) : 0;
  const looksScanned = pages !== null && charCount < Math.max(20, pages.length * 25);
  const emptyPages = pages ? pages.filter((p) => !p.text.trim()).length : 0;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setError(t({ en: "Couldn't copy automatically. Select the text and copy it by hand.", bn: "স্বয়ংক্রিয়ভাবে কপি করা যায়নি। লেখাটি সিলেক্ট করে নিজে কপি করুন।" }));
    }
  };

  const copyLabel = copied ? t({ en: "Copied", bn: "কপি হয়েছে" }) : t({ en: "Copy text", bn: "লেখা কপি করুন" });
  const downloadLabel = t({ en: "Download .txt", bn: ".txt ডাউনলোড করুন" });
  const ocrLink = (
    <Link href={t.href("/tools/bangla-ocr/")} className="font-medium text-accent underline underline-offset-2">
      OCR
    </Link>
  );

  return (
    <Workspace
      main={
        <Sheet>
          <FileRow file={file} onRemove={busy ? undefined : reset} />
          <div className="mt-4">
            {busy && <Progress value={progress} label={t({ en: "Reading text…", bn: "লেখা পড়া হচ্ছে…" })} />}
            {pages && (
              <>
                {looksScanned && (
                  <p className="mb-3 rounded-md border border-rule-strong bg-paper-2 px-3 py-2 text-sm text-ink-2">
                    {charCount === 0 ? t({ en: "No text found.", bn: "কোনো লেখা পাওয়া যায়নি।" }) : t({ en: "Very little text found.", bn: "খুব সামান্য লেখা পাওয়া গেছে।" })}{" "}
                    {t.locale === "bn" ? (
                      <>স্ক্যান করা মনে হচ্ছে — পৃষ্ঠার ছবি থেকে লেখা পড়তে {ocrLink} ব্যবহার করে দেখুন।</>
                    ) : (
                      <>Looks scanned — try {ocrLink} to read text from the page images.</>
                    )}
                  </p>
                )}
                <TextArea readOnly value={text} aria-label={t({ en: "Extracted text", bn: "বের করা লেখা" })} className="min-h-[28rem]" spellCheck={false} />
              </>
            )}
          </div>
        </Sheet>
      }
      side={
        <>
          <SideSection title={t({ en: "Output", bn: "আউটপুট" })}>
            <Segmented
              label={t({ en: "Page separators", bn: "পৃষ্ঠা বিভাজক" })}
              value={separators}
              onChange={setSeparators}
              options={[
                { value: "on", label: t({ en: "Page markers", bn: "পৃষ্ঠা চিহ্নসহ" }) },
                { value: "off", label: t({ en: "Plain", bn: "শুধু লেখা" }) },
              ]}
            />
            <p className="text-xs text-ink-3">
              {t({
                en: "Bangla from older PDFs may come out garbled if the PDF uses a Bijoy font. Paste it into ",
                bn: "পুরোনো PDF বিজয় ফন্টে লেখা হলে বাংলা ভেঙে আসতে পারে। তখন লেখাটি ",
              })}
              <Link href={t.href("/tools/bijoy-to-unicode/")} className="text-accent underline underline-offset-2">
                {t({ en: "Bijoy → Unicode", bn: "বিজয় → ইউনিকোড" })}
              </Link>
              {t({ en: ".", bn: "-এ পেস্ট করুন।" })}
            </p>
          </SideSection>
          <ErrorNote message={error} />
          {pages && !looksScanned && (
            <ResultBox
              title={t({ en: "Text extracted", bn: "লেখা বের করা হয়েছে" })}
              detail={t({
                en: `${t.n(pages.length)} page${pages.length === 1 ? "" : "s"} · ${t.n(text.length)} characters${emptyPages ? ` · ${t.n(emptyPages)} without text` : ""}`,
                bn: `${t.n(pages.length)} পৃষ্ঠা · ${t.n(text.length)} অক্ষর${emptyPages ? ` · ${t.n(emptyPages)}টিতে লেখা নেই` : ""}`,
              })}
            >
              <Button onClick={copy}>{copyLabel}</Button>
              <Button variant="secondary" onClick={() => downloadText(text, renameFile(file.name, ".txt"))}>
                {downloadLabel}
              </Button>
            </ResultBox>
          )}
          {pages && looksScanned && charCount > 0 && (
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={copy}>
                {copyLabel}
              </Button>
              <Button variant="secondary" onClick={() => downloadText(text, renameFile(file.name, ".txt"))}>
                {downloadLabel}
              </Button>
            </div>
          )}
        </>
      }
    />
  );
}
