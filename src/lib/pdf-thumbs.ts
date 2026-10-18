// Small helpers shared by the page-level PDF tools: range formatting and
// "what the reader sees" page geometry (crop box + /Rotate).

import type { PDFPage } from "pdf-lib";

export type QuarterTurn = 0 | 90 | 180 | 270;

/** Snap any angle to 0/90/180/270 (clockwise, like PDF /Rotate). */
export function quarterTurn(angle: number): QuarterTurn {
  const n = (((Math.round(angle / 90) * 90) % 360) + 360) % 360;
  return n as QuarterTurn;
}

/** Compress sorted 1-based pages into "1-3, 5, 8-9". */
export function formatRanges(pages: Iterable<number>): string {
  const sorted = [...new Set(pages)].sort((a, b) => a - b);
  const parts: string[] = [];
  let i = 0;
  while (i < sorted.length) {
    let j = i;
    while (j + 1 < sorted.length && sorted[j + 1] === sorted[j] + 1) j++;
    parts.push(i === j ? `${sorted[i]}` : `${sorted[i]}-${sorted[j]}`);
    i = j + 1;
  }
  return parts.join(", ");
}

/**
 * A page as the reader sees it. `width`/`height` are the on-screen (rotated)
 * size in points; `toPdf` maps a point measured from the on-screen bottom-left
 * corner into the page's own coordinate space. Anything drawn with
 * `rotate: degrees(rotation + a)` at a mapped point appears turned by `a`
 * (counter-clockwise) on screen.
 */
export interface PageFrame {
  width: number;
  height: number;
  rotation: QuarterTurn;
  toPdf: (x: number, y: number) => { x: number; y: number };
}

export function pageFrame(page: Pick<PDFPage, "getCropBox" | "getRotation">): PageFrame {
  const box = page.getCropBox();
  const rotation = quarterTurn(page.getRotation().angle);
  const { x: x0, y: y0, width: w, height: h } = box;
  const sideways = rotation === 90 || rotation === 270;
  const toPdf = (x: number, y: number) => {
    switch (rotation) {
      case 90:
        return { x: x0 + w - y, y: y0 + x };
      case 180:
        return { x: x0 + w - x, y: y0 + h - y };
      case 270:
        return { x: x0 + y, y: y0 + h - x };
      default:
        return { x: x0 + x, y: y0 + y };
    }
  };
  return { width: sideways ? h : w, height: sideways ? w : h, rotation, toPdf };
}

/** Rotate a vector counter-clockwise by `deg` degrees. */
export function rotateVec(x: number, y: number, deg: number): { x: number; y: number } {
  const r = (deg * Math.PI) / 180;
  const c = Math.cos(r);
  const s = Math.sin(r);
  return { x: x * c - y * s, y: x * s + y * c };
}
