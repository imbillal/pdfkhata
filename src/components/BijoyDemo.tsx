"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { bijoyToUnicode } from "@/lib/bijoy";
import { useT } from "@/i18n/LocaleProvider";

const SAMPLE = "Avgv‡`i †`‡ki bvg evsjv‡`k| Avwg evsjvq Mvb MvB|";

/** A live, editable Bijoy → Unicode sample: the problem and the fix side by side. */
export function BijoyDemo() {
  const t = useT();
  const [input, setInput] = useState(SAMPLE);
  const output = useMemo(() => bijoyToUnicode(input), [input]);

  return (
    <div className="grid overflow-hidden rounded-2xl border border-rule bg-sheet md:grid-cols-2">
      <label className="flex flex-col gap-2 border-b border-rule p-5 md:border-r md:border-b-0">
        <span className="text-sm font-medium text-ink-3">
          {t({ en: "What you copied from an old file", bn: "পুরোনো ফাইল থেকে কপি করা লেখা" })}
        </span>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={3}
          spellCheck={false}
          className="resize-none rounded-lg bg-paper-2 p-3 font-mono text-[0.95rem] leading-relaxed text-ink-2 outline-none focus:ring-2 focus:ring-margin/40"
        />
      </label>
      <div className="flex flex-col gap-2 p-5">
        <span className="text-sm font-medium text-ink-3">{t({ en: "What PDFKhata gives back", bn: "PDFKhata যা ফেরত দেয়" })}</span>
        <p className="min-h-[5.6rem] rounded-lg p-3 text-xl leading-relaxed font-medium" style={{ backgroundColor: "color-mix(in srgb, var(--cat-bangla) 10%, transparent)" }}>
          {output}
        </p>
        <Link href={t.href("/tools/bijoy-to-unicode/")} className="self-start text-[0.95rem] font-semibold text-margin hover:underline">
          {t({ en: "Convert a whole document", bn: "পুরো ডকুমেন্ট রূপান্তর করুন" })}
        </Link>
      </div>
    </div>
  );
}
