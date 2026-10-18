import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TOOLS, getCategory, getTool, toolsIn } from "@/tools/registry";
import { ToolMount } from "@/tools/ToolMount";
import { LOCALES, hasLocale, translator } from "@/i18n/locale";

export const dynamicParams = false;

export function generateStaticParams() {
  return TOOLS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/tools/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const tool = getTool(slug);
  if (!tool || !hasLocale(lang)) return {};
  const t = translator(lang);
  return {
    title: t({ en: `${tool.name.en}, free and private`, bn: `${tool.name.bn}, বিনামূল্যে ও নিরাপদে` }),
    description: `${t(tool.blurb)} ${t({ en: "Runs in your browser, so files never leave your device.", bn: "ব্রাউজারেই চলে, তাই ফাইল আপনার ডিভাইসের বাইরে যায় না।" })}`,
    alternates: { languages: Object.fromEntries(LOCALES.map((l) => [l, `/${l}/tools/${slug}/`])) },
  };
}

export default async function ToolPage({ params }: PageProps<"/[lang]/tools/[slug]">) {
  const { lang, slug } = await params;
  const tool = getTool(slug);
  if (!tool || !hasLocale(lang)) notFound();
  const t = translator(lang);
  const category = getCategory(tool.category);
  const siblings = toolsIn(tool.category).filter((s) => s.slug !== tool.slug);

  return (
    <div className="mx-auto max-w-6xl px-4 pt-8">
      <nav aria-label={t({ en: "Breadcrumb", bn: "অবস্থান" })} className="text-sm text-ink-3">
        <Link href={t.href("/tools/")} className="hover:text-margin">
          {t({ en: "Tools", bn: "টুল" })}
        </Link>
        <span className="mx-2">/</span>
        <Link href={t.href(`/tools/#${category.id}`)} className="hover:text-margin">
          {t(category.name)}
        </Link>
      </nav>

      <header className="mt-3 mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-rule pb-6">
        <div>
          <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">{t(tool.name)}</h1>
          <p className="mt-2 max-w-2xl text-lg text-ink-2">{t(tool.blurb)}</p>
        </div>
        <p className="flex items-center gap-2 rounded-full border border-ok/30 px-3 py-1 text-xs text-ok">
          <svg viewBox="0 0 20 20" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <rect x="4" y="9" width="12" height="8" rx="1.5" />
            <path d="M7 9V6.5a3 3 0 0 1 6 0V9" />
          </svg>
          {t({ en: "Runs on your device · nothing is uploaded", bn: "আপনার ডিভাইসেই চলে · কিছুই আপলোড হয় না" })}
        </p>
      </header>

      <ToolMount slug={tool.slug} />

      {siblings.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-4 font-display text-xl font-semibold">
            {t({ en: `More in ${category.name.en}`, bn: `${category.name.bn}-এর আরও টুল` })}
          </h2>
          <ul className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
            {siblings.map((s) => (
              <li key={s.slug} className="border-b border-rule">
                <Link href={t.href(`/tools/${s.slug}/`)} className="group flex items-baseline justify-between gap-3 py-3">
                  <span className="font-medium group-hover:text-margin">{t(s.name)}</span>
                  <span className="text-ink-3 transition group-hover:translate-x-0.5 group-hover:text-margin">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
