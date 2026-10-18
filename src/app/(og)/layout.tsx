import type { Metadata } from "next";
import { Anek_Bangla } from "next/font/google";
import "../globals.css";

// Bare layout for the share-image cards that scripts/og.mjs screenshots. Not for visitors.
const anek = Anek_Bangla({ variable: "--font-anek", subsets: ["bengali", "latin"], weight: "variable", axes: ["wdth"] });

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function OgLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={anek.variable}>
      <body className="m-0 font-sans">{children}</body>
    </html>
  );
}
