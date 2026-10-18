"use client";

import { TOOL_COMPONENTS } from "@/tools/loaders";

export function ToolMount({ slug }: { slug: string }) {
  const Component = TOOL_COMPONENTS[slug];
  if (!Component) return <p className="text-sm text-ink-3">This tool is coming soon.</p>;
  return <Component />;
}
