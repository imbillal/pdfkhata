"use client";

import { useMemo, useState } from "react";
import { Button, Sheet, SideSection, Workspace } from "@/components/kit";
import { downloadText } from "@/lib/files";
import { useT } from "@/i18n/LocaleProvider";
import { CopyButton, OutputArea, TextInput, Toggle } from "@/tools/shared/textKit";
import { convertCase, type CaseId } from "@/tools/shared/textLogic";
import type { Bi } from "@/i18n/locale";

const CASES: { id: CaseId; label: string; hint: Bi }[] = [
  { id: "upper", label: "UPPER CASE", hint: { en: "Every letter capital", bn: "সব অক্ষর বড় হাতের" } },
  { id: "lower", label: "lower case", hint: { en: "Every letter small", bn: "সব অক্ষর ছোট হাতের" } },
  { id: "title", label: "Title Case", hint: { en: "Capital First Letters", bn: "প্রতিটি শব্দের প্রথম অক্ষর বড়" } },
  { id: "sentence", label: "Sentence case", hint: { en: "Like a normal sentence", bn: "সাধারণ বাক্যের মতো" } },
  { id: "camel", label: "camelCase", hint: { en: "For JS variables", bn: "JS ভেরিয়েবলের জন্য" } },
  { id: "pascal", label: "PascalCase", hint: { en: "For class names", bn: "ক্লাসের নামের জন্য" } },
  { id: "snake", label: "snake_case", hint: { en: "Words joined by _", bn: "_ দিয়ে জোড়া শব্দ" } },
  { id: "kebab", label: "kebab-case", hint: { en: "For URLs and CSS", bn: "URL ও CSS-এর জন্য" } },
  { id: "constant", label: "CONSTANT_CASE", hint: { en: "For constants", bn: "কনস্ট্যান্টের জন্য" } },
  { id: "alternate", label: "aLtErNaTe", hint: { en: "Alternating letters", bn: "একটা ছোট, একটা বড়" } },
  { id: "inverse", label: "iNVERSE", hint: { en: "Swap upper and lower", bn: "ছোট-বড় উল্টে দিন" } },
];

export default function CaseConverter() {
  const t = useT();
  const [text, setText] = useState("");
  const [mode, setMode] = useState<CaseId>("title");
  const [smartTitle, setSmartTitle] = useState(true);

  const output = useMemo(() => convertCase(text, mode, { smartTitle }), [text, mode, smartTitle]);

  return (
    <Workspace
      main={
        <Sheet className="flex flex-col gap-5">
          <TextInput
            label={t({ en: "Your text", bn: "আপনার লেখা" })}
            value={text}
            onChange={setText}
            accept=".txt,.md,.csv,text/plain"
            className="min-h-40"
            placeholder={t({ en: "Type or paste text to convert…", bn: "রূপান্তরের জন্য লেখা লিখুন বা পেস্ট করুন…" })}
          />
          <div role="radiogroup" aria-label={t({ en: "Case", bn: "কেস" })} className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
            {CASES.map((c) => (
              <button
                key={c.id}
                type="button"
                role="radio"
                aria-checked={mode === c.id}
                onClick={() => setMode(c.id)}
                className={`rounded-md border px-3 py-2 text-left transition ${
                  mode === c.id ? "border-ink bg-ink text-paper" : "border-rule-strong bg-paper text-ink hover:border-ink-3"
                }`}
              >
                <span className="block font-mono text-sm">{c.label}</span>
                <span className={`block text-xs ${mode === c.id ? "text-paper/70" : "text-ink-3"}`}>{t(c.hint)}</span>
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-ink-2">{t({ en: "Result", bn: "ফলাফল" })}</p>
              <div className="flex gap-2">
                <CopyButton text={output} variant="primary" />
                <Button variant="secondary" className="px-3 py-2" disabled={!output || output === text} onClick={() => setText(output)}>
                  {t({ en: "Use as input", bn: "ইনপুটে বসান" })}
                </Button>
              </div>
            </div>
            <OutputArea label={t({ en: "Result", bn: "ফলাফল" })} value={output} className="min-h-40" />
          </div>
        </Sheet>
      }
      side={
        <SideSection title={t({ en: "Options", bn: "অপশন" })}>
          <Toggle
            checked={smartTitle}
            onChange={setSmartTitle}
            label={t({ en: "Keep small words lowercase in Title Case", bn: "Title Case-এ ছোট শব্দ ছোট হাতেই রাখুন" })}
            hint={t({ en: "a, an, the, of, in… (not first or last)", bn: "a, an, the, of, in… (প্রথম বা শেষ শব্দ বাদে)" })}
          />
          <p className="text-xs text-ink-3">
            {t({
              en: "camelCase, snake_case and the other code styles work line by line. Bangla has no capital letters, so it passes through unchanged.",
              bn: "camelCase, snake_case-এর মতো কোড স্টাইল প্রতিটি লাইনে আলাদাভাবে কাজ করে। বাংলায় ছোট-বড় হাতের অক্ষর নেই, তাই বাংলা লেখা অপরিবর্তিত থাকে।",
            })}
          </p>
          <Button variant="secondary" disabled={!output} onClick={() => downloadText(output, `text-${mode}.txt`)}>
            {t({ en: "Download .txt", bn: ".txt ডাউনলোড" })}
          </Button>
        </SideSection>
      }
    />
  );
}
