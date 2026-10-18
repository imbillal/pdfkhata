import type { ToolContent } from "@/tools/content/types";
import type { Tool } from "@/tools/registry";
import { translator, type Locale } from "@/i18n/locale";

/** Static, crawlable guide under each tool: intro, how-to steps and FAQs. */
export function ToolGuide({ tool, content, locale }: { tool: Tool; content: ToolContent; locale: Locale }) {
  const t = translator(locale);
  const name = t(tool.name);
  return (
    <section className="mt-24 grid gap-12 lg:grid-cols-[1.1fr_1fr]">
      <div>
        <h2 className="font-display text-2xl font-bold sm:text-3xl">
          {t({ en: `How to use ${tool.name.en}`, bn: `${tool.name.bn}: কীভাবে ব্যবহার করবেন` })}
        </h2>
        <p className="mt-4 max-w-[68ch] text-lg leading-relaxed text-ink-2">{t(content.intro)}</p>
        <ol className="mt-8 space-y-5">
          {content.steps.map((step, i) => (
            <li key={step.en} className="flex gap-4">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-cover font-display text-sm font-bold text-white">{t.n(i + 1)}</span>
              <p className="pt-1 text-[1.05rem] leading-relaxed">{t(step)}</p>
            </li>
          ))}
        </ol>
      </div>
      <div>
        <h2 className="font-display text-2xl font-bold sm:text-3xl">
          {t({ en: `${name}: common questions`, bn: `${name}: সাধারণ প্রশ্ন` })}
        </h2>
        <div className="mt-6 divide-y divide-rule rounded-2xl border border-rule bg-sheet">
          {content.faqs.map((f) => (
            <details key={f.q.en} className="group px-5 py-4" open={false}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
                {t(f.q)}
                <span aria-hidden className="text-2xl leading-none font-normal text-ink-3 transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-2.5 leading-relaxed text-ink-2">{t(f.a)}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
