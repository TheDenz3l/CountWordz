import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { inferLongTailCategory } from './locale-routes';
import { readabilityDirectorySlugs, readingTimeDirectorySlugs } from './tools-directory';

const excludedRootPages = new Set([
  'index.astro',
  'tools.astro',
  'word-counter.astro',
  'character-counter.astro',
  'sentence-counter.astro',
  'paragraph-counter.astro',
  'syllable-counter.astro',
  'reading-time-calculator.astro',
  'case-converter.astro',
  'title-case-converter.astro',
  'readability-checker.astro',
  'keyword-density-checker.astro',
  'text-compare-tool.astro',
  'paragraph-rewriter.astro',
  'privacy-policy.astro',
  'terms.astro',
  'test-layout.astro',
]);

const pagesDir = path.resolve(process.cwd(), 'src/pages');

function getStandaloneLongTailSlugs() {
  return fs
    .readdirSync(pagesDir)
    .filter((entry) => entry.endsWith('.astro') && !excludedRootPages.has(entry))
    .map((entry) => entry.replace(/\.astro$/u, ''));
}

function getExpectedSlugs(category: 'readability' | 'reading-time') {
  return getStandaloneLongTailSlugs()
    .filter((slug) => inferLongTailCategory(slug) === category)
    .sort();
}

describe('tools directory localization audit', () => {
  it('covers every standalone readability page in localized tools indexes', () => {
    expect([...readabilityDirectorySlugs].sort()).toEqual(getExpectedSlugs('readability'));
  });

  it('covers every standalone reading-time page in localized tools indexes', () => {
    expect([...readingTimeDirectorySlugs].sort()).toEqual(getExpectedSlugs('reading-time'));
  });
});
