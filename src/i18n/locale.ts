// Locale primitives. Safe for server and client.

export const LOCALES = ["en", "bn"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

/** A string in both languages. Every user-visible string in the app is one of these. */
export interface Bi {
  en: string;
  bn: string;
}

export function hasLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

export function pick(locale: Locale, text: Bi): string {
  return text[locale];
}

const BN_DIGITS = "০১২৩৪৫৬৭৮৯";

/** Format a number for display; Bangla UI uses Bangla digits. */
export function formatNumber(locale: Locale, value: number, options?: Intl.NumberFormatOptions): string {
  const formatted = new Intl.NumberFormat("en-US", options).format(value);
  return locale === "bn" ? formatted.replace(/\d/g, (d) => BN_DIGITS[Number(d)]) : formatted;
}

/** Prefix an app path with the locale: ("bn", "/tools/merge-pdf/") → "/bn/tools/merge-pdf/". */
export function localePath(locale: Locale, path: string): string {
  return `/${locale}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Server-side equivalent of useT(): t({en, bn}), t.n(), t.href(). */
export function translator(locale: Locale) {
  return Object.assign((text: Bi) => text[locale], {
    locale,
    n: (value: number, options?: Intl.NumberFormatOptions) => formatNumber(locale, value, options),
    href: (path: string) => localePath(locale, path),
  });
}
