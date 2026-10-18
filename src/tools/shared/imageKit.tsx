"use client";

// Shared pieces for the image tools: decoding (EXIF-aware), high-quality scaling,
// encoding with format checks, previews, and the multi-image batch shell.

import { useCallback, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Button, ErrorNote, Field, FileDrop, Progress, ResultBox, Segmented, Sheet, SideSection, Workspace } from "@/components/kit";
import { downloadBlob, downloadZip, errorMessage, formatBytes, renameFile } from "@/lib/files";
import { FORMAT_EXT, canvasToBlob, loadImage, makeCanvas, type ImageFormat } from "@/lib/image";
import { useT, type Translator } from "@/i18n/LocaleProvider";
import type { Bi } from "@/i18n/locale";

export const IMAGE_ACCEPT = "image/*,.heic,.heif";

/* ---------- Localised errors ---------- */

/** An error that carries its message in both languages. */
export class BiError extends Error {
  constructor(public readonly bi: Bi) {
    super(bi.en);
  }
}

/** Turn any thrown value into a message in the current language. */
export function useErrorText(): (err: unknown) => string {
  const t = useT();
  return useCallback(
    (err: unknown) => (err instanceof BiError ? t(err.bi) : errorMessage(err, t({ en: "Something went wrong.", bn: "কিছু একটা গোলমাল হয়েছে।" }))),
    [t],
  );
}

const HEIC_ERROR: Bi = {
  en: "HEIC/HEIF photos can't be opened in this browser. Export the photo as JPEG first (on iPhone: Settings → Camera → Formats → Most Compatible).",
  bn: "এই ব্রাউজারে HEIC/HEIF ছবি খোলা যায় না। আগে ছবিটি JPEG হিসেবে সেভ করে নিন (iPhone-এ: Settings → Camera → Formats → Most Compatible)।",
};

export function isHeic(file: File): boolean {
  return /image\/hei[cf]/i.test(file.type) || /\.hei[cf]$/i.test(file.name);
}

export function openError(file: File): Bi {
  return isHeic(file)
    ? HEIC_ERROR
    : { en: `“${file.name}” couldn't be opened as an image.`, bn: `“${file.name}” ছবি হিসেবে খোলা গেল না।` };
}

/* ---------- Formatting ---------- */

/** Swap ASCII digits for Bangla ones in the Bangla UI. */
export function localDigits(t: Translator, text: string): string {
  return t.locale === "bn" ? text.replace(/\d/g, (d) => t.n(Number(d))) : text;
}

export function fmtBytes(t: Translator, bytes: number): string {
  return localDigits(t, formatBytes(bytes));
}

export function fmtDims(t: Translator, w: number, h: number): string {
  return `${t.n(Math.round(w))} × ${t.n(Math.round(h))}`;
}

/** "−42%" / "+12%" change from before to after. */
export function fmtChange(t: Translator, before: number, after: number): string {
  if (before <= 0) return "";
  const pct = Math.round(((after - before) / before) * 100);
  return `${pct > 0 ? "+" : pct < 0 ? "−" : "±"}${t.n(Math.abs(pct))}%`;
}

/* ---------- Decoding & drawing ---------- */

export interface Source {
  source: CanvasImageSource;
  width: number;
  height: number;
}

export interface Decoded extends Source {
  close: () => void;
}

/**
 * Decode at full resolution with EXIF orientation applied. <img> applies
 * orientation in every modern browser; createImageBitmap is the fallback.
 */
export async function decodeImage(file: File): Promise<Decoded> {
  try {
    const img = await loadImage(file);
    await img.decode().catch(() => undefined);
    if (img.naturalWidth && img.naturalHeight) {
      return { source: img, width: img.naturalWidth, height: img.naturalHeight, close: () => undefined };
    }
  } catch {
    // try the bitmap path below
  }
  try {
    const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
    return { source: bmp, width: bmp.width, height: bmp.height, close: () => bmp.close() };
  } catch {
    throw new BiError(openError(file));
  }
}

const MAX_SIDE = 16384;
const MAX_AREA = 100_000_000;

