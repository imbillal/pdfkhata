"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { Button, ErrorNote, Field, FileDrop, FileRow, ResultBox, Segmented, Sheet, SideSection, Workspace, inputClass } from "@/components/kit";
import { useT } from "@/i18n/LocaleProvider";
import { downloadBytes, errorMessage, formatBytes, renameFile } from "@/lib/files";
import { loadImage, makeCanvas } from "@/lib/image";
import { PDF_MIME, loadPdfJs, loadPdfLib, renderPage, savePdf } from "@/lib/pdf";
import { pageFrame } from "@/lib/pdf-thumbs";

type Mode = "draw" | "type" | "upload";
type Ink = "black" | "blue";
type Script = "script" | "chancery" | "plain";
type ApplyTo = "this" | "all";

const INK: Record<Ink, string> = { black: "#111111", blue: "#1c3f94" };
const SCRIPTS: Record<Exclude<Script, "plain">, string> = {
  script: `"Segoe Script", "Brush Script MT", "Snell Roundhand", "Bradley Hand", cursive`,
  chancery: `"Lucida Handwriting", "Apple Chancery", "URW Chancery L", "Comic Sans MS", cursive`,
};

/** A signature image ready to place: PNG data URL plus its pixel size. */
interface Signature {
  url: string;
  width: number;
  height: number;
}

/** Signature box in fractions of the on-screen page: top-left corner and width. */
interface Box {
  x: number;
  y: number;
  w: number;
}

interface Point {
  x: number;
  y: number;
}

/** Crop a canvas to its non-transparent pixels (plus a little padding) and export as PNG. */
function trimToSignature(canvas: HTMLCanvasElement): Signature | null {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const { width, height } = canvas;
  const data = ctx.getImageData(0, 0, width, height).data;
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > 8) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) return null;
  const pad = 6;
  const sx = Math.max(0, minX - pad);
  const sy = Math.max(0, minY - pad);
  const sw = Math.min(width, maxX + pad + 1) - sx;
  const sh = Math.min(height, maxY + pad + 1) - sy;
  const [out, octx] = makeCanvas(sw, sh);
  octx.drawImage(canvas, sx, sy, sw, sh, 0, 0, sw, sh);
  return { url: out.toDataURL("image/png"), width: sw, height: sh };
}

function renderTyped(name: string, script: Script, ink: Ink): Signature | null {
  if (typeof document === "undefined" || !name.trim()) return null;
  const family =
    script === "plain" ? getComputedStyle(document.body).fontFamily || "sans-serif" : SCRIPTS[script];
  const size = 120;
  const font = `${script === "plain" ? "500" : "400"} ${size}px ${family}`;
  const [probe, pctx] = makeCanvas(1, 1);
  pctx.font = font;
  const textWidth = Math.ceil(pctx.measureText(name).width);
  probe.width = 0;
  const [canvas, ctx] = makeCanvas(textWidth + size, size * 2);
  ctx.font = font;
  ctx.fillStyle = INK[ink];
  ctx.textBaseline = "middle";
  ctx.fillText(name, size / 2, size);
  return trimToSignature(canvas);
}

async function renderUpload(file: File, removeWhite: boolean): Promise<Signature | null> {
  const img = await loadImage(file);
  const scale = Math.min(1, 1600 / Math.max(img.naturalWidth, img.naturalHeight));
  const [canvas, ctx] = makeCanvas(img.naturalWidth * scale, img.naturalHeight * scale);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  if (removeWhite) {
    const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = image.data;
    for (let i = 0; i < d.length; i += 4) {
      // Fade near-white paper to transparent; keep the ink.
      const light = Math.min(d[i], d[i + 1], d[i + 2]);
      if (light > 235) d[i + 3] = 0;
      else if (light > 190) d[i + 3] = Math.round((d[i + 3] * (235 - light)) / 45);
    }
    ctx.putImageData(image, 0, 0);
  }
  return trimToSignature(canvas);
}

/* ---------- Drawing pad ---------- */

const PAD_W = 1200;
const PAD_H = 400;

