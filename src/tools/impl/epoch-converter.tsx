"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, ErrorNote, Field, Segmented, Sheet, SideSection, Workspace, inputClass } from "@/components/kit";
import { useT } from "@/i18n/LocaleProvider";
import { CopyButton } from "@/tools/shared/textKit";
import { detectEpochUnit, epochToMs, parseDateTimeLocal, relativeTime, type EpochUnit } from "@/tools/shared/textLogic";

type UnitChoice = "auto" | EpochUnit;
type Zone = "local" | "utc";

const MAX_MS = 8.64e15; // JS Date range

const pad = (n: number, w = 2) => String(n).padStart(w, "0");
function toLocalInput(ms: number): string {
  const d = new Date(ms);
  return `${pad(d.getFullYear(), 4)}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-rule py-2.5 last:border-b-0 sm:flex-row sm:items-center sm:gap-3">
      <span className="w-32 shrink-0 text-xs font-medium tracking-wide text-ink-3 uppercase">{label}</span>
      <span className="min-w-0 flex-1 font-mono text-sm break-all text-ink">{value}</span>
      <CopyButton text={value} variant="ghost" className="self-start px-2 py-1 text-xs sm:self-auto" />
    </div>
  );
}

export default function EpochConverter() {
  const t = useT();
  const intlLocale = t.locale === "bn" ? "bn-BD" : "en-GB";
  const [now, setNow] = useState(() => Date.now());
  const [stamp, setStamp] = useState(() => String(Math.floor(Date.now() / 1000)));
  const [unit, setUnit] = useState<UnitChoice>("auto");
  const [dateInput, setDateInput] = useState(() => toLocalInput(Date.now()));
  const [zone, setZone] = useState<Zone>("local");

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const tz = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);
  const fmtLocal = useMemo(() => new Intl.DateTimeFormat(intlLocale, { dateStyle: "full", timeStyle: "long" }), [intlLocale]);
  const fmtUtc = useMemo(() => new Intl.DateTimeFormat(intlLocale, { dateStyle: "full", timeStyle: "long", timeZone: "UTC" }), [intlLocale]);

  const parsed = useMemo((): { error: string } | { ms: number; unit: EpochUnit } | null => {
    const s = stamp.trim().replace(/[_,\s]/g, "");
    if (!s) return null;
    if (!/^-?\d+(\.\d+)?$/.test(s)) return { error: t({ en: "Enter a number, like 1700000000.", bn: "একটি সংখ্যা দিন, যেমন 1700000000।" }) };
    const value = Number(s);
    const u = unit === "auto" ? detectEpochUnit(value) : unit;
    const ms = epochToMs(value, u);
    if (!Number.isFinite(ms) || Math.abs(ms) > MAX_MS) return { error: t({ en: "That timestamp is outside the range a date can show.", bn: "এই টাইমস্ট্যাম্প তারিখের সীমার বাইরে।" }) };
    return { ms, unit: u };
  }, [stamp, unit, t]);

  const unitName: Record<EpochUnit, string> = {
    s: t({ en: "seconds", bn: "সেকেন্ড" }),
    ms: t({ en: "milliseconds", bn: "মিলিসেকেন্ড" }),
    us: t({ en: "microseconds", bn: "মাইক্রোসেকেন্ড" }),
    ns: t({ en: "nanoseconds", bn: "ন্যানোসেকেন্ড" }),
  };

  const fromDate = useMemo(() => parseDateTimeLocal(dateInput, zone === "utc"), [dateInput, zone]);

  return (
    <Workspace
      main={
        <div className="flex flex-col gap-6">
          <Sheet>
            <p className="text-xs font-semibold tracking-[0.12em] text-ink-3 uppercase">{t({ en: "Current Unix time", bn: "এখনকার ইউনিক্স সময়" })}</p>
            <div className="mt-2 flex flex-wrap items-end gap-x-8 gap-y-3">
              <div>
                <p className="font-display text-4xl text-ink tabular-nums">{Math.floor(now / 1000)}</p>
                <p className="text-xs text-ink-3">{t({ en: "seconds", bn: "সেকেন্ড" })}</p>
              </div>
              <div>
                <p className="font-mono text-lg text-ink-2 tabular-nums">{now}</p>
                <p className="text-xs text-ink-3">{t({ en: "milliseconds", bn: "মিলিসেকেন্ড" })}</p>
              </div>
              <div className="flex gap-2">
                <CopyButton text={String(Math.floor(now / 1000))} label={t({ en: "Copy seconds", bn: "সেকেন্ড কপি" })} />
                <CopyButton text={String(now)} label={t({ en: "Copy ms", bn: "মিলিসেকেন্ড কপি" })} />
              </div>
            </div>
          </Sheet>

          <Sheet className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-ink">{t({ en: "Timestamp → date", bn: "টাইমস্ট্যাম্প → তারিখ" })}</h3>
            <div className="flex flex-wrap items-end gap-3">
              <div className="min-w-56 flex-1">
                <Field label={t({ en: "Unix timestamp", bn: "ইউনিক্স টাইমস্ট্যাম্প" })}>
                  {(id) => <input id={id} inputMode="numeric" className={`${inputClass} font-mono`} value={stamp} onChange={(e) => setStamp(e.target.value)} />}
                </Field>
              </div>
              <Button variant="secondary" onClick={() => setStamp(String(Math.floor(Date.now() / 1000)))}>
                {t({ en: "Now", bn: "এখন" })}
              </Button>
            </div>
            <Segmented<UnitChoice>
              label={t({ en: "Unit", bn: "একক" })}
              value={unit}
              onChange={setUnit}
              options={[
                { value: "auto", label: t({ en: "Auto", bn: "অটো" }) },
                { value: "s", label: t({ en: "Seconds", bn: "সেকেন্ড" }) },
                { value: "ms", label: t({ en: "Millis", bn: "মিলি" }) },
                { value: "us", label: t({ en: "Micros", bn: "মাইক্রো" }) },
                { value: "ns", label: t({ en: "Nanos", bn: "ন্যানো" }) },
              ]}
            />
            {parsed && "error" in parsed && <ErrorNote message={parsed.error} />}
            {parsed && "ms" in parsed && (
              <div>
                {unit === "auto" && (
                  <p className="mb-1 text-xs text-ink-3">
                    {t({ en: "Read as", bn: "ধরা হয়েছে" })} {unitName[parsed.unit]}
                  </p>
                )}
                <Row label="UTC" value={fmtUtc.format(parsed.ms)} />
                <Row label={t({ en: "Your time", bn: "আপনার সময়" })} value={`${fmtLocal.format(parsed.ms)}`} />
                <Row label="ISO 8601" value={new Date(parsed.ms).toISOString()} />
                <Row label={t({ en: "Relative", bn: "আপেক্ষিক" })} value={relativeTime(parsed.ms, now, intlLocale)} />
              </div>
            )}
          </Sheet>

          <Sheet className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-ink">{t({ en: "Date → timestamp", bn: "তারিখ → টাইমস্ট্যাম্প" })}</h3>
            <div className="flex flex-wrap items-end gap-3">
              <div className="min-w-56 flex-1">
                <Field label={t({ en: "Date and time", bn: "তারিখ ও সময়" })}>
                  {(id) => <input id={id} type="datetime-local" step={1} className={inputClass} value={dateInput} onChange={(e) => setDateInput(e.target.value)} />}
                </Field>
              </div>
              <Button variant="secondary" onClick={() => setDateInput(toLocalInput(Date.now()))}>
                {t({ en: "Now", bn: "এখন" })}
              </Button>
            </div>
            <Segmented<Zone>
              label={t({ en: "Time zone", bn: "টাইম জোন" })}
              value={zone}
              onChange={setZone}
              options={[
                { value: "local", label: `${t({ en: "Local", bn: "স্থানীয়" })} (${tz})` },
                { value: "utc", label: "UTC" },
              ]}
            />
            {dateInput && fromDate === null && <ErrorNote message={t({ en: "Pick a complete date and time.", bn: "পুরো তারিখ ও সময় দিন।" })} />}
            {fromDate !== null && (
              <div>
                <Row label={t({ en: "Seconds", bn: "সেকেন্ড" })} value={String(Math.floor(fromDate / 1000))} />
                <Row label={t({ en: "Milliseconds", bn: "মিলিসেকেন্ড" })} value={String(fromDate)} />
                <Row label="ISO 8601" value={new Date(fromDate).toISOString()} />
                <Row label={t({ en: "Relative", bn: "আপেক্ষিক" })} value={relativeTime(fromDate, now, intlLocale)} />
              </div>
            )}
          </Sheet>
        </div>
      }
      side={
        <SideSection title={t({ en: "About", bn: "সম্পর্কে" })}>
          <p className="text-sm text-ink-2">
            {t({
              en: "Unix time counts seconds since 1 January 1970, 00:00 UTC. Auto mode reads 10-digit values as seconds and 13-digit values as milliseconds.",
              bn: "ইউনিক্স সময় হলো ১ জানুয়ারি ১৯৭০, রাত ১২টা (UTC) থেকে পার হওয়া সেকেন্ডের সংখ্যা। অটো মোডে ১০ অঙ্কের মান সেকেন্ড আর ১৩ অঙ্কের মান মিলিসেকেন্ড হিসেবে ধরা হয়।",
            })}
          </p>
          <p className="text-xs text-ink-3">
            {t({ en: "Your time zone:", bn: "আপনার টাইম জোন:" })} {tz}
          </p>
        </SideSection>
      }
    />
  );
}
