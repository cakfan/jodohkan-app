export type AdabCheckResult = {
  passed: boolean;
  reason?: string;
  violationCategory?: "bad_word" | "appearance" | "dating";
};

// TODO: set ke false untuk production
const IS_TESTING = true;

type DurationTier = { ms: number | null; label: string };

const TESTING_TIERS: DurationTier[] = [
  { ms: 60 * 1000, label: "1 menit" },
  { ms: 3 * 60 * 1000, label: "3 menit" },
  { ms: null, label: "mengakhiri ta'aruf" },
];

const PROD_TIERS: DurationTier[] = [
  { ms: 24 * 60 * 60 * 1000, label: "24 jam" },
  { ms: 3 * 24 * 60 * 60 * 1000, label: "3 hari" },
  { ms: null, label: "mengakhiri ta'aruf" },
];

function getTiers(): DurationTier[] {
  return IS_TESTING ? TESTING_TIERS : PROD_TIERS;
}

export function getAdabFreezeMs(violationCount: number): number | null {
  const tiers = getTiers();
  const idx = Math.min(violationCount, tiers.length - 1);
  return tiers[idx].ms;
}

export function getAdabTierLabel(violationCount: number): string {
  const tiers = getTiers();
  const idx = Math.min(violationCount, tiers.length - 1);
  return tiers[idx].label;
}

const badWords = [
  "anjing", "babi", "bajingan", "banci", "bangsat", "bedebah",
  "bego", "bloon", "bodoh", "brengsek", "busuk",
  "campuran", "cebong", "cocot", "colok",
  "dajjal", "dungu",
  "edan", "eeek", "eek",
  "gak jelas", "gblg", "gelo", "gila", "goblog", "goblok",
  "hancur", "hina",
  "idiot", "itil",
  "jablay", "jahanam", "jancok", "jembut", "jomblo",
  "kafir", "kampret", "kampungan", "keparat", "kontol",
  "kurang ajar",
  "labrak", "laknat", "lonte",
  "matamu", "memek", "mental", "monyet", "munafik",
  "najis", "nakal", "ndas", "ngehe", "ngentot",
  "pantek", "parah", "pecun", "pekok", "perek",
  "sampah", "sial", "sialan", "sinting", "sontoloyo",
  "tai", "tlah", "tolol",
  "ukhwah", "umm",
  "ngaceng", "sange", "sangek",
  "coli", "onani", "masturbasi",
  "bispak", "bugil", "telanjang",
  "suami orang", "istri orang",
  "mesum", "cabul", "bejad",
  "fuck", "shit", "asshole", "bastard", "bitch",
  "damn", "dick", "pussy", "whore", "slut",
];

const appearanceKeywords = [
  "cantik", "ganteng", "cakep", "manis", "seksi",
  "body", "badan", "pinggang", "dada", "paha",
  "langsing", "gemuk", "gendut", "tinggi", "pendek",
  "kulit putih", "kulit hitam", "kulit kuning",
];

const datingKeywords = [
  "pacaran", "pacarnya", "mantan", "gebetan",
  "kencan", "date", "nge-date", "couple",
  "jadian", "putus", "pdkt",
  "sayang", "sayangku", "cinta", "love",
];

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();
}

function containsBadWord(text: string): { found: boolean; word?: string } {
  const normalized = normalizeText(text);
  for (const word of badWords) {
    const pattern = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (pattern.test(normalized)) {
      return { found: true, word };
    }
  }
  return { found: false };
}

function fuzzyMatch(text: string, keywords: string[]): boolean {
  const normalized = normalizeText(text);
  return keywords.some((kw) => {
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`\\b${escaped}`, "i");
    return pattern.test(normalized);
  });
}

function checkForAppearanceTalk(text: string): boolean {
  return fuzzyMatch(text, appearanceKeywords);
}

function checkForDatingTalk(text: string): boolean {
  return fuzzyMatch(text, datingKeywords);
}

export function checkMessageContent(text: string): AdabCheckResult {
  const badWordCheck = containsBadWord(text);
  if (badWordCheck.found) {
    return {
      passed: false,
      reason: "Pesan mengandung kata yang tidak pantas.",
      violationCategory: "bad_word",
    };
  }

  const hasAppearanceTalk = checkForAppearanceTalk(text);
  if (hasAppearanceTalk) {
    return {
      passed: false,
      reason: "Pesan mengandung pembahasan fisik.",
      violationCategory: "appearance",
    };
  }

  const hasDatingTalk = checkForDatingTalk(text);
  if (hasDatingTalk) {
    return {
      passed: false,
      reason: "Pesan mengandung bahasa pacaran.",
      violationCategory: "dating",
    };
  }

  return { passed: true };
}
