import fs from 'node:fs';
import path from 'node:path';
import {
  VALID_LOCALES,
  getLocalizedToolPath,
  inferLongTailCategory,
  isLocalizedStaticSlug,
  normalizeLocale,
  type LocaleCode,
  type LongTailCategory,
} from './locale-routes';
import { generateSoftwareApplicationSchema, generateFAQPageSchema } from './seo-metadata';
import { renderIconHtml } from './icon-html';

export interface LongTailPageContent {
  slug: string;
  title: string;
  description: string;
  h1: string;
  subtitle: string;
  articleHtml: string;
}

const pagesDir = path.resolve(process.cwd(), 'src/pages');

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

const standaloneLongTailSlugs = fs
  .readdirSync(pagesDir)
  .filter((entry) => entry.endsWith('.astro') && !excludedRootPages.has(entry))
  .map((entry) => entry.replace(/\.astro$/, ''))
  .sort();

const localeText = {
  en: {
    howToUse: 'How to use this page',
    bestFor: 'Best for',
    whyItMatters: 'Why it matters',
    tips: 'Practical tips',
    related: 'Related tools',
    faq: 'Frequently asked questions',
    wordCounter: 'Word Counter',
    characterCounter: 'Character Counter',
    readabilityChecker: 'Readability Checker',
    readingTimeCalculator: 'Reading Time Calculator',
    articleFallback1: 'Use this page to measure your content quickly and keep it aligned with the format you are writing for.',
    articleFallback2: 'The counter updates in real time, so you can edit, trim, or expand your draft without switching tools.',
    tipsItems: [
      'Paste your full draft before making edits so the baseline is accurate.',
      'Trim repeated phrases before cutting core information.',
      'Check the final version again after revisions so limits and pacing stay correct.',
    ],
    faqItems: [
      {
        q: 'How accurate is this tool?',
        a: 'It uses the same text parsing logic as the main CountWordz tools, so the numbers update consistently as you write.',
      },
      {
        q: 'Should I rely only on one metric?',
        a: 'No. Word count, readability, character limits, and reading time each answer different editorial questions.',
      },
    ],
  },
  es: {
    howToUse: 'Cómo usar esta página',
    bestFor: 'Ideal para',
    whyItMatters: 'Por qué importa',
    tips: 'Consejos prácticos',
    related: 'Herramientas relacionadas',
    faq: 'Preguntas frecuentes',
    wordCounter: 'Contador de Palabras',
    characterCounter: 'Contador de Caracteres',
    readabilityChecker: 'Verificador de Legibilidad',
    readingTimeCalculator: 'Calculadora de Tiempo de Lectura',
    articleFallback1: 'Usa esta página para medir tu contenido rápidamente y mantenerlo alineado con el formato que estás escribiendo.',
    articleFallback2: 'El contador se actualiza en tiempo real, así puedes editar, recortar o ampliar tu borrador sin cambiar de herramienta.',
    tipsItems: [
      'Pega el borrador completo antes de editar para tener una base precisa.',
      'Reduce frases repetidas antes de cortar información importante.',
      'Vuelve a revisar la versión final para confirmar límites y ritmo de lectura.',
    ],
    faqItems: [
      {
        q: '¿Qué tan precisa es esta herramienta?',
        a: 'Usa la misma lógica de análisis que las herramientas principales de CountWordz, por lo que los números se actualizan de forma consistente.',
      },
      {
        q: '¿Debo fijarme solo en una métrica?',
        a: 'No. El número de palabras, la legibilidad, el límite de caracteres y el tiempo de lectura responden preguntas distintas.',
      },
    ],
  },
  fr: {
    howToUse: 'Comment utiliser cette page',
    bestFor: 'Idéal pour',
    whyItMatters: 'Pourquoi c’est utile',
    tips: 'Conseils pratiques',
    related: 'Outils connexes',
    faq: 'Questions fréquentes',
    wordCounter: 'Compteur de mots',
    characterCounter: 'Compteur de caractères',
    readabilityChecker: 'Vérificateur de lisibilité',
    readingTimeCalculator: 'Calculateur de temps de lecture',
    articleFallback1: 'Utilisez cette page pour mesurer rapidement votre contenu et le garder adapté au format que vous rédigez.',
    articleFallback2: 'Le compteur se met à jour en temps réel, ce qui permet de raccourcir ou développer un texte sans changer d’outil.',
    tipsItems: [
      'Collez la version complète du brouillon avant toute coupe pour obtenir une base fiable.',
      'Supprimez les répétitions avant de retirer les informations essentielles.',
      'Vérifiez à nouveau la version finale pour confirmer les limites et le rythme de lecture.',
    ],
    faqItems: [
      {
        q: 'Quelle est la précision de cet outil ?',
        a: 'Il utilise la même logique d’analyse que les outils principaux de CountWordz, ce qui garantit des résultats cohérents.',
      },
      {
        q: 'Faut-il se fier à une seule métrique ?',
        a: 'Non. Le nombre de mots, la lisibilité, les limites de caractères et le temps de lecture répondent à des besoins différents.',
      },
    ],
  },
  de: {
    howToUse: 'So verwendest du diese Seite',
    bestFor: 'Geeignet für',
    whyItMatters: 'Warum das wichtig ist',
    tips: 'Praktische Tipps',
    related: 'Ähnliche Tools',
    faq: 'Häufige Fragen',
    wordCounter: 'Wortzähler',
    characterCounter: 'Zeichenzähler',
    readabilityChecker: 'Lesbarkeitsprüfer',
    readingTimeCalculator: 'Lesezeit-Rechner',
    articleFallback1: 'Nutze diese Seite, um deinen Inhalt schnell zu messen und an das jeweilige Format anzupassen.',
    articleFallback2: 'Der Zähler aktualisiert sich in Echtzeit, sodass du den Text kürzen oder erweitern kannst, ohne das Werkzeug zu wechseln.',
    tipsItems: [
      'Füge zuerst den vollständigen Entwurf ein, damit du eine verlässliche Ausgangsbasis hast.',
      'Kürze Wiederholungen, bevor du wichtige Informationen entfernst.',
      'Prüfe die finale Version erneut, damit Grenzen und Lesefluss stimmen.',
    ],
    faqItems: [
      {
        q: 'Wie genau ist dieses Tool?',
        a: 'Es verwendet dieselbe Auswertungslogik wie die zentralen CountWordz-Tools und liefert dadurch konsistente Ergebnisse.',
      },
      {
        q: 'Sollte ich mich nur auf eine Kennzahl verlassen?',
        a: 'Nein. Wortzahl, Lesbarkeit, Zeichenlimit und Lesezeit beantworten unterschiedliche redaktionelle Fragen.',
      },
    ],
  },
  pt: {
    howToUse: 'Como usar esta página',
    bestFor: 'Ideal para',
    whyItMatters: 'Por que isso importa',
    tips: 'Dicas práticas',
    related: 'Ferramentas relacionadas',
    faq: 'Perguntas frequentes',
    wordCounter: 'Contador de Palavras',
    characterCounter: 'Contador de Caracteres',
    readabilityChecker: 'Verificador de Legibilidade',
    readingTimeCalculator: 'Calculadora de Tempo de Leitura',
    articleFallback1: 'Use esta página para medir seu conteúdo rapidamente e mantê-lo alinhado ao formato que você está escrevendo.',
    articleFallback2: 'O contador é atualizado em tempo real, então você pode cortar ou expandir o texto sem trocar de ferramenta.',
    tipsItems: [
      'Cole o rascunho completo antes de editar para ter uma base confiável.',
      'Reduza repetições antes de remover informações importantes.',
      'Confira a versão final novamente para validar limites e ritmo de leitura.',
    ],
    faqItems: [
      {
        q: 'Qual é a precisão desta ferramenta?',
        a: 'Ela usa a mesma lógica de análise das ferramentas principais do CountWordz, então os resultados permanecem consistentes.',
      },
      {
        q: 'Devo olhar apenas uma métrica?',
        a: 'Não. Número de palavras, legibilidade, limite de caracteres e tempo de leitura respondem a perguntas diferentes.',
      },
    ],
  },
} as const;

