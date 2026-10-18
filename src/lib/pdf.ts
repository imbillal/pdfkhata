// PDF helpers shared by the PDF tools. pdf-lib edits documents; pdf.js renders and reads text.
// Both are imported lazily so the home page stays light.

import type { PDFDocument } from "pdf-lib";
import type { PDFDocumentProxy } from "pdfjs-dist";

export const PDF_MIME = "application/pdf";

export async function loadPdfLib(file: File | ArrayBuffer): Promise<PDFDocument> {
  const { PDFDocument } = await import("pdf-lib");
  const bytes = file instanceof File ? await file.arrayBuffer() : file;
  return PDFDocument.load(bytes, { ignoreEncryption: false });
}

let workerReady = false;

/** Open a PDF with pdf.js (for rendering pages and reading text). */
export async function loadPdfJs(file: File | ArrayBuffer): Promise<PDFDocumentProxy> {
  const pdfjs = await import("pdfjs-dist");
  if (!workerReady) {
    pdfjs.GlobalWorkerOptions.workerSrc = "/vendor/pdf.worker.min.mjs";
    workerReady = true;
  }
  const data = new Uint8Array(file instanceof File ? await file.arrayBuffer() : file.slice(0));
  return pdfjs.getDocument({ data }).promise;
}

/** Render one page (1-based) to a canvas at the given scale (1 = 72 dpi). */
export async function renderPage(doc: PDFDocumentProxy, pageNumber: number, scale: number): Promise<HTMLCanvasElement> {
  const page = await doc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available in this browser.");
  // White background so JPG exports of transparent pages aren't black.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvas, canvasContext: ctx, viewport }).promise;
  page.cleanup();
  return canvas;
}

/**
 * Parse a page range like "1-3, 5, 8-" into sorted, unique 1-based page numbers.
 * Throws a readable error for anything out of bounds.
 */
export function parsePageRanges(input: string, pageCount: number): number[] {
  const pages = new Set<number>();
  for (const raw of input.split(",")) {
    const part = raw.trim();
    if (!part) continue;
    const m = part.match(/^(\d*)\s*-\s*(\d*)$/);
    if (m) {
      const start = m[1] ? Number(m[1]) : 1;
      const end = m[2] ? Number(m[2]) : pageCount;
      if (start < 1 || end > pageCount || start > end) throw new Error(`“${part}” is outside pages 1–${pageCount}.`);
      for (let p = start; p <= end; p++) pages.add(p);
    } else if (/^\d+$/.test(part)) {
      const p = Number(part);
      if (p < 1 || p > pageCount) throw new Error(`Page ${p} doesn't exist (this PDF has ${pageCount}).`);
      pages.add(p);
    } else {
      throw new Error(`Couldn't read “${part}”. Use numbers like 1-3, 5.`);
    }
  }
  return [...pages].sort((a, b) => a - b);
}

/** Split a range string into groups, e.g. "1-3, 4-6" → [[1,2,3],[4,5,6]]. */
export function parseRangeGroups(input: string, pageCount: number): number[][] {
  return input
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((part) => parsePageRanges(part, pageCount));
}

export async function savePdf(doc: PDFDocument): Promise<Uint8Array> {
  return doc.save({ useObjectStreams: true });
}
