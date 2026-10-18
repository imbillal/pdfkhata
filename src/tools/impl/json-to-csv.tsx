"use client";

import { useDeferredValue, useMemo, useState } from "react";
import Papa from "papaparse";
import { Button, ErrorNote, Field, Segmented, Sheet, SideSection, Workspace, inputClass } from "@/components/kit";
import { downloadText, renameFile } from "@/lib/files";
import { useT } from "@/i18n/LocaleProvider";
import { CopyButton, TextInput, Toggle } from "@/tools/shared/textKit";
import { rowsToTable, scanJson } from "@/tools/shared/textLogic";

type Delim = "," | ";" | "\t";
const PREVIEW_ROWS = 20;

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

export default function JsonToCsv() {
  const t = useT();
  const [json, setJson] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [delimiter, setDelimiter] = useState<Delim>(",");
  const [expandArrays, setExpandArrays] = useState(false);
  const [bom, setBom] = useState(true);
  const [pickedKey, setPickedKey] = useState<string>("");

  const input = useDeferredValue(json);

  const parsed = useMemo(() => {
    if (!input.trim()) return null;
    try {
      return { value: JSON.parse(input.replace(/^﻿/, "")) as unknown, error: null };
    } catch {
      const scan = scanJson(input);
      return { value: undefined, error: scan.error };
    }
  }, [input]);

  // An object whose values include arrays: let the user choose which array to export.
  const arrayKeys = useMemo(() => {
    const v = parsed?.value;
    return isPlainObject(v) ? Object.keys(v).filter((k) => Array.isArray(v[k])) : [];
  }, [parsed]);
  const activeKey = arrayKeys.includes(pickedKey) ? pickedKey : (arrayKeys[0] ?? "");

  const table = useMemo(() => {
    const v = parsed?.value;
    if (v === undefined) return null;
    let rows: unknown[];
    if (Array.isArray(v)) rows = v;
    else if (isPlainObject(v) && activeKey) rows = v[activeKey] as unknown[];
    else rows = [v];
    const { fields, data } = rowsToTable(rows, expandArrays);
    const csv = Papa.unparse({ fields, data }, { delimiter, newline: "\r\n" });
    return { fields, data, csv };
  }, [parsed, activeKey, expandArrays, delimiter]);

  const outName = fileName ? renameFile(fileName, ".csv") : "data.csv";

  return (
    <Workspace
      main={
        <Sheet className="flex flex-col gap-5">
          <TextInput
            label={t({ en: "JSON input", bn: "JSON ইনপুট" })}
            value={json}
            onChange={setJson}
            onFileName={setFileName}
            accept=".json,application/json,text/plain"
            placeholder={'[\n  { "name": "Rahim", "city": { "name": "Dhaka" } },\n  { "name": "Karim", "city": { "name": "Khulna" } }\n]'}
          />
          {parsed?.error && (
            <ErrorNote
              message={`${t({ en: "Invalid JSON", bn: "JSON সঠিক নয়" })} — ${t({ en: "line", bn: "লাইন" })} ${t.n(parsed.error.line)}, ${t({ en: "column", bn: "কলাম" })} ${t.n(parsed.error.column)}: ${t(parsed.error.message)}`}
            />
          )}
          {table && (
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-ink-2">
                {t({ en: "Preview", bn: "প্রিভিউ" })}
                {table.data.length > PREVIEW_ROWS &&
                  ` · ${t({ en: `first ${t.n(PREVIEW_ROWS)} of ${t.n(table.data.length)} rows`, bn: `${t.n(table.data.length)}টির মধ্যে প্রথম ${t.n(PREVIEW_ROWS)}টি সারি` })}`}
              </p>
              {table.fields.length === 0 ? (
                <p className="text-sm text-ink-3">{t({ en: "Nothing to show — the data is empty.", bn: "দেখানোর মতো কিছু নেই — ডেটা খালি।" })}</p>
              ) : (
                <div className="max-h-[28rem] overflow-auto rounded-md border border-rule">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead className="sticky top-0 bg-paper-2">
                      <tr>
                        {table.fields.map((f) => (
                          <th key={f} className="border-b border-rule px-2.5 py-2 font-mono font-semibold whitespace-nowrap text-ink">
                            {f}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {table.data.slice(0, PREVIEW_ROWS).map((row, r) => (
                        <tr key={r} className="odd:bg-paper/50">
                          {row.map((cell, c) => (
                            <td key={c} className="max-w-64 truncate border-b border-rule px-2.5 py-1.5 font-mono text-ink-2" title={cell}>
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </Sheet>
      }
      side={
        <>
          {arrayKeys.length > 1 && (
            <SideSection title={t({ en: "Which list?", bn: "কোন তালিকা?" })}>
              <Field label={t({ en: "Export the array under", bn: "এই কী-এর অ্যারে এক্সপোর্ট করুন" })}>
                {(id) => (
                  <select id={id} className={inputClass} value={activeKey} onChange={(e) => setPickedKey(e.target.value)}>
                    {arrayKeys.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                )}
              </Field>
            </SideSection>
          )}
          <SideSection title={t({ en: "Options", bn: "অপশন" })}>
            <Field label={t({ en: "Delimiter", bn: "বিভাজক" })}>
              {() => (
                <Segmented<Delim>
                  label={t({ en: "Delimiter", bn: "বিভাজক" })}
                  value={delimiter}
                  onChange={setDelimiter}
                  options={[
                    { value: ",", label: t({ en: "Comma", bn: "কমা" }) },
                    { value: ";", label: t({ en: "Semicolon", bn: "সেমিকোলন" }) },
                    { value: "\t", label: t({ en: "Tab", bn: "ট্যাব" }) },
                  ]}
                />
              )}
            </Field>
            <Toggle
              checked={expandArrays}
              onChange={setExpandArrays}
              label={t({ en: "Spread nested arrays into columns", bn: "ভেতরের অ্যারে আলাদা কলামে ভাঙুন" })}
              hint={t({ en: "tags.0, tags.1… instead of one JSON cell.", bn: "একটি JSON ঘরের বদলে tags.0, tags.1…" })}
            />
            <Toggle
              checked={bom}
              onChange={setBom}
              label={t({ en: "Add UTF-8 BOM for Excel", bn: "Excel-এর জন্য UTF-8 BOM যোগ করুন" })}
              hint={t({ en: "Keeps Bangla and other non-English text readable in Excel.", bn: "Excel-এ বাংলা লেখা ঠিকঠাক দেখাতে এটি চালু রাখুন।" })}
            />
            <p className="text-xs text-ink-3">{t({ en: "Nested objects become dot keys, e.g. city.name.", bn: "ভেতরের অবজেক্ট ডট দিয়ে কলাম হবে, যেমন city.name।" })}</p>
          </SideSection>
          {table && table.fields.length > 0 && (
            <SideSection title={t({ en: "CSV", bn: "CSV" })}>
              <p className="text-sm text-ink-2">
                {t({
                  en: `${t.n(table.data.length)} rows · ${t.n(table.fields.length)} columns`,
                  bn: `${t.n(table.data.length)}টি সারি · ${t.n(table.fields.length)}টি কলাম`,
                })}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => downloadText((bom ? "﻿" : "") + table.csv, outName, "text/csv;charset=utf-8")}>
                  {t({ en: "Download CSV", bn: "CSV ডাউনলোড" })}
                </Button>
                <CopyButton text={table.csv} />
              </div>
            </SideSection>
          )}
        </>
      }
    />
  );
}
