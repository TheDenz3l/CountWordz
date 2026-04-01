'use client';

import { useState, useMemo } from 'react';
import { calculateFleschReadingEase, calculateFleschKincaidGrade } from '../lib/readability';
import { extractWordTokens } from '../lib/text-utils';
import { getToolTranslation, resolveLocale } from '../lib/tool-i18n';

interface Suggestion {
  type: 'passive' | 'long-sentence' | 'complex-word' | 'repetition' | 'clarity';
  original: string;
  suggestion: string;
  explanation: string;
}

interface RewriteAnalysis {
  sentences: string[];
  suggestions: Suggestion[];
  originalReadability: number;
  improvedReadability: number;
  originalGrade: number;
  improvedGrade: number;
}

const passivePatternsByLocale: Record<string, RegExp[]> = {
  en: [
    /\b(was|were|is|are|been|being|be)\s+\w+ed\b/gi,
    /\b(was|were|is|are|been|being|be)\s+\w+en\b/gi,
    /\b(has|have|had)\s+been\s+\w+ed\b/gi,
  ],
  es: [
    /\b(fue|fueron|es|son|era|eran|ha sido|han sido)\s+\p{L}+(ado|ada|idos|idas)\b/giu,
  ],
  fr: [
    /\b(est|sont|était|étaient|a été|ont été)\s+\p{L}+(é|ée|és|ées)\b/giu,
  ],
  de: [
    /\b(wird|werden|wurde|wurden|ist|sind)\s+\p{L}+(t|en)\b/giu,
  ],
  pt: [
    /\b(foi|foram|é|são|era|eram|tem sido|têm sido)\s+\p{L}+(ado|ada|ados|adas|ido|ida|idos|idas)\b/giu,
  ],
};

const complexWordsByLocale: Record<string, Record<string, string>> = {
  en: {
    utilize: 'use',
    implement: 'do',
    facilitate: 'help',
    commence: 'start',
    terminate: 'end',
    subsequently: 'then',
    nevertheless: 'but',
    furthermore: 'also',
    consequently: 'so',
    approximately: 'about',
    demonstrate: 'show',
    investigate: 'check',
    purchase: 'buy',
    reside: 'live',
    possess: 'have',
  },
  es: {
    utilizar: 'usar',
    implementar: 'hacer',
    facilitar: 'ayudar',
    comenzar: 'empezar',
    terminar: 'acabar',
    posteriormente: 'después',
    además: 'también',
    aproximadamente: 'casi',
    demostrar: 'mostrar',
  },
  fr: {
    utiliser: 'employer',
    implémenter: 'faire',
    faciliter: 'aider',
    commencer: 'débuter',
    terminer: 'finir',
    ultérieurement: 'ensuite',
    néanmoins: 'mais',
    démontrer: 'montrer',
  },
  de: {
    nutzen: 'verwenden',
    implementieren: 'machen',
    erleichtern: 'helfen',
    beginnen: 'starten',
    beenden: 'enden',
    anschließend: 'danach',
    außerdem: 'auch',
    ungefähr: 'rund',
    demonstrieren: 'zeigen',
  },
  pt: {
    utilizar: 'usar',
    implementar: 'fazer',
    facilitar: 'ajudar',
    iniciar: 'começar',
    terminar: 'encerrar',
    posteriormente: 'depois',
    além_disso: 'também',
    consequentemente: 'assim',
    aproximadamente: 'cerca de',
    demonstrar: 'mostrar',
  },
};

interface Props {
  locale?: string;
}