const subjectTokenTranslations: Record<Exclude<LocaleCode, 'en'>, Record<string, string>> = {
  es: {
    academic: 'académico', paper: 'documento', article: 'artículo', blog: 'blog', post: 'post', book: 'libro', chapter: 'capítulo',
    business: 'negocio', email: 'email', case: 'caso', study: 'estudio', childrens: 'infantil', college: 'universitario', cover: 'presentación',
    letter: 'carta', creative: 'creativa', writing: 'escritura', dissertation: 'disertación', documentation: 'documentación', education: 'educación',
    elementary: 'primaria', engineering: 'ingeniería', essay: 'ensayo', facebook: 'facebook', finance: 'finanzas', government: 'gobierno', graduate: 'posgrado',
    grant: 'subvención', proposal: 'propuesta', high: 'secundaria', school: '', hr: 'RR. HH.', instagram: 'instagram', caption: 'pie de foto',
    insurance: 'seguros', legal: 'legal', linkedin: 'linkedin', headline: 'titular', manual: 'manual', marketing: 'marketing', medical: 'médico',
    meta: 'meta', description: 'descripción', middle: 'media', newsletter: 'boletín', non: 'sin', profit: 'fines de lucro', paragraph: 'párrafo',
    pinterest: 'pinterest', pin: 'pin', podcast: 'podcast', presentation: 'presentación', press: 'prensa', release: 'comunicado', product: 'producto',
    professional: 'profesional', real: 'bienes', estate: 'raíces', reddit: 'reddit', report: 'informe', resume: 'currículum', science: 'ciencia',
    script: 'guion', seo: 'SEO', social: 'social', media: 'medios', speech: 'discurso', technical: 'técnico', thesis: 'tesis', tiktok: 'tiktok',
    title: 'título', tweet: 'tweet', thread: 'hilo', video: 'video', whitepaper: 'whitepaper', youtube: 'youtube', tag: 'etiqueta', tags: 'etiquetas',
    whatsapp: 'whatsapp', telegram: 'telegram', discord: 'discord', sms: 'SMS', bio: 'biografía', readability: 'legibilidad', content: 'contenido',
  },
  fr: {
    academic: 'académique', paper: 'papier', article: 'article', blog: 'blog', post: 'publication', book: 'livre', chapter: 'chapitre',
    business: 'professionnel', email: 'e-mail', case: 'cas', study: 'étude', childrens: 'jeunesse', college: 'universitaire', cover: 'motivation',
    letter: 'lettre', creative: 'créative', writing: 'écriture', dissertation: 'dissertation', documentation: 'documentation', education: 'éducation',
    elementary: 'primaire', engineering: 'ingénierie', essay: 'essai', facebook: 'facebook', finance: 'finance', government: 'gouvernement', graduate: 'supérieur',
    grant: 'subvention', proposal: 'proposition', high: 'secondaire', school: '', hr: 'RH', instagram: 'instagram', caption: 'légende',
    insurance: 'assurance', legal: 'juridique', linkedin: 'linkedin', headline: 'titre', manual: 'manuel', marketing: 'marketing', medical: 'médical',
    meta: 'meta', description: 'description', middle: 'collège', newsletter: 'newsletter', non: 'sans', profit: 'but lucratif', paragraph: 'paragraphe',
    pinterest: 'pinterest', pin: 'pin', podcast: 'podcast', presentation: 'présentation', press: 'presse', release: 'communiqué', product: 'produit',
    professional: 'professionnel', real: 'immobilier', estate: '', reddit: 'reddit', report: 'rapport', resume: 'CV', science: 'science',
    script: 'script', seo: 'SEO', social: 'social', media: 'médias', speech: 'discours', technical: 'technique', thesis: 'thèse', tiktok: 'tiktok',
    title: 'titre', tweet: 'tweet', thread: 'fil', video: 'vidéo', whitepaper: 'livre blanc', youtube: 'youtube', tag: 'balise', tags: 'balises',
    whatsapp: 'whatsapp', telegram: 'telegram', discord: 'discord', sms: 'SMS', bio: 'bio', readability: 'lisibilité', content: 'contenu',
  },
  de: {
    academic: 'akademisch', paper: 'arbeit', article: 'artikel', blog: 'blog', post: 'beitrag', book: 'buch', chapter: 'kapitel',
    business: 'geschäftlich', email: 'e-mail', case: 'fall', study: 'studie', childrens: 'kinder', college: 'hochschule', cover: 'anschreiben',
    letter: '', creative: 'kreativ', writing: 'schreiben', dissertation: 'dissertation', documentation: 'dokumentation', education: 'bildung',
    elementary: 'grundschule', engineering: 'ingenieurwesen', essay: 'aufsatz', facebook: 'facebook', finance: 'finanzen', government: 'regierung', graduate: 'abschluss',
    grant: 'förder', proposal: 'antrag', high: 'oberschule', school: '', hr: 'HR', instagram: 'instagram', caption: 'caption',
    insurance: 'versicherung', legal: 'recht', linkedin: 'linkedin', headline: 'headline', manual: 'handbuch', marketing: 'marketing', medical: 'medizinisch',
    meta: 'meta', description: 'beschreibung', middle: 'mittelschule', newsletter: 'newsletter', non: 'gemeinnützig', profit: '', paragraph: 'absatz',
    pinterest: 'pinterest', pin: 'pin', podcast: 'podcast', presentation: 'präsentation', press: 'presse', release: 'mitteilung', product: 'produkt',
    professional: 'beruflich', real: 'immobilien', estate: '', reddit: 'reddit', report: 'bericht', resume: 'lebenslauf', science: 'wissenschaft',
    script: 'skript', seo: 'SEO', social: 'social', media: 'media', speech: 'rede', technical: 'technisch', thesis: 'thesis', tiktok: 'tiktok',
    title: 'titel', tweet: 'tweet', thread: 'thread', video: 'video', whitepaper: 'whitepaper', youtube: 'youtube', tag: 'tag', tags: 'tags',
    whatsapp: 'whatsapp', telegram: 'telegram', discord: 'discord', sms: 'SMS', bio: 'bio', readability: 'lesbarkeit', content: 'inhalt',
  },
  pt: {
    academic: 'acadêmico', paper: 'artigo', article: 'artigo', blog: 'blog', post: 'post', book: 'livro', chapter: 'capítulo',
    business: 'negócios', email: 'e-mail', case: 'caso', study: 'estudo', childrens: 'infantil', college: 'universitário', cover: 'apresentação',
    letter: 'carta', creative: 'criativa', writing: 'escrita', dissertation: 'dissertação', documentation: 'documentação', education: 'educação',
    elementary: 'primário', engineering: 'engenharia', essay: 'ensaio', facebook: 'facebook', finance: 'finanças', government: 'governo', graduate: 'pós-graduação',
    grant: 'subvenção', proposal: 'proposta', high: 'ensino', school: 'médio', hr: 'RH', instagram: 'instagram', caption: 'legenda',
    insurance: 'seguros', legal: 'jurídico', linkedin: 'linkedin', headline: 'manchete', manual: 'manual', marketing: 'marketing', medical: 'médico',
    meta: 'meta', description: 'descrição', middle: 'ensino', newsletter: 'newsletter', non: 'sem', profit: 'fins lucrativos', paragraph: 'parágrafo',
    pinterest: 'pinterest', pin: 'pin', podcast: 'podcast', presentation: 'apresentação', press: 'imprensa', release: 'comunicado', product: 'produto',
    professional: 'profissional', real: 'imobiliário', estate: '', reddit: 'reddit', report: 'relatório', resume: 'currículo', science: 'ciência',
    script: 'roteiro', seo: 'SEO', social: 'social', media: 'mídia', speech: 'fala', technical: 'técnico', thesis: 'tese', tiktok: 'tiktok',
    title: 'título', tweet: 'tweet', thread: 'thread', video: 'vídeo', whitepaper: 'whitepaper', youtube: 'youtube', tag: 'tag', tags: 'tags',
    whatsapp: 'whatsapp', telegram: 'telegram', discord: 'discord', sms: 'SMS', bio: 'bio', readability: 'legibilidade', content: 'conteúdo',
  },
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function extractMatch(source: string, pattern: RegExp, fallback = ''): string {
  return source.match(pattern)?.[1]?.trim() ?? fallback;
}

function rewriteInternalLinks(articleHtml: string, locale: LocaleCode): string {
  return articleHtml.replace(/href="\/([^"]+)"/g, (_match, hrefPath: string) => {
    if (!hrefPath || hrefPath.includes('/')) {
      return `href="/${hrefPath}"`;
    }

    const localizedHref = isLocalizedStaticSlug(hrefPath)
      ? getLocalizedToolPath(locale, hrefPath)
      : inferLongTailCategory(hrefPath)
        ? getLocalizedToolPath(locale, hrefPath)
        : `/${hrefPath}`;

    return `href="${localizedHref}"`;
  });
}

function titleCase(text: string): string {
  return text
    .split(' ')
    .filter(Boolean)
    .map((token) => (token === token.toUpperCase() ? token : token.charAt(0).toUpperCase() + token.slice(1)))
    .join(' ');
}

function getSubjectSlug(slug: string, category: LongTailCategory): string {
  if (category === 'word-counter' && slug.endsWith('-word-counter')) {
    return slug.slice(0, -'-word-counter'.length);
  }
  if (category === 'character-counter' && slug.endsWith('-character-counter')) {
    return slug.slice(0, -'-character-counter'.length);
  }
  if (category === 'readability' && slug.endsWith('-readability-checker')) {
    return slug.slice(0, -'-readability-checker'.length);
  }
  if (category === 'reading-time' && slug.endsWith('-reading-time')) {
    return slug.slice(0, -'-reading-time'.length);
  }
  if (category === 'reading-time' && slug.endsWith('-time-calculator')) {
    return slug.slice(0, -'-time-calculator'.length);
  }
  return slug;
}

function translateSubject(slug: string, locale: LocaleCode, category: LongTailCategory): string {
  const subjectSlug = getSubjectSlug(slug, category);
  if (locale === 'en') {
    return titleCase(subjectSlug.replace(/-/g, ' '));
  }

  const dictionary = subjectTokenTranslations[locale as Exclude<LocaleCode, 'en'>];
  const translated = subjectSlug
    .split('-')
    .map((token) => dictionary[token] ?? token)
    .filter(Boolean)
    .join(' ');

  return titleCase(translated || subjectSlug.replace(/-/g, ' '));
}

