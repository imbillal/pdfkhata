import type { Metadata } from "next";
import { ToolIndex } from "@/components/ToolIndex";
import { TOOLS } from "@/tools/registry";
import { hasLocale, translator } from "@/i18n/locale";
import { notFound } from "next/navigation";
import { pageMetadata } from "@/i18n/seo";
import { JsonLd } from "@/components/JsonLd";
import { absoluteUrl } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/[lang]/tools">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = translator(lang);
  return pageMetadata({
    locale: lang,
    path: "/tools/",
    title: t({ en: `All ${TOOLS.length} Free PDF, Image & Bangla Tools`, bn: `সব ${t.n(TOOLS.length)}টি ফ্রি PDF, ছবি ও বাংলা টুল` }),
    description: t({
      en: "Browse every PDFKhata tool: organize and edit PDFs, convert files, Bangla OCR and Bijoy conversion, image, data and everyday utilities. Free and private.",
      bn: "PDFKhata-র সব টুল এক জায়গায়: PDF সাজানো ও সম্পাদনা, রূপান্তর, বাংলা OCR ও বিজয় কনভার্টার, ছবি, ডেটা আর দরকারি টুল। ফ্রি ও নিরাপদ।",
    }),
    image: `${lang}/tools.jpg`,
  });
}

export default async function ToolsPage({ params }: PageProps<"/[lang]/tools">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = translator(lang);
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: t({ en: "PDFKhata tools", bn: "PDFKhata-র টুল" }),
    itemListElement: TOOLS.map((tool, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t(tool.name),
      url: absoluteUrl(`/${lang}/tools/${tool.slug}/`),
    })),
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pt-12 sm:px-6">
      <JsonLd data={itemList} />
      <h1 className="font-display text-4xl font-bold sm:text-5xl">
        {t({ en: "All tools", bn: "সব টুল" })}
      </h1>
      <p className="mt-3 text-lg text-ink-2">
        {t({ en: `${TOOLS.length} tools, all free, all running on your device.`, bn: `${t.n(TOOLS.length)}টি টুল, সবই বিনামূল্যে, সবই চলে আপনার ডিভাইসে।` })}
      </p>
      <div className="mt-12">
        <ToolIndex locale={lang} />
      </div>
    </div>
  );
}
