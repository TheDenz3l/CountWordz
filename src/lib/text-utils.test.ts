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

  it('handles multiple spaces between words', () => {
    expect(countWords('hello    world')).toBe(2);
    expect(countWords('one  two   three')).toBe(3);
  });

  it('handles punctuation', () => {
    expect(countWords('Hello, world!')).toBe(2);
    expect(countWords('Yes... maybe?')).toBe(2);
  });

  it('handles newlines and tabs', () => {
    expect(countWords('one\ntwo\nthree')).toBe(3);
    expect(countWords('one\ttwo\tthree')).toBe(3);
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

  it('counts newlines and tabs', () => {
    expect(countCharsWithSpaces('a\nb')).toBe(3);
    expect(countCharsWithSpaces('a\tb')).toBe(3);
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

  it('excludes all whitespace', () => {
    expect(countCharsWithoutSpaces('a b c')).toBe(3);
    expect(countCharsWithoutSpaces('a\nb\tc')).toBe(3);
  });
});

describe('countSentences', () => {
  it('returns 0 for empty string', () => {
    expect(countSentences('')).toBe(0);
  });

  it('counts single sentence', () => {
    expect(countSentences('Hello world.')).toBe(1);
  });

  it('counts multiple sentences', () => {
    expect(countSentences('First sentence. Second sentence.')).toBe(2);
    expect(countSentences('One! Two? Three.')).toBe(3);
  });

  it('handles abbreviations without false splits', () => {
    expect(countSentences('Dr. Smith went to Washington.')).toBe(1);
    expect(countSentences('Mr. Jones and Mrs. Brown are here.')).toBe(1);
    expect(countSentences('Prof. Lee teaches at 3 p.m. every day.')).toBe(1);
  });

  it('handles decimals without false splits', () => {
    expect(countSentences('The value is 3.14.')).toBe(1);
    expect(countSentences('Price: $19.99. Discount: 25%.')).toBe(2);
  });

  it('handles mixed sentence endings', () => {
    expect(countSentences('Really?! Yes! Wow...')).toBe(3);
  });
});

describe('countParagraphs', () => {
  it('returns 0 for empty string', () => {
    expect(countParagraphs('')).toBe(0);
  });

  it('counts single paragraph', () => {
    expect(countParagraphs('This is a paragraph.')).toBe(1);
  });

  it('counts multiple paragraphs', () => {
    expect(countParagraphs('First paragraph.\n\nSecond paragraph.')).toBe(2);
    expect(countParagraphs('One.\n\nTwo.\n\nThree.')).toBe(3);
  });

  it('handles multiple blank lines between paragraphs', () => {
    expect(countParagraphs('First.\n\n\n\nSecond.')).toBe(2);
  });

  it('handles paragraphs with multiple lines', () => {
    const text = `First paragraph
with multiple lines.

Second paragraph
also with multiple lines.`;
    expect(countParagraphs(text)).toBe(2);
  });
});

describe('estimateReadingTime', () => {
  it('returns 0 for empty text', () => {
    const result = estimateReadingTime('');
    expect(result).toEqual({ minutes: 0, seconds: 0, totalSeconds: 0 });
  });

  it('calculates reading time at default 200 WPM', () => {
    const result = estimateReadingTime('hello world'); // 2 words
    expect(result.totalSeconds).toBe(1); // 2/200 * 60 = 0.6, ceil = 1
  });

  it('calculates reading time for longer text', () => {
    const text = 'word '.repeat(200); // 200 words
    const result = estimateReadingTime(text, 200);
    expect(result).toEqual({ minutes: 1, seconds: 0, totalSeconds: 60 });
  });

  it('supports custom WPM', () => {
    const text = 'word '.repeat(100); // 100 words
    const result = estimateReadingTime(text, 100);
    expect(result).toEqual({ minutes: 1, seconds: 0, totalSeconds: 60 });
  });
});

describe('estimateSpeakingTime', () => {
  it('returns 0 for empty text', () => {
    const result = estimateSpeakingTime('');
    expect(result).toEqual({ minutes: 0, seconds: 0, totalSeconds: 0 });
  });

  it('calculates speaking time at default 140 WPM', () => {
    const text = 'word '.repeat(140); // 140 words
    const result = estimateSpeakingTime(text, 140);
    expect(result).toEqual({ minutes: 1, seconds: 0, totalSeconds: 60 });
  });

  it('supports custom WPM', () => {
    const text = 'word '.repeat(100); // 100 words
    const result = estimateSpeakingTime(text, 100);
    expect(result.totalSeconds).toBe(60); // 100/100 * 60 = 60
  });
});

describe('getTextStats', () => {
  it('returns comprehensive stats for text', () => {
    const text = 'Hello world. This is a test.';
    const stats = getTextStats(text);
    
    expect(stats.words).toBe(6);
    expect(stats.charactersWithSpaces).toBe(28); // Actual count: "Hello world. This is a test." = 28 chars
    expect(stats.sentences).toBe(2);
    expect(stats.paragraphs).toBe(1);
    expect(stats.readingTime.totalSeconds).toBeGreaterThanOrEqual(0);
    expect(stats.speakingTime.totalSeconds).toBeGreaterThanOrEqual(0);
  });

  it('returns zeros for empty text', () => {
    const stats = getTextStats('');
    
    expect(stats.words).toBe(0);
    expect(stats.charactersWithSpaces).toBe(0);
    expect(stats.sentences).toBe(0);
    expect(stats.paragraphs).toBe(0);
  });
});
