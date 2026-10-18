"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button, ErrorNote, Field, FileDrop, Progress, ResultBox, Segmented, Sheet, SideSection, Workspace } from "@/components/kit";
import { downloadBytes, errorMessage, formatBytes, renameFile } from "@/lib/files";
import { PDF_MIME, savePdf } from "@/lib/pdf";
import { canvasToBlob, loadImage, makeCanvas } from "@/lib/image";
import { useT, type Translator } from "@/i18n/LocaleProvider";

/* ---------- Pure helpers ---------- */

// PURE-START
export interface JpegInfo {
  /** EXIF orientation 1–8, or null when the file has none. */
  orientation: number | null;
  /** Colour components from the SOF header: 1 = grey, 3 = YCbCr/RGB, 4 = CMYK. */
  components: number | null;
}

/** Read EXIF orientation and the colour component count from JPEG bytes. Returns null if it isn't a JPEG. */
export function readJpegInfo(bytes: Uint8Array): JpegInfo | null {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const info: JpegInfo = { orientation: null, components: null };
  let pos = 2;
  while (pos + 4 <= bytes.length) {
    if (bytes[pos] !== 0xff) return info;
    const marker = bytes[pos + 1];
    if (marker === 0xff) {
      pos++; // fill byte
      continue;
    }
    if (marker === 0xd9 || marker === 0xda) break; // end of image / start of scan
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      pos += 2;
      continue;
    }
    const len = view.getUint16(pos + 2);
    const start = pos + 4;
    const end = pos + 2 + len;
    if (len < 2 || end > bytes.length) break;

    const isSof = marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (isSof && start + 6 <= end) info.components = bytes[start + 5];

    // APP1 "Exif\0\0" + TIFF header.
    if (marker === 0xe1 && start + 14 <= end && view.getUint32(start) === 0x45786966 && view.getUint16(start + 4) === 0) {
      const tiff = start + 6;
      const little = view.getUint16(tiff) === 0x4949;
      const u16 = (o: number) => view.getUint16(o, little);
      const u32 = (o: number) => view.getUint32(o, little);
      if (u16(tiff + 2) === 42) {
        const ifd = tiff + u32(tiff + 4);
        if (ifd + 2 <= end) {
          const count = u16(ifd);
          for (let i = 0; i < count; i++) {
            const entry = ifd + 2 + i * 12;
            if (entry + 12 > end) break;
            if (u16(entry) === 0x0112) {
              const value = u16(entry + 8);
              if (value >= 1 && value <= 8) info.orientation = value;
              break;
            }
          }
        }
      }
    }
    pos = end;
  }
  return info;
}

export type PageSize = "fit" | "a4" | "letter";
export type Orientation = "auto" | "portrait" | "landscape";
export type Margin = "none" | "small" | "large";

const SIZES: Record<Exclude<PageSize, "fit">, [number, number]> = {
  a4: [595.28, 841.89],
  letter: [612, 792],
};
const MARGINS: Record<Margin, number> = { none: 0, small: 24, large: 54 };
/** PDF viewers refuse pages larger than 200 inches. */
const MAX_PAGE = 14_400;

