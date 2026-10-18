"use client";

import { useMemo, useState } from "react";
import { Button, ErrorNote, Sheet, SideSection, Workspace } from "@/components/kit";
import { useT } from "@/i18n/LocaleProvider";
import { makeCanvas, sameFormatAs } from "@/lib/image";
import {
  CanvasView,
  ImageHeader,
  SingleImageDrop,
  SingleResult,
  assertCanvasSize,
  decodeImage,
  encodeCanvas,
  isLossy,
  outputName,
  useErrorText,
  useSingleImage,
  type Output,
  type Source,
} from "@/tools/shared/imageKit";

interface Transform {
  /** Quarter turns clockwise, 0–3. */
  turns: number;
  flipH: boolean;
  flipV: boolean;
}

const IDENTITY: Transform = { turns: 0, flipH: false, flipV: false };

/** Rotate, then mirror in the output's frame, so "flip horizontal" always means left↔right on screen. */
function render(src: Source, tf: Transform): HTMLCanvasElement {
  const swap = tf.turns % 2 === 1;
  const w = swap ? src.height : src.width;
  const h = swap ? src.width : src.height;
  assertCanvasSize(w, h);
  const [canvas, ctx] = makeCanvas(w, h);
  ctx.translate(w / 2, h / 2);
  ctx.scale(tf.flipH ? -1 : 1, tf.flipV ? -1 : 1);
  ctx.rotate((tf.turns * Math.PI) / 2);
  ctx.drawImage(src.source, -src.width / 2, -src.height / 2);
  return canvas;
}

export default function RotateImage() {
  const t = useT();
  const errorText = useErrorText();
  const { image, loading, error: loadError, load, clear } = useSingleImage(1200);
  const [tf, setTf] = useState<Transform>(IDENTITY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ key: string; out: Output } | null>(null);

  const preview = useMemo(
    () => (image ? render({ source: image.preview, width: image.preview.width, height: image.preview.height }, tf) : null),
    [image, tf],
  );

  if (!image || !preview) {
    return (
      <SingleImageDrop
        loading={loading}
        error={loadError}
        onFile={(f) => {
          setTf(IDENTITY);
          load(f);
        }}
        hint={t({ en: "One image. Rotated at full resolution.", bn: "একটি ছবি। পুরো রেজোলিউশনে ঘোরানো হবে।" })}
      />
    );
  }

  const key = `${image.file.name}:${tf.turns}:${tf.flipH}:${tf.flipV}`;
  const output = result?.key === key ? result.out : null;
  const turn = (q: number) => setTf((p) => ({ ...p, turns: (p.turns + q + 4) % 4 }));
  const unchanged = tf.turns === 0 && !tf.flipH && !tf.flipV;

  const apply = async () => {
    setBusy(true);
    setError(null);
    try {
      const img = await decodeImage(image.file);
      try {
        const canvas = render(img, tf);
        const format = sameFormatAs(image.file);
        const blob = await encodeCanvas(canvas, format, isLossy(format) ? 0.92 : undefined);
        setResult({ key, out: { blob, name: outputName(image.file, format, "-rotated"), width: canvas.width, height: canvas.height } });
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
          <SideSection title={t({ en: "Rotate & flip", bn: "ঘোরান ও উল্টান" })}>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" onClick={() => turn(-1)}>
                ⟲ {t({ en: "Left 90°", bn: "বামে ৯০°" })}
              </Button>
              <Button variant="secondary" onClick={() => turn(1)}>
                ⟳ {t({ en: "Right 90°", bn: "ডানে ৯০°" })}
              </Button>
              <Button variant="secondary" className="col-span-2" onClick={() => turn(2)}>
                {t({ en: "Rotate 180°", bn: "১৮০° ঘোরান" })}
              </Button>
              <Button variant="secondary" aria-pressed={tf.flipH} onClick={() => setTf((p) => ({ ...p, flipH: !p.flipH }))}>
                ⇋ {t({ en: "Flip horizontal", bn: "পাশাপাশি উল্টান" })}
              </Button>
              <Button variant="secondary" aria-pressed={tf.flipV} onClick={() => setTf((p) => ({ ...p, flipV: !p.flipV }))}>
                ⇵ {t({ en: "Flip vertical", bn: "ওপর-নিচ উল্টান" })}
              </Button>
            </div>
            <p className="text-xs text-ink-3">
              {t({ en: "Rotation", bn: "ঘূর্ণন" })}: {t.n(tf.turns * 90)}°
              {tf.flipH && ` · ${t({ en: "flipped ⇋", bn: "উল্টানো ⇋" })}`}
              {tf.flipV && ` · ${t({ en: "flipped ⇵", bn: "উল্টানো ⇵" })}`}
            </p>
            <Button variant="ghost" onClick={() => setTf(IDENTITY)} disabled={unchanged}>
              {t({ en: "Reset", bn: "রিসেট" })}
            </Button>
            <Button onClick={apply} busy={busy} disabled={unchanged}>
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
