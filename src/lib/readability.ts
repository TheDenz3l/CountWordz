import type { Locale } from './i18n';
import { countWords, countSentences } from './text-utils';
import { countSyllables } from './syllable';

export type ReadabilityLabel =
  | 'Very Easy'
  | 'Easy'
  | 'Fairly Easy'
  | 'Moderate'
  | 'Fairly Difficult'
  | 'Difficult'
  | 'Very Difficult';

/**
 * Calculate Flesch Reading Ease score
 */
export function calculateFleschReadingEase(text: string, locale: Locale = 'en'): number {
  const words = countWords(text);
  const sentences = countSentences(text, locale);
  const { total: syllables } = countSyllables(text, locale);

  if (words === 0 || sentences === 0) return 0;

  const score = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
  return Math.max(0, Math.min(100, Math.round(score * 10) / 10));
}

/**
 * Calculate Flesch-Kincaid Grade Level
 */
export function calculateFleschKincaidGrade(text: string, locale: Locale = 'en'): number {
  const words = countWords(text);
  const sentences = countSentences(text, locale);
  const { total: syllables } = countSyllables(text, locale);

  if (words === 0 || sentences === 0) return 0;

  const score = 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59;
  return Math.round(score * 10) / 10;
}

/**
 * Get plain-language interpretation of Flesch Reading Ease score
 */
export function getReadabilityLabel(score: number): {
  label: ReadabilityLabel;
  description: string;
  gradeRange: string;
} {
  if (score >= 90) {
    return {
      label: 'Very Easy',
      description: 'Easily understood by an average 11-year-old student',
      gradeRange: '5th grade and below',
    };
  }

  if (score >= 80) {
    return {
      label: 'Easy',
      description: 'Conversational English for consumers',
      gradeRange: '6th-7th grade',
    };
  }

  if (score >= 70) {
    return {
      label: 'Fairly Easy',
      description: 'Easily understood by 13- to 15-year-old students',
      gradeRange: '8th-9th grade',
    };
  }

  if (score >= 60) {
    return {
      label: 'Moderate',
      description: 'Plain English for general audience',
      gradeRange: '10th-12th grade',
    };
  }

  if (score >= 50) {
    return {
      label: 'Fairly Difficult',
      description: 'Best understood by college students',
      gradeRange: 'College level',
    };
  }

  if (score >= 30) {
    return {
      label: 'Difficult',
      description: 'Best understood by college graduates',
      gradeRange: 'College graduate level',
    };
  }

  return {
    label: 'Very Difficult',
    description: 'Best understood by university graduates and professionals',
    gradeRange: 'Professional level',
  };
}

/**
 * Get comprehensive readability analysis
 */
export function getReadabilityAnalysis(text: string, locale: Locale = 'en'): {
  fleschReadingEase: number;
  fleschKincaidGrade: number;
  label: ReturnType<typeof getReadabilityLabel>;
  words: number;
  sentences: number;
  syllables: number;
  avgWordsPerSentence: number;
  avgSyllablesPerWord: number;
} {
  const words = countWords(text);
  const sentences = countSentences(text, locale);
  const { total: syllables, average: avgSyllablesPerWord } = countSyllables(text, locale);

  const fleschReadingEase = calculateFleschReadingEase(text, locale);
  const fleschKincaidGrade = calculateFleschKincaidGrade(text, locale);
  const label = getReadabilityLabel(fleschReadingEase);
  const avgWordsPerSentence = sentences > 0 ? Math.round((words / sentences) * 10) / 10 : 0;

  return {
    fleschReadingEase,
    fleschKincaidGrade,
    label,
    words,
    sentences,
    syllables,
    avgWordsPerSentence,
    avgSyllablesPerWord,
  };
}
