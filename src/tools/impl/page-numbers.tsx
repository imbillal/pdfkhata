"use client";

import { useCallback, useState } from "react";
import { Button, ErrorNote, Field, FileDrop, FileRow, ResultBox, Segmented, Sheet, SideSection, Workspace, inputClass } from "@/components/kit";
import { useT } from "@/i18n/LocaleProvider";
import { downloadBytes, errorMessage, formatBytes, renameFile } from "@/lib/files";
import { PDF_MIME, loadPdfLib, savePdf } from "@/lib/pdf";
import { pageFrame } from "@/lib/pdf-thumbs";

type Vertical = "top" | "bottom";
type Horizontal = "left" | "center" | "right";
type Format = "n" | "n-of-total" | "page-n-of-total";
type Digits = "en" | "bn";

const BN_DIGITS = "০১২৩৪৫৬৭৮৯";
const MARGIN = 28;

function digitsOf(n: number, digits: Digits): string {
  const s = String(n);
  return digits === "bn" ? s.replace(/\d/g, (d) => BN_DIGITS[Number(d)]) : s;
}

/**
 * The label as runs of text, each tagged with the font that can draw it.
 * pdf-lib doesn't shape Bangla, so Bangla output is digits only ("৩ / ১২");
 * the Bangla font has no "/", so that comes from Helvetica.
 */
function labelRuns(n: number, total: number, format: Format, digits: Digits): { text: string; bangla: boolean }[] {
  if (digits === "en") {
    const text = format === "n" ? `${n}` : format === "n-of-total" ? `${n} / ${total}` : `Page ${n} of ${total}`;
    return [{ text, bangla: false }];
  }
  if (format === "n") return [{ text: digitsOf(n, "bn"), bangla: true }];
  return [
    { text: digitsOf(n, "bn"), bangla: true },
    { text: " / ", bangla: false },
    { text: digitsOf(total, "bn"), bangla: true },
  ];
}

interface DigitGlyphs {
  /** Font units → points multiplier at size 1. */
  unit: number;
  glyphs: Map<string, { d: string; advance: number }>;
}

/** SVG path data from fontkit is y-up; pdf-lib's drawSvgPath expects y-down, so flip every y. */
function flipY(svg: string): string {
  let argIndex = 0;
  return svg.replace(/[A-Za-z]|-?\d*\.?\d+(?:e[-+]?\d+)?/g, (tok) => {
    if (/^[A-Za-z]$/.test(tok)) {
      argIndex = 0;
      return ` ${tok}`;
    }
    const out = argIndex % 2 === 1 ? String(-Number(tok)) : tok;
    argIndex++;
    return ` ${out}`;
  });
}

/**
 * Bangla digits are drawn as vector outlines straight from Noto Sans Bengali.
 * (Embedding the font would route the text through fontkit's Indic shaper,
 * which crashes in the browser build; digits need no shaping anyway.)
 */
async function loadBanglaDigits(): Promise<DigitGlyphs> {
  const res = await fetch("/fonts/NotoSansBengali-Regular.ttf");
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const mod = await import("@pdf-lib/fontkit");
  const fontkit = ("default" in mod ? mod.default : mod) as typeof import("@pdf-lib/fontkit");
  const font = fontkit.create(new Uint8Array(await res.arrayBuffer()));
  const glyphs = new Map<string, { d: string; advance: number }>();
  for (const ch of BN_DIGITS) {
    const g = font.glyphForCodePoint(ch.codePointAt(0) ?? 0);
    glyphs.set(ch, { d: flipY(g.path.toSVG()), advance: g.advanceWidth });
  }
  return { unit: 1 / font.unitsPerEm, glyphs };
}

const POSITIONS: { v: Vertical; h: Horizontal }[] = [
  { v: "top", h: "left" },
  { v: "top", h: "center" },
  { v: "top", h: "right" },
  { v: "bottom", h: "left" },
  { v: "bottom", h: "center" },
  { v: "bottom", h: "right" },
];

interface Result {
  bytes: Uint8Array;
  numbered: number;
}

