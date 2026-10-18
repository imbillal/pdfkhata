"use client";

import { useState } from "react";
import { Field, Segmented, inputClass } from "@/components/kit";
import { useT } from "@/i18n/LocaleProvider";
import { sameFormatAs } from "@/lib/image";
import {
  BatchImageTool,
  Check,
  FormatPicker,
  RangeField,
  drawScaled,
  encodeCanvas,
  isLossy,
  outputName,
  type FormatChoice,
  type ImageItem,
} from "@/tools/shared/imageKit";

type Mode = "pixels" | "percent";

interface Settings {
  mode: Mode;
  width: string;
  height: string;
  keepRatio: boolean;
  noUpscale: boolean;
  percent: number;
  format: FormatChoice;
}

function parseSize(value: string): number {
  const n = Math.round(Number(value));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/** Target size for one image under the current settings. */
function targetSize(w: number, h: number, s: Settings): [number, number] {
  let tw: number;
  let th: number;
  if (s.mode === "percent") {
    tw = (w * s.percent) / 100;
    th = (h * s.percent) / 100;
  } else {
    const W = parseSize(s.width);
    const H = parseSize(s.height);
    if (!W && !H) return [w, h];
    if (s.keepRatio) {
      // Fit inside W × H without stretching (either side may be left blank).
      const k = Math.min(W ? W / w : Infinity, H ? H / h : Infinity);
      tw = w * k;
      th = h * k;
    } else {
      tw = W || w;
      th = H || h;
    }
  }
  if (s.noUpscale && (tw > w || th > h)) {
    const k = Math.min(w / tw, h / th);
    tw *= k;
    th *= k;
  }
  return [Math.max(1, Math.round(tw)), Math.max(1, Math.round(th))];
}

export default function ResizeImage() {
  const t = useT();
  const [s, setS] = useState<Settings>({
    mode: "pixels",
    width: "",
    height: "",
    keepRatio: true,
    noUpscale: false,
    percent: 50,
    format: "same",
  });
  const set = (p: Partial<Settings>) => setS((prev) => ({ ...prev, ...p }));

  const options = (items: ImageItem[]) => {
    const ref = items.find((it) => it.width && it.height);
    const ratio = ref?.width && ref.height ? ref.width / ref.height : null;
    const onWidth = (v: string) => {
      const W = parseSize(v);
      set(s.keepRatio && ratio && W ? { width: v, height: String(Math.round(W / ratio)) } : { width: v });
    };
    const onHeight = (v: string) => {
      const H = parseSize(v);
      set(s.keepRatio && ratio && H ? { height: v, width: String(Math.round(H * ratio)) } : { height: v });
    };
    const preview = ref?.width && ref.height ? targetSize(ref.width, ref.height, s) : null;

    return (
      <>
        <Segmented
          label={t({ en: "Resize by", bn: "যেভাবে মাপ বদলাবেন" })}
          value={s.mode}
          onChange={(mode) => set({ mode })}
          options={[
            { value: "pixels", label: t({ en: "Pixels", bn: "পিক্সেল" }) },
            { value: "percent", label: t({ en: "Percent", bn: "শতাংশ" }) },
          ]}
        />
        {s.mode === "pixels" ? (
          <>
            <div className="grid grid-cols-2 gap-2">
              <Field label={t({ en: "Width (px)", bn: "প্রস্থ (পিক্সেল)" })}>
                {(id) => (
                  <input
                    id={id}
                    type="number"
                    min={1}
                    inputMode="numeric"
                    className={inputClass}
                    value={s.width}
                    placeholder={ref?.width ? String(ref.width) : t({ en: "auto", bn: "অটো" })}
                    onChange={(e) => onWidth(e.target.value)}
                  />
                )}
              </Field>
              <Field label={t({ en: "Height (px)", bn: "উচ্চতা (পিক্সেল)" })}>
                {(id) => (
                  <input
                    id={id}
                    type="number"
                    min={1}
                    inputMode="numeric"
                    className={inputClass}
                    value={s.height}
                    placeholder={ref?.height ? String(ref.height) : t({ en: "auto", bn: "অটো" })}
                    onChange={(e) => onHeight(e.target.value)}
                  />
                )}
              </Field>
            </div>
            <Check checked={s.keepRatio} onChange={(keepRatio) => set({ keepRatio })} label={t({ en: "Keep aspect ratio", bn: "অনুপাত ঠিক রাখুন" })} />
            {s.keepRatio && items.length > 1 && (
              <p className="text-xs text-ink-3">
                {t({
                  en: "Each image fits inside this box without stretching.",
                  bn: "প্রতিটি ছবি না টেনে এই মাপের মধ্যে বসবে।",
                })}
              </p>
            )}
          </>
        ) : (
          <RangeField
            label={t({ en: "Scale", bn: "মাপ" })}
            value={s.percent}
            min={1}
            max={200}
            display={`${t.n(s.percent)}%`}
            onChange={(percent) => set({ percent })}
          />
        )}
        <Check checked={s.noUpscale} onChange={(noUpscale) => set({ noUpscale })} label={t({ en: "Don't enlarge smaller images", bn: "ছোট ছবি বড় করবেন না" })} />
        <FormatPicker<FormatChoice>
          value={s.format}
          onChange={(format) => set({ format })}
          choices={["same", "image/jpeg", "image/png", "image/webp"]}
        />
        {preview && ref?.width && ref.height && (
          <p className="text-xs text-ink-3">
            {t({ en: "First image", bn: "প্রথম ছবি" })}: {t.n(ref.width)} × {t.n(ref.height)} → {t.n(preview[0])} × {t.n(preview[1])} px
          </p>
        )}
      </>
    );
  };

  return (
    <BatchImageTool
      hint={t({ en: "JPG, PNG, WebP and more. Add as many as you like.", bn: "JPG, PNG, WebP ইত্যাদি। যত খুশি ছবি দিন।" })}
      actionLabel={t({ en: "Resize images", bn: "ছবির মাপ বদলান" })}
      zipName="resized-images.zip"
      settingsKey={JSON.stringify(s)}
      options={options}
      process={async (file, img) => {
        const [w, h] = targetSize(img.width, img.height, s);
        const format = s.format === "same" ? sameFormatAs(file) : s.format;
        const canvas = drawScaled(img, w, h);
        const blob = await encodeCanvas(canvas, format, isLossy(format) ? 0.92 : undefined);
        return { blob, name: outputName(file, format, `-${w}x${h}`), width: w, height: h };
      }}
    />
  );
}