function SignaturePad({ ink, onChange, clearLabel, hint }: { ink: Ink; onChange: (sig: Signature | null) => void; clearLabel: string; hint: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const strokes = useRef<Point[][]>([]);
  const drawing = useRef(false);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = INK[ink];
    ctx.fillStyle = INK[ink];
    ctx.lineWidth = 7;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (const s of strokes.current) {
      if (s.length === 1) {
        ctx.beginPath();
        ctx.arc(s[0].x, s[0].y, 3.5, 0, Math.PI * 2);
        ctx.fill();
        continue;
      }
      ctx.beginPath();
      ctx.moveTo(s[0].x, s[0].y);
      // Smooth through midpoints so fast strokes don't look jagged.
      for (let i = 1; i < s.length - 1; i++) {
        const mx = (s[i].x + s[i + 1].x) / 2;
        const my = (s[i].y + s[i + 1].y) / 2;
        ctx.quadraticCurveTo(s[i].x, s[i].y, mx, my);
      }
      const last = s[s.length - 1];
      ctx.lineTo(last.x, last.y);
      ctx.stroke();
    }
  }, [ink]);

  // Re-ink existing strokes when the colour changes.
  useEffect(() => {
    redraw();
    const canvas = canvasRef.current;
    if (canvas && strokes.current.length > 0) onChange(trimToSignature(canvas));
  }, [redraw, onChange]);

  const point = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: ((e.clientX - rect.left) / rect.width) * PAD_W, y: ((e.clientY - rect.top) / rect.height) * PAD_H };
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={PAD_W}
          height={PAD_H}
          className="block aspect-[3/1] w-full cursor-crosshair touch-none rounded-md border border-rule-strong bg-white"
          onPointerDown={(e) => {
            e.preventDefault();
            e.currentTarget.setPointerCapture(e.pointerId);
            drawing.current = true;
            strokes.current.push([point(e)]);
            redraw();
          }}
          onPointerMove={(e) => {
            if (!drawing.current) return;
            const stroke = strokes.current[strokes.current.length - 1];
            const events = e.nativeEvent.getCoalescedEvents?.() ?? [];
            if (events.length > 1) {
              const rect = e.currentTarget.getBoundingClientRect();
              for (const ev of events) stroke.push({ x: ((ev.clientX - rect.left) / rect.width) * PAD_W, y: ((ev.clientY - rect.top) / rect.height) * PAD_H });
            } else stroke.push(point(e));
            redraw();
          }}
          onPointerUp={(e) => {
            if (!drawing.current) return;
            drawing.current = false;
            onChange(trimToSignature(e.currentTarget));
          }}
          onPointerCancel={() => {
            drawing.current = false;
          }}
        />
        <span className="pointer-events-none absolute right-6 bottom-[22%] left-6 border-b border-dashed border-ink-3/50" aria-hidden />
      </div>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-ink-3">{hint}</p>
        <Button
          variant="ghost"
          className="px-2 py-1"
          onClick={() => {
            strokes.current = [];
            redraw();
            onChange(null);
          }}
        >
          {clearLabel}
        </Button>
      </div>
    </div>
  );
}

/* ---------- Tool ---------- */

interface PageView {
  doc: PDFDocumentProxy;
  page: number;
  src: string;
  /** On-screen page size in points (rotation applied). */
  width: number;
  height: number;
}

