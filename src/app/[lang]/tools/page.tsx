import type { Metadata } from "next";
import { ToolIndex } from "@/components/ToolIndex";
import { TOOLS } from "@/tools/registry";
import { hasLocale, translator } from "@/i18n/locale";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: PageProps<"/[lang]/tools">): Promise<Metadata> {
  const { lang } = await params;
  const bn = lang === "bn";
  return {
    title: bn ? "সব টুল" : "All tools",
    description: bn
      ? "PDFKhata-র সব টুল: PDF, বাংলা, ছবি, ডেটা আর দরকারি টুল। বিনামূল্যে, ব্যক্তিগত, ব্রাউজারেই চলে।"
      : "Every PDFKhata tool: PDF, Bangla, image, data and utilities. Free, private and in your browser.",
  };
}

export default async function ToolsPage({ params }: PageProps<"/[lang]/tools">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = translator(lang);
  return (
    <div className="mx-auto max-w-6xl px-4 pt-10">
      <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
        {t({ en: "The whole khata", bn: "পুরো খাতা" })}
      </h1>
      <p className="mt-2 text-lg text-ink-2">
        {t({ en: `${TOOLS.length} tools, all free, all running on your device.`, bn: `${t.n(TOOLS.length)}টি টুল, সবই বিনামূল্যে, সবই চলে আপনার ডিভাইসে।` })}
      </p>
      <div className="mt-10">
        <ToolIndex locale={lang} />
      </div>
    </div>
  );
}