function getCategoryToolLabel(locale: LocaleCode, category: LongTailCategory): string {
  const t = localeText[locale];
  if (category === 'character-counter') return t.characterCounter;
  if (category === 'readability') return t.readabilityChecker;
  if (category === 'reading-time') return t.readingTimeCalculator;
  return t.wordCounter;
}

function buildLocalizedMetadata(locale: LocaleCode, slug: string, category: LongTailCategory) {
  const subject = translateSubject(slug, locale, category);
  const toolLabel = getCategoryToolLabel(locale, category);

  if (locale === 'es') {
    const h1 = `${toolLabel} para ${subject}`;
    return {
      title: h1,
      h1,
      description: `Herramienta gratuita para ${subject.toLowerCase()}. Analiza tu texto con resultados instantáneos.`,
      subtitle: `Usa esta herramienta para revisar ${subject.toLowerCase()} con métricas claras y resultados en tiempo real.`,
    };
  }

  if (locale === 'fr') {
    const h1 = `${toolLabel} pour ${subject}`;
    return {
      title: h1,
      h1,
      description: `Outil gratuit pour ${subject.toLowerCase()}. Analysez votre texte avec des résultats immédiats.`,
      subtitle: `Utilisez cet outil pour vérifier ${subject.toLowerCase()} avec des mesures claires et des résultats en temps réel.`,
    };
  }

  if (locale === 'de') {
    const h1 = `${toolLabel} für ${subject}`;
    return {
      title: h1,
      h1,
      description: `Kostenloses Tool für ${subject.toLowerCase()}. Analysieren Sie Ihren Text mit sofortigen Ergebnissen.`,
      subtitle: `Nutzen Sie dieses Tool, um ${subject.toLowerCase()} mit klaren Kennzahlen und Echtzeit-Ergebnissen zu prüfen.`,
    };
  }

  if (locale === 'pt') {
    const h1 = `${toolLabel} para ${subject}`;
    return {
      title: h1,
      h1,
      description: `Ferramenta gratuita para ${subject.toLowerCase()}. Analise seu texto com resultados imediatos.`,
      subtitle: `Use esta ferramenta para revisar ${subject.toLowerCase()} com métricas claras e resultados em tempo real.`,
    };
  }

  const h1 = `${toolLabel} for ${subject}`;
  return {
    title: h1,
    h1,
    description: `Free tool for ${subject.toLowerCase()}. Analyze your text with instant results.`,
    subtitle: `Use this tool to review ${subject.toLowerCase()} with clear metrics and real-time results.`,
  };
}

function getToolNames(locale: LocaleCode) {
  const t = localeText[locale];
  return {
    word: t.wordCounter,
    character: t.characterCounter,
    readability: t.readabilityChecker,
    reading: t.readingTimeCalculator,
  };
}

type SubjectKind =
  | 'academic'
  | 'professional'
  | 'content'
  | 'scripted'
  | 'social'
  | 'messaging'
  | 'metadata'
  | 'industry'
  | 'audience'
  | 'document';

function getSubjectKind(category: LongTailCategory, slug: string): SubjectKind {
  const subjectSlug = getSubjectSlug(slug, category);

  if (category === 'word-counter') {
    if (['essay', 'college-essay', 'thesis', 'dissertation', 'grant-proposal'].includes(subjectSlug)) return 'academic';
    if (['resume', 'cover-letter', 'email'].includes(subjectSlug)) return 'professional';
    if (['article', 'blog-post', 'paragraph', 'product-description', 'report', 'whitepaper'].includes(subjectSlug)) return 'content';
    return 'scripted';
  }

  if (category === 'character-counter') {
    if (['email-subject', 'meta-description', 'meta-title', 'youtube-title', 'youtube-description', 'youtube-tag'].includes(subjectSlug)) return 'metadata';
    if (['discord-message', 'sms', 'telegram-message', 'whatsapp-message'].includes(subjectSlug)) return 'messaging';
    return 'social';
  }

  if (category === 'readability') {
    if (['childrens-book', 'college', 'elementary', 'graduate', 'high-school', 'middle-school', 'young-adult'].includes(subjectSlug)) return 'audience';
    return 'industry';
  }

  if (['article', 'blog', 'newsletter', 'social-media-post'].includes(subjectSlug)) return 'content';
  if (['documentation', 'manual', 'report', 'whitepaper'].includes(subjectSlug)) return 'document';
  return 'scripted';
}

function getRecommendationHeading(locale: LocaleCode, category: LongTailCategory): string {
  if (locale === 'es') {
    if (category === 'word-counter') return 'Qué revisar';
    if (category === 'character-counter') return 'Límites y comprobaciones útiles';
    if (category === 'readability') return 'Objetivos recomendados';
    return 'Cómo planificarlo';
  }

  if (locale === 'fr') {
    if (category === 'word-counter') return 'Ce qu’il faut vérifier';
    if (category === 'character-counter') return 'Limites et contrôles utiles';
    if (category === 'readability') return 'Objectifs recommandés';
    return 'Comment le planifier';
  }

  if (locale === 'de') {
    if (category === 'word-counter') return 'Was du prüfen solltest';
    if (category === 'character-counter') return 'Nützliche Limits und Prüfungen';
    if (category === 'readability') return 'Empfohlene Zielwerte';
    return 'So planst du es';
  }

  if (locale === 'pt') {
    if (category === 'word-counter') return 'O que revisar';
    if (category === 'character-counter') return 'Limites e verificações úteis';
    if (category === 'readability') return 'Metas recomendadas';
    return 'Como planejar';
  }

  if (category === 'word-counter') return 'What to review';
  if (category === 'character-counter') return 'Useful limits and checks';
  if (category === 'readability') return 'Recommended targets';
  return 'How to plan it';
}

function buildBestForText(locale: LocaleCode, category: LongTailCategory, subject: string, kind: SubjectKind, tools: ReturnType<typeof getToolNames>) {
  if (locale === 'es') {
    if (category === 'reading-time') return kind === 'scripted'
      ? `${subject}, ${tools.reading.toLowerCase()} y control del ritmo antes de leer en voz alta.`
      : `${subject}, ${tools.reading.toLowerCase()} y planificación editorial.`;
    if (category === 'readability') return kind === 'audience'
      ? `${subject}, claridad para el público objetivo y ajustes antes de publicar.`
      : `${subject}, revisión de claridad y simplificación del lenguaje.`;
    if (category === 'character-counter') return kind === 'metadata'
      ? `${subject}, límites visibles en buscadores y plataformas.`
      : `${subject}, límites de plataforma y edición final antes de publicar.`;
    if (kind === 'academic') return `${subject}, control de extensión, estructura y revisión del borrador.`;
    if (kind === 'professional') return `${subject}, mensajes breves, claros y orientados a la acción.`;
    if (kind === 'content') return `${subject}, equilibrio entre amplitud, claridad y ritmo de lectura.`;
    return `${subject}, guiones, presentaciones y texto pensado para leerse en voz alta.`;
  }

  if (locale === 'fr') {
    if (category === 'reading-time') return kind === 'scripted'
      ? `${subject}, estimation du temps de lecture et contrôle du rythme avant lecture à voix haute.`
      : `${subject}, estimation du temps de lecture et planification éditoriale.`;
    if (category === 'readability') return kind === 'audience'
      ? `${subject}, clarté pour le public visé et ajustements avant publication.`
      : `${subject}, vérification de la clarté et simplification du langage.`;
    if (category === 'character-counter') return kind === 'metadata'
      ? `${subject}, limites visibles dans les moteurs et sur les plateformes.`
      : `${subject}, limites de plateforme et révision finale avant publication.`;
    if (kind === 'academic') return `${subject}, contrôle de la longueur, de la structure et de la révision du brouillon.`;
    if (kind === 'professional') return `${subject}, messages courts, clairs et orientés vers l’action.`;
    if (kind === 'content') return `${subject}, équilibre entre profondeur, clarté et rythme de lecture.`;
    return `${subject}, scripts, présentations et textes destinés à l’oral.`;
  }

  if (locale === 'de') {
    if (category === 'reading-time') return kind === 'scripted'
      ? `${subject}, Lesezeit-Schätzung und Rhythmuskontrolle vor dem Vorlesen.`
      : `${subject}, Lesezeit-Schätzung und redaktionelle Planung.`;
    if (category === 'readability') return kind === 'audience'
      ? `${subject}, Klarheit für die Zielgruppe und letzte Anpassungen vor der Veröffentlichung.`
      : `${subject}, Klarheitsprüfung und Vereinfachung der Sprache.`;
    if (category === 'character-counter') return kind === 'metadata'
      ? `${subject}, sichtbare Limits in Suchergebnissen und Plattformen.`
      : `${subject}, Plattform-Limits und letzter Feinschliff vor dem Veröffentlichen.`;
    if (kind === 'academic') return `${subject}, Kontrolle von Umfang, Struktur und Überarbeitung des Entwurfs.`;
    if (kind === 'professional') return `${subject}, kurze, klare und handlungsorientierte Inhalte.`;
    if (kind === 'content') return `${subject}, Balance zwischen Tiefe, Klarheit und Lesefluss.`;
    return `${subject}, Skripte, Präsentationen und Texte für den Vortrag.`;
  }

  if (locale === 'pt') {
    if (category === 'reading-time') return kind === 'scripted'
      ? `${subject}, estimativa de leitura e controle de ritmo antes da leitura em voz alta.`
      : `${subject}, estimativa de leitura e planejamento editorial.`;
    if (category === 'readability') return kind === 'audience'
      ? `${subject}, clareza para o público-alvo e ajustes antes da publicação.`
      : `${subject}, revisão de clareza e simplificação da linguagem.`;
    if (category === 'character-counter') return kind === 'metadata'
      ? `${subject}, limites visíveis em buscadores e plataformas.`
      : `${subject}, limites de plataforma e edição final antes de publicar.`;
    if (kind === 'academic') return `${subject}, controle de extensão, estrutura e revisão do rascunho.`;
    if (kind === 'professional') return `${subject}, mensagens curtas, claras e orientadas para ação.`;
    if (kind === 'content') return `${subject}, equilíbrio entre profundidade, clareza e ritmo de leitura.`;
    return `${subject}, roteiros, apresentações e texto pensado para ser falado.`;
  }

  if (category === 'reading-time') return `${subject}, reading-time estimates, and editorial planning.`;
  if (category === 'readability') return `${subject}, clarity review, and pre-publish adjustments.`;
  if (category === 'character-counter') return `${subject}, platform limits, and final edits before publishing.`;
  return `${subject}, word counting, and draft structure review.`;
}