export function assertCanvasSize(w: number, h: number): void {
  if (w > MAX_SIDE || h > MAX_SIDE || w * h > MAX_AREA) {
    const dims = `${Math.round(w)} × ${Math.round(h)}`;
    throw new BiError({
      en: `${dims} px is too large for the browser to handle (max ${MAX_SIDE} px per side, about 100 megapixels).`,
      bn: `${dims} পিক্সেল ব্রাউজারের জন্য অনেক বড় (প্রতি পাশে সর্বোচ্চ ${MAX_SIDE} পিক্সেল, মোট প্রায় ১০ কোটি পিক্সেল)।`,
    });
  }
}

/** Scale to an exact size. Large reductions step down by halves to avoid aliasing. */
export function drawScaled(src: Source, tw: number, th: number): HTMLCanvasElement {
  tw = Math.max(1, Math.round(tw));
  th = Math.max(1, Math.round(th));
  assertCanvasSize(tw, th);
  let cur: CanvasImageSource = src.source;
  let cw = src.width;
  let ch = src.height;
  while (cw > tw * 2 && ch > th * 2) {
    const nw = Math.round(cw / 2);
    const nh = Math.round(ch / 2);
    const [c, ctx] = makeCanvas(nw, nh);
    ctx.drawImage(cur, 0, 0, cw, ch, 0, 0, nw, nh);
    cur = c;
    cw = nw;
    ch = nh;
  }
  const [out, ctx] = makeCanvas(tw, th);
  ctx.drawImage(cur, 0, 0, cw, ch, 0, 0, tw, th);
  return out;
}

/** A downscaled copy for on-screen previews. */
export function previewOf(src: Source, maxSide: number): HTMLCanvasElement {
  const s = Math.min(1, maxSide / Math.max(src.width, src.height));
  return drawScaled(src, src.width * s, src.height * s);
}

export const FORMAT_LABEL: Record<ImageFormat, string> = {
  "image/jpeg": "JPG",
  "image/png": "PNG",
  "image/webp": "WebP",
};

export function isLossy(format: ImageFormat): boolean {
  return format !== "image/png";
}

/** Encode and make sure the browser really produced the requested format. */
export async function encodeCanvas(canvas: HTMLCanvasElement, format: ImageFormat, quality?: number): Promise<Blob> {
  let blob: Blob;
  try {
    blob = await canvasToBlob(canvas, format, quality);
  } catch {
    throw new BiError({
      en: "The browser couldn't save this image, it may be too large. Try a smaller size.",
      bn: "ব্রাউজার ছবিটি সেভ করতে পারল না, সম্ভবত খুব বড়। ছোট মাপে চেষ্টা করুন।",
    });
  }
  if (blob.type && blob.type !== format) {
    throw new BiError({
      en: `This browser can't save ${FORMAT_LABEL[format]} images. Pick another format.`,
      bn: `এই ব্রাউজার ${FORMAT_LABEL[format]} ছবি সেভ করতে পারে না। অন্য ফরম্যাট বেছে নিন।`,
    });
  }
  return blob;
}

/** True if any pixel is (partly) transparent. Checks a small copy, so it's cheap. */
export function hasTransparency(src: Source): boolean {
  const c = previewOf(src, 256);
  const ctx = c.getContext("2d");
  if (!ctx) return false;
  const data = ctx.getImageData(0, 0, c.width, c.height).data;
  for (let i = 3; i < data.length; i += 4) if (data[i] < 250) return true;
  return false;
}

/** Trace a rounded rectangle (works where ctx.roundRect is missing). */
export function roundedRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  if (r === 0) {
    ctx.rect(x, y, w, h);
    return;
  }
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function outputName(file: File, format: ImageFormat, suffix = ""): string {
  return renameFile(file.name, `${suffix}${FORMAT_EXT[format]}`);
}

/* ---------- Display ---------- */

export const checkerStyle: CSSProperties = {
  backgroundColor: "var(--sheet)",
  backgroundImage:
    "linear-gradient(45deg, var(--rule) 25%, transparent 25%), linear-gradient(-45deg, var(--rule) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, var(--rule) 75%), linear-gradient(-45deg, transparent 75%, var(--rule) 75%)",
  backgroundSize: "16px 16px",
  backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0",
};

