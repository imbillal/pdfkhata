"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { Button, Field, Segmented, Sheet, SideSection, Workspace } from "@/components/kit";
import { downloadText, formatBytes, renameFile } from "@/lib/files";
import { useT } from "@/i18n/LocaleProvider";
import { CopyButton, OutputArea, TextInput, Toggle } from "@/tools/shared/textKit";
import { scanJson, sortKeysDeep, type Json } from "@/tools/shared/textLogic";

type Mode = "2" | "4" | "tab" | "min";

export default function JsonFormatter() {
  const t = useT();
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("2");
  const [sortKeys, setSortKeys] = useState(false);

  const input = useDeferredValue(text);

  const result = useMemo(() => {
    if (!input.trim()) return null;
    const scan = scanJson(input);
    if (scan.error) {
      const lines = input.split("\n");
      const line = lines[scan.error.line - 1] ?? "";
      // Show a window of the offending line around the column, with a caret.
      const start = Math.max(0, scan.error.column - 40);
      const snippet = line.slice(start, start + 80).replace(/\t/g, " ");
      const caret = " ".repeat(Math.max(0, scan.error.column - 1 - start)) + "^";
      return { ok: false as const, error: scan.error, snippet: `${start > 0 ? "…" : ""}${snippet}`, caret: `${start > 0 ? " " : ""}${caret}` };
    }
    let value = JSON.parse(input.replace(/^﻿/, "")) as Json;
    if (sortKeys) value = sortKeysDeep(value);
    const space = mode === "min" ? undefined : mode === "tab" ? "\t" : Number(mode);
    const out = JSON.stringify(value, null, space);
    return { ok: true as const, out, unsafe: scan.unsafeNumbers };
  }, [input, mode, sortKeys]);

  const outName = fileName ? renameFile(fileName, mode === "min" ? ".min.json" : ".json") : mode === "min" ? "data.min.json" : "data.json";
  const bytes = (s: string) => new TextEncoder().encode(s).byteLength;

  return (
    <Workspace
      main={
        <Sheet className="flex flex-col gap-5">
          <TextInput
            label={t({ en: "JSON", bn: "JSON" })}
            value={text}
            onChange={setText}
            onFileName={setFileName}
            accept=".json,application/json,text/plain"
            placeholder={t({ en: "Paste JSON here, open a file, or drop one in…", bn: "এখানে JSON পেস্ট করুন, ফাইল খুলুন বা টেনে আনুন…" })}
          />
          {result && !result.ok && (
            <div role="alert" className="rounded-md border border-margin/40 bg-margin-soft px-3 py-2.5 text-sm text-ink">
              <p className="font-semibold">
                {t({ en: "Invalid JSON", bn: "JSON সঠিক নয়" })} — {t({ en: "line", bn: "লাইন" })} {t.n(result.error.line)}, {t({ en: "column", bn: "কলাম" })}{" "}
                {t.n(result.error.column)}
              </p>
              <p className="mt-0.5">{t(result.error.message)}</p>
              <pre className="mt-2 overflow-x-auto rounded bg-sheet px-2 py-1.5 font-mono text-xs leading-5 text-ink-2">
                {result.snippet}
                {"\n"}
                <span className="text-margin">{result.caret}</span>
              </pre>
            </div>
          )}
          {result?.ok && (
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="flex items-center gap-1.5 text-sm font-medium text-ok">
                  <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <path d="m4 10 4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {t({ en: "Valid JSON", bn: "JSON সঠিক আছে" })}
                </p>
                <div className="flex gap-2">
                  <CopyButton text={result.out} />
                  <Button variant="secondary" className="px-3 py-2" onClick={() => setText(result.out)}>
                    {t({ en: "Use as input", bn: "ইনপুটে বসান" })}
                  </Button>
                </div>
              </div>
              <OutputArea label={t({ en: "Formatted JSON", bn: "সাজানো JSON" })} value={result.out} className="min-h-72" />
              {result.unsafe > 0 && (
                <p className="text-xs text-danger">
                  {t({
                    en: `${t.n(result.unsafe)} number(s) are too large for exact precision and were rounded in the output.`,
                    bn: `${t.n(result.unsafe)}টি সংখ্যা এত বড় যে হুবহু রাখা যায়নি; আউটপুটে সেগুলো গোল করা হয়েছে।`,
                  })}
                </p>
              )}
            </div>
          )}
        </Sheet>
      }
      side={
        <>
          <SideSection title={t({ en: "Format", bn: "ফরম্যাট" })}>
            <Field label={t({ en: "Style", bn: "ধরন" })}>
              {() => (
                <Segmented<Mode>
                  label={t({ en: "Style", bn: "ধরন" })}
                  value={mode}
                  onChange={setMode}
                  options={[
                    { value: "2", label: t({ en: "2 spaces", bn: "২ স্পেস" }) },
                    { value: "4", label: t({ en: "4 spaces", bn: "৪ স্পেস" }) },
                    { value: "tab", label: t({ en: "Tab", bn: "ট্যাব" }) },
                    { value: "min", label: t({ en: "Minify", bn: "মিনিফাই" }) },
                  ]}
                />
              )}
            </Field>
            <Toggle checked={sortKeys} onChange={setSortKeys} label={t({ en: "Sort keys A→Z", bn: "কী-গুলো A→Z সাজান" })} />
          </SideSection>
          {result?.ok && (
            <SideSection title={t({ en: "Save", bn: "সংরক্ষণ" })}>
              <p className="text-sm text-ink-2">
                {formatBytes(bytes(input))} → {formatBytes(bytes(result.out))}
              </p>
              <Button onClick={() => downloadText(result.out, outName, "application/json")}>{t({ en: "Download JSON", bn: "JSON ডাউনলোড" })}</Button>
            </SideSection>
          )}
        </>
      }
    />
  );
}