export default function SignPdf() {
  const t = useT();
  const [file, setFile] = useState<File | null>(null);
  const [pdf, setPdf] = useState<{ file: File; doc: PDFDocumentProxy } | null>(null);
  const [pageNum, setPageNum] = useState(1);
  const [view, setView] = useState<PageView | null>(null);

  const [mode, setMode] = useState<Mode>("draw");
  const [ink, setInk] = useState<Ink>("black");
  const [drawn, setDrawn] = useState<Signature | null>(null);
  const [name, setName] = useState("");
  const [script, setScript] = useState<Script>("script");
  const [upload, setUpload] = useState<File | null>(null);
  const [removeWhite, setRemoveWhite] = useState(true);
  const [uploaded, setUploaded] = useState<Signature | null>(null);

  const [box, setBox] = useState<Box>({ x: 0.58, y: 0.78, w: 0.3 });
  const [applyTo, setApplyTo] = useState<ApplyTo>("this");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ bytes: Uint8Array; pages: number } | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ kind: "move" | "resize"; startX: number; startY: number; start: Box } | null>(null);
  /** Set when a press starts on the signature, so the click that ends a drag isn't treated as "drop here". */
  const pressedBox = useRef(false);

  const typed = useMemo(() => renderTyped(name, script, ink), [name, script, ink]);
  const signature = mode === "draw" ? drawn : mode === "type" ? typed : uploaded;
  const doc = pdf && pdf.file === file ? pdf.doc : null;
  const pageCount = doc?.numPages ?? 0;
  const currentView = view && doc && view.doc === doc && view.page === pageNum ? view : null;

  const pick = useCallback((files: File[]) => {
    setFile(files[0] ?? null);
    setPageNum(1);
    setResult(null);
    setError(null);
  }, []);

  // Open the PDF with pdf.js for page previews.
  useEffect(() => {
    if (!file) return;
    let cancelled = false;
    let opened: PDFDocumentProxy | null = null;
    loadPdfJs(file)
      .then((d) => {
        opened = d;
        if (cancelled) void d.loadingTask.destroy();
        else setPdf({ file, doc: d });
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(errorMessage(err));
      });
    return () => {
      cancelled = true;
      void opened?.loadingTask.destroy();
    };
  }, [file]);

  // Render the chosen page.
  useEffect(() => {
    if (!doc) return;
    let cancelled = false;
    (async () => {
      try {
        const page = await doc.getPage(pageNum);
        const vp = page.getViewport({ scale: 1 });
        const canvas = await renderPage(doc, pageNum, Math.min(2.5, 1100 / Math.max(vp.width, vp.height)));
        if (cancelled) return;
        setView({ doc, page: pageNum, src: canvas.toDataURL("image/jpeg", 0.88), width: vp.width, height: vp.height });
        canvas.width = 0;
        canvas.height = 0;
      } catch (err) {
        if (!cancelled) setError(errorMessage(err));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [doc, pageNum]);

  // Re-process an uploaded image when it or the background option changes.
  useEffect(() => {
    if (!upload) return;
    let cancelled = false;
    renderUpload(upload, removeWhite)
      .then((sig) => {
        if (!cancelled) setUploaded(sig);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(errorMessage(err));
      });
    return () => {
      cancelled = true;
    };
  }, [upload, removeWhite]);

  const onDrawn = useCallback((sig: Signature | null) => {
    setDrawn(sig);
    setResult(null);
  }, []);

  // Height of the box as a fraction of page height, from the signature's aspect ratio.
  const aspect = signature ? signature.width / signature.height : 3;
  const pageAspect = currentView ? currentView.width / currentView.height : 1 / 1.414;
  const hFrac = (w: number) => (w * pageAspect) / aspect;
  const clamp = (b: Box): Box => {
    let w = Math.min(Math.max(b.w, 0.04), 1);
    if (hFrac(w) > 1) w = aspect / pageAspect;
    return { w, x: Math.min(Math.max(b.x, 0), 1 - w), y: Math.min(Math.max(b.y, 0), 1 - hFrac(w)) };
  };
  const placed = clamp(box);

  const onStagePointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    const stage = stageRef.current;
    if (!d || !stage) return;
    const rect = stage.getBoundingClientRect();
    const dx = (e.clientX - d.startX) / rect.width;
    const dy = (e.clientY - d.startY) / rect.height;
    if (d.kind === "move") setBox(clamp({ ...d.start, x: d.start.x + dx, y: d.start.y + dy }));
    else {
      // Resize from the bottom-right corner, keeping the top-left fixed.
      const maxW = Math.min(1 - d.start.x, ((1 - d.start.y) * aspect) / pageAspect);
      setBox({ ...d.start, w: Math.min(Math.max(0.04, d.start.w + Math.max(dx, (dy * aspect) / pageAspect)), maxW) });
    }
    setResult(null);
  };

  const apply = useCallback(async () => {
    if (!file || !signature) return;
    setBusy(true);
    setError(null);
    try {
      const { degrees } = await import("pdf-lib");
      const out = await loadPdfLib(file);
      const png = await out.embedPng(await (await fetch(signature.url)).arrayBuffer());
      const pages = applyTo === "all" ? out.getPages() : [out.getPage(pageNum - 1)];
      for (const page of pages) {
        const frame = pageFrame(page);
        const w = placed.w * frame.width;
        const h = w / aspect;
        const left = placed.x * frame.width;
        const bottom = Math.max(0, frame.height - placed.y * frame.height - h);
        // Anchor the image at the box's on-screen bottom-left and turn it with the page.
        const at = frame.toPdf(left, bottom);
        page.drawImage(png, { x: at.x, y: at.y, width: w, height: h, rotate: degrees(frame.rotation) });
      }
      setResult({ bytes: await savePdf(out), pages: pages.length });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }, [file, signature, applyTo, pageNum, placed.w, placed.x, placed.y, aspect]);

  if (!file) {
    return (
      <FileDrop
        accept=".pdf,application/pdf"
        onFiles={pick}
        hint={t({ en: "Draw, type or upload a signature and place it on any page.", bn: "স্বাক্ষর আঁকুন, লিখুন বা ছবি দিন, তারপর যেকোনো পৃষ্ঠায় বসান।" })}
      />
    );
  }

  const touch = () => setResult(null);
  const sigLabel = t({ en: "Signature", bn: "স্বাক্ষর" });

  return (
    <Workspace
      main={
        <div className="flex flex-col gap-5">
          <Sheet>
            <FileRow file={file} onRemove={() => pick([])} />
            <h3 className="mt-4 mb-3 text-sm font-semibold text-ink">{t({ en: "1. Create your signature", bn: "১. আপনার স্বাক্ষর তৈরি করুন" })}</h3>
            <div className="flex flex-col gap-3">
              <Segmented
                label={t({ en: "Signature type", bn: "স্বাক্ষরের ধরন" })}
                value={mode}
                onChange={(v) => {
                  setMode(v);
                  touch();
                }}
                options={[
                  { value: "draw", label: t({ en: "Draw", bn: "আঁকুন" }) },
                  { value: "type", label: t({ en: "Type", bn: "লিখুন" }) },
                  { value: "upload", label: t({ en: "Upload", bn: "ছবি দিন" }) },
                ]}
              />
              {mode !== "upload" && (
                <div className="flex items-center gap-2 text-sm text-ink-2">
                  <span>{t({ en: "Ink", bn: "কালি" })}</span>
                  {(["black", "blue"] as const).map((c) => (
                    <button
                      key={c}
                      type="button"
                      aria-pressed={ink === c}
                      aria-label={c === "black" ? t({ en: "Black ink", bn: "কালো কালি" }) : t({ en: "Blue ink", bn: "নীল কালি" })}
                      onClick={() => {
                        setInk(c);
                        touch();
                      }}
                      className={`size-6 rounded-full border-2 ${ink === c ? "border-margin" : "border-rule"}`}
                      style={{ backgroundColor: INK[c] }}
                    />
                  ))}
                </div>
              )}
              {/* Kept mounted so the drawing survives switching tabs. */}
              <div className={mode === "draw" ? "" : "hidden"}>
                <SignaturePad
                  ink={ink}
                  onChange={onDrawn}
                  clearLabel={t({ en: "Clear", bn: "মুছে ফেলুন" })}
                  hint={t({ en: "Sign with your mouse, finger or stylus.", bn: "মাউস, আঙুল বা স্টাইলাস দিয়ে সই করুন।" })}
                />
              </div>
              {mode === "type" && (
                <>
                  <Field label={t({ en: "Your name", bn: "আপনার নাম" })}>
                    {(id) => (
                      <input
                        id={id}
                        className={inputClass}
                        value={name}
                        maxLength={60}
                        placeholder={t({ en: "e.g. Rahim Uddin", bn: "যেমন রহিম উদ্দিন" })}
                        onChange={(e) => {
                          setName(e.target.value);
                          touch();
                        }}
                      />
                    )}
                  </Field>
                  <Segmented
                    label={t({ en: "Style", bn: "স্টাইল" })}
                    value={script}
                    onChange={(v) => {
                      setScript(v);
                      touch();
                    }}
                    options={[
                      { value: "script", label: t({ en: "Script", bn: "হাতের লেখা" }) },
                      { value: "chancery", label: t({ en: "Italic", bn: "বাঁকা" }) },
                      { value: "plain", label: t({ en: "Plain", bn: "সাধারণ" }) },
                    ]}
                  />
                  <div className="grid min-h-28 place-items-center rounded-md border border-rule-strong bg-white p-3">
                    {typed ? (
                      // eslint-disable-next-line @next/next/no-img-element -- generated signature
                      <img src={typed.url} alt={sigLabel} className="max-h-24 max-w-full" />
                    ) : (
                      <span className="text-sm text-ink-3">{t({ en: "Type your name above", bn: "ওপরে আপনার নাম লিখুন" })}</span>
                    )}
                  </div>
                </>
              )}
              {mode === "upload" && (
                <>
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-dashed border-rule-strong bg-paper px-4 py-6 text-sm text-ink-2 hover:border-ink-3">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="sr-only"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        e.target.value = "";
                        if (f) {
                          setUpload(f);
                          touch();
                        }
                      }}
                    />
                    {upload ? t({ en: "Choose another image", bn: "অন্য ছবি বেছে নিন" }) : t({ en: "Choose a signature image", bn: "স্বাক্ষরের ছবি বেছে নিন" })}
                  </label>
                  <label className="flex items-center gap-2 text-sm text-ink-2">
                    <input type="checkbox" checked={removeWhite} onChange={(e) => setRemoveWhite(e.target.checked)} className="size-4 accent-margin" />
                    {t({ en: "Make the white background transparent", bn: "সাদা ব্যাকগ্রাউন্ড স্বচ্ছ করুন" })}
                  </label>
                  {uploaded && (
                    <div className="grid min-h-28 place-items-center rounded-md border border-rule-strong bg-white p-3">
                      {/* eslint-disable-next-line @next/next/no-img-element -- processed upload */}
                      <img src={uploaded.url} alt={sigLabel} className="max-h-24 max-w-full" />
                    </div>
                  )}
                </>
              )}
            </div>
          </Sheet>

          <Sheet>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-ink">{t({ en: "2. Place it on the page", bn: "২. পৃষ্ঠায় বসান" })}</h3>
              {pageCount > 0 && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    className="px-2 py-1"
                    aria-label={t({ en: "Previous page", bn: "আগের পৃষ্ঠা" })}
                    disabled={pageNum <= 1}
                    onClick={() => {
                      setPageNum((p) => p - 1);
                      touch();
                    }}
                  >
                    ←
                  </Button>
                  <span className="min-w-20 text-center text-sm text-ink-2">
                    {t({ en: `Page ${pageNum} of ${pageCount}`, bn: `পৃষ্ঠা ${t.n(pageNum)} / ${t.n(pageCount)}` })}
                  </span>
                  <Button
                    variant="ghost"
                    className="px-2 py-1"
                    aria-label={t({ en: "Next page", bn: "পরের পৃষ্ঠা" })}
                    disabled={pageNum >= pageCount}
                    onClick={() => {
                      setPageNum((p) => p + 1);
                      touch();
                    }}
                  >
                    →
                  </Button>
                </div>
              )}
            </div>
            {currentView ? (
              <>
                <div
                  ref={stageRef}
                  className="relative mx-auto w-full max-w-xl border border-rule bg-white shadow-sm select-none"
                  onPointerMove={onStagePointerMove}
                  onPointerUp={() => {
                    drag.current = null;
                  }}
                  onPointerCancel={() => {
                    drag.current = null;
                  }}
                  onPointerDown={() => {
                    pressedBox.current = false;
                  }}
                  onClick={(e) => {
                    // Tap anywhere on the page to drop the signature there (click, so scrolling doesn't trigger it).
                    if (pressedBox.current) {
                      pressedBox.current = false;
                      return;
                    }
                    if (!signature || (e.target !== e.currentTarget && e.target !== e.currentTarget.firstChild)) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    const fx = (e.clientX - rect.left) / rect.width;
                    const fy = (e.clientY - rect.top) / rect.height;
                    setBox(clamp({ ...placed, x: fx - placed.w / 2, y: fy - hFrac(placed.w) / 2 }));
                    touch();
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- rendered page */}
                  <img src={currentView.src} alt={t({ en: `Page ${pageNum}`, bn: `পৃষ্ঠা ${t.n(pageNum)}` })} className="block w-full" draggable={false} />
                  {signature && (
                    <div
                      role="group"
                      tabIndex={0}
                      aria-label={t({ en: "Signature position. Use arrow keys to move.", bn: "স্বাক্ষরের অবস্থান। সরাতে তীর কী ব্যবহার করুন।" })}
                      className="absolute cursor-move touch-none rounded-sm outline-2 outline-margin outline-dashed focus-visible:outline-solid"
                      style={{ left: `${placed.x * 100}%`, top: `${placed.y * 100}%`, width: `${placed.w * 100}%`, aspectRatio: `${aspect}` }}
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        pressedBox.current = true;
                        stageRef.current?.setPointerCapture(e.pointerId);
                        drag.current = { kind: "move", startX: e.clientX, startY: e.clientY, start: placed };
                      }}
                      onKeyDown={(e) => {
                        const step = e.shiftKey ? 0.05 : 0.01;
                        const moves: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
                        const m = moves[e.key];
                        if (!m) return;
                        e.preventDefault();
                        setBox(clamp({ ...placed, x: placed.x + m[0], y: placed.y + m[1] }));
                        touch();
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element -- signature overlay */}
                      <img src={signature.url} alt="" className="pointer-events-none size-full" draggable={false} />
                      <span
                        className="absolute -right-2.5 -bottom-2.5 size-5 cursor-nwse-resize touch-none rounded-full border-2 border-white bg-margin shadow"
                        aria-hidden
                        onPointerDown={(e) => {
                          e.stopPropagation();
                          pressedBox.current = true;
                          stageRef.current?.setPointerCapture(e.pointerId);
                          drag.current = { kind: "resize", startX: e.clientX, startY: e.clientY, start: placed };
                        }}
                      />
                    </div>
                  )}
                </div>
                <p className="mt-2 text-center text-xs text-ink-3">
                  {signature
                    ? t({ en: "Drag to move, pull the corner dot to resize, or tap the page to drop it there.", bn: "সরাতে টেনে আনুন, আকার বদলাতে কোণের বিন্দু টানুন, বা পৃষ্ঠায় ট্যাপ করে সেখানে বসান।" })
                    : t({ en: "Create a signature above to place it.", bn: "বসানোর জন্য আগে ওপরে স্বাক্ষর তৈরি করুন।" })}
                </p>
              </>
            ) : (
              !error && <p className="py-10 text-center text-sm text-ink-3">{t({ en: "Loading page…", bn: "পৃষ্ঠা লোড হচ্ছে…" })}</p>
            )}
          </Sheet>
        </div>
      }
      side={
        <>
          <SideSection title={t({ en: "Sign", bn: "স্বাক্ষর করুন" })}>
            <Field label={t({ en: `Size: ${Math.round(placed.w * 100)}% of page width`, bn: `আকার: পৃষ্ঠার প্রস্থের ${t.n(Math.round(placed.w * 100))}%` })}>
              {(id) => (
                <input
                  id={id}
                  type="range"
                  min={4}
                  max={80}
                  value={Math.round(placed.w * 100)}
                  onChange={(e) => {
                    const w = Number(e.target.value) / 100;
                    // Grow around the box centre.
                    setBox(clamp({ w, x: placed.x + (placed.w - w) / 2, y: placed.y + (hFrac(placed.w) - hFrac(w)) / 2 }));
                    touch();
                  }}
                  className="w-full accent-margin"
                />
              )}
            </Field>
            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-medium text-ink-2">{t({ en: "Apply to", bn: "কোথায় বসবে" })}</p>
              <Segmented
                label={t({ en: "Apply to", bn: "কোথায় বসবে" })}
                value={applyTo}
                onChange={(v) => {
                  setApplyTo(v);
                  touch();
                }}
                options={[
                  { value: "this", label: t({ en: "This page", bn: "এই পৃষ্ঠা" }) },
                  { value: "all", label: t({ en: "All pages", bn: "সব পৃষ্ঠা" }) },
                ]}
              />
            </div>
            <Button onClick={apply} busy={busy} disabled={!signature || !doc}>
              {t({ en: "Sign PDF", bn: "PDF-এ স্বাক্ষর করুন" })}
            </Button>
            {!signature && <p className="text-xs text-ink-3">{t({ en: "Create your signature first.", bn: "আগে আপনার স্বাক্ষর তৈরি করুন।" })}</p>}
          </SideSection>
          <ErrorNote message={error} />
          {result && (
            <ResultBox
              title={t({ en: "PDF signed", bn: "স্বাক্ষর করা হয়েছে" })}
              detail={t({
                en: `Signed on ${result.pages} page${result.pages === 1 ? "" : "s"} · ${formatBytes(result.bytes.byteLength)}`,
                bn: `${t.n(result.pages)}টি পৃষ্ঠায় স্বাক্ষর · ${formatBytes(result.bytes.byteLength)}`,
              })}
            >
              <Button onClick={() => downloadBytes(result.bytes, renameFile(file.name, "-signed.pdf"), PDF_MIME)}>
                {t({ en: "Download PDF", bn: "PDF ডাউনলোড করুন" })}
              </Button>
            </ResultBox>
          )}
          <p className="text-xs text-ink-3">
            {t({
              en: "This places a picture of your signature. It is not a certificate-based digital signature.",
              bn: "এটি আপনার স্বাক্ষরের একটি ছবি বসায়। এটি সার্টিফিকেট-ভিত্তিক ডিজিটাল স্বাক্ষর নয়।",
            })}
          </p>
        </>
      }
    />
  );
}
