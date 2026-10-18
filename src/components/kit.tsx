"use client";

// Shared building blocks for tool UIs. Every tool should compose these so the
// whole site feels like one notebook.

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { formatBytes } from "@/lib/files";
import { takeHandoff } from "@/lib/handoff";

/* ---------- Layout ---------- */

/** Two-column workspace: the "sheet" on the left, the options rail on the right. */
export function Workspace({ main, side }: { main: ReactNode; side?: ReactNode }) {
  return (
    <div className={`grid gap-6 ${side ? "lg:grid-cols-[minmax(0,1fr)_300px]" : ""}`}>
      <div className="min-w-0">{main}</div>
      {side && <aside className="flex flex-col gap-5 lg:sticky lg:top-20 lg:self-start">{side}</aside>}
    </div>
  );
}

/** A paper card with the red margin line. */
export function Sheet({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`margin-line rounded-lg border border-rule bg-sheet py-5 pr-5 pl-7 shadow-[0_1px_0_var(--rule)] ${className}`}>
      {children}
    </div>
  );
}

export function SideSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-rule bg-sheet p-4">
      <h3 className="mb-3 text-xs font-semibold tracking-[0.12em] text-ink-3 uppercase">{title}</h3>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}

/* ---------- Inputs ---------- */

export function FileDrop({
  accept,
  multiple = false,
  onFiles,
  title,
  hint,
}: {
  accept?: string;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  title?: string;
  hint?: string;
}) {
  const [over, setOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const take = useCallback(
    (list: FileList | null) => {
      if (!list || list.length === 0) return;
      const files = Array.from(list);
      onFiles(multiple ? files : files.slice(0, 1));
    },
    [onFiles, multiple],
  );

  // Pick up files the user already dropped on the home page.
  useEffect(() => {
    const handed = takeHandoff();
    if (handed?.length) onFiles(multiple ? handed : handed.slice(0, 1));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- consume the handoff once, on mount
  }, []);

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
      className={`ruled flex min-h-56 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors ${
        over ? "border-margin bg-margin-soft" : "border-rule-strong bg-sheet hover:border-ink-3"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        onChange={(e) => {
          take(e.target.files);
          e.target.value = "";
        }}
      />
      <span className="rounded-full bg-ink px-5 py-2 text-sm font-medium text-paper">
        {title ?? (multiple ? "Choose files" : "Choose a file")}
      </span>
      <span className="text-sm text-ink-2">or drop {multiple ? "them" : "it"} here</span>
      {hint && <span className="mt-1 text-xs text-ink-3">{hint}</span>}
    </label>
  );
}

export function Field({ label, children, hint }: { label: string; children: (id: string) => ReactNode; hint?: string }) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-ink-2">
        {label}
      </label>
      {children(id)}
      {hint && <p className="text-xs text-ink-3">{hint}</p>}
    </div>
  );
}

export const inputClass =
  "w-full rounded-md border border-rule-strong bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ink-2 focus:ring-2 focus:ring-margin-soft";

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputClass} min-h-48 font-mono leading-relaxed ${props.className ?? ""}`} />;
}

/** Segmented choice, used instead of selects for short option lists. */
export function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1 rounded-md border border-rule-strong bg-paper p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={`flex-1 rounded px-2.5 py-1.5 text-sm whitespace-nowrap ${
            value === o.value ? "bg-ink text-paper" : "text-ink-2 hover:bg-paper-2"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ---------- Actions ---------- */

export function Button({
  variant = "primary",
  busy = false,
  className = "",
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost"; busy?: boolean }) {
  const styles = {
    primary: "bg-margin text-white hover:brightness-110 disabled:opacity-50",
    secondary: "border border-rule-strong bg-sheet text-ink hover:border-ink-3 disabled:opacity-50",
    ghost: "text-ink-2 hover:bg-paper-2 hover:text-ink disabled:opacity-50",
  }[variant];
  return (
    <button
      type="button"
      {...rest}
      disabled={rest.disabled || busy}
      className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition ${styles} ${className}`}
    >
      {busy && <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />}
      {children}
    </button>
  );
}

/* ---------- Feedback ---------- */

export function ErrorNote({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-md border border-margin/40 bg-margin-soft px-3 py-2 text-sm text-ink">
      {message}
    </p>
  );
}

export function Progress({ value, label }: { value: number; label?: string }) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between text-xs text-ink-3">
        <span>{label ?? "Working…"}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-paper-2">
        <div className="h-full bg-margin transition-[width]" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/** A row showing one input file, with an optional remove button and extra controls. */
export function FileRow({
  file,
  onRemove,
  children,
}: {
  file: File;
  onRemove?: () => void;
  children?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-rule py-2.5 last:border-b-0">
      <span className="grid size-9 shrink-0 place-items-center rounded bg-paper-2 font-mono text-[10px] text-ink-2 uppercase">
        {file.name.split(".").pop()?.slice(0, 4)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{file.name}</p>
        <p className="text-xs text-ink-3">{formatBytes(file.size)}</p>
      </div>
      {children}
      {onRemove && (
        <button type="button" onClick={onRemove} aria-label={`Remove ${file.name}`} className="rounded p-1.5 text-ink-3 hover:bg-paper-2 hover:text-margin">
          <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
            <path d="m5 5 10 10M15 5 5 15" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  );
}

/** Result panel: what was produced and a download button. */
export function ResultBox({ title, detail, children }: { title: string; detail?: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-ok/40 bg-sheet p-4">
      <p className="flex items-center gap-2 text-sm font-semibold text-ok">
        <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="m4 10 4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {title}
      </p>
      {detail && <p className="mt-1 text-sm text-ink-2">{detail}</p>}
      <div className="mt-3 flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
