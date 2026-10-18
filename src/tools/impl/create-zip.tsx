"use client";

import { useCallback, useState } from "react";
import { Button, ErrorNote, Field, FileDrop, FileRow, Progress, ResultBox, Sheet, SideSection, Workspace, inputClass } from "@/components/kit";
import { downloadBlob, errorMessage, formatBytes } from "@/lib/files";
import { useT } from "@/i18n/LocaleProvider";

interface Result {
  blob: Blob;
  name: string;
}

/** Give duplicate names a " (2)" suffix so JSZip doesn't overwrite one file with another. */
function uniqueNames(files: File[]): string[] {
  const used = new Set<string>();
  return files.map((f) => {
    const name = f.name || "file";
    if (!used.has(name.toLowerCase())) {
      used.add(name.toLowerCase());
      return name;
    }
    const dot = name.lastIndexOf(".");
    const base = dot > 0 ? name.slice(0, dot) : name;
    const ext = dot > 0 ? name.slice(dot) : "";
    for (let i = 2; ; i++) {
      const candidate = `${base} (${i})${ext}`;
      if (!used.has(candidate.toLowerCase())) {
        used.add(candidate.toLowerCase());
        return candidate;
      }
    }
  });
}

function zipFileName(raw: string): string {
  const clean = raw.trim().replace(/[\\/:*?"<>|]+/g, "_") || "archive";
  return /\.zip$/i.test(clean) ? clean : `${clean}.zip`;
}

export default function CreateZip() {
  const t = useT();
  const [files, setFiles] = useState<File[]>([]);
  const [level, setLevel] = useState(6);
  const [name, setName] = useState("archive");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const addFiles = useCallback((added: File[]) => {
    setFiles((prev) => [...prev, ...added]);
    setResult(null);
  }, []);

  const remove = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setResult(null);
  }, []);

  const total = files.reduce((n, f) => n + f.size, 0);

  const create = useCallback(async () => {
    setBusy(true);
    setError(null);
    setResult(null);
    setProgress(0);
    try {
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();
      const names = uniqueNames(files);
      files.forEach((f, i) => zip.file(names[i], f, { date: new Date(f.lastModified || Date.now()) }));
      const blob = await zip.generateAsync(
        {
          type: "blob",
          compression: level === 0 ? "STORE" : "DEFLATE",
          compressionOptions: { level: Math.max(1, level) },
          mimeType: "application/zip",
        },
        (meta) => setProgress(meta.percent / 100),
      );
      setResult({ blob, name: zipFileName(name) });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }, [files, level, name]);

  if (files.length === 0) {
    return (
      <FileDrop
        multiple
        onFiles={addFiles}
        hint={t({ en: "Any files. They're zipped right here in your browser.", bn: "যেকোনো ফাইল। আপনার ব্রাউজারেই জিপ করা হবে।" })}
      />
    );
  }

  const levelLabel =
    level === 0
      ? t({ en: "Store only (no compression, fastest)", bn: "শুধু রাখুন (কমপ্রেশন নেই, সবচেয়ে দ্রুত)" })
      : level <= 3
        ? t({ en: "Fast", bn: "দ্রুত" })
        : level <= 6
          ? t({ en: "Balanced", bn: "মাঝামাঝি" })
          : t({ en: "Smallest (slower)", bn: "সবচেয়ে ছোট (ধীর)" });

  return (
    <Workspace
      main={
        <Sheet>
          <p className="mb-2 text-sm text-ink-3">
            {t({
              en: `${t.n(files.length)} file(s) · ${formatBytes(total)}`,
              bn: `${t.n(files.length)}টি ফাইল · ${formatBytes(total)}`,
            })}
          </p>
          {files.map((file, i) => (
            <FileRow key={`${file.name}-${file.size}-${i}`} file={file} onRemove={() => remove(i)} />
          ))}
          <div className="mt-4">
            <FileDrop multiple onFiles={addFiles} title={t({ en: "Add more files", bn: "আরও ফাইল যোগ করুন" })} />
          </div>
        </Sheet>
      }
      side={
        <>
          <SideSection title={t({ en: "ZIP", bn: "জিপ" })}>
            <Field label={t({ en: "File name", bn: "ফাইলের নাম" })}>
              {(id) => (
                <input
                  id={id}
                  className={inputClass}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setResult(null);
                  }}
                />
              )}
            </Field>
            <Field label={`${t({ en: "Compression", bn: "কমপ্রেশন" })}: ${t.n(level)}`} hint={levelLabel}>
              {(id) => (
                <input
                  id={id}
                  type="range"
                  min={0}
                  max={9}
                  value={level}
                  onChange={(e) => {
                    setLevel(Number(e.target.value));
                    setResult(null);
                  }}
                  className="accent-margin"
                />
              )}
            </Field>
            <p className="text-xs text-ink-3">
              {t({
                en: "Photos, videos and PDFs are already compressed, so they barely shrink.",
                bn: "ছবি, ভিডিও ও PDF আগে থেকেই কমপ্রেস করা থাকে, তাই এগুলো খুব একটা ছোট হয় না।",
              })}
            </p>
            <Button onClick={() => void create()} busy={busy}>
              {t({ en: "Create ZIP", bn: "জিপ তৈরি করুন" })}
            </Button>
            {busy && <Progress value={progress} label={t({ en: "Compressing…", bn: "কমপ্রেস হচ্ছে…" })} />}
          </SideSection>
          <ErrorNote message={error} />
          {result && (
            <ResultBox
              title={t({ en: "ZIP ready", bn: "জিপ তৈরি" })}
              detail={`${formatBytes(total)} → ${formatBytes(result.blob.size)}${
                total > 0 ? ` (${t.n(Math.round((result.blob.size / total) * 100))}%)` : ""
              }`}
            >
              <Button onClick={() => downloadBlob(result.blob, result.name)}>{t({ en: "Download ZIP", bn: "জিপ ডাউনলোড" })}</Button>
            </ResultBox>
          )}
        </>
      }
    />
  );
}
