"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { formatNumber, localePath, type Bi, type Locale } from "@/i18n/locale";

const LocaleContext = createContext<Locale>("en");

export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useLocale(): Locale {
  return useContext(LocaleContext);
}

export interface Translator {
  /** Pick the current language: t({ en: "Merge", bn: "একত্র করুন" }). */
  (text: Bi): string;
  locale: Locale;
  /** Number with Bangla digits in the Bangla UI. */
  n: (value: number, options?: Intl.NumberFormatOptions) => string;
  /** Locale-prefixed app path for links and router.push. */
  href: (path: string) => string;
}

export function useT(): Translator {
  const locale = useLocale();
  const pickText = useCallback((text: Bi) => text[locale], [locale]);
  return useMemo(
    () =>
      Object.assign(pickText, {
        locale,
        n: (value: number, options?: Intl.NumberFormatOptions) => formatNumber(locale, value, options),
        href: (path: string) => localePath(locale, path),
      }),
    [pickText, locale],
  );
}
