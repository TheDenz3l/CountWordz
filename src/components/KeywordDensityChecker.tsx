'use client';

import { useState, useMemo } from 'react';
import { LightbulbIcon } from '@phosphor-icons/react';
import { extractWordTokens } from '../lib/text-utils';
import { getToolTranslation, resolveLocale } from '../lib/tool-i18n';

interface WordDensity {
  word: string;
  count: number;
  density: number;
}

interface PhraseDensity {
  phrase: string;
  count: number;
  density: number;
}

interface Props {
  locale?: string;
}

export default function KeywordDensityChecker({ locale = 'en' }: Props) {
  const resolvedLocale = resolveLocale(locale);
  const common = getToolTranslation(resolvedLocale, 'common');
  const copy = getToolTranslation(resolvedLocale, 'keywordDensity');
  const [text, setText] = useState('');

  const analysis = useMemo(() => {
    if (!text.trim()) {
      return {
        totalWords: 0,
        uniqueWords: 0,
        wordDensity: [] as WordDensity[],
        twoWordPhrases: [] as PhraseDensity[],
        threeWordPhrases: [] as PhraseDensity[],
        overusedWords: [] as WordDensity[],
      };
    }

    const words = extractWordTokens(text)
      .map(word => word.toLocaleLowerCase(resolvedLocale))
      .filter(word => word.length > 2);

    const totalWords = words.length;
    const wordFreq = new Map<string, number>();

    words.forEach(word => wordFreq.set(word, (wordFreq.get(word) || 0) + 1));

    const wordDensity: WordDensity[] = Array.from(wordFreq.entries())
      .map(([word, count]) => ({ word, count, density: totalWords > 0 ? (count / totalWords) * 100 : 0 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    const overusedWords = wordDensity.filter(w => w.density > 2);

    const twoWordFreq = new Map<string, number>();
    for (let i = 0; i < words.length - 1; i++) {
      const phrase = `${words[i]} ${words[i + 1]}`;
      twoWordFreq.set(phrase, (twoWordFreq.get(phrase) || 0) + 1);
    }

    const twoWordPhrases: PhraseDensity[] = Array.from(twoWordFreq.entries())
      .map(([phrase, count]) => ({ phrase, count, density: totalWords > 1 ? (count / (totalWords - 1)) * 100 : 0 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    const threeWordFreq = new Map<string, number>();
    for (let i = 0; i < words.length - 2; i++) {
      const phrase = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
      threeWordFreq.set(phrase, (threeWordFreq.get(phrase) || 0) + 1);
    }

    const threeWordPhrases: PhraseDensity[] = Array.from(threeWordFreq.entries())
      .map(([phrase, count]) => ({ phrase, count, density: totalWords > 2 ? (count / (totalWords - 2)) * 100 : 0 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    return {
      totalWords,
      uniqueWords: wordFreq.size,
      wordDensity,
      twoWordPhrases,
      threeWordPhrases,
      overusedWords,
    };
  }, [text, resolvedLocale]);

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      setText(clipboardText);
    } catch (err) {
      console.error('Failed to paste:', err);
    }
  };

  const handleClear = () => setText('');
  const handleCopy = async () => {
    if (text) {
      try {
        await navigator.clipboard.writeText(text);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const handleSampleText = () => setText(copy.sampleText);

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2 mb-4 p-4 bg-gray-50 border-b border-gray-100 rounded-t-xl">
        <button onClick={handlePaste} className="px-4 py-2 bg-brand-cyan text-white rounded-lg font-medium hover:bg-opacity-90 transition-all">{common.paste}</button>
        <button onClick={handleClear} className="px-4 py-2 bg-brand-pink text-white rounded-lg font-medium hover:bg-opacity-90 transition-all">{common.clear}</button>
        <button onClick={handleCopy} className="px-4 py-2 bg-brand-orange text-white rounded-lg font-medium hover:bg-opacity-90 transition-all">{common.copy}</button>
        <button onClick={handleSampleText} className="px-4 py-2 bg-gray-200 text-text-primary rounded-lg font-medium hover:bg-gray-300 transition-all">{common.sampleText}</button>
      </div>

      <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder={copy.placeholder} className="w-full h-64 md:h-80 p-4 border border-gray-200 rounded-b-xl resize-none focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/10 transition-all text-text-primary placeholder:text-text-muted/50" />

      {text.trim().length > 0 && (
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="text-center p-3 bg-surface rounded-lg"><div className="text-2xl font-display font-bold text-brand-pink">{analysis.totalWords}</div><div className="text-xs text-text-muted mt-1 uppercase">{copy.totalWords}</div></div>
            <div className="text-center p-3 bg-surface rounded-lg"><div className="text-xl font-display font-semibold text-brand-cyan">{analysis.uniqueWords}</div><div className="text-xs text-text-muted mt-1 uppercase">{copy.uniqueWords}</div></div>
            <div className="text-center p-3 bg-surface rounded-lg"><div className="text-lg font-display font-medium text-brand-orange">{analysis.overusedWords.length}</div><div className="text-xs text-text-muted mt-1 uppercase">{copy.overusedWords}</div></div>
            <div className="text-center p-3 bg-surface rounded-lg"><div className="text-lg font-display font-medium text-text-primary">{((analysis.totalWords / 5) || 0).toFixed(0)} {common.min}</div><div className="text-xs text-text-muted mt-1 uppercase">{copy.readTime}</div></div>
          </div>

          {analysis.overusedWords.length > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <h3 className="text-lg font-display font-semibold text-red-800 mb-2">{copy.warningTitle}</h3>
              <p className="text-sm text-red-700 mb-3">{copy.warningBody}</p>
              <div className="flex flex-wrap gap-2">
                {analysis.overusedWords.map((w) => (
                  <span key={w.word} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">{w.word} ({w.density.toFixed(1)}%)</span>
                ))}
              </div>
            </div>
          )}

          <div className="p-4 bg-surface rounded-xl border border-gray-100">
            <h3 className="text-xl font-display font-bold mb-4">{copy.topWords}</h3>
            <div className="space-y-2">
              {analysis.wordDensity.slice(0, 10).map((item, index) => (
                <div key={item.word} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-text-muted w-6">{index + 1}.</span>
                    <span className="font-semibold text-text-primary">{item.word}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-text-muted">{item.count}x</span>
                    <div className="w-32 bg-gray-100 rounded-full h-2"><div className={`h-2 rounded-full ${item.density > 2 ? 'bg-red-500' : 'bg-brand-cyan'}`} style={{ width: `${Math.min(item.density * 20, 100)}%` }} /></div>
                    <span className="text-sm font-semibold text-brand-cyan w-12 text-right">{item.density.toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-surface rounded-xl border border-gray-100">
            <h3 className="text-xl font-display font-bold mb-4">{copy.topTwoWordPhrases}</h3>
            <div className="space-y-2">
              {analysis.twoWordPhrases.slice(0, 8).map((item, index) => (
                <div key={item.phrase} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-text-muted w-6">{index + 1}.</span>
                    <span className="font-semibold text-text-primary">{item.phrase}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-text-muted">{item.count}x</span>
                    <span className="text-sm font-semibold text-brand-orange w-12 text-right">{item.density.toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-surface rounded-xl border border-gray-100">
            <h3 className="text-xl font-display font-bold mb-4">{copy.topThreeWordPhrases}</h3>
            <div className="space-y-2">
              {analysis.threeWordPhrases.slice(0, 8).map((item, index) => (
                <div key={item.phrase} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-text-muted w-6">{index + 1}.</span>
                    <span className="font-semibold text-text-primary">{item.phrase}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-text-muted">{item.count}x</span>
                    <span className="text-sm font-semibold text-brand-pink w-12 text-right">{item.density.toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-brand-cream rounded-xl border border-brand-cyan/20">
            <h3 className="text-xl font-display font-bold mb-3 flex items-center gap-2">
              <LightbulbIcon size={22} className="text-brand-orange" aria-hidden="true" />
              <span>{copy.seoRecommendations}</span>
            </h3>
            <ul className="space-y-2 text-text-primary">
              {analysis.overusedWords.length > 0 && (
                <li className="flex items-start gap-2"><span className="text-red-500 mt-1" aria-hidden="true">&bull;</span><span>{copy.reduceRepetitionOf}: <strong>{analysis.overusedWords.slice(0, 3).map(w => w.word).join(', ')}</strong></span></li>
              )}
              {analysis.totalWords > 0 && analysis.uniqueWords / analysis.totalWords < 0.5 && (
                <li className="flex items-start gap-2"><span className="text-brand-orange mt-1" aria-hidden="true">&bull;</span><span>{copy.addMoreVariedVocabulary} ({((analysis.uniqueWords / analysis.totalWords) * 100).toFixed(0)}%)</span></li>
              )}
              <li className="flex items-start gap-2"><span className="text-brand-cyan mt-1" aria-hidden="true">&bull;</span><span>{copy.idealKeywordDensity}</span></li>
              <li className="flex items-start gap-2"><span className="text-brand-cyan mt-1" aria-hidden="true">&bull;</span><span>{copy.useSynonyms}</span></li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
