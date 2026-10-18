// Bijoy (SutonnyMJ ASCII glyph encoding) ⇄ Unicode Bangla.
// Pure and framework-free so it runs in the browser, in workers and under `node --test`.
//
// Bijoy text stores *glyphs in visual order*: pre-base vowel signs (ি ে ৈ) are typed
// before the consonant cluster, the reph (র্, "©") after it, and many conjuncts are a
// single pre-composed glyph in the 0x80–0xFF range (as seen through Windows-1252).
// Conversion is therefore: longest-match glyph mapping, then a reordering pass.

/* ---------- Shared character classes ---------- */

const HASANTA = "্"; // ্
const ZWJ = "‍";
const ZWNJ = "‌";

// Internal markers used between the mapping and reordering passes (Private Use Area).
const PRE_I = ""; // ি typed before its cluster
const PRE_E = ""; // ে typed before its cluster
const PRE_AI = ""; // ৈ typed before its cluster
const REPH = ""; // র্ typed after its cluster
const RYA = ""; // র‍্য (ra + ZWJ + ya-phala), used by unicodeToBijoy

const PRE_KAR: Record<string, string> = { [PRE_I]: "ি", [PRE_E]: "ে", [PRE_AI]: "ৈ" };

function isConsonant(c: string | undefined): boolean {
  if (!c) return false;
  const code = c.charCodeAt(0);
  return (
    (code >= 0x0995 && code <= 0x09a8) || // ক–ন
    (code >= 0x09aa && code <= 0x09b0) || // প–র
    code === 0x09b2 || // ল
    (code >= 0x09b6 && code <= 0x09b9) || // শ–হ
    code === 0x09dc || // ড়
    code === 0x09dd || // ঢ়
    code === 0x09df // য়
  );
}

/** Dependent vowel signs that sit after the cluster in Unicode order. */
function isDependentVowel(c: string | undefined): boolean {
  if (!c) return false;
  const code = c.charCodeAt(0);
  return (code >= 0x09be && code <= 0x09cc) || code === 0x09d7;
}

function isBanglaChar(c: string | undefined): boolean {
  if (!c) return false;
  const code = c.charCodeAt(0);
  return (code >= 0x0980 && code <= 0x09ff) || c === RYA;
}

/** Fold decomposed nukta letters and two-part vowel signs into their single code points. */
function composeBangla(text: string): string {
  return text
    .replace(/ড়/g, "ড়")
    .replace(/ঢ়/g, "ঢ়")
    .replace(/য়/g, "য়")
    .replace(/ো/g, "ো")
    .replace(/ৌ/g, "ৌ");
}

/* ---------- Bijoy → Unicode table ---------- */

