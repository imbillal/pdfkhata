import Link from "next/link";
import { ToolSearch } from "@/components/ToolSearch";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { NavMenu } from "@/components/NavMenu";
import { Logo } from "@/components/Logo";
import { translator, type Locale } from "@/i18n/locale";

export function SiteHeader({ locale }: { locale: Locale }) {
  const t = translator(locale);
  return (
    <header className="sticky top-0 z-30 border-b border-rule bg-sheet/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4 sm:gap-4 sm:px-6">
        <Link href={t.href("/")} className="mr-2 shrink-0" aria-label="PDFKhata">
          <Logo />
        </Link>
        <NavMenu />
        <div className="ml-auto flex items-center gap-2">
          <ToolSearch />
          <LanguageSwitch />
        </div>
      </div>
    </header>
  );
}