/** <img> for a Blob; owns (and revokes) its object URL. */
export function BlobImg({
  blob,
  alt,
  className,
  style,
  onLoad,
  onError,
}: {
  blob: Blob;
  alt: string;
  className?: string;
  style?: CSSProperties;
  onLoad?: (img: HTMLImageElement) => void;
  onError?: () => void;
}) {
  const ref = useCallback(
    (img: HTMLImageElement | null) => {
      if (!img) return;
      const url = URL.createObjectURL(blob);
      img.src = url;
      return () => URL.revokeObjectURL(url);
    },
    [blob],
  );
  return (
    // eslint-disable-next-line @next/next/no-img-element -- local blob preview, nothing for next/image to optimise
    <img
      ref={ref}
      alt={alt}
      className={className}
      style={style}
      draggable={false}
      onLoad={(e) => onLoad?.(e.currentTarget)}
      onError={onError}
    />
  );
}

/** Shows an existing canvas element on a transparency checkerboard. */
export function CanvasView({ canvas, label, className = "" }: { canvas: HTMLCanvasElement; label: string; className?: string }) {
  const ref = useCallback(
    (el: HTMLDivElement | null) => {
      if (!el) return;
      el.replaceChildren(canvas);
      return () => el.replaceChildren();
    },
    [canvas],
  );
  return (
    <div
      ref={ref}
      role="img"
      aria-label={label}
      style={checkerStyle}
      className={`[&>canvas]:block [&>canvas]:h-auto [&>canvas]:max-h-[65vh] [&>canvas]:w-auto [&>canvas]:max-w-full ${className}`}
    />
  );
}

/* ---------- Small controls ---------- */

export function Check({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-2">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="size-4 accent-margin" />
      {label}
    </label>
  );
}

export function RangeField({
  label,
  value,
  min,
  max,
  step = 1,
  display,
  hint,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  display: string;
  hint?: string;
  onChange: (v: number) => void;
}) {
  return (
    <Field label={`${label} · ${display}`} hint={hint}>
      {(id) => (
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full accent-margin"
        />
      )}
    </Field>
  );
}

export function QualityField({ value, onChange, hint }: { value: number; onChange: (v: number) => void; hint?: string }) {
  const t = useT();
  return (
    <RangeField
      label={t({ en: "Quality", bn: "মান" })}
      value={value}
      min={0.1}
      max={1}
      step={0.01}
      display={`${t.n(Math.round(value * 100))}%`}
      hint={hint}
      onChange={onChange}
    />
  );
}

export function CopyButton({ text, label }: { text: string; label?: string }) {
  const t = useT();
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <Button variant="secondary" className="px-3 py-1.5" onClick={copy}>
      {copied ? t({ en: "Copied", bn: "কপি হয়েছে" }) : (label ?? t({ en: "Copy", bn: "কপি" }))}
    </Button>
  );
}

/* ---------- Outputs ---------- */

export interface Output {
  blob: Blob;
  name: string;
  width: number;
  height: number;
  note?: Bi;
  warn?: boolean;
}

function uniqueNames(names: string[]): string[] {
  const seen = new Map<string, number>();
  return names.map((n) => {
    const count = (seen.get(n) ?? 0) + 1;
    seen.set(n, count);
    if (count === 1) return n;
    const dot = n.lastIndexOf(".");
    return dot > 0 ? `${n.slice(0, dot)}-${count}${n.slice(dot)}` : `${n}-${count}`;
  });
}

export async function downloadOutputs(outputs: Output[], zipName: string): Promise<void> {
  if (outputs.length === 1) return downloadBlob(outputs[0].blob, outputs[0].name);
  const names = uniqueNames(outputs.map((o) => o.name));
  await downloadZip(
    outputs.map((o, i) => ({ name: names[i], data: o.blob })),
    zipName,
  );
}

/** Result panel for single-image tools. */
export function SingleResult({ output, original }: { output: Output; original: File }) {
  const t = useT();
  return (
    <ResultBox
      title={t({ en: "Ready", bn: "তৈরি" })}
      detail={`${fmtDims(t, output.width, output.height)} px · ${fmtBytes(t, output.blob.size)} (${fmtChange(t, original.size, output.blob.size)})`}
    >
      <Button onClick={() => downloadBlob(output.blob, output.name)}>{t({ en: "Download", bn: "ডাউনলোড" })}</Button>
    </ResultBox>
  );
}

/* ---------- Single-image loading ---------- */

