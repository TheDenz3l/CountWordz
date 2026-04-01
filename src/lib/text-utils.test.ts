import { describe, it, expect } from 'vitest';
import {
  countWords,
  countCharsWithSpaces,
  countCharsWithoutSpaces,
  countSentences,
  countParagraphs,
  estimateReadingTime,
  estimateSpeakingTime,
  getTextStats,
  extractWordTokens,
} from './text-utils';

describe('countWords', () => {
  it('returns 0 for empty string', () => {
    expect(countWords('')).toBe(0);
  });

  it('returns 0 for whitespace only', () => {
    expect(countWords('   ')).toBe(0);
    expect(countWords('\n\t')).toBe(0);
  });

  it('counts single word', () => {
    expect(countWords('hello')).toBe(1);
  });

  it('counts multiple words', () => {
    expect(countWords('hello world')).toBe(2);
    expect(countWords('The quick brown fox')).toBe(4);
  });

  it('handles punctuation', () => {
    expect(countWords('Hello, world!')).toBe(2);
    expect(countWords('Yes... maybe?')).toBe(2);
  });
});

describe('extractWordTokens', () => {
  it('extracts accented latin tokens', () => {
    expect(extractWordTokens('Olá, ação! Über-cool déjà-vu.')).toEqual(['Olá', 'ação', 'Über-cool', 'déjà-vu']);
  });

  it('returns empty array for empty text', () => {
    expect(extractWordTokens('')).toEqual([]);
  });
});

describe('countCharsWithSpaces', () => {
  it('returns 0 for empty string', () => {
    expect(countCharsWithSpaces('')).toBe(0);
  });

  it('counts all characters including spaces', () => {
    expect(countCharsWithSpaces('hello')).toBe(5);
    expect(countCharsWithSpaces('hello world')).toBe(11);
  });
});

describe('countCharsWithoutSpaces', () => {
  it('returns 0 for empty string', () => {
    expect(countCharsWithoutSpaces('')).toBe(0);
  });

  it('counts characters excluding spaces', () => {
    expect(countCharsWithoutSpaces('hello')).toBe(5);
    expect(countCharsWithoutSpaces('hello world')).toBe(10);
  });
});

describe('countSentences', () => {
  it('returns 0 for empty string', () => {
    expect(countSentences('')).toBe(0);
  });

  it('counts multiple sentences', () => {
    expect(countSentences('First sentence. Second sentence.')).toBe(2);
    expect(countSentences('One! Two? Three.')).toBe(3);
  });

  it('handles English abbreviations without false splits', () => {
    expect(countSentences('Dr. Smith went to Washington.')).toBe(1);
    expect(countSentences('Mr. Jones and Mrs. Brown are here.')).toBe(1);
    expect(countSentences('Prof. Lee teaches at 3 p.m. every day.')).toBe(1);
  });

  it('handles locale-specific abbreviations', () => {
    expect(countSentences('El Dr. Gómez llegó temprano.', 'es')).toBe(1);
    expect(countSentences('Mme. Dupont est ici.', 'fr')).toBe(1);
    expect(countSentences('Hr. Weber ist da.', 'de')).toBe(1);
    expect(countSentences('O Dr. Silva chegou.', 'pt')).toBe(1);
  });

  it('handles decimals without false splits', () => {
    expect(countSentences('The value is 3.14.')).toBe(1);
    expect(countSentences('Price: $19.99. Discount: 25%.')).toBe(2);
  });
});

describe('countParagraphs', () => {
  it('counts paragraphs separated by blank lines', () => {
    expect(countParagraphs('First paragraph.\n\nSecond paragraph.')).toBe(2);
  });
});

describe('estimateReadingTime', () => {
  it('returns 0 for empty text', () => {
    const result = estimateReadingTime('');
    expect(result).toEqual({ minutes: 0, seconds: 0, totalSeconds: 0 });
  });

  it('supports custom WPM', () => {
    const text = 'word '.repeat(100);
    const result = estimateReadingTime(text, 100);
    expect(result).toEqual({ minutes: 1, seconds: 0, totalSeconds: 60 });
  });
});

describe('estimateSpeakingTime', () => {
  it('returns 0 for empty text', () => {
    const result = estimateSpeakingTime('');
    expect(result).toEqual({ minutes: 0, seconds: 0, totalSeconds: 0 });
  });
});

describe('getTextStats', () => {
  it('returns locale-aware sentence counts', () => {
    const stats = getTextStats('El Dr. Gómez llegó temprano.', 'es');
    expect(stats.sentences).toBe(1);
    expect(stats.words).toBe(5);
  });

  it('returns zeros for empty text', () => {
    const stats = getTextStats('');
    expect(stats.words).toBe(0);
    expect(stats.sentences).toBe(0);
    expect(stats.paragraphs).toBe(0);
  });
});
