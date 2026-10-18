// Single source of truth for every tool. Safe to import from server components:
// no React, no browser APIs. The UI for each tool lives in src/tools/impl/<slug>.tsx.

import type { Bi } from "@/i18n/locale";

export type FileKind = "pdf" | "image" | "csv" | "json" | "zip" | "text" | "any";

export type CategoryId = "organize" | "edit" | "convert" | "bangla" | "image" | "data" | "utility";

export interface Category {
  id: CategoryId;
  name: Bi;
  blurb: Bi;
}

export interface Tool {
  slug: string;
  name: Bi;
  blurb: Bi;
  category: CategoryId;
  /** File kinds this tool takes as input; drives the "drop a file" suggestions on the home page. */
  accepts: FileKind[];
  /** Extra search terms (either language). */
  keywords?: string[];
  featured?: boolean;
}

export const CATEGORIES: Category[] = [
  { id: "organize", name: { en: "Organize PDF", bn: "PDF সাজান" }, blurb: { en: "Merge, split and rearrange pages.", bn: "পৃষ্ঠা জোড়া, ভাগ আর সাজানোর কাজ।" } },
  { id: "edit", name: { en: "Edit PDF", bn: "PDF সম্পাদনা" }, blurb: { en: "Stamp, number, sign and tidy up.", bn: "নম্বর, সই, ওয়াটারমার্ক আর তথ্য।" } },
  { id: "convert", name: { en: "Convert", bn: "রূপান্তর" }, blurb: { en: "Move between PDF, images and text.", bn: "PDF, ছবি আর লেখার মধ্যে বদল।" } },
  { id: "bangla", name: { en: "Bangla", bn: "বাংলা" }, blurb: { en: "Bijoy, Unicode and Bangla OCR.", bn: "বিজয়, ইউনিকোড আর বাংলা OCR।" } },
  { id: "image", name: { en: "Image", bn: "ছবি" }, blurb: { en: "Resize, compress and touch up photos.", bn: "ছবির মাপ, সাইজ আর সাজসজ্জা।" } },
  { id: "data", name: { en: "Data & Text", bn: "ডেটা ও লেখা" }, blurb: { en: "Convert, format and count.", bn: "রূপান্তর, ফরম্যাট আর গণনা।" } },
  { id: "utility", name: { en: "Utilities", bn: "দরকারি টুল" }, blurb: { en: "Small helpers you reach for daily.", bn: "রোজকার ছোট ছোট কাজের সহায়ক।" } },
];

