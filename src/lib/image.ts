// Canvas-based image helpers shared by the image tools.

export type ImageFormat = "image/jpeg" | "image/png" | "image/webp";

export const FORMAT_EXT: Record<ImageFormat, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

export function loadImage(file: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("This file couldn't be opened as an image."));
    };
    img.src = url;
  });
}

export function makeCanvas(width: number, height: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available in this browser.");
  ctx.imageSmoothingQuality = "high";
  return [canvas, ctx];
}

export function canvasToBlob(canvas: HTMLCanvasElement, type: ImageFormat, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    // JPEG has no alpha: paint white underneath so transparency doesn't turn black.
    if (type === "image/jpeg") {
      const [flat, ctx] = makeCanvas(canvas.width, canvas.height);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, flat.width, flat.height);
      ctx.drawImage(canvas, 0, 0);
      canvas = flat;
    }
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Couldn't encode the image."))), type, quality);
  });
}

/** Pick an output format that keeps the input's look (PNG stays PNG, everything else JPEG). */
export function sameFormatAs(file: File): ImageFormat {
  if (file.type === "image/png") return "image/png";
  if (file.type === "image/webp") return "image/webp";
  return "image/jpeg";
}
