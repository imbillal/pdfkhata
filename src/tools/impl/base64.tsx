"use client";

import { useCallback, useMemo, useState } from "react";
import { Button, ErrorNote, Field, FileDrop, FileRow, Segmented, Sheet, SideSection, Workspace, inputClass } from "@/components/kit";
import { downloadBytes, downloadText, errorMessage, formatBytes } from "@/lib/files";
import { useT } from "@/i18n/LocaleProvider";
import { CopyButton, OutputArea, TextInput, Toggle } from "@/tools/shared/textKit";
import { BiError, MIME_EXT, base64ToBytes, bytesToBase64, sniffFileType } from "@/tools/shared/textLogic";

type Tab = "text" | "file";
type Dir = "encode" | "decode";

const PREVIEW_LIMIT = 500_000;

export default function Base64Tool() {
  const t = useT();
  const [tab, setTab] = useState<Tab>("text");
  const [dir, setDir] = useState<Dir>("encode");
  const [urlSafe, setUrlSafe] = useState(false);
  const [text, setText] = useState("");

  // File → Base64
  const [file, setFile] = useState<File | null>(null);
  const [fileB64, setFileB64] = useState<string | null>(null);
  const [asDataUri, setAsDataUri] = useState(false);
  const [busy, setBusy] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  // Base64 → file
  const [b64In, setB64In] = useState("");
  const [outName, setOutName] = useState("");

  const describeError = useCallback((err: unknown) => (err instanceof BiError ? t(err.bi) : errorMessage(err)), [t]);

  const textResult = useMemo((): { out: string; error: string | null; binary?: boolean } => {
    if (!text) return { out: "", error: null };
    try {
      if (dir === "encode") return { out: bytesToBase64(new TextEncoder().encode(text), urlSafe), error: null };
      const { bytes } = base64ToBytes(text);
      try {
        return { out: new TextDecoder("utf-8", { fatal: true }).decode(bytes), error: null };
      } catch {
        return {
          out: "",
          binary: true,
          error: t({
            en: `Decoded ${formatBytes(bytes.length)}, but it isn't UTF-8 text — it's probably a file. Use the File tab to save it.`,
            bn: `${formatBytes(bytes.length)} ডিকোড হয়েছে, কিন্তু এটি UTF-8 লেখা নয় — সম্ভবত কোনো ফাইল। সংরক্ষণ করতে “ফাইল” ট্যাব ব্যবহার করুন।`,
          }),
        };
      }
    } catch (err) {
      return { out: "", error: describeError(err) };
    }
  }, [text, dir, urlSafe, t, describeError]);

  const encodeFile = useCallback(async (f: File) => {
    setFile(f);
    setFileB64(null);
    setFileError(null);
    setBusy(true);
    try {
      const bytes = new Uint8Array(await f.arrayBuffer());
      setFileB64(bytesToBase64(bytes, false));
    } catch (err) {
      setFileError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }, []);

  const fileOut = useMemo(() => {
    if (!fileB64 || !file) return "";
    if (asDataUri) return `data:${file.type || "application/octet-stream"};base64,${fileB64}`;
    return urlSafe ? fileB64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "") : fileB64;
  }, [fileB64, file, asDataUri, urlSafe]);

  const decoded = useMemo(() => {
    if (!b64In.trim()) return null;
    try {
      const { bytes, mime } = base64ToBytes(b64In);
      const sniffed = sniffFileType(bytes);
      const type = mime ?? sniffed?.mime ?? "application/octet-stream";
      const ext = (mime && MIME_EXT[mime]) || sniffed?.ext || "bin";
      return { bytes, type, ext, error: null };
    } catch (err) {
      return { bytes: null, type: "", ext: "", error: describeError(err) };
    }
  }, [b64In, describeError]);

  const safeName = (name: string, ext: string) => {
    const clean = name.trim().replace(/[\\/:*?"<>|]+/g, "_");
    if (!clean) return `decoded.${ext}`;
    return /\.[a-z0-9]{1,8}$/i.test(clean) ? clean : `${clean}.${ext}`;
  };

  const preview = (s: string) => (s.length > PREVIEW_LIMIT ? `${s.slice(0, PREVIEW_LIMIT)}…` : s);

  return (
    <Workspace
      main={
        <Sheet className="flex flex-col gap-5">
          <Segmented<Tab>
            label={t({ en: "Input type", bn: "ইনপুটের ধরন" })}
            value={tab}
            onChange={setTab}
            options={[
              { value: "text", label: t({ en: "Text", bn: "লেখা" }) },
              { value: "file", label: t({ en: "File", bn: "ফাইল" }) },
            ]}
          />
          {tab === "text" ? (
            <>
              <TextInput
                label={dir === "encode" ? t({ en: "Text to encode", bn: "এনকোড করার লেখা" }) : t({ en: "Base64 to decode", bn: "ডিকোড করার Base64" })}
                value={text}
                onChange={setText}
                accept=".txt,text/plain"
                className="min-h-40"
                placeholder={dir === "encode" ? t({ en: "Type any text, Bangla included…", bn: "যেকোনো লেখা লিখুন, বাংলাও চলবে…" }) : "SGVsbG8g4Kas4Ka-4KaC4Kay4Ka-"}
              />
              <ErrorNote message={textResult.error} />
              {textResult.out && (
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium text-ink-2">{dir === "encode" ? "Base64" : t({ en: "Decoded text", bn: "ডিকোড করা লেখা" })}</p>
                    <div className="flex gap-2">
                      <CopyButton text={textResult.out} variant="primary" />
                      <Button
                        variant="secondary"
                        className="px-3 py-2"
                        onClick={() => {
                          setText(textResult.out);
                          setDir(dir === "encode" ? "decode" : "encode");
                        }}
                      >
                        {t({ en: "Swap ⇅", bn: "উল্টান ⇅" })}
                      </Button>
                    </div>
                  </div>
                  <OutputArea label={t({ en: "Output", bn: "আউটপুট" })} value={preview(textResult.out)} className="min-h-40" />
                </div>
              )}
            </>
          ) : (
            <div className="grid gap-6">
              <section className="flex flex-col gap-3">
                <h3 className="text-sm font-semibold text-ink">{t({ en: "File → Base64", bn: "ফাইল → Base64" })}</h3>
                {file ? (
                  <FileRow
                    file={file}
                    onRemove={() => {
                      setFile(null);
                      setFileB64(null);
                    }}
                  />
                ) : (
                  <FileDrop onFiles={(fs) => void encodeFile(fs[0])} hint={t({ en: "Any file type. Nothing is uploaded.", bn: "যেকোনো ফাইল। কিছুই আপলোড হয় না।" })} />
                )}
                <ErrorNote message={fileError} />
                {busy && <p className="text-sm text-ink-3">{t({ en: "Reading…", bn: "পড়া হচ্ছে…" })}</p>}
                {fileOut && (
                  <>
                    <div className="flex flex-wrap items-center gap-2">
                      <CopyButton text={fileOut} variant="primary" />
                      <Button variant="secondary" className="px-3 py-2" onClick={() => downloadText(fileOut, `${file?.name ?? "file"}.base64.txt`)}>
                        {t({ en: "Download .txt", bn: ".txt ডাউনলোড" })}
                      </Button>
                      <span className="text-xs text-ink-3">
                        {t({ en: `${t.n(fileOut.length)} characters`, bn: `${t.n(fileOut.length)}টি অক্ষর` })}
                      </span>
                    </div>
                    <OutputArea label="Base64" value={preview(fileOut)} className="min-h-32" />
                    {fileOut.length > PREVIEW_LIMIT && (
                      <p className="text-xs text-ink-3">{t({ en: "Preview is cut short; Copy and Download give the full text.", bn: "প্রিভিউ ছোট করে দেখানো হয়েছে; কপি বা ডাউনলোডে পুরো লেখা পাবেন।" })}</p>
                    )}
                  </>
                )}
              </section>
              <section className="flex flex-col gap-3 border-t border-rule pt-5">
                <h3 className="text-sm font-semibold text-ink">{t({ en: "Base64 → File", bn: "Base64 → ফাইল" })}</h3>
                <TextInput
                  label={t({ en: "Base64 or data URI", bn: "Base64 বা data URI" })}
                  value={b64In}
                  onChange={setB64In}
                  accept=".txt,text/plain"
                  className="min-h-32"
                  placeholder="data:image/png;base64,iVBORw0KGgo…"
                />
                {decoded?.error && <ErrorNote message={decoded.error} />}
                {decoded?.bytes && (
                  <div className="flex flex-wrap items-end gap-3">
                    <div className="min-w-48 flex-1">
                      <Field label={t({ en: "File name", bn: "ফাইলের নাম" })}>
                        {(id) => <input id={id} className={inputClass} value={outName} placeholder={`decoded.${decoded.ext}`} onChange={(e) => setOutName(e.target.value)} />}
                      </Field>
                    </div>
                    <Button onClick={() => downloadBytes(decoded.bytes, safeName(outName, decoded.ext), decoded.type)}>
                      {t({ en: "Download", bn: "ডাউনলোড" })} ({formatBytes(decoded.bytes.length)})
                    </Button>
                  </div>
                )}
                {decoded?.bytes && (
                  <p className="text-xs text-ink-3">
                    {t({ en: "Detected type:", bn: "শনাক্ত ধরন:" })} {decoded.type}
                  </p>
                )}
              </section>
            </div>
          )}
        </Sheet>
      }
      side={
        <SideSection title={t({ en: "Options", bn: "অপশন" })}>
          {tab === "text" && (
            <Segmented<Dir>
              label={t({ en: "Direction", bn: "দিক" })}
              value={dir}
              onChange={setDir}
              options={[
                { value: "encode", label: t({ en: "Encode", bn: "এনকোড" }) },
                { value: "decode", label: t({ en: "Decode", bn: "ডিকোড" }) },
              ]}
            />
          )}
          <Toggle
            checked={urlSafe}
            onChange={setUrlSafe}
            label={t({ en: "URL-safe alphabet", bn: "URL-নিরাপদ বর্ণমালা" })}
            hint={t({ en: "Uses - and _ instead of + and /, no = padding. Decoding accepts both.", bn: "+ ও /-এর বদলে - ও _, শেষে = থাকে না। ডিকোড দুটোই নেয়।" })}
          />
          {tab === "file" && (
            <Toggle
              checked={asDataUri}
              onChange={setAsDataUri}
              label={t({ en: "Output as data URI", bn: "data URI হিসেবে দিন" })}
              hint="data:<type>;base64,…"
            />
          )}
          <p className="text-xs text-ink-3">
            {t({
              en: "Text is encoded as UTF-8, so Bangla and emoji round-trip correctly.",
              bn: "লেখা UTF-8-এ এনকোড হয়, তাই বাংলা ও ইমোজি ঠিকঠাক ফিরে আসে।",
            })}
          </p>
        </SideSection>
      }
    />
  );
}
