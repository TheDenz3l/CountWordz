import { describe, it, expect } from 'vitest';
import { countSyllablesInWord, countSyllables, getSyllableDistribution, SYLLABLE_DISCLAIMER } from './syllable';

describe('countSyllablesInWord', () => {
  it('returns 0 for empty string', () => {
    expect(countSyllablesInWord('')).toBe(0);
  });

  it('counts English syllables with library support', () => {
    expect(countSyllablesInWord('cat')).toBe(1);
    expect(countSyllablesInWord('hello')).toBe(2);
    expect(countSyllablesInWord('beautiful')).toBe(3);
  });

  it('counts accented words with locale heuristics', () => {
    expect(countSyllablesInWord('acción', 'es')).toBeGreaterThanOrEqual(2);
    expect(countSyllablesInWord('oração', 'pt')).toBeGreaterThanOrEqual(3);
    expect(countSyllablesInWord('über', 'de')).toBeGreaterThanOrEqual(2);
  });
});

describe('countSyllables', () => {
  it('returns empty result for empty string', () => {
    const result = countSyllables('');
    expect(result).toEqual({ total: 0, words: [], average: 0 });
  });

  it('counts syllables in multiple English words', () => {
    const result = countSyllables('hello world');
    expect(result.total).toBe(3);
    expect(result.words).toHaveLength(2);
  });

  it('keeps unicode words intact', () => {
    const result = countSyllables('ação útil', 'pt');
    expect(result.words.map(word => word.word)).toEqual(['ação', 'útil']);
    expect(result.total).toBeGreaterThanOrEqual(4);
  });
});

describe('getSyllableDistribution', () => {
  it('categorizes words by syllable count', () => {
    const result = getSyllableDistribution('cat hello beautiful');
    expect(result.oneSyllable).toBeGreaterThanOrEqual(1);
    expect(result.twoSyllables).toBeGreaterThanOrEqual(1);
    expect(result.threeOrMoreSyllables).toBeGreaterThanOrEqual(1);
    expect(result.totalWords).toBe(3);
  });
});

describe('SYLLABLE_DISCLAIMER', () => {
  it('mentions estimation and language variation', () => {
    expect(SYLLABLE_DISCLAIMER).toContain('Estimated');
    expect(SYLLABLE_DISCLAIMER).toContain('language');
  });
});
