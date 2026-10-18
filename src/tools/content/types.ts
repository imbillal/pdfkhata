import type { Bi } from "@/i18n/locale";

/** Search-facing copy for one tool page. Rendered as static HTML below the tool. */
export interface ToolContent {
  /** <title> text without the brand suffix; ≤ 60 chars, leads with the main search phrase. */
  metaTitle: Bi;
  /** Meta description; 140–160 chars, says what it does + free + private/no upload. */
  metaDescription: Bi;
  /** 2–3 sentence intro paragraph shown under the tool. */
  intro: Bi;
  /** 3–4 imperative steps for the "How to …" section (also used for HowTo JSON-LD). */
  steps: Bi[];
  /** 3 real questions people search for, with direct answers (also FAQPage JSON-LD). */
  faqs: { q: Bi; a: Bi }[];
}