function buildOverviewParagraphs(locale: LocaleCode, category: LongTailCategory, kind: SubjectKind, subject: string): string[] {
  if (locale === 'es') {
    if (category === 'word-counter') {
      return [
        `Usa esta página para controlar la longitud de ${subject.toLowerCase()} desde el primer borrador hasta la versión final.`,
        kind === 'academic'
          ? 'Te ayuda a repartir mejor introducción, desarrollo y cierre sin salirte del límite solicitado.'
          : kind === 'professional'
            ? 'Es útil para mantener un mensaje claro, breve y fácil de revisar antes de enviarlo.'
            : kind === 'content'
              ? 'Sirve para ajustar amplitud, ritmo y escaneabilidad según el canal donde vas a publicar.'
              : 'También te permite ensayar ritmo, pausas y duración cuando el texto está pensado para leerse en voz alta.',
      ];
    }

    if (category === 'character-counter') {
      return [
        `Usa esta página para revisar ${subject.toLowerCase()} antes de publicarlo, compartirlo o reutilizarlo en otra plataforma.`,
        kind === 'metadata'
          ? 'Así confirmas que el texto sigue siendo visible, legible y útil dentro del espacio real disponible.'
          : kind === 'messaging'
            ? 'También te ayuda a evitar cortes incómodos cuando el mensaje debe leerse rápido en móvil.'
            : 'Te permite dejar margen para hashtags, enlaces, emojis o llamadas a la acción sin pasarte del límite.',
      ];
    }

    if (category === 'readability') {
      return [
        `Usa este verificador para adaptar ${subject.toLowerCase()} al nivel de claridad que espera tu audiencia.`,
        kind === 'audience'
          ? 'El objetivo no es solo simplificar, sino mantener el contenido comprensible para ese tramo lector.'
          : 'Te ayuda a revisar frases largas, vocabulario denso y transiciones antes de publicar o entregar el texto.',
      ];
    }

    return [
      `Usa esta calculadora para estimar cuánto tarda en leerse ${subject.toLowerCase()} y ajustar mejor su ritmo.`,
      kind === 'scripted'
        ? 'Es especialmente útil cuando el texto se leerá en voz alta o debe encajar en una duración concreta.'
        : 'Así puedes decidir si conviene resumir, ampliar o dividir el contenido antes de compartirlo.',
    ];
  }

  if (locale === 'fr') {
    if (category === 'word-counter') {
      return [
        `Utilisez cette page pour contrôler la longueur de ${subject.toLowerCase()} du premier brouillon à la version finale.`,
        kind === 'academic'
          ? 'Elle aide à mieux répartir introduction, développement et conclusion sans dépasser la limite demandée.'
          : kind === 'professional'
            ? 'Elle est utile pour garder un message clair, bref et facile à relire avant l’envoi.'
            : kind === 'content'
              ? 'Elle sert à ajuster la profondeur, le rythme et la lisibilité selon le canal de publication.'
              : 'Elle permet aussi de tester le rythme, les pauses et la durée quand le texte est destiné à l’oral.',
      ];
    }

    if (category === 'character-counter') {
      return [
        `Utilisez cette page pour vérifier ${subject.toLowerCase()} avant publication, partage ou réutilisation sur une autre plateforme.`,
        kind === 'metadata'
          ? 'Vous confirmez ainsi que le texte reste visible, lisible et pertinent dans l’espace réellement disponible.'
          : kind === 'messaging'
            ? 'Elle aide aussi à éviter les coupures maladroites lorsque le message doit être lu rapidement sur mobile.'
            : 'Elle laisse une marge pour les hashtags, liens, émojis ou appels à l’action sans dépasser la limite.',
      ];
    }

    if (category === 'readability') {
      return [
        `Utilisez ce vérificateur pour adapter ${subject.toLowerCase()} au niveau de clarté attendu par votre audience.`,
        kind === 'audience'
          ? 'L’enjeu n’est pas seulement de simplifier, mais de rendre le contenu compréhensible pour ce lectorat précis.'
          : 'Il aide à repérer les phrases trop longues, le vocabulaire dense et les transitions à retravailler.',
      ];
    }

    return [
      `Utilisez ce calculateur pour estimer le temps nécessaire à la lecture de ${subject.toLowerCase()} et mieux régler son rythme.`,
      kind === 'scripted'
        ? 'C’est particulièrement utile lorsque le texte sera lu à voix haute ou doit tenir dans une durée précise.'
        : 'Vous pouvez ainsi décider s’il faut résumer, développer ou découper le contenu avant diffusion.',
    ];
  }

  if (locale === 'de') {
    if (category === 'word-counter') {
      return [
        `Nutze diese Seite, um die Länge von ${subject.toLowerCase()} vom ersten Entwurf bis zur finalen Version zu steuern.`,
        kind === 'academic'
          ? 'So lässt sich Einleitung, Hauptteil und Schluss besser austarieren, ohne das geforderte Limit zu überschreiten.'
          : kind === 'professional'
            ? 'Das hilft dabei, eine klare, knappe und vor dem Versand leicht prüfbare Botschaft zu behalten.'
            : kind === 'content'
              ? 'Damit kannst du Tiefe, Rhythmus und Lesbarkeit an den jeweiligen Veröffentlichungsort anpassen.'
              : 'Außerdem kannst du Rhythmus, Pausen und Dauer prüfen, wenn der Text für den Vortrag gedacht ist.',
      ];
    }

    if (category === 'character-counter') {
      return [
        `Nutze diese Seite, um ${subject.toLowerCase()} vor Veröffentlichung, Versand oder Wiederverwendung auf einer anderen Plattform zu prüfen.`,
        kind === 'metadata'
          ? 'So stellst du sicher, dass der Text innerhalb des tatsächlich sichtbaren Platzes lesbar und wirksam bleibt.'
          : kind === 'messaging'
            ? 'Sie hilft auch dabei, ungeschickte Kürzungen zu vermeiden, wenn die Nachricht mobil schnell gelesen werden soll.'
            : 'Du behältst genug Spielraum für Hashtags, Links, Emojis oder Handlungsaufforderungen, ohne das Limit zu sprengen.',
      ];
    }

    if (category === 'readability') {
      return [
        `Nutze diese Prüfung, um ${subject.toLowerCase()} an das Klarheitsniveau deiner Zielgruppe anzupassen.`,
        kind === 'audience'
          ? 'Es geht nicht nur um Vereinfachung, sondern darum, den Inhalt für genau diese Lesergruppe verständlich zu machen.'
          : 'So erkennst du lange Sätze, dichte Wortwahl und Übergänge, die vor der Veröffentlichung überarbeitet werden sollten.',
      ];
    }

    return [
      `Nutze diesen Rechner, um die Lesezeit von ${subject.toLowerCase()} einzuschätzen und den Rhythmus besser zu planen.`,
      kind === 'scripted'
        ? 'Das ist besonders hilfreich, wenn der Text laut gelesen wird oder in ein festes Zeitfenster passen muss.'
        : 'So kannst du entscheiden, ob du den Inhalt kürzen, ausbauen oder in Abschnitte teilen solltest.',
    ];
  }

  if (locale === 'pt') {
    if (category === 'word-counter') {
      return [
        `Use esta página para controlar o tamanho de ${subject.toLowerCase()} desde o primeiro rascunho até a versão final.`,
        kind === 'academic'
          ? 'Isso ajuda a distribuir melhor introdução, desenvolvimento e conclusão sem ultrapassar o limite pedido.'
          : kind === 'professional'
            ? 'Também ajuda a manter uma mensagem clara, curta e fácil de revisar antes do envio.'
            : kind === 'content'
              ? 'Serve para ajustar profundidade, ritmo e legibilidade de acordo com o canal de publicação.'
              : 'Também permite testar ritmo, pausas e duração quando o texto será lido em voz alta.',
      ];
    }

    if (category === 'character-counter') {
      return [
        `Use esta página para revisar ${subject.toLowerCase()} antes de publicar, enviar ou reutilizar em outra plataforma.`,
        kind === 'metadata'
          ? 'Assim você confirma que o texto continua visível, legível e útil dentro do espaço realmente disponível.'
          : kind === 'messaging'
            ? 'Ela também ajuda a evitar cortes estranhos quando a mensagem precisa ser lida rapidamente no celular.'
            : 'Você mantém espaço para hashtags, links, emojis ou chamadas para ação sem ultrapassar o limite.',
      ];
    }

    if (category === 'readability') {
      return [
        `Use este verificador para ajustar ${subject.toLowerCase()} ao nível de clareza esperado pelo seu público.`,
        kind === 'audience'
          ? 'O objetivo não é apenas simplificar, mas manter o conteúdo compreensível para esse perfil de leitor.'
          : 'Ele ajuda a revisar frases longas, vocabulário denso e transições antes de publicar ou entregar o texto.',
      ];
    }

    return [
      `Use esta calculadora para estimar quanto tempo ${subject.toLowerCase()} leva para ser lido e ajustar melhor o ritmo.`,
      kind === 'scripted'
        ? 'Isso é especialmente útil quando o texto será lido em voz alta ou precisa caber em uma duração específica.'
        : 'Assim você decide se vale resumir, ampliar ou dividir o conteúdo antes de compartilhar.',
    ];
  }

  if (category === 'word-counter') {
    return [
      `Use this page to control the length of ${subject.toLowerCase()} from the first draft through the final version.`,
      'It helps you keep structure, pacing, and scope aligned with the format you are writing for.',
    ];
  }

  if (category === 'character-counter') {
    return [
      `Use this page to review ${subject.toLowerCase()} before publishing, sharing, or reusing it elsewhere.`,
      'It helps you stay visible inside real platform limits while leaving room for supporting elements.',
    ];
  }

  if (category === 'readability') {
    return [
      `Use this checker to match ${subject.toLowerCase()} to the clarity level your audience expects.`,
      'It is useful for tightening dense sentences and smoothing transitions before publishing.',
    ];
  }

  return [
    `Use this calculator to estimate how long ${subject.toLowerCase()} takes to read and to tune its pacing.`,
    'That makes it easier to decide whether the draft needs trimming, expansion, or a cleaner structure.',
  ];
}