export default function PageNumbers() {
  const t = useT();
  const [file, setFile] = useState<File | null>(null);
  const [vertical, setVertical] = useState<Vertical>("bottom");
  const [horizontal, setHorizontal] = useState<Horizontal>("center");
  const [format, setFormat] = useState<Format>("n");
  const [digits, setDigits] = useState<Digits>(t.locale === "bn" ? "bn" : "en");
  const [start, setStart] = useState("1");
  const [size, setSize] = useState(11);
  const [skipFirst, setSkipFirst] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const pick = useCallback((files: File[]) => {
    setFile(files[0] ?? null);
    setResult(null);
    setError(null);
  }, []);

  const startNum = Number(start);
  const startValid = Number.isInteger(startNum) && startNum >= 0 && startNum <= 99999;
  const effectiveFormat: Format = digits === "bn" && format === "page-n-of-total" ? "n-of-total" : format;

  const run = useCallback(async () => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      if (!startValid) throw new Error(t({ en: "The first number must be a whole number.", bn: "শুরুর সংখ্যা একটি পূর্ণ সংখ্যা হতে হবে।" }));
      const { StandardFonts, degrees, rgb } = await import("pdf-lib");
      const doc = await loadPdfLib(file);
      const latin = await doc.embedFont(StandardFonts.Helvetica);
      let bangla: DigitGlyphs | null = null;
      if (digits === "bn") {
        bangla = await loadBanglaDigits().catch(() => {
          throw new Error(t({ en: "Couldn't load the Bangla font. Check your connection and try again.", bn: "বাংলা ফন্ট লোড করা গেল না। ইন্টারনেট সংযোগ দেখে আবার চেষ্টা করুন।" }));
        });
      }
      const widthOf = (text: string, isBangla: boolean) =>
        isBangla && bangla
          ? [...text].reduce((w, ch) => w + (bangla?.glyphs.get(ch)?.advance ?? 0) * (bangla?.unit ?? 0) * size, 0)
          : latin.widthOfTextAtSize(text, size);

      const pages = doc.getPages();
      const first = skipFirst ? 1 : 0;
      const numberedCount = pages.length - first;
      if (numberedCount < 1) throw new Error(t({ en: "There are no pages left to number.", bn: "নম্বর দেওয়ার মতো কোনো পৃষ্ঠা নেই।" }));
      const total = startNum + numberedCount - 1;
      const color = rgb(0.15, 0.15, 0.15);

      for (let i = first; i < pages.length; i++) {
        const page = pages[i];
        const frame = pageFrame(page);
        const runs = labelRuns(startNum + (i - first), total, effectiveFormat, digits).map((r) => ({ ...r, width: widthOf(r.text, r.bangla) }));
        const width = runs.reduce((s, r) => s + r.width, 0);
        const margin = Math.min(MARGIN, frame.width / 6, frame.height / 6);
        const x = horizontal === "left" ? margin : horizontal === "right" ? frame.width - margin - width : (frame.width - width) / 2;
        const y = vertical === "bottom" ? margin : frame.height - margin - size * 0.72;

        // Lay runs along the on-screen baseline, then map into page space.
        let advance = 0;
        const rotate = degrees(frame.rotation);
        for (const r of runs) {
          if (r.bangla && bangla) {
            for (const ch of r.text) {
              const glyph = bangla.glyphs.get(ch);
              if (!glyph) continue;
              const at = frame.toPdf(x + advance, y);
              page.drawSvgPath(glyph.d, { x: at.x, y: at.y, scale: size * bangla.unit, rotate, color });
              advance += glyph.advance * bangla.unit * size;
            }
          } else {
            const at = frame.toPdf(x + advance, y);
            page.drawText(r.text, { x: at.x, y: at.y, size, font: latin, color, rotate });
            advance += r.width;
          }
        }
      }
      setResult({ bytes: await savePdf(doc), numbered: numberedCount });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }, [file, startValid, startNum, digits, skipFirst, effectiveFormat, size, horizontal, vertical, t]);

  if (!file) {
    return (
      <FileDrop
        accept=".pdf,application/pdf"
        onFiles={pick}
        hint={t({ en: "Add page numbers in English or Bangla digits.", bn: "ইংরেজি বা বাংলা অঙ্কে পৃষ্ঠা নম্বর বসান।" })}
      />
    );
  }

  const sample = labelRuns(startValid ? startNum : 1, startValid ? startNum + 11 : 12, effectiveFormat, digits)
    .map((r) => r.text)
    .join("");
  const reset = () => setResult(null);
  const posLabel = (p: { v: Vertical; h: Horizontal }) =>
    t({
      en: `${p.v === "top" ? "Top" : "Bottom"} ${p.h}`,
      bn: `${p.v === "top" ? "ওপরে" : "নিচে"} ${p.h === "left" ? "বাঁয়ে" : p.h === "right" ? "ডানে" : "মাঝখানে"}`,
    });

  return (
    <Workspace
      main={
        <Sheet>
          <FileRow file={file} onRemove={() => pick([])} />
          <div className="mt-6 flex flex-col items-center gap-3">
            <p className="text-sm font-medium text-ink-2">{t({ en: "Click where the number goes", bn: "নম্বর কোথায় বসবে, ক্লিক করুন" })}</p>
            <div className="relative aspect-[1/1.414] w-52 rounded-sm border border-rule-strong bg-paper shadow-sm sm:w-60">
              <div className="absolute inset-x-8 top-14 bottom-14 flex flex-col gap-2 opacity-60" aria-hidden>
                {Array.from({ length: 9 }, (_, i) => (
                  <span key={i} className={`h-1.5 rounded-full bg-rule ${i % 3 === 2 ? "w-2/3" : "w-full"}`} />
                ))}
              </div>
              {POSITIONS.map((p) => {
                const active = p.v === vertical && p.h === horizontal;
                return (
                  <button
                    key={`${p.v}-${p.h}`}
                    type="button"
                    aria-label={posLabel(p)}
                    aria-pressed={active}
                    onClick={() => {
                      setVertical(p.v);
                      setHorizontal(p.h);
                      reset();
                    }}
                    className={`absolute rounded px-1.5 py-0.5 font-mono text-[11px] whitespace-nowrap transition ${
                      p.v === "top" ? "top-2" : "bottom-2"
                    } ${p.h === "left" ? "left-2" : p.h === "right" ? "right-2" : "left-1/2 -translate-x-1/2"} ${
                      active ? "bg-margin text-white" : "border border-dashed border-rule-strong text-transparent hover:border-ink-3"
                    }`}
                  >
                    {active ? sample : "00"}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-ink-3">{posLabel({ v: vertical, h: horizontal })}</p>
          </div>
        </Sheet>
      }
      side={
        <>
          <SideSection title={t({ en: "Page numbers", bn: "পৃষ্ঠা নম্বর" })}>
            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-medium text-ink-2">{t({ en: "Digits", bn: "অঙ্ক" })}</p>
              <Segmented
                label={t({ en: "Digits", bn: "অঙ্ক" })}
                value={digits}
                onChange={(v) => {
                  setDigits(v);
                  reset();
                }}
                options={[
                  { value: "en", label: "1 2 3" },
                  { value: "bn", label: "১ ২ ৩" },
                ]}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-medium text-ink-2">{t({ en: "Format", bn: "ধরন" })}</p>
              <Segmented
                label={t({ en: "Format", bn: "ধরন" })}
                value={effectiveFormat}
                onChange={(v) => {
                  setFormat(v);
                  reset();
                }}
                options={[
                  { value: "n", label: digits === "bn" ? "১" : "1" },
                  { value: "n-of-total", label: digits === "bn" ? "১ / N" : "1 / N" },
                  ...(digits === "en" ? [{ value: "page-n-of-total" as const, label: "Page 1 of N" }] : []),
                ]}
              />
              {digits === "bn" && (
                <p className="text-xs text-ink-3">
                  {t({
                    en: "Bangla numbers are written as digits only, e.g. ৩ / ১২.",
                    bn: "বাংলায় শুধু অঙ্ক বসবে, যেমন ৩ / ১২।",
                  })}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label={t({ en: "Start at", bn: "শুরুর সংখ্যা" })}>
                {(id) => (
                  <input
                    id={id}
                    type="number"
                    min={0}
                    className={`${inputClass} ${startValid ? "" : "border-margin"}`}
                    value={start}
                    onChange={(e) => {
                      setStart(e.target.value);
                      reset();
                    }}
                  />
                )}
              </Field>
              <Field label={t({ en: `Size: ${size} pt`, bn: `আকার: ${t.n(size)} pt` })}>
                {(id) => (
                  <input
                    id={id}
                    type="range"
                    min={7}
                    max={28}
                    value={size}
                    onChange={(e) => {
                      setSize(Number(e.target.value));
                      reset();
                    }}
                    className="mt-2.5 w-full accent-margin"
                  />
                )}
              </Field>
            </div>
            <label className="flex items-center gap-2 text-sm text-ink-2">
              <input
                type="checkbox"
                checked={skipFirst}
                onChange={(e) => {
                  setSkipFirst(e.target.checked);
                  reset();
                }}
                className="size-4 accent-margin"
              />
              {t({ en: "Skip the first page (cover)", bn: "প্রথম পৃষ্ঠা (প্রচ্ছদ) বাদ দিন" })}
            </label>
            <Button onClick={run} busy={busy} disabled={!startValid}>
              {t({ en: "Add page numbers", bn: "পৃষ্ঠা নম্বর বসান" })}
            </Button>
          </SideSection>
          <ErrorNote message={error} />
          {result && (
            <ResultBox
              title={t({ en: "Numbers added", bn: "নম্বর বসানো হয়েছে" })}
              detail={t({
                en: `${result.numbered} page${result.numbered === 1 ? "" : "s"} numbered · ${formatBytes(result.bytes.byteLength)}`,
                bn: `${t.n(result.numbered)}টি পৃষ্ঠায় নম্বর · ${formatBytes(result.bytes.byteLength)}`,
              })}
            >
              <Button onClick={() => downloadBytes(result.bytes, renameFile(file.name, "-numbered.pdf"), PDF_MIME)}>
                {t({ en: "Download PDF", bn: "PDF ডাউনলোড করুন" })}
              </Button>
            </ResultBox>
          )}
        </>
      }
    />
  );
}
