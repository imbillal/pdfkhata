// Pure helpers for the data/text tools. No React, no DOM-only APIs beyond
// crypto/TextEncoder, so they can be checked with plain Node.

import type { Bi } from "@/i18n/locale";

/** An error whose message comes in both languages. */
export class BiError extends Error {
  constructor(public bi: Bi) {
    super(bi.en);
  }
}

/* ---------- Case conversion ---------- */

export type CaseId =
  | "upper"
  | "lower"
  | "title"
  | "sentence"
  | "camel"
  | "pascal"
  | "snake"
  | "kebab"
  | "constant"
  | "alternate"
  | "inverse";

const MINOR_WORDS = new Set([
  "a", "an", "and", "as", "at", "but", "by", "for", "in", "nor", "of", "on", "or", "per", "so", "the", "to", "up", "via", "vs", "yet",
]);

/** Split one line into identifier-ish words: separators, camelCase humps, letter/digit runs. */
export function splitWords(line: string): string[] {
  return line
    .replace(/(\p{Ll}|\p{N})(\p{Lu})/gu, "$1 $2")
    .replace(/(\p{Lu}+)(\p{Lu}\p{Ll})/gu, "$1 $2")
    .split(/[^\p{L}\p{M}\p{N}]+/u)
    .filter(Boolean);
}

function capitalize(word: string): string {
  const [first = "", ...rest] = Array.from(word);
  return first.toUpperCase() + rest.join("").toLowerCase();
}

function titleCase(text: string, smart: boolean): string {
  // Words are runs of non-space; keep the original spacing.
  const tokens = text.split(/(\s+)/);
  const wordIdx = tokens.map((t, i) => (t && !/^\s+$/.test(t) ? i : -1)).filter((i) => i >= 0);
  const first = wordIdx[0];
  const last = wordIdx[wordIdx.length - 1];
  return tokens
    .map((t, i) => {
      if (!t || /^\s+$/.test(t)) return t;
      const lower = t.toLowerCase();
      const bare = lower.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
      if (smart && i !== first && i !== last && MINOR_WORDS.has(bare)) return lower;
      // Capitalise the first letter even when the token starts with punctuation, e.g. "(hello" → "(Hello".
      // Hyphenated parts each get a capital: "well-known" → "Well-Known".
      return lower.replace(/(^|[-/])([^\p{L}\p{N}]*)(\p{L})/gu, (_m, sep: string, pre: string, ch: string) => sep + pre + ch.toUpperCase());
    })
    .join("");
}

