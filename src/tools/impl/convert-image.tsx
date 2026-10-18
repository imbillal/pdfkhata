"use client";

import { useState } from "react";
import { useT } from "@/i18n/LocaleProvider";
import type { ImageFormat } from "@/lib/image";
import {
  BatchImageTool,
  FormatPicker,
  QualityField,
  drawScaled,
  encodeCanvas,
  hasTransparency,
  isLossy,
  outputName,
} from "@/tools/shared/imageKit";

interface Settings {
  format: ImageFormat;
  quality: number;
}

export default function ConvertImage() {
  const t = useT();
  const [s, setS] = useState<Settings>({ format: "image/jpeg", quality: 0.92 });
  const set = (p: Partial<Settings>) => setS((prev) => ({ ...prev, ...p }));

  return (
    <BatchImageTool
      hint={t({
        en: "JPG, PNG, WebP, GIF, BMP, AVIF, SVG. HEIC only where the browser can open it (Safari).",
        bn: "JPG, PNG, WebP, GIF, BMP, AVIF, SVG। HEIC শুধু যে ব্রাউজার খুলতে পারে সেখানে (Safari)।",
      })}
      actionLabel={t({ en: "Convert images", bn: "ছবি রূপান্তর করুন" })}
      zipName="converted-images.zip"
      settingsKey={JSON.stringify(s)}
      options={() => (
        <>
          <FormatPicker<ImageFormat> value={s.format} onChange={(format) => set({ format })} choices={["image/jpeg", "image/png", "image/webp"]} />
          {isLossy(s.format) ? (
            <QualityField value={s.quality} onChange={(quality) => set({ quality })} />
          ) : (
            <p className="text-xs text-ink-3">{t({ en: "PNG is lossless and keeps transparency.", bn: "PNG-তে মান কমে না এবং স্বচ্ছতা থাকে।" })}</p>
          )}
          {s.format === "image/jpeg" && (
            <p className="text-xs text-ink-3">{t({ en: "JPG has no transparency; see-through areas turn white.", bn: "JPG-তে স্বচ্ছতা থাকে না; স্বচ্ছ অংশ সাদা হয়ে যাবে।" })}</p>
          )}
        </>
      )}
      process={async (file, img) => {
        const canvas = drawScaled(img, img.width, img.height);
        const blob = await encodeCanvas(canvas, s.format, isLossy(s.format) ? s.quality : undefined);
        const lostAlpha = s.format === "image/jpeg" && file.type !== "image/jpeg" && hasTransparency(img);
        const gif = file.type === "image/gif";
        return {
          blob,
          name: outputName(file, s.format),
          width: img.width,
          height: img.height,
          note: lostAlpha
            ? { en: "Transparent areas were filled with white.", bn: "স্বচ্ছ অংশ সাদা করা হয়েছে।" }
            : gif
              ? { en: "Animated GIFs keep only the first frame.", bn: "অ্যানিমেটেড GIF-এর শুধু প্রথম ফ্রেম থাকে।" }
              : undefined,
        };
      }}
    />
  );
}
