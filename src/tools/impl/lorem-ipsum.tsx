"use client";

import { useMemo, useState } from "react";
import { Button, Field, Segmented, Sheet, SideSection, Workspace, inputClass } from "@/components/kit";
import { downloadText } from "@/lib/files";
import { useT } from "@/i18n/LocaleProvider";
import { CopyButton, OutputArea, Toggle } from "@/tools/shared/textKit";
import { randomInt } from "@/tools/shared/textLogic";

type Lang = "en" | "bn";
type Unit = "paragraphs" | "sentences" | "words";

const LATIN = (
  "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam " +
  "quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum " +
  "eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum " +
  "curabitur pretium tincidunt lacus nunc pulvinar sapien ligula vitae mauris integer facilisis varius quam praesent porta morbi tristique " +
  "senectus netus malesuada fames ac turpis egestas pellentesque habitant vestibulum ante primis faucibus orci luctus ultrices posuere cubilia " +
  "donec viverra mi quis risus fermentum sollicitudin aenean euismod elementum nisl purus semper eget duis at tellus"
).split(" ");

// Everyday Bangla words, mixed parts of speech, so random sentences read like real (if dreamy) prose.
const BANGLA = (
  "আমি আমরা তুমি সে তারা আমাদের তোমার তাদের মানুষ শিশু মা বাবা বন্ধু শিক্ষক কৃষক মাঝি গ্রাম শহর বাড়ি উঠান নদী পুকুর মাঠ আকাশ মেঘ বৃষ্টি " +
  "রোদ বাতাস সকাল দুপুর বিকেল সন্ধ্যা রাত চাঁদ তারা ফুল গাছ পাতা ফল ধান চাল ভাত মাছ ডাল চা দুধ বই খাতা কলম স্কুল বাজার রাস্তা নৌকা " +
  "ট্রেন বাস রিকশা পথ ঘাট হাট দেশ ভাষা গান কবিতা গল্প ছবি খবর কাজ সময় দিন বছর মন স্বপ্ন আশা ভালোবাসা হাসি আনন্দ উৎসব মেলা " +
  "নতুন পুরোনো সুন্দর বড় ছোট সবুজ নীল লাল হলুদ সাদা শান্ত ব্যস্ত উজ্জ্বল মিষ্টি ঠান্ডা গরম দূরের কাছের প্রতিদিন হঠাৎ ধীরে আস্তে " +
  "অনেক সবাই কিছু আবার এখনো সবসময় যায় আসে দেখে শোনে বলে লেখে পড়ে হাঁটে ভাবে খেলে গায় হাসে ফেরে থাকে চলে ফোটে নামে ওঠে জাগে " +
  "খোঁজে জানে বোঝে রাখে দেয় নেয় করে এবং কিন্তু তবু যেন যখন তখন সঙ্গে ভেতরে পাশে ওপারে নিচে উপরে মাঝে থেকে দিকে জন্য"
).split(" ");

const LOREM_START = "Lorem ipsum dolor sit amet, consectetur adipiscing elit".split(" ");

const between = (min: number, max: number) => min + randomInt(max - min + 1);
const pick = (list: string[]) => list[randomInt(list.length)];

function sentence(lang: Lang, startWith?: string[]): string {
  const bank = lang === "bn" ? BANGLA : LATIN;
  const n = between(6, 14);
  const words = startWith ? [...startWith] : [];
  while (words.length < n) {
    const w = pick(bank);
    if (w !== words[words.length - 1]) words.push(w);
  }
  // One comma somewhere in the middle of longer sentences.
  if (!startWith && n >= 9 && randomInt(2) === 0) {
    const at = between(2, n - 4);
    words[at] = `${words[at]},`;
  }
  let s = words.join(" ");
  if (lang === "en") s = s[0].toUpperCase() + s.slice(1);
  return s + (lang === "bn" ? "।" : ".");
}

function generate(lang: Lang, unit: Unit, count: number, loremStart: boolean): string[] {
  const useStart = lang === "en" && loremStart;
  if (unit === "words") {
    const bank = lang === "bn" ? BANGLA : LATIN;
    const words = useStart ? "lorem ipsum dolor sit amet".split(" ").slice(0, count) : [];
    while (words.length < count) words.push(pick(bank));
    let s = words.join(" ");
    if (lang === "en") s = s[0].toUpperCase() + s.slice(1);
    return [s + (lang === "bn" ? "।" : ".")];
  }
  const para = (sentences: number, first: boolean) =>
    Array.from({ length: sentences }, (_, i) => sentence(lang, first && i === 0 && useStart ? LOREM_START : undefined)).join(" ");
  if (unit === "sentences") return [para(count, true)];
  return Array.from({ length: count }, (_, i) => para(between(4, 7), i === 0));
}

const LIMITS: Record<Unit, number> = { paragraphs: 50, sentences: 200, words: 2000 };