export default function ParagraphRewriter({ locale = 'en' }: Props) {
  const resolvedLocale = resolveLocale(locale);
  const common = getToolTranslation(resolvedLocale, 'common');
  const copy = getToolTranslation(resolvedLocale, 'paragraphRewriter');
  const [text, setText] = useState('');

  const analysis = useMemo((): RewriteAnalysis | null => {
    if (!text.trim()) return null;

    const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];
    const suggestions: Suggestion[] = [];
    const passivePatterns = passivePatternsByLocale[resolvedLocale] ?? passivePatternsByLocale.en;

    sentences.forEach((sentence) => {
      passivePatterns.forEach(pattern => {
        const match = sentence.match(pattern);
        if (match) {
          suggestions.push({
            type: 'passive',
            original: sentence.trim(),
            suggestion: copy.considerActiveVoice,
            explanation: copy.passiveExplanation,
          });
        }
      });
    });

    sentences.forEach(sentence => {
      const wordCount = extractWordTokens(sentence).length;
      if (wordCount > 25) {
        suggestions.push({
          type: 'long-sentence',
          original: sentence.trim(),
          suggestion: `${copy.longSentencePrefix} ${wordCount} ${copy.longSentenceSuffix}`,
          explanation: copy.longSentenceExplanation,
        });
      }
    });

    const complexWords = complexWordsByLocale[resolvedLocale] ?? complexWordsByLocale.en;
    const loweredText = text.toLocaleLowerCase(resolvedLocale);
    Object.entries(complexWords).forEach(([complex, simple]) => {
      if (loweredText.includes(complex.replace('_', ' '))) {
        suggestions.push({
          type: 'complex-word',
          original: complex.replace('_', ' '),
          suggestion: simple,
          explanation: copy.simplerWordsHelp,
        });
      }
    });

    const words = extractWordTokens(text)
      .map(word => word.toLocaleLowerCase(resolvedLocale))
      .filter(word => word.length > 3);
    const wordFreq = new Map<string, number>();
    words.forEach(w => wordFreq.set(w, (wordFreq.get(w) || 0) + 1));
    wordFreq.forEach((count, word) => {
      if (count > 3) {
        suggestions.push({
          type: 'repetition',
          original: word,
          suggestion: `${copy.useSynonymsInstead} "${word}" ${count} ${copy.times}`,
          explanation: copy.repetitionExplanation,
        });
      }
    });

    const originalReadability = calculateFleschReadingEase(text, resolvedLocale);
    const originalGrade = calculateFleschKincaidGrade(text, resolvedLocale);
    const improvedReadability = Math.min(100, originalReadability + suggestions.length * 2);
    const improvedGrade = Math.max(0, originalGrade - suggestions.length * 0.5);

    return {
      sentences,
      suggestions,
      originalReadability: Math.round(originalReadability * 10) / 10,
      improvedReadability: Math.round(improvedReadability * 10) / 10,
      originalGrade: Math.round(originalGrade * 10) / 10,
      improvedGrade: Math.round(improvedGrade * 10) / 10,
    };
  }, [text, copy, resolvedLocale]);

  const handleClear = () => setText('');
  const handleSampleText = () => setText(copy.sampleText);

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2 mb-4 p-4 bg-gray-50 border-b border-gray-100 rounded-t-xl">
        <button onClick={handleSampleText} className="px-4 py-2 bg-gray-200 text-text-primary rounded-lg font-medium hover:bg-gray-300 transition-all">{common.sampleText}</button>
        <button onClick={handleClear} className="px-4 py-2 bg-brand-pink text-white rounded-lg font-medium hover:bg-opacity-90 transition-all">{common.clear}</button>
      </div>

      <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder={copy.placeholder} className="w-full h-48 p-4 border border-gray-200 rounded-xl resize-none focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/10 transition-all text-text-primary placeholder:text-text-muted/50" />

      {analysis && (
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="text-center p-3 bg-surface rounded-lg"><div className="text-sm text-text-muted mb-1">{copy.originalReadability}</div><div className="text-2xl font-display font-bold text-brand-cyan">{analysis.originalReadability}</div></div>
            <div className="text-center p-3 bg-surface rounded-lg"><div className="text-sm text-text-muted mb-1">{copy.improvedReadability}</div><div className="text-2xl font-display font-bold text-green-600">{analysis.improvedReadability}</div></div>
            <div className="text-center p-3 bg-surface rounded-lg"><div className="text-sm text-text-muted mb-1">{copy.originalGrade}</div><div className="text-xl font-display font-semibold text-brand-orange">{analysis.originalGrade}</div></div>
            <div className="text-center p-3 bg-surface rounded-lg"><div className="text-sm text-text-muted mb-1">{copy.improvedGrade}</div><div className="text-xl font-display font-semibold text-green-600">{analysis.improvedGrade}</div></div>
          </div>

          {analysis.suggestions.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-xl font-display font-bold">{copy.rewriteSuggestions} ({analysis.suggestions.length})</h3>

              {analysis.suggestions.filter(s => s.type === 'passive').map((s, i) => (
                <div key={`passive-${i}`} className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl"><div className="flex items-center gap-2 mb-2"><span className="text-yellow-600 font-bold">{copy.passiveVoice}</span></div><p className="text-text-primary mb-2 italic">"{s.original}"</p><p className="text-sm text-text-muted mb-2">{s.explanation}</p><p className="text-sm font-semibold text-brand-cyan">{s.suggestion}</p></div>
              ))}

              {analysis.suggestions.filter(s => s.type === 'long-sentence').map((s, i) => (
                <div key={`long-${i}`} className="p-4 bg-orange-50 border border-orange-200 rounded-xl"><div className="flex items-center gap-2 mb-2"><span className="text-orange-600 font-bold">{copy.longSentence}</span></div><p className="text-text-primary mb-2 italic">"{s.original.substring(0, 100)}..."</p><p className="text-sm text-text-muted mb-2">{s.explanation}</p><p className="text-sm font-semibold text-brand-cyan">{s.suggestion}</p></div>
              ))}

              {analysis.suggestions.filter(s => s.type === 'complex-word').map((s, i) => (
                <div key={`complex-${i}`} className="p-4 bg-blue-50 border border-blue-200 rounded-xl"><div className="flex items-center gap-2 mb-2"><span className="text-blue-600 font-bold">{copy.complexWord}</span></div><p className="text-text-primary mb-2">{copy.insteadOf} <strong className="text-red-600">"{s.original}"</strong></p><p className="text-sm font-semibold text-green-600">{copy.use} "{s.suggestion}"</p><p className="text-xs text-text-muted mt-2">{s.explanation}</p></div>
              ))}

              {analysis.suggestions.filter(s => s.type === 'repetition').map((s, i) => (
                <div key={`repeat-${i}`} className="p-4 bg-purple-50 border border-purple-200 rounded-xl"><div className="flex items-center gap-2 mb-2"><span className="text-purple-600 font-bold">{copy.repetition}</span></div><p className="text-text-primary mb-2">{s.suggestion}</p><p className="text-xs text-text-muted">{s.explanation}</p></div>
              ))}
            </div>
          ) : (
            <div className="p-6 bg-green-50 border border-green-200 rounded-xl text-center"><p className="text-green-800 font-semibold text-lg">{copy.greatWriting}</p><p className="text-green-700 mt-2">{copy.noMajorIssues}</p></div>
          )}

          <div className="p-4 bg-brand-cream rounded-xl border border-brand-cyan/20">
            <h3 className="text-xl font-display font-bold mb-3">{copy.writingTips}</h3>
            <ul className="space-y-2 text-text-primary text-sm">
              <li className="flex items-start gap-2"><span className="text-brand-cyan mt-1">•</span><span>{copy.activeVoiceTip}</span></li>
              <li className="flex items-start gap-2"><span className="text-brand-cyan mt-1">•</span><span>{copy.keepSentencesTip}</span></li>
              <li className="flex items-start gap-2"><span className="text-brand-cyan mt-1">•</span><span>{copy.simpleWordsTip}</span></li>
              <li className="flex items-start gap-2"><span className="text-brand-cyan mt-1">•</span><span>{copy.varyVocabularyTip}</span></li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
