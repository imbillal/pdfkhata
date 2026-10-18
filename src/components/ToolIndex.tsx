import Link from "next/link";
import { CATEGORIES, toolsIn } from "@/tools/registry";
import { translator, type Locale } from "@/i18n/locale";

/** Table-of-contents style listing of every tool, grouped by chapter. */
export function ToolIndex({ locale }: { locale: Locale }) {
  const t = translator(locale);
  return (
    <div className="flex flex-col gap-14">
      {CATEGORIES.map((c, i) => (
        <section key={c.id} id={c.id} className="scroll-mt-24 grid gap-6 md:grid-cols-[220px_minmax(0,1fr)]">
          <header>
            <p className="font-mono text-xs text-margin">
              {t({ en: "Chapter", bn: "অধ্যায়" })} {t.n(i + 1, { minimumIntegerDigits: 2 })}
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold">{t(c.name)}</h2>
            <p className="mt-2 text-sm text-ink-2">{t(c.blurb)}</p>
          </header>
          <ol className="grid gap-x-10 sm:grid-cols-2">
            {toolsIn(c.id).map((tool) => (
              <li key={tool.slug} className="border-b border-dotted border-rule-strong">
                <Link href={t.href(`/tools/${tool.slug}/`)} className="group flex items-baseline gap-3 py-3">
                  <span className="font-medium group-hover:text-margin">{t(tool.name)}</span>
                  <span className="hidden min-w-0 flex-1 truncate text-sm text-ink-3 lg:block">{t(tool.blurb)}</span>
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
