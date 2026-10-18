"use client";

// Generated from registry.ts: one lazily loaded component per tool.

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

function Loading() {
  return <div className="ruled h-56 animate-pulse rounded-lg border border-rule bg-sheet" />;
}


export const TOOL_COMPONENTS: Record<string, ComponentType> = {
  "merge-pdf": dynamic(() => import("./impl/merge-pdf"), { ssr: false, loading: Loading }),
  "split-pdf": dynamic(() => import("./impl/split-pdf"), { ssr: false, loading: Loading }),
  "remove-pages": dynamic(() => import("./impl/remove-pages"), { ssr: false, loading: Loading }),
  "extract-pages": dynamic(() => import("./impl/extract-pages"), { ssr: false, loading: Loading }),
  "organize-pdf": dynamic(() => import("./impl/organize-pdf"), { ssr: false, loading: Loading }),
  "rotate-pdf": dynamic(() => import("./impl/rotate-pdf"), { ssr: false, loading: Loading }),
  "pages-per-sheet": dynamic(() => import("./impl/pages-per-sheet"), { ssr: false, loading: Loading }),
  "page-numbers": dynamic(() => import("./impl/page-numbers"), { ssr: false, loading: Loading }),
  "watermark-pdf": dynamic(() => import("./impl/watermark-pdf"), { ssr: false, loading: Loading }),
  "sign-pdf": dynamic(() => import("./impl/sign-pdf"), { ssr: false, loading: Loading }),
  "edit-metadata": dynamic(() => import("./impl/edit-metadata"), { ssr: false, loading: Loading }),
  "image-to-pdf": dynamic(() => import("./impl/image-to-pdf"), { ssr: false, loading: Loading }),
  "pdf-to-jpg": dynamic(() => import("./impl/pdf-to-jpg"), { ssr: false, loading: Loading }),
  "pdf-to-png": dynamic(() => import("./impl/pdf-to-png"), { ssr: false, loading: Loading }),
  "pdf-to-text": dynamic(() => import("./impl/pdf-to-text"), { ssr: false, loading: Loading }),
  "bangla-ocr": dynamic(() => import("./impl/bangla-ocr"), { ssr: false, loading: Loading }),
  "bijoy-to-unicode": dynamic(() => import("./impl/bijoy-to-unicode"), { ssr: false, loading: Loading }),
  "unicode-to-bijoy": dynamic(() => import("./impl/unicode-to-bijoy"), { ssr: false, loading: Loading }),
  "resize-image": dynamic(() => import("./impl/resize-image"), { ssr: false, loading: Loading }),
  "compress-image": dynamic(() => import("./impl/compress-image"), { ssr: false, loading: Loading }),
  "convert-image": dynamic(() => import("./impl/convert-image"), { ssr: false, loading: Loading }),
  "crop-image": dynamic(() => import("./impl/crop-image"), { ssr: false, loading: Loading }),
  "rotate-image": dynamic(() => import("./impl/rotate-image"), { ssr: false, loading: Loading }),
  "round-image": dynamic(() => import("./impl/round-image"), { ssr: false, loading: Loading }),
  "add-border": dynamic(() => import("./impl/add-border"), { ssr: false, loading: Loading }),
  "image-to-base64": dynamic(() => import("./impl/image-to-base64"), { ssr: false, loading: Loading }),
  "color-palette": dynamic(() => import("./impl/color-palette"), { ssr: false, loading: Loading }),
  "csv-to-json": dynamic(() => import("./impl/csv-to-json"), { ssr: false, loading: Loading }),
  "json-to-csv": dynamic(() => import("./impl/json-to-csv"), { ssr: false, loading: Loading }),
  "json-formatter": dynamic(() => import("./impl/json-formatter"), { ssr: false, loading: Loading }),
  "word-counter": dynamic(() => import("./impl/word-counter"), { ssr: false, loading: Loading }),
  "case-converter": dynamic(() => import("./impl/case-converter"), { ssr: false, loading: Loading }),
  "base64": dynamic(() => import("./impl/base64"), { ssr: false, loading: Loading }),
  "qr-code": dynamic(() => import("./impl/qr-code"), { ssr: false, loading: Loading }),
  "create-zip": dynamic(() => import("./impl/create-zip"), { ssr: false, loading: Loading }),
  "unzip": dynamic(() => import("./impl/unzip"), { ssr: false, loading: Loading }),
  "hash-generator": dynamic(() => import("./impl/hash-generator"), { ssr: false, loading: Loading }),
  "password-generator": dynamic(() => import("./impl/password-generator"), { ssr: false, loading: Loading }),
  "epoch-converter": dynamic(() => import("./impl/epoch-converter"), { ssr: false, loading: Loading }),
  "lorem-ipsum": dynamic(() => import("./impl/lorem-ipsum"), { ssr: false, loading: Loading }),
};
