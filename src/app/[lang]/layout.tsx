import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Anek_Bangla } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import { LOCALES, hasLocale } from "@/i18n/locale";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import "../globals.css";

// One family for both scripts, so English and Bangla pages feel like the same product.
const anek = Anek_Bangla({ variable: "--font-anek", subsets: ["bengali", "latin"], weight: "variable", axes: ["wdth"] });

export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  const bn = lang === "bn";
  return {
    metadataBase: new URL(SITE_URL),
    applicationName: SITE_NAME,
    title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
    description: bn
      ? "PDF, ছবি আর বাংলা লেখার বিনামূল্যের টুল, সবই চলে আপনার ব্রাউজারে। ফাইল কোথাও আপলোড হয় না।"
      : "Free PDF, image and Bangla document tools that run in your browser. Your files never leave your device.",
    icons: { icon: "/icon.svg", apple: "/apple-touch-icon.png" },
    formatDetection: { telephone: false },
  };
}

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1a2f7d" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1118" },
  ],
};

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  return (
    <html
      lang={lang}
      className={`${anek.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <LocaleProvider locale={lang}>
          <SiteHeader locale={lang} />
          <main className="flex-1">{children}</main>
          <SiteFooter locale={lang} />
        </LocaleProvider>
      </body>
    </html>
  );
}
