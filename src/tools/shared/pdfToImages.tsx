"use client";

// Shared by pdf-to-jpg and pdf-to-png: render each page with pdf.js and encode it.

import { useCallback, useEffect, useRef, useState } from "react";
import { Button, ErrorNote, Field, FileDrop, FileRow, Progress, ResultBox, Segmented, Sheet, SideSection, Workspace, inputClass } from "@/components/kit";
import { downloadBlob, downloadZip, errorMessage, formatBytes, renameFile } from "@/lib/files";
import { loadPdfJs, parsePageRanges, renderPage } from "@/lib/pdf";
import { canvasToBlob } from "@/lib/image";
import { useT } from "@/i18n/LocaleProvider";

type Dpi = "72" | "150" | "300";

interface PageImage {
  page: number;
  name: string;
  blob: Blob;
  url: string;
  width: number;
  height: number;
}

// Stay under the smallest common canvas limit (iOS Safari: ~16.7M pixels, 16384px per side).
const MAX_PIXELS = 16_000_000;
const MAX_SIDE = 16_000;

export default function PdfToImages({ format }: { format: "jpg" | "png" }) {
  const t = useT();
  const mime = format === "jpg" ? "image/jpeg" : "image/png";
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [dpi, setDpi] = useState<Dpi>("150");
  const [quality, setQuality] = useState(90);
  const [range, setRange] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<PageImage[]>([]);
  const [downsized, setDownsized] = useState(false);
  const cancelled = useRef(false);
  const imagesRef = useRef<PageImage[]>([]);

  const replaceImages = useCallback((next: PageImage[]) => {
    for (const img of imagesRef.current) URL.revokeObjectURL(img.url);
    imagesRef.current = next;
    setImages(next);
  }, []);

  // Revoke preview URLs when leaving the page.
  useEffect(
    () => () => {
      for (const img of imagesRef.current) URL.revokeObjectURL(img.url);
    },
    [],
  );

  const pick = useCallback(
    async (files: File[]) => {
      const f = files[0];
      if (!f) return;
      replaceImages([]);
      setError(null);
      setFile(f);
      setPageCount(null);
      setRange("");
      try {
        const doc = await loadPdfJs(f);
        setPageCount(doc.numPages);
        await doc.loadingTask.destroy();
      } catch (err) {
        setError(errorMessage(err, t({ en: "This file couldn't be read as a PDF.", bn: "এই ফাইলটি PDF হিসেবে পড়া যায়নি।" })));
      }
    },
    [replaceImages, t],
  );

  const reset = useCallback(() => {
    replaceImages([]);
    setFile(null);
    setPageCount(null);
    setError(null);
  }, [replaceImages]);

  const convert = useCallback(async () => {
    if (!file) return;
    setBusy(true);
    setError(null);
    setDownsized(false);
    replaceImages([]);
    cancelled.current = false;
    let doc: Awaited<ReturnType<typeof loadPdfJs>> | null = null;
    const made: PageImage[] = [];
    try {
      doc = await loadPdfJs(file);
      const pages = range.trim() ? parsePageRanges(range, doc.numPages) : Array.from({ length: doc.numPages }, (_, i) => i + 1);
      if (pages.length === 0) throw new Error(t({ en: "Pick at least one page.", bn: "অন্তত একটি পৃষ্ঠা বেছে নিন।" }));
      const digits = String(doc.numPages).length;
      const wanted = Number(dpi) / 72;
      setProgress({ done: 0, total: pages.length });
      for (const [i, n] of pages.entries()) {
        if (cancelled.current) break;
        const page = await doc.getPage(n);
        const base = page.getViewport({ scale: 1 });
        const scale = Math.min(wanted, Math.sqrt(MAX_PIXELS / (base.width * base.height)), MAX_SIDE / Math.max(base.width, base.height));
        if (scale < wanted * 0.99) setDownsized(true);
        const canvas = await renderPage(doc, n, scale);
        const blob = await canvasToBlob(canvas, mime, format === "jpg" ? quality / 100 : undefined);
        made.push({
          page: n,
          name: `${renameFile(file.name, "")}-page-${String(n).padStart(digits, "0")}.${format}`,
          blob,
          url: URL.createObjectURL(blob),
          width: canvas.width,
          height: canvas.height,
        });
        // Free the bitmap memory right away; big pages add up fast.
        canvas.width = 0;
        canvas.height = 0;
        setProgress({ done: i + 1, total: pages.length });
      }
      replaceImages([...made]);
    } catch (err) {
      for (const img of made) URL.revokeObjectURL(img.url);
      setError(errorMessage(err));
    } finally {
      await doc?.loadingTask.destroy();
      setBusy(false);
      setProgress(null);
    }
  }, [file, range, dpi, quality, format, mime, replaceImages, t]);

  const downloadAll = useCallback(async () => {
    if (!file) return;
    if (images.length === 1) {
      downloadBlob(images[0].blob, images[0].name);
      return;
    }
    try {
      await downloadZip(
        images.map((img) => ({ name: img.name, data: img.blob })),
        `${renameFile(file.name, "")}-${format}.zip`,
      );
    } catch (err) {
      setError(errorMessage(err, t({ en: "Couldn't build the ZIP file.", bn: "ZIP ফাইল তৈরি করা যায়নি।" })));
    }
  }, [file, images, format, t]);

  if (!file) {
    return (
      <FileDrop
        accept=".pdf,application/pdf"
        onFiles={pick}
        hint={t({
          en: `Each page becomes a ${format.toUpperCase()} image. Nothing leaves your device.`,
          bn: `প্রতিটি পৃষ্ঠা একটি ${format.toUpperCase()} ছবি হবে। কোনো ফাইল আপনার ডিভাইসের বাইরে যায় না।`,
        })}
      />
    );
  }

  const totalSize = images.reduce((sum, img) => sum + img.blob.size, 0);
  const label = format.toUpperCase();

  return (
    <Workspace
      main={
        <Sheet>
          <FileRow file={file} onRemove={busy ? undefined : reset}>
            {pageCount !== null && <span className="text-xs whitespace-nowrap text-ink-3">{t({ en: `${t.n(pageCount)} pages`, bn: `${t.n(pageCount)} পৃষ্ঠা` })}</span>}
          </FileRow>
          {progress && (
            <div className="mt-4">
              <Progress value={progress.done / progress.total} label={t({
                  en: `Rendering page ${t.n(Math.min(progress.done + 1, progress.total))} of ${t.n(progress.total)}…`,
                  bn: `${t.n(progress.total)}টির মধ্যে ${t.n(Math.min(progress.done + 1, progress.total))} নম্বর পৃষ্ঠা তৈরি হচ্ছে…`,
                })} />
            </div>
          )}
          {images.length > 0 && (
            <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {images.map((img) => (
                <li key={img.page}>
                  <button
                    type="button"
                    onClick={() => downloadBlob(img.blob, img.name)}
                    className="group flex w-full flex-col gap-1.5 rounded-md border border-rule bg-paper p-2 text-left hover:border-ink-3"
                    title={t({ en: `Download page ${t.n(img.page)}`, bn: `পৃষ্ঠা ${t.n(img.page)} ডাউনলোড করুন` })}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
                    <img src={img.url} alt={t({ en: `Page ${t.n(img.page)}`, bn: `পৃষ্ঠা ${t.n(img.page)}` })} className="aspect-[3/4] w-full rounded-sm bg-sheet object-contain" />
                    <span className="flex items-baseline justify-between gap-2 text-xs text-ink-3">
                      <span className="font-medium text-ink-2">{t({ en: `Page ${t.n(img.page)}`, bn: `পৃষ্ঠা ${t.n(img.page)}` })}</span>
                      <span className="group-hover:text-margin">{formatBytes(img.blob.size)} ↓</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Sheet>
      }
      side={
        <>
          <SideSection title={t({ en: "Options", bn: "অপশন" })}>
            <Field
              label={t({ en: "Resolution", bn: "রেজোলিউশন" })}
              hint={t({ en: "72 for screens, 150 for most uses, 300 for print.", bn: "স্ক্রিনের জন্য ৭২, সাধারণ কাজে ১৫০, প্রিন্টের জন্য ৩০০।" })}
            >
              {() => (
                <Segmented
                  label={t({ en: "Resolution", bn: "রেজোলিউশন" })}
                  value={dpi}
                  onChange={setDpi}
                  options={[
                    { value: "72", label: `${t.n(72)} dpi` },
                    { value: "150", label: `${t.n(150)} dpi` },
                    { value: "300", label: `${t.n(300)} dpi` },
                  ]}
                />
              )}
            </Field>
            {format === "jpg" && (
              <Field label={t({ en: `Quality: ${t.n(quality)}%`, bn: `মান: ${t.n(quality)}%` })}>
                {(id) => (
                  <input
                    id={id}
                    type="range"
                    min={40}
                    max={100}
                    step={1}
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full accent-margin"
                  />
                )}
              </Field>
            )}
            <Field
              label={t({ en: "Pages", bn: "পৃষ্ঠা" })}
              hint={t({
                en: "Leave empty for all pages. e.g. 1-3, 5, 8-",
                bn: "সব পৃষ্ঠার জন্য খালি রাখুন। যেমন: 1-3, 5, 8-",
              })}
            >
              {(id) => (
                <input
                  id={id}
                  className={inputClass}
                  value={range}
                  onChange={(e) => setRange(e.target.value)}
                  placeholder={t({ en: "All pages", bn: "সব পৃষ্ঠা" })}
                  inputMode="numeric"
                />
              )}
            </Field>
            {busy ? (
              <Button
                variant="secondary"
                onClick={() => {
                  cancelled.current = true;
                }}
              >
                {t({ en: "Stop", bn: "থামান" })}
              </Button>
            ) : (
              <Button onClick={convert} disabled={pageCount === null}>
                {t({ en: `Convert to ${label}`, bn: `${label}-এ রূপান্তর করুন` })}
              </Button>
            )}
          </SideSection>
          <ErrorNote message={error} />
          {images.length > 0 && (
            <ResultBox
              title={t({ en: `${t.n(images.length)} image${images.length === 1 ? "" : "s"} ready`, bn: `${t.n(images.length)}টি ছবি তৈরি` })}
              detail={t({
                en: `${t.n(images[0].width)}×${t.n(images[0].height)}px${images.length > 1 ? " (first page)" : ""} · ${formatBytes(totalSize)} total`,
                bn: `${t.n(images[0].width)}×${t.n(images[0].height)}px${images.length > 1 ? " (প্রথম পৃষ্ঠা)" : ""} · মোট ${formatBytes(totalSize)}`,
              })}
            >
              <Button onClick={downloadAll}>{images.length === 1
                  ? t({ en: `Download ${label}`, bn: `${label} ডাউনলোড করুন` })
                  : t({ en: "Download all (ZIP)", bn: "সব ডাউনলোড করুন (ZIP)" })}</Button>
              {downsized && <p className="w-full text-xs text-ink-3">
                  {t({
                    en: "Some pages were very large, so they were rendered at a lower resolution to fit browser limits.",
                    bn: "কিছু পৃষ্ঠা অনেক বড় ছিল, তাই ব্রাউজারের সীমার মধ্যে রাখতে কম রেজোলিউশনে তৈরি করা হয়েছে।",
                  })}
                </p>}
              {images.length > 1 && <p className="w-full text-xs text-ink-3">{t({ en: "Click any page to save it on its own.", bn: "আলাদাভাবে সেভ করতে যেকোনো পৃষ্ঠায় ক্লিক করুন।" })}</p>}
            </ResultBox>
          )}
        </>
      }
    />
  );
}