function buildRecommendationItems(locale: LocaleCode, category: LongTailCategory, kind: SubjectKind): string[] {
  if (locale === 'es') {
    if (category === 'word-counter') {
      if (kind === 'academic') return [
        'Define una meta por sección antes de redactar para no cargar demasiado una sola parte.',
        'Deja margen para citas, referencias internas y una revisión final de claridad.',
        'Comprueba el total otra vez después de recortar repeticiones o ejemplos secundarios.',
      ];
      if (kind === 'professional') return [
        'Prioriza contexto, valor y cierre antes de añadir detalles secundarios.',
        'Revisa si cada bloque aporta una acción clara o una prueba concreta.',
        'Haz una última pasada para eliminar rodeos y frases demasiado largas.',
      ];
      if (kind === 'content') return [
        'Ajusta apertura, desarrollo y cierre al canal donde se va a leer el texto.',
        'Mantén los apartados principales equilibrados para mejorar la lectura en pantalla.',
        'Usa el contador tras cada revisión importante para no perder el alcance previsto.',
      ];
      return [
        'Lee el borrador en voz alta para comprobar ritmo y duración reales.',
        'Marca pausas o cambios de bloque antes de recortar contenido importante.',
        'Repite la medición al final para confirmar que la pieza sigue siendo fluida.',
      ];
    }

    if (category === 'character-counter') {
      if (kind === 'metadata') return [
        'Comprueba la parte más visible primero: título, inicio o vista previa.',
        'Reserva espacio para separadores, hashtags o elementos que la plataforma añada.',
        'Vuelve a revisar la versión final después de introducir keywords o llamadas a la acción.',
      ];
      if (kind === 'messaging') return [
        'Mantén la idea principal al principio para que el mensaje se entienda de inmediato.',
        'Evita frases largas que se rompan mal en pantallas pequeñas.',
        'Revisa emojis, enlaces y nombres propios porque también consumen espacio.',
      ];
      return [
        'Deja margen para hashtags, enlaces y menciones antes de publicar.',
        'Comprueba cómo se ve la primera línea, no solo el total de caracteres.',
        'Haz una última revisión después de añadir emojis o llamadas a la acción.',
      ];
    }

    if (category === 'readability') return [
      'Reduce frases largas y vocabulario innecesariamente denso antes de publicar.',
      'Asegúrate de que cada párrafo desarrolla una sola idea principal.',
      'Vuelve a medir la legibilidad después de cada revisión importante del texto.',
    ];

    return kind === 'scripted'
      ? [
          'Prueba el texto a velocidad real para comprobar respiración y pausas.',
          'Recorta introducciones lentas si la pieza debe entrar en un tiempo fijo.',
          'Mide de nuevo tras cada cambio importante en estructura o tono.',
        ]
      : [
          'Decide si el lector necesita una versión breve, media o ampliada del contenido.',
          'Usa subtítulos o cortes naturales si el tiempo estimado empieza a crecer demasiado.',
          'Revisa la duración final tras añadir ejemplos, citas o apartados nuevos.',
        ];
  }

  if (locale === 'fr') {
    if (category === 'word-counter') {
      if (kind === 'academic') return [
        'Définissez un objectif par section avant de rédiger pour éviter de surcharger une partie du texte.',
        'Gardez une marge pour les citations, références internes et la révision finale.',
        'Vérifiez le total après avoir supprimé répétitions et exemples secondaires.',
      ];
      if (kind === 'professional') return [
        'Privilégiez le contexte, la valeur et la conclusion avant les détails secondaires.',
        'Vérifiez que chaque bloc apporte une action claire ou une preuve concrète.',
        'Faites une dernière passe pour supprimer les détours et les phrases trop longues.',
      ];
      if (kind === 'content') return [
        'Ajustez ouverture, développement et conclusion au canal de diffusion.',
        'Gardez des sections équilibrées pour améliorer la lecture à l’écran.',
        'Relancez le compteur après chaque révision importante pour conserver la bonne portée.',
      ];
      return [
        'Lisez le brouillon à voix haute pour vérifier le rythme et la durée réelle.',
        'Repérez les pauses et les changements de bloc avant de couper du contenu utile.',
        'Mesurez de nouveau à la fin pour confirmer que l’ensemble reste fluide.',
      ];
    }

    if (category === 'character-counter') {
      if (kind === 'metadata') return [
        'Vérifiez d’abord la partie la plus visible : titre, début ou aperçu.',
        'Gardez de la place pour les séparateurs, hashtags ou éléments ajoutés par la plateforme.',
        'Recontrôlez la version finale après ajout de mots-clés ou d’appels à l’action.',
      ];
      if (kind === 'messaging') return [
        'Placez l’idée principale au début pour que le message soit compris immédiatement.',
        'Évitez les phrases trop longues qui se coupent mal sur mobile.',
        'Contrôlez émojis, liens et noms propres, car ils utilisent aussi de l’espace.',
      ];
      return [
        'Gardez une marge pour hashtags, liens et mentions avant publication.',
        'Vérifiez la première ligne visible, pas seulement le total de caractères.',
        'Faites un dernier contrôle après ajout d’émojis ou d’un appel à l’action.',
      ];
    }

    if (category === 'readability') return [
      'Réduisez les phrases trop longues et le vocabulaire inutilement dense.',
      'Assurez-vous que chaque paragraphe développe une seule idée principale.',
      'Mesurez à nouveau la lisibilité après chaque révision importante.',
    ];

    return kind === 'scripted'
      ? [
          'Testez le texte à vitesse réelle pour vérifier respiration et pauses.',
          'Raccourcissez les introductions lentes si la durée est contrainte.',
          'Recalculez après chaque modification importante de structure ou de ton.',
        ]
      : [
          'Décidez si le lecteur a besoin d’une version courte, moyenne ou développée.',
          'Ajoutez intertitres et coupures naturelles si la durée devient trop longue.',
          'Vérifiez la durée finale après ajout d’exemples, de citations ou de sections.',
        ];
  }

  if (locale === 'de') {
    if (category === 'word-counter') {
      if (kind === 'academic') return [
        'Lege vor dem Schreiben ein Ziel pro Abschnitt fest, damit kein Teil zu schwer wird.',
        'Lass Platz für Zitate, interne Verweise und die letzte Überarbeitung.',
        'Prüfe die Gesamtzahl erneut, nachdem Wiederholungen und Nebenbeispiele entfernt wurden.',
      ];
      if (kind === 'professional') return [
        'Stelle Kontext, Nutzen und Abschluss vor nebensächliche Details.',
        'Prüfe, ob jeder Block eine klare Handlung oder einen belastbaren Beleg liefert.',
        'Mache eine letzte Runde, um Umwege und zu lange Sätze zu streichen.',
      ];
      if (kind === 'content') return [
        'Passe Einstieg, Hauptteil und Schluss an den Veröffentlichungsort an.',
        'Halte die Hauptabschnitte ausgewogen, damit der Text am Bildschirm gut lesbar bleibt.',
        'Nutze den Zähler nach jeder größeren Überarbeitung erneut.',
      ];
      return [
        'Lies den Entwurf laut, um Rhythmus und echte Dauer zu prüfen.',
        'Markiere Pausen und Übergänge, bevor du wichtigen Inhalt kürzt.',
        'Miss am Ende noch einmal nach, damit die Fassung flüssig bleibt.',
      ];
    }

    if (category === 'character-counter') {
      if (kind === 'metadata') return [
        'Prüfe zuerst den sichtbarsten Teil: Titel, Anfang oder Vorschau.',
        'Plane Platz für Trenner, Hashtags oder automatisch ergänzte Elemente ein.',
        'Kontrolliere die Endfassung nach dem Einfügen von Keywords oder CTAs erneut.',
      ];
      if (kind === 'messaging') return [
        'Setze die Hauptaussage an den Anfang, damit die Nachricht sofort verständlich ist.',
        'Vermeide lange Sätze, die auf kleinen Displays unglücklich umbrechen.',
        'Behalte Emojis, Links und Eigennamen im Blick, weil sie ebenfalls Platz verbrauchen.',
      ];
      return [
        'Lass vor der Veröffentlichung Raum für Hashtags, Links und Erwähnungen.',
        'Prüfe die erste sichtbare Zeile, nicht nur die Gesamtzahl der Zeichen.',
        'Führe nach Emojis oder einer Handlungsaufforderung einen letzten Check durch.',
      ];
    }

    if (category === 'readability') return [
      'Verkürze zu lange Sätze und unnötig dichte Wortwahl vor der Veröffentlichung.',
      'Achte darauf, dass jeder Absatz nur eine Hauptidee trägt.',
      'Miss die Lesbarkeit nach jeder größeren Überarbeitung erneut.',
    ];

    return kind === 'scripted'
      ? [
          'Teste den Text im echten Sprechtempo, um Atmung und Pausen zu prüfen.',
          'Kürze langsame Einstiege, wenn das Stück in ein festes Zeitfenster passen muss.',
          'Berechne nach jeder strukturellen Änderung die Dauer erneut.',
        ]
      : [
          'Entscheide, ob Leser eine kurze, mittlere oder ausführliche Fassung brauchen.',
          'Nutze Zwischenüberschriften oder natürliche Brüche, wenn die Dauer zu lang wird.',
          'Prüfe die Enddauer nach zusätzlichen Beispielen, Zitaten oder Abschnitten.',
        ];
  }

  if (locale === 'pt') {
    if (category === 'word-counter') {
      if (kind === 'academic') return [
        'Defina uma meta por seção antes de escrever para não concentrar peso demais em uma parte do texto.',
        'Deixe margem para citações, referências internas e uma revisão final de clareza.',
        'Confira a contagem novamente depois de cortar repetições ou exemplos secundários.',
      ];
      if (kind === 'professional') return [
        'Priorize contexto, valor e encerramento antes de adicionar detalhes secundários.',
        'Revise se cada bloco entrega uma ação clara ou uma evidência concreta.',
        'Faça uma última passada para remover rodeios e frases longas demais.',
      ];
      if (kind === 'content') return [
        'Ajuste abertura, desenvolvimento e fechamento ao canal em que o texto será publicado.',
        'Mantenha as seções principais equilibradas para melhorar a leitura na tela.',
        'Use o contador novamente após cada revisão importante para manter o escopo previsto.',
      ];
      return [
        'Leia o rascunho em voz alta para conferir ritmo e duração real.',
        'Marque pausas e mudanças de bloco antes de cortar conteúdo importante.',
        'Meça novamente no final para confirmar que a peça continua fluida.',
      ];
    }

    if (category === 'character-counter') {
      if (kind === 'metadata') return [
        'Confira primeiro a parte mais visível: título, início ou prévia.',
        'Reserve espaço para separadores, hashtags ou elementos adicionados pela plataforma.',
        'Revise a versão final depois de inserir palavras-chave ou chamadas para ação.',
      ];
      if (kind === 'messaging') return [
        'Coloque a ideia principal no começo para que a mensagem seja entendida de imediato.',
        'Evite frases longas que quebrem mal em telas pequenas.',
        'Revise emojis, links e nomes próprios porque eles também ocupam espaço.',
      ];
      return [
        'Deixe margem para hashtags, links e menções antes de publicar.',
        'Confira a primeira linha visível, não apenas o total de caracteres.',
        'Faça uma revisão final depois de adicionar emojis ou chamadas para ação.',
      ];
    }

    if (category === 'readability') return [
      'Reduza frases longas e vocabulário desnecessariamente denso antes de publicar.',
      'Garanta que cada parágrafo desenvolva uma única ideia principal.',
      'Meça a legibilidade novamente após cada revisão relevante do texto.',
    ];

    return kind === 'scripted'
      ? [
          'Teste o texto em ritmo real para conferir respiração e pausas.',
          'Encurte introduções lentas se a peça precisar caber em um tempo fixo.',
          'Meça novamente após mudanças importantes de estrutura ou tom.',
        ]
      : [
          'Decida se o leitor precisa de uma versão curta, média ou expandida do conteúdo.',
          'Use subtítulos ou cortes naturais se o tempo estimado começar a ficar longo demais.',
          'Revise a duração final depois de adicionar exemplos, citações ou novas seções.',
        ];
  }

  if (category === 'word-counter') {
    return [
      'Set a section-level target before drafting so one part does not absorb the whole word budget.',
      'Leave room for revision, examples, and a final pass on clarity.',
      'Run the counter again after trimming repetition or restructuring the draft.',
    ];
  }

  if (category === 'character-counter') {
    return [
      'Check the most visible line first, not just the total count.',
      'Leave room for hashtags, links, emojis, or platform formatting quirks.',
      'Recheck the final version after adding names, tags, or calls to action.',
    ];
  }

  if (category === 'readability') return [
    'Shorten overgrown sentences before changing the whole piece.',
    'Keep each paragraph focused on one main idea.',
    'Measure again after every meaningful revision to track clarity improvements.',
  ];

  return [
    'Estimate timing on the actual version readers will see.',
    'Use natural breaks and subheads when the read time starts to feel heavy.',
    'Recalculate after adding examples, sections, or quoted material.',
  ];
}

