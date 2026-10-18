"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { TOOLS, getCategory, type Tool } from "@/tools/registry";

const MAX_RESULTS = 8;

function matches(tool: Tool, q: string): boolean {
  const hay = [tool.name, tool.blurb, ...(tool.keywords ?? [])].join(" ").toLowerCase();
  return q.split(/\s+/).every((word) => hay.includes(word));
}

/** ⌘K / Ctrl+K command palette for jumping straight to a tool. */
export function ToolSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (q ? TOOLS.filter((t) => matches(t, q)) : TOOLS.filter((t) => t.featured)).slice(0, MAX_RESULTS);
  }, [query]);

  const open = useCallback(() => {
    setQuery("");
    setActive(0);
    dialogRef.current?.showModal();
    inputRef.current?.focus();
  }, []);

  const go = useCallback(
    (tool: Tool) => {
      dialogRef.current?.close();
      router.push(`/tools/${tool.slug}/`);
    },
    [router],
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && results[active]) {
        go(results[active]);
      }
    },
    [results, active, go],
  );

  useEffect(() => {
    function onGlobalKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        open();
      }
    }
    window.addEventListener("keydown", onGlobalKey);
    return () => window.removeEventListener("keydown", onGlobalKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="flex items-center gap-2 rounded-md border border-rule-strong bg-sheet px-3 py-1.5 text-ink-3 hover:border-ink-3 hover:text-ink-2"
      >
        <svg aria-hidden viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="9" cy="9" r="6" />
          <path d="m14 14 4 4" strokeLinecap="round" />
        </svg>
        <span>Find a tool</span>
        <kbd className="hidden rounded border border-rule px-1.5 font-mono text-[11px] sm:inline">⌘K</kbd>
      </button>

      <dialog
        ref={dialogRef}
        aria-label="Find a tool"
        className="mx-auto mt-[12vh] w-[min(560px,calc(100vw-32px))] rounded-xl border border-rule-strong bg-sheet p-0 text-ink shadow-2xl backdrop:bg-ink/30 backdrop:backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget) e.currentTarget.close();
        }}
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
          placeholder="Merge, OCR, Bijoy, compress…"
          className="w-full border-b border-rule bg-transparent px-4 py-3.5 text-base outline-none placeholder:text-ink-3"
        />
        <ul className="max-h-[60vh] overflow-y-auto p-2">
          {results.length === 0 && <li className="px-3 py-6 text-center text-sm text-ink-3">No tool matches “{query}”.</li>}
          {results.map((tool, i) => (
            <li key={tool.slug}>
              <button
                type="button"
                onMouseEnter={() => setActive(i)}
                onClick={() => go(tool)}
                className={`flex w-full items-baseline gap-3 rounded-lg px-3 py-2.5 text-left ${i === active ? "bg-paper-2" : ""}`}
              >
                <span className="font-medium">{tool.name}</span>
                <span className="truncate text-sm text-ink-3">{tool.blurb}</span>
                <span className="ml-auto shrink-0 text-xs text-ink-3">{getCategory(tool.category).name}</span>
              </button>
            </li>
          ))}
        </ul>
      </dialog>
    </>
  );
}
