"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type JSZip from "jszip";
import { Button, ErrorNote, FileDrop, Progress, Sheet, SideSection, Workspace } from "@/components/kit";
import { downloadBlob, errorMessage, formatBytes } from "@/lib/files";
import { useT } from "@/i18n/LocaleProvider";
import { Toggle } from "@/tools/shared/textKit";

interface Entry {
  path: string;
  name: string;
  dir: string;
  depth: number;
  size: number | null;
  date: Date;
  obj: JSZip.JSZipObject;
}

// Minimal File System Access API typings (Chromium only).
interface WritableLike {
  write(data: Blob): Promise<void>;
  close(): Promise<void>;
}
interface FileHandleLike {
  createWritable(): Promise<WritableLike>;
}
interface DirHandleLike {
  getDirectoryHandle(name: string, opts: { create: boolean }): Promise<DirHandleLike>;
  getFileHandle(name: string, opts: { create: boolean }): Promise<FileHandleLike>;
}
type PickerWindow = Window & { showDirectoryPicker?: (opts?: { mode?: "readwrite" }) => Promise<DirHandleLike> };

const TEXT_EXT = /\.(txt|md|csv|tsv|json|xml|html?|css|js|mjs|ts|tsx|jsx|yml|yaml|ini|cfg|conf|log|py|java|c|h|cpp|rs|go|rb|php|sh|sql|svg|toml|env)$/i;
const IMAGE_EXT = /\.(png|jpe?g|gif|webp|bmp|avif|ico|svg)$/i;
const IMAGE_MIME: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  bmp: "image/bmp",
  avif: "image/avif",
  ico: "image/x-icon",
  svg: "image/svg+xml",
};
const MAX_TEXT_PREVIEW = 256 * 1024;

/** Uncompressed size from JSZip's internal record; not part of the public API, so guard it. */
function sizeOf(obj: JSZip.JSZipObject): number | null {
  const data = (obj as unknown as { _data?: { uncompressedSize?: unknown } })._data;
  return typeof data?.uncompressedSize === "number" ? data.uncompressedSize : null;
}