function buildFaqItems(locale: LocaleCode, category: LongTailCategory, kind: SubjectKind, subject: string) {
  if (locale === 'es') {
    if (category === 'word-counter') {
      return [
        {
          q: `¿Cuándo conviene revisar el conteo de ${subject.toLowerCase()}?`,
          a: kind === 'academic'
            ? 'Conviene revisarlo al terminar el primer borrador, después de la revisión estructural y justo antes de entregar la versión final.'
            : 'Lo ideal es comprobarlo al cerrar cada revisión importante para no perder claridad ni extensión útil.',
        },
        {
          q: '¿Es mejor recortar o ampliar primero?',
          a: 'Primero confirma si falta contexto o si sobra repetición. Después ajusta la longitud con cambios de contenido reales, no con relleno.',
        },
      ];
    }

    if (category === 'character-counter') {
      return [
        {
          q: '¿Debo dejar margen antes de publicar?',
          a: kind === 'metadata'
            ? 'Sí. Un pequeño margen ayuda cuando la plataforma recorta vistas previas o cuando debes añadir un separador, keyword o etiqueta al final.'
            : 'Sí. Dejar margen evita que un enlace, un emoji o una mención te empujen fuera del límite en el último momento.',
        },
        {
          q: '¿Qué debo revisar además del número total?',
          a: 'Revisa la primera línea visible, la claridad del mensaje y si el texto sigue funcionando cuando se ve truncado o resumido.',
        },
      ];
    }

    if (category === 'readability') {
      return [
        {
          q: `¿Qué nivel de legibilidad conviene para ${subject.toLowerCase()}?`,
          a: kind === 'audience'
            ? 'Depende de la edad o experiencia lectora del público. El objetivo es que el texto se entienda sin perder precisión ni tono.'
            : 'Depende del contexto y del lector esperado. En general, conviene priorizar claridad, frases directas y transiciones limpias.',
        },
        {
          q: '¿Qué hago si la puntuación sale demasiado difícil?',
          a: 'Empieza por acortar frases largas, dividir párrafos densos y sustituir términos poco necesarios por formulaciones más directas.',
        },
      ];
    }

    return [
      {
        q: `¿Cuándo conviene mostrar el tiempo de lectura de ${subject.toLowerCase()}?`,
        a: kind === 'content'
          ? 'Suele ser útil cuando el lector necesita decidir rápido si puede consumir el contenido completo.'
          : 'Es útil cuando la duración condiciona el formato, la agenda o la experiencia de la audiencia.',
      },
      {
        q: '¿Cómo mejora esto la edición final?',
        a: 'Te permite ver si la pieza necesita resumirse, dividirse en bloques o ganar contexto antes de publicarse o presentarse.',
      },
    ];
  }

  if (locale === 'fr') {
    if (category === 'word-counter') {
      return [
        {
          q: `Quand faut-il vérifier le nombre de mots de ${subject.toLowerCase()} ?`,
          a: kind === 'academic'
            ? 'Le plus utile est de le vérifier après le premier brouillon, après la révision structurelle, puis juste avant la remise finale.'
            : 'Le mieux est de le contrôler après chaque révision importante pour garder clarté et bonne longueur.',
        },
        {
          q: 'Faut-il d’abord couper ou développer ?',
          a: 'Commencez par identifier ce qui manque vraiment et ce qui se répète. Ajustez ensuite la longueur avec de vrais choix éditoriaux, pas avec du remplissage.',
        },
      ];
    }

    if (category === 'character-counter') {
      return [
        {
          q: 'Faut-il garder une marge avant publication ?',
          a: kind === 'metadata'
            ? 'Oui. Une petite marge aide lorsque la plateforme coupe un aperçu ou lorsque vous ajoutez un séparateur, un mot-clé ou une balise à la fin.'
            : 'Oui. Une marge évite qu’un lien, un émoji ou une mention fasse dépasser la limite au dernier moment.',
        },
        {
          q: 'Que faut-il vérifier en plus du total ?',
          a: 'Vérifiez la première ligne visible, la clarté du message et son efficacité lorsqu’il apparaît tronqué ou résumé.',
        },
      ];
    }

    if (category === 'readability') {
      return [
        {
          q: `Quel niveau de lisibilité viser pour ${subject.toLowerCase()} ?`,
          a: kind === 'audience'
            ? 'Cela dépend de l’âge ou de l’expérience de lecture du public. Le but est d’être compris sans perdre précision ni ton.'
            : 'Cela dépend du contexte et du lectorat. En pratique, il vaut mieux privilégier des phrases directes et des transitions nettes.',
        },
        {
          q: 'Que faire si le score est trop difficile ?',
          a: 'Commencez par raccourcir les phrases longues, alléger les paragraphes trop denses et remplacer les formulations inutiles par des alternatives plus directes.',
        },
      ];
    }

    return [
      {
        q: `Quand afficher le temps de lecture de ${subject.toLowerCase()} ?`,
        a: kind === 'content'
          ? 'C’est utile lorsque le lecteur doit rapidement savoir s’il peut consommer le contenu en entier.'
          : 'C’est pertinent lorsque la durée influence le format, l’agenda ou l’expérience du public.',
      },
      {
        q: 'En quoi cela aide-t-il la révision finale ?',
        a: 'Vous voyez plus facilement si la pièce doit être raccourcie, découpée ou développée avant publication ou présentation.',
      },
    ];
  }

  if (locale === 'de') {
    if (category === 'word-counter') {
      return [
        {
          q: `Wann sollte man die Länge von ${subject.toLowerCase()} prüfen?`,
          a: kind === 'academic'
            ? 'Am sinnvollsten ist die Prüfung nach dem ersten Entwurf, nach der Strukturüberarbeitung und kurz vor der finalen Abgabe.'
            : 'Prüfe die Länge nach jeder größeren Überarbeitung, damit Klarheit und Umfang im Gleichgewicht bleiben.',
        },
        {
          q: 'Sollte man zuerst kürzen oder ausbauen?',
          a: 'Zuerst klären, ob wirklich Kontext fehlt oder nur Wiederholungen vorhanden sind. Danach die Länge mit echten Inhaltsentscheidungen anpassen.',
        },
      ];
    }

    if (category === 'character-counter') {
      return [
        {
          q: 'Sollte ich vor der Veröffentlichung noch Reserve lassen?',
          a: kind === 'metadata'
            ? 'Ja. Eine kleine Reserve hilft, wenn Vorschauen abgeschnitten werden oder noch Trenner, Keywords oder Tags ergänzt werden müssen.'
            : 'Ja. So verhindert man, dass Links, Emojis oder Erwähnungen das Limit im letzten Schritt sprengen.',
        },
        {
          q: 'Was sollte ich außer der Gesamtzahl noch prüfen?',
          a: 'Wichtig sind die erste sichtbare Zeile, die Verständlichkeit der Aussage und die Wirkung des Textes in gekürzter Ansicht.',
        },
      ];
    }

    if (category === 'readability') {
      return [
        {
          q: `Welches Lesbarkeitsniveau passt zu ${subject.toLowerCase()}?`,
          a: kind === 'audience'
            ? 'Das hängt von Alter und Leseerfahrung der Zielgruppe ab. Der Text sollte verständlich sein, ohne an Präzision zu verlieren.'
            : 'Das hängt von Kontext und Leserschaft ab. Meist ist klare Sprache mit direkten Sätzen die bessere Wahl.',
        },
        {
          q: 'Was tun, wenn der Text zu schwer wirkt?',
          a: 'Beginne mit langen Sätzen, dichten Absätzen und unnötig komplexen Formulierungen. Schon kleine Kürzungen verbessern die Lesbarkeit spürbar.',
        },
      ];
    }

    return [
      {
        q: `Wann sollte die Lesezeit von ${subject.toLowerCase()} angezeigt werden?`,
        a: kind === 'content'
          ? 'Vor allem dann, wenn Leser schnell entscheiden müssen, ob sie den Inhalt jetzt vollständig lesen können.'
          : 'Besonders dann, wenn die Dauer das Format, den Ablauf oder die Erwartung des Publikums beeinflusst.',
      },
      {
        q: 'Wie hilft das bei der Schlussredaktion?',
        a: 'Du erkennst schneller, ob der Text gekürzt, gegliedert oder um Kontext ergänzt werden sollte, bevor er veröffentlicht oder vorgetragen wird.',
      },
    ];
  }

  if (locale === 'pt') {
    if (category === 'word-counter') {
      return [
        {
          q: `Quando vale revisar o tamanho de ${subject.toLowerCase()}?`,
          a: kind === 'academic'
            ? 'O ideal é revisar depois do primeiro rascunho, após a revisão estrutural e mais uma vez antes da entrega final.'
            : 'Vale revisar após cada mudança importante para manter clareza e extensão sob controle.',
        },
        {
          q: 'É melhor cortar ou expandir primeiro?',
          a: 'Primeiro confirme se falta contexto ou se o texto apenas repete ideias. Depois ajuste o tamanho com mudanças editoriais reais, não com preenchimento.',
        },
      ];
    }

    if (category === 'character-counter') {
      return [
        {
          q: 'Devo deixar margem antes de publicar?',
          a: kind === 'metadata'
            ? 'Sim. Uma pequena margem ajuda quando a plataforma encurta a prévia ou quando ainda será preciso adicionar separadores, palavras-chave ou tags.'
            : 'Sim. A margem evita que links, emojis ou menções façam o texto ultrapassar o limite no último momento.',
        },
        {
          q: 'O que revisar além do total?',
          a: 'Revise a primeira linha visível, a clareza da mensagem e o efeito do texto quando ele aparece cortado ou resumido.',
        },
      ];
    }

    if (category === 'readability') {
      return [
        {
          q: `Que nível de legibilidade faz sentido para ${subject.toLowerCase()}?`,
          a: kind === 'audience'
            ? 'Isso depende da idade ou da experiência de leitura do público. O objetivo é manter o texto compreensível sem perder precisão.'
            : 'Isso depende do contexto e do leitor esperado. Em geral, vale priorizar frases diretas, vocabulário claro e transições limpas.',
        },
        {
          q: 'O que fazer se o texto parecer difícil demais?',
          a: 'Comece encurtando frases longas, dividindo parágrafos densos e trocando formulações desnecessariamente complexas por alternativas mais diretas.',
        },
      ];
    }

    return [
      {
        q: `Quando mostrar o tempo de leitura de ${subject.toLowerCase()}?`,
        a: kind === 'content'
          ? 'Isso ajuda quando o leitor precisa decidir rapidamente se consegue consumir o conteúdo completo naquele momento.'
          : 'É especialmente útil quando a duração afeta formato, agenda ou experiência do público.',
      },
      {
        q: 'Como isso ajuda na edição final?',
        a: 'Fica mais fácil perceber se a peça precisa ser resumida, dividida em blocos ou ganhar contexto antes de ser publicada ou apresentada.',
      },
    ];
  }

  if (category === 'word-counter') {
    return [
      {
        q: `When should you check the length of ${subject.toLowerCase()}?`,
        a: 'Check it after the first draft, after structural edits, and once more before final publication or submission.',
      },
      {
        q: 'Is it better to trim or expand first?',
        a: 'Start by deciding whether the draft lacks needed context or simply repeats itself. Then adjust length with real editorial changes, not filler.',
      },
    ];
  }

  if (category === 'character-counter') {
    return [
      {
        q: 'Should you leave buffer space before publishing?',
        a: 'Yes. A small buffer helps when links, emojis, tags, or platform formatting consume space at the end of the process.',
      },
      {
        q: 'What matters besides the raw total?',
        a: 'The visible first line, the clarity of the message, and how well it survives truncation all matter alongside the total count.',
      },
    ];
  }

  if (category === 'readability') {
    return [
      {
        q: `What readability target fits ${subject.toLowerCase()}?`,
        a: 'The right target depends on audience expectations. In most cases, clear sentence structure and steady pacing matter more than chasing one exact score.',
      },
      {
        q: 'What if the draft still feels too dense?',
        a: 'Shorten the longest sentences first, split overloaded paragraphs, and replace unnecessarily technical phrasing where the meaning stays intact.',
      },
    ];
  }

  return [
    {
      q: `When should you show the reading time for ${subject.toLowerCase()}?`,
      a: 'Show it when duration changes how people choose, schedule, or consume the piece.',
    },
    {
      q: 'How does this help with final editing?',
      a: 'It tells you whether the draft needs trimming, expansion, or better segmentation before it goes live.',
    },
  ];
}