export interface LoadedImage {
  file: File;
  width: number;
  height: number;
  /** Downscaled copy for the screen. */
  preview: HTMLCanvasElement;
  /** Preview pixels per real pixel. */
  scale: number;
}

export function useSingleImage(previewMax = 1600) {
  const errorText = useErrorText();
  const [image, setImage] = useState<LoadedImage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const token = useRef(0);

  const load = useCallback(
    async (file: File) => {
      const mine = ++token.current;
      setLoading(true);
      setError(null);
      try {
        const img = await decodeImage(file);
        try {
          const preview = previewOf(img, previewMax);
          if (mine === token.current) {
            setImage({ file, width: img.width, height: img.height, preview, scale: preview.width / img.width });
          }
        } finally {
          img.close();
        }
      } catch (err) {
        if (mine === token.current) setError(errorText(err));
      } finally {
        if (mine === token.current) setLoading(false);
      }
    },
    [previewMax, errorText],
  );

  const clear = useCallback(() => {
    token.current++;
    setImage(null);
    setError(null);
    setLoading(false);
  }, []);

  return { image, loading, error, load, clear };
}

/** The empty state for single-image tools. */
export function SingleImageDrop({
  loading,
  error,
  onFile,
  hint,
}: {
  loading: boolean;
  error: string | null;
  onFile: (file: File) => void;
  hint?: string;
}) {
  const t = useT();
  return (
    <div className="flex flex-col gap-3">
      <FileDrop
        accept={IMAGE_ACCEPT}
        onFiles={(files) => files[0] && onFile(files[0])}
        title={t({ en: "Choose an image", bn: "ছবি বেছে নিন" })}
        hint={hint}
      />
      {loading && <p className="text-sm text-ink-3">{t({ en: "Opening image…", bn: "ছবি খোলা হচ্ছে…" })}</p>}
      <ErrorNote message={error} />
    </div>
  );
}

/** File name, size and dimensions, with a "change image" action. */
export function ImageHeader({ image, onChange }: { image: LoadedImage; onChange: () => void }) {
  const t = useT();
  return (
    <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{image.file.name}</p>
        <p className="text-xs text-ink-3">
          {fmtDims(t, image.width, image.height)} px · {fmtBytes(t, image.file.size)}
        </p>
      </div>
      <Button variant="ghost" className="px-3 py-1.5" onClick={onChange}>
        {t({ en: "Change image", bn: "অন্য ছবি" })}
      </Button>
    </div>
  );
}

/* ---------- Multi-image batch tool ---------- */

export interface ImageItem {
  id: number;
  file: File;
  width?: number;
  height?: number;
  broken?: boolean;
}

type Outcome = { ok: true; out: Output } | { ok: false; error: string };

interface Run {
  key: string;
  outcomes: Map<number, Outcome>;
}

/**
 * Shell for tools that apply one operation to many images:
 * list with thumbnails → options rail → per-file results → download one or ZIP.
 * `settingsKey` must change whenever the options change; stale results are hidden.
 */
