"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, ErrorNote, Field, FileDrop, FileRow, ResultBox, Segmented, Sheet, SideSection, Workspace, inputClass } from "@/components/kit";
import { useT } from "@/i18n/LocaleProvider";
import { downloadBytes, errorMessage, formatBytes, renameFile } from "@/lib/files";
import { PDF_MIME, loadPdfJs, loadPdfLib, renderPage, savePdf } from "@/lib/pdf";
import { pageFrame, rotateVec } from "@/lib/pdf-thumbs";

type Placement = "center" | "tiled";

const COLORS = [
  { id: "grey", rgb: [0.55, 0.55, 0.55], en: "Grey", bn: "ধূসর" },
  { id: "red", rgb: [0.78, 0.22, 0.17], en: "Red", bn: "লাল" },
  { id: "blue", rgb: [0.12, 0.3, 0.6], en: "Blue", bn: "নীল" },
  { id: "green", rgb: [0.15, 0.5, 0.3], en: "Green", bn: "সবুজ" },
  { id: "black", rgb: [0.1, 0.1, 0.1], en: "Black", bn: "কালো" },
] as const;
type ColorId = (typeof COLORS)[number]["id"];

const cssColor = (c: readonly number[]) => `rgb(${c.map((v) => Math.round(v * 255)).join(" ")})`;

/** Helvetica covers Latin-1 (WinAnsi) only. */
const NON_LATIN = /[^ -~ -ÿ]/;

/**
 * Centres of each copy of the watermark, in on-screen page points with the
 * origin at the bottom-left (y up). Tiled copies run in rows along the text's angle.
 */
function layout(W: number, H: number, textWidth: number, size: number, angle: number, placement: Placement): { x: number; y: number }[] {
  const cx = W / 2;
  const cy = H / 2;
  if (placement === "center") return [{ x: cx, y: cy }];
  const stepX = Math.max(textWidth + size * 2.5, size * 4);
  const stepY = size * 4.5;
  const reach = Math.hypot(W, H);
  const nx = Math.ceil(reach / stepX) + 1;
  const ny = Math.ceil(reach / stepY) + 1;
  const pad = textWidth / 2 + size;
  const out: { x: number; y: number }[] = [];
  for (let j = -ny; j <= ny; j++) {
    for (let i = -nx; i <= nx; i++) {
      const off = rotateVec(i * stepX + (j % 2 ? stepX / 2 : 0), j * stepY, angle);
      const x = cx + off.x;
      const y = cy + off.y;
      if (x > -pad && x < W + pad && y > -pad && y < H + pad) out.push({ x, y });
    }
  }
  return out;
}

interface Preview {
  src: string;
  width: number;
  height: number;
}

interface Result {
  bytes: Uint8Array;
  pages: number;
}