function buildLocalizedArticle(slug: string, locale: LocaleCode): string {
  const t = localeText[locale];
  const category = inferLongTailCategory(slug) ?? 'word-counter';
  const subject = translateSubject(slug, locale, category);
  const kind = getSubjectKind(category, slug);
  const tools = getToolNames(locale);
  const overviewParagraphs = buildOverviewParagraphs(locale, category, kind, subject);
  const recommendationItems = buildRecommendationItems(locale, category, kind);
  const faqItems = [...buildFaqItems(locale, category, kind, subject), ...t.faqItems];

  const relatedLinks = category === 'reading-time'
    ? [
        { href: getLocalizedToolPath(locale, 'reading-time-calculator'), label: tools.reading },
        { href: getLocalizedToolPath(locale, 'word-counter'), label: tools.word },
        { href: getLocalizedToolPath(locale, 'readability-checker'), label: tools.readability },
      ]
    : category === 'readability'
      ? [
          { href: getLocalizedToolPath(locale, 'readability-checker'), label: tools.readability },
          { href: getLocalizedToolPath(locale, 'word-counter'), label: tools.word },
          { href: getLocalizedToolPath(locale, 'paragraph-rewriter'), label: locale === 'es' ? 'Reescritor de Párrafos' : locale === 'fr' ? 'Réécriveur de Paragraphes' : locale === 'de' ? 'Absatz-Umschreiber' : locale === 'pt' ? 'Reescritor de Parágrafos' : 'Paragraph Rewriter' },
        ]
      : category === 'character-counter'
        ? [
            { href: getLocalizedToolPath(locale, 'character-counter'), label: tools.character },
            { href: getLocalizedToolPath(locale, 'word-counter'), label: tools.word },
            { href: getLocalizedToolPath(locale, 'text-compare-tool'), label: locale === 'es' ? 'Comparador de Texto' : locale === 'fr' ? 'Comparateur de Texte' : locale === 'de' ? 'Textvergleich' : locale === 'pt' ? 'Comparador de Texto' : 'Text Compare Tool' },
          ]
        : [
            { href: getLocalizedToolPath(locale, 'word-counter'), label: tools.word },
            { href: getLocalizedToolPath(locale, 'character-counter'), label: tools.character },
            { href: getLocalizedToolPath(locale, 'readability-checker'), label: tools.readability },
          ];

  return `
    <section class="mb-6">
      <h2 class="text-2xl font-display font-bold mb-3">${escapeHtml(t.howToUse)}</h2>
      ${overviewParagraphs.map((paragraph) => `<p class="text-text-primary mb-4">${escapeHtml(paragraph)}</p>`).join('')}
    </section>
    <section class="mb-6 bg-surface rounded-2xl p-8 border border-gray-100">
      <h2 class="text-2xl font-display font-bold mb-6 text-center">${escapeHtml(t.bestFor)}</h2>
      <p class="text-text-primary">${escapeHtml(buildBestForText(locale, category, subject, kind, tools))}</p>
    </section>
    <section class="mb-6 bg-surface rounded-2xl p-8 border border-gray-100">
      <h2 class="text-2xl font-display font-bold mb-6 text-center">${escapeHtml(getRecommendationHeading(locale, category))}</h2>
      <ul class="space-y-4 text-text-primary">
        ${recommendationItems.map((item) => `<li class="flex gap-3"><span class="text-brand-pink font-bold" aria-hidden="true">•</span><span>${escapeHtml(item)}</span></li>`).join('')}
      </ul>
    </section>
    <section class="mb-6 bg-surface rounded-2xl p-8 border border-gray-100">
      <h2 class="text-2xl font-display font-bold mb-6 text-center">${escapeHtml(t.tips)}</h2>
      <ul class="space-y-4 text-text-primary">
        ${t.tipsItems.map((item) => `<li class="flex gap-3"><span class="text-brand-cyan font-bold" aria-hidden="true">${renderIconHtml('check', { className: 'inline-block align-middle', size: 16 })}</span><span>${escapeHtml(item)}</span></li>`).join('')}
      </ul>
    </section>
    <section class="mb-6">
      <h2 class="text-2xl font-display font-bold mb-4">${escapeHtml(t.faq)}</h2>
      ${faqItems.map((item, index) => `
        <details class="bg-surface rounded-xl border border-gray-100 p-6 group mb-4">
          <summary class="font-display font-semibold cursor-pointer list-none flex justify-between items-center text-lg">
            ${escapeHtml(item.q)}
            <span class="${index % 2 === 0 ? 'text-brand-pink' : 'text-brand-cyan'} group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <p class="text-text-muted mt-4">${escapeHtml(item.a)}</p>
        </details>
      `).join('')}
    </section>
    <section class="mb-6">
      <h2 class="text-2xl font-display font-bold mb-4">${escapeHtml(t.related)}</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        ${relatedLinks.map((link, index) => `<a href="${link.href}" class="bg-surface p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow block text-center"><div class="text-xs uppercase tracking-wide mb-2 ${index === 0 ? 'text-brand-pink' : index === 1 ? 'text-brand-cyan' : 'text-brand-orange'}">Tool</div><h3 class="text-sm font-display font-semibold mb-1 ${index === 0 ? 'text-brand-pink' : index === 1 ? 'text-brand-cyan' : 'text-brand-orange'}">${escapeHtml(link.label)}</h3><p class="text-xs text-text-muted">${escapeHtml(t.related)}</p></a>`).join('')}
      </div>
    </section>
  `;
}

