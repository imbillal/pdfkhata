import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Fraunces, Geist, Geist_Mono, Hind_Siliguri } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import { LOCALES, hasLocale } from "@/i18n/locale";
import "../globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], axes: ["opsz", "SOFT"] });
const hind = Hind_Siliguri({ variable: "--font-hind", subsets: ["bengali", "latin"], weight: ["400", "500", "600", "700"] });

export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  const bn = lang === "bn";
  return {
    title: {
      default: bn ? "PDFKhata · বিনামূল্যে PDF ও বাংলা ডকুমেন্ট টুল" : "PDFKhata · free PDF & Bangla document tools",
      template: "%s · PDFKhata",
    },
    description: bn
      ? "PDF, ছবি আর বাংলা লেখার বিনামূল্যের টুল, সবই চলে আপনার ব্রাউজারে। ফাইল কোথাও আপলোড হয় না। সাইন-আপ বা ওয়াটারমার্ক নেই।"
      : "Free PDF, image and Bangla document tools that run in your browser. Your files never leave your device. No sign-up, no watermark.",
  };
}

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  return (
    <html
      lang={lang}
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} ${hind.variable} h-full antialiased`}
    >
      <body className={`flex min-h-full flex-col ${lang === "bn" ? "font-bangla" : "font-sans"}`}>
        <LocaleProvider locale={lang}>
          <SiteHeader locale={lang} />
          <main className="flex-1">{children}</main>
          <SiteFooter locale={lang} />
        </LocaleProvider>
      </body>
    </html>
  );
}