export function BatchImageTool({
  hint,
  actionLabel,
  zipName,
  settingsKey,
  options,
  process,
}: {
  hint: string;
  actionLabel: string;
  zipName: string;
  settingsKey: string;
  options: (items: ImageItem[]) => ReactNode;
  process: (file: File, img: Decoded) => Promise<Output>;
}) {
  const t = useT();
  const errorText = useErrorText();
  const [items, setItems] = useState<ImageItem[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [showBefore, setShowBefore] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [zipping, setZipping] = useState(false);
  const [run, setRun] = useState<Run | null>(null);
  const nextId = useRef(1);

  const outcomes = run && run.key === settingsKey ? run.outcomes : null;

  const add = useCallback((files: File[]) => {
    const added = files.map((file) => ({ id: nextId.current++, file }));
    setItems((prev) => [...prev, ...added]);
  }, []);

  const patch = useCallback((id: number, p: Partial<ImageItem>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...p } : it)));
  }, []);

  const remove = (id: number) => setItems((prev) => prev.filter((it) => it.id !== id));

  const start = async () => {
    setBusy(true);
    setError(null);
    setProgress(0);
    const results = new Map<number, Outcome>();
    const list = items;
    for (let i = 0; i < list.length; i++) {
      const item = list[i];
      try {
        const img = await decodeImage(item.file);
        try {
          results.set(item.id, { ok: true, out: await process(item.file, img) });
        } finally {
          img.close();
        }
      } catch (err) {
        results.set(item.id, { ok: false, error: errorText(err) });
      }
      setProgress((i + 1) / list.length);
      await new Promise((r) => setTimeout(r, 0));
    }
    setRun({ key: settingsKey, outcomes: results });
    setBusy(false);
  };

  const ready: Output[] = [];
  let before = 0;
  let after = 0;
  if (outcomes) {
    for (const it of items) {
      const o = outcomes.get(it.id);
      if (o?.ok) {
        ready.push(o.out);
        before += it.file.size;
        after += o.out.blob.size;
      }
    }
  }

  const downloadAll = async () => {
    setZipping(true);
    try {
      await downloadOutputs(ready, zipName);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setZipping(false);
    }
  };

  if (items.length === 0) {
    return <FileDrop accept={IMAGE_ACCEPT} multiple onFiles={add} title={t({ en: "Choose images", bn: "ছবি বেছে নিন" })} hint={hint} />;
  }

  const current = items.find((it) => it.id === selected) ?? items[0];
  const currentOutcome = outcomes?.get(current.id);
  const currentOut = currentOutcome?.ok ? currentOutcome.out : null;
  const shown = currentOut && !showBefore ? currentOut.blob : current.file;

  return (
    <Workspace
      main={
        <Sheet>
          <div className="mb-4 flex flex-col items-center gap-2">
            {currentOut && (
              <div className="w-full max-w-56">
                <Segmented
                  label={t({ en: "Preview", bn: "প্রিভিউ" })}
                  value={showBefore ? "before" : "after"}
                  onChange={(v) => setShowBefore(v === "before")}
                  options={[
                    { value: "before", label: t({ en: "Before", bn: "আগে" }) },
                    { value: "after", label: t({ en: "After", bn: "পরে" }) },
                  ]}
                />
              </div>
            )}
            {current.broken ? (
              <p className="py-10 text-sm text-ink-3">{t({ en: "No preview for this file.", bn: "এই ফাইলের প্রিভিউ নেই।" })}</p>
            ) : (
              <BlobImg
                key={shown === current.file ? `in-${current.id}` : `out-${current.id}`}
                blob={shown}
                alt={t({ en: "Preview", bn: "প্রিভিউ" })}
                className="block h-auto max-h-[50vh] w-auto max-w-full"
                style={checkerStyle}
              />
            )}
            <p className="text-xs text-ink-3">
              {currentOut && !showBefore
                ? `${t({ en: "After", bn: "পরে" })} · ${fmtDims(t, currentOut.width, currentOut.height)} px · ${fmtBytes(t, currentOut.blob.size)}`
                : `${t({ en: "Original", bn: "আসল" })}${current.width && current.height ? ` · ${fmtDims(t, current.width, current.height)} px` : ""} · ${fmtBytes(t, current.file.size)}`}
            </p>
          </div>

          {items.map((it) => (
            <BatchRow
              key={it.id}
              item={it}
              active={it.id === current.id}
              outcome={outcomes?.get(it.id)}
              onSelect={() => setSelected(it.id)}
              onRemove={() => remove(it.id)}
              onLoad={(img) => patch(it.id, { width: img.naturalWidth, height: img.naturalHeight })}
              onBroken={() => patch(it.id, { broken: true })}
            />
          ))}
          <div className="mt-4">
            <FileDrop accept={IMAGE_ACCEPT} multiple onFiles={add} title={t({ en: "Add more images", bn: "আরও ছবি যোগ করুন" })} />
          </div>
        </Sheet>
      }
      side={
        <>
          <SideSection title={t({ en: "Options", bn: "অপশন" })}>
            {options(items)}
            <Button onClick={start} busy={busy}>
              {actionLabel}
            </Button>
            {busy && <Progress value={progress} label={t({ en: "Working…", bn: "কাজ চলছে…" })} />}
          </SideSection>
          <ErrorNote message={error} />
          {ready.length > 0 && (
            <ResultBox
              title={t({ en: `${ready.length} ready`, bn: `${t.n(ready.length)}টি তৈরি` })}
              detail={`${fmtBytes(t, before)} → ${fmtBytes(t, after)} (${fmtChange(t, before, after)})`}
            >
              <Button onClick={downloadAll} busy={zipping}>
                {ready.length === 1 ? t({ en: "Download", bn: "ডাউনলোড" }) : t({ en: "Download all (ZIP)", bn: "সব ডাউনলোড (ZIP)" })}
              </Button>
            </ResultBox>
          )}
          <Button
            variant="ghost"
            onClick={() => {
              setItems([]);
              setRun(null);
              setError(null);
            }}
          >
            {t({ en: "Start over", bn: "আবার শুরু করুন" })}
          </Button>
        </>
      }
    />
  );
}

