import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TOOLS, getCategory, getTool, toolsIn } from "@/tools/registry";
import { ToolMount } from "@/tools/ToolMount";
import { ToolIcon } from "@/tools/icons";
import { ToolCard } from "@/components/ToolCard";
import { Lock } from "lucide-react";
import { hasLocale, translator } from "@/i18n/locale";
import { pageMetadata } from "@/i18n/seo";
import { getToolContent } from "@/tools/content";
import { ToolGuide } from "@/components/ToolGuide";
import { JsonLd } from "@/components/JsonLd";
import { SITE_NAME, absoluteUrl } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return TOOLS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/tools/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const tool = getTool(slug);
  if (!tool || !hasLocale(lang)) return {};
  const t = translator(lang);
  const content = getToolContent(slug);
  return pageMetadata({
    locale: lang,
    path: `/tools/${slug}/`,
    title: content ? t(content.metaTitle) : t(tool.name),
    description: content ? t(content.metaDescription) : t(tool.blurb),
    image: `${lang}/${slug}.jpg`,
  });
}

export default async function ToolPage({ params }: PageProps<"/[lang]/tools/[slug]">) {
  const { lang, slug } = await params;
  const tool = getTool(slug);
  if (!tool || !hasLocale(lang)) notFound();
  const t = translator(lang);
  const category = getCategory(tool.category);
  const siblings = toolsIn(tool.category).filter((s) => s.slug !== tool.slug);
  const content = getToolContent(tool.slug);
  const url = absoluteUrl(`/${lang}/tools/${tool.slug}/`);
  const inLanguage = lang === "bn" ? "bn-BD" : "en";

  const structured: object[] = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: t(tool.name),
      description: content ? t(content.metaDescription) : t(tool.blurb),
      url,
      inLanguage,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Any (web browser)",
      browserRequirements: "Requires JavaScript",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      publisher: { "@type": "Organization", name: SITE_NAME, url: absoluteUrl("/") },
      image: absoluteUrl(`/og/${lang}/${tool.slug}.jpg`),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: t({ en: "Home", bn: "হোম" }), item: absoluteUrl(`/${lang}/`) },
        { "@type": "ListItem", position: 2, name: t(category.name), item: absoluteUrl(`/${lang}/tools/#${category.id}`) },
        { "@type": "ListItem", position: 3, name: t(tool.name), item: url },
      ],
    },
  ];
  if (content) {
    structured.push(
      {
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: t({ en: `How to use ${tool.name.en}`, bn: `${tool.name.bn}: কীভাবে ব্যবহার করবেন` }),
        inLanguage,
        tool: { "@type": "HowToTool", name: SITE_NAME },
        step: content.steps.map((step, i) => ({ "@type": "HowToStep", position: i + 1, text: t(step) })),
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        inLanguage,
        mainEntity: content.faqs.map((f) => ({ "@type": "Question", name: t(f.q), acceptedAnswer: { "@type": "Answer", text: t(f.a) } })),
      },
    );
  }

  return (
    <>
      <JsonLd data={structured} />
      <div className="border-b border-rule bg-sheet">
        <div className="mx-auto max-w-7xl px-4 pt-6 pb-8 sm:px-6">
          <nav aria-label={t({ en: "Breadcrumb", bn: "অবস্থান" })} className="flex flex-wrap gap-1.5 text-[0.93rem] text-ink-3">
            <Link href={t.href("/")} className="hover:text-margin">
              {t({ en: "Home", bn: "হোম" })}
            </Link>
            <span aria-hidden>/</span>
            <Link href={t.href(`/tools/#${category.id}`)} className="hover:text-margin">
              {t(category.name)}
            </Link>
          </nav>
          <header className="mt-5 flex flex-wrap items-center gap-5">
            <ToolIcon slug={tool.slug} category={tool.category} size="lg" />
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-3xl font-bold sm:text-[2.6rem] sm:leading-tight">{t(tool.name)}</h1>
              <p className="mt-1 max-w-2xl text-lg text-ink-2">{t(tool.blurb)}</p>
            </div>
            <p className="flex items-center gap-2 rounded-full bg-paper-2 px-3.5 py-1.5 text-sm text-ink-2">
              <Lock className="size-3.5 text-ok" />
              {t({ en: "Files never leave your device", bn: "ফাইল আপনার ডিভাইসের বাইরে যায় না" })}
            </p>
          </header>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
        <ToolMount slug={tool.slug} />

        {content && <ToolGuide tool={tool} content={content} locale={lang} />}

        {siblings.length > 0 && (
          <section className="mt-24">
            <h2 className="mb-6 font-display text-2xl font-bold">
              {t({ en: `More ${category.name.en} tools`, bn: `${category.name.bn} বিভাগের আরও টুল` })}
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {siblings.map((s) => (
                <li key={s.slug}>
                  <ToolCard tool={s} href={t.href(`/tools/${s.slug}/`)} pick={t} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}
