import { getAvailableSlugs } from '../data/pages.js';

export const VALID_LOCALES = ['en', 'es', 'fr', 'de', 'pt'] as const;
export type LocaleCode = (typeof VALID_LOCALES)[number];
export type DynamicCategory = 'word-counter' | 'character-counter' | 'readability';
export type LongTailCategory = DynamicCategory | 'reading-time';

const localizedStaticSlugs = new Set([
  'word-counter',
  'character-counter',
  'sentence-counter',
  'paragraph-counter',
  'syllable-counter',
  'reading-time-calculator',
  'case-converter',
  'title-case-converter',
  'readability-checker',
  'keyword-density-checker',
  'text-compare-tool',
  'paragraph-rewriter',
  'tools',
  'privacy-policy',
  'terms',
]);

const localizedDynamicSlugs: Record<DynamicCategory, Set<string>> = {
  'word-counter': new Set(getAvailableSlugs('word-counter')),
  'character-counter': new Set(getAvailableSlugs('character-counter')),
  readability: new Set(getAvailableSlugs('readability')),
};

const dynamicCategories: DynamicCategory[] = ['word-counter', 'character-counter', 'readability'];

export function normalizeLocale(locale?: string): LocaleCode {
  if (locale && VALID_LOCALES.includes(locale as LocaleCode)) {
    return locale as LocaleCode;
  }

  return 'en';
}

export function isLocalizedStaticSlug(slug?: string): boolean {
  return !!slug && localizedStaticSlugs.has(slug);
}

export function getDynamicCategoryForSlug(slug?: string): DynamicCategory | undefined {
  if (!slug) {
    return undefined;
  }

  for (const category of dynamicCategories) {
    if (localizedDynamicSlugs[category].has(slug)) {
      return category;
    }
  }

  return undefined;
}

export function inferLongTailCategory(slug?: string): LongTailCategory | undefined {
  if (!slug || isLocalizedStaticSlug(slug)) {
    return undefined;
  }

  const dynamicCategory = getDynamicCategoryForSlug(slug);
  if (dynamicCategory) {
    return dynamicCategory;
  }

  if (slug.endsWith('-word-counter')) {
    return 'word-counter';
  }

  if (slug.endsWith('-readability-checker')) {
    return 'readability';
  }

  if (slug.endsWith('-reading-time') || slug === 'speech-time-calculator') {
    return 'reading-time';
  }

  if (slug.includes('counter')) {
    return 'character-counter';
  }

  return undefined;
}

export function getLocaleHomePath(locale?: string): string {
  const normalizedLocale = normalizeLocale(locale);
  return normalizedLocale === 'en' ? '/' : `/${normalizedLocale}/`;
}

export function getLocalizedStaticPath(locale: string, slug: string): string {
  const normalizedLocale = normalizeLocale(locale);

  if (normalizedLocale === 'en') {
    return slug ? `/${slug}` : '/';
  }

  if (!slug || slug === 'index') {
    return `/${normalizedLocale}/`;
  }

  if (localizedStaticSlugs.has(slug)) {
    return `/${normalizedLocale}/${slug}`;
  }

  return `/${slug}`;
}

export function getLocalizedLongTailPath(locale: string, slug: string, category?: DynamicCategory): string {
  const normalizedLocale = normalizeLocale(locale);
  const resolvedDynamicCategory = category && localizedDynamicSlugs[category].has(slug)
    ? category
    : getDynamicCategoryForSlug(slug);

  if (resolvedDynamicCategory) {
    return normalizedLocale === 'en'
      ? `/${slug}`
      : `/${normalizedLocale}/${resolvedDynamicCategory}/${slug}`;
  }

  return normalizedLocale === 'en' ? `/${slug}` : `/${normalizedLocale}/${slug}`;
}

export function getLocalizedToolPath(locale: string, slug: string, category?: DynamicCategory): string {
  const normalizedLocale = normalizeLocale(locale);

  if (!slug) {
    return getLocaleHomePath(normalizedLocale);
  }

  if (localizedStaticSlugs.has(slug)) {
    return getLocalizedStaticPath(normalizedLocale, slug);
  }

  return getLocalizedLongTailPath(normalizedLocale, slug, category);
}

function stripLocalePrefix(pathname: string): string[] {
  const parts = pathname.split('/').filter(Boolean);

  if (parts.length > 0 && VALID_LOCALES.includes(parts[0] as LocaleCode) && parts[0] !== 'en') {
    return parts.slice(1);
  }

  return parts;
}

export function getLocaleSwitchPath(pathname: string, locale?: string): string {
  const normalizedLocale = normalizeLocale(locale);
  const parts = stripLocalePrefix(pathname);

  if (parts.length === 0) {
    return getLocaleHomePath(normalizedLocale);
  }

  if (parts.length === 1) {
    const [slug] = parts;

    if (isLocalizedStaticSlug(slug)) {
      return getLocalizedStaticPath(normalizedLocale, slug);
    }

    if (inferLongTailCategory(slug)) {
      return getLocalizedLongTailPath(normalizedLocale, slug);
    }

    return getLocaleHomePath(normalizedLocale);
  }

  if (parts.length === 2) {
    const [category, slug] = parts;

    if (dynamicCategories.includes(category as DynamicCategory)) {
      return getLocalizedLongTailPath(normalizedLocale, slug, category as DynamicCategory);
    }
  }

  return getLocaleHomePath(normalizedLocale);
}
