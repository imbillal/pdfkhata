"use client";

import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { Button, ErrorNote, Field, Segmented, Sheet, SideSection, Workspace, inputClass } from "@/components/kit";
import { useT } from "@/i18n/LocaleProvider";
import { makeCanvas, sameFormatAs } from "@/lib/image";
import {
  CanvasView,
  ImageHeader,
  SingleImageDrop,
  SingleResult,
  decodeImage,
  encodeCanvas,
  isLossy,
  outputName,
  useErrorText,
  useSingleImage,
  type LoadedImage,
  type Output,
} from "@/tools/shared/imageKit";

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

type Aspect = "free" | "1:1" | "4:3" | "16:9" | "3:2" | "9:16";
const ASPECTS: Aspect[] = ["free", "1:1", "4:3", "16:9", "3:2", "9:16"];

function ratioOf(a: Aspect): number | null {
  if (a === "free") return null;
  const [w, h] = a.split(":").map(Number);
  return w / h;
}

type Corner = "nw" | "ne" | "sw" | "se";
type DragMode = "move" | Corner | "new";

interface Drag {
  mode: DragMode;
  startX: number;
  startY: number;
  /** Real pixels per CSS pixel. */
  k: number;
  start: Rect;
  /** Fixed point while resizing. */
  ax: number;
  ay: number;
  /** The corner being dragged, at drag start. */
  mx: number;
  my: number;
}

const MIN = 1;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Largest centred rect with the ratio, at 90% of the image. */
function centred(W: number, H: number, ratio: number | null): Rect {
  let w = W * 0.9;
  let h = H * 0.9;
  if (ratio) {
    if (w / h > ratio) w = h * ratio;
    else h = w / ratio;
  }
  return { x: (W - w) / 2, y: (H - h) / 2, w, h };
}

/** Rect spanned by a fixed anchor and a moving point, honouring ratio and image bounds. */
function spanRect(ax: number, ay: number, px: number, py: number, W: number, H: number, ratio: number | null): Rect {
  const sx = px >= ax ? 1 : -1;
  const sy = py >= ay ? 1 : -1;
  const maxW = sx > 0 ? W - ax : ax;
  const maxH = sy > 0 ? H - ay : ay;
  let w = Math.min(Math.abs(px - ax), maxW);
  let h = Math.min(Math.abs(py - ay), maxH);
  if (ratio) {
    if (w / Math.max(h, 1e-9) > ratio) h = w / ratio;
    else w = h * ratio;
    if (w > maxW) {
      w = maxW;
      h = w / ratio;
    }
    if (h > maxH) {
      h = maxH;
      w = h * ratio;
    }
  }
  w = Math.max(w, MIN);
  h = Math.max(h, MIN);
  return { x: sx > 0 ? ax : ax - w, y: sy > 0 ? ay : ay - h, w, h };
}

function roundRect(r: Rect, W: number, H: number): Rect {
  const x = clamp(Math.round(r.x), 0, W - 1);
  const y = clamp(Math.round(r.y), 0, H - 1);
  return { x, y, w: clamp(Math.round(r.w), 1, W - x), h: clamp(Math.round(r.h), 1, H - y) };
}

