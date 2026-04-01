// Translation utility for multi-language support
import en from './translations/en.json';
import es from './translations/es.json';
import fr from './translations/fr.json';
import de from './translations/de.json';
import pt from './translations/pt.json';

const translations = {
  en,
  es,
  fr,
  de,
  pt,
};

export type Locale = 'en' | 'es' | 'fr' | 'de' | 'pt';

export function getTranslation(locale: Locale, key: string): string {
  const keys = key.split('.');
  let value: any = translations[locale];
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // Fallback to English
      value = translations.en;
      for (const key of keys) {
        value = value[key];
      }
      break;
    }
  }
  
  return typeof value === 'string' ? value : key;
}

export const languages = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'de', name: 'German', native: 'Deutsch' },
  { code: 'pt', name: 'Portuguese', native: 'Português' },
];
