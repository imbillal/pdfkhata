"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { Button, ErrorNote, Field, Segmented, Sheet, SideSection, TextArea, Workspace, inputClass } from "@/components/kit";
import { downloadBlob, downloadText } from "@/lib/files";
import { useT } from "@/i18n/LocaleProvider";
import { Toggle } from "@/tools/shared/textKit";
import { wifiPayload } from "@/tools/shared/textLogic";

type Kind = "text" | "wifi" | "email" | "phone";
type Ecc = "L" | "M" | "Q" | "H";
type Auth = "WPA" | "WEP" | "nopass";

function luminance(hex: string): number {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return 0;
  const n = parseInt(m[1], 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}

export default function QrCodeTool() {
  const t = useT();
  const [kind, setKind] = useState<Kind>("text");
  const [text, setText] = useState("");
  const [ssid, setSsid] = useState("");
  const [wifiPass, setWifiPass] = useState("");
  const [auth, setAuth] = useState<Auth>("WPA");
  const [hidden, setHidden] = useState(false);
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneMode, setPhoneMode] = useState<"tel" | "sms">("tel");
  const [smsBody, setSmsBody] = useState("");

  const [size, setSize] = useState(512);
  const [margin, setMargin] = useState(4);
  const [ecc, setEcc] = useState<Ecc>("M");
  const [fg, setFg] = useState("#1d1b16");
  const [bg, setBg] = useState("#ffffff");
  const [transparent, setTransparent] = useState(false);

  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const payload = useMemo(() => {
    switch (kind) {
      case "text":
        return text;
      case "wifi":
        return ssid ? wifiPayload(ssid, wifiPass, auth, hidden) : "";
      case "email": {
        if (!email.trim()) return "";
        const q = [subject && `subject=${encodeURIComponent(subject)}`, body && `body=${encodeURIComponent(body)}`].filter(Boolean).join("&");
        return `mailto:${email.trim()}${q ? `?${q}` : ""}`;
      }
      case "phone": {
        const num = phone.replace(/[^\d+*#]/g, "");
        if (!num) return "";
        return phoneMode === "tel" ? `tel:${num}` : `SMSTO:${num}:${smsBody}`;
      }
    }
  }, [kind, text, ssid, wifiPass, auth, hidden, email, subject, body, phone, phoneMode, smsBody]);

  const color = useMemo(() => ({ dark: fg, light: transparent ? "#00000000" : bg }), [fg, bg, transparent]);

  useEffect(() => {
    let cancelled = false;
    if (!payload) return;
    QRCode.toString(payload, { type: "svg", errorCorrectionLevel: ecc, margin, color })
      .then((s) => {
        if (cancelled) return;
        setSvg(s);
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setSvg(null);
        const msg = err instanceof Error ? err.message : "";
        setError(
          /too big|amount of data/i.test(msg)
            ? t({
                en: "That's too much data for a QR code. Shorten the text or lower the error correction level.",
                bn: "QR কোডে এত বেশি ডেটা ধরে না। লেখা ছোট করুন বা এরর কারেকশন লেভেল কমান।",
              })
            : t({ en: "Couldn't make a QR code from this input.", bn: "এই ইনপুট থেকে QR কোড তৈরি করা গেল না।" }),
        );
      });
    return () => {
      cancelled = true;
    };
  }, [payload, ecc, margin, color, t]);

  const shownSvg = payload ? svg : null;
  const shownError = payload ? error : null;
  const svgUrl = useMemo(() => (shownSvg ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(shownSvg)}` : null), [shownSvg]);

  const lowContrast = !transparent && Math.abs(luminance(fg) - luminance(bg)) < 0.4;
  const inverted = !transparent && luminance(fg) > luminance(bg);

  const downloadPng = async () => {
    try {
      const url = await QRCode.toDataURL(payload, { errorCorrectionLevel: ecc, margin, color, width: size, type: "image/png" });
      const blob = await (await fetch(url)).blob();
      downloadBlob(blob, "qr-code.png");
    } catch {
      setError(t({ en: "Couldn't create the PNG.", bn: "PNG তৈরি করা গেল না।" }));
    }
  };

  const kinds: { value: Kind; label: string }[] = [
    { value: "text", label: t({ en: "Text / URL", bn: "লেখা / URL" }) },
    { value: "wifi", label: "Wi‑Fi" },
    { value: "email", label: t({ en: "Email", bn: "ইমেইল" }) },
    { value: "phone", label: t({ en: "Phone", bn: "ফোন" }) },
  ];

  return (
    <Workspace
      main={
        <Sheet className="flex flex-col gap-5">
          <Segmented<Kind> label={t({ en: "QR content", bn: "QR-এর বিষয়বস্তু" })} value={kind} onChange={setKind} options={kinds} />

          {kind === "text" && (
            <Field label={t({ en: "Text or link", bn: "লেখা বা লিংক" })}>
              {(id) => <TextArea id={id} value={text} onChange={(e) => setText(e.target.value)} className="min-h-28! font-sans!" placeholder="https://…" />}
            </Field>
          )}

          {kind === "wifi" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t({ en: "Network name (SSID)", bn: "নেটওয়ার্কের নাম (SSID)" })}>
                {(id) => <input id={id} className={inputClass} value={ssid} onChange={(e) => setSsid(e.target.value)} autoComplete="off" />}
              </Field>
              <Field label={t({ en: "Password", bn: "পাসওয়ার্ড" })}>
                {(id) => (
                  <input id={id} className={inputClass} value={wifiPass} disabled={auth === "nopass"} onChange={(e) => setWifiPass(e.target.value)} autoComplete="off" />
                )}
              </Field>
              <Field label={t({ en: "Security", bn: "সিকিউরিটি" })}>
                {() => (
                  <Segmented<Auth>
                    label={t({ en: "Security", bn: "সিকিউরিটি" })}
                    value={auth}
                    onChange={setAuth}
                    options={[
                      { value: "WPA", label: "WPA/WPA2" },
                      { value: "WEP", label: "WEP" },
                      { value: "nopass", label: t({ en: "None", bn: "নেই" }) },
                    ]}
                  />
                )}
              </Field>
              <div className="self-end pb-2">
                <Toggle checked={hidden} onChange={setHidden} label={t({ en: "Hidden network", bn: "লুকানো নেটওয়ার্ক" })} />
              </div>
            </div>
          )}

          {kind === "email" && (
            <div className="grid gap-4">
              <Field label={t({ en: "Email address", bn: "ইমেইল ঠিকানা" })}>
                {(id) => <input id={id} type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />}
              </Field>
              <Field label={t({ en: "Subject (optional)", bn: "বিষয় (ঐচ্ছিক)" })}>
                {(id) => <input id={id} className={inputClass} value={subject} onChange={(e) => setSubject(e.target.value)} />}
              </Field>
              <Field label={t({ en: "Message (optional)", bn: "বার্তা (ঐচ্ছিক)" })}>
                {(id) => <TextArea id={id} value={body} onChange={(e) => setBody(e.target.value)} className="min-h-24! font-sans!" />}
              </Field>
            </div>
          )}

          {kind === "phone" && (
            <div className="grid gap-4">
              <Segmented<"tel" | "sms">
                label={t({ en: "Action", bn: "কাজ" })}
                value={phoneMode}
                onChange={setPhoneMode}
                options={[
                  { value: "tel", label: t({ en: "Call", bn: "কল" }) },
                  { value: "sms", label: "SMS" },
                ]}
              />
              <Field label={t({ en: "Phone number", bn: "ফোন নম্বর" })} hint={t({ en: "Include the country code, e.g. +8801…", bn: "দেশের কোডসহ লিখুন, যেমন +8801…" })}>
                {(id) => <input id={id} type="tel" className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+8801XXXXXXXXX" />}
              </Field>
              {phoneMode === "sms" && (
                <Field label={t({ en: "Message (optional)", bn: "বার্তা (ঐচ্ছিক)" })}>
                  {(id) => <TextArea id={id} value={smsBody} onChange={(e) => setSmsBody(e.target.value)} className="min-h-24! font-sans!" />}
                </Field>
              )}
            </div>
          )}

          <div className="flex flex-col items-center gap-3 rounded-lg border border-rule bg-paper p-6">
            {svgUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- generated data URL preview
              <img src={svgUrl} alt={t({ en: "QR code preview", bn: "QR কোডের প্রিভিউ" })} className="size-64 max-w-full [image-rendering:pixelated]" />
            ) : (
              <div className="grid size-64 max-w-full place-items-center rounded border border-dashed border-rule-strong text-center text-sm text-ink-3">
                {t({ en: "Fill in the details to see your QR code", bn: "তথ্য দিলে এখানে QR কোড দেখাবে" })}
              </div>
            )}
          </div>
        </Sheet>
      }
      side={
        <>
          <SideSection title={t({ en: "Look", bn: "চেহারা" })}>
            <Field label={`${t({ en: "PNG size", bn: "PNG সাইজ" })}: ${t.n(size)} px`}>
              {(id) => <input id={id} type="range" min={128} max={2048} step={64} value={size} onChange={(e) => setSize(Number(e.target.value))} className="accent-margin" />}
            </Field>
            <Field label={`${t({ en: "Quiet zone (margin)", bn: "চারপাশের ফাঁকা জায়গা" })}: ${t.n(margin)}`}>
              {(id) => <input id={id} type="range" min={0} max={10} value={margin} onChange={(e) => setMargin(Number(e.target.value))} className="accent-margin" />}
            </Field>
            <Field
              label={t({ en: "Error correction", bn: "এরর কারেকশন" })}
              hint={t({ en: "Higher survives damage or a logo, but holds less data.", bn: "বেশি হলে দাগ বা লোগো থাকলেও স্ক্যান হয়, তবে ডেটা কম ধরে।" })}
            >
              {() => (
                <Segmented<Ecc>
                  label={t({ en: "Error correction", bn: "এরর কারেকশন" })}
                  value={ecc}
                  onChange={setEcc}
                  options={[
                    { value: "L", label: "L 7%" },
                    { value: "M", label: "M 15%" },
                    { value: "Q", label: "Q 25%" },
                    { value: "H", label: "H 30%" },
                  ]}
                />
              )}
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label={t({ en: "Foreground", bn: "রং" })}>
                {(id) => <input id={id} type="color" value={fg} onChange={(e) => setFg(e.target.value)} className="h-10 w-full cursor-pointer rounded-md border border-rule-strong bg-paper p-1" />}
              </Field>
              <Field label={t({ en: "Background", bn: "পটভূমি" })}>
                {(id) => (
                  <input
                    id={id}
                    type="color"
                    value={bg}
                    disabled={transparent}
                    onChange={(e) => setBg(e.target.value)}
                    className="h-10 w-full cursor-pointer rounded-md border border-rule-strong bg-paper p-1 disabled:opacity-40"
                  />
                )}
              </Field>
            </div>
            <Toggle checked={transparent} onChange={setTransparent} label={t({ en: "Transparent background", bn: "স্বচ্ছ পটভূমি" })} />
            {(lowContrast || inverted) && (
              <p className="text-xs text-margin">
                {inverted
                  ? t({ en: "Light code on a dark background — many scanners can't read that.", bn: "গাঢ় পটভূমিতে হালকা কোড — অনেক স্ক্যানার এটি পড়তে পারে না।" })
                  : t({ en: "Low contrast — the code may not scan.", bn: "রঙের পার্থক্য কম — কোডটি স্ক্যান না-ও হতে পারে।" })}
              </p>
            )}
          </SideSection>
          <ErrorNote message={shownError} />
          <SideSection title={t({ en: "Download", bn: "ডাউনলোড" })}>
            <div className="flex flex-wrap gap-2">
              <Button disabled={!shownSvg} onClick={() => void downloadPng()}>
                PNG
              </Button>
              <Button variant="secondary" disabled={!shownSvg} onClick={() => shownSvg && downloadText(shownSvg, "qr-code.svg", "image/svg+xml")}>
                SVG
              </Button>
            </div>
            <p className="text-xs text-ink-3">{t({ en: "SVG stays sharp at any size — best for print.", bn: "SVG যেকোনো আকারে ঝকঝকে থাকে — ছাপার জন্য সবচেয়ে ভালো।" })}</p>
          </SideSection>
        </>
      }
    />
  );
}
