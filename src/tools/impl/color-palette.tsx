"use client";

import { useMemo, useState, type PointerEvent } from "react";
import { Segmented, Sheet, SideSection, Workspace } from "@/components/kit";
import { useT } from "@/i18n/LocaleProvider";
import { CanvasView, CopyButton, ImageHeader, SingleImageDrop, useSingleImage } from "@/tools/shared/imageKit";

type RGB = [number, number, number];

/* ---------- Colour maths ---------- */

const hex = (c: RGB) => `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`.toUpperCase();
const rgbText = (c: RGB) => `rgb(${c[0]}, ${c[1]}, ${c[2]})`;

function hslText([r, g, b]: RGB): string {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0;
  let s = 0;
  if (d) {
    s = d / (1 - Math.abs(2 * l - 1));
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h = (h * 60 + 360) % 360;
  }
  return `hsl(${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

/** Text colour that stays readable on the swatch. */
function inkOn([r, g, b]: RGB): string {
  return 0.299 * r + 0.587 * g + 0.114 * b > 150 ? "#111111" : "#ffffff";
}

/** Weighted distance, roughly matching how the eye judges colour difference. */
function dist(a: RGB, b: RGB): number {
  const dr = a[0] - b[0];
  const dg = a[1] - b[1];
  const db = a[2] - b[2];
  return 2 * dr * dr + 4 * dg * dg + 3 * db * db;
}

/* ---------- Palette extraction: median cut seeds, refined by k-means ---------- */

interface Swatch {
  rgb: RGB;
  share: number;
}

function extractPalette(data: Uint8ClampedArray, k: number): Swatch[] {
  const total = data.length / 4;
  const stride = Math.max(1, Math.floor(total / 20000));
  const px: RGB[] = [];
  for (let i = 0; i < total; i += stride) {
    const o = i * 4;
    if (data[o + 3] >= 128) px.push([data[o], data[o + 1], data[o + 2]]);
  }
  if (px.length === 0) return [];

  // Median cut: split the box with the widest channel range until there are k boxes.
  let boxes: RGB[][] = [px];
  while (boxes.length < k) {
    let best = -1;
    let bestRange = 0;
    let bestCh = 0;
    boxes.forEach((box, bi) => {
      if (box.length < 2) return;
      for (let ch = 0; ch < 3; ch++) {
        let lo = 255;
        let hi = 0;
        for (const p of box) {
          if (p[ch] < lo) lo = p[ch];
          if (p[ch] > hi) hi = p[ch];
        }
        if (hi - lo > bestRange) {
          bestRange = hi - lo;
          best = bi;
          bestCh = ch;
        }
      }
    });
    if (best < 0) break;
    const box = [...boxes[best]].sort((a, b) => a[bestCh] - b[bestCh]);
    const mid = box.length >> 1;
    boxes = [...boxes.slice(0, best), box.slice(0, mid), box.slice(mid), ...boxes.slice(best + 1)];
  }
  const centroids: RGB[] = boxes.map((box) => {
    const sum = [0, 0, 0];
    for (const p of box) for (let c = 0; c < 3; c++) sum[c] += p[c];
    return [sum[0] / box.length, sum[1] / box.length, sum[2] / box.length];
  });

  // k-means refinement.
  const assign = new Int32Array(px.length);
  const counts = new Array<number>(centroids.length).fill(0);
  for (let iter = 0; iter < 8; iter++) {
    counts.fill(0);
    const sums = centroids.map(() => [0, 0, 0]);
    for (let i = 0; i < px.length; i++) {
      let bi = 0;
      let bd = Infinity;
      for (let c = 0; c < centroids.length; c++) {
        const d = dist(px[i], centroids[c]);
        if (d < bd) {
          bd = d;
          bi = c;
        }
      }
      assign[i] = bi;
      counts[bi]++;
      for (let ch = 0; ch < 3; ch++) sums[bi][ch] += px[i][ch];
    }
    centroids.forEach((_, c) => {
      if (counts[c]) centroids[c] = [sums[c][0] / counts[c], sums[c][1] / counts[c], sums[c][2] / counts[c]];
    });
  }

  // Biggest clusters first; drop near-duplicates.
  const ranked = centroids
    .map((c, i) => ({ rgb: c.map((v) => Math.round(v)) as RGB, share: counts[i] / px.length }))
    .filter((s) => s.share > 0)
    .sort((a, b) => b.share - a.share);
  const out: Swatch[] = [];
  for (const s of ranked) if (!out.some((o) => dist(o.rgb, s.rgb) < 1200)) out.push(s);
  return out;
}

/* ---------- UI ---------- */

function ColourCodes({ rgb }: { rgb: RGB }) {
  const codes = [hex(rgb), rgbText(rgb), hslText(rgb)];
  return (
    <div className="flex flex-col gap-1.5">
      {codes.map((code) => (
        <div key={code} className="flex items-center justify-between gap-2">
          <code className="truncate font-mono text-sm text-ink">{code}</code>
          <CopyButton text={code} />
        </div>
      ))}
    </div>
  );
}

export default function ColorPalette() {
  const t = useT();
  const { image, loading, error, load, clear } = useSingleImage(1600);
  const [count, setCount] = useState<"6" | "8">("8");
  const [hover, setHover] = useState<RGB | null>(null);
  const [picked, setPicked] = useState<RGB[]>([]);

  const pixels = useMemo(() => {
    if (!image) return null;
    const ctx = image.preview.getContext("2d");
    return ctx ? ctx.getImageData(0, 0, image.preview.width, image.preview.height) : null;
  }, [image]);

  const palette = useMemo(() => (pixels ? extractPalette(pixels.data, Number(count)) : []), [pixels, count]);

  if (!image || !pixels) {
    return (
      <SingleImageDrop
        loading={loading}
        error={error}
        onFile={(f) => {
          setPicked([]);
          load(f);
        }}
        hint={t({ en: "Click the image to pick colours. A palette is pulled out automatically.", bn: "ছবিতে ক্লিক করে রং নিন। প্যালেট নিজে থেকেই বের হবে।" })}
      />
    );
  }

  const colourAt = (e: PointerEvent<HTMLDivElement>): RGB => {
    const box = e.currentTarget.getBoundingClientRect();
    const x = Math.min(pixels.width - 1, Math.max(0, Math.floor(((e.clientX - box.left) / box.width) * pixels.width)));
    const y = Math.min(pixels.height - 1, Math.max(0, Math.floor(((e.clientY - box.top) / box.height) * pixels.height)));
    const o = (y * pixels.width + x) * 4;
    return [pixels.data[o], pixels.data[o + 1], pixels.data[o + 2]];
  };

  const current = picked[0] ?? null;

  return (
    <Workspace
      main={
        <Sheet>
          <ImageHeader image={image} onChange={clear} />
          <div className="flex justify-center">
            <div
              className="w-fit max-w-full touch-none"
              style={{ cursor: "crosshair" }}
              onPointerMove={(e) => setHover(colourAt(e))}
              onPointerLeave={() => setHover(null)}
              onPointerDown={(e) => {
                const c = colourAt(e);
                setPicked((prev) => [c, ...prev.filter((p) => hex(p) !== hex(c))].slice(0, 12));
              }}
            >
              <CanvasView canvas={image.preview} label={t({ en: "Click to pick a colour", bn: "রং নিতে ক্লিক করুন" })} />
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-ink-2">{t({ en: "Palette", bn: "প্যালেট" })}</h3>
              <div className="flex items-center gap-2">
                <div className="w-28">
                  <Segmented
                    label={t({ en: "Number of colours", bn: "রঙের সংখ্যা" })}
                    value={count}
                    onChange={setCount}
                    options={[
                      { value: "6", label: t.n(6) },
                      { value: "8", label: t.n(8) },
                    ]}
                  />
                </div>
                <CopyButton text={palette.map((s) => hex(s.rgb)).join(", ")} label={t({ en: "Copy all", bn: "সব কপি" })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {palette.map((s) => (
                <button
                  key={hex(s.rgb)}
                  type="button"
                  onClick={() => setPicked((prev) => [s.rgb, ...prev.filter((p) => hex(p) !== hex(s.rgb))].slice(0, 12))}
                  className="flex h-20 flex-col justify-end rounded-md border border-rule p-2 text-left"
                  style={{ backgroundColor: hex(s.rgb), color: inkOn(s.rgb) }}
                  aria-label={t({ en: `Select ${hex(s.rgb)}`, bn: `${hex(s.rgb)} বেছে নিন` })}
                >
                  <span className="font-mono text-sm font-medium">{hex(s.rgb)}</span>
                  <span className="text-xs opacity-80">{t.n(Math.round(s.share * 100))}%</span>
                </button>
              ))}
            </div>
          </div>
        </Sheet>
      }
      side={
        <>
          <SideSection title={t({ en: "Under the pointer", bn: "পয়েন্টারের নিচে" })}>
            <div className="flex items-center gap-3">
              <span className="size-10 shrink-0 rounded-md border border-rule" style={hover ? { backgroundColor: hex(hover) } : undefined} />
              <span className="font-mono text-sm text-ink-2">
                {hover ? hex(hover) : t({ en: "Move over the image", bn: "ছবির ওপর নিয়ে যান" })}
              </span>
            </div>
          </SideSection>
          <SideSection title={t({ en: "Picked colour", bn: "বাছাই করা রং" })}>
            {current ? (
              <>
                <div className="h-16 rounded-md border border-rule" style={{ backgroundColor: hex(current) }} />
                <ColourCodes rgb={current} />
                {picked.length > 1 && (
                  <div className="flex flex-wrap gap-1.5">
                    {picked.map((c) => (
                      <button
                        key={hex(c)}
                        type="button"
                        title={hex(c)}
                        aria-label={t({ en: `Select ${hex(c)}`, bn: `${hex(c)} বেছে নিন` })}
                        onClick={() => setPicked((prev) => [c, ...prev.filter((p) => hex(p) !== hex(c))])}
                        className="size-7 rounded border border-rule"
                        style={{ backgroundColor: hex(c) }}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-ink-3">
                {t({ en: "Click anywhere on the image, or on a palette swatch.", bn: "ছবির যেকোনো জায়গায় বা প্যালেটের কোনো রঙে ক্লিক করুন।" })}
              </p>
            )}
          </SideSection>
        </>
      }
    />
  );
}
