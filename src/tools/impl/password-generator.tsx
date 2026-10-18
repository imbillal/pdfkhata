"use client";

import { useCallback, useMemo, useState } from "react";
import { Button, ErrorNote, Field, Segmented, Sheet, SideSection, Workspace } from "@/components/kit";
import { useT } from "@/i18n/LocaleProvider";
import { CopyButton, Toggle } from "@/tools/shared/textKit";
import {
  BiError,
  buildSets,
  generatePassword,
  passwordEntropy,
  randomInt,
  strengthLabel,
  type CharsetId,
} from "@/tools/shared/textLogic";

// Short, common, easy-to-spell words. Deduplicated at load so entropy maths stays honest.
const WORDS = Array.from(
  new Set(
    (
      "able acid aged also area army away baby back ball band bank base bath bear beat bell belt best bird blow blue boat body bone book boot born boss " +
      "bowl bulk burn bush busy cake calm came camp card care cart case cash cast cell chat chip city clay club coal coat code cold cook cool cope copy " +
      "corn cost crew crop dark data dawn deal dear deep deer desk dial diet dirt dish dock door dose down draw drop drum duck dust duty earn east easy " +
      "edge else even ever exit face fact fair fall farm fast fate fear feed feel file fill film find fine fire firm fish five flag flat flow folk food " +
      "foot fork form fort four free frog fuel full fund gain game gate gear gift girl glad glow goal goat gold golf good gray grid grow gulf hair half " +
      "hall hand hang hard harm hawk head heal heap heat herb hero high hill hint hire hold hole home hook hope horn host hour huge hunt idea inch iron " +
      "item jazz join joke jump jury keen keep kick kind king kite knee knot lake lamp land lane last late lawn lead leaf lean left lend lens life lift " +
      "like lime line link lion list live load loan lock loft long loop lord loud love luck lung made mail main make mall many map mark mask mass meal " +
      "meat menu mild milk mill mind mint miss mode mood moon more moss most moth move much nail name navy near neat neck need nest news next nice node " +
      "noon nose note nova oak oath odds open oval oven over pace pack page pain pair palm park part pass past path peak pear pine pink pipe plan play " +
      "plot plug plum poem poet pole pond pool port pose post pour pull pump pure push quiz race rack rain rank rare rate read real reef rest rice rich " +
      "ride ring rise risk road rock role roof room root rope rose ruby rule rush safe sage sail salt sand save seal seat seed self sell send ship shoe " +
      "shop shot show sign silk sing site size skin slow snow soap sock soft soil song soon sort soup spin spot star stay stem step stew suit sung sure " +
      "swan swim tail take tale talk tall tank tape task team tent term test text tide tile time tiny tone tool tour town tree trip true tube tune turn " +
      "twin type unit upon used vast verb view vine vote wage wait wake walk wall want warm wash wave weak wear week well west wide wild will wind wine " +
      "wing wire wise wish wolf wood wool word work yard year yoga zero zone"
    ).split(/\s+/),
  ),
);

type Mode = "password" | "passphrase";
type Sep = "-" | " " | "." | "_" | "";

const SET_LABELS: { id: CharsetId; en: string; bn: string; sample: string }[] = [
  { id: "upper", en: "Uppercase", bn: "বড় হাতের অক্ষর", sample: "A–Z" },
  { id: "lower", en: "Lowercase", bn: "ছোট হাতের অক্ষর", sample: "a–z" },
  { id: "digits", en: "Numbers", bn: "সংখ্যা", sample: "0–9" },
  { id: "symbols", en: "Symbols", bn: "চিহ্ন", sample: "!@#$…" },
];

const METER = ["bg-margin", "bg-margin/70", "bg-ok/70", "bg-ok"] as const;

