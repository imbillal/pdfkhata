// Run: node --experimental-strip-types --test scripts/bijoy.test.mts
import { test } from "node:test";
import assert from "node:assert/strict";
import type * as BijoyModule from "../src/lib/bijoy";

// Node needs the ".ts" extension; tsc (no allowImportingTsExtensions) rejects it in a static import.
const BIJOY_PATH = "../src/lib/bijoy" + ".ts";
const { bijoyToUnicode, looksLikeBijoy, unicodeToBijoy } = (await import(BIJOY_PATH)) as typeof BijoyModule;

/** Fold decomposed nukta letters so source-file spelling doesn't matter. */
const canon = (s: string): string =>
  s.replace(/ড়/g, "ড়").replace(/ঢ়/g, "ঢ়").replace(/য়/g, "য়");

// [Bijoy (SutonnyMJ), Unicode] — canonical in both directions.
const PAIRS: [string, string][] = [
  ["Avwg evsjvq Mvb MvB", "আমি বাংলায় গান গাই"],
  ["evsjv‡`k", "বাংলাদেশ"],
  ["Avgv‡`i", "আমাদের"],
  ["MYcÖRvZš¿x evsjv‡`k", "গণপ্রজাতন্ত্রী বাংলাদেশ"],
  ["c~e©", "পূর্ব"],
  ["†KvwU", "কোটি"],
  ["†hŠ_", "যৌথ"],
  ["wkÿv", "শিক্ষা"],
  ["Kg©", "কর্ম"],
  ["Kg©x", "কর্মী"],
  ["we`¨vjq", "বিদ্যালয়"],
  ["ivóª", "রাষ্ট্র"],
  ["mvwnZ¨", "সাহিত্য"],
  ["Pvu`", "চাঁদ"],
  ["Avgvi †mvbvi evsjv", "আমার সোনার বাংলা"],
  ["Avwg †Zvgvq fvjevwm", "আমি তোমায় ভালবাসি"],
  ["Ávb", "জ্ঞান"],
  ["DËi", "উত্তর"],
  ["QvÎ", "ছাত্র"],
  ["wKš‘", "কিন্তু"],
  ["hy×", "যুদ্ধ"],
  ["kã", "শব্দ"],
  ["wek¦", "বিশ্ব"],
  ["wbwðZ", "নিশ্চিত"],
  ["AvZ¥v", "আত্মা"],
  ["cÖkœ", "প্রশ্ন"],
  ["m¤§vb", "সম্মান"],
  ["¯^vaxb", "স্বাধীন"],
  ["¯’vb", "স্থান"],
  ["kvwšÍ", "শান্তি"],
  ["Avb›`", "আনন্দ"],
  ["D”P", "উচ্চ"],
  ["e½", "বঙ্গ"],
  ["j¾v", "লজ্জা"],
  ["kw³", "শক্তি"],
  ["K…wl", "কৃষি"],
  ["iƒc", "রূপ"],
  ["¸iæ", "গুরু"],
  ["ïay", "শুধু"],
  ["†cÖg", "প্রেম"],
  ["ewY©Z", "বর্ণিত"],
  ["Kvh©", "কার্য"],
  ["AvšÍR©vwZK", "আন্তর্জাতিক"],
  ["†kÖô", "শ্রেষ্ঠ"],
  ["e¨e¯’v", "ব্যবস্থা"],
  ["†hvMv‡hvM", "যোগাযোগ"],
  ["e¨vsK", "ব্যাংক"],
  ["Kó", "কষ্ট"],
  ["c×wZ", "পদ্ধতি"],
  ["MÖvg", "গ্রাম"],
  ["`ªæZ", "দ্রুত"],
  ["P›`ª", "চন্দ্র"],
  ["gš¿x", "মন্ত্রী"],
  ["ˆZwi", "তৈরি"],
  ["26 gvP© 1971", "২৬ মার্চ ১৯৭১"],
  ["Avwg fvZ LvB|", "আমি ভাত খাই।"],
  ["evsjv‡`k miKvi", "বাংলাদেশ সরকার"],
];

// Spellings that only need to decode correctly (glyph variants, alternate reph position, etc.).
const DECODE_ONLY: [string, string][] = [
  ["eÜz", "বন্ধু"],
  ["‡KvwU", "কোটি"],
  ["Aš—", "অন্ত"],
  ["cÖv_x©", "প্রার্থী"],
  ["j¶", "লক্ষ"],
  ["i¨vwcW", "র‍্যাপিড"],
  ["Øviv", "দ্বারা"],
  ["‰`wbK", "দৈনিক"],
];

for (const [bijoy, unicode] of PAIRS) {
  test(`bijoy → unicode: ${bijoy}`, () => {
    assert.equal(canon(bijoyToUnicode(bijoy)), canon(unicode));
  });
  test(`unicode → bijoy: ${unicode}`, () => {
    assert.equal(unicodeToBijoy(unicode), bijoy);
  });
  test(`round trip: ${unicode}`, () => {
    assert.equal(canon(bijoyToUnicode(unicodeToBijoy(unicode))), canon(unicode));
  });
}

for (const [bijoy, unicode] of DECODE_ONLY) {
  test(`bijoy → unicode (variant): ${bijoy}`, () => {
    assert.equal(canon(bijoyToUnicode(bijoy)), canon(unicode));
  });
  test(`round trip (variant): ${unicode}`, () => {
    assert.equal(canon(bijoyToUnicode(unicodeToBijoy(unicode))), canon(unicode));
  });
}

test("decomposed nukta and two-part vowel signs encode like the composed forms", () => {
  assert.equal(unicodeToBijoy("বিদ্যালয়"), "we`¨vjq");
  assert.equal(unicodeToBijoy("কোটি"), "†KvwU");
});

test("full paragraph round trip", () => {
  const para = "আমার সোনার বাংলা, আমি তোমায় ভালবাসি।\nগণপ্রজাতন্ত্রী বাংলাদেশ সরকার — শিক্ষা ও সাহিত্য।";
  assert.equal(canon(bijoyToUnicode(unicodeToBijoy(para))), canon(para));
});

test("empty input", () => {
  assert.equal(bijoyToUnicode(""), "");
  assert.equal(unicodeToBijoy(""), "");
});

test("looksLikeBijoy", () => {
  assert.equal(looksLikeBijoy("Avwg evsjvq Mvb MvB"), true);
  assert.equal(looksLikeBijoy("MYcÖRvZš¿x evsjv‡`k miKvi"), true);
  assert.equal(looksLikeBijoy("আমি বাংলায় গান গাই"), false);
  assert.equal(looksLikeBijoy("The quick brown fox jumps over the lazy dog."), false);
  assert.equal(looksLikeBijoy(""), false);
});
