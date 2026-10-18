"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { Sheet, SideSection, Workspace } from "@/components/kit";
import { useT } from "@/i18n/LocaleProvider";
import { StatTile, TextInput } from "@/tools/shared/textKit";

const STOP_WORDS = new Set(
  (
    "the and for are but not you all any can had her was one our out has him his how its may new now old see two who did get let say she too use " +
    "that with have this will your from they know want been good much some time very when come here just like long make many more only over such take than them well were what " +
    "about after again also back because before being both could does doing down each even every first into most other should since still their there these those through " +
    "under until upon where which while would yours ours itself myself into onto then once same own off why yes " +
    "এবং ও যে এই সেই এক একটি একটা করে করা করেন করেছে করেছেন করতে হয় হয়ে হয়েছে হবে হলো হল ছিল ছিলেন আছে আছেন থেকে জন্য সঙ্গে সাথে নিয়ে দিয়ে " +
    "কিন্তু তবে আর না নয় কি কী কেন কোন কোনো যদি তাহলে তার তাদের তিনি তারা আমি আমরা আমার আমাদের তুমি তোমার আপনি আপনার সে তা এ ওই " +
    "এর এটা এটি ওটা সব সকল অনেক কিছু খুব আরও এখন তখন যখন যা যেমন মতো পর আগে পরে উপর মধ্যে ভিতরে বলে বলেন গেছে যায় হতে দিয়ে দেন"
  ).split(/\s+/),
);

const fmtDuration = (minutes: number, t: ReturnType<typeof useT>) => {
  if (minutes === 0) return t.n(0);
  const total = Math.max(1, Math.round(minutes * 60));
  const m = Math.floor(total / 60);
  const s = total % 60;
  if (m === 0) return t({ en: `${t.n(s)} sec`, bn: `${t.n(s)} সেকেন্ড` });
  if (s === 0 || m >= 10) return t({ en: `${t.n(Math.round(total / 60))} min`, bn: `${t.n(Math.round(total / 60))} মিনিট` });
  return t({ en: `${t.n(m)} min ${t.n(s)} sec`, bn: `${t.n(m)} মিনিট ${t.n(s)} সেকেন্ড` });
};

