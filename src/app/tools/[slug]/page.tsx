import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TOOLS, getCategory, getTool, toolsIn } from "@/tools/registry";
import { ToolMount } from "@/tools/ToolMount";

export const dynamicParams = false;

export function generateStaticParams() {
  return TOOLS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: PageProps<"/tools/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) return {};
  return { title: `${tool.name}, free and private`, description: `${tool.blurb} Runs in your browser, so files never leave your device.` };
}

export default async function ToolPage({ params }: PageProps<"/tools/[slug]">) {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) notFound();
  const category = getCategory(tool.category);
  const siblings = toolsIn(tool.category).filter((t) => t.slug !== tool.slug);

  return (
    <div className="mx-auto max-w-6xl px-4 pt-8">
      <nav aria-label="Breadcrumb" className="text-sm text-ink-3">
        <Link href="/tools/" className="hover:text-margin">
          Tools
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/tools/#${category.id}`} className="hover:text-margin">
          {category.name}
        </Link>
      </nav>

      <header className="mt-3 mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-rule pb-6">
        <div>
          <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">{tool.name}</h1>
          <p className="mt-2 max-w-2xl text-lg text-ink-2">{tool.blurb}</p>
        </div>
        <p className="flex items-center gap-2 rounded-full border border-ok/30 px-3 py-1 text-xs text-ok">
          <svg viewBox="0 0 20 20" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <rect x="4" y="9" width="12" height="8" rx="1.5" />
            <path d="M7 9V6.5a3 3 0 0 1 6 0V9" />
          </svg>
          Runs on your device · nothing is uploaded
        </p>
      </header>

      <ToolMount slug={tool.slug} />

      {siblings.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-4 font-display text-xl font-semibold">
            More in {category.name} <span className="font-bangla text-base font-normal text-ink-3">· {category.nameBn}</span>
          </h2>
          <ul className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
            {siblings.map((t) => (
              <li key={t.slug} className="border-b border-rule">
                <Link href={`/tools/${t.slug}/`} className="group flex items-baseline justify-between gap-3 py-3">
                  <span className="font-medium group-hover:text-margin">{t.name}</span>
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
