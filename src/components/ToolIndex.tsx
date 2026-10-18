import { CATEGORIES, toolsIn } from "@/tools/registry";
import { CATEGORY_COLOR } from "@/tools/icons";
import { ToolCard } from "@/components/ToolCard";
import { translator, type Locale } from "@/i18n/locale";

/** Every tool, grouped by category, with anchors the menus link to. */
export function ToolIndex({ locale }: { locale: Locale }) {
  const t = translator(locale);
  return (
    <div className="flex flex-col gap-16">
      {CATEGORIES.map((c) => (
        <section key={c.id} id={c.id} className="scroll-mt-24">
          <header className="mb-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span aria-hidden className="size-3 self-center rounded-full" style={{ backgroundColor: CATEGORY_COLOR[c.id] }} />
            <h2 className="font-display text-2xl font-bold">{t(c.name)}</h2>
            <p className="text-ink-2">{t(c.blurb)}</p>
          </header>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {toolsIn(c.id).map((tool) => (
              <li key={tool.slug}>
                <ToolCard tool={tool} href={t.href(`/tools/${tool.slug}/`)} pick={t} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