export const TOOLS: Tool[] = [
  // Organize
  { slug: "merge-pdf", name: { en: "Merge PDF", bn: "PDF একত্র করুন" }, blurb: { en: "Join several PDFs into one, in the order you choose.", bn: "একাধিক PDF আপনার পছন্দের ক্রমে এক ফাইলে জুড়ুন।" }, category: "organize", accepts: ["pdf"], keywords: ["combine", "join", "জোড়া"], featured: true },
  { slug: "split-pdf", name: { en: "Split PDF", bn: "PDF ভাগ করুন" }, blurb: { en: "Cut a PDF into ranges or single pages.", bn: "PDF-কে পৃষ্ঠা বা পৃষ্ঠার রেঞ্জ ধরে ভাগ করুন।" }, category: "organize", accepts: ["pdf"], keywords: ["separate", "range"], featured: true },
  { slug: "remove-pages", name: { en: "Remove pages", bn: "পৃষ্ঠা মুছুন" }, blurb: { en: "Delete the pages you don't need.", bn: "অপ্রয়োজনীয় পৃষ্ঠাগুলো বাদ দিন।" }, category: "organize", accepts: ["pdf"], keywords: ["delete"] },
  { slug: "extract-pages", name: { en: "Extract pages", bn: "পৃষ্ঠা আলাদা করুন" }, blurb: { en: "Pull chosen pages out into a new PDF.", bn: "বাছাই করা পৃষ্ঠা দিয়ে নতুন PDF বানান।" }, category: "organize", accepts: ["pdf"] },
  { slug: "organize-pdf", name: { en: "Organize PDF", bn: "PDF সাজান" }, blurb: { en: "Reorder, rotate and drop pages visually.", bn: "দেখে দেখে পৃষ্ঠা সাজান, ঘোরান বা বাদ দিন।" }, category: "organize", accepts: ["pdf"], keywords: ["reorder", "sort"], featured: true },
  { slug: "rotate-pdf", name: { en: "Rotate PDF", bn: "PDF ঘোরান" }, blurb: { en: "Turn every page, or just some, by 90°.", bn: "সব বা কিছু পৃষ্ঠা ৯০° করে ঘোরান।" }, category: "organize", accepts: ["pdf"] },
  { slug: "pages-per-sheet", name: { en: "Pages per sheet", bn: "এক শিটে একাধিক পৃষ্ঠা" }, blurb: { en: "Print 2, 4 or 6 pages on one sheet.", bn: "এক কাগজে ২, ৪ বা ৬টি পৃষ্ঠা প্রিন্ট করুন।" }, category: "organize", accepts: ["pdf"], keywords: ["n-up", "handout"] },

  // Edit
  { slug: "page-numbers", name: { en: "Page numbers", bn: "পৃষ্ঠা নম্বর" }, blurb: { en: "Add page numbers in Bangla or English digits.", bn: "বাংলা বা ইংরেজি অঙ্কে পৃষ্ঠা নম্বর বসান।" }, category: "edit", accepts: ["pdf"] },
  { slug: "watermark-pdf", name: { en: "Watermark", bn: "ওয়াটারমার্ক" }, blurb: { en: "Stamp text across every page.", bn: "প্রতিটি পৃষ্ঠায় লেখার ছাপ বসান।" }, category: "edit", accepts: ["pdf"], keywords: ["stamp", "confidential"] },
  { slug: "sign-pdf", name: { en: "Sign PDF", bn: "PDF-এ সই করুন" }, blurb: { en: "Draw your signature and place it on a page.", bn: "সই এঁকে পৃষ্ঠার যেকোনো জায়গায় বসান।" }, category: "edit", accepts: ["pdf"], keywords: ["signature", "স্বাক্ষর"], featured: true },
  { slug: "edit-metadata", name: { en: "Edit metadata", bn: "মেটাডেটা বদলান" }, blurb: { en: "Change title, author, subject and keywords.", bn: "শিরোনাম, লেখক, বিষয় আর কিওয়ার্ড বদলান।" }, category: "edit", accepts: ["pdf"] },

  // Convert
  { slug: "image-to-pdf", name: { en: "Image to PDF", bn: "ছবি থেকে PDF" }, blurb: { en: "Turn photos and scans into a single PDF.", bn: "ছবি ও স্ক্যান মিলিয়ে একটি PDF বানান।" }, category: "convert", accepts: ["image"], keywords: ["jpg to pdf", "png to pdf"], featured: true },
  { slug: "pdf-to-jpg", name: { en: "PDF to JPG", bn: "PDF থেকে JPG" }, blurb: { en: "Save every page as a JPG image.", bn: "প্রতিটি পৃষ্ঠা JPG ছবি হিসেবে রাখুন।" }, category: "convert", accepts: ["pdf"], featured: true },
  { slug: "pdf-to-png", name: { en: "PDF to PNG", bn: "PDF থেকে PNG" }, blurb: { en: "Save every page as a lossless PNG.", bn: "প্রতিটি পৃষ্ঠা মান না হারিয়ে PNG হিসেবে রাখুন।" }, category: "convert", accepts: ["pdf"] },
  { slug: "pdf-to-text", name: { en: "PDF to Text", bn: "PDF থেকে লেখা" }, blurb: { en: "Pull the text layer out of a PDF.", bn: "PDF-এর ভেতরের লেখা বের করে আনুন।" }, category: "convert", accepts: ["pdf"], keywords: ["extract text"] },

  // Bangla
  { slug: "bangla-ocr", name: { en: "Bangla OCR", bn: "বাংলা OCR" }, blurb: { en: "Read Bangla and English text from scans and photos.", bn: "স্ক্যান বা ছবি থেকে বাংলা ও ইংরেজি লেখা পড়ুন।" }, category: "bangla", accepts: ["image", "pdf"], keywords: ["ocr", "scan", "image to text", "লেখা বের"], featured: true },
  { slug: "bijoy-to-unicode", name: { en: "Bijoy → Unicode", bn: "বিজয় → ইউনিকোড" }, blurb: { en: "Fix garbled SutonnyMJ text like “Avwg” into real Bangla.", bn: "“Avwg”-এর মতো ভাঙা সুতনিএমজে লেখাকে আসল বাংলায় আনুন।" }, category: "bangla", accepts: ["text"], keywords: ["sutonny", "convert", "বিজয়"], featured: true },
  { slug: "unicode-to-bijoy", name: { en: "Unicode → Bijoy", bn: "ইউনিকোড → বিজয়" }, blurb: { en: "Turn Unicode Bangla into Bijoy for press and DTP.", bn: "প্রেস ও ডিটিপির জন্য ইউনিকোডকে বিজয়ে রূপান্তর করুন।" }, category: "bangla", accepts: ["text"], keywords: ["sutonny", "বিজয়"] },

  // Image
  { slug: "resize-image", name: { en: "Resize image", bn: "ছবির মাপ বদলান" }, blurb: { en: "Set exact width and height, or scale by percent.", bn: "নির্দিষ্ট দৈর্ঘ্য-প্রস্থ বা শতাংশে মাপ বদলান।" }, category: "image", accepts: ["image"] },
  { slug: "compress-image", name: { en: "Compress image", bn: "ছবি ছোট করুন" }, blurb: { en: "Shrink photos with a quality slider.", bn: "মান ঠিক রেখে ছবির ফাইল সাইজ কমান।" }, category: "image", accepts: ["image"] },
  { slug: "convert-image", name: { en: "Convert image", bn: "ছবির ফরম্যাট বদলান" }, blurb: { en: "Switch between JPG, PNG and WebP.", bn: "JPG, PNG আর WebP-এর মধ্যে বদল করুন।" }, category: "image", accepts: ["image"] },
  { slug: "crop-image", name: { en: "Crop image", bn: "ছবি ক্রপ করুন" }, blurb: { en: "Drag to keep only the part you want.", bn: "টেনে শুধু দরকারি অংশটুকু রাখুন।" }, category: "image", accepts: ["image"] },
  { slug: "rotate-image", name: { en: "Rotate & flip", bn: "ছবি ঘোরান ও উল্টান" }, blurb: { en: "Turn or mirror a photo.", bn: "ছবি ঘোরান বা আয়নার মতো উল্টে দিন।" }, category: "image", accepts: ["image"] },
  { slug: "round-image", name: { en: "Round corners", bn: "গোল কোণা" }, blurb: { en: "Soft corners or a perfect circle.", bn: "নরম কোণা বা পুরো গোল ছবি।" }, category: "image", accepts: ["image"] },
  { slug: "add-border", name: { en: "Add border", bn: "বর্ডার যোগ করুন" }, blurb: { en: "Frame a photo with a solid border.", bn: "ছবির চারপাশে রঙিন বর্ডার দিন।" }, category: "image", accepts: ["image"] },
  { slug: "image-to-base64", name: { en: "Image to Base64", bn: "ছবি থেকে Base64" }, blurb: { en: "Get a data URI to paste into code.", bn: "কোডে বসানোর জন্য data URI নিন।" }, category: "image", accepts: ["image"] },
  { slug: "color-palette", name: { en: "Colour palette", bn: "রঙের প্যালেট" }, blurb: { en: "Pick colours and pull a palette from a photo.", bn: "ছবি থেকে রং বাছুন আর প্যালেট বানান।" }, category: "image", accepts: ["image"], keywords: ["color picker"] },

  // Data & text
  { slug: "csv-to-json", name: { en: "CSV to JSON", bn: "CSV থেকে JSON" }, blurb: { en: "Turn a spreadsheet export into JSON.", bn: "স্প্রেডশিটের ডেটাকে JSON-এ রূপান্তর করুন।" }, category: "data", accepts: ["csv"] },
  { slug: "json-to-csv", name: { en: "JSON to CSV", bn: "JSON থেকে CSV" }, blurb: { en: "Flatten a JSON array into CSV.", bn: "JSON অ্যারেকে CSV টেবিলে রূপান্তর করুন।" }, category: "data", accepts: ["json"] },
  { slug: "json-formatter", name: { en: "JSON formatter", bn: "JSON ফরম্যাটার" }, blurb: { en: "Pretty-print, minify and validate JSON.", bn: "JSON সাজান, ছোট করুন ও যাচাই করুন।" }, category: "data", accepts: ["json"] },
  { slug: "word-counter", name: { en: "Word counter", bn: "শব্দ গণনা" }, blurb: { en: "Words, characters and reading time, Bangla aware.", bn: "শব্দ, অক্ষর আর পড়ার সময়, বাংলাসহ।" }, category: "data", accepts: ["text"] },
  { slug: "case-converter", name: { en: "Case converter", bn: "কেস কনভার্টার" }, blurb: { en: "UPPER, lower, Title, camelCase and more.", bn: "UPPER, lower, Title, camelCase সহ আরও।" }, category: "data", accepts: ["text"] },
  { slug: "base64", name: { en: "Base64 encode/decode", bn: "Base64 এনকোড/ডিকোড" }, blurb: { en: "Encode or decode text, Unicode safe.", bn: "লেখা এনকোড বা ডিকোড করুন, বাংলাসহ।" }, category: "data", accepts: ["text"] },

  // Utilities
  { slug: "qr-code", name: { en: "QR code generator", bn: "QR কোড তৈরি" }, blurb: { en: "Make a QR code for a link or text.", bn: "লিংক বা লেখার জন্য QR কোড বানান।" }, category: "utility", accepts: ["text"] },
  { slug: "create-zip", name: { en: "Create ZIP", bn: "ZIP বানান" }, blurb: { en: "Bundle files into one ZIP archive.", bn: "অনেক ফাইল একটি ZIP-এ ভরুন।" }, category: "utility", accepts: ["any"] },
  { slug: "unzip", name: { en: "Unzip files", bn: "ZIP খুলুন" }, blurb: { en: "Open a ZIP and download what's inside.", bn: "ZIP খুলে ভেতরের ফাইল নামান।" }, category: "utility", accepts: ["zip"] },
  { slug: "hash-generator", name: { en: "Hash generator", bn: "হ্যাশ তৈরি" }, blurb: { en: "SHA-1, SHA-256 and SHA-512 of text or files.", bn: "লেখা বা ফাইলের SHA-1, SHA-256, SHA-512।" }, category: "utility", accepts: ["any"], keywords: ["checksum"] },
  { slug: "password-generator", name: { en: "Password generator", bn: "পাসওয়ার্ড তৈরি" }, blurb: { en: "Strong random passwords, made on your device.", bn: "আপনার ডিভাইসেই শক্তিশালী পাসওয়ার্ড তৈরি।" }, category: "utility", accepts: [] },
  { slug: "epoch-converter", name: { en: "Epoch converter", bn: "ইপক কনভার্টার" }, blurb: { en: "Unix timestamps to dates and back.", bn: "ইউনিক্স টাইমস্ট্যাম্প থেকে তারিখ, আবার উল্টোটাও।" }, category: "utility", accepts: [], keywords: ["timestamp"] },
  { slug: "lorem-ipsum", name: { en: "Lorem ipsum", bn: "ডামি লেখা" }, blurb: { en: "Placeholder text in English or Bangla.", bn: "ইংরেজি বা বাংলায় নমুনা লেখা।" }, category: "utility", accepts: [], keywords: ["dummy text", "lorem"] },
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
