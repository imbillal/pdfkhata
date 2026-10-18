"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { TOOLS, fileKindOf, type FileKind, type Tool } from "@/tools/registry";
import { setHandoff } from "@/lib/handoff";
import { formatBytes } from "@/lib/files";

const KIND_LABEL: Record<FileKind, string> = {
  pdf: "PDF",
  image: "image",
  csv: "CSV",
  json: "JSON",
  zip: "ZIP",
  text: "text file",
  any: "file",
};

/** File-first entry: drop anything, get the tools that fit it. */
export function HomeDrop() {
  const router = useRouter();
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
      router.push(`/tools/${tool.slug}/`);
    },
    [files, router],
  );

  if (kind) {
    const total = files.reduce((s, f) => s + f.size, 0);
    return (
      <div className="rounded-xl border border-rule-strong bg-sheet p-5 sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-sm text-ink-2">
            <span className="font-medium text-ink">
              {files.length === 1 ? files[0].name : `${files.length} files`}
            </span>{" "}
            · {formatBytes(total)}
          </p>
          <button type="button" onClick={() => setFiles([])} className="text-sm text-ink-3 underline-offset-4 hover:text-margin hover:underline">
            Use a different file
          </button>
        </div>
        <p className="mt-4 font-display text-2xl font-semibold">What should we do with this {KIND_LABEL[kind]}?</p>
        {suggestions.length === 0 ? (
          <p className="mt-3 text-ink-2">No tool takes this kind of file yet.</p>
        ) : (
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {suggestions.map((t) => (
              <li key={t.slug}>
                <button
                  type="button"
                  onClick={() => pick(t)}
                  className="group flex w-full items-center justify-between gap-3 rounded-lg border border-rule px-4 py-3 text-left hover:border-margin hover:bg-margin-soft"
                >
                  <span>
                    <span className="block font-medium">{t.name}</span>
                    <span className="block text-sm text-ink-3">{t.blurb}</span>
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
        Drop any file here.
      </span>
      <span className="max-w-md text-ink-2">
        A PDF, a photo, a CSV, a ZIP… we&apos;ll show you every tool that can work with it.
      </span>
      <span className="mt-2 rounded-full bg-ink px-5 py-2 text-sm font-medium text-paper">Choose files</span>
    </label>
  );
}
