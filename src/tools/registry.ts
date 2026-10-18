// Single source of truth for every tool. Safe to import from server components:
// no React, no browser APIs. The UI for each tool lives in src/tools/impl/<slug>.tsx.

export type FileKind = "pdf" | "image" | "csv" | "json" | "zip" | "text" | "any";

export type CategoryId = "organize" | "edit" | "convert" | "bangla" | "image" | "data" | "utility";

export interface Category {
  id: CategoryId;
  name: string;
  nameBn: string;
  blurb: string;
}

export interface Tool {
  slug: string;
  name: string;
  blurb: string;
  category: CategoryId;
  /** File kinds this tool takes as input; drives the "drop a file" suggestions on the home page. */
  accepts: FileKind[];
  keywords?: string[];
  featured?: boolean;
}

export const CATEGORIES: Category[] = [
  { id: "organize", name: "Organize PDF", nameBn: "সাজানো", blurb: "Merge, split and rearrange pages." },
  { id: "edit", name: "Edit PDF", nameBn: "সম্পাদনা", blurb: "Stamp, number, sign and tidy up." },
  { id: "convert", name: "Convert", nameBn: "রূপান্তর", blurb: "Move between PDF, images and text." },
  { id: "bangla", name: "Bangla", nameBn: "বাংলা", blurb: "Bijoy, Unicode and Bangla OCR." },
  { id: "image", name: "Image", nameBn: "ছবি", blurb: "Resize, compress and touch up photos." },
  { id: "data", name: "Data & Text", nameBn: "ডেটা ও লেখা", blurb: "Convert, format and count." },
  { id: "utility", name: "Utilities", nameBn: "টুলস", blurb: "Small helpers you reach for daily." },
];

