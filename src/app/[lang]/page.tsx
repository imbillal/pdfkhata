import Link from "next/link";
import { notFound } from "next/navigation";
import { Lock, Languages, BadgeCheck } from "lucide-react";
import { HomeDrop } from "@/components/HomeDrop";
import { ToolBrowser } from "@/components/ToolBrowser";
import { ToolCard } from "@/components/ToolCard";
import { BijoyDemo } from "@/components/BijoyDemo";
import { TOOLS } from "@/tools/registry";
import type { Metadata } from "next";
import { hasLocale, translator, type Bi } from "@/i18n/locale";
import { pageMetadata } from "@/i18n/seo";
import { JsonLd } from "@/components/JsonLd";
import { SITE_NAME, absoluteUrl } from "@/lib/site";

const PROMISES: { icon: typeof Lock; title: Bi; body: Bi }[] = [
  {
    icon: Lock,
    title: { en: "Files stay on your device", bn: "ফাইল আপনার ডিভাইসেই থাকে" },
    body: { en: "Everything runs in your browser. Nothing is uploaded.", bn: "সব কাজ হয় ব্রাউজারে। কিছুই আপলোড হয় না।" },
  },
  {
    icon: BadgeCheck,
    title: { en: "Free, without a catch", bn: "বিনামূল্যে, কোনো শর্ত নেই" },
    body: { en: "No account, no watermark, no daily limit.", bn: "অ্যাকাউন্ট, ওয়াটারমার্ক বা দৈনিক সীমা নেই।" },
  },
  {
    icon: Languages,
    title: { en: "Built for Bangla", bn: "বাংলার জন্য তৈরি" },
    body: { en: "Bijoy conversion, Bangla OCR and Bangla page numbers.", bn: "বিজয় রূপান্তর, বাংলা OCR আর বাংলা পৃষ্ঠা নম্বর।" },
  },
];

const STEPS: { title: Bi; body: Bi }[] = [
  { title: { en: "Pick a tool or drop a file", bn: "টুল বাছুন বা ফাইল দিন" }, body: { en: "Drop a file on the home page and we suggest what fits.", bn: "হোম পেজে ফাইল দিলে মানানসই টুলগুলো দেখাব।" } },
  { title: { en: "Adjust the options", bn: "অপশন ঠিক করুন" }, body: { en: "Page ranges, quality, size, language. Previews update as you go.", bn: "পৃষ্ঠা, মান, মাপ, ভাষা। প্রিভিউ সঙ্গে সঙ্গে বদলায়।" } },
  { title: { en: "Download the result", bn: "ফলাফল ডাউনলোড করুন" }, body: { en: "Your browser builds the file. Close the tab and it's gone.", bn: "ফাইল তৈরি হয় আপনার ব্রাউজারে। ট্যাব বন্ধ করলেই সব মুছে যায়।" } },
];

