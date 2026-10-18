"use client";

// OCR with tesseract.js. The engine, worker and language models come from the
// jsDelivr CDN on first use and are cached by the browser after that.

import { useCallback, useEffect, useRef, useState } from "react";
import type { Worker as OcrWorker } from "tesseract.js";
import { Button, ErrorNote, Field, FileDrop, FileRow, Progress, ResultBox, Segmented, Sheet, SideSection, TextArea, Workspace, inputClass } from "@/components/kit";
import { downloadText, errorMessage, renameFile } from "@/lib/files";
import { loadImage, makeCanvas } from "@/lib/image";
import { loadPdfJs, parsePageRanges, renderPage } from "@/lib/pdf";
import { useT, type Translator } from "@/i18n/LocaleProvider";

type Lang = "ben+eng" | "ben" | "eng";

interface Section {
  title: string;
  text: string;
}

// Keep canvases inside mobile Safari's limit; OCR doesn't gain anything past this.
const MAX_PIXELS = 16_000_000;
const PDF_SCALE = 2;

const isPdf = (f: File) => f.type === "application/pdf" || /\.pdf$/i.test(f.name);

/** Decode an image upright (EXIF orientation applied) onto a canvas. */
async function imageToCanvas(file: File, t: Translator): Promise<HTMLCanvasElement> {
  let source: CanvasImageSource;
  let width: number;
  let height: number;
  let close: () => void = () => undefined;
  try {
    const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
    source = bmp;
    width = bmp.width;
    height = bmp.height;
    close = () => bmp.close();
  } catch {
    try {
      const img = await loadImage(file);
      source = img;
      width = img.naturalWidth;
      height = img.naturalHeight;
    } catch {
      throw new Error(t({ en: `${file.name} couldn't be opened as an image.`, bn: `${file.name} ছবি হিসেবে খোলা যায়নি।` }));
    }
  }
  try {
    const fit = Math.min(1, Math.sqrt(MAX_PIXELS / (width * height)));
    const [canvas, ctx] = makeCanvas(width * fit, height * fit);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
    return canvas;
  } finally {
    close();
  }
}

function statusLabel(status: string, t: Translator): string {
  if (status.includes("traineddata")) return t({ en: "Downloading language data…", bn: "ভাষার ডেটা ডাউনলোড হচ্ছে…" });
  if (status.includes("initializing tesseract") || status.includes("core")) return t({ en: "Loading OCR engine…", bn: "OCR ইঞ্জিন লোড হচ্ছে…" });
  if (status.includes("initializ")) return t({ en: "Getting ready…", bn: "প্রস্তুত হচ্ছে…" });
  return t({ en: "Working…", bn: "কাজ চলছে…" });
}

