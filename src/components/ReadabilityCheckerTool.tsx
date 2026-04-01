'use client';

import { useState } from 'react';
import { getReadabilityAnalysis } from '../lib/readability';
import { getLocalizedReadabilityBand, getToolTranslation, resolveLocale } from '../lib/tool-i18n';

interface Props {
  locale?: string;
}

export default function ReadabilityCheckerTool({ locale = 'en' }: Props) {
  const resolvedLocale = resolveLocale(locale);
  const common = getToolTranslation(resolvedLocale, 'common');
  const copy = getToolTranslation(resolvedLocale, 'readability');
  const [text, setText] = useState('');
  const analysis = getReadabilityAnalysis(text, resolvedLocale);
  const localizedBand = getLocalizedReadabilityBand(analysis.fleschReadingEase, resolvedLocale);

  const handlePaste = async () => setText(await navigator.clipboard.readText().catch(() => ''));
  const handleClear = () => setText('');
  const handleCopy = async () => {
    if (text) await navigator.clipboard.writeText(text).catch(() => {});
  };
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

      {text.trim().length > 0 && (
        <div className="mt-6 space-y-4">
          <div className="p-6 bg-surface rounded-xl border border-gray-100">
            <div className="text-center mb-4">
              <div className="text-4xl font-display font-bold text-brand-pink">{analysis.fleschReadingEase}</div>
              <div className="text-sm text-text-muted">{copy.fleschScore}</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-xl font-display font-semibold text-brand-cyan">{localizedBand.label}</div>
              <div className="text-sm text-text-muted mt-1">{localizedBand.description}</div>
              <div className="text-xs text-text-muted mt-2">{copy.gradeRange}: {localizedBand.gradeRange}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-surface rounded-lg"><div className="text-xl font-display font-semibold">{analysis.fleschKincaidGrade}</div><div className="text-xs text-text-muted mt-1 uppercase">{copy.gradeLevel}</div></div>
            <div className="text-center p-3 bg-surface rounded-lg"><div className="text-lg font-display font-medium">{analysis.avgWordsPerSentence}</div><div className="text-xs text-text-muted mt-1 uppercase">{copy.avgWordsPerSentence}</div></div>
            <div className="text-center p-3 bg-surface rounded-lg"><div className="text-lg font-display font-medium">{analysis.avgSyllablesPerWord}</div><div className="text-xs text-text-muted mt-1 uppercase">{copy.avgSyllablesPerWord}</div></div>
          </div>
        </div>
      )}
    </div>
  );
}
