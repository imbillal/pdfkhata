"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";
import { CATEGORIES, toolsIn } from "@/tools/registry";
import { ToolIcon } from "@/tools/icons";
import { useT } from "@/i18n/LocaleProvider";

/** Desktop: "Tools" mega menu + quick links. Mobile: a full menu panel. */
export function NavMenu() {
  const t = useT();
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const megaRef = useRef<HTMLDivElement>(null);

  const closeAll = useCallback(() => {
    setMegaOpen(false);
    setMobileOpen(false);
  }, []);

  useEffect(() => {
    if (!megaOpen) return;
    function onPointer(e: PointerEvent) {
      if (megaRef.current && !megaRef.current.contains(e.target as Node)) setMegaOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMegaOpen(false);
    }
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [megaOpen]);

  const quick = [
    { href: "/tools/#bangla", label: t({ en: "Bangla tools", bn: "বাংলা টুল" }) },
    { href: "/tools/#image", label: t({ en: "Image tools", bn: "ছবির টুল" }) },
    { href: "/tools/", label: t({ en: "All tools", bn: "সব টুল" }) },
  ];

  return (
    <>
      <nav className="hidden items-center gap-1 text-[0.95rem] lg:flex" aria-label={t({ en: "Main", bn: "প্রধান মেনু" })}>
        <div ref={megaRef} className="relative">
          <button
            type="button"
            aria-expanded={megaOpen}
            onClick={() => setMegaOpen((o) => !o)}
            className={`flex items-center gap-1 rounded-lg px-3 py-2 font-medium ${megaOpen ? "bg-paper-2 text-ink" : "text-ink-2 hover:bg-paper-2 hover:text-ink"}`}
          >
            {t({ en: "PDF tools", bn: "PDF টুল" })}
            <ChevronDown className={`size-4 transition-transform ${megaOpen ? "rotate-180" : ""}`} />
          </button>
          {megaOpen && (
            <div className="absolute top-full left-0 mt-2 grid w-[min(820px,90vw)] grid-cols-3 gap-6 rounded-2xl border border-rule bg-sheet p-6 shadow-[0_24px_60px_-20px_rgb(18_23_34/0.35)]">
              {CATEGORIES.filter((c) => ["organize", "edit", "convert"].includes(c.id)).map((c) => (
                <div key={c.id}>
                  <p className="mb-2 px-2 text-sm font-semibold text-ink-3">{t(c.name)}</p>
                  <ul>
                    {toolsIn(c.id).map((tool) => (
                      <li key={tool.slug}>
                        <Link
                          href={t.href(`/tools/${tool.slug}/`)}
                          onClick={closeAll}
                          className="flex items-center gap-3 rounded-lg px-2 py-1.5 text-ink-2 hover:bg-paper-2 hover:text-ink"
                        >
                          <ToolIcon slug={tool.slug} category={tool.category} size="sm" />
                          <span className="text-[0.95rem]">{t(tool.name)}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
        {quick.map((q) => (
          <Link key={q.href} href={t.href(q.href)} className="rounded-lg px-3 py-2 font-medium text-ink-2 hover:bg-paper-2 hover:text-ink">
            {q.label}
          </Link>
        ))}
      </nav>

      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="order-last rounded-lg p-2 text-ink-2 hover:bg-paper-2 lg:hidden"
        aria-label={t({ en: "Open menu", bn: "মেনু খুলুন" })}
      >
        <Menu className="size-5" />
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-sheet lg:hidden">
          <div className="flex h-16 items-center justify-between border-b border-rule px-4">
            <span className="font-display text-lg font-bold">{t({ en: "All tools", bn: "সব টুল" })}</span>
            <button type="button" onClick={closeAll} className="rounded-lg p-2 text-ink-2 hover:bg-paper-2" aria-label={t({ en: "Close menu", bn: "মেনু বন্ধ করুন" })}>
              <X className="size-5" />
            </button>
          </div>
          <div className="grid gap-6 px-4 py-6 sm:grid-cols-2">
            {CATEGORIES.map((c) => (
              <div key={c.id}>
                <p className="mb-1 px-2 text-sm font-semibold text-ink-3">{t(c.name)}</p>
                <ul>
                  {toolsIn(c.id).map((tool) => (
                    <li key={tool.slug}>
                      <Link href={t.href(`/tools/${tool.slug}/`)} onClick={closeAll} className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-paper-2">
                        <ToolIcon slug={tool.slug} category={tool.category} size="sm" />
                        <span>{t(tool.name)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
