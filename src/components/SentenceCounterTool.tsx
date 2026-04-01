'use client';

import { useState } from 'react';
import { countSentences, countWords, countParagraphs } from '../lib/text-utils';
import { getToolTranslation, resolveLocale } from '../lib/tool-i18n';

interface Props {
  locale?: string;
}

export default function SentenceCounterTool({ locale = 'en' }: Props) {
  const resolvedLocale = resolveLocale(locale);
  const common = getToolTranslation(resolvedLocale, 'common');
  const copy = getToolTranslation(resolvedLocale, 'sentenceCounter');
  const [text, setText] = useState('');
  const sentences = countSentences(text, resolvedLocale);
  const words = countWords(text);
  const paragraphs = countParagraphs(text);
  const avgWordsPerSentence = sentences > 0 ? Math.round((words / sentences) * 10) / 10 : 0;

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
      <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder={copy.placeholder} className="w-full h-64 md:h-80 p-4 border border-gray-200 rounded-b-xl resize-none focus:border-brand-pink" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 p-4 bg-gray-50 rounded-xl">
        <div className="text-center p-3 bg-surface rounded-lg"><div className="text-2xl md:text-3xl font-display font-bold text-brand-pink">{sentences}</div><div className="text-xs text-text-muted mt-1 uppercase">{copy.sentences}</div></div>
        <div className="text-center p-3 bg-surface rounded-lg"><div className="text-xl font-display font-semibold text-brand-cyan">{avgWordsPerSentence}</div><div className="text-xs text-text-muted mt-1 uppercase">{copy.avgWordsPerSentence}</div></div>
        <div className="text-center p-3 bg-surface rounded-lg"><div className="text-lg font-display font-medium">{words}</div><div className="text-xs text-text-muted mt-1 uppercase">{copy.words}</div></div>
        <div className="text-center p-3 bg-surface rounded-lg"><div className="text-lg font-display font-medium">{paragraphs}</div><div className="text-xs text-text-muted mt-1 uppercase">{copy.paragraphs}</div></div>
      </div>
    </div>
  );
}