// Longest match wins, so multi-glyph keys override their parts.
const B2U_ENTRIES: [string, string][] = [
  // Specials handled by the reordering pass
  ["w", PRE_I],
  ["‡", PRE_E],
  ["†", PRE_E],
  ["‰", PRE_AI],
  ["ˆ", PRE_AI],
  ["©", REPH],
  ["i¨", "র" + ZWJ + "্য"],

  // Independent vowels
  ["Av", "আ"],
  ["A", "অ"],
  ["B", "ই"],
  ["C", "ঈ"],
  ["D", "উ"],
  ["E", "ঊ"],
  ["F", "ঋ"],
  ["G", "এ"],
  ["H", "ঐ"],
  ["I", "ও"],
  ["J", "ঔ"],

  // Consonants
  ["K", "ক"],
  ["L", "খ"],
  ["M", "গ"],
  ["N", "ঘ"],
  ["O", "ঙ"],
  ["P", "চ"],
  ["Q", "ছ"],
  ["R", "জ"],
  ["S", "ঝ"],
  ["T", "ঞ"],
  ["U", "ট"],
  ["V", "ঠ"],
  ["W", "ড"],
  ["X", "ঢ"],
  ["Y", "ণ"],
  ["Z", "ত"],
  ["_", "থ"],
  ["`", "দ"],
  ["a", "ধ"],
  ["b", "ন"],
  ["c", "প"],
  ["d", "ফ"],
  ["e", "ব"],
  ["f", "ভ"],
  ["g", "ম"],
  ["h", "য"],
  ["i", "র"],
  ["j", "ল"],
  ["k", "শ"],
  ["l", "ষ"],
  ["m", "স"],
  ["n", "হ"],
  ["o", "ড়"], // ড়
  ["p", "ঢ়"], // ঢ়
  ["q", "য়"], // য়
  ["r", "ৎ"],

  // Signs
  ["s", "ং"],
  ["t", "ঃ"],
  ["u", "ঁ"],
  ["&", HASANTA],
  ["|", "।"],
  ["$", "৳"],

  // Post-base vowel signs (and their positional variants)
  ["v", "া"],
  ["x", "ী"],
  ["y", "ু"],
  ["z", "ু"],
  ["“", "ু"],
  ["æ", "ু"],
  ["~", "ূ"],
  ["ƒ", "ূ"],
  ["‚", "ূ"],
  ["…", "ৃ"],
  ["„", "ৃ"],
  ["Š", "ৗ"],

  // Digits
  ["0", "০"],
  ["1", "১"],
  ["2", "২"],
  ["3", "৩"],
  ["4", "৪"],
  ["5", "৫"],
  ["6", "৬"],
  ["7", "৭"],
  ["8", "৮"],
  ["9", "৯"],

  // Punctuation glyphs
  ["Ñ", "—"],
  ["Ò", "“"],
  ["Ó", "”"],
  ["Ô", "‘"],
  ["Õ", "’"],

  // Phala / below-base forms (each carries its own hasanta)
  ["ª", "্র"],
  ["Ö", "্র"],
  ["«", "্র"],
  ["¨", "্য"],
  ["¡", "্ব"],
  ["¦", "্ব"],
  ["Ÿ", "্ব"],
  ["^", "্ব"],
  ["œ", "্ন"],
  ["¥", "্ম"],
  ["§", "্ম"],
  ["ø", "্ল"],
  ["¬", "্ল"],
  ["Í", "্ত"],
  ["¿", "্ত্র"],
  ["‹", "্ক"],
  ["Œ", "্ক্র"],
  ["ú", "্প"],
  ["¢", "্ভ"],
  ["£", "্ভ্র"],

  // Half (pre-hasanta) forms that join with the following glyph
  ["¯", "স্"],
  ["®", "ষ্"],
  ["¤", "ম্"],
  ["š", "ন্"],
  ["›", "ন্"],
  ["˜", "দ্"],
  ["™", "দ্"],
  ["•", "ঙ্"],
  ["”P", "চ্চ"],
  ["”Q", "চ্ছ"],
  ["š—", "ন্ত"],
  ["š‘", "ন্তু"],
  ["¯‘", "স্তু"],
  ["š’", "ন্থ"],
  ["¯’", "স্থ"],

  // Pre-composed conjunct glyphs
  ["°", "ক্ক"],
  ["±", "ক্ট"],
  ["²", "ক্ষ্ম"],
  ["³", "ক্ত"],
  ["´", "ক্ম"],
  ["µ", "ক্র"],
  ["¶", "ক্ষ"],
  ["ÿ", "ক্ষ"],
  ["·", "ক্স"],
  ["¸", "গু"],
  ["»", "গ্ধ"],
  ["¼", "ঙ্ক"],
  ["½", "ঙ্গ"],
  ["¾", "জ্জ"],
  ["À", "জ্ঝ"],
  ["Á", "জ্ঞ"],
  ["Â", "ঞ্চ"],
  ["Ã", "ঞ্ছ"],
  ["Ä", "ঞ্জ"],
  ["Å", "ঞ্ঝ"],
  ["Æ", "ট্ট"],
  ["Ç", "ড্ড"],
  ["È", "ণ্ট"],
  ["É", "ণ্ঠ"],
  ["Ê", "ণ্ড"],
  ["Ë", "ত্ত"],
  ["Ì", "ত্থ"],
  ["Î", "ত্র"],
  ["Ï", "দ্দ"],
  ["×", "দ্ধ"],
  ["Ø", "দ্ব"],
  ["Ù", "দ্ম"],
  ["Ú", "ন্ঠ"],
  ["Û", "ন্ড"],
  ["Ü", "ন্ধ"],
  ["Ý", "ন্স"],
  ["Þ", "প্ট"],
  ["ß", "প্ত"],
  ["à", "প্প"],
  ["á", "প্স"],
  ["â", "ব্জ"],
  ["ã", "ব্দ"],
  ["ä", "ব্ধ"],
  ["å", "ভ্র"],
  ["ç", "ম্ফ"],
  ["é", "ল্ক"],
  ["ê", "ল্গ"],
  ["ë", "ল্ট"],
  ["ì", "ল্ড"],
  ["í", "ল্প"],
  ["î", "ল্ফ"],
  ["ï", "শু"],
  ["ð", "শ্চ"],
  ["ñ", "শ্ছ"],
  ["ò", "ষ্ণ"],
  ["ó", "ষ্ট"],
  ["ô", "ষ্ঠ"],
  ["õ", "ষ্ফ"],
  ["ö", "স্খ"],
  ["÷", "স্ট"],
  ["ù", "স্ফ"],
  ["û", "হু"],
  ["ü", "হৃ"],
  ["ý", "হ্ন"],
  ["þ", "হ্ম"],
];

