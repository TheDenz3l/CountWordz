/**
 * Readability Formulas
 * Flesch Reading Ease and Flesch-Kincaid Grade Level implementations
 */

import { countWords, countSentences } from './text-utils';
import { countSyllables } from './syllable';

/**
 * Calculate Flesch Reading Ease score
 * Formula: 206.835 - 1.015 * (words/sentences) - 84.6 * (syllables/words)
 * Score range: 0-100 (higher = easier to read)
 * 
 * @param text - The text to analyze
 * @returns Flesch Reading Ease score (0-100)
 */
export function calculateFleschReadingEase(text: string): number {
  const words = countWords(text);
  const sentences = countSentences(text);
  const { total: syllables } = countSyllables(text);
  
  // Handle edge cases
  if (words === 0 || sentences === 0) return 0;
  
  const score = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
  
  // Clamp to 0-100 range
  return Math.max(0, Math.min(100, Math.round(score * 10) / 10));
}

/**
 * Calculate Flesch-Kincaid Grade Level
 * Formula: 0.39 * (words/sentences) + 11.8 * (syllables/words) - 15.59
 * Score represents US grade level needed to understand the text
 * 
 * @param text - The text to analyze
 * @returns Flesch-Kincaid Grade Level (US grade level)
 */
export function calculateFleschKincaidGrade(text: string): number {
  const words = countWords(text);
  const sentences = countSentences(text);
  const { total: syllables } = countSyllables(text);
  
  // Handle edge cases
  if (words === 0 || sentences === 0) return 0;
  
  const score = 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59;
  
  // Round to 1 decimal place
  return Math.round(score * 10) / 10;
}

/**
 * Get plain English interpretation of Flesch Reading Ease score
 * 
 * @param score - Flesch Reading Ease score (0-100)
 * @returns Plain English label and description
 */
export function getReadabilityLabel(score: number): {
  label: 'Very Easy' | 'Easy' | 'Moderate' | 'Difficult' | 'Very Difficult';
  description: string;
  gradeRange: string;
} {
  if (score >= 90) {
    return {
      label: 'Very Easy',
      description: 'Easily understood by an average 11-year-old student',
      gradeRange: '5th grade and below',
    };
  } else if (score >= 80) {
    return {
      label: 'Easy',
      description: 'Conversational English for consumers',
      gradeRange: '6th-7th grade',
    };
  } else if (score >= 70) {
    return {
      label: 'Fairly Easy',
      description: 'Easily understood by 13- to 15-year-old students',
      gradeRange: '8th-9th grade',
    };
  } else if (score >= 60) {
    return {
      label: 'Moderate',
      description: 'Plain English for general audience',
      gradeRange: '10th-12th grade',
    };
  } else if (score >= 50) {
    return {
      label: 'Fairly Difficult',
      description: 'Best understood by college students',
      gradeRange: 'College level',
    };
  } else if (score >= 30) {
    return {
      label: 'Difficult',
      description: 'Best understood by college graduates',
      gradeRange: 'College graduate level',
    };
  } else {
    return {
      label: 'Very Difficult',
      description: 'Best understood by university graduates and professionals',
      gradeRange: 'Professional level',
    };
  }
}

/**
 * Get comprehensive readability analysis
 * 
 * @param text - The text to analyze
 * @returns Complete readability analysis with scores and interpretations
 */
export function getReadabilityAnalysis(text: string): {
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
  const sentences = countSentences(text);
  const { total: syllables, average: avgSyllablesPerWord } = countSyllables(text);
  
  const fleschReadingEase = calculateFleschReadingEase(text);
  const fleschKincaidGrade = calculateFleschKincaidGrade(text);
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
