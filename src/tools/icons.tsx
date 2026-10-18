// Icon and colour per tool/category. Kept apart from registry.ts so the registry stays React-free.

import {
  Archive,
  Binary,
  Braces,
  CaseSensitive,
  Circle,
  Clock,
  Crop,
  FileImage,
  FileJson,
  FileMinus,
  FileOutput,
  FilePen,
  FileText,
  Files,
  FlipHorizontal2,
  Frame,
  Grid2x2,
  Hash,
  Image as ImageIcon,
  ImagePlus,
  KeyRound,
  Languages,
  LayoutGrid,
  ListOrdered,
  Maximize2,
  Minimize2,
  PackageOpen,
  Palette,
  Pilcrow,
  QrCode,
  Repeat,
  RotateCw,
  ScanText,
  Scissors,
  Signature,
  Stamp,
  Table,
  Text,
  Type,
  type LucideIcon,
} from "lucide-react";
import type { CategoryId } from "@/tools/registry";

export const TOOL_ICONS: Record<string, LucideIcon> = {
  "merge-pdf": Files,
  "split-pdf": Scissors,
  "remove-pages": FileMinus,
  "extract-pages": FileOutput,
  "organize-pdf": LayoutGrid,
  "rotate-pdf": RotateCw,
  "pages-per-sheet": Grid2x2,
  "page-numbers": ListOrdered,
  "watermark-pdf": Stamp,
  "sign-pdf": Signature,
  "edit-metadata": FilePen,
  "image-to-pdf": ImagePlus,
  "pdf-to-jpg": FileImage,
  "pdf-to-png": ImageIcon,
  "pdf-to-text": FileText,
  "bangla-ocr": ScanText,
  "bijoy-to-unicode": Languages,
  "unicode-to-bijoy": Type,
  "resize-image": Maximize2,
  "compress-image": Minimize2,
  "convert-image": Repeat,
  "crop-image": Crop,
  "rotate-image": FlipHorizontal2,
  "round-image": Circle,
  "add-border": Frame,
  "image-to-base64": Binary,
  "color-palette": Palette,
  "csv-to-json": Braces,
  "json-to-csv": Table,
  "json-formatter": FileJson,
  "word-counter": Pilcrow,
  "case-converter": CaseSensitive,
  base64: Text,
  "qr-code": QrCode,
  "create-zip": Archive,
  unzip: PackageOpen,
  "hash-generator": Hash,
  "password-generator": KeyRound,
  "epoch-converter": Clock,
  "lorem-ipsum": Text,
};

/** CSS colour for a category; drives icon tiles so tools of a kind read as a family. */
export const CATEGORY_COLOR: Record<CategoryId, string> = {
  organize: "var(--cat-organize)",
  edit: "var(--cat-edit)",
  convert: "var(--cat-convert)",
  bangla: "var(--cat-bangla)",
  image: "var(--cat-image)",
  data: "var(--cat-data)",
  utility: "var(--cat-utility)",
};

export function ToolIcon({ slug, category, size = "md" }: { slug: string; category: CategoryId; size?: "sm" | "md" | "lg" }) {
  const Icon = TOOL_ICONS[slug] ?? FileText;
  const box = { sm: "size-8 rounded-lg", md: "size-11 rounded-xl", lg: "size-14 rounded-2xl" }[size];
  const glyph = { sm: "size-4", md: "size-5", lg: "size-7" }[size];
  const color = CATEGORY_COLOR[category];
  return (
    <span
      aria-hidden
      className={`grid shrink-0 place-items-center ${box}`}
      style={{ color, backgroundColor: `color-mix(in srgb, ${color} 13%, transparent)` }}
    >
      <Icon className={glyph} strokeWidth={1.9} />
    </span>
  );
}
