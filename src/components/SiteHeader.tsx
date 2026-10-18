import Link from "next/link";
import { ToolSearch } from "@/components/ToolSearch";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { translator, type Locale } from "@/i18n/locale";

export function SiteHeader({ locale }: { locale: Locale }) {
  const t = translator(locale);
  return (
    <header className="sticky top-0 z-30 border-b border-rule bg-paper/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
        <Link href={t.href("/")} className="flex items-baseline gap-2 font-display text-xl font-semibold tracking-tight">
          <span>
            PDF<span className="text-margin">Khata</span>
          </span>
          {locale === "bn" && <span className="hidden font-bangla text-sm font-normal text-ink-3 sm:inline">খাতা</span>}
        </Link>
        <nav className="ml-auto flex items-center gap-1 text-sm">
          <Link href={t.href("/tools/")} className="hidden rounded-md px-3 py-1.5 text-ink-2 hover:bg-paper-2 hover:text-ink md:block">
            {t({ en: "All tools", bn: "সব টুল" })}
          </Link>
          <ToolSearch />
          <LanguageSwitch />
        </nav>
      </div>
    </header>
  );
}
