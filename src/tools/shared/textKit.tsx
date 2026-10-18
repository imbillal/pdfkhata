"use client";

// Small shared pieces for the text/data tools: copy button, file opener,
// checkbox toggle and a text input that accepts paste, upload or drop.

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { TextArea } from "@/components/kit";
import { takeHandoff } from "@/lib/handoff";
import { useT } from "@/i18n/LocaleProvider";

/** Copy text to the clipboard and flash "Copied" for a moment. */
export function CopyButton({
  text,
  label,
  className = "",
  variant = "secondary",
  disabled,
}: {
  text: string;
  label?: string;
  className?: string;
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
}) {
  const t = useT();
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
    } catch {
      setState("failed");
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 1600);
  }, [text]);

  const styles = {
    primary: "bg-margin text-white hover:brightness-110",
    secondary: "border border-rule-strong bg-sheet text-ink hover:border-ink-3",
    ghost: "text-ink-2 hover:bg-paper-2 hover:text-ink",
  }[variant];

  return (
    <button
      type="button"
      onClick={copy}
      disabled={disabled || text.length === 0}
      className={`inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition disabled:opacity-50 ${styles} ${className}`}
    >
      {state === "copied"
        ? t({ en: "Copied ✓", bn: "কপি হয়েছে ✓" })
        : state === "failed"
          ? t({ en: "Copy failed", bn: "কপি হয়নি" })
          : (label ?? t({ en: "Copy", bn: "কপি" }))}
    </button>
  );
}

/** Calls `onFile` once on mount if the user dropped a file on the home page. */
export function useHandoffFile(onFile: (file: File) => void): void {
  const cb = useRef(onFile);
  useEffect(() => {
    cb.current = onFile;
  });
  useEffect(() => {
    const handed = takeHandoff();
    if (handed?.[0]) cb.current(handed[0]);
  }, []);
}

/** A compact "Open file" button (hidden file input inside a label). */
export function OpenFileButton({
  accept,
  onFile,
  label,
  multiple = false,
  onFiles,
}: {
  accept?: string;
  onFile?: (file: File) => void;
  onFiles?: (files: File[]) => void;
  label?: string;
  multiple?: boolean;
}) {
  const t = useT();
  return (
    <label className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-md border border-rule-strong bg-sheet px-3 py-2 text-sm font-medium text-ink transition hover:border-ink-3 focus-within:ring-2 focus-within:ring-margin-soft">
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        onChange={(e) => {
          const list = e.target.files ? Array.from(e.target.files) : [];
          e.target.value = "";
          if (list.length === 0) return;
          onFiles?.(list);
          onFile?.(list[0]);
        }}
      />
      {label ?? t({ en: "Open file", bn: "ফাইল খুলুন" })}
    </label>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: ReactNode;
  hint?: string;
}) {
  const id = useId();
  return (
    <div className="flex items-start gap-2.5">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 size-4 shrink-0 accent-margin"
      />
      <label htmlFor={id} className="text-sm text-ink-2">
        {label}
        {hint && <span className="block text-xs text-ink-3">{hint}</span>}
      </label>
    </div>
  );
}

/**
 * A text area that also accepts an uploaded or dropped file. Large files are
 * read with File.text(); the file name is reported back so tools can name outputs.
 */
export function TextInput({
  value,
  onChange,
  accept,
  placeholder,
  label,
  onFileName,
  rows,
  className = "",
  spellCheck = false,
}: {
  value: string;
  onChange: (text: string) => void;
  accept?: string;
  placeholder?: string;
  label: string;
  onFileName?: (name: string | null) => void;
  rows?: number;
  className?: string;
  spellCheck?: boolean;
}) {
  const t = useT();
  const [over, setOver] = useState(false);
  const [readError, setReadError] = useState<string | null>(null);
  const id = useId();

  const load = useCallback(
    async (file: File) => {
      setReadError(null);
      try {
        const text = await file.text();
        onChange(text.replace(/^﻿/, ""));
        onFileName?.(file.name);
      } catch {
        setReadError(t({ en: `Couldn't read ${file.name} as text.`, bn: `${file.name} ফাইলটি লেখা হিসেবে পড়া গেল না।` }));
      }
    },
    [onChange, onFileName, t],
  );

  useHandoffFile((file) => void load(file));

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label htmlFor={id} className="text-sm font-medium text-ink-2">
          {label}
        </label>
        <div className="flex gap-2">
          {value && (
            <button
              type="button"
              onClick={() => {
                onChange("");
                onFileName?.(null);
              }}
              className="rounded-md px-2.5 py-1.5 text-sm text-ink-3 hover:bg-paper-2 hover:text-ink"
            >
              {t({ en: "Clear", bn: "মুছুন" })}
            </button>
          )}
          <OpenFileButton accept={accept} onFile={(f) => void load(f)} />
        </div>
      </div>
      <TextArea
        id={id}
        value={value}
        rows={rows}
        spellCheck={spellCheck}
        placeholder={placeholder}
        onChange={(e) => {
          onChange(e.target.value);
        }}
        onDragOver={(e) => {
          if (e.dataTransfer.types.includes("Files")) {
            e.preventDefault();
            setOver(true);
          }
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          const file = e.dataTransfer.files[0];
          if (file) {
            e.preventDefault();
            void load(file);
          }
          setOver(false);
        }}
        className={`${over ? "border-margin bg-margin-soft" : ""} ${className}`}
      />
      {readError && <p className="text-xs text-danger">{readError}</p>}
    </div>
  );
}

/** Big number tile for counters. */
export function StatTile({ label, value, sub }: { label: string; value: ReactNode; sub?: string }) {
  return (
    <div className="rounded-lg border border-rule bg-paper px-4 py-3">
      <p className="font-display text-3xl leading-tight text-ink tabular-nums">{value}</p>
      <p className="mt-0.5 text-xs font-medium tracking-wide text-ink-3 uppercase">{label}</p>
      {sub && <p className="mt-0.5 text-xs text-ink-3">{sub}</p>}
    </div>
  );
}

/** Read-only output with monospace text. */
export function OutputArea({ value, label, className = "" }: { value: string; label?: string; className?: string }) {
  return (
    <TextArea
      readOnly
      value={value}
      aria-label={label}
      spellCheck={false}
      className={`bg-paper-2/40 ${className}`}
    />
  );
}