/**
 * Generate JSON-LD schema markup for a long-tail page.
 * Returns both SoftwareApplication and FAQPage schemas.
 */
export function generateLongTailPageSchemas(slug: string, locale: LocaleCode = 'en') {
  const category = inferLongTailCategory(slug) ?? 'word-counter';
  const subject = translateSubject(slug, locale, category);
  const toolLabel = getCategoryToolLabel(locale, category);
  const kind = getSubjectKind(category, slug);

  // Build localized tool name and description
  let name: string;
  let description: string;

  if (locale === 'es') {
    name = `${toolLabel} para ${subject}`;
    description = `Herramienta gratuita para ${subject.toLowerCase()}. Analiza tu texto con resultados instantáneos.`;
  } else if (locale === 'fr') {
    name = `${toolLabel} pour ${subject}`;
    description = `Outil gratuit pour ${subject.toLowerCase()}. Analysez votre texte avec des résultats immédiats.`;
  } else if (locale === 'de') {
    name = `${toolLabel} für ${subject}`;
    description = `Kostenloses Tool für ${subject.toLowerCase()}. Analysieren Sie Ihren Text mit sofortigen Ergebnissen.`;
  } else if (locale === 'pt') {
    name = `${toolLabel} para ${subject}`;
    description = `Ferramenta gratuita para ${subject.toLowerCase()}. Analise seu texto com resultados imediatos.`;
  } else {
    name = `${toolLabel} for ${subject}`;
    description = `Free tool for ${subject.toLowerCase()}. Analyze your text with instant results.`;
  }

  // Generate pathname based on locale
  const pathname = locale === 'en' ? `/${slug}` : `/${locale}/${slug}`;

  // Generate SoftwareApplication schema
  const softwareSchema = generateSoftwareApplicationSchema({
    name,
    description,
    pathname,
    applicationCategory: 'SEO',
    operatingSystem: 'All',
  });

  // Generate FAQPage schema from localized FAQ items
  const faqItems = buildFaqItems(locale, category, kind, subject);
  const faqSchema = generateFAQPageSchema({
    mainEntity: faqItems.map((item) => ({
      question: item.q,
      answer: item.a,
    })),
  });

  return [softwareSchema, faqSchema];
}

export function getStandaloneLongTailSlugs(): string[] {
  return standaloneLongTailSlugs;
}

export function getLongTailPageContent(slug: string, locale?: string): LongTailPageContent | null {
  if (!standaloneLongTailSlugs.includes(slug)) {
    return null;
  }

  const filePath = path.join(pagesDir, `${slug}.astro`);
  const source = fs.readFileSync(filePath, 'utf8');
  const resolvedLocale = normalizeLocale(locale);
  const category = inferLongTailCategory(slug) ?? 'word-counter';

  const englishTitle = extractMatch(source, /title="([^"]+)"/);
  const englishDescription = extractMatch(source, /description="([^"]+)"/);
  const englishH1 = extractMatch(source, /<h1[^>]*>([\s\S]*?)<\/h1>/);
  const englishSubtitle = extractMatch(source, /<p class="text-base text-text-muted max-w-3xl">([\s\S]*?)<\/p>/);

  const localizedMeta = resolvedLocale === 'en'
    ? null
    : buildLocalizedMetadata(resolvedLocale, slug, category);

  const articleHtml = resolvedLocale === 'en'
    ? rewriteInternalLinks(extractMatch(source, /<article class="mt-8">([\s\S]*?)<\/article>/), resolvedLocale)
    : buildLocalizedArticle(slug, resolvedLocale);

  return {
    slug,
    title: localizedMeta?.title ?? englishTitle,
    description: localizedMeta?.description ?? englishDescription,
    h1: localizedMeta?.h1 ?? englishH1,
    subtitle: localizedMeta?.subtitle ?? englishSubtitle,
    articleHtml,
  };
}

export function getLocalizedLongTailStaticPaths() {
  return VALID_LOCALES.filter((locale) => locale !== 'en').flatMap((locale) =>
    standaloneLongTailSlugs.map((slug) => ({ params: { locale, slug } })),
  );
}
