import { describe, it, expect } from 'vitest';
import {
  calculateFleschReadingEase,
  calculateFleschKincaidGrade,
  getReadabilityLabel,
  getReadabilityAnalysis,
} from './readability';

describe('calculateFleschReadingEase', () => {
  it('returns 0 for empty text', () => {
    expect(calculateFleschReadingEase('')).toBe(0);
  });

  it('calculates score for simple text', () => {
    const text = 'The cat sat on the mat. The dog ran in the park.';
    const score = calculateFleschReadingEase(text);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('supports locale-aware sentence parsing', () => {
    const score = calculateFleschReadingEase('El Dr. Gómez llegó temprano. La clase empezó enseguida.', 'es');
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});

describe('calculateFleschKincaidGrade', () => {
  it('returns 0 for empty text', () => {
    expect(calculateFleschKincaidGrade('')).toBe(0);
  });

  it('gives lower grade for simpler text', () => {
    const simpleText = 'I am here. You are too. We sit. They run.';
    const complexText = 'The implementation of sophisticated methodologies requires comprehensive understanding.';

    const simpleGrade = calculateFleschKincaidGrade(simpleText);
    const complexGrade = calculateFleschKincaidGrade(complexText);

    expect(simpleGrade).toBeLessThan(complexGrade);
  });
});

describe('getReadabilityLabel', () => {
  it('returns expected bands', () => {
    expect(getReadabilityLabel(95).label).toBe('Very Easy');
    expect(getReadabilityLabel(85).label).toBe('Easy');
    expect(getReadabilityLabel(75).label).toBe('Fairly Easy');
    expect(getReadabilityLabel(65).label).toBe('Moderate');
    expect(getReadabilityLabel(55).label).toBe('Fairly Difficult');
    expect(getReadabilityLabel(40).label).toBe('Difficult');
    expect(getReadabilityLabel(20).label).toBe('Very Difficult');
  });
});

describe('getReadabilityAnalysis', () => {
  it('returns comprehensive analysis for text', () => {
    const text = 'The cat sat on the mat. The dog ran in the park. Children played happily.';
    const analysis = getReadabilityAnalysis(text);

    expect(analysis.fleschReadingEase).toBeGreaterThanOrEqual(0);
    expect(analysis.fleschReadingEase).toBeLessThanOrEqual(100);
    expect(analysis.words).toBeGreaterThan(0);
    expect(analysis.sentences).toBeGreaterThan(0);
    expect(analysis.syllables).toBeGreaterThan(0);
    expect(analysis.avgWordsPerSentence).toBeGreaterThan(0);
    expect(analysis.avgSyllablesPerWord).toBeGreaterThan(0);
  });

  it('returns zeros for empty text', () => {
    const analysis = getReadabilityAnalysis('');
    expect(analysis.fleschReadingEase).toBe(0);
    expect(analysis.fleschKincaidGrade).toBe(0);
    expect(analysis.words).toBe(0);
    expect(analysis.sentences).toBe(0);
    expect(analysis.syllables).toBe(0);
  });
});
