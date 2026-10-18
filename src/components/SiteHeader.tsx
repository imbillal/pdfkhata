import Link from "next/link";
import { ToolSearch } from "@/components/ToolSearch";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-rule bg-paper/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        <Link href="/" className="flex items-baseline gap-2 font-display text-xl font-semibold tracking-tight">
          <span>
            PDF<span className="text-margin">Khata</span>
          </span>
          <span className="hidden font-bangla text-sm font-normal text-ink-3 sm:inline">খাতা</span>
        </Link>
        <nav className="ml-auto flex items-center gap-1 text-sm">
          <Link href="/tools/" className="hidden rounded-md px-3 py-1.5 text-ink-2 hover:bg-paper-2 hover:text-ink sm:block">
            All tools
          </Link>
          <ToolSearch />
        </nav>
      </div>
    </header>
  );
}