export const TOOLS: Tool[] = [
  // Organize
  { slug: "merge-pdf", name: "Merge PDF", blurb: "Join several PDFs into one, in the order you choose.", category: "organize", accepts: ["pdf"], keywords: ["combine", "join"], featured: true },
  { slug: "split-pdf", name: "Split PDF", blurb: "Cut a PDF into ranges or single pages.", category: "organize", accepts: ["pdf"], keywords: ["separate", "range"], featured: true },
  { slug: "remove-pages", name: "Remove pages", blurb: "Delete the pages you don't need.", category: "organize", accepts: ["pdf"], keywords: ["delete"] },
  { slug: "extract-pages", name: "Extract pages", blurb: "Pull chosen pages out into a new PDF.", category: "organize", accepts: ["pdf"] },
  { slug: "organize-pdf", name: "Organize PDF", blurb: "Reorder, rotate and drop pages visually.", category: "organize", accepts: ["pdf"], keywords: ["reorder", "sort"], featured: true },
  { slug: "rotate-pdf", name: "Rotate PDF", blurb: "Turn every page, or just some, by 90°.", category: "organize", accepts: ["pdf"] },
  { slug: "pages-per-sheet", name: "Pages per sheet", blurb: "Print 2, 4 or 6 pages on one sheet.", category: "organize", accepts: ["pdf"], keywords: ["n-up", "handout"] },

  // Edit
  { slug: "page-numbers", name: "Page numbers", blurb: "Add page numbers in Bangla or English digits.", category: "edit", accepts: ["pdf"] },
  { slug: "watermark-pdf", name: "Watermark", blurb: "Stamp text across every page.", category: "edit", accepts: ["pdf"], keywords: ["stamp", "confidential"] },
  { slug: "sign-pdf", name: "Sign PDF", blurb: "Draw your signature and place it on a page.", category: "edit", accepts: ["pdf"], keywords: ["signature"], featured: true },
  { slug: "edit-metadata", name: "Edit metadata", blurb: "Change title, author, subject and keywords.", category: "edit", accepts: ["pdf"] },

  // Convert
  { slug: "image-to-pdf", name: "Image to PDF", blurb: "Turn photos and scans into a single PDF.", category: "convert", accepts: ["image"], keywords: ["jpg to pdf", "png to pdf"], featured: true },
  { slug: "pdf-to-jpg", name: "PDF to JPG", blurb: "Save every page as a JPG image.", category: "convert", accepts: ["pdf"], featured: true },
  { slug: "pdf-to-png", name: "PDF to PNG", blurb: "Save every page as a lossless PNG.", category: "convert", accepts: ["pdf"] },
  { slug: "pdf-to-text", name: "PDF to Text", blurb: "Pull the text layer out of a PDF.", category: "convert", accepts: ["pdf"], keywords: ["extract text"] },

  // Bangla
  { slug: "bangla-ocr", name: "Bangla OCR", blurb: "Read Bangla and English text from scans and photos.", category: "bangla", accepts: ["image", "pdf"], keywords: ["ocr", "scan", "image to text"], featured: true },
  { slug: "bijoy-to-unicode", name: "Bijoy → Unicode", blurb: "Fix garbled SutonnyMJ text like “Avwg” into real Bangla.", category: "bangla", accepts: ["text"], keywords: ["sutonny", "convert"], featured: true },
  { slug: "unicode-to-bijoy", name: "Unicode → Bijoy", blurb: "Turn Unicode Bangla into Bijoy for press and DTP.", category: "bangla", accepts: ["text"], keywords: ["sutonny"] },

  // Image
  { slug: "resize-image", name: "Resize image", blurb: "Set exact width and height, or scale by percent.", category: "image", accepts: ["image"], featured: true },
  { slug: "compress-image", name: "Compress image", blurb: "Shrink photos with a quality slider.", category: "image", accepts: ["image"] },
  { slug: "convert-image", name: "Convert image", blurb: "Switch between JPG, PNG and WebP.", category: "image", accepts: ["image"] },
  { slug: "crop-image", name: "Crop image", blurb: "Drag to keep only the part you want.", category: "image", accepts: ["image"] },
  { slug: "rotate-image", name: "Rotate & flip", blurb: "Turn or mirror a photo.", category: "image", accepts: ["image"] },
  { slug: "round-image", name: "Round corners", blurb: "Soft corners or a perfect circle.", category: "image", accepts: ["image"] },
  { slug: "add-border", name: "Add border", blurb: "Frame a photo with a solid border.", category: "image", accepts: ["image"] },
  { slug: "image-to-base64", name: "Image to Base64", blurb: "Get a data URI to paste into code.", category: "image", accepts: ["image"] },
  { slug: "color-palette", name: "Colour palette", blurb: "Pick colours and pull a palette from a photo.", category: "image", accepts: ["image"], keywords: ["color picker"] },

  // Data & text
  { slug: "csv-to-json", name: "CSV to JSON", blurb: "Turn a spreadsheet export into JSON.", category: "data", accepts: ["csv"] },
  { slug: "json-to-csv", name: "JSON to CSV", blurb: "Flatten a JSON array into CSV.", category: "data", accepts: ["json"] },
  { slug: "json-formatter", name: "JSON formatter", blurb: "Pretty-print, minify and validate JSON.", category: "data", accepts: ["json"] },
  { slug: "word-counter", name: "Word counter", blurb: "Words, characters and reading time, Bangla aware.", category: "data", accepts: ["text"] },
  { slug: "case-converter", name: "Case converter", blurb: "UPPER, lower, Title, camelCase and more.", category: "data", accepts: ["text"] },
  { slug: "base64", name: "Base64 encode/decode", blurb: "Encode or decode text, Unicode safe.", category: "data", accepts: ["text"] },

  // Utilities
  { slug: "qr-code", name: "QR code generator", blurb: "Make a QR code for a link or text.", category: "utility", accepts: ["text"], featured: true },
  { slug: "create-zip", name: "Create ZIP", blurb: "Bundle files into one ZIP archive.", category: "utility", accepts: ["any"] },
  { slug: "unzip", name: "Unzip files", blurb: "Open a ZIP and download what's inside.", category: "utility", accepts: ["zip"] },
  { slug: "hash-generator", name: "Hash generator", blurb: "SHA-1, SHA-256 and SHA-512 of text or files.", category: "utility", accepts: ["any"], keywords: ["checksum"] },
  { slug: "password-generator", name: "Password generator", blurb: "Strong random passwords, made on your device.", category: "utility", accepts: [] },
  { slug: "epoch-converter", name: "Epoch converter", blurb: "Unix timestamps to dates and back.", category: "utility", accepts: [], keywords: ["timestamp"] },
  { slug: "lorem-ipsum", name: "Lorem ipsum", blurb: "Placeholder text in English or Bangla.", category: "utility", accepts: [], keywords: ["dummy text"] },
];

export function getTool(slug: string): Tool | undefined {
  return TOOLS.find((t) => t.slug === slug);
}

export function getCategory(id: CategoryId): Category {
  const found = CATEGORIES.find((c) => c.id === id);
  if (!found) throw new Error(`Unknown category ${id}`);
  return found;
}

export function toolsIn(id: CategoryId): Tool[] {
  return TOOLS.filter((t) => t.category === id);
}

export function fileKindOf(file: File): FileKind {
  const name = file.name.toLowerCase();
  if (file.type === "application/pdf" || name.endsWith(".pdf")) return "pdf";
  if (file.type.startsWith("image/")) return "image";
  if (name.endsWith(".csv")) return "csv";
  if (name.endsWith(".json")) return "json";
  if (name.endsWith(".zip")) return "zip";
  if (file.type.startsWith("text/") || name.endsWith(".txt") || name.endsWith(".md")) return "text";
  return "any";
}
