import { syllable } from 'syllable';
import type { Locale } from './i18n';
import { extractWordTokens } from './text-utils';

const VOWELS_BY_LOCALE: Record<Locale, Set<string>> = {
  en: new Set(['a', 'e', 'i', 'o', 'u', 'y']),
  es: new Set(['a', 'e', 'i', 'o', 'u', 'á', 'é', 'í', 'ó', 'ú', 'ü', 'y']),
  fr: new Set(['a', 'e', 'i', 'o', 'u', 'y', 'à', 'â', 'ä', 'æ', 'é', 'è', 'ê', 'ë', 'î', 'ï', 'ô', 'œ', 'ù', 'û', 'ü', 'ÿ']),
  de: new Set(['a', 'e', 'i', 'o', 'u', 'y', 'ä', 'ö', 'ü']),
  pt: new Set(['a', 'e', 'i', 'o', 'u', 'á', 'à', 'â', 'ã', 'é', 'ê', 'í', 'ó', 'ô', 'õ', 'ú', 'ü']),
};

function cleanWord(word: string): string {
  return word.normalize('NFC').replace(/[^\p{L}]/gu, '');
}

function isAsciiWord(word: string): boolean {
  return /^[A-Za-z]+$/.test(word);
}

function preprocessForLocale(word: string, locale: Locale): string {
  let normalized = word.toLowerCase();

  if (locale === 'es' || locale === 'pt' || locale === 'fr') {
    normalized = normalized
      .replace(/qu(?=[eiéèêí])/gu, 'q')
      .replace(/gu(?=[eiéèêí])/gu, 'g');
  }

  return normalized;
}

function countHeuristicSyllables(word: string, locale: Locale): number {
  const lower = preprocessForLocale(cleanWord(word), locale);
  if (!lower) return 0;

  const vowels = VOWELS_BY_LOCALE[locale] ?? VOWELS_BY_LOCALE.en;
  const chars = Array.from(lower);
  let groups = 0;
  let previousWasVowel = false;

  for (const char of chars) {
    const isVowel = vowels.has(char);
    if (isVowel && !previousWasVowel) {
      groups += 1;
    }
    previousWasVowel = isVowel;
  }

  if (locale === 'fr' && groups > 1) {
    if (/(e|es|ent)$/u.test(lower)) {
      groups -= 1;
    }
  }

  return Math.max(1, groups);
}

/**
 * Count syllables in a single word
 * Uses the library for plain-English words and a unicode-aware heuristic fallback elsewhere.
 */
export function countSyllablesInWord(word: string, locale: Locale = 'en'): number {
  if (!word || word.trim() === '') return 0;

  const clean = cleanWord(word);
  if (clean.length === 0) return 0;

  if (locale === 'en' && isAsciiWord(clean)) {
    return syllable(clean);
  }

  return countHeuristicSyllables(clean, locale);
}

/**
 * Count total syllables in text
 */
export function countSyllables(text: string, locale: Locale = 'en'): {
  total: number;
  words: Array<{ word: string; syllables: number }>;
  average: number;
} {
  if (!text || text.trim() === '') {
    return { total: 0, words: [], average: 0 };
  }

  const tokens = extractWordTokens(text);

  const wordSyllables = tokens
    .map((word) => {
      const clean = cleanWord(word);
      return {
        word: clean,
        syllables: countSyllablesInWord(clean, locale),
      };
    })
    .filter((entry) => entry.word.length > 0);

  const total = wordSyllables.reduce((sum, item) => sum + item.syllables, 0);
  const average = wordSyllables.length > 0 ? total / wordSyllables.length : 0;

  return {
    total,
    words: wordSyllables,
    average: Math.round(average * 100) / 100,
  };
}

/**
 * Get syllable distribution
 */
export function getSyllableDistribution(text: string, locale: Locale = 'en'): {
  oneSyllable: number;
  twoSyllables: number;
  threeOrMoreSyllables: number;
  totalWords: number;
} {
  const { words } = countSyllables(text, locale);

  const distribution = {
    oneSyllable: 0,
    twoSyllables: 0,
    threeOrMoreSyllables: 0,
    totalWords: words.length,
  };

  words.forEach((word) => {
    if (word.syllables === 1) {
      distribution.oneSyllable += 1;
    } else if (word.syllables === 2) {
      distribution.twoSyllables += 1;
    } else if (word.syllables >= 3) {
      distribution.threeOrMoreSyllables += 1;
    }
  });

  return distribution;
}

export const SYLLABLE_DISCLAIMER = 'Estimated syllable count. Syllable rules vary by language and dialect.';