export interface Placement {
  pageWidth: number;
  pageHeight: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Work out page size and where the image sits on it. Image size is in pixels, treated as 96 dpi. */
export function placeImage(pxWidth: number, pxHeight: number, size: PageSize, orientation: Orientation, margin: Margin): Placement {
  const m = MARGINS[margin];
  const imgW = (pxWidth * 72) / 96;
  const imgH = (pxHeight * 72) / 96;

  if (size === "fit") {
    const shrink = Math.min(1, (MAX_PAGE - 2 * m) / imgW, (MAX_PAGE - 2 * m) / imgH);
    const width = imgW * shrink;
    const height = imgH * shrink;
    return { pageWidth: width + 2 * m, pageHeight: height + 2 * m, x: m, y: m, width, height };
  }

  const [short, long] = SIZES[size];
  const landscape = orientation === "landscape" || (orientation === "auto" && pxWidth > pxHeight);
  const pageWidth = landscape ? long : short;
  const pageHeight = landscape ? short : long;
  const boxW = pageWidth - 2 * m;
  const boxH = pageHeight - 2 * m;
  const scale = Math.min(boxW / imgW, boxH / imgH);
  const width = imgW * scale;
  const height = imgH * scale;
  return { pageWidth, pageHeight, x: (pageWidth - width) / 2, y: (pageHeight - height) / 2, width, height };
}
// PURE-END

/* ---------- Image preparation ---------- */

interface Prepared {
  kind: "jpg" | "png";
  bytes: Uint8Array;
  width: number;
  height: number;
}

// Stay inside the smallest common canvas limit (iOS Safari).
const MAX_PIXELS = 16_000_000;

const isPng = (b: Uint8Array) => b.length > 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47;

async function decode(file: File): Promise<{ source: CanvasImageSource; width: number; height: number; close: () => void }> {
  try {
    const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
    return { source: bmp, width: bmp.width, height: bmp.height, close: () => bmp.close() };
  } catch {
    // Older browsers: <img> also applies EXIF orientation.
    const img = await loadImage(file);
    return { source: img, width: img.naturalWidth, height: img.naturalHeight, close: () => undefined };
  }
}

function hasTransparency(ctx: CanvasRenderingContext2D, width: number, height: number): boolean {
  const data = ctx.getImageData(0, 0, width, height).data;
  for (let i = 3; i < data.length; i += 4) if (data[i] < 255) return true;
  return false;
}

/** Re-encode through a canvas: applies EXIF rotation, converts WebP/GIF/etc., flattens CMYK. */
async function viaCanvas(file: File, keepPng: boolean, t: Translator): Promise<Prepared> {
  const img = await decode(file).catch(() => {
    const heic = /\.hei[cf]$/i.test(file.name);
    throw new Error(
      t({
        en: `${file.name} couldn't be opened as an image${heic ? " (HEIC only opens in Safari — convert it to JPG first)" : ""}.`,
        bn: `${file.name} ছবি হিসেবে খোলা যায়নি${heic ? " (HEIC শুধু Safari-তে খোলে — আগে JPG-তে রূপান্তর করুন)" : ""}।`,
      }),
    );
  });
  try {
    const fit = Math.min(1, Math.sqrt(MAX_PIXELS / (img.width * img.height)));
    const [canvas, ctx] = makeCanvas(img.width * fit, img.height * fit);
    ctx.drawImage(img.source, 0, 0, canvas.width, canvas.height);
    const png = keepPng || hasTransparency(ctx, canvas.width, canvas.height);
    const blob = await canvasToBlob(canvas, png ? "image/png" : "image/jpeg", png ? undefined : 0.92);
    const result: Prepared = { kind: png ? "png" : "jpg", bytes: new Uint8Array(await blob.arrayBuffer()), width: canvas.width, height: canvas.height };
    canvas.width = 0;
    canvas.height = 0;
    return result;
  } finally {
    img.close();
  }
}

/** Use the original bytes when they can go into the PDF as-is (keeps full quality and small size). */
async function prepare(file: File, t: Translator): Promise<Prepared> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const jpeg = readJpegInfo(bytes);
  if (jpeg) {
    const upright = jpeg.orientation === null || jpeg.orientation === 1;
    const plainColour = jpeg.components === 1 || jpeg.components === 3;
    if (upright && plainColour) return { kind: "jpg", bytes, width: 0, height: 0 };
    return viaCanvas(file, false, t);
  }
  if (isPng(bytes)) return { kind: "png", bytes, width: 0, height: 0 };
  return viaCanvas(file, file.type === "image/gif" || file.type === "image/bmp", t);
}

/* ---------- Tool ---------- */

interface Item {
  id: number;
  file: File;
  url: string;
}

interface Result {
  bytes: Uint8Array;
  pages: number;
  name: string;
}

