"use client";

// Two-pane live converter shared by the Bijoy → Unicode and Unicode → Bijoy tools.

import { useCallback, useId, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, ErrorNote, SideSection, Sheet, Workspace, inputClass } from "@/components/kit";
import { bijoyToUnicode, looksLikeBijoy, unicodeToBijoy } from "@/lib/bijoy";
import { downloadText, renameFile } from "@/lib/files";
import { useT } from "@/i18n/LocaleProvider";
import { CopyButton, OpenFileButton, useHandoffFile } from "@/tools/shared/textKit";

export type ConvertDirection = "bijoy-to-unicode" | "unicode-to-bijoy";

const SWAP_KEY = "pdfkhata:bangla-converter:swap";

const SAMPLES: Record<ConvertDirection, string> = {
  "bijoy-to-unicode": "Avgvi †mvbvi evsjv, Avwg †Zvgvq fvjevwm|\nMYcÖRvZš¿x evsjv‡`k miKv‡ii wkÿv gš¿Yvjq|",
  "unicode-to-bijoy": "আমার সোনার বাংলা, আমি তোমায় ভালবাসি।\nগণপ্রজাতন্ত্রী বাংলাদেশ সরকারের শিক্ষা মন্ত্রণালয়।",
};

/** Text handed over by the Swap button of the other converter, read once. */
function takeSwapText(): string {
  try {
    const text = sessionStorage.getItem(SWAP_KEY);
    sessionStorage.removeItem(SWAP_KEY);
    return text ?? "";
  } catch {
    return "";
  }
}

