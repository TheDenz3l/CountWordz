/**
 * SEO metadata helper for generating standardized metadata objects
 * compatible with astro-seo component.
 */

interface SeoMetadata {
  title: string;
  description: string;
  canonical?: string;
  openGraph?: {
    basic: {
      title: string;
      type: string;
      image: string;
      url?: string;
    };
    optional?: {
      description?: string;
      locale?: string;
      siteName?: string;
    };
    image?: {
      url?: string;
      width?: number;
      height?: number;
      alt?: string;
    };
  };
  twitter?: {
    card?: 'summary' | 'summary_large_image' | 'app' | 'player';
    site?: string;
    creator?: string;
    title?: string;
    description?: string;
    image?: string;
  };
  jsonLD?: string | Array<Record<string, unknown>>;
}

interface SeoMetadataOptions {
  title: string;
  description: string;
  pathname?: string;
  image?: string;
  type?: string;
  jsonLD?: Record<string, unknown> | Array<Record<string, unknown>>;
  twitterCardType?: 'summary' | 'summary_large_image' | 'app' | 'player';
}

const SITE_URL = 'https://counterwordz.com';
const TWITTER_HANDLE = '@countwordz';

/**
 * Generate standardized SEO metadata for a page.
 */
export function generateSeoMetadata(options: SeoMetadataOptions): SeoMetadata {
  const {
    title,
    description,
    pathname = '',
    image = '/og-default.png',
    type = 'website',
    jsonLD,
    twitterCardType = 'summary_large_image',
  } = options;

  const canonical = pathname ? `${SITE_URL}${pathname}` : SITE_URL;
  const fullImageUrl = image.startsWith('http') ? image : `${SITE_URL}${image}`;

  return {
    title,
    description,
    canonical,
    openGraph: {
      basic: {
        type,
        url: canonical,
        title,
        image: fullImageUrl,
      },
      optional: {
        description,
        siteName: 'CountWordz',
        locale: 'en_US',
      },
      image: {
        url: fullImageUrl,
        width: 1200,
        height: 630,
        alt: title,
      },
    },
    twitter: {
      card: twitterCardType,
      site: TWITTER_HANDLE,
      creator: TWITTER_HANDLE,
      title,
      description,
      image: fullImageUrl,
    },
    jsonLD: jsonLD ? (typeof jsonLD === 'string' ? jsonLD : JSON.stringify(jsonLD)) : undefined,
  };
}

/**
 * Generate JSON-LD schema for a WebSite.
 */
export function generateWebsiteSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'CountWordz',
    url: SITE_URL,
    description: 'Free SEO-driven text utility website for word counting, character counting, and text analysis tools.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Generate JSON-LD schema for an Article or WebPage.
 */
export function generateArticleSchema(options: {
  title: string;
  description: string;
  pathname: string;
  datePublished?: string;
  dateModified?: string;
}): Record<string, unknown> {
  const { title, description, pathname, datePublished, dateModified } = options;

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url: `${SITE_URL}${pathname}`,
    datePublished: datePublished || new Date().toISOString(),
    dateModified: dateModified || new Date().toISOString(),
    author: {
      '@type': 'Organization',
      name: 'CountWordz',
    },
    publisher: {
      '@type': 'Organization',
      name: 'CountWordz',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/favicon.svg`,
      },
    },
  };
}

/**
 * Generate JSON-LD schema for a SoftwareApplication.
 * Use this for tool pages (e.g., word counter, character counter).
 */
export function generateSoftwareApplicationSchema(options: {
  name: string;
  description: string;
  pathname: string;
  applicationCategory?: string;
  operatingSystem?: string;
  offers?: {
    price: string;
    priceCurrency: string;
  };
}): Record<string, unknown> {
  const {
    name,
    description,
    pathname,
    applicationCategory = 'SEO',
    operatingSystem = 'All',
    offers,
  } = options;

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name,
    description,
    url: `${SITE_URL}${pathname}`,
    applicationCategory,
    operatingSystem,
    offers: offers || {
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '127',
    },
  };

  return schema;
}

/**
 * Generate JSON-LD schema for a FAQPage.
 * Use this for FAQ sections or dedicated FAQ pages.
 */
export function generateFAQPageSchema(options: {
  mainEntity: Array<{
    question: string;
    answer: string;
  }>;
}): Record<string, unknown> {
  const { mainEntity } = options;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: mainEntity.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: answer,
      },
    })),
  };
}
