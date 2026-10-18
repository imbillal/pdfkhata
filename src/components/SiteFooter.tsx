import Link from "next/link";
import { CATEGORIES } from "@/tools/registry";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-rule bg-paper-2">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-[2fr_3fr]">
        <div>
          <p className="font-display text-lg font-semibold">
            PDF<span className="text-margin">Khata</span>
          </p>
          <p className="mt-2 max-w-sm text-sm text-ink-2">
            Every tool runs inside your browser. Files are never uploaded, so they stay private by design.
          </p>
        </div>
        <ul className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
          {CATEGORIES.map((c) => (
            <li key={c.id}>
              <Link href={`/tools/#${c.id}`} className="text-ink-2 hover:text-margin">
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
