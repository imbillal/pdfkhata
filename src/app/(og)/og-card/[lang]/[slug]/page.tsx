import { notFound } from "next/navigation";
import { LOCALES, hasLocale, translator, type Bi } from "@/i18n/locale";
import { CATEGORIES, TOOLS, getCategory, getTool } from "@/tools/registry";
import { CATEGORY_COLOR, TOOL_ICONS } from "@/tools/icons";
import { Logo } from "@/components/Logo";

// 1200×630 share-image card. scripts/og.mjs screenshots /og-card/<lang>/<slug>/ into public/og/<lang>/<slug>.jpg.

const PAGES: Record<string, { title: Bi; sub: Bi }> = {
  home: {
    title: { en: "Every paper job, done in your browser.", bn: "কাগজের সব কাজ, আপনার ব্রাউজারেই।" },
    sub: { en: "Free PDF, image and Bangla tools. No uploads, no sign-up.", bn: "বিনামূল্যে PDF, ছবি আর বাংলা টুল। আপলোড বা সাইন-আপ ছাড়াই।" },
  },
  tools: {
    title: { en: "Every free tool, in one place", bn: "সব বিনামূল্যের টুল, এক জায়গায়" },
    sub: { en: "PDF, Bangla, image, data and everyday utilities.", bn: "PDF, বাংলা, ছবি, ডেটা আর দরকারি টুল।" },
  },
};

export const dynamicParams = false;

export function generateStaticParams() {
  const slugs = [...Object.keys(PAGES), ...TOOLS.map((t) => t.slug)];
  return LOCALES.flatMap((lang) => slugs.map((slug) => ({ lang, slug })));
}

export default async function OgCard({ params }: PageProps<"/og-card/[lang]/[slug]">) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) notFound();
  const t = translator(lang);
  const tool = getTool(slug);
  const page = PAGES[slug];
  if (!tool && !page) notFound();

  const title = tool ? t(tool.name) : t(page.title);
  const sub = tool ? t(tool.blurb) : t(page.sub);
  const chip = tool ? t(getCategory(tool.category).name) : null;
  const n = (v: number) => t.n(v);
  const Icon = tool ? TOOL_ICONS[tool.slug] : null;

  return (
    <div id="card" className="khata-cover relative flex h-[630px] w-[1200px] overflow-hidden text-white" lang={lang}>
      <div className="absolute inset-y-0 left-0 w-8 bg-black/20" />
      <div className="relative flex flex-1 flex-col justify-between py-16 pr-14 pl-24">
        <div className="flex items-center justify-between">
          <Logo inverted />
          <span className="rounded-full border border-white/25 px-4 py-1.5 text-lg text-[#c9d4ff]">pdfkhata.billal.dev</span>
        </div>

        <div className="flex items-end gap-10">
          <div className="min-w-0 flex-1">
            {chip && <p className="mb-4 text-2xl font-medium text-[#c9d4ff]">{chip}</p>}
            <h1 className={`font-display leading-[1.02] font-extrabold ${title.length > 26 ? "text-[76px]" : "text-[96px]"}`}>{title}</h1>
            <p className="mt-6 max-w-[760px] text-[30px] leading-snug text-[#dfe5f7]">{sub}</p>
          </div>
          {Icon && tool && (
            <div className="grid size-[220px] shrink-0 place-items-center rounded-[48px] bg-[#fffdf6] shadow-2xl" style={{ color: CATEGORY_COLOR[tool.category] }}>
              <Icon className="size-[120px]" strokeWidth={1.6} />
            </div>
          )}
        </div>

        <div className="flex gap-3 text-xl text-[#c9d4ff]">
          <span className="rounded-full bg-white/10 px-4 py-2">{t({ en: "Free", bn: "বিনামূল্যে" })}</span>
          <span className="rounded-full bg-white/10 px-4 py-2">{t({ en: "Files stay on your device", bn: "ফাইল আপনার ডিভাইসেই থাকে" })}</span>
          <span className="rounded-full bg-white/10 px-4 py-2">
            {t({ en: `${n(TOOLS.length)} tools in ${n(CATEGORIES.length)} groups`, bn: `${n(CATEGORIES.length)} ভাগে ${n(TOOLS.length)}টি টুল` })}
          </span>
        </div>
      </div>
    </div>
  );
}