const FAQ: { q: Bi; a: Bi }[] = [
  {
    q: { en: "Are my files uploaded to a server?", bn: "আমার ফাইল কি কোনো সার্ভারে আপলোড হয়?" },
    a: {
      en: "No. PDFKhata is a static website: the tools are JavaScript that runs in your browser, so your files never leave your device. Bangla OCR downloads its language data once, but your images stay local.",
      bn: "না। PDFKhata একটি স্ট্যাটিক ওয়েবসাইট: টুলগুলো আপনার ব্রাউজারেই চলে, তাই ফাইল আপনার ডিভাইসের বাইরে যায় না। বাংলা OCR একবার ভাষার ডেটা নামায়, কিন্তু আপনার ছবি আপনার কাছেই থাকে।",
    },
  },
  {
    q: { en: "Why does text from old Bangla files look like “Avwg”?", bn: "পুরোনো বাংলা ফাইলের লেখা কেন “Avwg”-এর মতো দেখায়?" },
    a: {
      en: "Those files were typed in Bijoy with fonts like SutonnyMJ, which store Bangla letters as English characters. The Bijoy → Unicode tool turns them back into real Bangla that works everywhere.",
      bn: "এসব ফাইল বিজয়ে SutonnyMJ-এর মতো ফন্টে লেখা, যেখানে বাংলা অক্ষর ইংরেজি অক্ষর হিসেবে জমা থাকে। বিজয় → ইউনিকোড টুল সেগুলোকে আসল বাংলায় ফিরিয়ে আনে, যা সব জায়গায় চলে।",
    },
  },
  {
    q: { en: "Can it read scanned Bangla documents?", bn: "স্ক্যান করা বাংলা ডকুমেন্ট কি পড়া যায়?" },
    a: {
      en: "Yes. Bangla OCR reads Bangla and English from photos and scanned PDFs. Clear, straight scans give the best results.",
      bn: "হ্যাঁ। বাংলা OCR ছবি ও স্ক্যান করা PDF থেকে বাংলা ও ইংরেজি পড়ে। পরিষ্কার ও সোজা স্ক্যানে সবচেয়ে ভালো ফল পাবেন।",
    },
  },
  {
    q: { en: "Is there a file size limit?", bn: "ফাইলের সাইজের কোনো সীমা আছে?" },
    a: {
      en: "Only your device's memory. Most phones handle PDFs of a few hundred pages; a laptop handles much more.",
      bn: "শুধু আপনার ডিভাইসের মেমোরি। বেশিরভাগ ফোন কয়েকশো পৃষ্ঠার PDF সামলাতে পারে, ল্যাপটপ পারে আরও বেশি।",
    },
  },
  {
    q: { en: "Does it work offline?", bn: "ইন্টারনেট ছাড়া কি চলে?" },
    a: {
      en: "Once a tool page has loaded, most tools keep working without internet. OCR needs a connection the first time to fetch its language data.",
      bn: "টুলের পেজ একবার লোড হলে বেশিরভাগ টুল ইন্টারনেট ছাড়াও চলে। OCR প্রথমবার ভাষার ডেটা নামাতে ইন্টারনেট লাগে।",
    },
  },
];

