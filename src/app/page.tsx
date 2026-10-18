import Link from "next/link";
import { HomeDrop } from "@/components/HomeDrop";
import { ToolIndex } from "@/components/ToolIndex";
import { TOOLS } from "@/tools/registry";

const PROMISES = [
  { title: "Nothing leaves your device", body: "Files are processed by your own browser. There is no upload step at all." },
  { title: "Free, really", body: "No sign-up, no watermark, no “upgrade to download”." },
  { title: "Bangla is first-class", body: "Bijoy ⇄ Unicode, Bangla OCR and Bangla page numbers built in." },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4">
      <section className="grid items-center gap-10 pt-12 pb-16 lg:grid-cols-[5fr_6fr] lg:pt-20">
        <div>
          <p className="font-bangla text-lg text-margin">কাগজের সব কাজ, এক খাতায়</p>
          <h1 className="mt-3 font-display text-5xl leading-[1.05] font-semibold tracking-tight sm:text-6xl">
            Every paper chore, in one notebook.
          </h1>
          <p className="mt-5 max-w-md text-lg text-ink-2">
            {TOOLS.length} free tools for PDFs, photos, data and Bangla text. They run right here in your browser.
          </p>
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <Link href="/tools/bijoy-to-unicode/" className="font-medium text-accent underline-offset-4 hover:underline">
              Bijoy → Unicode
            </Link>
            <Link href="/tools/merge-pdf/" className="font-medium text-accent underline-offset-4 hover:underline">
              Merge PDF
            </Link>
            <Link href="/tools/bangla-ocr/" className="font-medium text-accent underline-offset-4 hover:underline">
              Bangla OCR
            </Link>
            <Link href="/tools/" className="text-ink-2 underline-offset-4 hover:underline">
              See all →
            </Link>
          </div>
        </div>
        <HomeDrop />
      </section>

      <section className="grid gap-px overflow-hidden rounded-xl border border-rule bg-rule sm:grid-cols-3">
        {PROMISES.map((p, i) => (
          <div key={p.title} className="bg-sheet p-6">
            <p className="font-mono text-xs text-margin">{String(i + 1).padStart(2, "0")}</p>
            <p className="mt-2 font-display text-lg font-semibold">{p.title}</p>
            <p className="mt-1 text-sm text-ink-2">{p.body}</p>
          </div>
        ))}
      </section>

      <section className="mt-20">
        <h2 className="mb-10 font-display text-3xl font-semibold tracking-tight">Contents</h2>
        <ToolIndex />
      </section>
    </div>
  );
}
