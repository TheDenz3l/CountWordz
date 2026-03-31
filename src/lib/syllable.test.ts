import { describe, it, expect } from 'vitest';
import { countSyllablesInWord, countSyllables, getSyllableDistribution, SYLLABLE_DISCLAIMER } from './syllable';

describe('countSyllablesInWord', () => {
  it('returns 0 for empty string', () => {
    expect(countSyllablesInWord('')).toBe(0);
  });

  it('returns 0 for non-alphabetic characters', () => {
    expect(countSyllablesInWord('123')).toBe(0);
    expect(countSyllablesInWord('!@#')).toBe(0);
  });

  it('counts syllables in simple words', () => {
    expect(countSyllablesInWord('cat')).toBe(1);
    expect(countSyllablesInWord('dog')).toBe(1);
    expect(countSyllablesInWord('book')).toBe(1);
  });

  it('counts syllables in multi-syllable words', () => {
    expect(countSyllablesInWord('hello')).toBe(2);
    expect(countSyllablesInWord('beautiful')).toBe(3);
    expect(countSyllablesInWord('information')).toBe(4);
  });

  it('handles mixed case', () => {
    expect(countSyllablesInWord('HELLO')).toBe(2);
    expect(countSyllablesInWord('Hello')).toBe(2);
    expect(countSyllablesInWord('hElLo')).toBe(2);
  });

  it('strips non-alphabetic characters', () => {
    expect(countSyllablesInWord('hello!')).toBe(2);
    expect(countSyllablesInWord('test123')).toBe(1); // "test" = 1 syllable
  });
});

describe('countSyllables', () => {
  it('returns empty result for empty string', () => {
    const result = countSyllables('');
    expect(result).toEqual({ total: 0, words: [], average: 0 });
  });

  it('counts syllables in single word', () => {
    const result = countSyllables('hello');
    expect(result.total).toBe(2);
    expect(result.words).toHaveLength(1);
    expect(result.words[0]).toEqual({ word: 'hello', syllables: 2 });
    expect(result.average).toBe(2);
  });

  it('counts syllables in multiple words', () => {
    const result = countSyllables('hello world');
    expect(result.total).toBe(3); // hel-lo (2) + world (1) = 3
    expect(result.words).toHaveLength(2);
  });

  it('calculates average syllables per word', () => {
    const result = countSyllables('cat dog bird');
    // cat (1) + dog (1) + bird (1) = 3 total, 3 words, avg = 1
    expect(result.average).toBe(1);
  });

  it('handles mixed syllable counts', () => {
    const result = countSyllables('I am testing');
    // I (1) + am (1) + tes-ting (2) = 4 total, 3 words, avg = 1.33
    expect(result.total).toBeGreaterThanOrEqual(3);
    expect(result.average).toBeGreaterThan(1);
  });
});

describe('getSyllableDistribution', () => {
  it('returns zeros for empty string', () => {
    const result = getSyllableDistribution('');
    expect(result).toEqual({
      oneSyllable: 0,
      twoSyllables: 0,
      threeOrMoreSyllables: 0,
      totalWords: 0,
    });
  });

  it('categorizes words by syllable count', () => {
    const result = getSyllableDistribution('cat hello beautiful');
    // cat (1), hel-lo (2), beau-ti-ful (3+)
    expect(result.oneSyllable).toBeGreaterThanOrEqual(1);
    expect(result.twoSyllables).toBeGreaterThanOrEqual(1);
    expect(result.threeOrMoreSyllables).toBeGreaterThanOrEqual(1);
    expect(result.totalWords).toBe(3);
  });

  it('handles all same syllable count', () => {
    const result = getSyllableDistribution('cat dog bird');
    expect(result.oneSyllable).toBe(3);
    expect(result.twoSyllables).toBe(0);
    expect(result.threeOrMoreSyllables).toBe(0);
  });
});

describe('SYLLABLE_DISCLAIMER', () => {
  it('contains estimation warning', () => {
    expect(SYLLABLE_DISCLAIMER).toContain('Estimated');
    expect(SYLLABLE_DISCLAIMER).toContain('complex');
  });
});