export default function WatermarkPdf() {
  const t = useT();
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("CONFIDENTIAL");
  const [size, setSize] = useState(56);
  const [opacity, setOpacity] = useState(0.25);
  const [angle, setAngle] = useState(45);
  const [color, setColor] = useState<ColorId>("grey");
  const [placement, setPlacement] = useState<Placement>("center");
  const [preview, setPreview] = useState<{ file: File; data: Preview } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const pick = useCallback((files: File[]) => {
    setFile(files[0] ?? null);
    setResult(null);
    setError(null);
  }, []);

  // Render page 1 once per file for the live preview.
  useEffect(() => {
    if (!file) return;
    let cancelled = false;
    let destroy: (() => void) | null = null;
    (async () => {
      try {
        const doc = await loadPdfJs(file);
        destroy = () => void doc.loadingTask.destroy();
        if (cancelled) return destroy();
        const page = await doc.getPage(1);
        const vp = page.getViewport({ scale: 1 });
        const canvas = await renderPage(doc, 1, Math.min(2, 900 / vp.width));
        if (cancelled) return;
        setPreview({ file, data: { src: canvas.toDataURL("image/jpeg", 0.85), width: vp.width, height: vp.height } });
      } catch (err) {
        if (!cancelled) setError(errorMessage(err));
      }
    })();
    return () => {
      cancelled = true;
      destroy?.();
    };
  }, [file]);

  const rgbColor = COLORS.find((c) => c.id === color)?.rgb ?? COLORS[0].rgb;
  const latinOnly = !NON_LATIN.test(text);
  const page1 = preview && preview.file === file ? preview.data : null;

  // Approximate Helvetica Bold width for the preview; the PDF uses exact metrics.
  const previewWidth = useMemo(() => {
    if (typeof document === "undefined") return text.length * size * 0.6;
    const ctx = document.createElement("canvas").getContext("2d");
    if (!ctx) return text.length * size * 0.6;
    ctx.font = `bold ${size}px Helvetica, Arial, sans-serif`;
    return ctx.measureText(text).width;
  }, [text, size]);

  const run = useCallback(async () => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const label = text.trim();
      if (!label) throw new Error(t({ en: "Type the watermark text first.", bn: "আগে ওয়াটারমার্কের লেখা দিন।" }));
      if (NON_LATIN.test(label)) throw new Error(t({ en: "Use English (Latin) letters only.", bn: "শুধু ইংরেজি (ল্যাটিন) অক্ষর ব্যবহার করুন।" }));
      const { StandardFonts, degrees, rgb } = await import("pdf-lib");
      const doc = await loadPdfLib(file);
      const font = await doc.embedFont(StandardFonts.HelveticaBold);
      const textWidth = font.widthOfTextAtSize(label, size);
      const ink = rgb(rgbColor[0], rgbColor[1], rgbColor[2]);
      for (const page of doc.getPages()) {
        const frame = pageFrame(page);
        for (const c of layout(frame.width, frame.height, textWidth, size, angle, placement)) {
          // Start of the baseline so the text's centre lands on c, then into page space.
          const back = rotateVec(-textWidth / 2, -size * 0.36, angle);
          const at = frame.toPdf(c.x + back.x, c.y + back.y);
          page.drawText(label, { x: at.x, y: at.y, size, font, color: ink, opacity, rotate: degrees(frame.rotation + angle) });
        }
      }
      setResult({ bytes: await savePdf(doc), pages: doc.getPageCount() });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }, [file, text, size, angle, placement, opacity, rgbColor, t]);

  if (!file) {
    return (
      <FileDrop
        accept=".pdf,application/pdf"
        onFiles={pick}
        hint={t({ en: "Stamp text like DRAFT or CONFIDENTIAL across every page.", bn: "প্রতিটি পৃষ্ঠায় DRAFT বা CONFIDENTIAL-এর মতো লেখা বসান।" })}
      />
    );
  }

  const reset = () => setResult(null);
  const marks = page1 ? layout(page1.width, page1.height, previewWidth, size, angle, placement) : [];

  return (
    <Workspace
      main={
        <Sheet>
          <FileRow file={file} onRemove={() => pick([])} />
          <div className="mt-4 flex justify-center">
            {page1 ? (
              <div className="relative w-full max-w-md overflow-hidden border border-rule shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element -- rendered page preview */}
                <img src={page1.src} alt={t({ en: "Page 1 preview", bn: "১ নম্বর পৃষ্ঠার প্রিভিউ" })} className="block w-full" />
                <svg viewBox={`0 0 ${page1.width} ${page1.height}`} className="absolute inset-0 size-full" aria-hidden>
                  {marks.map((m, i) => {
                    const x = m.x;
                    const y = page1.height - m.y;
                    return (
                      <text
                        key={i}
                        x={x}
                        y={y}
                        textAnchor="middle"
                        dominantBaseline="central"
                        transform={`rotate(${-angle} ${x} ${y})`}
                        fontFamily="Helvetica, Arial, sans-serif"
                        fontWeight="bold"
                        fontSize={size}
                        fill={cssColor(rgbColor)}
                        fillOpacity={opacity}
                      >
                        {text}
                      </text>
                    );
                  })}
                </svg>
              </div>
            ) : (
              !error && <p className="py-10 text-sm text-ink-3">{t({ en: "Preparing preview…", bn: "প্রিভিউ তৈরি হচ্ছে…" })}</p>
            )}
          </div>
          {page1 && <p className="mt-2 text-center text-xs text-ink-3">{t({ en: "Preview of page 1. Every page gets the same mark.", bn: "১ নম্বর পৃষ্ঠার প্রিভিউ। প্রতিটি পৃষ্ঠায় একই চিহ্ন বসবে।" })}</p>}
        </Sheet>
      }
      side={
        <>
          <SideSection title={t({ en: "Watermark", bn: "ওয়াটারমার্ক" })}>
            <Field
              label={t({ en: "Text", bn: "লেখা" })}
              hint={
                latinOnly
                  ? t({ en: "English (Latin) letters only. Bangla text isn't supported here.", bn: "শুধু ইংরেজি (ল্যাটিন) অক্ষর। এখানে বাংলা লেখা সমর্থিত নয়।" })
                  : t({ en: "This text has letters the PDF font can't draw. Use English (Latin) letters.", bn: "এই লেখায় এমন অক্ষর আছে যা PDF ফন্টে নেই। ইংরেজি (ল্যাটিন) অক্ষর ব্যবহার করুন।" })
              }
            >
              {(id) => (
                <input
                  id={id}
                  className={`${inputClass} ${latinOnly ? "" : "border-margin"}`}
                  value={text}
                  maxLength={80}
                  onChange={(e) => {
                    setText(e.target.value);
                    reset();
                  }}
                />
              )}
            </Field>
            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-medium text-ink-2">{t({ en: "Placement", bn: "অবস্থান" })}</p>
              <Segmented
                label={t({ en: "Placement", bn: "অবস্থান" })}
                value={placement}
                onChange={(v) => {
                  setPlacement(v);
                  reset();
                }}
                options={[
                  { value: "center", label: t({ en: "Centre", bn: "মাঝখানে" }) },
                  { value: "tiled", label: t({ en: "Tiled", bn: "পুরো পাতায়" }) },
                ]}
              />
            </div>
            <Field label={t({ en: `Size: ${size} pt`, bn: `আকার: ${t.n(size)} pt` })}>
              {(id) => (
                <input
                  id={id}
                  type="range"
                  min={16}
                  max={140}
                  value={size}
                  onChange={(e) => {
                    setSize(Number(e.target.value));
                    reset();
                  }}
                  className="w-full accent-margin"
                />
              )}
            </Field>
            <Field label={t({ en: `Opacity: ${Math.round(opacity * 100)}%`, bn: `স্বচ্ছতা: ${t.n(Math.round(opacity * 100))}%` })}>
              {(id) => (
                <input
                  id={id}
                  type="range"
                  min={5}
                  max={100}
                  value={Math.round(opacity * 100)}
                  onChange={(e) => {
                    setOpacity(Number(e.target.value) / 100);
                    reset();
                  }}
                  className="w-full accent-margin"
                />
              )}
            </Field>
            <Field label={t({ en: `Angle: ${angle}°`, bn: `কোণ: ${t.n(angle)}°` })}>
              {(id) => (
                <input
                  id={id}
                  type="range"
                  min={-90}
                  max={90}
                  step={5}
                  value={angle}
                  onChange={(e) => {
                    setAngle(Number(e.target.value));
                    reset();
                  }}
                  className="w-full accent-margin"
                />
              )}
            </Field>
            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-medium text-ink-2">{t({ en: "Colour", bn: "রং" })}</p>
              <div role="radiogroup" aria-label={t({ en: "Colour", bn: "রং" })} className="flex flex-wrap gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    role="radio"
                    aria-checked={color === c.id}
                    aria-label={t({ en: c.en, bn: c.bn })}
                    title={t({ en: c.en, bn: c.bn })}
                    onClick={() => {
                      setColor(c.id);
                      reset();
                    }}
                    className={`size-8 rounded-full border-2 transition ${color === c.id ? "border-ink ring-2 ring-margin-soft" : "border-rule"}`}
                    style={{ backgroundColor: cssColor(c.rgb) }}
                  />
                ))}
              </div>
            </div>
            <Button onClick={run} busy={busy} disabled={!text.trim() || !latinOnly}>
              {t({ en: "Add watermark", bn: "ওয়াটারমার্ক বসান" })}
            </Button>
          </SideSection>
          <ErrorNote message={error} />
          {result && (
            <ResultBox
              title={t({ en: "Watermark added", bn: "ওয়াটারমার্ক বসানো হয়েছে" })}
              detail={t({
                en: `${result.pages} page${result.pages === 1 ? "" : "s"} · ${formatBytes(result.bytes.byteLength)}`,
                bn: `${t.n(result.pages)}টি পৃষ্ঠা · ${formatBytes(result.bytes.byteLength)}`,
              })}
            >
              <Button onClick={() => downloadBytes(result.bytes, renameFile(file.name, "-watermarked.pdf"), PDF_MIME)}>
                {t({ en: "Download PDF", bn: "PDF ডাউনলোড করুন" })}
              </Button>
            </ResultBox>
          )}
        </>
      }
    />
  );
}
