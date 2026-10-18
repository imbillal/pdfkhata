"use client";

import { useEffect, useMemo, useState } from "react";
import { ErrorNote, Field, FileDrop, FileRow, Segmented, Sheet, SideSection, Workspace, inputClass } from "@/components/kit";
import { errorMessage } from "@/lib/files";
import { useT } from "@/i18n/LocaleProvider";
import { CopyButton, TextInput, Toggle } from "@/tools/shared/textKit";

const ALGOS = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"] as const;
type Algo = (typeof ALGOS)[number];
type Source = "text" | "file";
type Hashes = Record<Algo, string>;

const toHex = (buf: ArrayBuffer) => Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");

async function digestAll(data: BufferSource): Promise<Hashes> {
  const out = await Promise.all(ALGOS.map(async (a) => [a, toHex(await crypto.subtle.digest(a, data))] as const));
  return Object.fromEntries(out) as Hashes;
}

export default function HashGenerator() {
  const t = useT();
  const [source, setSource] = useState<Source>("text");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [upper, setUpper] = useState(false);
  const [compare, setCompare] = useState("");
  const [result, setResult] = useState<{ key: string; hashes: Hashes } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Identify what the current hashes belong to, so stale results never show.
  const key = source === "text" ? `t:${text}` : file ? `f:${file.name}:${file.size}:${file.lastModified}` : "";

  useEffect(() => {
    if (!key) return;
    let cancelled = false;
    const run = async () => {
      if (source === "file") setBusy(true);
      try {
        const data = source === "text" ? new TextEncoder().encode(text) : file ? await file.arrayBuffer() : null;
        if (!data) return;
        const hashes = await digestAll(data);
        if (!cancelled) {
          setResult({ key, hashes });
          setError(null);
        }
      } catch (err) {
        if (!cancelled) setError(errorMessage(err));
      } finally {
        if (!cancelled) setBusy(false);
      }
    };
    // Debounce typing a little; files hash right away.
    const timer = setTimeout(() => void run(), source === "text" ? 150 : 0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [key, source, text, file]);

  const hashes = result && result.key === key ? result.hashes : null;
  const fmt = (h: string) => (upper ? h.toUpperCase() : h);

  const match = useMemo(() => {
    const want = compare.trim().toLowerCase().replace(/[\s:-]/g, "");
    if (!want || !hashes) return null;
    const hit = ALGOS.find((a) => hashes[a] === want);
    return { hit: hit ?? null };
  }, [compare, hashes]);

  return (
    <Workspace
      main={
        <Sheet className="flex flex-col gap-5">
          <Segmented<Source>
            label={t({ en: "Input", bn: "ইনপুট" })}
            value={source}
            onChange={setSource}
            options={[
              { value: "text", label: t({ en: "Text", bn: "লেখা" }) },
              { value: "file", label: t({ en: "File", bn: "ফাইল" }) },
            ]}
          />
          {source === "text" ? (
            <TextInput
              label={t({ en: "Text to hash", bn: "হ্যাশ করার লেখা" })}
              value={text}
              onChange={setText}
              className="min-h-32"
              placeholder={t({ en: "Type or paste text… (an empty input has a hash too)", bn: "লেখা লিখুন বা পেস্ট করুন… (খালি ইনপুটেরও হ্যাশ হয়)" })}
            />
          ) : file ? (
            <FileRow file={file} onRemove={() => setFile(null)} />
          ) : (
            <FileDrop onFiles={(fs) => setFile(fs[0])} hint={t({ en: "Any file. It's hashed locally and never uploaded.", bn: "যেকোনো ফাইল। হ্যাশ এখানেই হয়, কোথাও আপলোড হয় না।" })} />
          )}

          {busy && key && !hashes && <p className="text-sm text-ink-3">{t({ en: "Hashing…", bn: "হ্যাশ করা হচ্ছে…" })}</p>}
          <ErrorNote message={error} />

          {hashes && (
            <div className="flex flex-col gap-3">
              {ALGOS.map((a) => (
                <div key={a} className={`rounded-md border px-3 py-2.5 ${match?.hit === a ? "border-ok bg-paper" : "border-rule bg-paper"}`}>
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold tracking-wide text-ink-3">
                      {a}
                      {match?.hit === a && <span className="ml-2 text-ok">✓ {t({ en: "match", bn: "মিলেছে" })}</span>}
                    </p>
                    <CopyButton text={fmt(hashes[a])} variant="ghost" className="px-2 py-1 text-xs" />
                  </div>
                  <p className="font-mono text-xs break-all text-ink select-all">{fmt(hashes[a])}</p>
                </div>
              ))}
            </div>
          )}
        </Sheet>
      }
      side={
        <>
          <SideSection title={t({ en: "Options", bn: "অপশন" })}>
            <Toggle checked={upper} onChange={setUpper} label={t({ en: "Uppercase hex", bn: "বড় হাতের হেক্স" })} />
            {source === "text" && (
              <p className="text-xs text-ink-3">
                {t({ en: "Text is hashed as UTF-8 with \\n line endings.", bn: "লেখা UTF-8 হিসেবে, \\n লাইন-এন্ডিং ধরে হ্যাশ করা হয়।" })}
              </p>
            )}
          </SideSection>
          <SideSection title={t({ en: "Verify", bn: "যাচাই" })}>
            <Field label={t({ en: "Compare with a known hash", bn: "জানা হ্যাশের সঙ্গে মেলান" })}>
              {(id) => (
                <input
                  id={id}
                  className={`${inputClass} font-mono`}
                  value={compare}
                  onChange={(e) => setCompare(e.target.value)}
                  placeholder={t({ en: "Paste the expected hash", bn: "প্রত্যাশিত হ্যাশ পেস্ট করুন" })}
                  spellCheck={false}
                />
              )}
            </Field>
            {match && (
              <p role="status" className={`rounded-md px-3 py-2 text-sm font-medium ${match.hit ? "bg-paper text-ok" : "bg-margin-soft text-ink"}`}>
                {match.hit
                  ? t({ en: `Match — it's the ${match.hit} hash.`, bn: `মিলেছে — এটি ${match.hit} হ্যাশ।` })
                  : t({ en: "No match with any hash above.", bn: "উপরের কোনো হ্যাশের সঙ্গে মেলেনি।" })}
              </p>
            )}
            <p className="text-xs text-ink-3">
              {t({
                en: "MD5 isn't offered: browsers don't support it, and it's no longer safe for integrity checks.",
                bn: "MD5 নেই: ব্রাউজার এটি সমর্থন করে না, আর ফাইল যাচাইয়ের জন্য এটি এখন নিরাপদও নয়।",
              })}
            </p>
          </SideSection>
        </>
      }
    />
  );
}
