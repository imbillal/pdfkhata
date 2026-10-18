"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { TOOLS, fileKindOf, type FileKind, type Tool } from "@/tools/registry";
import { ToolIcon } from "@/tools/icons";
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

/** The name label on the khata cover: drop any file, get the tools that fit it. */
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
    return TOOLS.filter((tool) => tool.accepts.includes(kind) || tool.accepts.includes("any"));
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

  const total = files.reduce((s, f) => s + f.size, 0);

  return (
    <div className="relative rounded-xl bg-[#fffdf6] p-1.5 shadow-[0_30px_60px_-25px_rgb(0_0_0/0.65)] md:rotate-[0.8deg]">
      <div className="khata-label rounded-lg border-2 border-[#1a2f7d]/80 px-5 pt-5 pb-6 sm:px-8">
        {kind ? (
          <div>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="min-w-0 truncate text-[0.95rem] text-[#485166]">
                <span className="font-semibold text-[#121722]">
                  {files.length === 1 ? files[0].name : t({ en: `${files.length} files`, bn: `${t.n(files.length)}টি ফাইল` })}
                </span>
                , {formatBytes(total)}
              </p>
              <button type="button" onClick={() => setFiles([])} className="text-[0.95rem] font-medium text-[#2446b0] hover:underline">
                {t({ en: "Choose another", bn: "অন্য ফাইল নিন" })}
              </button>
            </div>
            <p className="mt-3 font-display text-2xl font-bold text-[#121722]">
              {t({ en: `What should we do with this ${KIND_LABEL[kind].en}?`, bn: `এই ${KIND_LABEL[kind].bn} দিয়ে কী করবেন?` })}
            </p>
            {suggestions.length === 0 ? (
              <p className="mt-3 text-[#485166]">{t({ en: "No tool takes this kind of file yet.", bn: "এই ধরনের ফাইলের জন্য এখনো কোনো টুল নেই।" })}</p>
            ) : (
              <ul className="mt-4 grid max-h-72 gap-1.5 overflow-y-auto pr-1 sm:grid-cols-2">
                {suggestions.map((tool) => (
                  <li key={tool.slug}>
                    <button
                      type="button"
                      onClick={() => pick(tool)}
                      className="flex w-full items-center gap-3 rounded-xl bg-white px-3 py-2.5 text-left ring-1 ring-[#c9d0dc] hover:ring-2 hover:ring-[#2446b0]"
                    >
                      <ToolIcon slug={tool.slug} category={tool.category} size="sm" />
                      <span className="font-medium text-[#121722]">{t(tool.name)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
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
            className={`block cursor-pointer rounded-lg transition-colors ${over ? "bg-[#e6ebfa]" : ""}`}
          >
            <input type="file" multiple className="sr-only" onChange={(e) => take(e.target.files)} />
            <span className="block text-center font-display text-xl font-bold text-[#1a2f7d]">
              {t({ en: "Drop a file to begin", bn: "একটি ফাইল দিয়ে শুরু করুন" })}
            </span>
            <span className="mt-5 grid grid-cols-[auto_1fr] items-end gap-x-3 gap-y-4 text-[1.02rem] text-[#121722]">
              <span className="text-[#485166]">{t({ en: "File", bn: "ফাইল" })}</span>
              <span className="border-b border-dashed border-[#1a2f7d]/50 pb-1 font-semibold">
                {t({ en: "Drag it onto this label", bn: "এই লেবেলের ওপর টেনে আনুন" })}
              </span>
              <span className="text-[#485166]">{t({ en: "Kind", bn: "ধরন" })}</span>
              <span className="border-b border-dashed border-[#1a2f7d]/50 pb-1 text-[#485166]">
                {t({ en: "PDF, photo, CSV, ZIP or text", bn: "PDF, ছবি, CSV, ZIP বা লেখা" })}
              </span>
              <span className="text-[#485166]">{t({ en: "Next", bn: "এরপর" })}</span>
              <span className="border-b border-dashed border-[#1a2f7d]/50 pb-1 text-[#485166]">
                {t({ en: "Pick a tool that fits it", bn: "মানানসই একটি টুল বেছে নিন" })}
              </span>
            </span>
            <span className="mt-7 flex items-center justify-center gap-2 rounded-xl bg-[#2446b0] px-5 py-3 font-semibold text-white shadow-sm hover:bg-[#1c3891]">
              <Upload className="size-5" />
              {t({ en: "Choose files", bn: "ফাইল বেছে নিন" })}
            </span>
          </label>
        )}
      </div>
    </div>
  );
}