const B2U = new Map(B2U_ENTRIES);
const B2U_MAX = Math.max(...B2U_ENTRIES.map(([k]) => k.length));

function mapBijoyGlyphs(text: string): string {
  let out = "";
  let i = 0;
  while (i < text.length) {
    let matched = false;
    for (let len = Math.min(B2U_MAX, text.length - i); len > 0; len--) {
      const hit = B2U.get(text.substr(i, len));
      if (hit !== undefined) {
        out += hit;
        i += len;
        matched = true;
        break;
      }
    }
    if (!matched) out += text[i++];
  }
  // A half form followed by a phala glyph yields two hasantas in a row.
  return out.replace(/্্+/g, HASANTA);
}

/** Index just past the consonant cluster starting at `start` (or `start` if none). */
function clusterEnd(chars: string[], start: number): number {
  if (!isConsonant(chars[start])) return start;
  let k = start + 1;
  for (;;) {
    if (chars[k] === HASANTA && isConsonant(chars[k + 1])) k += 2;
    else if ((chars[k] === ZWJ || chars[k] === ZWNJ) && chars[k + 1] === HASANTA && isConsonant(chars[k + 2])) k += 3;
    else break;
  }
  return k;
}

function reorderFromBijoy(mapped: string): string {
  const chars = mapped.split("");

  // Pass 1: move pre-base vowel signs after their cluster; fuse ে…া → ো and ে…ৗ → ৌ.
  const moved: string[] = [];
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    const kar = PRE_KAR[c];
    if (kar === undefined) {
      moved.push(c);
      continue;
    }
    // Stacked markers (typos like "‡‡") collapse into the last one.
    const end = clusterEnd(chars, i + 1);
    if (end === i + 1) {
      moved.push(kar);
      continue;
    }
    for (let k = i + 1; k < end; k++) moved.push(chars[k]);
    let k = end;
    while (chars[k] === REPH) k++;
    if (c === PRE_E && (chars[k] === "া" || chars[k] === "ৗ")) {
      for (let r = end; r < k; r++) moved.push(REPH);
      moved.push(chars[k] === "া" ? "ো" : "ৌ");
      i = k;
    } else {
      moved.push(kar);
      i = end - 1;
    }
  }

  // Pass 2: move each reph in front of the cluster it was typed after.
  const out: string[] = [];
  for (const c of moved) {
    if (c !== REPH) {
      out.push(c);
      continue;
    }
    let k = out.length;
    while (k > 0 && isDependentVowel(out[k - 1])) k--;
    if (k > 0 && isConsonant(out[k - 1])) {
      k--;
      for (;;) {
        if (k >= 2 && out[k - 1] === HASANTA && isConsonant(out[k - 2])) k -= 2;
        else if (k >= 3 && out[k - 1] === HASANTA && (out[k - 2] === ZWJ || out[k - 2] === ZWNJ) && isConsonant(out[k - 3])) k -= 3;
        else break;
      }
      out.splice(k, 0, "র", HASANTA);
    } else {
      out.push("র", HASANTA);
    }
  }
  return out.join("");
}

