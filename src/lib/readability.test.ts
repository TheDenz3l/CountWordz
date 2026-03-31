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

  it('returns reasonable score for single word', () => {
    const score = calculateFleschReadingEase('hello');
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('calculates score for simple text', () => {
    const text = 'The cat sat on the mat. The dog ran in the park.';
    const score = calculateFleschReadingEase(text);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('gives higher score for simpler text', () => {
    const simpleText = 'I am here. You are too. We all sit. They all run.';
    const complexText = 'The implementation of sophisticated methodologies requires comprehensive understanding.';
    
    const simpleScore = calculateFleschReadingEase(simpleText);
    const complexScore = calculateFleschReadingEase(complexText);
    
    expect(simpleScore).toBeGreaterThan(complexScore);
  });
});

describe('calculateFleschKincaidGrade', () => {
  it('returns 0 for empty text', () => {
    expect(calculateFleschKincaidGrade('')).toBe(0);
  });

  it('returns reasonable grade for single word', () => {
    const grade = calculateFleschKincaidGrade('hello');
    expect(grade).toBeGreaterThanOrEqual(-5);
    expect(grade).toBeLessThan(20);
  });

  it('calculates grade level for simple text', () => {
    const text = 'The cat sat on the mat. The dog ran in the park.';
    const grade = calculateFleschKincaidGrade(text);
    expect(grade).toBeLessThan(10);
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
  it('returns Very Easy for 90-100', () => {
    expect(getReadabilityLabel(95).label).toBe('Very Easy');
    expect(getReadabilityLabel(90).label).toBe('Very Easy');
  });

  it('returns Easy for 80-89', () => {
    expect(getReadabilityLabel(85).label).toBe('Easy');
    expect(getReadabilityLabel(80).label).toBe('Easy');
  });

  it('returns Fairly Easy for 70-79', () => {
    expect(getReadabilityLabel(75).label).toBe('Fairly Easy');
    expect(getReadabilityLabel(70).label).toBe('Fairly Easy');
  });

  it('returns Moderate for 60-69', () => {
    expect(getReadabilityLabel(65).label).toBe('Moderate');
    expect(getReadabilityLabel(60).label).toBe('Moderate');
  });

  it('returns Fairly Difficult for 50-59', () => {
    expect(getReadabilityLabel(55).label).toBe('Fairly Difficult');
    expect(getReadabilityLabel(50).label).toBe('Fairly Difficult');
  });

  it('returns Difficult for 30-49', () => {
    expect(getReadabilityLabel(40).label).toBe('Difficult');
    expect(getReadabilityLabel(30).label).toBe('Difficult');
  });

  it('returns Very Difficult for 0-29', () => {
    expect(getReadabilityLabel(20).label).toBe('Very Difficult');
    expect(getReadabilityLabel(0).label).toBe('Very Difficult');
  });

  it('includes description and gradeRange', () => {
    const result = getReadabilityLabel(65);
    expect(result.description).toBeDefined();
    expect(result.gradeRange).toBeDefined();
  });
});

describe('getReadabilityAnalysis', () => {
  it('returns comprehensive analysis for text', () => {
    const text = 'The cat sat on the mat. The dog ran in the park. Children played happily.';
    const analysis = getReadabilityAnalysis(text);
    
    expect(analysis.fleschReadingEase).toBeGreaterThanOrEqual(0);
    expect(analysis.fleschReadingEase).toBeLessThanOrEqual(100);
    expect(analysis.fleschKincaidGrade).toBeGreaterThanOrEqual(-5);
    expect(analysis.label.label).toBeDefined();
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