export default function CropImage() {
  const t = useT();
  const errorText = useErrorText();
  const { image, loading, error: loadError, load, clear } = useSingleImage();
  const [aspect, setAspect] = useState<Aspect>("free");
  const [cropState, setCropState] = useState<{ file: File; rect: Rect } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ key: string; out: Output } | null>(null);

  if (!image) {
    return (
      <SingleImageDrop
        loading={loading}
        error={loadError}
        onFile={load}
        hint={t({ en: "One image. Crop happens at full resolution.", bn: "একটি ছবি। পুরো রেজোলিউশনে কাটা হবে।" })}
      />
    );
  }

  const W = image.width;
  const H = image.height;
  const ratio = ratioOf(aspect);
  const crop = cropState?.file === image.file ? cropState.rect : centred(W, H, ratio);
  const setCrop = (rect: Rect) => setCropState({ file: image.file, rect });
  const shown = roundRect(crop, W, H);
  const key = `${image.file.name}:${shown.x},${shown.y},${shown.w},${shown.h}`;
  const output = result?.key === key ? result.out : null;

  const pickAspect = (a: Aspect) => {
    setAspect(a);
    const r = ratioOf(a);
    if (r) setCrop(centred(W, H, r));
  };

  const editField = (field: keyof Rect, raw: string) => {
    const v = Number(raw);
    if (!Number.isFinite(v)) return;
    const next = { ...shown };
    if (field === "x") next.x = clamp(v, 0, W - next.w);
    if (field === "y") next.y = clamp(v, 0, H - next.h);
    if (field === "w") {
      next.w = clamp(v, 1, W - next.x);
      if (ratio) {
        next.h = next.w / ratio;
        if (next.y + next.h > H) {
          next.h = H - next.y;
          next.w = next.h * ratio;
        }
      }
    }
    if (field === "h") {
      next.h = clamp(v, 1, H - next.y);
      if (ratio) {
        next.w = next.h * ratio;
        if (next.x + next.w > W) {
          next.w = W - next.x;
          next.h = next.w / ratio;
        }
      }
    }
    setCrop(next);
  };

  const apply = async () => {
    setBusy(true);
    setError(null);
    try {
      const img = await decodeImage(image.file);
      try {
        const [canvas, ctx] = makeCanvas(shown.w, shown.h);
        ctx.drawImage(img.source, shown.x, shown.y, shown.w, shown.h, 0, 0, shown.w, shown.h);
        const format = sameFormatAs(image.file);
        const blob = await encodeCanvas(canvas, format, isLossy(format) ? 0.92 : undefined);
        setResult({ key, out: { blob, name: outputName(image.file, format, "-cropped"), width: shown.w, height: shown.h } });
      } finally {
        img.close();
      }
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  };

  const fields: { key: keyof Rect; label: string }[] = [
    { key: "x", label: "X" },
    { key: "y", label: "Y" },
    { key: "w", label: t({ en: "Width", bn: "প্রস্থ" }) },
    { key: "h", label: t({ en: "Height", bn: "উচ্চতা" }) },
  ];

  return (
    <Workspace
      main={
        <Sheet>
          <ImageHeader image={image} onChange={clear} />
          <CropFrame image={image} crop={crop} ratio={ratio} onChange={setCrop} />
          <p className="mt-3 text-center text-xs text-ink-3">
            {t({
              en: "Drag the box to move it, drag a corner to resize, or drag on the image to draw a new box. Arrow keys nudge.",
              bn: "বক্স টেনে সরান, কোণা টেনে ছোট-বড় করুন, অথবা ছবির ওপর টেনে নতুন বক্স আঁকুন। অ্যারো কী দিয়ে একটু একটু সরানো যায়।",
            })}
          </p>
        </Sheet>
      }
      side={
        <>
          <SideSection title={t({ en: "Crop", bn: "কাটুন" })}>
            <Field label={t({ en: "Aspect ratio", bn: "অনুপাত" })}>
              {() => (
                <Segmented
                  label={t({ en: "Aspect ratio", bn: "অনুপাত" })}
                  value={aspect}
                  onChange={pickAspect}
                  options={ASPECTS.map((a) => ({ value: a, label: a === "free" ? t({ en: "Free", bn: "ইচ্ছেমতো" }) : t.locale === "bn" ? a.replace(/\d/g, (d) => t.n(Number(d))) : a }))}
                />
              )}
            </Field>
            <div className="grid grid-cols-2 gap-2">
              {fields.map((f) => (
                <Field key={f.key} label={`${f.label} (px)`}>
                  {(id) => (
                    <input
                      id={id}
                      type="number"
                      inputMode="numeric"
                      className={inputClass}
                      value={shown[f.key]}
                      onChange={(e) => editField(f.key, e.target.value)}
                    />
                  )}
                </Field>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" className="flex-1 px-3 py-1.5" onClick={() => setCrop({ x: 0, y: 0, w: W, h: H })} disabled={!!ratio}>
                {t({ en: "Select all", bn: "পুরোটা" })}
              </Button>
              <Button variant="secondary" className="flex-1 px-3 py-1.5" onClick={() => setCrop(centred(W, H, ratio))}>
                {t({ en: "Reset", bn: "রিসেট" })}
              </Button>
            </div>
            <Button onClick={apply} busy={busy}>
              {t({ en: "Crop image", bn: "ছবি কাটুন" })}
            </Button>
          </SideSection>
          <ErrorNote message={error} />
          {output && <SingleResult output={output} original={image.file} />}
        </>
      }
    />
  );
}

function CropFrame({ image, crop, ratio, onChange }: { image: LoadedImage; crop: Rect; ratio: number | null; onChange: (r: Rect) => void }) {
  const t = useT();
  const drag = useRef<Drag | null>(null);
  const W = image.width;
  const H = image.height;

  const begin = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    const frame = e.currentTarget;
    const target = e.target instanceof HTMLElement ? e.target.closest<HTMLElement>("[data-mode]") : null;
    const mode = (target?.dataset.mode ?? "new") as DragMode;
    e.preventDefault();
    const box = frame.getBoundingClientRect();
    const k = W / box.width;
    let ax = 0;
    let ay = 0;
    let mx = 0;
    let my = 0;
    let start = crop;
    if (mode === "new") {
      ax = mx = clamp((e.clientX - box.left) * k, 0, W);
      ay = my = clamp((e.clientY - box.top) * k, 0, H);
      start = { x: ax, y: ay, w: MIN, h: MIN };
    } else if (mode !== "move") {
      const left = crop.x;
      const right = crop.x + crop.w;
      const top = crop.y;
      const bottom = crop.y + crop.h;
      mx = mode.includes("w") ? left : right;
      my = mode.includes("n") ? top : bottom;
      ax = mode.includes("w") ? right : left;
      ay = mode.includes("n") ? bottom : top;
    }
    drag.current = { mode, startX: e.clientX, startY: e.clientY, k, start, ax, ay, mx, my };
    frame.setPointerCapture(e.pointerId);
  };

  const move = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = (e.clientX - d.startX) * d.k;
    const dy = (e.clientY - d.startY) * d.k;
    if (d.mode === "move") {
      onChange({ ...d.start, x: clamp(d.start.x + dx, 0, W - d.start.w), y: clamp(d.start.y + dy, 0, H - d.start.h) });
    } else {
      onChange(spanRect(d.ax, d.ay, clamp(d.mx + dx, 0, W), clamp(d.my + dy, 0, H), W, H, ratio));
    }
  };

  const end = (e: PointerEvent<HTMLDivElement>) => {
    drag.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 10 : 1;
    const delta: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const dd = delta[e.key];
    if (!dd) return;
    e.preventDefault();
    onChange({ ...crop, x: clamp(crop.x + dd[0], 0, W - crop.w), y: clamp(crop.y + dd[1], 0, H - crop.h) });
  };

  const pct = (v: number, of: number) => `${(v / of) * 100}%`;
  const corners: { c: Corner; cls: string; cursor: string }[] = [
    { c: "nw", cls: "-top-3 -left-3", cursor: "nwse-resize" },
    { c: "ne", cls: "-top-3 -right-3", cursor: "nesw-resize" },
    { c: "sw", cls: "-bottom-3 -left-3", cursor: "nesw-resize" },
    { c: "se", cls: "-right-3 -bottom-3", cursor: "nwse-resize" },
  ];

  return (
    <div className="flex justify-center">
      <div
        className="relative w-fit max-w-full touch-none select-none"
        style={{ cursor: "crosshair" }}
        onPointerDown={begin}
        onPointerMove={move}
        onPointerUp={end}
        onPointerCancel={end}
      >
        <CanvasView canvas={image.preview} label={image.file.name} />
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute"
            style={{ left: pct(crop.x, W), top: pct(crop.y, H), width: pct(crop.w, W), height: pct(crop.h, H), boxShadow: "0 0 0 9999px rgb(0 0 0 / 0.5)" }}
          />
        </div>
        <div
          role="slider"
          tabIndex={0}
          aria-label={t({ en: "Crop area (arrow keys move it)", bn: "কাটার অংশ (অ্যারো কী দিয়ে সরান)" })}
          aria-valuetext={`${Math.round(crop.x)}, ${Math.round(crop.y)}, ${Math.round(crop.w)} × ${Math.round(crop.h)}`}
          onKeyDown={onKey}
          data-mode="move"
          aria-valuenow={Math.round(crop.x)}
          className="absolute border-2 border-sheet outline-none focus-visible:border-margin"
          style={{
            left: pct(crop.x, W),
            top: pct(crop.y, H),
            width: pct(crop.w, W),
            height: pct(crop.h, H),
            cursor: "move",
          }}
        >
          {/* rule-of-thirds guides */}
          <div className="pointer-events-none absolute inset-0 opacity-50">
            <div className="absolute inset-y-0 left-1/3 border-l border-sheet" />
            <div className="absolute inset-y-0 left-2/3 border-l border-sheet" />
            <div className="absolute inset-x-0 top-1/3 border-t border-sheet" />
            <div className="absolute inset-x-0 top-2/3 border-t border-sheet" />
          </div>
          {corners.map(({ c, cls, cursor }) => (
            <div key={c} data-mode={c} className={`absolute grid size-6 place-items-center ${cls}`} style={{ cursor }}>
              <span className="size-3.5 rounded-sm border border-ink bg-sheet shadow" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
