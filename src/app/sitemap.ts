import type { MetadataRoute } from "next";
import { TOOLS } from "@/tools/registry";
import { LOCALES } from "@/i18n/locale";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-static";

/** Every page in both languages, each pointing at its translation. */
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["/", "/tools/", ...TOOLS.map((t) => `/tools/${t.slug}/`)];
  const lastModified = new Date();
  return paths.flatMap((path) =>
    LOCALES.map((lang) => ({
      url: absoluteUrl(`/${lang}${path}`),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: path === "/" ? 1 : path === "/tools/" ? 0.9 : 0.8,
      alternates: {
        languages: {
          ...Object.fromEntries(LOCALES.map((l) => [l === "bn" ? "bn-BD" : "en", absoluteUrl(`/${l}${path}`)])),
          "x-default": absoluteUrl(`/en${path}`),
        },
      },
    })),
  );
}
