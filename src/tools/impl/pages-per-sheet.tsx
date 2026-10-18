"use client";

import { useCallback, useState } from "react";
import { Button, ErrorNote, FileDrop, FileRow, Progress, ResultBox, Segmented, Sheet, SideSection, Workspace } from "@/components/kit";
import { useT } from "@/i18n/LocaleProvider";
import { downloadBytes, errorMessage, formatBytes, renameFile } from "@/lib/files";
import { PDF_MIME, loadPdfLib, savePdf } from "@/lib/pdf";
import { pageFrame } from "@/lib/pdf-thumbs";

type PerSheet = "2" | "4" | "6";
type Orientation = "portrait" | "landscape";

const A4 = { w: 595.28, h: 841.89 };
const MARGIN = 20;
const GAP = 10;

function grid(per: PerSheet, orientation: Orientation): { cols: number; rows: number } {
  const portrait = orientation === "portrait";
  if (per === "2") return portrait ? { cols: 1, rows: 2 } : { cols: 2, rows: 1 };
  if (per === "4") return { cols: 2, rows: 2 };
  return portrait ? { cols: 2, rows: 3 } : { cols: 3, rows: 2 };
}

interface Result {
  bytes: Uint8Array;
  sheets: number;
}

export default function PagesPerSheet() {
  const t = useT();
  const [file, setFile] = useState<File | null>(null);
  const [per, setPer] = useState<PerSheet>("2");
  const [orientation, setOrientation] = useState<Orientation>("landscape");
  const [borders, setBorders] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const pick = useCallback((files: File[]) => {
    setFile(files[0] ?? null);
    setResult(null);
    setError(null);
  }, []);

  const run = useCallback(async () => {
    if (!file) return;
    setBusy(true);
    setError(null);
    setProgress(0);
    try {
      const { PDFDocument, degrees, rgb } = await import("pdf-lib");
      const src = await loadPdfLib(file);
      const out = await PDFDocument.create();
      const srcPages = src.getPages();
      const embedded = await out.embedPages(
        srcPages,
        srcPages.map((p) => {
          const b = p.getCropBox();
          return { left: b.x, bottom: b.y, right: b.x + b.width, top: b.y + b.height };
        }),
      );

      const W = orientation === "portrait" ? A4.w : A4.h;
      const H = orientation === "portrait" ? A4.h : A4.w;
      const { cols, rows } = grid(per, orientation);
      const cellW = (W - 2 * MARGIN - (cols - 1) * GAP) / cols;
      const cellH = (H - 2 * MARGIN - (rows - 1) * GAP) / rows;
      const perSheet = cols * rows;

      let sheet = out.addPage([W, H]);
      for (let k = 0; k < srcPages.length; k++) {
        const slot = k % perSheet;
        if (k > 0 && slot === 0) sheet = out.addPage([W, H]);
        const col = slot % cols;
        const row = Math.floor(slot / cols);
        const cellX = MARGIN + col * (cellW + GAP);
        const cellY = H - MARGIN - (row + 1) * cellH - row * GAP;

        // Fit the page as the reader sees it (with its /Rotate) into the cell.
        const frame = pageFrame(srcPages[k]);
        const page = embedded[k];
        const s = Math.min(cellW / frame.width, cellH / frame.height);
        const bx = cellX + (cellW - frame.width * s) / 2;
        const by = cellY + (cellH - frame.height * s) / 2;
        const w = page.width * s;
        const h = page.height * s;
        // Undo the source rotation by drawing the embedded page turned the other way.
        const placement = {
          0: { x: bx, y: by, rotate: 0 },
          90: { x: bx, y: by + w, rotate: -90 },
          180: { x: bx + w, y: by + h, rotate: 180 },
          270: { x: bx + h, y: by, rotate: 90 },
        }[frame.rotation];
        sheet.drawPage(page, { x: placement.x, y: placement.y, xScale: s, yScale: s, rotate: degrees(placement.rotate) });
        if (borders) {
          sheet.drawRectangle({
            x: bx,
            y: by,
            width: frame.width * s,
            height: frame.height * s,
            borderColor: rgb(0.6, 0.6, 0.6),
            borderWidth: 0.5,
          });
        }
        if (k % 20 === 0) setProgress(k / srcPages.length);
      }
      setProgress(1);
      setResult({ bytes: await savePdf(out), sheets: out.getPageCount() });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }, [file, per, orientation, borders]);

  if (!file) {
    return (
      <FileDrop
        accept=".pdf,application/pdf"
        onFiles={pick}
        hint={t({ en: "Fit 2, 4 or 6 pages on each A4 sheet for printing.", bn: "ছাপার জন্য প্রতিটি A4 পাতায় ২, ৪ বা ৬টি পৃষ্ঠা বসান।" })}
      />
    );
  }

  const { cols, rows } = grid(per, orientation);
  const reset = () => setResult(null);

  return (
    <Workspace
      main={
        <Sheet>
          <FileRow file={file} onRemove={() => pick([])} />
          <div className="mt-6 flex flex-col items-center gap-3">
            <div
              className={`grid gap-1.5 rounded-sm border border-rule-strong bg-paper p-2.5 shadow-sm ${orientation === "portrait" ? "aspect-[1/1.414] w-40" : "aspect-[1.414/1] w-56"}`}
              style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }}
              aria-hidden
            >
              {Array.from({ length: cols * rows }, (_, i) => (
                <div key={i} className={`grid place-items-center rounded-[2px] bg-sheet font-mono text-xs text-ink-3 ${borders ? "border border-ink-3" : "border border-rule"}`}>
                  {t.n(i + 1)}
                </div>
              ))}
            </div>
            <p className="text-center text-xs text-ink-3">
              {t({
                en: "Pages flow left to right, top to bottom. Each page is scaled to fit its cell.",
                bn: "পৃষ্ঠাগুলো বাঁ থেকে ডানে, ওপর থেকে নিচে বসবে। প্রতিটি পৃষ্ঠা ঘরের মাপে ছোট করা হবে।",
              })}
            </p>
          </div>
        </Sheet>
      }
      side={
        <>
          <SideSection title={t({ en: "Layout", bn: "লেআউট" })}>
            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-medium text-ink-2">{t({ en: "Pages per sheet", bn: "প্রতি পাতায় পৃষ্ঠা" })}</p>
              <Segmented
                label={t({ en: "Pages per sheet", bn: "প্রতি পাতায় পৃষ্ঠা" })}
                value={per}
                onChange={(v) => {
                  setPer(v);
                  setOrientation(v === "2" ? "landscape" : "portrait");
                  reset();
                }}
                options={(["2", "4", "6"] as const).map((v) => ({ value: v, label: t.n(Number(v)) }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-medium text-ink-2">{t({ en: "Sheet (A4)", bn: "পাতা (A4)" })}</p>
              <Segmented
                label={t({ en: "Sheet orientation", bn: "পাতার দিক" })}
                value={orientation}
                onChange={(v) => {
                  setOrientation(v);
                  reset();
                }}
                options={[
                  { value: "portrait", label: t({ en: "Portrait", bn: "লম্বালম্বি" }) },
                  { value: "landscape", label: t({ en: "Landscape", bn: "আড়াআড়ি" }) },
                ]}
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-ink-2">
              <input
                type="checkbox"
                checked={borders}
                onChange={(e) => {
                  setBorders(e.target.checked);
                  reset();
                }}
                className="size-4 accent-margin"
              />
              {t({ en: "Draw a thin border around each page", bn: "প্রতিটি পৃষ্ঠার চারপাশে সরু বর্ডার দিন" })}
            </label>
            <Button onClick={run} busy={busy}>
              {t({ en: "Make sheets", bn: "পাতা তৈরি করুন" })}
            </Button>
            {busy && <Progress value={progress} label={t({ en: "Arranging pages…", bn: "পৃষ্ঠা সাজানো হচ্ছে…" })} />}
          </SideSection>
          <ErrorNote message={error} />
          {result && (
            <ResultBox
              title={t({ en: "Sheets ready", bn: "পাতা তৈরি" })}
              detail={t({
                en: `${result.sheets} sheet${result.sheets === 1 ? "" : "s"} · ${formatBytes(result.bytes.byteLength)}`,
                bn: `${t.n(result.sheets)}টি পাতা · ${formatBytes(result.bytes.byteLength)}`,
              })}
            >
              <Button onClick={() => downloadBytes(result.bytes, renameFile(file.name, `-${per}-up.pdf`), PDF_MIME)}>
                {t({ en: "Download PDF", bn: "PDF ডাউনলোড করুন" })}
              </Button>
            </ResultBox>
          )}
        </>
      }
    />
  );
}
