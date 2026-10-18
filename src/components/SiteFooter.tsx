import Link from "next/link";
import { CATEGORIES } from "@/tools/registry";
import { translator, type Locale } from "@/i18n/locale";

export function SiteFooter({ locale }: { locale: Locale }) {
  const t = translator(locale);
  return (
    <footer className="mt-24 border-t border-rule bg-paper-2">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-[2fr_3fr]">
        <div>
          <p className="font-display text-lg font-semibold">
            PDF<span className="text-margin">Khata</span>
          </p>
          <p className="mt-2 max-w-sm text-sm text-ink-2">
            {t({
              en: "Every tool runs inside your browser. Files are never uploaded, so they stay private by design.",
              bn: "প্রতিটি টুল চলে আপনার ব্রাউজারের ভেতরেই। ফাইল কখনো আপলোড হয় না, তাই আপনার ফাইল আপনারই থাকে।",
            })}
          </p>
        </div>
        <ul className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
          {CATEGORIES.map((c) => (
            <li key={c.id}>
              <Link href={t.href(`/tools/#${c.id}`)} className="text-ink-2 hover:text-margin">
                {t(c.name)}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