export async function generateMetadata({ params }: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = translator(lang);
  return pageMetadata({
    locale: lang,
    path: "/",
    absoluteTitle: true,
    title: t({
      en: "PDFKhata: Free PDF Tools & Bangla OCR, No Upload",
      bn: "PDFKhata: ফ্রি PDF টুল, বাংলা OCR ও বিজয় কনভার্টার",
    }),
    description: t({
      en: `${TOOLS.length} free tools to merge, split, compress and convert PDFs, read scanned Bangla (OCR) and fix Bijoy text. Runs in your browser; files never leave your device.`,
      bn: `PDF জোড়া, ভাগ ও রূপান্তর, স্ক্যান করা বাংলা পড়া (OCR) আর বিজয় থেকে ইউনিকোডসহ ${t.n(TOOLS.length)}টি ফ্রি টুল। সব চলে ব্রাউজারে, ফাইল আপলোড হয় না।`,
    }),
    image: `${lang}/home.jpg`,
  });
}

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = translator(lang);
  const featured = TOOLS.filter((tool) => tool.featured);

  const structured = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      url: absoluteUrl(`/${lang}/`),
      inLanguage: lang === "bn" ? "bn-BD" : "en",
      description: t({ en: "Free PDF, image and Bangla document tools that run in your browser.", bn: "ব্রাউজারেই চলে এমন বিনামূল্যের PDF, ছবি আর বাংলা টুল।" }),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ.map((f) => ({ "@type": "Question", name: t(f.q), acceptedAnswer: { "@type": "Answer", text: t(f.a) } })),
    },
  ];

  return (
    <>
      <JsonLd data={structured} />
      <section className="khata-cover relative overflow-hidden text-white">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-3 bg-black/20 sm:w-5" aria-hidden />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pt-14 pb-16 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:pt-20 lg:pb-24">
          <div>
            <h1 className="font-display text-[2.6rem] leading-[1.05] font-extrabold sm:text-6xl lg:text-[4.2rem]">
              {t({ en: "Every paper job, done in your browser.", bn: "কাগজের সব কাজ, আপনার ব্রাউজারেই।" })}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#c9d4ff] sm:text-xl">
              {t({
                en: `${TOOLS.length} free tools for PDFs, photos, data and Bangla text. Merge, split, convert, read scanned Bangla, fix Bijoy text. No uploads, no sign-up.`,
                bn: `PDF, ছবি, ডেটা আর বাংলা লেখার জন্য ${t.n(TOOLS.length)}টি বিনামূল্যের টুল। জোড়া, ভাগ, রূপান্তর, স্ক্যান করা বাংলা পড়া, বিজয় ঠিক করা। আপলোড বা সাইন-আপ ছাড়াই।`,
              })}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="#tools" className="rounded-xl bg-white px-6 py-3.5 text-[1.02rem] font-semibold text-[#1a2f7d] shadow-sm hover:bg-[#e6ebfa]">
                {t({ en: "Browse all tools", bn: "সব টুল দেখুন" })}
              </Link>
              <Link href={t.href("/tools/bijoy-to-unicode/")} className="rounded-xl border border-white/30 px-6 py-3.5 text-[1.02rem] font-semibold text-white hover:bg-white/10">
                {t({ en: "Fix Bijoy text", bn: "বিজয় লেখা ঠিক করুন" })}
              </Link>
            </div>
          </div>
          <HomeDrop />
        </div>
      </section>

      <section className="border-b border-rule bg-sheet">
        <ul className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 md:grid-cols-3">
          {PROMISES.map((p) => (
            <li key={p.title.en} className="flex gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-margin-soft text-margin">
                <p.icon className="size-5" strokeWidth={1.9} />
              </span>
              <span>
                <span className="block font-semibold">{t(p.title)}</span>
                <span className="mt-0.5 block text-[0.95rem] text-ink-2">{t(p.body)}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <section className="pt-20">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">{t({ en: "Most used", bn: "সবচেয়ে বেশি ব্যবহৃত" })}</h2>
          <p className="mt-2 text-lg text-ink-2">{t({ en: "The tools people reach for first.", bn: "মানুষ সবার আগে যে টুলগুলো খোঁজে।" })}</p>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((tool) => (
              <li key={tool.slug}>
                <ToolCard tool={tool} href={t.href(`/tools/${tool.slug}/`)} pick={t} />
              </li>
            ))}
          </ul>
        </section>

        <section className="grid items-center gap-10 pt-24 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              {t({ en: "Old Bangla files, readable again", bn: "পুরোনো বাংলা ফাইল, আবার পড়ার মতো" })}
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-ink-2">
              {t({
                en: "Copy text out of an old Bijoy document and you get gibberish. Paste it here and it turns into proper Unicode Bangla that works in Word, Google Docs, Facebook and email. Try editing the sample.",
                bn: "পুরোনো বিজয় ডকুমেন্ট থেকে লেখা কপি করলে আসে অর্থহীন অক্ষর। এখানে পেস্ট করলেই তা হয়ে যায় আসল ইউনিকোড বাংলা, যা Word, Google Docs, Facebook আর ইমেইলে চলে। নমুনাটা বদলে দেখুন।",
              })}
            </p>
          </div>
          <BijoyDemo />
        </section>

        <section id="tools" className="scroll-mt-20 pt-24">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">{t({ en: "All tools", bn: "সব টুল" })}</h2>
          <p className="mt-2 mb-8 text-lg text-ink-2">
            {t({ en: `${TOOLS.length} tools in seven groups.`, bn: `সাতটি ভাগে ${t.n(TOOLS.length)}টি টুল।` })}
          </p>
          <ToolBrowser />
        </section>

        <section className="pt-24">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">{t({ en: "How it works", bn: "কীভাবে কাজ করে" })}</h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title.en} className="rounded-2xl border border-rule bg-sheet p-6">
                <span className="grid size-9 place-items-center rounded-full bg-cover font-display font-bold text-white">{t.n(i + 1)}</span>
                <p className="mt-4 text-lg font-semibold">{t(s.title)}</p>
                <p className="mt-1 text-ink-2">{t(s.body)}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="grid gap-10 pt-24 lg:grid-cols-[1fr_1.6fr]">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">{t({ en: "Questions people ask", bn: "যা সবাই জানতে চান" })}</h2>
          <div className="divide-y divide-rule rounded-2xl border border-rule bg-sheet">
            {FAQ.map((f) => (
              <details key={f.q.en} className="group px-6 py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[1.05rem] font-semibold [&::-webkit-details-marker]:hidden">
                  {t(f.q)}
                  <span aria-hidden className="text-2xl leading-none font-normal text-ink-3 transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 leading-relaxed text-ink-2">{t(f.a)}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
