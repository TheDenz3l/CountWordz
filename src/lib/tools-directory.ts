import { getLongTailPageContent } from './long-tail-pages';
import type { LocaleCode } from './locale-routes';

export interface ToolDirectoryEntry {
  slug: string;
  title: string;
}

export const readabilityDirectorySlugs = [
  'blog-readability-checker',
  'legal-readability-checker',
  'medical-readability-checker',
  'technical-readability-checker',
  'academic-readability-checker',
  'business-readability-checker',
  'government-readability-checker',
  'finance-readability-checker',
  'insurance-readability-checker',
  'marketing-readability-checker',
  'hr-readability-checker',
  'education-readability-checker',
  'real-estate-readability-checker',
  'non-profit-readability-checker',
  'science-readability-checker',
  'engineering-readability-checker',
  'elementary-readability-checker',
  'middle-school-readability-checker',
  'high-school-readability-checker',
  'college-readability-checker',
  'graduate-readability-checker',
  'professional-readability-checker',
  'childrens-book-readability-checker',
  'young-adult-readability-checker',
  'academic-paper-readability-checker',
  'business-email-readability-checker',
  'technical-blog-readability-checker',
  'creative-writing-readability-checker',
  'seo-content-readability-checker',
] as const;

export const readingTimeDirectorySlugs = [
  'blog-reading-time',
  'speech-time-calculator',
  'email-reading-time',
  'report-reading-time',
  'whitepaper-reading-time',
  'newsletter-reading-time',
  'article-reading-time',
  'case-study-reading-time',
  'documentation-reading-time',
  'manual-reading-time',
  'script-reading-time',
  'presentation-reading-time',
  'podcast-reading-time',
  'video-script-reading-time',
  'social-media-post-reading-time',
  'press-release-reading-time',
  'book-chapter-reading-time',
] as const;

function fallbackTitle(slug: string): string {
  return slug
    .replace(/-(word-counter|character-counter|readability-checker|reading-time|time-calculator)$/u, '')
    .split('-')
    .filter(Boolean)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(' ');
}

export function getLongTailDirectoryEntries(
  locale: LocaleCode,
  slugs: readonly string[],
): ToolDirectoryEntry[] {
  return slugs.map((slug) => {
    const page = getLongTailPageContent(slug, locale);

    return {
      slug,
      title: page?.h1 ?? fallbackTitle(slug),
    };
  });
}
