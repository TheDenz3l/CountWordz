import type { Locale } from './i18n';

const SENTENCE_ABBREVIATIONS: Record<Locale, string[]> = {
  en: ['Mr', 'Mrs', 'Ms', 'Dr', 'Prof', 'Sr', 'Jr', 'vs', 'etc', 'i.e', 'e.g', 'a.m', 'p.m', 'am', 'pm'],
  es: ['Sr', 'Sra', 'Srta', 'Dr', 'Dra', 'Prof', 'Ing', 'Lic', 'Ud', 'Uds', 'etc', 'p.ej', 'aprox', 'av'],
  fr: ['M', 'Mme', 'Mlle', 'Dr', 'Pr', 'etc', 'p.ex', 'av'],
  de: ['Hr', 'Fr', 'Dr', 'Prof', 'bzw', 'z.B', 'u.a', 'ca', 'etc'],
  pt: ['Sr', 'Sra', 'Srta', 'Dr', 'Dra', 'Prof', 'etc', 'p.ex', 'aprox'],
};

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Count words in text
 * Handles multiple spaces, punctuation, and edge cases
 */
export function countWords(text: string): number {
  if (!text || text.trim() === '') return 0;

  const words = text.trim().split(/\s+/).filter(word => word.length > 0);
  return words.length;
}

/**
 * Extract word-like tokens while preserving accented Latin characters.
 * Useful for analysis tasks where punctuation should not become part of the token.
 */
export function extractWordTokens(text: string): string[] {
  if (!text || text.trim() === '') return [];

  const matches = text.normalize('NFC').match(/\p{L}[\p{L}\p{M}'’.-]*/gu) ?? [];

  return matches
    .map(token => token.replace(/^[\-'’.]+|[\-'’.]+$/gu, ''))
    .filter(Boolean);
}

/**
 * Count characters with spaces
 */
export function countCharsWithSpaces(text: string): number {
  return text.length;
}

/**
 * Count characters without spaces
 */
export function countCharsWithoutSpaces(text: string): number {
  return text.replace(/\s/g, '').length;
}

/**
 * Count sentences in text
 * Handles locale-specific abbreviations and decimals without false splits
 */
export function countSentences(text: string, locale: Locale = 'en'): number {
  if (!text || text.trim() === '') return 0;

  let protectedText = text.normalize('NFC');
  const abbreviations = SENTENCE_ABBREVIATIONS[locale] ?? SENTENCE_ABBREVIATIONS.en;

  abbreviations
    .slice()
    .sort((a, b) => b.length - a.length)
    .forEach((abbr) => {
      const pattern = new RegExp(`\\b${escapeRegex(abbr)}\\.`, 'giu');
      protectedText = protectedText.replace(pattern, `${abbr}__ABBREV__`);
    });

  protectedText = protectedText.replace(/(?<=\d)\.(?=\d)/gu, '__DECIMAL__');

  const sentences = protectedText
    .split(/[.!?]+(?=\s+|$)/u)
    .map(sentence => sentence.replace(/__ABBREV__/g, '.').replace(/__DECIMAL__/g, '.').trim())
    .filter(sentence => sentence.length > 0);

  if (sentences.length > 0) {
    return sentences.length;
  }

  return text.trim().length > 0 ? 1 : 0;
}

/**
 * Count paragraphs in text
 * Paragraphs are separated by one or more blank lines
 */
export function countParagraphs(text: string): number {
  if (!text || text.trim() === '') return 0;

  const paragraphs = text.trim().split(/\n\s*\n/).filter(p => p.trim().length > 0);
  return paragraphs.length;
}

/**
 * Estimate reading time in minutes and seconds
 */
export function estimateReadingTime(text: string, wpm: number = 200): { minutes: number; seconds: number; totalSeconds: number } {
  const words = countWords(text);
  const totalSeconds = Math.ceil((words / wpm) * 60);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return { minutes, seconds, totalSeconds };
}

/**
 * Estimate speaking time in minutes and seconds
 */
export function estimateSpeakingTime(text: string, wpm: number = 140): { minutes: number; seconds: number; totalSeconds: number } {
  const words = countWords(text);
  const totalSeconds = Math.ceil((words / wpm) * 60);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return { minutes, seconds, totalSeconds };
}

/**
 * Get comprehensive text statistics
 */
export function getTextStats(text: string, locale: Locale = 'en') {
  const words = countWords(text);
  const readingTime = estimateReadingTime(text);
  const speakingTime = estimateSpeakingTime(text);

  return {
    words,
    charactersWithSpaces: countCharsWithSpaces(text),
    charactersWithoutSpaces: countCharsWithoutSpaces(text),
    sentences: countSentences(text, locale),
    paragraphs: countParagraphs(text),
    readingTime,
    speakingTime,
  };
}
