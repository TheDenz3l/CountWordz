'use client';

import { useState } from 'react';
import { getToolTranslation, resolveLocale } from '../lib/tool-i18n';

const SMALL_WORDS_BY_LOCALE: Record<string, RegExp> = {
  en: /^(a|an|and|as|at|but|by|en|for|if|in|nor|of|on|or|per|the|to|v.?|vs.?|via)$/i,
  es: /^(a|al|ante|bajo|cabe|con|contra|de|del|desde|durante|e|el|en|entre|hacia|hasta|la|las|lo|los|o|para|por|según|sin|sobre|tras|u|un|una|unas|unos|y)$/i,
  fr: /^(à|au|aux|de|des|du|et|en|la|le|les|ou|par|pour|sur|un|une|d')$/i,
  de: /^(am|an|auf|aus|bei|das|dem|den|der|des|die|ein|eine|einer|eines|im|in|mit|oder|und|von|vom|zu|zum|zur)$/i,
  pt: /^(a|ao|aos|à|às|com|da|das|de|do|dos|e|em|na|nas|no|nos|o|os|ou|para|por|um|uma|uns|umas)$/i,
};

function toTitleCase(str: string, locale: string): string {
  const smallWords = SMALL_WORDS_BY_LOCALE[locale] ?? SMALL_WORDS_BY_LOCALE.en;
  return str.replace(/[\p{L}\p{N}][\p{L}\p{M}\p{N}'’.-]*/gu, (match, index, title) => {
    if (
      index > 0 &&
      index + match.length !== title.length &&
      smallWords.test(match) &&
      title.charAt(Math.max(index - 2, 0)) !== ':' &&
      (title.charAt(index + match.length) !== ':' || title.charAt(index + match.length + 1) !== ')')
    ) {
      return match.toLocaleLowerCase(locale);
    }

    if (match.slice(1).search(/[A-ZÀ-Ý]|\./u) > -1) return match;
    return match.charAt(0).toLocaleUpperCase(locale) + match.slice(1).toLocaleLowerCase(locale);
  });
}

function toSentenceCase(str: string, locale: string): string {
  return str
    .toLocaleLowerCase(locale)
    .replace(/(^\s*\p{L}|[.!?]\s*\p{L})/gu, (chunk) => chunk.toLocaleUpperCase(locale));
}

interface Props {
  locale?: string;
}

export default function CaseConverterTool({ locale = 'en' }: Props) {
  const resolvedLocale = resolveLocale(locale);
  const common = getToolTranslation(resolvedLocale, 'common');
  const copy = getToolTranslation(resolvedLocale, 'caseConverter');
  const [text, setText] = useState('');

  const convert = (fn: (s: string) => string) => setText(fn(text));
  const handlePaste = async () => setText(await navigator.clipboard.readText().catch(() => ''));
  const handleClear = () => setText('');
  const handleCopy = async () => { if (text) await navigator.clipboard.writeText(text).catch(() => {}); };
  const handleSampleText = () => setText(copy.sampleText);

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2 mb-4 p-4 bg-gray-50 border-b border-gray-100 rounded-t-xl">
        <button onClick={handlePaste} className="px-4 py-2 bg-brand-cyan text-white rounded-lg font-medium">{common.paste}</button>
        <button onClick={handleClear} className="px-4 py-2 bg-brand-pink text-white rounded-lg font-medium">{common.clear}</button>
        <button onClick={handleCopy} className="px-4 py-2 bg-brand-orange text-white rounded-lg font-medium">{common.copy}</button>
        <button onClick={handleSampleText} className="px-4 py-2 bg-gray-200 text-text-primary rounded-lg font-medium">{common.sampleText}</button>
      </div>
      <div className="flex flex-wrap gap-2 mb-4 p-4 bg-gray-50">
        <button onClick={() => convert(s => s.toLocaleLowerCase(resolvedLocale))} className="px-4 py-2 bg-gray-200 rounded-lg font-medium hover:bg-gray-300">{copy.lowercase}</button>
        <button onClick={() => convert(s => s.toLocaleUpperCase(resolvedLocale))} className="px-4 py-2 bg-gray-200 rounded-lg font-medium hover:bg-gray-300">{copy.uppercase}</button>
        <button onClick={() => convert(s => toTitleCase(s, resolvedLocale))} className="px-4 py-2 bg-gray-200 rounded-lg font-medium hover:bg-gray-300">{copy.titleCase}</button>
        <button onClick={() => convert(s => toSentenceCase(s, resolvedLocale))} className="px-4 py-2 bg-gray-200 rounded-lg font-medium hover:bg-gray-300">{copy.sentenceCase}</button>
        <button onClick={() => convert(s => Array.from(s).map(c => c === c.toLocaleUpperCase(resolvedLocale) ? c.toLocaleLowerCase(resolvedLocale) : c.toLocaleUpperCase(resolvedLocale)).join(''))} className="px-4 py-2 bg-gray-200 rounded-lg font-medium hover:bg-gray-300">{copy.toggleCase}</button>
      </div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder={copy.placeholder} className="w-full h-64 md:h-80 p-4 border border-gray-200 rounded-b-xl resize-none focus:border-brand-pink" />
      <div className="mt-6 p-4 bg-gray-50 rounded-xl"><p className="text-sm text-text-muted">{copy.textLength} {text.length} {copy.characters}, {text.split(/\s+/).filter(w => w).length} {copy.words}</p></div>
    </div>
  );
}