/** Convert SutonnyMJ/Bijoy-encoded text (e.g. "Avwg evsjvq Mvb MvB") to Unicode Bangla. */
export function bijoyToUnicode(text: string): string {
  if (!text) return "";
  // Emit ড় ঢ় য় as letter + nukta: that is their NFC form and what modern keyboards type.
  return reorderFromBijoy(mapBijoyGlyphs(text))
    .replace(/\u09DC/g, "\u09A1\u09BC")
    .replace(/\u09DD/g, "\u09A2\u09BC")
    .replace(/\u09DF/g, "\u09AF\u09BC");
}

/* ---------- Unicode → Bijoy ---------- */

const U2B_CHAR: Record<string, string> = {
  "অ": "A", "আ": "Av", "ই": "B", "ঈ": "C", "উ": "D", "ঊ": "E", "ঋ": "F", "এ": "G", "ঐ": "H", "ও": "I", "ঔ": "J",
  "ক": "K", "খ": "L", "গ": "M", "ঘ": "N", "ঙ": "O", "চ": "P", "ছ": "Q", "জ": "R", "ঝ": "S", "ঞ": "T",
  "ট": "U", "ঠ": "V", "ড": "W", "ঢ": "X", "ণ": "Y", "ত": "Z", "থ": "_", "দ": "`", "ধ": "a", "ন": "b",
  "প": "c", "ফ": "d", "ব": "e", "ভ": "f", "ম": "g", "য": "h", "র": "i", "ল": "j", "শ": "k", "ষ": "l",
  "স": "m", "হ": "n", "ড়": "o", "ঢ়": "p", "য়": "q", "ৎ": "r",
  "ং": "s", "ঃ": "t", "ঁ": "u", [HASANTA]: "&", "।": "|", "৳": "$",
  "০": "0", "১": "1", "২": "2", "৩": "3", "৪": "4", "৫": "5", "৬": "6", "৭": "7", "৮": "8", "৯": "9",
  "—": "Ñ", "“": "Ò", "”": "Ó", "‘": "Ô", "’": "Õ",
  // Stray dependent vowels (no consonant before them)
  "া": "v", "ী": "x", "ু": "y", "ূ": "~", "ৃ": "…", "ৗ": "Š", "ি": "w", "ে": "‡", "ৈ": "‰",
  [RYA]: "i¨",
};

// Multi-consonant clusters with a dedicated Bijoy glyph (or glyph pair). Longest match wins.
const U2B_CONJUNCT_ENTRIES: [string, string][] = [
  ["ক্ক", "°"], ["ক্ট", "±"], ["ক্ষ্ম", "²"], ["ক্ত", "³"], ["ক্ম", "´"], ["ক্র", "µ"], ["ক্ষ", "ÿ"], ["ক্স", "·"],
  ["গ্ধ", "»"], ["ঙ্ক", "¼"], ["ঙ্গ", "½"], ["ঙ্খ", "•L"], ["ঙ্ঘ", "•N"], ["ঙ্ক্ষ", "•ÿ"],
  ["চ্চ", "”P"], ["চ্ছ", "”Q"],
  ["জ্জ", "¾"], ["জ্ঝ", "À"], ["জ্ঞ", "Á"],
  ["ঞ্চ", "Â"], ["ঞ্ছ", "Ã"], ["ঞ্জ", "Ä"], ["ঞ্ঝ", "Å"],
  ["ট্ট", "Æ"], ["ড্ড", "Ç"], ["ণ্ট", "È"], ["ণ্ঠ", "É"], ["ণ্ড", "Ê"],
  ["ত্ত", "Ë"], ["ত্থ", "Ì"], ["ত্র", "Î"],
  ["দ্দ", "Ï"], ["দ্ধ", "×"], ["দ্ব", "Ø"], ["দ্ম", "Ù"], ["দ্ভ", "™¢"],
  ["ন্ঠ", "Ú"], ["ন্ড", "Û"], ["ন্ধ", "Ü"], ["ন্স", "Ý"], ["ন্ট", "›U"], ["ন্দ", "›`"], ["ন্দ্ব", "›Ø"],
  ["ন্ত", "šÍ"], ["ন্ত্র", "š¿"], ["ন্থ", "š’"],
  ["প্ট", "Þ"], ["প্ত", "ß"], ["প্প", "à"], ["প্স", "á"],
  ["ব্জ", "â"], ["ব্দ", "ã"], ["ব্ধ", "ä"], ["ভ্র", "å"],
  ["ম্ফ", "ç"], ["ম্প", "¤ú"], ["ম্ব", "¤^"], ["ম্ভ", "¤¢"], ["ম্ভ্র", "¤£"], ["ম্ম", "¤§"],
  ["ল্ক", "é"], ["ল্গ", "ê"], ["ল্ট", "ë"], ["ল্ড", "ì"], ["ল্প", "í"], ["ল্ফ", "î"],
  ["শ্চ", "ð"], ["শ্ছ", "ñ"],
  ["ষ্ণ", "ò"], ["ষ্ট", "ó"], ["ষ্ঠ", "ô"], ["ষ্ফ", "õ"], ["ষ্ক", "®‹"], ["ষ্প", "®ú"], ["ষ্ম", "®§"],
  ["স্খ", "ö"], ["স্ট", "÷"], ["স্ফ", "ù"], ["স্ত", "¯Í"], ["স্ত্র", "¯¿"], ["স্থ", "¯’"], ["স্ক", "¯‹"],
  ["স্ক্র", "¯Œ"], ["স্প", "¯ú"], ["স্ব", "¯^"], ["স্ম", "¯§"],
  ["হ্ন", "ý"], ["হ্ম", "þ"],
];

