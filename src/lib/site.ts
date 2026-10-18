// Site-wide constants used by metadata, the sitemap and structured data.

export const SITE_URL = "https://pdfkhata.billal.dev";
export const SITE_NAME = "PDFKhata";
export const REPO_URL = "https://github.com/imbillal/pdfkhata";

/** Absolute URL for an app path ("/en/tools/" → "https://…/en/tools/"). */
export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}
