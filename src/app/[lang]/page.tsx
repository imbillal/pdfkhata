import Link from "next/link";
import { notFound } from "next/navigation";
import { HomeDrop } from "@/components/HomeDrop";
import { ToolIndex } from "@/components/ToolIndex";
import { TOOLS } from "@/tools/registry";
import { hasLocale, translator, type Bi } from "@/i18n/locale";

const PROMISES: { title: Bi; body: Bi }[] = [
  {
    title: { en: "Nothing leaves your device", bn: "ফাইল ডিভাইসের বাইরে যায় না" },
    body: { en: "Files are processed by your own browser. There is no upload step at all.", bn: "সব কাজ হয় আপনার নিজের ব্রাউজারে। আপলোডের কোনো ধাপই নেই।" },
  },
  {
    title: { en: "Free, really", bn: "সত্যিই বিনামূল্যে" },
    body: { en: "No sign-up, no watermark, no “upgrade to download”.", bn: "সাইন-আপ নেই, ওয়াটারমার্ক নেই, “ডাউনলোডের জন্য আপগ্রেড করুন” নেই।" },
  },
  {
    title: { en: "Bangla is first-class", bn: "বাংলা এখানে প্রথম সারিতে" },
    body: { en: "Bijoy ⇄ Unicode, Bangla OCR and Bangla page numbers built in.", bn: "বিজয় ⇄ ইউনিকোড, বাংলা OCR আর বাংলা পৃষ্ঠা নম্বর, সবই আছে।" },
  },
];

const QUICK_LINKS: { slug: string; label: Bi }[] = [
  { slug: "bijoy-to-unicode", label: { en: "Bijoy → Unicode", bn: "বিজয় → ইউনিকোড" } },
  { slug: "merge-pdf", label: { en: "Merge PDF", bn: "PDF একত্র করুন" } },
  { slug: "bangla-ocr", label: { en: "Bangla OCR", bn: "বাংলা OCR" } },
];

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = translator(lang);

  return (
    <div className="mx-auto max-w-6xl px-4">
      <section className="grid items-center gap-10 pt-12 pb-16 lg:grid-cols-[5fr_6fr] lg:pt-20">
        <div>
          <p className="text-sm font-medium tracking-[0.14em] text-margin uppercase">
            {t({ en: "Free · Private · No sign-up", bn: "বিনামূল্যে · নিরাপদ · সাইন-আপ ছাড়া" })}
          </p>
          <h1 className="mt-3 font-display text-5xl leading-[1.1] font-semibold tracking-tight sm:text-6xl">
            {t({ en: "Every paper chore, in one notebook.", bn: "কাগজের সব কাজ, এক খাতায়।" })}
          </h1>
          <p className="mt-5 max-w-md text-lg text-ink-2">
            {t({
              en: `${TOOLS.length} free tools for PDFs, photos, data and Bangla text. They run right here in your browser.`,
              bn: `PDF, ছবি, ডেটা আর বাংলা লেখার জন্য ${t.n(TOOLS.length)}টি বিনামূল্যের টুল। সব চলে এখানেই, আপনার ব্রাউজারে।`,
            })}
          </p>
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {QUICK_LINKS.map((q) => (
              <Link key={q.slug} href={t.href(`/tools/${q.slug}/`)} className="font-medium text-accent underline-offset-4 hover:underline">
                {t(q.label)}
              </Link>
            ))}
            <Link href={t.href("/tools/")} className="text-ink-2 underline-offset-4 hover:underline">
              {t({ en: "See all →", bn: "সব দেখুন →" })}
            </Link>
          </div>
        </div>
        <HomeDrop />
      </section>

      <section className="grid gap-px overflow-hidden rounded-xl border border-rule bg-rule sm:grid-cols-3">
        {PROMISES.map((p, i) => (
          <div key={p.title.en} className="bg-sheet p-6">
            <p className="font-mono text-xs text-margin">{t.n(i + 1, { minimumIntegerDigits: 2 })}</p>
            <p className="mt-2 font-display text-lg font-semibold">{t(p.title)}</p>
            <p className="mt-1 text-sm text-ink-2">{t(p.body)}</p>
          </div>
        ))}
      </section>

      <section className="mt-20">
        <h2 className="mb-10 font-display text-3xl font-semibold tracking-tight">{t({ en: "Contents", bn: "সূচিপত্র" })}</h2>
        <ToolIndex locale={lang} />
      </section>
    </div>
  );
}
