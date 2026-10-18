"use client";

import { useMemo, useState } from "react";
import { Button, ErrorNote, Sheet, SideSection, Workspace } from "@/components/kit";
import { useT } from "@/i18n/LocaleProvider";
import { makeCanvas } from "@/lib/image";
import {
  CanvasView,
  Check,
  ImageHeader,
  RangeField,
  SingleImageDrop,
  SingleResult,
  assertCanvasSize,
  decodeImage,
  encodeCanvas,
  outputName,
  roundedRectPath,
  useErrorText,
  useSingleImage,
  type Output,
  type Source,
} from "@/tools/shared/imageKit";

interface Settings {
  /** Corner radius as a percentage of the shorter side (50 = fully round). */
  radius: number;
  circle: boolean;
}

function render(src: Source, s: Settings): HTMLCanvasElement {
  let sx = 0;
  let sy = 0;
  let w = src.width;
  let h = src.height;
  if (s.circle) {
    const side = Math.min(w, h);
    sx = Math.floor((w - side) / 2);
    sy = Math.floor((h - side) / 2);
    w = h = side;
  }
  assertCanvasSize(w, h);
  const [canvas, ctx] = makeCanvas(w, h);
  if (s.circle) {
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, w / 2, 0, Math.PI * 2);
  } else {
    roundedRectPath(ctx, 0, 0, w, h, (Math.min(w, h) * s.radius) / 100);
  }
  ctx.clip();
  ctx.drawImage(src.source, sx, sy, w, h, 0, 0, w, h);
  return canvas;
}

export default function RoundImage() {
  const t = useT();
  const errorText = useErrorText();
  const { image, loading, error: loadError, load, clear } = useSingleImage(1200);
  const [s, setS] = useState<Settings>({ radius: 12, circle: false });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ key: string; out: Output } | null>(null);

  const preview = useMemo(
    () => (image ? render({ source: image.preview, width: image.preview.width, height: image.preview.height }, s) : null),
    [image, s],
  );

  if (!image || !preview) {
    return (
      <SingleImageDrop
        loading={loading}
        error={loadError}
        onFile={load}
        hint={t({ en: "One image. Saved as PNG so the corners stay transparent.", bn: "একটি ছবি। কোণা স্বচ্ছ রাখতে PNG হিসেবে সেভ হবে।" })}
      />
    );
  }

  const key = `${image.file.name}:${s.radius}:${s.circle}`;
  const output = result?.key === key ? result.out : null;
  const radiusPx = Math.round((Math.min(image.width, image.height) * s.radius) / 100);

  const apply = async () => {
    setBusy(true);
    setError(null);
    try {
      const img = await decodeImage(image.file);
      try {
        const canvas = render(img, s);
        const blob = await encodeCanvas(canvas, "image/png");
        const suffix = s.circle ? "-circle" : "-rounded";
        setResult({ key, out: { blob, name: outputName(image.file, "image/png", suffix), width: canvas.width, height: canvas.height } });
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
          <SideSection title={t({ en: "Corners", bn: "কোণা" })}>
            <Check
              checked={s.circle}
              onChange={(circle) => setS((p) => ({ ...p, circle }))}
              label={t({ en: "Make circle (crops to a centred square)", bn: "গোল করুন (মাঝখান থেকে বর্গাকারে কাটবে)" })}
            />
            {!s.circle && (
              <RangeField
                label={t({ en: "Corner radius", bn: "কোণার বক্রতা" })}
                value={s.radius}
                min={0}
                max={50}
                display={`${t.n(s.radius)}% · ${t.n(radiusPx)} px`}
                hint={t({ en: "50% on a square image makes a circle.", bn: "বর্গাকার ছবিতে ৫০% দিলে গোল হবে।" })}
                onChange={(radius) => setS((p) => ({ ...p, radius }))}
              />
            )}
            <p className="text-xs text-ink-3">{t({ en: "Output: PNG with transparent corners.", bn: "আউটপুট: স্বচ্ছ কোণাসহ PNG।" })}</p>
            <Button onClick={apply} busy={busy}>
              {t({ en: "Apply", bn: "প্রয়োগ করুন" })}
            </Button>
          </SideSection>
          <ErrorNote message={error} />
          {output && <SingleResult output={output} original={image.file} />}
        </>
      }
    />
  );
}
