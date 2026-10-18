import Link from "next/link";
import { CATEGORIES, toolsIn } from "@/tools/registry";
import { translator, type Locale } from "@/i18n/locale";
import { Logo } from "@/components/Logo";
import { REPO_URL } from "@/lib/site";

export function SiteFooter({ locale }: { locale: Locale }) {
  const t = translator(locale);
  return (
    <footer className="khata-cover mt-28 text-[#dfe5f7]">
      <div className="mx-auto max-w-7xl px-4 pt-14 pb-8 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_3fr]">
          <div>
            <Logo inverted />
            <p className="mt-4 max-w-xs text-[0.95rem] leading-relaxed text-[#b9c4ea]">
              {t({
                en: "Free document tools that run in your browser. Your files are never uploaded anywhere.",
                bn: "ব্রাউজারেই চলে এমন বিনামূল্যের ডকুমেন্ট টুল। আপনার ফাইল কোথাও আপলোড হয় না।",
              })}
            </p>
            <a href={REPO_URL} className="mt-5 inline-flex items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-sm text-white hover:bg-white/10">
              <svg viewBox="0 0 16 16" className="size-4" fill="currentColor" aria-hidden>
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
              </svg>
              {t({ en: "Open source on GitHub", bn: "GitHub-এ ওপেন সোর্স" })}
            </a>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {CATEGORIES.filter((c) => c.id !== "utility").map((c) => (
              <div key={c.id}>
                <p className="mb-3 font-semibold text-white">{t(c.name)}</p>
                <ul className="space-y-2 text-[0.92rem]">
                  {toolsIn(c.id)
                    .slice(0, 5)
                    .map((tool) => (
                      <li key={tool.slug}>
                        <Link href={t.href(`/tools/${tool.slug}/`)} className="text-[#b9c4ea] hover:text-white">
                          {t(tool.name)}
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-white/15 pt-6 text-sm text-[#9fabd8] sm:flex-row sm:items-center sm:justify-between">
          <p>{t({ en: "© 2026 PDFKhata. Made in Bangladesh.", bn: "© ২০২৬ PDFKhata। বাংলাদেশে তৈরি।" })}</p>
          <Link href={t.href("/tools/")} className="hover:text-white">
            {t({ en: "See every tool", bn: "সব টুল দেখুন" })}
          </Link>
        </div>
      </div>
    </footer>
  );
}
