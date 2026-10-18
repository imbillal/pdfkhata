"use client";

import { useRef, useState } from "react";
import { Button, ErrorNote, Sheet, SideSection, TextArea, Workspace } from "@/components/kit";
import { useT } from "@/i18n/LocaleProvider";
import { readAsDataURL } from "@/lib/files";
import { BlobImg, CopyButton, SingleImageDrop, checkerStyle, fmtBytes, fmtDims, isHeic, openError } from "@/tools/shared/imageKit";

interface Loaded {
  file: File;
  dataUrl: string;
}

export default function ImageToBase64() {
  const t = useT();
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const token = useRef(0);

  const open = async (file: File) => {
    const mine = ++token.current;
    setError(null);
    if (!file.type.startsWith("image/") && !isHeic(file)) {
      setError(t(openError(file)));
      return;
    }
    setLoading(true);
    try {
      const dataUrl = await readAsDataURL(file);
      if (mine === token.current) {
        setDims(null);
        setLoaded({ file, dataUrl });
      }
    } catch {
      if (mine === token.current) setError(t({ en: "Couldn't read this file.", bn: "ফাইলটি পড়া গেল না।" }));
    } finally {
      if (mine === token.current) setLoading(false);
    }
  };

  if (!loaded) {
    return (
      <SingleImageDrop
        loading={loading}
        error={error}
        onFile={open}
        hint={t({ en: "Best for small icons and logos (under ~10 KB).", bn: "ছোট আইকন ও লোগোর জন্য সবচেয়ে ভালো (~১০ KB-এর কম)।" })}
      />
    );
  }

  const { file, dataUrl } = loaded;
  const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
  const size = dims ? ` width="${dims.w}" height="${dims.h}"` : "";
  const snippets = [
    { id: "uri", title: t({ en: "Data URI", bn: "ডেটা URI" }), text: dataUrl },
    { id: "css", title: "CSS", text: `background-image: url("${dataUrl}");` },
    { id: "html", title: "HTML", text: `<img src="${dataUrl}" alt=""${size}>` },
    { id: "b64", title: t({ en: "Base64 only", bn: "শুধু Base64" }), text: base64 },
  ];
  const big = dataUrl.length > 100 * 1024;

  return (
    <Workspace
      main={
        <Sheet>
          <div className="flex flex-col gap-5">
            {snippets.map((sn) => (
              <section key={sn.id} className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-ink-2">{sn.title}</h3>
                  <CopyButton text={sn.text} />
                </div>
                <TextArea readOnly value={sn.text} spellCheck={false} className="min-h-24 text-xs break-all" onFocus={(e) => e.currentTarget.select()} />
              </section>
            ))}
          </div>
        </Sheet>
      }
      side={
        <>
          <SideSection title={t({ en: "Image", bn: "ছবি" })}>
            <div className="flex justify-center">
              <BlobImg
                blob={file}
                alt={file.name}
                className="block h-auto max-h-48 w-auto max-w-full"
                style={checkerStyle}
                onLoad={(img) => setDims({ w: img.naturalWidth, h: img.naturalHeight })}
              />
            </div>
            <p className="truncate text-sm font-medium">{file.name}</p>
            <p className="text-xs text-ink-3">
              {dims && `${fmtDims(t, dims.w, dims.h)} px · `}
              {file.type || "image"}
            </p>
            <p className="text-sm text-ink-2">
              {t({ en: "File", bn: "ফাইল" })} {fmtBytes(t, file.size)} → {t({ en: "Base64", bn: "Base64" })} {fmtBytes(t, dataUrl.length)}
            </p>
            <p className="text-xs text-ink-3">
              {t({
                en: "Base64 is about a third larger than the file, and inlined images can't be cached separately.",
                bn: "Base64 আসল ফাইলের চেয়ে প্রায় এক-তৃতীয়াংশ বড় হয়, আর ইনলাইন ছবি আলাদা করে ক্যাশ হয় না।",
              })}
            </p>
            <Button variant="ghost" onClick={() => setLoaded(null)}>
              {t({ en: "Change image", bn: "অন্য ছবি" })}
            </Button>
          </SideSection>
          {big && (
            <ErrorNote
              message={t({
                en: "This is a large data URI. For images over ~10 KB a normal image file is usually better.",
                bn: "এটা বেশ বড় ডেটা URI। ~১০ KB-এর বড় ছবির জন্য সাধারণ ছবির ফাইলই সাধারণত ভালো।",
              })}
            />
          )}
        </>
      }
    />
  );
}
