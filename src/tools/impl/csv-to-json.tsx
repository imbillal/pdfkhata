"use client";

import { useDeferredValue, useMemo, useState } from "react";
import Papa from "papaparse";
import { Button, ErrorNote, Field, Segmented, Sheet, SideSection, Workspace } from "@/components/kit";
import { downloadText, renameFile } from "@/lib/files";
import { useT } from "@/i18n/LocaleProvider";
import { CopyButton, OutputArea, TextInput, Toggle } from "@/tools/shared/textKit";
import { typeCell } from "@/tools/shared/textLogic";

type Delim = "auto" | "," | ";" | "\t" | "|";
type Indent = "2" | "4" | "tab" | "min";

const MAX_PREVIEW_CHARS = 1_000_000;

export default function CsvToJson() {
  const t = useT();
  const [csv, setCsv] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [header, setHeader] = useState(true);
  const [delimiter, setDelimiter] = useState<Delim>("auto");
  const [typing, setTyping] = useState(true);
  const [trimHeaders, setTrimHeaders] = useState(true);
  const [indent, setIndent] = useState<Indent>("2");

  const input = useDeferredValue(csv);

  const parsed = useMemo(() => {
    if (!input.trim()) return null;
    const res = Papa.parse<Record<string, string> | string[]>(input, {
      header,
      delimiter: delimiter === "auto" ? "" : delimiter,
      skipEmptyLines: "greedy",
      transformHeader: trimHeaders ? (h) => h.trim() : undefined,
    });
    const rows = typing
      ? res.data.map((row) =>
          Array.isArray(row) ? row.map(typeCell) : Object.fromEntries(Object.entries(row).map(([k, v]) => [k, typeof v === "string" ? typeCell(v) : v])),
        )
      : res.data;
    const space = indent === "min" ? undefined : indent === "tab" ? "\t" : Number(indent);
    return { rows: rows.length, json: JSON.stringify(rows, null, space), errors: res.errors, meta: res.meta };
  }, [input, header, delimiter, typing, trimHeaders, indent]);

  const outName = fileName ? renameFile(fileName, ".json") : "data.json";
  const delimName = (d: string) =>
    d === "," ? t({ en: "comma", bn: "কমা" }) : d === ";" ? t({ en: "semicolon", bn: "সেমিকোলন" }) : d === "\t" ? t({ en: "tab", bn: "ট্যাব" }) : d === "|" ? t({ en: "pipe", bn: "পাইপ" }) : `“${d}”`;

  return (
    <Workspace
      main={
        <Sheet className="flex flex-col gap-5">
          <TextInput
            label={t({ en: "CSV input", bn: "CSV ইনপুট" })}
            value={csv}
            onChange={setCsv}
            onFileName={setFileName}
            accept=".csv,.tsv,.txt,text/csv,text/plain"
            placeholder={t({ en: "Paste CSV here, open a file, or drop one in…", bn: "এখানে CSV পেস্ট করুন, ফাইল খুলুন বা টেনে আনুন…" })}
          />
          {parsed && (
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-ink-2">JSON</p>
                <div className="flex gap-2">
                  <CopyButton text={parsed.json} />
                  <Button variant="secondary" className="px-3 py-2" onClick={() => downloadText(parsed.json, outName, "application/json")}>
                    {t({ en: "Download", bn: "ডাউনলোড" })}
                  </Button>
                </div>
              </div>
              <OutputArea
                label="JSON"
                value={parsed.json.length > MAX_PREVIEW_CHARS ? `${parsed.json.slice(0, MAX_PREVIEW_CHARS)}\n…` : parsed.json}
                className="min-h-72"
              />
              {parsed.json.length > MAX_PREVIEW_CHARS && (
                <p className="text-xs text-ink-3">
                  {t({ en: "Preview is cut short. Copy and Download give you the full JSON.", bn: "প্রিভিউ ছোট করে দেখানো হয়েছে। কপি বা ডাউনলোড করলে পুরো JSON পাবেন।" })}
                </p>
              )}
            </div>
          )}
        </Sheet>
      }
      side={
        <>
          <SideSection title={t({ en: "Options", bn: "অপশন" })}>
            <Toggle
              checked={header}
              onChange={setHeader}
              label={t({ en: "First row is the header", bn: "প্রথম সারি হেডার" })}
              hint={header ? t({ en: "Each row becomes an object.", bn: "প্রতিটি সারি একটি অবজেক্ট হবে।" }) : t({ en: "Each row becomes an array.", bn: "প্রতিটি সারি একটি অ্যারে হবে।" })}
            />
            {header && <Toggle checked={trimHeaders} onChange={setTrimHeaders} label={t({ en: "Trim spaces in headers", bn: "হেডারের বাড়তি স্পেস বাদ দিন" })} />}
            <Toggle
              checked={typing}
              onChange={setTyping}
              label={t({ en: "Detect numbers and true/false", bn: "সংখ্যা ও true/false চিনে নিন" })}
              hint={t({ en: "Values like 007 or long IDs stay as text.", bn: "007 বা লম্বা আইডি লেখা হিসেবেই থাকবে।" })}
            />
            <Field label={t({ en: "Delimiter", bn: "বিভাজক" })}>
              {() => (
                <Segmented<Delim>
                  label={t({ en: "Delimiter", bn: "বিভাজক" })}
                  value={delimiter}
                  onChange={setDelimiter}
                  options={[
                    { value: "auto", label: t({ en: "Auto", bn: "অটো" }) },
                    { value: ",", label: "," },
                    { value: ";", label: ";" },
                    { value: "\t", label: t({ en: "Tab", bn: "ট্যাব" }) },
                    { value: "|", label: "|" },
                  ]}
                />
              )}
            </Field>
            <Field label={t({ en: "Indent", bn: "ইনডেন্ট" })}>
              {() => (
                <Segmented<Indent>
                  label={t({ en: "Indent", bn: "ইনডেন্ট" })}
                  value={indent}
                  onChange={setIndent}
                  options={[
                    { value: "2", label: t.n(2) },
                    { value: "4", label: t.n(4) },
                    { value: "tab", label: t({ en: "Tab", bn: "ট্যাব" }) },
                    { value: "min", label: t({ en: "Minify", bn: "মিনিফাই" }) },
                  ]}
                />
              )}
            </Field>
          </SideSection>
          {parsed && (
            <SideSection title={t({ en: "Result", bn: "ফলাফল" })}>
              <p className="text-sm text-ink-2">
                {t({ en: `${t.n(parsed.rows)} rows`, bn: `${t.n(parsed.rows)}টি সারি` })}
                {header && parsed.meta.fields && ` · ${t({ en: `${t.n(parsed.meta.fields.length)} columns`, bn: `${t.n(parsed.meta.fields.length)}টি কলাম` })}`}
              </p>
              <p className="text-xs text-ink-3">
                {t({ en: "Delimiter used:", bn: "ব্যবহৃত বিভাজক:" })} {delimName(parsed.meta.delimiter)}
              </p>
            </SideSection>
          )}
          {parsed && parsed.errors.length > 0 && (
            <div className="whitespace-pre-line">
            <ErrorNote
              message={[
                t({ en: `${t.n(parsed.errors.length)} parse problem(s):`, bn: `${t.n(parsed.errors.length)}টি সমস্যা পাওয়া গেছে:` }),
                ...parsed.errors.slice(0, 5).map((e) =>
                  e.row !== undefined && e.row !== null
                    ? `${t({ en: "Row", bn: "সারি" })} ${t.n(e.row + 1)}: ${e.message}`
                    : e.message,
                ),
                parsed.errors.length > 5 ? "…" : "",
              ]
                .filter(Boolean)
                .join("\n")}
            />
            </div>
          )}
        </>
      }
    />
  );
}
