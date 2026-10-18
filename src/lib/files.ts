// Browser file helpers: formatting, reading, and saving results.

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }
  return `${value.toFixed(value < 10 ? 1 : 0)} ${units[i]}`;
}

/** Swap a file name's extension, e.g. ("scan.pdf", "-merged.pdf") → "scan-merged.pdf". */
export function renameFile(name: string, suffix: string): string {
  const dot = name.lastIndexOf(".");
  const base = dot > 0 ? name.slice(0, dot) : name;
  return `${base}${suffix}`;
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export function downloadBytes(bytes: Uint8Array, filename: string, type: string): void {
  // Copy into a fresh ArrayBuffer so the Blob never sees a SharedArrayBuffer view.
  downloadBlob(new Blob([bytes.slice().buffer], { type }), filename);
}

export function downloadText(text: string, filename: string, type = "text/plain;charset=utf-8"): void {
  downloadBlob(new Blob([text], { type }), filename);
}

/** Zip several outputs into one download. */
export async function downloadZip(entries: { name: string; data: Blob | Uint8Array }[], filename: string): Promise<void> {
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();
  for (const e of entries) zip.file(e.name, e.data);
  downloadBlob(await zip.generateAsync({ type: "blob" }), filename);
}

export function readAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return file.arrayBuffer();
}

export function readAsDataURL(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

export function errorMessage(err: unknown, fallback = "Something went wrong."): string {
  if (err instanceof Error && err.message) {
    if (/encrypted/i.test(err.message)) return "This PDF is password-protected. Unlock it first, then try again.";
    return err.message;
  }
  return fallback;
}