function BatchRow({
  item,
  active,
  outcome,
  onSelect,
  onRemove,
  onLoad,
  onBroken,
}: {
  item: ImageItem;
  active: boolean;
  outcome?: Outcome;
  onSelect: () => void;
  onRemove: () => void;
  onLoad: (img: HTMLImageElement) => void;
  onBroken: () => void;
}) {
  const t = useT();
  const dims = item.width && item.height ? `${fmtDims(t, item.width, item.height)} px · ` : "";
  return (
    <div className={`flex items-center gap-3 border-b border-rule py-2.5 last:border-b-0 ${active ? "bg-paper-2/60" : ""}`}>
      <button
        type="button"
        onClick={onSelect}
        aria-label={t({ en: `Preview ${item.file.name}`, bn: `${item.file.name} প্রিভিউ` })}
        className="grid size-12 shrink-0 place-items-center overflow-hidden rounded border border-rule"
        style={checkerStyle}
      >
        {item.broken ? (
          <span className="font-mono text-[10px] text-ink-3 uppercase">{item.file.name.split(".").pop()?.slice(0, 4)}</span>
        ) : (
          <BlobImg blob={item.file} alt="" className="size-full object-cover" onLoad={onLoad} onError={onBroken} />
        )}
      </button>
      <div className="min-w-0 flex-1">
        <button type="button" onClick={onSelect} className="block max-w-full truncate text-left text-sm font-medium">
          {item.file.name}
        </button>
        <p className="text-xs text-ink-3">
          {dims}
          {fmtBytes(t, item.file.size)}
        </p>
        {item.broken && !outcome && <p className="text-xs text-danger">{t(openError(item.file))}</p>}
        {outcome && !outcome.ok && <p className="text-xs text-danger">{outcome.error}</p>}
        {outcome?.ok && (
          <p className="text-xs text-ink-2">
            → {fmtDims(t, outcome.out.width, outcome.out.height)} px · {fmtBytes(t, outcome.out.blob.size)}{" "}
            <span className={outcome.out.blob.size <= item.file.size ? "text-ok" : "text-margin"}>
              ({fmtChange(t, item.file.size, outcome.out.blob.size)})
            </span>
            {outcome.out.note && <span className={`block ${outcome.out.warn ? "text-margin" : "text-ink-3"}`}>{t(outcome.out.note)}</span>}
          </p>
        )}
      </div>
      {outcome?.ok && (
        <Button variant="secondary" className="px-3 py-1.5" onClick={() => downloadBlob(outcome.out.blob, outcome.out.name)}>
          {t({ en: "Download", bn: "ডাউনলোড" })}
        </Button>
      )}
      <button
        type="button"
        onClick={onRemove}
        aria-label={t({ en: `Remove ${item.file.name}`, bn: `${item.file.name} সরান` })}
        className="rounded p-1.5 text-ink-3 hover:bg-paper-2 hover:text-margin"
      >
        <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
          <path d="m5 5 10 10M15 5 5 15" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

/* ---------- Output format picker ---------- */

export type FormatChoice = "same" | ImageFormat;

export function FormatPicker<T extends FormatChoice>({ value, onChange, choices }: { value: T; onChange: (v: T) => void; choices: T[] }) {
  const t = useT();
  return (
    <Field label={t({ en: "Output format", bn: "আউটপুট ফরম্যাট" })}>
      {() => (
        <Segmented
          label={t({ en: "Output format", bn: "আউটপুট ফরম্যাট" })}
          value={value}
          onChange={onChange}
          options={choices.map((c) => ({ value: c, label: c === "same" ? t({ en: "Same", bn: "একই" }) : FORMAT_LABEL[c as ImageFormat] }))}
        />
      )}
    </Field>
  );
}
