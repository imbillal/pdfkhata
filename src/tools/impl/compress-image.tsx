"use client";

import { useState } from "react";
import { Field, inputClass } from "@/components/kit";
import { useT } from "@/i18n/LocaleProvider";
import type { ImageFormat } from "@/lib/image";
import {
  BatchImageTool,
  FormatPicker,
  QualityField,
  drawScaled,
  encodeCanvas,
  hasTransparency,
  outputName,
} from "@/tools/shared/imageKit";

type Lossy = Extract<ImageFormat, "image/jpeg" | "image/webp">;

interface Settings {
  quality: number;
  maxWidth: string;
  format: Lossy;
}

export default function CompressImage() {
  const t = useT();
  const [s, setS] = useState<Settings>({ quality: 0.75, maxWidth: "", format: "image/jpeg" });
  const set = (p: Partial<Settings>) => setS((prev) => ({ ...prev, ...p }));
  const maxW = Math.round(Number(s.maxWidth)) > 0 ? Math.round(Number(s.maxWidth)) : 0;

  return (
    <BatchImageTool
      hint={t({ en: "Photos, screenshots, PNGs. Everything stays on your device.", bn: "ফটো, স্ক্রিনশট, PNG। সবকিছু আপনার ডিভাইসেই থাকে।" })}
      actionLabel={t({ en: "Compress images", bn: "ছবি ছোট করুন" })}
      zipName="compressed-images.zip"
      settingsKey={JSON.stringify(s)}
      options={(items) => (
        <>
          <QualityField
            value={s.quality}
            onChange={(quality) => set({ quality })}
            hint={t({ en: "60–80% is a good balance for photos.", bn: "ফটোর জন্য ৬০–৮০% ভালো ভারসাম্য।" })}
          />
          <Field
            label={t({ en: "Max width (px, optional)", bn: "সর্বোচ্চ প্রস্থ (পিক্সেল, ঐচ্ছিক)" })}
            hint={t({ en: "Wider images are scaled down. Leave blank to keep size.", bn: "এর চেয়ে চওড়া ছবি ছোট করা হবে। মাপ না বদলাতে খালি রাখুন।" })}
          >
            {(id) => (
              <input
                id={id}
                type="number"
                min={1}
                inputMode="numeric"
                className={inputClass}
                value={s.maxWidth}
                placeholder={t({ en: "e.g. 1920", bn: "যেমন ১৯২০" })}
                onChange={(e) => set({ maxWidth: e.target.value })}
              />
            )}
          </Field>
          <FormatPicker<Lossy> value={s.format} onChange={(format) => set({ format })} choices={["image/jpeg", "image/webp"]} />
          {s.format === "image/jpeg" && items.some((it) => it.file.type === "image/png" || it.file.type === "image/gif") && (
            <p className="text-xs text-ink-3">
              {t({
                en: "PNG with transparency? Choose WebP to keep it. JPG fills transparent areas with white.",
                bn: "PNG-তে স্বচ্ছ অংশ আছে? সেটা রাখতে WebP বেছে নিন। JPG স্বচ্ছ অংশ সাদা করে দেয়।",
              })}
            </p>
          )}
        </>
      )}
      process={async (file, img) => {
        let w = img.width;
        let h = img.height;
        if (maxW && w > maxW) {
          h = Math.max(1, Math.round((h * maxW) / w));
          w = maxW;
        }
        const canvas = drawScaled(img, w, h);
        const blob = await encodeCanvas(canvas, s.format, s.quality);
        if (blob.size >= file.size) {
          return {
            blob: file,
            name: file.name,
            width: img.width,
            height: img.height,
            warn: true,
            note: {
              en: `Compressed version was bigger (${Math.round(blob.size / 1024)} KB), so the original is kept.`,
              bn: `ছোট করা সংস্করণ বড় হয়ে গেছে (${t.n(Math.round(blob.size / 1024))} KB), তাই আসল ফাইলটাই রাখা হলো।`,
            },
          };
        }
        const lostAlpha = s.format === "image/jpeg" && file.type !== "image/jpeg" && hasTransparency(img);
        return {
          blob,
          name: outputName(file, s.format, "-compressed"),
          width: w,
          height: h,
          warn: lostAlpha,
          note: lostAlpha
            ? { en: "Transparency was filled with white. Use WebP to keep it.", bn: "স্বচ্ছ অংশ সাদা হয়ে গেছে। রাখতে চাইলে WebP ব্যবহার করুন।" }
            : undefined,
        };
      }}
    />
  );
}