export default function BanglaOcr() {
  const t = useT();
  const [files, setFiles] = useState<File[]>([]);
  const [lang, setLang] = useState<Lang>("ben+eng");
  const [range, setRange] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ label: string; value: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sections, setSections] = useState<Section[] | null>(null);
  const [copied, setCopied] = useState(false);
  /** User edits to the recognised text; null means "show what OCR produced". */
  const [draft, setDraft] = useState<string | null>(null);
  const workerRef = useRef<OcrWorker | null>(null);
  const cancelled = useRef(false);

  // Never leave a worker running after the page is closed.
  useEffect(
    () => () => {
      void workerRef.current?.terminate();
      workerRef.current = null;
    },
    [],
  );

  const addFiles = useCallback(
    (added: File[]) => {
      const usable = added.filter((f) => isPdf(f) || f.type.startsWith("image/") || /\.(jpe?g|png|webp|gif|bmp|avif|tiff?)$/i.test(f.name));
      setError(usable.length < added.length ? t({ en: "Some files were skipped. Use images or PDFs.", bn: "কিছু ফাইল বাদ দেওয়া হয়েছে। ছবি বা PDF দিন।" }) : null);
      setFiles((prev) => [...prev, ...usable]);
      setSections(null);
    },
    [t],
  );

  const remove = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setSections(null);
  }, []);

  const run = useCallback(async () => {
    setBusy(true);
    setError(null);
    setSections(null);
    setDraft(null);
    cancelled.current = false;
    setStatus({ label: t({ en: "Loading OCR engine…", bn: "OCR ইঞ্জিন লোড হচ্ছে…" }), value: 0 });

    type Job = { title: string; file: File; page?: number };
    const docs = new Map<File, Awaited<ReturnType<typeof loadPdfJs>>>();
    const out: Section[] = [];
    // Progress bookkeeping shared with the tesseract logger.
    const track = { done: 0, total: 1, recognizing: false };
    try {
      // Work out every page up front so progress is honest.
      const jobs: Job[] = [];
      const pdfCount = files.filter(isPdf).length;
      for (const file of files) {
        if (!isPdf(file)) {
          jobs.push({ title: file.name, file });
          continue;
        }
        const doc = await loadPdfJs(file).catch((err: unknown) => {
          throw new Error(`${file.name}: ${errorMessage(err, t({ en: "couldn't be read as a PDF.", bn: "PDF হিসেবে পড়া যায়নি।" }))}`);
        });
        docs.set(file, doc);
        const pages = range.trim() && pdfCount === 1 ? parsePageRanges(range, doc.numPages) : Array.from({ length: doc.numPages }, (_, i) => i + 1);
        for (const page of pages) jobs.push({ title: `${file.name} · ${t({ en: "Page", bn: "পৃষ্ঠা" })} ${t.n(page)}`, file, page });
      }
      if (jobs.length === 0) throw new Error(t({ en: "Nothing to read.", bn: "পড়ার মতো কিছু নেই।" }));
      track.total = jobs.length;

      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker(lang, 1, {
        logger: (m) => {
          if (m.status === "recognizing text") {
            const label =
              track.total > 1
                ? t({ en: `Reading page ${t.n(track.done + 1)} of ${t.n(track.total)}…`, bn: `${t.n(track.total)}টির মধ্যে ${t.n(track.done + 1)} নম্বর পৃষ্ঠা পড়া হচ্ছে…` })
                : t({ en: "Reading text…", bn: "লেখা পড়া হচ্ছে…" });
            setStatus({ label, value: (track.done + m.progress) / track.total });
          } else if (!track.recognizing) {
            setStatus({ label: statusLabel(m.status, t), value: m.progress });
          }
        },
      });
      workerRef.current = worker;
      if (cancelled.current) throw new DOMException("cancelled", "AbortError");

      for (const job of jobs) {
        if (cancelled.current) break;
        track.recognizing = true;
        setStatus({
          label: t({ en: `Preparing page ${t.n(track.done + 1)} of ${t.n(track.total)}…`, bn: `${t.n(track.total)}টির মধ্যে ${t.n(track.done + 1)} নম্বর পৃষ্ঠা প্রস্তুত হচ্ছে…` }),
          value: track.done / track.total,
        });
        const doc = docs.get(job.file);
        const canvas = doc && job.page ? await renderPage(doc, job.page, PDF_SCALE) : await imageToCanvas(job.file, t);
        const { data } = await worker.recognize(canvas);
        canvas.width = 0;
        canvas.height = 0;
        out.push({ title: job.title, text: data.text.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim() });
        track.done++;
        setSections([...out]);
      }
    } catch (err) {
      // Stopping terminates the worker mid-job, which rejects the current call; that's not an error.
      if (!cancelled.current) setError(errorMessage(err));
    } finally {
      for (const doc of docs.values()) void doc.loadingTask.destroy();
      const worker = workerRef.current;
      workerRef.current = null;
      if (worker) await worker.terminate().catch(() => undefined);
      setSections(out.length ? out : null);
      setStatus(null);
      setBusy(false);
    }
  }, [files, lang, range, t]);

  const stop = useCallback(() => {
    cancelled.current = true;
    void workerRef.current?.terminate();
  }, []);

  if (files.length === 0) {
    return (
      <>
        <FileDrop
          accept="image/*,.pdf,application/pdf"
          multiple
          onFiles={addFiles}
          hint={t({ en: "Photos, scans or scanned PDFs. Everything runs in your browser.", bn: "ছবি, স্ক্যান বা স্ক্যান করা PDF। সব কাজ আপনার ব্রাউজারেই হয়।" })}
        />
        <div className="mt-3">
          <ErrorNote message={error} />
        </div>
      </>
    );
  }

  const text = draft ?? (!sections ? "" : (sections.length === 1 ? sections[0].text : sections.map((s) => `--- ${s.title} ---\n${s.text}`).join("\n\n")));
  const pdfCount = files.filter(isPdf).length;
  const charCount = text.replace(/\s/g, "").length;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setError(t({ en: "Couldn't copy automatically. Select the text and copy it by hand.", bn: "স্বয়ংক্রিয়ভাবে কপি করা যায়নি। লেখাটি সিলেক্ট করে নিজে কপি করুন।" }));
    }
  };

  return (
    <Workspace
      main={
        <Sheet>
          {files.map((file, i) => (
            <FileRow key={`${file.name}-${i}`} file={file} onRemove={busy ? undefined : () => remove(i)} />
          ))}
          {!busy && (
            <div className="mt-4">
              <FileDrop accept="image/*,.pdf,application/pdf" multiple onFiles={addFiles} title={t({ en: "Add more files", bn: "আরও ফাইল যোগ করুন" })} />
            </div>
          )}
          {status && (
            <div className="mt-4">
              <Progress value={status.value} label={status.label} />
            </div>
          )}
          {sections && (
            <div className="mt-4">
              <TextArea
                readOnly={busy}
                value={text}
                onChange={(e) => setDraft(e.target.value)}
                aria-label={t({ en: "Recognised text", bn: "শনাক্ত করা লেখা" })}
                className="min-h-[28rem] font-sans"
                lang={lang === "eng" ? "en" : "bn"}
                spellCheck={false}
              />
              <p className="mt-2 text-xs text-ink-3">
                {t({ en: "OCR isn't perfect — check names and numbers before you use the text. You can edit it here.", bn: "OCR শতভাগ নির্ভুল নয় — ব্যবহারের আগে নাম ও সংখ্যা মিলিয়ে নিন। এখানেই লেখা ঠিক করে নিতে পারেন।" })}
              </p>
            </div>
          )}
        </Sheet>
      }
      side={
        <>
          <SideSection title={t({ en: "Language", bn: "ভাষা" })}>
            <Segmented
              label={t({ en: "Language", bn: "ভাষা" })}
              value={lang}
              onChange={(v) => {
                setLang(v);
                setSections(null);
              }}
              options={[
                { value: "ben+eng", label: t({ en: "Bangla + English", bn: "বাংলা + ইংরেজি" }) },
                { value: "ben", label: t({ en: "Bangla", bn: "বাংলা" }) },
                { value: "eng", label: t({ en: "English", bn: "ইংরেজি" }) },
              ]}
            />
            <p className="text-xs text-ink-3">
              {lang === "eng"
                ? t({ en: "First run downloads about 4 MB of English language data; after that it's cached.", bn: "প্রথমবার প্রায় ৪ MB ইংরেজি ভাষার ডেটা ডাউনলোড হবে; পরে ব্রাউজারে জমা থাকবে।" })
                : t({ en: "First run downloads about 10 MB of Bangla language data; after that it's cached.", bn: "প্রথমবার প্রায় ১০ MB বাংলা ভাষার ডেটা ডাউনলোড হবে; পরে ব্রাউজারে জমা থাকবে।" })}
            </p>
          </SideSection>
          {pdfCount === 1 && (
            <SideSection title={t({ en: "PDF pages", bn: "PDF পৃষ্ঠা" })}>
              <Field label={t({ en: "Pages to read", bn: "যে পৃষ্ঠাগুলো পড়বেন" })} hint={t({ en: "Leave empty for all pages. e.g. 1-3, 5", bn: "সব পৃষ্ঠার জন্য খালি রাখুন। যেমন: 1-3, 5" })}>
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
            </SideSection>
          )}
          <SideSection title={t({ en: "Read text", bn: "লেখা পড়ুন" })}>
            {busy ? (
              <Button variant="secondary" onClick={stop}>
                {t({ en: "Stop", bn: "থামান" })}
              </Button>
            ) : (
              <Button onClick={run}>{t({ en: "Start OCR", bn: "OCR শুরু করুন" })}</Button>
            )}
            <p className="text-xs text-ink-3">
              {t({
                en: "Best results: straight, well-lit scans with clear print. Handwriting is not supported well.",
                bn: "ভালো ফলের জন্য: সোজা, পরিষ্কার আলোয় তোলা ও স্পষ্ট ছাপা লেখার স্ক্যান দিন। হাতের লেখা ভালোভাবে পড়া যায় না।",
              })}
            </p>
          </SideSection>
          <ErrorNote message={error} />
          {sections && !busy && (
            <ResultBox
              title={t({ en: "Text ready", bn: "লেখা তৈরি" })}
              detail={t({
                en: `${t.n(sections.length)} page${sections.length === 1 ? "" : "s"} · ${t.n(charCount)} characters`,
                bn: `${t.n(sections.length)} পৃষ্ঠা · ${t.n(charCount)} অক্ষর`,
              })}
            >
              <Button onClick={copy}>{copied ? t({ en: "Copied", bn: "কপি হয়েছে" }) : t({ en: "Copy text", bn: "লেখা কপি করুন" })}</Button>
              <Button variant="secondary" onClick={() => downloadText(text, files.length === 1 ? renameFile(files[0].name, "-ocr.txt") : "ocr.txt")}>
                {t({ en: "Download .txt", bn: ".txt ডাউনলোড করুন" })}
              </Button>
            </ResultBox>
          )}
        </>
      }
    />
  );
}