const U2B_CONJUNCT = new Map(U2B_CONJUNCT_ENTRIES);
const U2B_CONJUNCT_MAX = Math.max(...U2B_CONJUNCT_ENTRIES.map(([k]) => k.length));

// Consonants whose ra-phala is drawn with the "Ö" glyph rather than "ª".
const RA_PHALA_NARROW = new Set(["প", "গ", "শ", "খ"]);

function phalaGlyph(target: string, base: string): string | null {
  switch (target) {
    case "র":
      return RA_PHALA_NARROW.has(base) ? "Ö" : "ª";
    case "য":
      return "¨";
    case "ব":
      return base === "শ" ? "¦" : "¡";
    case "ন":
      return "œ";
    case "ম":
      return "¥";
    case "ল":
      return base === "ক" ? "¬" : "ø";
    default:
      return null;
  }
}

/** Glyphs for one consonant cluster such as "ন্ত্র" (no vowel sign). */
function clusterGlyphs(cluster: string): string {
  let out = "";
  let j = 0;
  while (j < cluster.length) {
    let matched = false;
    for (let len = Math.min(U2B_CONJUNCT_MAX, cluster.length - j); len >= 3; len--) {
      const hit = U2B_CONJUNCT.get(cluster.substr(j, len));
      if (hit !== undefined) {
        out += hit;
        j += len;
        matched = true;
        break;
      }
    }
    if (matched) continue;
    const c = cluster[j];
    if (c === HASANTA) {
      const next = cluster[j + 1];
      const phala = next && isConsonant(next) ? phalaGlyph(next, cluster[j - 1] ?? "") : null;
      if (phala) {
        out += phala;
        j += 2;
      } else {
        out += "&";
        j += 1;
      }
      continue;
    }
    out += U2B_CHAR[c] ?? c;
    j++;
  }
  return out;
}

const POST_KAR: Record<string, string> = { "া": "v", "ী": "x", "ু": "y", "ূ": "~", "ৃ": "…", "ৗ": "Š" };

/** Single-glyph forms for a lone consonant + vowel sign. */
const KAR_LIGATURE: Record<string, string> = { "গু": "¸", "শু": "ï", "হু": "û", "হৃ": "ü", "রু": "iæ", "রূ": "iƒ" };

