"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/i18n/LocaleProvider";
import { LOCALES, type Locale } from "@/i18n/locale";

const LABEL: Record<Locale, string> = { en: "EN", bn: "বাং" };

/** EN | বাং toggle that keeps you on the same page. */
export function LanguageSwitch() {
  const pathname = usePathname();
  const locale = useLocale();
  const rest = pathname.replace(/^\/(en|bn)(?=\/|$)/, "") || "/";

  return (
    <div className="flex rounded-md border border-rule-strong bg-sheet p-0.5 text-xs" role="group" aria-label="Language / ভাষা">
      {LOCALES.map((l) => (
        <Link
          key={l}
          href={`/${l}${rest}`}
          hrefLang={l}
          aria-current={l === locale ? "true" : undefined}
          className={`rounded px-2 py-1 ${l === "bn" ? "font-bangla" : ""} ${
            l === locale ? "bg-ink text-paper" : "text-ink-2 hover:text-ink"
          }`}
        >
          {LABEL[l]}
        </Link>
      ))}
    </div>
  );
}
