"use client";

import { useMemo, useState } from "react";
import { Button, ErrorNote, Field, Sheet, SideSection, Workspace, inputClass } from "@/components/kit";
import { useT } from "@/i18n/LocaleProvider";
import { makeCanvas, sameFormatAs } from "@/lib/image";
import {
  CanvasView,
  FORMAT_LABEL,
  Check,
  ImageHeader,
  RangeField,
  SingleImageDrop,
  SingleResult,
  assertCanvasSize,
  decodeImage,
  encodeCanvas,
  isLossy,
  outputName,
  roundedRectPath,
  useErrorText,
  useSingleImage,
  type Output,
  type Source,
} from "@/tools/shared/imageKit";

interface Settings {
  /** Border width in real pixels. */
  width: number;
  color: string;
  rounded: boolean;
  /** Outer corner radius, % of the shorter outer side. */
  radius: number;
}

/** `scale` = canvas pixels per real pixel (below 1 for the on-screen preview). */
function render(src: Source, s: Settings, scale: number): HTMLCanvasElement {
  const b = s.width * scale;
  const W = src.width + 2 * b;
  const H = src.height + 2 * b;
  assertCanvasSize(W, H);
  const [canvas, ctx] = makeCanvas(W, H);
  const outer = s.rounded ? (Math.min(W, H) * s.radius) / 100 : 0;
  ctx.fillStyle = s.color;
  roundedRectPath(ctx, 0, 0, canvas.width, canvas.height, outer);
  ctx.fill();
  ctx.save();
  roundedRectPath(ctx, b, b, src.width, src.height, Math.max(0, outer - b));
  ctx.clip();
  ctx.drawImage(src.source, b, b, src.width, src.height);
  ctx.restore();
  return canvas;
}

export default function AddBorder() {
  const t = useT();
  const errorText = useErrorText();
  const { image, loading, error: loadError, load, clear } = useSingleImage(1200);
  const [s, setS] = useState<Settings>({ width: 20, color: "#ffffff", rounded: false, radius: 6 });
  const set = (p: Partial<Settings>) => setS((prev) => ({ ...prev, ...p }));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ key: string; out: Output } | null>(null);

  const preview = useMemo(
    () => (image ? render({ source: image.preview, width: image.preview.width, height: image.preview.height }, s, image.scale) : null),
    [image, s],
  );

  if (!image || !preview) {
    return (
      <SingleImageDrop
        loading={loading}
        error={loadError}
        onFile={load}
        hint={t({ en: "One image. Border is added at full resolution.", bn: "একটি ছবি। পুরো রেজোলিউশনে বর্ডার যোগ হবে।" })}
      />
    );
  }

  const key = `${image.file.name}:${JSON.stringify(s)}`;
  const output = result?.key === key ? result.out : null;
  const format = s.rounded ? "image/png" : sameFormatAs(image.file);
  const maxWidth = Math.max(50, Math.round(Math.min(image.width, image.height) / 4));

  const apply = async () => {
    setBusy(true);
    setError(null);
    try {
      const img = await decodeImage(image.file);
      try {
        const canvas = render(img, s, 1);
        const blob = await encodeCanvas(canvas, format, isLossy(format) ? 0.92 : undefined);
        setResult({ key, out: { blob, name: outputName(image.file, format, "-border"), width: canvas.width, height: canvas.height } });
      } finally {
        img.close();
      }
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Workspace
      main={
        <Sheet>
          <ImageHeader image={image} onChange={clear} />
          <div className="flex justify-center">
            <CanvasView canvas={preview} label={t({ en: "Preview", bn: "প্রিভিউ" })} />
          </div>
        </Sheet>
      }
      side={
        <>
          <SideSection title={t({ en: "Border", bn: "বর্ডার" })}>
            <RangeField
              label={t({ en: "Width", bn: "পুরুত্ব" })}
              value={Math.min(s.width, maxWidth)}
              min={0}
              max={maxWidth}
              display={`${t.n(s.width)} px`}
              onChange={(width) => set({ width })}
            />
            <Field label={t({ en: "Exact width (px)", bn: "সঠিক পুরুত্ব (পিক্সেল)" })}>
              {(id) => (
                <input
                  id={id}
                  type="number"
                  min={0}
                  inputMode="numeric"
                  className={inputClass}
                  value={s.width}
                  onChange={(e) => set({ width: Math.max(0, Math.round(Number(e.target.value) || 0)) })}
                />
              )}
            </Field>
            <Field label={t({ en: "Colour", bn: "রং" })}>
              {(id) => (
                <div className="flex items-center gap-2">
                  <input
                    id={id}
                    type="color"
                    value={s.color}
                    onChange={(e) => set({ color: e.target.value })}
                    className="h-10 w-14 cursor-pointer rounded-md border border-rule-strong bg-paper p-1"
                  />
                  <span className="font-mono text-sm text-ink-2 uppercase">{s.color}</span>
                </div>
              )}
            </Field>
            <Check checked={s.rounded} onChange={(rounded) => set({ rounded })} label={t({ en: "Rounded corners", bn: "গোল কোণা" })} />
            {s.rounded && (
              <RangeField
                label={t({ en: "Corner radius", bn: "কোণার বক্রতা" })}
                value={s.radius}
                min={1}
                max={50}
                display={`${t.n(s.radius)}%`}
                onChange={(radius) => set({ radius })}
              />
            )}
            <p className="text-xs text-ink-3">
              {t({ en: "Output", bn: "আউটপুট" })}: {FORMAT_LABEL[format]} · {t.n(image.width + 2 * s.width)} ×{" "}
              {t.n(image.height + 2 * s.width)} px
            </p>
            <Button onClick={apply} busy={busy}>
              {t({ en: "Add border", bn: "বর্ডার যোগ করুন" })}
            </Button>
          </SideSection>
          <ErrorNote message={error} />
          {output && <SingleResult output={output} original={image.file} />}
        </>
      }
    />
  );
}
