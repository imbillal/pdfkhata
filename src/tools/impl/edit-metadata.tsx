"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, ErrorNote, Field, FileDrop, FileRow, ResultBox, Sheet, SideSection, Workspace, inputClass } from "@/components/kit";
import { useT } from "@/i18n/LocaleProvider";
import { downloadBytes, errorMessage, formatBytes, renameFile } from "@/lib/files";
import { PDF_MIME, savePdf } from "@/lib/pdf";

type Key = "title" | "author" | "subject" | "keywords" | "creator" | "producer";
type Meta = Record<Key, string>;

const EMPTY: Meta = { title: "", author: "", subject: "", keywords: "", creator: "", producer: "" };

/** Info-dictionary key for each field. */
const INFO_KEY: Record<Key, string> = {
  title: "Title",
  author: "Author",
  subject: "Subject",
  keywords: "Keywords",
  creator: "Creator",
  producer: "Producer",
};

async function openDoc(file: File) {
  const { PDFDocument } = await import("pdf-lib");
  // updateMetadata: false, or pdf-lib overwrites Producer/Creator/dates on load.
  return PDFDocument.load(await file.arrayBuffer(), { updateMetadata: false });
}

interface Loaded {
  file: File;
  original: Meta;
  pages: number;
  created?: Date;
  modified?: Date;
}

