/**
 * Text Processing Utilities
 * Core counting functions for CountWordz text analysis tools
 */

/**
 * Count words in text
 * Handles multiple spaces, punctuation, and edge cases
 */
export function countWords(text: string): number {
  if (!text || text.trim() === '') return 0;
  
  // Split on whitespace, filter out empty strings
  const words = text.trim().split(/\s+/).filter(word => word.length > 0);
  return words.length;
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
 * Handles abbreviations (Mr., Dr., etc.) and decimals (3.14) without false splits
 */
export function countSentences(text: string): number {
  if (!text || text.trim() === '') return 0;
  
  // Protect common abbreviations and decimals
  let protectedText = text;
  
  // Protect common titles/abbreviations (including time abbreviations)
  const abbreviations = ['Mr', 'Mrs', 'Ms', 'Dr', 'Prof', 'Sr', 'Jr', 'vs', 'etc', 'i.e', 'e.g', 'a.m', 'p.m', 'am', 'pm'];
  abbreviations.forEach(abbr => {
    protectedText = protectedText.replace(new RegExp(`${abbr}\\.`, 'gi'), `${abbr}__ABBREV__`);
  });
  
  // Protect decimals (numbers with periods)
  protectedText = protectedText.replace(/\d+\.\d+/g, match => match.replace(/\./g, '__DECIMAL__'));
  
  // Split on sentence-ending punctuation followed by space or end of string
  const sentences = protectedText
    .split(/[.!?]+(\s|$)/)
    .filter(s => s.trim().length > 0);
  
  return sentences.length;
}

/**
 * Count paragraphs in text
 * Paragraphs are separated by one or more blank lines
 */
export function countParagraphs(text: string): number {
  if (!text || text.trim() === '') return 0;
  
  // Split on one or more blank lines (multiple newlines)
  const paragraphs = text.trim().split(/\n\s*\n/).filter(p => p.trim().length > 0);
  return paragraphs.length;
}

/**
 * Estimate reading time in minutes and seconds
 * Based on average reading speed of 200-250 words per minute
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
 * Based on average speaking speed of 130-150 words per minute
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
 * Returns all basic stats in one call for efficiency
 */
export function getTextStats(text: string) {
  const words = countWords(text);
  const readingTime = estimateReadingTime(text);
  const speakingTime = estimateSpeakingTime(text);
  
  return {
    words,
    charactersWithSpaces: countCharsWithSpaces(text),
    charactersWithoutSpaces: countCharsWithoutSpaces(text),
    sentences: countSentences(text),
    paragraphs: countParagraphs(text),
    readingTime,
    speakingTime,
  };
}
