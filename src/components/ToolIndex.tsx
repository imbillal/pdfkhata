import Link from "next/link";
import { CATEGORIES, toolsIn } from "@/tools/registry";

/** Table-of-contents style listing of every tool, grouped by chapter. */
export function ToolIndex() {
  return (
    <div className="flex flex-col gap-14">
      {CATEGORIES.map((c, i) => (
        <section key={c.id} id={c.id} className="scroll-mt-24 grid gap-6 md:grid-cols-[220px_minmax(0,1fr)]">
          <header>
            <p className="font-mono text-xs text-margin">Chapter {String(i + 1).padStart(2, "0")}</p>
            <h2 className="mt-1 font-display text-2xl font-semibold">{c.name}</h2>
            <p className="font-bangla text-ink-3">{c.nameBn}</p>
            <p className="mt-2 text-sm text-ink-2">{c.blurb}</p>
          </header>
          <ol className="grid gap-x-10 sm:grid-cols-2">
            {toolsIn(c.id).map((t) => (
              <li key={t.slug} className="border-b border-dotted border-rule-strong">
                <Link href={`/tools/${t.slug}/`} className="group flex items-baseline gap-3 py-3">
                  <span className="font-medium group-hover:text-margin">{t.name}</span>
                  <span className="hidden min-w-0 flex-1 truncate text-sm text-ink-3 lg:block">{t.blurb}</span>
                  <span className="ml-auto text-ink-3 group-hover:text-margin">→</span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