function syllableGlyphs(cluster: string, kar: string, reph: boolean, wordStart: boolean): string {
  let glyph = clusterGlyphs(cluster);
  let pre = "";
  let post = "";
  const eKar = wordStart ? "†" : "‡";
  switch (kar) {
    case "":
      break;
    case "ি":
      pre = "w";
      break;
    case "ে":
      pre = eKar;
      break;
    case "ৈ":
      pre = wordStart ? "ˆ" : "‰";
      break;
    case "ো":
      pre = eKar;
      post = "v";
      break;
    case "ৌ":
      pre = eKar;
      post = "Š";
      break;
    default: {
      const lig = KAR_LIGATURE[cluster + kar];
      if (lig) {
        glyph = lig;
      } else if (kar === "ু" && /(šÍ|¯Í)$/.test(glyph)) {
        glyph = glyph.slice(0, -1) + "‘";
      } else if ((kar === "ু" || kar === "ূ") && /[ªÖ«]$/.test(glyph)) {
        post = kar === "ু" ? "æ" : "ƒ";
      } else {
        post = POST_KAR[kar] ?? kar;
      }
    }
  }
  return pre + glyph + (reph ? "©" : "") + post;
}

function isClusterStart(c: string | undefined): boolean {
  return c === RYA || isConsonant(c);
}

/** Convert Unicode Bangla to SutonnyMJ/Bijoy encoding (paste the result into a SutonnyMJ-font document). */
export function unicodeToBijoy(text: string): string {
  if (!text) return "";
  const s = composeBangla(text).replace(/র[‌‍]্য/g, RYA);
  let out = "";
  let i = 0;
  while (i < s.length) {
    const start = i;
    let reph = false;
    if (s[i] === "র" && s[i + 1] === HASANTA && isConsonant(s[i + 2])) {
      reph = true;
      i += 2;
    }
    if (!isClusterStart(s[i])) {
      const c = s[i];
      // ZWJ/ZWNJ have no Bijoy equivalent.
      if (c !== ZWJ && c !== ZWNJ) out += U2B_CHAR[c] ?? c;
      i++;
      continue;
    }
    let cluster = s[i++];
    if (cluster !== RYA) {
      while (s[i] === HASANTA && isConsonant(s[i + 1])) {
        cluster += HASANTA + s[i + 1];
        i += 2;
      }
    }
    let kar = "";
    if (isDependentVowel(s[i])) kar = s[i++];
    out += syllableGlyphs(cluster, kar, reph, !isBanglaChar(s[start - 1]));
  }
  return out;
}

/* ---------- Detection ---------- */

// Glyphs that only show up in Bijoy text (Windows-1252 high range used by SutonnyMJ).
const BIJOY_GLYPHS = /[†‡ˆ‰Š©ª«¨¯š›”•¤®ÖÿÎ×ØËÁ½¾³µ¶¸ïóô¦¡œ¥§‘’]/g;
const BIJOY_WORDS = /(^|\s)(Avwg|Avgvi|Avgv‡`i|Ges|wK|Kiv|n‡q|†_‡K|Rb¨|GB|Avi|bv|n‡e|K‡i|wQj|evsjv|Zvi|†h|GKwU|gZ|cÖ\S*)(?=\s|$|[|,.])/g;

/** Heuristic: does this text look like Bijoy/SutonnyMJ ASCII rather than Unicode or plain English? */
export function looksLikeBijoy(text: string): boolean {
  const sample = text.slice(0, 5000);
  if (!sample.trim()) return false;
  const bangla = (sample.match(/[ঀ-৿]/g) ?? []).length;
  const letters = (sample.match(/[A-Za-z]/g) ?? []).length;
  if (bangla > letters) return false;
  const glyphs = (sample.match(BIJOY_GLYPHS) ?? []).length;
  const words = (sample.match(BIJOY_WORDS) ?? []).length;
  // Consonant + "v" (া) and "w" (ি) + consonant are everywhere in Bijoy but rare in English.
  const pairs = (sample.match(/[A-Z`_]v|w[A-Z`_]|v[`_]|\bAv/g) ?? []).length;
  const wordCount = sample.split(/\s+/).filter(Boolean).length;
  const dense = pairs / wordCount >= 0.25 && (pairs >= 2 || wordCount <= 3);
  return glyphs >= 2 || words >= 2 || dense || (glyphs >= 1 && (words >= 1 || pairs >= 1));
}
