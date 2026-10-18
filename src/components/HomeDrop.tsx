"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { TOOLS, fileKindOf, type FileKind, type Tool } from "@/tools/registry";
import { setHandoff } from "@/lib/handoff";
import { formatBytes } from "@/lib/files";
import { useT } from "@/i18n/LocaleProvider";
import type { Bi } from "@/i18n/locale";

const KIND_LABEL: Record<FileKind, Bi> = {
  pdf: { en: "PDF", bn: "PDF" },
  image: { en: "image", bn: "ছবি" },
  csv: { en: "CSV", bn: "CSV" },
  json: { en: "JSON", bn: "JSON" },
  zip: { en: "ZIP", bn: "ZIP" },
  text: { en: "text file", bn: "লেখার ফাইল" },
  any: { en: "file", bn: "ফাইল" },
};

/** File-first entry: drop anything, get the tools that fit it. */
export function HomeDrop() {
  const router = useRouter();
  const t = useT();
  const [files, setFiles] = useState<File[]>([]);
  const [over, setOver] = useState(false);

  const kind: FileKind | null = useMemo(() => {
    if (files.length === 0) return null;
    const kinds = new Set(files.map(fileKindOf));
    return kinds.size === 1 ? [...kinds][0] : "any";
  }, [files]);

  const suggestions: Tool[] = useMemo(() => {
    if (!kind) return [];
    return TOOLS.filter((t) => t.accepts.includes(kind) || t.accepts.includes("any"));
  }, [kind]);

  const take = useCallback((list: FileList | null) => {
    if (list && list.length) setFiles(Array.from(list));
  }, []);

  const pick = useCallback(
    (tool: Tool) => {
      setHandoff(files);
      router.push(t.href(`/tools/${tool.slug}/`));
    },
    [files, router, t],
  );

  if (kind) {
    const total = files.reduce((s, f) => s + f.size, 0);
    return (
      <div className="rounded-xl border border-rule-strong bg-sheet p-5 sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-sm text-ink-2">
            <span className="font-medium text-ink">
              {files.length === 1 ? files[0].name : t({ en: `${files.length} files`, bn: `${t.n(files.length)}টি ফাইল` })}
            </span>{" "}
            · {formatBytes(total)}
          </p>
          <button type="button" onClick={() => setFiles([])} className="text-sm text-ink-3 underline-offset-4 hover:text-margin hover:underline">
            {t({ en: "Use a different file", bn: "অন্য ফাইল নিন" })}
          </button>
        </div>
        <p className="mt-4 font-display text-2xl font-semibold">{t({ en: `What should we do with this ${KIND_LABEL[kind].en}?`, bn: `এই ${KIND_LABEL[kind].bn} দিয়ে কী করবেন?` })}</p>
        {suggestions.length === 0 ? (
          <p className="mt-3 text-ink-2">{t({ en: "No tool takes this kind of file yet.", bn: "এই ধরনের ফাইলের জন্য এখনো কোনো টুল নেই।" })}</p>
        ) : (
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {suggestions.map((tool) => (
              <li key={tool.slug}>
                <button
                  type="button"
                  onClick={() => pick(tool)}
                  className="group flex w-full items-center justify-between gap-3 rounded-lg border border-rule px-4 py-3 text-left hover:border-margin hover:bg-margin-soft"
                >
                  <span>
                    <span className="block font-medium">{t(tool.name)}</span>
                    <span className="block text-sm text-ink-3">{t(tool.blurb)}</span>
                  </span>
                  <span className="text-ink-3 group-hover:text-margin">→</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        take(e.dataTransfer.files);
      }}
      className={`ruled margin-line flex min-h-64 cursor-pointer flex-col items-start justify-center gap-3 rounded-xl border py-10 pr-6 pl-10 transition-colors sm:pl-14 ${
        over ? "border-margin bg-margin-soft" : "border-rule-strong bg-sheet hover:border-ink-3"
      }`}
    >
      <input type="file" multiple className="sr-only" onChange={(e) => take(e.target.files)} />
      <span className="font-display text-3xl leading-tight font-semibold sm:text-4xl">
        {t({ en: "Drop any file here.", bn: "যেকোনো ফাইল এখানে ছাড়ুন।" })}
      </span>
      <span className="max-w-md text-ink-2">
        {t({ en: "A PDF, a photo, a CSV, a ZIP… we'll show you every tool that can work with it.", bn: "PDF, ছবি, CSV, ZIP… যা-ই দিন, সেটা নিয়ে কাজ করতে পারে এমন সব টুল দেখাব।" })}
      </span>
      <span className="mt-2 rounded-full bg-ink px-5 py-2 text-sm font-medium text-paper">{t({ en: "Choose files", bn: "ফাইল বেছে নিন" })}</span>
    </label>
  );
}