export default function WordCounter() {
  const t = useT();
  const [text, setText] = useState("");
  const input = useDeferredValue(text);

  const stats = useMemo(() => {
    const words: string[] = [];
    let graphemes = 0;
    let graphemesNoSpace = 0;
    if (input) {
      const wordSeg = new Intl.Segmenter(undefined, { granularity: "word" });
      for (const s of wordSeg.segment(input)) if (s.isWordLike) words.push(s.segment);
      const gSeg = new Intl.Segmenter(undefined, { granularity: "grapheme" });
      for (const g of gSeg.segment(input)) {
        graphemes++;
        if (!/^\s+$/u.test(g.segment)) graphemesNoSpace++;
      }
    }
    // Sentence enders: . ! ? followed by space/end, or Bangla দাঁড়ি (।/॥) anywhere.
    const sentences = input
      .split(/[.!?]+(?=[\s"'”’)\]]|$)|[।॥]+/u)
      .filter((s) => /[\p{L}\p{N}]/u.test(s)).length;
    const paragraphs = input.split(/\n\s*\n/).filter((p) => p.trim()).length;
    const lines = input ? input.split("\n").filter((l) => l.trim()).length : 0;

    const freq = new Map<string, number>();
    for (const w of words) {
      const key = w.toLocaleLowerCase();
      if (/^\p{N}+$/u.test(key)) continue;
      if (Array.from(key).length < 3 || STOP_WORDS.has(key)) continue;
      freq.set(key, (freq.get(key) ?? 0) + 1);
    }
    const keywords = [...freq.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 10);

    return {
      words: words.length,
      graphemes,
      graphemesNoSpace,
      codeUnits: input.length,
      sentences,
      paragraphs,
      lines,
      keywords,
      avgWordLen: words.length ? words.reduce((n, w) => n + Array.from(w).length, 0) / words.length : 0,
    };
  }, [input]);

  return (
    <Workspace
      main={
        <Sheet className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile label={t({ en: "Words", bn: "শব্দ" })} value={t.n(stats.words)} />
            <StatTile label={t({ en: "Characters", bn: "অক্ষর" })} value={t.n(stats.graphemes)} sub={t({ en: "with spaces", bn: "স্পেসসহ" })} />
            <StatTile label={t({ en: "Characters", bn: "অক্ষর" })} value={t.n(stats.graphemesNoSpace)} sub={t({ en: "without spaces", bn: "স্পেস ছাড়া" })} />
            <StatTile label={t({ en: "Sentences", bn: "বাক্য" })} value={t.n(stats.sentences)} />
            <StatTile label={t({ en: "Paragraphs", bn: "অনুচ্ছেদ" })} value={t.n(stats.paragraphs)} />
            <StatTile label={t({ en: "Lines", bn: "লাইন" })} value={t.n(stats.lines)} />
            <StatTile label={t({ en: "Reading time", bn: "পড়ার সময়" })} value={fmtDuration(stats.words / 200, t)} sub={t({ en: "at 200 wpm", bn: "মিনিটে ২০০ শব্দ ধরে" })} />
            <StatTile label={t({ en: "Speaking time", bn: "বলার সময়" })} value={fmtDuration(stats.words / 130, t)} sub={t({ en: "at 130 wpm", bn: "মিনিটে ১৩০ শব্দ ধরে" })} />
          </div>
          <TextInput
            label={t({ en: "Your text", bn: "আপনার লেখা" })}
            value={text}
            onChange={setText}
            accept=".txt,.md,text/plain"
            spellCheck
            className="min-h-80 font-sans! text-base!"
            placeholder={t({ en: "Type or paste text — English, বাংলা, or both.", bn: "এখানে লিখুন বা পেস্ট করুন — বাংলা, English বা দুটোই।" })}
          />
        </Sheet>
      }
      side={
        <>
          <SideSection title={t({ en: "Details", bn: "বিস্তারিত" })}>
            <dl className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1.5 text-sm">
              <dt className="text-ink-2">{t({ en: "Letters (graphemes)", bn: "বর্ণ (গ্রাফিম)" })}</dt>
              <dd className="text-right tabular-nums">{t.n(stats.graphemes)}</dd>
              <dt className="text-ink-2">{t({ en: "Code units (JS length)", bn: "কোড ইউনিট (JS দৈর্ঘ্য)" })}</dt>
              <dd className="text-right tabular-nums">{t.n(stats.codeUnits)}</dd>
              <dt className="text-ink-2">{t({ en: "Avg. word length", bn: "গড় শব্দদৈর্ঘ্য" })}</dt>
              <dd className="text-right tabular-nums">{t.n(stats.avgWordLen, { maximumFractionDigits: 1 })}</dd>
            </dl>
            <p className="text-xs text-ink-3">
              {t({
                en: "Bangla conjuncts like ক্ষ count as one letter; code units count every Unicode piece, the way many forms limit length.",
                bn: "ক্ষ-এর মতো যুক্তাক্ষর একটি বর্ণ হিসেবে গোনা হয়; কোড ইউনিটে প্রতিটি ইউনিকোড অংশ আলাদা গোনা হয়, অনেক ফর্ম যেভাবে দৈর্ঘ্য মাপে।",
              })}
            </p>
          </SideSection>
          <SideSection title={t({ en: "Top keywords", bn: "প্রধান শব্দ" })}>
            {stats.keywords.length === 0 ? (
              <p className="text-sm text-ink-3">{t({ en: "Keywords show up as you type.", bn: "লিখতে থাকলে এখানে শব্দগুলো দেখাবে।" })}</p>
            ) : (
              <ol className="flex flex-col gap-1.5">
                {stats.keywords.map(([word, count]) => (
                  <li key={word} className="flex items-center gap-2 text-sm">
                    <span className="min-w-0 flex-1 truncate">{word}</span>
                    <span className="h-1.5 w-16 overflow-hidden rounded-full bg-paper-2" aria-hidden>
                      <span className="block h-full bg-margin" style={{ width: `${(count / stats.keywords[0][1]) * 100}%` }} />
                    </span>
                    <span className="w-16 text-right text-xs text-ink-3 tabular-nums">
                      {t.n(count)} · {t.n((count / Math.max(1, stats.words)) * 100, { maximumFractionDigits: 1 })}%
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </SideSection>
        </>
      }
    />
  );
}
