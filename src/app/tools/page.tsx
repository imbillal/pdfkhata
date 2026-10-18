import type { Metadata } from "next";
import { ToolIndex } from "@/components/ToolIndex";
import { TOOLS } from "@/tools/registry";

export const metadata: Metadata = {
  title: "All tools",
  description: "Every PDFKhata tool: PDF, Bangla, image, data and utilities. Free, private and in your browser.",
};

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-10">
      <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">The whole khata</h1>
      <p className="mt-2 text-lg text-ink-2">{TOOLS.length} tools, all free, all running on your device.</p>
      <div className="mt-10">
        <ToolIndex />
      </div>
    </div>
  );
}