export default function EditMetadata() {
  const t = useT();
  const [file, setFile] = useState<File | null>(null);
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [meta, setMeta] = useState<Meta>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Uint8Array | null>(null);

  const pick = useCallback((files: File[]) => {
    setFile(files[0] ?? null);
    setResult(null);
    setError(null);
  }, []);

  useEffect(() => {
    if (!file) return;
    let cancelled = false;
    openDoc(file)
      .then((doc) => {
        if (cancelled) return;
        const original: Meta = {
          title: doc.getTitle() ?? "",
          author: doc.getAuthor() ?? "",
          subject: doc.getSubject() ?? "",
          keywords: doc.getKeywords() ?? "",
          creator: doc.getCreator() ?? "",
          producer: doc.getProducer() ?? "",
        };
        setLoaded({ file, original, pages: doc.getPageCount(), created: doc.getCreationDate(), modified: doc.getModificationDate() });
        setMeta(original);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(errorMessage(err));
      });
    return () => {
      cancelled = true;
    };
  }, [file]);

  const info = loaded && loaded.file === file ? loaded : null;

  const save = useCallback(async () => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const { PDFDict, PDFName } = await import("pdf-lib");
      const doc = await openDoc(file);
      const set: Record<Key, (v: string) => void> = {
        title: (v) => doc.setTitle(v),
        author: (v) => doc.setAuthor(v),
        subject: (v) => doc.setSubject(v),
        keywords: (v) =>
          doc.setKeywords(
            v
              .split(/[,;]/)
              .map((k) => k.trim())
              .filter(Boolean),
          ),
        creator: (v) => doc.setCreator(v),
        producer: (v) => doc.setProducer(v),
      };
      const cleared: Key[] = [];
      for (const key of Object.keys(INFO_KEY) as Key[]) {
        const value = meta[key].trim();
        if (value) set[key](value);
        else cleared.push(key);
      }
      doc.setModificationDate(new Date());
      const infoRef = doc.context.trailerInfo.Info;
      const dict = infoRef ? doc.context.lookupMaybe(infoRef, PDFDict) : undefined;
      for (const key of cleared) dict?.delete(PDFName.of(INFO_KEY[key]));
      // Old XMP metadata would contradict the new values in many viewers, so drop it.
      doc.catalog.delete(PDFName.of("Metadata"));
      setResult(await savePdf(doc));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }, [file, meta]);

  if (!file) {
    return (
      <FileDrop
        accept=".pdf,application/pdf"
        onFiles={pick}
        hint={t({ en: "See and change a PDF's title, author, subject and keywords.", bn: "PDF-এর শিরোনাম, লেখক, বিষয় ও কিওয়ার্ড দেখুন ও বদলান।" })}
      />
    );
  }

  const labels: Record<Key, { label: string; hint?: string }> = {
    title: { label: t({ en: "Title", bn: "শিরোনাম" }) },
    author: { label: t({ en: "Author", bn: "লেখক" }) },
    subject: { label: t({ en: "Subject", bn: "বিষয়" }) },
    keywords: { label: t({ en: "Keywords", bn: "কিওয়ার্ড" }), hint: t({ en: "Separate with commas.", bn: "কমা দিয়ে আলাদা করুন।" }) },
    creator: { label: t({ en: "Creator (app that made it)", bn: "ক্রিয়েটর (যে অ্যাপে তৈরি)" }) },
    producer: { label: t({ en: "Producer (PDF library)", bn: "প্রডিউসার (PDF লাইব্রেরি)" }) },
  };
  const fmtDate = (d?: Date) =>
    d && !Number.isNaN(d.getTime())
      ? d.toLocaleString(t.locale === "bn" ? "bn-BD" : "en-GB", { dateStyle: "medium", timeStyle: "short" })
      : "—";
  const dirty = info ? (Object.keys(meta) as Key[]).some((k) => meta[k] !== info.original[k]) : false;

  return (
    <Workspace
      main={
        <Sheet>
          <FileRow file={file} onRemove={() => pick([])} />
          {info ? (
            <div className="mt-4 flex flex-col gap-4">
              {(Object.keys(INFO_KEY) as Key[]).map((key) => (
                <Field key={key} label={labels[key].label} hint={labels[key].hint}>
                  {(id) =>
                    key === "subject" ? (
                      <textarea
                        id={id}
                        rows={2}
                        className={`${inputClass} resize-y`}
                        value={meta[key]}
                        onChange={(e) => {
                          setMeta((m) => ({ ...m, [key]: e.target.value }));
                          setResult(null);
                        }}
                      />
                    ) : (
                      <input
                        id={id}
                        className={inputClass}
                        value={meta[key]}
                        placeholder={t({ en: "(empty)", bn: "(ফাঁকা)" })}
                        onChange={(e) => {
                          setMeta((m) => ({ ...m, [key]: e.target.value }));
                          setResult(null);
                        }}
                      />
                    )
                  }
                </Field>
              ))}
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 border-t border-rule pt-3 text-sm">
                <dt className="text-ink-3">{t({ en: "Pages", bn: "পৃষ্ঠা" })}</dt>
                <dd className="text-ink-2">{t.n(info.pages)}</dd>
                <dt className="text-ink-3">{t({ en: "Created", bn: "তৈরি" })}</dt>
                <dd className="text-ink-2">{fmtDate(info.created)}</dd>
                <dt className="text-ink-3">{t({ en: "Last modified", bn: "সর্বশেষ পরিবর্তন" })}</dt>
                <dd className="text-ink-2">{fmtDate(info.modified)}</dd>
              </dl>
            </div>
          ) : (
            !error && <p className="mt-4 text-sm text-ink-3">{t({ en: "Reading metadata…", bn: "মেটাডেটা পড়া হচ্ছে…" })}</p>
          )}
        </Sheet>
      }
      side={
        <>
          <SideSection title={t({ en: "Metadata", bn: "মেটাডেটা" })}>
            <p className="text-sm text-ink-2">
              {t({ en: "Empty fields are removed from the file.", bn: "ফাঁকা ঘরগুলো ফাইল থেকে মুছে যাবে।" })}
            </p>
            <Button onClick={save} busy={busy} disabled={!info}>
              {t({ en: "Save PDF", bn: "PDF সেভ করুন" })}
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="secondary"
                className="px-2"
                disabled={!info}
                onClick={() => {
                  setMeta(EMPTY);
                  setResult(null);
                }}
              >
                {t({ en: "Clear all", bn: "সব মুছুন" })}
              </Button>
              <Button
                variant="secondary"
                className="px-2"
                disabled={!info || !dirty}
                onClick={() => {
                  if (info) setMeta(info.original);
                  setResult(null);
                }}
              >
                {t({ en: "Undo edits", bn: "আগের মতো করুন" })}
              </Button>
            </div>
          </SideSection>
          <ErrorNote message={error} />
          {result && (
            <ResultBox title={t({ en: "Metadata saved", bn: "মেটাডেটা সেভ হয়েছে" })} detail={formatBytes(result.byteLength)}>
              <Button onClick={() => downloadBytes(result, renameFile(file.name, "-edited.pdf"), PDF_MIME)}>
                {t({ en: "Download PDF", bn: "PDF ডাউনলোড করুন" })}
              </Button>
            </ResultBox>
          )}
        </>
      }
    />
  );
}
