import type { Metadata } from "next";

// Separate root layout for "/" only: it just forwards to /en/ or /bn/.
export const metadata: Metadata = {
  title: "PDFKhata",
  alternates: { languages: { en: "/en/", bn: "/bn/" } },
};

export default function RedirectLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ background: "#f6f1e7", fontFamily: "system-ui, sans-serif" }}>{children}</body>
    </html>
  );
}