export default function LoremIpsum() {
  const t = useT();
  const [lang, setLang] = useState<Lang>(t.locale);
  const [unit, setUnit] = useState<Unit>("paragraphs");
  const [countRaw, setCountRaw] = useState("3");
  const [loremStart, setLoremStart] = useState(true);
  const [html, setHtml] = useState(false);
  const [nonce, setNonce] = useState(0);

  const count = Math.min(LIMITS[unit], Math.max(1, Math.floor(Number(countRaw)) || 1));

  const paragraphs = useMemo(() => {
    void nonce;
    return generate(lang, unit, count, loremStart);
  }, [lang, unit, count, loremStart, nonce]);

  const output = html ? paragraphs.map((p) => `<p>${p}</p>`).join("\n") : paragraphs.join("\n\n");
  const wordTotal = paragraphs.reduce((n, p) => n + p.split(/\s+/).filter(Boolean).length, 0);

  return (
    <Workspace
      main={
        <Sheet className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-ink-3">
              {t({ en: `${t.n(paragraphs.length)} paragraph(s) · ${t.n(wordTotal)} words`, bn: `${t.n(paragraphs.length)}টি অনুচ্ছেদ · ${t.n(wordTotal)}টি শব্দ` })}
            </p>
            <div className="flex gap-2">
              <CopyButton text={output} variant="primary" />
              <Button variant="secondary" className="px-3 py-2" onClick={() => setNonce((n) => n + 1)}>
                {t({ en: "Regenerate", bn: "আবার তৈরি করুন" })}
              </Button>
            </div>
          </div>
          {html ? (
            <OutputArea label={t({ en: "Generated text", bn: "তৈরি লেখা" })} value={output} className={`min-h-96 ${lang === "bn" ? "font-bangla!" : ""}`} />
          ) : (
            <div className={`flex flex-col gap-4 text-base leading-relaxed text-ink ${lang === "bn" ? "font-bangla" : ""}`} lang={lang}>
              {paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          )}
        </Sheet>
      }
      side={
        <>
          <SideSection title={t({ en: "Text", bn: "লেখা" })}>
            <Field label={t({ en: "Language", bn: "ভাষা" })}>
              {() => (
                <Segmented<Lang>
                  label={t({ en: "Language", bn: "ভাষা" })}
                  value={lang}
                  onChange={setLang}
                  options={[
                    { value: "en", label: "Lorem ipsum" },
                    { value: "bn", label: "বাংলা" },
                  ]}
                />
              )}
            </Field>
            <Field label={t({ en: "Generate", bn: "তৈরি করুন" })}>
              {() => (
                <Segmented<Unit>
                  label={t({ en: "Unit", bn: "একক" })}
                  value={unit}
                  onChange={(u) => {
                    setUnit(u);
                    setCountRaw(u === "paragraphs" ? "3" : u === "sentences" ? "5" : "50");
                  }}
                  options={[
                    { value: "paragraphs", label: t({ en: "Paragraphs", bn: "অনুচ্ছেদ" }) },
                    { value: "sentences", label: t({ en: "Sentences", bn: "বাক্য" }) },
                    { value: "words", label: t({ en: "Words", bn: "শব্দ" }) },
                  ]}
                />
              )}
            </Field>
            <Field label={t({ en: "How many", bn: "কতগুলো" })} hint={t({ en: `Up to ${t.n(LIMITS[unit])}`, bn: `সর্বোচ্চ ${t.n(LIMITS[unit])}` })}>
              {(id) => (
                <input id={id} type="number" min={1} max={LIMITS[unit]} className={inputClass} value={countRaw} onChange={(e) => setCountRaw(e.target.value)} />
              )}
            </Field>
            {lang === "en" && <Toggle checked={loremStart} onChange={setLoremStart} label={t({ en: "Start with “Lorem ipsum dolor sit amet…”", bn: "“Lorem ipsum dolor sit amet…” দিয়ে শুরু" })} />}
            <Toggle checked={html} onChange={setHtml} label={t({ en: "Wrap paragraphs in <p> tags", bn: "অনুচ্ছেদগুলো <p> ট্যাগে মুড়ে দিন" })} />
            <Button variant="secondary" onClick={() => downloadText(output, html ? "placeholder.html" : "placeholder.txt", html ? "text/html;charset=utf-8" : undefined)}>
              {t({ en: "Download", bn: "ডাউনলোড" })}
            </Button>
          </SideSection>
          {lang === "bn" && (
            <p className="px-1 text-xs text-ink-3">
              {t({
                en: "Bangla placeholder is built from everyday words, so layouts show real Bangla line heights and conjuncts.",
                bn: "বাংলা নমুনা লেখা রোজকার শব্দ দিয়ে তৈরি, তাই ডিজাইনে আসল বাংলা লাইনের উচ্চতা ও যুক্তাক্ষর কেমন দেখায় তা বোঝা যায়।",
              })}
            </p>
          )}
        </>
      }
    />
  );
}