function sentenceCase(text: string): string {
  let out = "";
  let capNext = true;
  for (const ch of text.toLowerCase()) {
    if (capNext && /\p{L}/u.test(ch)) {
      out += ch.toUpperCase();
      capNext = false;
    } else {
      out += ch;
    }
    if (/[.!?।\n]/.test(ch)) capNext = true;
  }
  // Standalone "i" is always capital in English.
  return out.replace(/(^|[^\p{L}\p{N}'])i(?=$|[^\p{L}\p{N}])/gu, "$1I").replace(/\bi'(m|ll|ve|d)\b/g, "I'$1");
}

function perLine(text: string, fn: (words: string[]) => string): string {
  return text
    .split("\n")
    .map((line) => fn(splitWords(line)))
    .join("\n");
}

export function convertCase(text: string, id: CaseId, opts: { smartTitle?: boolean } = {}): string {
  switch (id) {
    case "upper":
      return text.toUpperCase();
    case "lower":
      return text.toLowerCase();
    case "title":
      return titleCase(text, opts.smartTitle ?? true);
    case "sentence":
      return sentenceCase(text);
    case "camel":
      return perLine(text, (w) => w.map((x, i) => (i === 0 ? x.toLowerCase() : capitalize(x))).join(""));
    case "pascal":
      return perLine(text, (w) => w.map(capitalize).join(""));
    case "snake":
      return perLine(text, (w) => w.map((x) => x.toLowerCase()).join("_"));
    case "kebab":
      return perLine(text, (w) => w.map((x) => x.toLowerCase()).join("-"));
    case "constant":
      return perLine(text, (w) => w.map((x) => x.toUpperCase()).join("_"));
    case "alternate": {
      let upper = false;
      let out = "";
      for (const ch of text) {
        if (ch.toLowerCase() !== ch.toUpperCase()) {
          out += upper ? ch.toUpperCase() : ch.toLowerCase();
          upper = !upper;
        } else {
          out += ch;
        }
      }
      return out;
    }
    case "inverse": {
      let out = "";
      for (const ch of text) {
        const u = ch.toUpperCase();
        out += ch === u ? ch.toLowerCase() : u;
      }
      return out;
    }
  }
}

/* ---------- JSON ---------- */

export interface JsonErrorInfo {
  offset: number;
  line: number;
  column: number;
  message: Bi;
}

export function lineColumn(text: string, offset: number): { line: number; column: number } {
  let line = 1;
  let lastBreak = -1;
  for (let i = 0; i < offset && i < text.length; i++) {
    if (text.charCodeAt(i) === 10) {
      line++;
      lastBreak = i;
    }
  }
  return { line, column: offset - lastBreak };
}

/**
 * Strict JSON scanner that reports where the first error is. JSON.parse error
 * messages differ per browser (and Safari gives no position), so we find it ourselves.
 * Returns null when the text is valid JSON. Also reports numbers that lose precision.
 */
export function scanJson(text: string): { error: JsonErrorInfo | null; unsafeNumbers: number } {
  let i = 0;
  let unsafeNumbers = 0;
  const n = text.length;

  class Fail extends Error {
    constructor(
      public bi: Bi,
      public at: number,
    ) {
      super(bi.en);
    }
  }
  const fail = (msg: Bi, at = i): never => {
    throw new Fail(msg, at);
  };
  const describe = (at: number): Bi => (at >= n ? { en: "end of input", bn: "লেখার শেষ" } : { en: `“${text[at]}”`, bn: `“${text[at]}”` });
  const unexpected = (at: number, after = false): Bi => {
    const d = describe(at);
    return after
      ? { en: `Unexpected ${d.en} after the end of the JSON value`, bn: `JSON শেষ হওয়ার পরে অপ্রত্যাশিত ${d.bn}` }
      : { en: `Unexpected ${d.en}`, bn: `অপ্রত্যাশিত ${d.bn}` };
  };

  const ws = () => {
    while (i < n) {
      const c = text.charCodeAt(i);
      if (c === 32 || c === 9 || c === 10 || c === 13) i++;
      else break;
    }
  };

  const string = () => {
    i++; // opening quote
    while (i < n) {
      const c = text.charCodeAt(i);
      if (c === 34) {
        i++;
        return;
      }
      if (c === 92) {
        const e = text[i + 1];
        if (e === undefined) fail({ en: "Unterminated string", bn: "স্ট্রিং শেষ হয়নি" }, i);
        if ('"\\/bfnrt'.includes(e)) {
          i += 2;
        } else if (e === "u") {
          if (!/^[0-9a-fA-F]{4}$/.test(text.slice(i + 2, i + 6))) fail({ en: "Invalid \\u escape (needs 4 hex digits)", bn: "ভুল \\u এস্কেপ (৪টি হেক্স অঙ্ক লাগবে)" }, i);
          i += 6;
        } else {
          fail({ en: `Invalid escape “\\${e}”`, bn: `ভুল এস্কেপ “\\${e}”` }, i);
        }
        continue;
      }
      if (c < 0x20) fail(
        c === 10
          ? { en: "Line break inside a string (use \\n)", bn: "স্ট্রিংয়ের ভেতরে লাইন ব্রেক আছে (\\n ব্যবহার করুন)" }
          : { en: "Control character inside a string", bn: "স্ট্রিংয়ের ভেতরে কন্ট্রোল ক্যারেক্টার আছে" },
        i,
      );
      i++;
    }
    fail({ en: "Unterminated string (missing closing quote)", bn: "স্ট্রিং শেষ হয়নি (শেষের উদ্ধৃতিচিহ্ন নেই)" }, n);
  };

  const number = () => {
    const m = /^-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/.exec(text.slice(i, i + 400));
    if (!m || m[0] === "-" || m[0] === "") fail({ en: `Invalid number starting at ${describe(i).en}`, bn: `${describe(i).bn} থেকে শুরু হওয়া সংখ্যাটি ভুল` });
    const lit = m![0];
    // Leading zeros like 007 match "0" then hit "0" — flag that clearly.
    if (/^-?0\d/.test(text.slice(i, i + lit.length + 1))) fail({ en: "Numbers can't have leading zeros", bn: "সংখ্যার শুরুতে শূন্য থাকতে পারে না" }, i);
    if (!m![2] && !m![3]) {
      const digits = m![1];
      if (digits.length > 15 && !Number.isSafeInteger(Number(lit))) unsafeNumbers++;
    }
    i += lit.length;
  };

  const literal = (word: string) => {
    if (text.startsWith(word, i)) i += word.length;
    else fail(unexpected(i));
  };

  const value = (depth: number): void => {
    if (depth > 5000) fail({ en: "Nesting is too deep", bn: "নেস্টিং খুব গভীর" });
    ws();
    const c = text[i];
    if (c === "{") {
      i++;
      ws();
      if (text[i] === "}") {
        i++;
        return;
      }
      for (;;) {
        ws();
        if (text[i] !== '"') fail(
            text[i] === "}"
              ? { en: "Trailing comma before “}”", bn: "“}”-এর আগে বাড়তি কমা" }
              : { en: `Expected a property name in double quotes, found ${describe(i).en}`, bn: `ডাবল কোটে প্রপার্টির নাম দরকার, পাওয়া গেছে ${describe(i).bn}` },
          );
        string();
        ws();
        if (text[i] !== ":") fail({ en: `Expected “:” after property name, found ${describe(i).en}`, bn: `প্রপার্টির নামের পরে “:” দরকার, পাওয়া গেছে ${describe(i).bn}` });
        i++;
        value(depth + 1);
        ws();
        if (text[i] === ",") {
          i++;
          continue;
        }
        if (text[i] === "}") {
          i++;
          return;
        }
        fail({ en: `Expected “,” or “}”, found ${describe(i).en}`, bn: `“,” বা “}” দরকার, পাওয়া গেছে ${describe(i).bn}` });
      }
    }
    if (c === "[") {
      i++;
      ws();
      if (text[i] === "]") {
        i++;
        return;
      }
      for (;;) {
        ws();
        if (text[i] === "]") fail({ en: "Trailing comma before “]”", bn: "“]”-এর আগে বাড়তি কমা" });
        value(depth + 1);
        ws();
        if (text[i] === ",") {
          i++;
          continue;
        }
        if (text[i] === "]") {
          i++;
          return;
        }
        fail({ en: `Expected “,” or “]”, found ${describe(i).en}`, bn: `“,” বা “]” দরকার, পাওয়া গেছে ${describe(i).bn}` });
      }
    }
    if (c === '"') return string();
    if (c === "-" || (c !== undefined && c >= "0" && c <= "9")) return number();
    if (c === "t") return literal("true");
    if (c === "f") return literal("false");
    if (c === "n") return literal("null");
    if (c === "'") fail({ en: "Strings must use double quotes, not single quotes", bn: "স্ট্রিংয়ে সিঙ্গেল কোট নয়, ডাবল কোট লাগবে" });
    if (c === undefined) fail(depth === 0 ? { en: "Input is empty", bn: "ইনপুট খালি" } : { en: "Unexpected end of input", bn: "লেখা হঠাৎ শেষ হয়ে গেছে" });
    fail(unexpected(i));
  };

  try {
    // A leading BOM is tolerated by most tools; skip it.
    if (text.charCodeAt(0) === 0xfeff) i = 1;
    value(0);
    ws();
    if (i < n) fail(unexpected(i, true));
    return { error: null, unsafeNumbers };
  } catch (err) {
    if (err instanceof Fail) {
      const at = Math.min(err.at, n);
      return { error: { offset: at, ...lineColumn(text, at), message: err.bi }, unsafeNumbers };
    }
    throw err;
  }
}

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

export function sortKeysDeep(value: Json): Json {
  if (Array.isArray(value)) return value.map(sortKeysDeep);
  if (value && typeof value === "object") {
    // fromEntries defines own properties, so a "__proto__" key stays a plain key.
    return Object.fromEntries(
      Object.keys(value)
        .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
        .map((k) => [k, sortKeysDeep(value[k])]),
    );
  }
  return value;
}

/** Flatten nested objects into dot keys. Arrays are expanded (a.0) or kept as JSON text. */
export function flattenRecord(value: unknown, expandArrays: boolean): Map<string, unknown> {
  const out = new Map<string, unknown>();
  const walk = (v: unknown, prefix: string) => {
    if (v !== null && typeof v === "object" && !(Array.isArray(v) && !expandArrays)) {
      const entries = Array.isArray(v) ? v.map((x, i) => [String(i), x] as const) : Object.entries(v);
      if (entries.length === 0) {
        if (prefix) out.set(prefix, Array.isArray(v) ? "[]" : "{}");
        return;
      }
      for (const [k, child] of entries) walk(child, prefix ? `${prefix}.${k}` : k);
      return;
    }
    out.set(prefix || "value", v);
  };
  walk(value, "");
  return out;
}

export function cellText(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

/** Turn rows (any JSON values) into a header + string matrix. Column order = first seen. */
export function rowsToTable(rows: unknown[], expandArrays: boolean): { fields: string[]; data: string[][] } {
  const flat = rows.map((r) => flattenRecord(r, expandArrays));
  const fields: string[] = [];
  const seen = new Set<string>();
  for (const m of flat)
    for (const k of m.keys())
      if (!seen.has(k)) {
        seen.add(k);
        fields.push(k);
      }
  const data = flat.map((m) => fields.map((f) => cellText(m.get(f))));
  return { fields, data };
}

/** Conservative CSV value typing: keeps "007" and huge IDs as strings. */
export function typeCell(v: string): string | number | boolean {
  const t = v.trim();
  if (/^(true|false)$/i.test(t)) return t.toLowerCase() === "true";
  if (/^-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?$/.test(t)) {
    const num = Number(t);
    if (!Number.isFinite(num)) return v;
    if (/^-?\d+$/.test(t) && !Number.isSafeInteger(num)) return v;
    return num;
  }
  return v;
}

/* ---------- Random / passwords ---------- */

/** Uniform integer in [0, max) via rejection sampling — no modulo bias. */
export function randomInt(max: number): number {
  if (!Number.isInteger(max) || max <= 0 || max > 2 ** 32) throw new RangeError("randomInt: bad range");
  const limit = Math.floor(2 ** 32 / max) * max;
  const buf = new Uint32Array(1);
  for (;;) {
    crypto.getRandomValues(buf);
    if (buf[0] < limit) return buf[0] % max;
  }
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const CHARSETS = {
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lower: "abcdefghijklmnopqrstuvwxyz",
  digits: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.<>/?~",
} as const;

export type CharsetId = keyof typeof CHARSETS;
const LOOK_ALIKES = new Set(["I", "l", "1", "O", "0", "|"]);

export function buildSets(chosen: CharsetId[], excludeLookAlikes: boolean): string[][] {
  return chosen.map((id) => Array.from(CHARSETS[id]).filter((c) => !excludeLookAlikes || !LOOK_ALIKES.has(c)));
}

/** Password with at least one character from every chosen set, positions shuffled. */
export function generatePassword(length: number, sets: string[][]): string {
  const usable = sets.filter((s) => s.length > 0);
  if (usable.length === 0) throw new BiError({ en: "Pick at least one character type.", bn: "অন্তত এক ধরনের অক্ষর বেছে নিন।" });
  if (length < usable.length) throw new BiError({ en: `Length must be at least ${usable.length}.`, bn: `দৈর্ঘ্য কমপক্ষে ${usable.length} হতে হবে।` });
  const pool = usable.flat();
  const chars = usable.map((s) => s[randomInt(s.length)]);
  while (chars.length < length) chars.push(pool[randomInt(pool.length)]);
  return shuffle(chars).join("");
}

/** Approximate entropy in bits for a random password of `length` from `poolSize` symbols. */
export function passwordEntropy(length: number, poolSize: number): number {
  return poolSize > 1 ? length * Math.log2(poolSize) : 0;
}

export function strengthLabel(bits: number): { label: string; level: 0 | 1 | 2 | 3 } {
  if (bits < 40) return { label: "Weak", level: 0 };
  if (bits < 60) return { label: "Fair", level: 1 };
  if (bits < 80) return { label: "Strong", level: 2 };
  return { label: "Very strong", level: 3 };
}

/* ---------- Base64 ---------- */

export function bytesToBase64(bytes: Uint8Array, urlSafe = false): string {
  let bin = "";
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    bin += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  const b64 = btoa(bin);
  return urlSafe ? b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "") : b64;
}

/** Accepts standard or URL-safe alphabet, whitespace, missing padding, and data: URIs. */
export function base64ToBytes(input: string): { bytes: Uint8Array; mime: string | null } {
  let s = input.trim();
  let mime: string | null = null;
  const dataUri = /^data:([^;,]*)(;[^,]*)?,/i.exec(s);
  if (dataUri) {
    if (!/;base64/i.test(dataUri[2] ?? "")) throw new BiError({ en: "This data URI isn't Base64-encoded.", bn: "এই data URI-টি Base64 এনকোড করা নয়।" });
    mime = dataUri[1] || null;
    s = s.slice(dataUri[0].length);
  }
  s = s.replace(/\s+/g, "").replace(/-/g, "+").replace(/_/g, "/");
  const bad = /[^A-Za-z0-9+/=]/.exec(s);
  if (bad) throw new BiError({
      en: `Invalid character “${bad[0]}” at position ${bad.index + 1}. Base64 uses only A–Z, a–z, 0–9, + / (or - _) and = padding.`,
      bn: `${bad.index + 1} নম্বর অবস্থানে অবৈধ অক্ষর “${bad[0]}”। Base64-এ শুধু A–Z, a–z, 0–9, + / (বা - _) আর শেষে = থাকে।`,
    });
  const firstPad = s.indexOf("=");
  if (firstPad !== -1 && !/^=+$/.test(s.slice(firstPad))) throw new BiError({ en: "Padding “=” can only appear at the end.", bn: "প্যাডিং “=” শুধু শেষে থাকতে পারে।" });
  const body = s.replace(/=+$/, "");
  if (body.length % 4 === 1) throw new BiError({
      en: "The input length is wrong for Base64 — it looks truncated or has an extra character.",
      bn: "Base64-এর দৈর্ঘ্য মিলছে না — লেখাটি কাটা পড়েছে বা একটি বাড়তি অক্ষর আছে।",
    });
  const padded = body + "=".repeat((4 - (body.length % 4)) % 4);
  const bin = atob(padded);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return { bytes, mime };
}

/** Guess a file type from magic bytes. */
export function sniffFileType(bytes: Uint8Array): { ext: string; mime: string } | null {
  const starts = (sig: number[], at = 0) => sig.every((b, i) => bytes[at + i] === b);
  if (starts([0x89, 0x50, 0x4e, 0x47])) return { ext: "png", mime: "image/png" };
  if (starts([0xff, 0xd8, 0xff])) return { ext: "jpg", mime: "image/jpeg" };
  if (starts([0x47, 0x49, 0x46, 0x38])) return { ext: "gif", mime: "image/gif" };
  if (starts([0x52, 0x49, 0x46, 0x46]) && starts([0x57, 0x45, 0x42, 0x50], 8)) return { ext: "webp", mime: "image/webp" };
  if (starts([0x25, 0x50, 0x44, 0x46])) return { ext: "pdf", mime: "application/pdf" };
  if (starts([0x50, 0x4b, 0x03, 0x04])) return { ext: "zip", mime: "application/zip" };
  if (starts([0x1f, 0x8b])) return { ext: "gz", mime: "application/gzip" };
  if (starts([0x49, 0x44, 0x33]) || starts([0xff, 0xfb])) return { ext: "mp3", mime: "audio/mpeg" };
  if (starts([0x66, 0x74, 0x79, 0x70], 4)) return { ext: "mp4", mime: "video/mp4" };
  if (starts([0x3c, 0x73, 0x76, 0x67]) || starts([0x3c, 0x3f, 0x78, 0x6d, 0x6c])) return { ext: "svg", mime: "image/svg+xml" };
  return null;
}

export const MIME_EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/svg+xml": "svg",
  "application/pdf": "pdf",
  "application/zip": "zip",
  "application/json": "json",
  "text/plain": "txt",
  "text/html": "html",
  "text/csv": "csv",
};

/* ---------- Epoch ---------- */

export type EpochUnit = "s" | "ms" | "us" | "ns";

/** Pick the unit by magnitude: seconds up to year ~5138, then ms, μs, ns. */
export function detectEpochUnit(value: number): EpochUnit {
  const a = Math.abs(value);
  if (a < 1e11) return "s";
  if (a < 1e14) return "ms";
  if (a < 1e17) return "us";
  return "ns";
}

export function epochToMs(value: number, unit: EpochUnit): number {
  switch (unit) {
    case "s":
      return value * 1000;
    case "ms":
      return value;
    case "us":
      return value / 1000;
    case "ns":
      return value / 1e6;
  }
}

/** Parse "YYYY-MM-DDTHH:mm[:ss[.sss]]" as local or UTC wall time. Returns ms or null. */
export function parseDateTimeLocal(value: string, utc: boolean): number | null {
  const m = /^(\d{4,6})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/.exec(value);
  if (!m) return null;
  const [y, mo, d, h, mi, s = 0, msRaw] = [Number(m[1]), Number(m[2]), Number(m[3]), Number(m[4]), Number(m[5]), Number(m[6] ?? 0), m[7]];
  const ms = msRaw ? Number(msRaw.padEnd(3, "0")) : 0;
  if (mo < 1 || mo > 12 || d < 1 || d > 31 || h > 23 || mi > 59 || s > 59) return null;
  let t: number;
  if (utc) {
    const date = new Date(Date.UTC(2000, mo - 1, d, h, mi, s, ms));
    date.setUTCFullYear(y, mo - 1, d); // avoid the 0–99 → 1900s quirk
    t = date.getTime();
  } else {
    const date = new Date(2000, mo - 1, d, h, mi, s, ms);
    date.setFullYear(y, mo - 1, d);
    t = date.getTime();
  }
  return Number.isNaN(t) ? null : t;
}

export function relativeTime(targetMs: number, nowMs: number, locale?: string): string {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const diff = (targetMs - nowMs) / 1000;
  const a = Math.abs(diff);
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31_557_600],
    ["month", 2_629_800],
    ["week", 604_800],
    ["day", 86_400],
    ["hour", 3_600],
    ["minute", 60],
    ["second", 1],
  ];
  for (const [unit, secs] of units) {
    if (a >= secs || unit === "second") return rtf.format(Math.round(diff / secs), unit);
  }
  return "";
}

/* ---------- QR payloads ---------- */

/** Escape \ ; , : " for the WIFI: QR format. */
export function escapeWifi(s: string): string {
  return s.replace(/([\\;,:"])/g, "\\$1");
}

export function wifiPayload(ssid: string, password: string, auth: "WPA" | "WEP" | "nopass", hidden: boolean): string {
  const parts = [`T:${auth}`, `S:${escapeWifi(ssid)}`];
  if (auth !== "nopass") parts.push(`P:${escapeWifi(password)}`);
  if (hidden) parts.push("H:true");
  return `WIFI:${parts.join(";")};;`;
}
