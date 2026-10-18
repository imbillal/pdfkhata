"use client";

import { useMemo, useState } from "react";
import { CATEGORIES, TOOLS, type CategoryId } from "@/tools/registry";
import { CATEGORY_COLOR } from "@/tools/icons";
import { ToolCard } from "@/components/ToolCard";
import { useT } from "@/i18n/LocaleProvider";

type Filter = CategoryId | "all";

/** Every tool as cards, filtered by category tabs. */
export function ToolBrowser() {
  const t = useT();
  const [filter, setFilter] = useState<Filter>("all");

  const visible = useMemo(() => (filter === "all" ? TOOLS : TOOLS.filter((tool) => tool.category === filter)), [filter]);

  const tabs: { id: Filter; label: string; count: number }[] = [
    { id: "all", label: t({ en: "All", bn: "সব" }), count: TOOLS.length },
    ...CATEGORIES.map((c) => ({ id: c.id, label: t(c.name), count: TOOLS.filter((tool) => tool.category === c.id).length })),
  ];

  return (
    <div>
      <div role="tablist" aria-label={t({ en: "Tool categories", bn: "টুলের ধরন" })} className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
        {tabs.map((tab) => {
          const active = tab.id === filter;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(tab.id)}
              className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-[0.95rem] font-medium transition-colors ${
                active ? "border-ink bg-ink text-paper" : "border-rule-strong bg-sheet text-ink-2 hover:border-ink-3 hover:text-ink"
              }`}
            >
              {tab.id !== "all" && <span aria-hidden className="size-2 rounded-full" style={{ backgroundColor: CATEGORY_COLOR[tab.id] }} />}
              {tab.label}
              <span className={active ? "text-paper/60" : "text-ink-3"}>{t.n(tab.count)}</span>
            </button>
          );
        })}
      </div>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visible.map((tool) => (
          <li key={tool.slug}>
            <ToolCard tool={tool} href={t.href(`/tools/${tool.slug}/`)} pick={t} />
          </li>
        ))}
      </ul>
    </div>
  );
}