/** Drop "..", "." and empty segments so a hostile archive can't escape the chosen folder. */
function safeSegments(path: string): string[] {
  return path
    .split(/[\\/]+/)
    .filter((s) => s && s !== "." && s !== "..")
    .map((s) => s.replace(/[:*?"<>|]/g, "_"));
}

const isJunk = (path: string) => /(^|\/)__MACOSX\//.test(path) || /(^|\/)\.DS_Store$/.test(path) || /(^|\/)Thumbs\.db$/i.test(path);

type Preview = { path: string; kind: "text"; text: string; truncated: boolean } | { path: string; kind: "image"; url: string };

export default function Unzip() {
  const t = useT();
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hideJunk, setHideJunk] = useState(true);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [extracting, setExtracting] = useState<number | null>(null);
  const [done, setDone] = useState<string | null>(null);

  // Revoke image preview URLs when they're replaced or the tool unmounts.
  useEffect(() => {
    if (preview?.kind !== "image") return;
    const url = preview.url;
    return () => URL.revokeObjectURL(url);
  }, [preview]);

  const describe = useCallback(
    (err: unknown) => {
      const msg = err instanceof Error ? err.message : "";
      if (/encrypted/i.test(msg))
        return t({
          en: "This ZIP is password-protected. Encrypted archives can't be opened in the browser — use 7-Zip or your system's unzip tool.",
          bn: "এই জিপটি পাসওয়ার্ড দিয়ে সুরক্ষিত। এনক্রিপ্ট করা আর্কাইভ ব্রাউজারে খোলা যায় না — 7-Zip বা কম্পিউটারের আনজিপ টুল ব্যবহার করুন।",
        });
      if (/end of central directory|is this a zip file|corrupted zip|invalid signature/i.test(msg))
        return t({ en: "This doesn't look like a valid ZIP file, or it's damaged.", bn: "এটি সঠিক জিপ ফাইল মনে হচ্ছে না, অথবা ফাইলটি নষ্ট।" });
      if (/compression/i.test(msg) && /not supported|unsupported/i.test(msg))
        return t({ en: "This ZIP uses a compression method the browser can't read (only Deflate and Store work).", bn: "এই জিপে এমন কমপ্রেশন পদ্ধতি আছে যা ব্রাউজার পড়তে পারে না (শুধু Deflate ও Store চলে)।" });
      return errorMessage(err);
    },
    [t],
  );

  const open = useCallback(
    async (files: File[]) => {
      const f = files[0];
      setZipFile(f);
      setEntries([]);
      setPreview(null);
      setDone(null);
      setError(null);
      setLoading(true);
      try {
        const { default: JSZipLib } = await import("jszip");
        const zip = await JSZipLib.loadAsync(f);
        const list: Entry[] = Object.values(zip.files)
          .filter((o) => !o.dir)
          .map((o) => {
            const parts = o.name.split("/");
            return {
              path: o.name,
              name: parts[parts.length - 1],
              dir: parts.slice(0, -1).join("/"),
              depth: parts.length - 1,
              size: sizeOf(o),
              date: o.date,
              obj: o,
            };
          })
          .sort((a, b) => (a.dir === b.dir ? a.name.localeCompare(b.name) : a.dir.localeCompare(b.dir)));
        setEntries(list);
      } catch (err) {
        setError(describe(err));
      } finally {
        setLoading(false);
      }
    },
    [describe],
  );

  const visible = useMemo(() => (hideJunk ? entries.filter((e) => !isJunk(e.path)) : entries), [entries, hideJunk]);
  const totalSize = visible.reduce((n, e) => n + (e.size ?? 0), 0);

  const downloadOne = useCallback(
    async (e: Entry) => {
      setError(null);
      try {
        downloadBlob(await e.obj.async("blob"), e.name);
      } catch (err) {
        setError(describe(err));
      }
    },
    [describe],
  );

  const showPreview = useCallback(
    async (e: Entry) => {
      setError(null);
      try {
        if (IMAGE_EXT.test(e.name)) {
          const ext = e.name.split(".").pop()?.toLowerCase() ?? "";
          const raw = await e.obj.async("blob");
          const blob = new Blob([raw], { type: IMAGE_MIME[ext] ?? "" });
          setPreview({ path: e.path, kind: "image", url: URL.createObjectURL(blob) });
        } else {
          const bytes = await e.obj.async("uint8array");
          const truncated = bytes.length > MAX_TEXT_PREVIEW;
          const text = new TextDecoder("utf-8").decode(truncated ? bytes.subarray(0, MAX_TEXT_PREVIEW) : bytes);
          setPreview({ path: e.path, kind: "text", text, truncated });
        }
      } catch (err) {
        setError(describe(err));
      }
    },
    [describe],
  );

  const canPickFolder = typeof window !== "undefined" && typeof (window as PickerWindow).showDirectoryPicker === "function";

  const extractAll = useCallback(async () => {
    setError(null);
    setDone(null);
    const picker = (window as PickerWindow).showDirectoryPicker;
    try {
      if (picker) {
        let root: DirHandleLike;
        try {
          root = await picker({ mode: "readwrite" });
        } catch {
          return; // user cancelled
        }
        setExtracting(0);
        for (let i = 0; i < visible.length; i++) {
          const segs = safeSegments(visible[i].path);
          if (segs.length === 0) continue;
          let dir = root;
          for (const s of segs.slice(0, -1)) dir = await dir.getDirectoryHandle(s, { create: true });
          const handle = await dir.getFileHandle(segs[segs.length - 1], { create: true });
          const w = await handle.createWritable();
          await w.write(await visible[i].obj.async("blob"));
          await w.close();
          setExtracting((i + 1) / visible.length);
        }
        setDone(t({ en: `Extracted ${t.n(visible.length)} files into the folder you chose.`, bn: `${t.n(visible.length)}টি ফাইল আপনার বেছে নেওয়া ফোল্ডারে রাখা হয়েছে।` }));
      } else {
        setExtracting(0);
        for (let i = 0; i < visible.length; i++) {
          downloadBlob(await visible[i].obj.async("blob"), visible[i].name);
          setExtracting((i + 1) / visible.length);
          // Space the downloads out; browsers drop rapid-fire ones.
          await new Promise((r) => setTimeout(r, 350));
        }
        setDone(t({ en: `Started ${t.n(visible.length)} downloads.`, bn: `${t.n(visible.length)}টি ডাউনলোড শুরু হয়েছে।` }));
      }
    } catch (err) {
      setError(describe(err));
    } finally {
      setExtracting(null);
    }
  }, [visible, describe, t]);

  if (!zipFile) {
    return <FileDrop accept=".zip,application/zip,application/x-zip-compressed" onFiles={(fs) => void open(fs)} hint={t({ en: "Open a .zip to see what's inside.", bn: "ভেতরে কী আছে দেখতে একটি .zip খুলুন।" })} />;
  }

  return (
    <Workspace
      main={
        <Sheet>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="min-w-0 truncate text-sm font-medium">{zipFile.name}</p>
            <Button variant="ghost" className="px-2 py-1" onClick={() => setZipFile(null)}>
              {t({ en: "Open another", bn: "অন্য ফাইল খুলুন" })}
            </Button>
          </div>
          {loading && <p className="text-sm text-ink-3">{t({ en: "Reading archive…", bn: "আর্কাইভ পড়া হচ্ছে…" })}</p>}
          {!loading && !error && visible.length === 0 && <p className="text-sm text-ink-3">{t({ en: "This ZIP has no files.", bn: "এই জিপে কোনো ফাইল নেই।" })}</p>}
          <ul className="flex flex-col">
            {visible.map((e, i) => {
              const header = e.dir && (i === 0 || visible[i - 1].dir !== e.dir) ? e.dir : null;
              return (
                <li key={e.path}>
                  {header && (
                    <p className="mt-3 flex items-center gap-1.5 border-b border-rule pb-1 font-mono text-xs text-ink-3">
                      {header}/
                    </p>
                  )}
                  <div className="flex items-center gap-2 border-b border-rule py-2 last:border-b-0" style={{ paddingLeft: `${Math.min(e.depth, 6) * 12}px` }}>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm" title={e.path}>
                        {e.name}
                      </p>
                      <p className="text-xs text-ink-3">{e.size !== null ? formatBytes(e.size) : "—"}</p>
                    </div>
                    {(IMAGE_EXT.test(e.name) || TEXT_EXT.test(e.name)) && (
                      <Button variant="ghost" className="px-2 py-1 text-xs" onClick={() => void showPreview(e)}>
                        {t({ en: "Preview", bn: "দেখুন" })}
                      </Button>
                    )}
                    <Button variant="secondary" className="px-2.5 py-1 text-xs" aria-label={`${t({ en: "Download", bn: "ডাউনলোড" })} ${e.name}`} onClick={() => void downloadOne(e)}>
                      {t({ en: "Download", bn: "ডাউনলোড" })}
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        </Sheet>
      }
      side={
        <>
          <SideSection title={t({ en: "Contents", bn: "ভেতরে যা আছে" })}>
            <p className="text-sm text-ink-2">
              {t({ en: `${t.n(visible.length)} files · ${formatBytes(totalSize)} unpacked`, bn: `${t.n(visible.length)}টি ফাইল · খোলার পর ${formatBytes(totalSize)}` })}
            </p>
            <Toggle checked={hideJunk} onChange={setHideJunk} label={t({ en: "Hide __MACOSX and .DS_Store clutter", bn: "__MACOSX ও .DS_Store জাতীয় অপ্রয়োজনীয় ফাইল লুকান" })} />
            <Button onClick={() => void extractAll()} disabled={visible.length === 0} busy={extracting !== null}>
              {canPickFolder ? t({ en: "Extract all to a folder…", bn: "সব একটি ফোল্ডারে বের করুন…" }) : t({ en: "Download all", bn: "সব ডাউনলোড করুন" })}
            </Button>
            {!canPickFolder && visible.length > 1 && (
              <p className="text-xs text-ink-3">
                {t({ en: "Your browser may ask to allow multiple downloads.", bn: "ব্রাউজার একাধিক ডাউনলোডের অনুমতি চাইতে পারে।" })}
              </p>
            )}
            {extracting !== null && <Progress value={extracting} label={t({ en: "Extracting…", bn: "বের করা হচ্ছে…" })} />}
            {done && <p className="text-sm text-ok">{done}</p>}
          </SideSection>
          <ErrorNote message={error} />
          {preview && (
            <SideSection title={t({ en: "Preview", bn: "প্রিভিউ" })}>
              <p className="truncate font-mono text-xs text-ink-3" title={preview.path}>
                {preview.path}
              </p>
              {preview.kind === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element -- local blob preview
                <img src={preview.url} alt={preview.path} className="max-h-72 w-full rounded border border-rule bg-paper object-contain" />
              ) : (
                <pre className="max-h-72 overflow-auto rounded border border-rule bg-paper p-2 font-mono text-xs whitespace-pre-wrap text-ink-2">
                  {preview.text}
                  {preview.truncated && "\n…"}
                </pre>
              )}
              <Button variant="ghost" className="px-2 py-1" onClick={() => setPreview(null)}>
                {t({ en: "Close preview", bn: "প্রিভিউ বন্ধ করুন" })}
              </Button>
            </SideSection>
          )}
        </>
      }
    />
  );
}