export default function PasswordGenerator() {
  const t = useT();
  const [mode, setMode] = useState<Mode>("password");
  const [length, setLength] = useState(16);
  const [chosen, setChosen] = useState<Record<CharsetId, boolean>>({ upper: true, lower: true, digits: true, symbols: true });
  const [noLookAlikes, setNoLookAlikes] = useState(false);
  const [count, setCount] = useState(5);
  const [words, setWords] = useState(5);
  const [sep, setSep] = useState<Sep>("-");
  const [capitalize, setCapitalize] = useState(true);
  const [addNumber, setAddNumber] = useState(true);

  const sets = useMemo(
    () =>
      buildSets(
        (Object.keys(chosen) as CharsetId[]).filter((k) => chosen[k]),
        noLookAlikes,
      ),
    [chosen, noLookAlikes],
  );
  const poolSize = sets.reduce((n, s) => n + s.length, 0);

  const makeOne = useCallback((): string => {
    if (mode === "password") return generatePassword(length, sets);
    const picked = Array.from({ length: words }, () => {
      const w = WORDS[randomInt(WORDS.length)];
      return capitalize ? w[0].toUpperCase() + w.slice(1) : w;
    });
    if (addNumber) {
      const i = randomInt(picked.length);
      picked[i] = `${picked[i]}${randomInt(10)}`;
    }
    return picked.join(sep);
  }, [mode, length, sets, words, capitalize, addNumber, sep]);

  const makeMany = useCallback((): { list: string[]; error: BiError | null } => {
    try {
      return { list: Array.from({ length: count }, makeOne), error: null };
    } catch (err) {
      if (err instanceof BiError) return { list: [], error: err };
      throw err;
    }
  }, [count, makeOne]);

  // Regenerate whenever settings change; "Generate" forces a fresh batch with the same settings.
  const [nonce, setNonce] = useState(0);
  const batch = useMemo(() => {
    void nonce;
    return makeMany();
  }, [makeMany, nonce]);

  const bits =
    mode === "password"
      ? passwordEntropy(length, poolSize)
      : words * Math.log2(WORDS.length) + (addNumber ? Math.log2(10) + Math.log2(words) : 0);
  const strength = strengthLabel(bits);
  const strengthText = [
    { en: "Weak", bn: "দুর্বল" },
    { en: "Fair", bn: "মোটামুটি" },
    { en: "Strong", bn: "শক্তিশালী" },
    { en: "Very strong", bn: "খুব শক্তিশালী" },
  ][strength.level];

  const toggleSet = (id: CharsetId, v: boolean) => setChosen((prev) => ({ ...prev, [id]: v }));

  return (
    <Workspace
      main={
        <Sheet className="flex flex-col gap-5">
          <Segmented<Mode>
            label={t({ en: "Type", bn: "ধরন" })}
            value={mode}
            onChange={setMode}
            options={[
              { value: "password", label: t({ en: "Password", bn: "পাসওয়ার্ড" }) },
              { value: "passphrase", label: t({ en: "Passphrase", bn: "পাসফ্রেজ" }) },
            ]}
          />

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-ink-2">
                {t({ en: "Strength", bn: "শক্তি" })}: {t(strengthText)}
              </span>
              <span className="text-xs text-ink-3 tabular-nums">
                ≈ {t.n(Math.round(bits))} {t({ en: "bits of entropy", bn: "বিট এনট্রপি" })}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1" aria-hidden>
              {[0, 1, 2, 3].map((i) => (
                <span key={i} className={`h-1.5 rounded-full ${i <= strength.level ? METER[strength.level] : "bg-paper-2"}`} />
              ))}
            </div>
          </div>

          <ErrorNote message={batch.error ? t(batch.error.bi) : null} />

          <ul className="flex flex-col gap-2">
            {batch.list.map((pw, i) => (
              <li key={`${i}-${pw}`} className="flex items-center gap-2 rounded-md border border-rule bg-paper px-3 py-2">
                <code className="min-w-0 flex-1 font-mono text-sm break-all text-ink select-all">{pw}</code>
                <CopyButton text={pw} variant="ghost" className="shrink-0 px-2 py-1 text-xs" />
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setNonce((n) => n + 1)}>{t({ en: "Generate new", bn: "নতুন তৈরি করুন" })}</Button>
            {batch.list.length > 1 && <CopyButton text={batch.list.join("\n")} label={t({ en: "Copy all", bn: "সব কপি" })} />}
          </div>
        </Sheet>
      }
      side={
        <>
          {mode === "password" ? (
            <SideSection title={t({ en: "Password", bn: "পাসওয়ার্ড" })}>
              <Field label={`${t({ en: "Length", bn: "দৈর্ঘ্য" })}: ${t.n(length)}`}>
                {(id) => <input id={id} type="range" min={6} max={64} value={length} onChange={(e) => setLength(Number(e.target.value))} className="accent-margin" />}
              </Field>
              {SET_LABELS.map((s) => (
                <Toggle key={s.id} checked={chosen[s.id]} onChange={(v) => toggleSet(s.id, v)} label={`${t({ en: s.en, bn: s.bn })} (${s.sample})`} />
              ))}
              <Toggle
                checked={noLookAlikes}
                onChange={setNoLookAlikes}
                label={t({ en: "Avoid look-alikes", bn: "একই রকম দেখতে অক্ষর বাদ দিন" })}
                hint="I l 1 O 0 |"
              />
              <p className="text-xs text-ink-3">
                {t({ en: "Every type you tick appears at least once.", bn: "যে ধরনগুলো বেছে নেবেন, প্রতিটি অন্তত একবার থাকবে।" })}
              </p>
            </SideSection>
          ) : (
            <SideSection title={t({ en: "Passphrase", bn: "পাসফ্রেজ" })}>
              <Field label={`${t({ en: "Words", bn: "শব্দ" })}: ${t.n(words)}`}>
                {(id) => <input id={id} type="range" min={3} max={10} value={words} onChange={(e) => setWords(Number(e.target.value))} className="accent-margin" />}
              </Field>
              <Field label={t({ en: "Separator", bn: "বিভাজক" })}>
                {() => (
                  <Segmented<Sep>
                    label={t({ en: "Separator", bn: "বিভাজক" })}
                    value={sep}
                    onChange={setSep}
                    options={[
                      { value: "-", label: "-" },
                      { value: " ", label: t({ en: "space", bn: "স্পেস" }) },
                      { value: ".", label: "." },
                      { value: "_", label: "_" },
                      { value: "", label: t({ en: "none", bn: "নেই" }) },
                    ]}
                  />
                )}
              </Field>
              <Toggle checked={capitalize} onChange={setCapitalize} label={t({ en: "Capitalise each word", bn: "প্রতিটি শব্দের প্রথম অক্ষর বড়" })} />
              <Toggle checked={addNumber} onChange={setAddNumber} label={t({ en: "Add a digit", bn: "একটি সংখ্যা যোগ করুন" })} />
              <p className="text-xs text-ink-3">
                {t({
                  en: `Drawn from ${t.n(WORDS.length)} common English words — easy to type, hard to guess.`,
                  bn: `${t.n(WORDS.length)}টি পরিচিত ইংরেজি শব্দ থেকে নেওয়া — টাইপ করা সহজ, অনুমান করা কঠিন।`,
                })}
              </p>
            </SideSection>
          )}
          <SideSection title={t({ en: "How many", bn: "কয়টি" })}>
            <Field label={`${t({ en: "Generate", bn: "তৈরি" })}: ${t.n(count)}`}>
              {(id) => <input id={id} type="range" min={1} max={20} value={count} onChange={(e) => setCount(Number(e.target.value))} className="accent-margin" />}
            </Field>
            <p className="text-xs text-ink-3">
              {t({
                en: "Made with your browser's secure random generator. Nothing is sent or stored.",
                bn: "ব্রাউজারের সুরক্ষিত র‍্যান্ডম জেনারেটর দিয়ে তৈরি। কিছুই পাঠানো বা সংরক্ষণ করা হয় না।",
              })}
            </p>
          </SideSection>
        </>
      }
    />
  );
}
