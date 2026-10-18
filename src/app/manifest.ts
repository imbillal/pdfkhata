import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PDFKhata: free PDF & Bangla document tools",
    short_name: "PDFKhata",
    description: "Free PDF, image and Bangla tools that run in your browser. Files never leave your device.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f6fa",
    theme_color: "#1a2f7d",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
