import Link from "next/link";
import type { Tool } from "@/tools/registry";
import { ToolIcon } from "@/tools/icons";
import type { Bi } from "@/i18n/locale";

/** A tool as a clickable card: icon tile, name, one-line description. */
export function ToolCard({ tool, href, pick }: { tool: Tool; href: string; pick: (text: Bi) => string }) {
  return (
    <Link
      href={href}
      className="group flex h-full gap-4 rounded-2xl border border-rule bg-sheet p-5 transition-colors hover:border-margin/50 hover:bg-margin-soft/40"
    >
      <ToolIcon slug={tool.slug} category={tool.category} />
      <span className="min-w-0">
        <span className="block text-[1.05rem] leading-snug font-semibold text-ink group-hover:text-margin">{pick(tool.name)}</span>
        <span className="mt-1 block text-[0.93rem] leading-snug text-ink-2">{pick(tool.blurb)}</span>
      </span>
    </Link>
  );
}