export function BanglaConverter({ direction }: { direction: ConvertDirection }) {
  const t = useT();
  const router = useRouter();
  const inputId = useId();
  const outputId = useId();
  const [input, setInput] = useState(takeSwapText);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toUnicode = direction === "bijoy-to-unicode";
  const output = useMemo(() => (toUnicode ? bijoyToUnicode(input) : unicodeToBijoy(input)), [input, toUnicode]);
  const otherSlug: ConvertDirection = toUnicode ? "unicode-to-bijoy" : "bijoy-to-unicode";

  const loadFile = useCallback(
    async (file: File) => {
      setError(null);
      try {
        setInput((await file.text()).replace(/^﻿/, ""));
        setFileName(file.name);
      } catch {
        setError(t({ en: `Couldn't read ${file.name} as text.`, bn: `${file.name} ফাইলটি লেখা হিসেবে পড়া গেল না।` }));
      }
    },
    [t],
  );

  useHandoffFile((file) => void loadFile(file));

  const swap = useCallback(() => {
    try {
      if (output) sessionStorage.setItem(SWAP_KEY, output);
    } catch {
      // Storage blocked: the other tool simply opens empty.
    }
    router.push(t.href(`/tools/${otherSlug}/`));
  }, [output, otherSlug, router, t]);

  // Hint when the Bijoy box already holds Unicode Bangla (or plain English).
  const hasBangla = /[ঀ-৿]/.test(input);
  const wrongInput =
    input.trim().length > 0 &&
    (toUnicode ? !looksLikeBijoy(input) : !hasBangla && looksLikeBijoy(input));

  const inputLabel = toUnicode
    ? t({ en: "Bijoy text (SutonnyMJ)", bn: "বিজয় লেখা (সুতন্নিএমজে)" })
    : t({ en: "Unicode Bangla", bn: "ইউনিকোড বাংলা" });
  const outputLabel = toUnicode
    ? t({ en: "Unicode Bangla", bn: "ইউনিকোড বাংলা" })
    : t({ en: "Bijoy text (SutonnyMJ)", bn: "বিজয় লেখা (সুতন্নিএমজে)" });
  const placeholder = toUnicode
    ? t({ en: "Paste Bijoy text here, e.g. Avwg evsjvq Mvb MvB", bn: "বিজয়ে লেখা টেক্সট এখানে পেস্ট করুন, যেমন: Avwg evsjvq Mvb MvB" })
    : t({ en: "Type or paste Unicode Bangla here, e.g. আমি বাংলায় গান গাই", bn: "ইউনিকোড বাংলা এখানে লিখুন বা পেস্ট করুন, যেমন: আমি বাংলায় গান গাই" });

  const bijoyFont = "font-mono";
  const unicodeFont = "font-bangla text-base";
  const inputFont = toUnicode ? bijoyFont : unicodeFont;
  const outputFont = toUnicode ? unicodeFont : bijoyFont;
  const counts = (n: number) => t({ en: `${t.n(n)} characters`, bn: `${t.n(n)} অক্ষর` });

  return (
    <Workspace
      main={
        <Sheet>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="flex min-w-0 flex-col gap-2">
              <label htmlFor={inputId} className="text-sm font-medium text-ink-2">
                {inputLabel}
              </label>
              <textarea
                id={inputId}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setFileName(null);
                }}
                placeholder={placeholder}
                spellCheck={false}
                autoFocus
                className={`${inputClass} min-h-64 resize-y leading-relaxed md:min-h-80 ${inputFont}`}
              />
              <p className="text-xs text-ink-3" aria-live="polite">
                {counts(input.length)}
                {fileName && ` · ${fileName}`}
              </p>
            </div>
            <div className="flex min-w-0 flex-col gap-2">
              <label htmlFor={outputId} className="text-sm font-medium text-ink-2">
                {outputLabel}
              </label>
              <textarea
                id={outputId}
                value={output}
                readOnly
                spellCheck={false}
                placeholder={t({ en: "The converted text appears here as you type.", bn: "লিখতে থাকলেই রূপান্তরিত লেখা এখানে দেখা যাবে।" })}
                className={`${inputClass} min-h-64 resize-y bg-paper-2 leading-relaxed md:min-h-80 ${outputFont}`}
              />
              <p className="text-xs text-ink-3">{counts(output.length)}</p>
            </div>
          </div>
          {wrongInput && (
            <p role="status" className="mt-4 rounded-md border border-rule-strong bg-paper-2 px-3 py-2 text-sm text-ink-2">
              {toUnicode
                ? hasBangla
                  ? t({
                      en: "This already looks like Unicode Bangla, so it doesn't need converting. Did you mean Unicode → Bijoy?",
                      bn: "এটি দেখে মনে হচ্ছে আগে থেকেই ইউনিকোড বাংলা, তাই রূপান্তরের দরকার নেই। আপনি কি ইউনিকোড → বিজয় করতে চাইছেন?",
                    })
                  : t({
                      en: "This doesn't look like Bijoy text. Bijoy text usually looks garbled, like “Avwg evsjvq”.",
                      bn: "এটি বিজয়ে লেখা বলে মনে হচ্ছে না। বিজয়ের লেখা সাধারণত এলোমেলো দেখায়, যেমন “Avwg evsjvq”।",
                    })
                : t({
                    en: "This looks like Bijoy text already. Did you mean Bijoy → Unicode?",
                    bn: "এটি দেখে মনে হচ্ছে আগে থেকেই বিজয়ে লেখা। আপনি কি বিজয় → ইউনিকোড করতে চাইছেন?",
                  })}
            </p>
          )}
          {!toUnicode && (
            <p className="mt-4 text-xs text-ink-3">
              {t({
                en: "Bijoy output only reads correctly in a SutonnyMJ (or other Bijoy) font. Paste it into a Word, InDesign or Photoshop document and set the font to SutonnyMJ.",
                bn: "বিজয় লেখা কেবল সুতন্নিএমজে (বা অন্য বিজয় ফন্টে) ঠিকমতো পড়া যায়। ওয়ার্ড, ইনডিজাইন বা ফটোশপের ডকুমেন্টে পেস্ট করে ফন্ট সুতন্নিএমজে করে দিন।",
              })}
            </p>
          )}
        </Sheet>
      }
      side={
        <>
          <SideSection title={t({ en: "Output", bn: "ফলাফল" })}>
            <CopyButton text={output} variant="primary" label={t({ en: "Copy output", bn: "ফলাফল কপি করুন" })} />
            <Button
              variant="secondary"
              disabled={!output}
              onClick={() =>
                downloadText(
                  output,
                  fileName ? renameFile(fileName, toUnicode ? "-unicode.txt" : "-bijoy.txt") : toUnicode ? "unicode.txt" : "bijoy.txt",
                )
              }
            >
              {t({ en: "Download .txt", bn: ".txt ডাউনলোড করুন" })}
            </Button>
            <Button variant="secondary" onClick={swap}>
              {toUnicode
                ? t({ en: "Swap: Unicode → Bijoy", bn: "উল্টো করুন: ইউনিকোড → বিজয়" })
                : t({ en: "Swap: Bijoy → Unicode", bn: "উল্টো করুন: বিজয় → ইউনিকোড" })}
            </Button>
            <p className="text-xs text-ink-3">
              {t({ en: "Swap opens the reverse converter with this output.", bn: "উল্টো করলে এই ফলাফল নিয়ে বিপরীত রূপান্তরকারী খুলবে।" })}
            </p>
          </SideSection>
          <SideSection title={t({ en: "Input", bn: "ইনপুট" })}>
            <OpenFileButton accept=".txt,text/plain" onFile={(file) => void loadFile(file)} label={t({ en: "Open .txt file", bn: ".txt ফাইল খুলুন" })} />
            <Button
              variant="secondary"
              onClick={() => {
                setInput(SAMPLES[direction]);
                setFileName(null);
              }}
            >
              {t({ en: "Paste sample", bn: "নমুনা লেখা বসান" })}
            </Button>
            <Button
              variant="ghost"
              disabled={!input}
              onClick={() => {
                setInput("");
                setFileName(null);
                setError(null);
              }}
            >
              {t({ en: "Clear", bn: "মুছে ফেলুন" })}
            </Button>
          </SideSection>
          <ErrorNote message={error} />
          <p className="px-1 text-xs text-ink-3">
            {t({
              en: "Conversion runs entirely in your browser. Nothing is uploaded.",
              bn: "পুরো রূপান্তর আপনার ব্রাউজারেই হয়। কিছুই আপলোড হয় না।",
            })}
          </p>
        </>
      }
    />
  );
}
