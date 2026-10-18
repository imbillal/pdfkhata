// Shared metadata builder: canonical, hreflang, Open Graph and Twitter cards for a page.

import type { Metadata } from "next";
import { LOCALES, type Locale } from "@/i18n/locale";
import { SITE_NAME, absoluteUrl } from "@/lib/site";

const OG_LOCALE: Record<Locale, string> = { en: "en_US", bn: "bn_BD" };

/**
 * @param path app path without the locale, e.g. "/tools/merge-pdf/"
 * @param image og image path under /og, e.g. "en/merge-pdf.jpg"
 */
export function pageMetadata({
  locale,
  path,
  title,
  description,
  image,
  absoluteTitle = false,
}: {
  locale: Locale;
  path: string;
  title: string;
  description: string;
  image: string;
  absoluteTitle?: boolean;
}): Metadata {
  const url = absoluteUrl(`/${locale}${path}`);
  const ogImage = { url: absoluteUrl(`/og/${image}`), width: 1200, height: 630, alt: title };
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: {
      canonical: url,
      languages: {
        ...Object.fromEntries(LOCALES.map((l) => [l === "bn" ? "bn-BD" : "en", absoluteUrl(`/${l}${path}`)])),
        "x-default": absoluteUrl(`/en${path}`),
      },
    },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      url,
      title,
      description,
      locale: OG_LOCALE[locale],
      alternateLocale: LOCALES.filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
      images: [ogImage],
    },
    twitter: { card: "summary_large_image", title, description, images: [ogImage.url] },
  };
}