export default function ImageToPdf() {
  const t = useT();
  const [items, setItems] = useState<Item[]>([]);
  const [broken, setBroken] = useState<Set<number>>(new Set());
  const [size, setSize] = useState<PageSize>("a4");
  const [orientation, setOrientation] = useState<Orientation>("auto");
  const [margin, setMargin] = useState<Margin>("small");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const nextId = useRef(1);
  const itemsRef = useRef<Item[]>([]);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // Revoke thumbnail URLs on unmount.
  useEffect(
    () => () => {
      for (const item of itemsRef.current) URL.revokeObjectURL(item.url);
    },
    [],
  );

  const addFiles = useCallback((added: File[]) => {
    const images = added.filter((f) => f.type.startsWith("image/") || /\.(jpe?g|png|webp|gif|bmp|avif|heic|heif|tiff?)$/i.test(f.name));
    if (images.length < added.length) setError(t({ en: "Some files were skipped because they aren't images.", bn: "কিছু ফাইল ছবি না হওয়ায় বাদ দেওয়া হয়েছে।" }));
    else setError(null);
    setItems((prev) => [...prev, ...images.map((file) => ({ id: nextId.current++, file, url: URL.createObjectURL(file) }))]);
    setResult(null);
  }, [t]);

  const move = useCallback((index: number, delta: number) => {
    setItems((prev) => {
      const target = index + delta;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setResult(null);
  }, []);

  const remove = useCallback((id: number) => {
    setItems((prev) => {
      const gone = prev.find((it) => it.id === id);
      if (gone) URL.revokeObjectURL(gone.url);
      return prev.filter((it) => it.id !== id);
    });
    setResult(null);
  }, []);

  const build = useCallback(async () => {
    setBusy(true);
    setError(null);
    setResult(null);
    setProgress(0);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const doc = await PDFDocument.create();
      for (const [i, item] of items.entries()) {
        let prepared = await prepare(item.file, t);
        let embedded;
        try {
          embedded = prepared.kind === "jpg" ? await doc.embedJpg(prepared.bytes) : await doc.embedPng(prepared.bytes);
        } catch {
          // pdf-lib can't read every JPEG/PNG variant; the browser can.
          prepared = await viaCanvas(item.file, prepared.kind === "png", t);
          embedded = prepared.kind === "jpg" ? await doc.embedJpg(prepared.bytes) : await doc.embedPng(prepared.bytes);
        }
        const place = placeImage(embedded.width, embedded.height, size, orientation, margin);
        const page = doc.addPage([place.pageWidth, place.pageHeight]);
        page.drawImage(embedded, { x: place.x, y: place.y, width: place.width, height: place.height });
        setProgress((i + 1) / items.length);
      }
      doc.setProducer("PDFKhata");
      doc.setCreator("PDFKhata");
      const name = items.length === 1 ? renameFile(items[0].file.name, ".pdf") : "images.pdf";
      setResult({ bytes: await savePdf(doc), pages: doc.getPageCount(), name });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
      setProgress(null);
    }
  }, [items, size, orientation, margin, t]);

  if (items.length === 0) {
    return (
      <>
        <FileDrop
          accept="image/*,.heic,.heif"
          multiple
          onFiles={addFiles}
          hint={t({ en: "JPG, PNG, WebP and more. Each image becomes one page.", bn: "JPG, PNG, WebP সহ আরও অনেক ধরন। প্রতিটি ছবি একটি পৃষ্ঠা হবে।" })}
        />
        <div className="mt-3">
          <ErrorNote message={error} />
        </div>
      </>
    );
  }

  return (
    <Workspace
      main={
        <Sheet>
          <p className="mb-2 text-sm text-ink-3">{t({ en: "Pages follow this order, top to bottom.", bn: "পৃষ্ঠাগুলো ওপর থেকে নিচে এই ক্রমে থাকবে।" })}</p>
          <ol>
            {items.map((item, i) => (
              <li key={item.id} className="flex items-center gap-3 border-b border-rule py-2.5 last:border-b-0">
                <span className="w-5 shrink-0 text-right font-mono text-xs text-ink-3">{t.n(i + 1)}</span>
                <div className="grid size-14 shrink-0 place-items-center overflow-hidden rounded border border-rule bg-paper-2">
                  {broken.has(item.id) ? (
                    <span className="font-mono text-[10px] text-ink-2 uppercase">{item.file.name.split(".").pop()?.slice(0, 4)}</span>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element -- local blob preview
                    <img
                      src={item.url}
                      alt=""
                      className="size-full object-contain"
                      onError={() => setBroken((prev) => new Set(prev).add(item.id))}
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.file.name}</p>
                  <p className="text-xs text-ink-3">{formatBytes(item.file.size)}</p>
                </div>
                <Button variant="ghost" className="px-2 py-1" aria-label={t({ en: "Move up", bn: "ওপরে সরান" })} disabled={i === 0 || busy} onClick={() => move(i, -1)}>
                  ↑
                </Button>
                <Button variant="ghost" className="px-2 py-1" aria-label={t({ en: "Move down", bn: "নিচে সরান" })} disabled={i === items.length - 1 || busy} onClick={() => move(i, 1)}>
                  ↓
                </Button>
                <button
                  type="button"
                  onClick={() => remove(item.id)}
                  disabled={busy}
                  aria-label={t({ en: `Remove ${item.file.name}`, bn: `${item.file.name} সরিয়ে ফেলুন` })}
                  className="rounded p-1.5 text-ink-3 hover:bg-paper-2 hover:text-margin disabled:opacity-50"
                >
                  <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                    <path d="m5 5 10 10M15 5 5 15" strokeLinecap="round" />
                  </svg>
                </button>
              </li>
            ))}
          </ol>
          <div className="mt-4">
            <FileDrop accept="image/*,.heic,.heif" multiple onFiles={addFiles} title={t({ en: "Add more images", bn: "আরও ছবি যোগ করুন" })} />
          </div>
        </Sheet>
      }
      side={
        <>
          <SideSection title={t({ en: "Page", bn: "পৃষ্ঠা" })}>
            <Field label={t({ en: "Page size", bn: "পৃষ্ঠার মাপ" })}>
              {() => (
                <Segmented
                  label={t({ en: "Page size", bn: "পৃষ্ঠার মাপ" })}
                  value={size}
                  onChange={(v) => {
                    setSize(v);
                    setResult(null);
                  }}
                  options={[
                    { value: "fit", label: t({ en: "Fit image", bn: "ছবির মাপে" }) },
                    { value: "a4", label: "A4" },
                    { value: "letter", label: "Letter" },
                  ]}
                />
              )}
            </Field>
            {size !== "fit" && (
              <Field
                label={t({ en: "Orientation", bn: "দিক" })}
                hint={orientation === "auto" ? t({ en: "Wide images get landscape pages.", bn: "চওড়া ছবির জন্য আড়াআড়ি পৃষ্ঠা হবে।" }) : undefined}
              >
                {() => (
                  <Segmented
                    label={t({ en: "Orientation", bn: "দিক" })}
                    value={orientation}
                    onChange={(v) => {
                      setOrientation(v);
                      setResult(null);
                    }}
                    options={[
                      { value: "auto", label: t({ en: "Auto", bn: "অটো" }) },
                      { value: "portrait", label: t({ en: "Portrait", bn: "লম্বালম্বি" }) },
                      { value: "landscape", label: t({ en: "Landscape", bn: "আড়াআড়ি" }) },
                    ]}
                  />
                )}
              </Field>
            )}
            <Field label={t({ en: "Margin", bn: "মার্জিন" })}>
              {() => (
                <Segmented
                  label={t({ en: "Margin", bn: "মার্জিন" })}
                  value={margin}
                  onChange={(v) => {
                    setMargin(v);
                    setResult(null);
                  }}
                  options={[
                    { value: "none", label: t({ en: "None", bn: "নেই" }) },
                    { value: "small", label: t({ en: "Small", bn: "অল্প" }) },
                    { value: "large", label: t({ en: "Large", bn: "বেশি" }) },
                  ]}
                />
              )}
            </Field>
          </SideSection>
          <SideSection title={t({ en: "Create", bn: "তৈরি করুন" })}>
            <p className="text-sm text-ink-2">
              {t({
                en: `${t.n(items.length)} image${items.length === 1 ? "" : "s"} → ${t.n(items.length)} page${items.length === 1 ? "" : "s"}.`,
                bn: `${t.n(items.length)}টি ছবি → ${t.n(items.length)} পৃষ্ঠা।`,
              })}
            </p>
            {progress !== null && <Progress value={progress} label={t({ en: "Adding images…", bn: "ছবি যোগ করা হচ্ছে…" })} />}
            <Button onClick={build} busy={busy}>
              {t({ en: "Create PDF", bn: "PDF তৈরি করুন" })}
            </Button>
          </SideSection>
          <ErrorNote message={error} />
          {result && (
            <ResultBox
              title={t({ en: "PDF ready", bn: "PDF তৈরি হয়েছে" })}
              detail={t({
                en: `${t.n(result.pages)} page${result.pages === 1 ? "" : "s"} · ${formatBytes(result.bytes.byteLength)}`,
                bn: `${t.n(result.pages)} পৃষ্ঠা · ${formatBytes(result.bytes.byteLength)}`,
              })}
            >
              <Button onClick={() => downloadBytes(result.bytes, result.name, PDF_MIME)}>{t({ en: "Download PDF", bn: "PDF ডাউনলোড করুন" })}</Button>
            </ResultBox>
          )}
        </>
      }
    />
  );
}
