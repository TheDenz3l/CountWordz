/**
 * Syllable Counting Utility
 * Wrapper around the syllable library with error handling and estimation labeling
 */

import { syllable } from 'syllable';

/**
 * Count syllables in a single word
 * Uses the syllable library for accurate English syllable counting
 */
export function countSyllablesInWord(word: string): number {
  if (!word || word.trim() === '') return 0;
  
  // Clean the word - remove non-alphabetic characters
  const cleanWord = word.replace(/[^a-zA-Z]/g, '');
  if (cleanWord.length === 0) return 0;
  
  return syllable(cleanWord);
}

/**
 * Count total syllables in text
 * Returns total syllable count and per-word breakdown
 */
export function countSyllables(text: string): {
  total: number;
  words: Array<{ word: string; syllables: number }>;
  average: number;
} {
  if (!text || text.trim() === '') {
    return { total: 0, words: [], average: 0 };
  }
  
  // Split into words (alphabetic only)
  const words = text.trim().split(/\s+/).filter(w => w.length > 0);
  
  const wordSyllables = words.map(word => {
    const cleanWord = word.replace(/[^a-zA-Z]/g, '');
    const syllables = cleanWord.length > 0 ? syllable(cleanWord) : 0;
    return {
      word: cleanWord,
      syllables,
    };
  }).filter(w => w.word.length > 0);
  
  const total = wordSyllables.reduce((sum, w) => sum + w.syllables, 0);
  const average = wordSyllables.length > 0 
    ? total / wordSyllables.length 
    : 0;
  
  return {
    total,
    words: wordSyllables,
    average: Math.round(average * 100) / 100, // Round to 2 decimal places
  };
}

/**
 * Get syllable distribution
 * Returns count of words by syllable count (1 syllable, 2 syllables, 3+ syllables)
 */
export function getSyllableDistribution(text: string): {
  oneSyllable: number;
  twoSyllables: number;
  threeOrMoreSyllables: number;
  totalWords: number;
} {
  const { words } = countSyllables(text);
  
  const distribution = {
    oneSyllable: 0,
    twoSyllables: 0,
    threeOrMoreSyllables: 0,
    totalWords: words.length,
  };
  
  words.forEach(w => {
    if (w.syllables === 1) {
      distribution.oneSyllable++;
    } else if (w.syllables === 2) {
      distribution.twoSyllables++;
    } else if (w.syllables >= 3) {
      distribution.threeOrMoreSyllables++;
    }
  });
  
  return distribution;
}

/**
 * Disclaimer text for UI display
 * Syllable counting is inherently imperfect for English
 */
export const SYLLABLE_DISCLAIMER = 'Estimated syllable count. English syllable rules are complex and may vary by dialect.';
