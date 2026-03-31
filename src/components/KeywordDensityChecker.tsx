'use client';

import { useState, useMemo } from 'react';
import { countWords } from '../lib/text-utils';

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

export default function KeywordDensityChecker() {
  const [text, setText] = useState('');

  const analysis = useMemo(() => {
    if (!text.trim()) {
      return {
        totalWords: 0,
        uniqueWords: 0,
        wordDensity: [] as WordDensity[],
        twoWordPhrases: [] as PhraseDensity[],
        threeWordPhrases: [] as PhraseDensity[],
        overusedWords: [] as WordDensity[]
      };
    }

    // Clean and split text into words
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2); // Filter out very short words

    const totalWords = words.length;
    const wordFreq = new Map<string, number>();
    
    words.forEach(word => {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
    });

    // Calculate word density
    const wordDensity: WordDensity[] = Array.from(wordFreq.entries())
      .map(([word, count]) => ({
        word,
        count,
        density: (count / totalWords) * 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20); // Top 20 words

    // Find overused words (>2% density)
    const overusedWords = wordDensity.filter(w => w.density > 2);

    // Calculate 2-word phrases
    const twoWordFreq = new Map<string, number>();
    for (let i = 0; i < words.length - 1; i++) {
      const phrase = `${words[i]} ${words[i + 1]}`;
      twoWordFreq.set(phrase, (twoWordFreq.get(phrase) || 0) + 1);
    }

    const twoWordPhrases: PhraseDensity[] = Array.from(twoWordFreq.entries())
      .map(([phrase, count]) => ({
        phrase,
        count,
        density: (count / (totalWords - 1)) * 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15); // Top 15 phrases

    // Calculate 3-word phrases
    const threeWordFreq = new Map<string, number>();
    for (let i = 0; i < words.length - 2; i++) {
      const phrase = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
      threeWordFreq.set(phrase, (threeWordFreq.get(phrase) || 0) + 1);
    }

    const threeWordPhrases: PhraseDensity[] = Array.from(threeWordFreq.entries())
      .map(([phrase, count]) => ({
        phrase,
        count,
        density: (count / (totalWords - 2)) * 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15); // Top 15 phrases

    return {
      totalWords,
      uniqueWords: wordFreq.size,
      wordDensity,
      twoWordPhrases,
      threeWordPhrases,
      overusedWords
    };
  }, [text]);

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

  const handleSampleText = () => {
    setText("Keyword density is an important factor in SEO. Keyword density refers to the percentage of times a keyword or phrase appears on a web page compared to the total number of words on the page. In the context of search engine optimization, keyword density can be used to determine whether a web page is relevant to a specified keyword or keyword phrase. However, keyword density should not be the sole focus of your SEO strategy. Quality content and user experience are equally important for search engine rankings.");
  };

  return (
    <div class="w-full">
      {/* Toolbar */}
      <div class="flex flex-wrap gap-2 mb-4 p-4 bg-gray-50 border-b border-gray-100 rounded-t-xl">
        <button onClick={handlePaste} class="px-4 py-2 bg-brand-cyan text-white rounded-lg font-medium hover:bg-opacity-90 transition-all">Paste</button>
        <button onClick={handleClear} class="px-4 py-2 bg-brand-pink text-white rounded-lg font-medium hover:bg-opacity-90 transition-all">Clear</button>
        <button onClick={handleCopy} class="px-4 py-2 bg-brand-orange text-white rounded-lg font-medium hover:bg-opacity-90 transition-all">Copy</button>
        <button onClick={handleSampleText} class="px-4 py-2 bg-gray-200 text-text-primary rounded-lg font-medium hover:bg-gray-300 transition-all">Sample Text</button>
      </div>

      {/* Text Input */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste or type your text to analyze keyword density..."
        class="w-full h-64 md:h-80 p-4 border border-gray-200 rounded-b-xl resize-none focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/10 transition-all text-text-primary placeholder:text-text-muted/50"
      />

      {/* Results */}
      {text.trim().length > 0 && (
        <div class="mt-6 space-y-6">
          {/* Summary Stats */}
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl">
            <div class="text-center p-3 bg-surface rounded-lg">
              <div class="text-2xl font-display font-bold text-brand-pink">{analysis.totalWords}</div>
              <div class="text-xs text-text-muted mt-1 uppercase">Total Words</div>
            </div>
            <div class="text-center p-3 bg-surface rounded-lg">
              <div class="text-xl font-display font-semibold text-brand-cyan">{analysis.uniqueWords}</div>
              <div class="text-xs text-text-muted mt-1 uppercase">Unique Words</div>
            </div>
            <div class="text-center p-3 bg-surface rounded-lg">
              <div class="text-lg font-display font-medium text-brand-orange">{analysis.overusedWords.length}</div>
              <div class="text-xs text-text-muted mt-1 uppercase">Overused Words</div>
            </div>
            <div class="text-center p-3 bg-surface rounded-lg">
              <div class="text-lg font-display font-medium text-text-primary">{((analysis.totalWords / 5) || 0).toFixed(0)} min</div>
              <div class="text-xs text-text-muted mt-1 uppercase">Read Time</div>
            </div>
          </div>

          {/* Overused Words Warning */}
          {analysis.overusedWords.length > 0 && (
            <div class="p-4 bg-red-50 border border-red-200 rounded-xl">
              <h3 class="text-lg font-display font-semibold text-red-800 mb-2">⚠️ Overused Words Detected</h3>
              <p class="text-sm text-red-700 mb-3">These words appear more than 2% of the time. Consider varying your vocabulary:</p>
              <div class="flex flex-wrap gap-2">
                {analysis.overusedWords.map((w) => (
                  <span key={w.word} class="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                    {w.word} ({w.density.toFixed(1)}%)
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Top Words */}
          <div class="p-4 bg-surface rounded-xl border border-gray-100">
            <h3 class="text-xl font-display font-bold mb-4">Top Words by Density</h3>
            <div class="space-y-2">
              {analysis.wordDensity.slice(0, 10).map((item, index) => (
                <div key={item.word} class="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                  <div class="flex items-center gap-3">
                    <span class="text-sm text-text-muted w-6">{index + 1}.</span>
                    <span class="font-semibold text-text-primary">{item.word}</span>
                  </div>
                  <div class="flex items-center gap-4">
                    <span class="text-sm text-text-muted">{item.count}x</span>
                    <div class="w-32 bg-gray-100 rounded-full h-2">
                      <div 
                        class={`h-2 rounded-full ${item.density > 2 ? 'bg-red-500' : 'bg-brand-cyan'}`}
                        style={{ width: `${Math.min(item.density * 20, 100)}%` }}
                      />
                    </div>
                    <span class="text-sm font-semibold text-brand-cyan w-12 text-right">{item.density.toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top 2-Word Phrases */}
          <div class="p-4 bg-surface rounded-xl border border-gray-100">
            <h3 class="text-xl font-display font-bold mb-4">Top 2-Word Phrases</h3>
            <div class="space-y-2">
              {analysis.twoWordPhrases.slice(0, 8).map((item, index) => (
                <div key={item.phrase} class="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                  <div class="flex items-center gap-3">
                    <span class="text-sm text-text-muted w-6">{index + 1}.</span>
                    <span class="font-semibold text-text-primary">{item.phrase}</span>
                  </div>
                  <div class="flex items-center gap-4">
                    <span class="text-sm text-text-muted">{item.count}x</span>
                    <span class="text-sm font-semibold text-brand-orange w-12 text-right">{item.density.toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top 3-Word Phrases */}
          <div class="p-4 bg-surface rounded-xl border border-gray-100">
            <h3 class="text-xl font-display font-bold mb-4">Top 3-Word Phrases</h3>
            <div class="space-y-2">
              {analysis.threeWordPhrases.slice(0, 8).map((item, index) => (
                <div key={item.phrase} class="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                  <div class="flex items-center gap-3">
                    <span class="text-sm text-text-muted w-6">{index + 1}.</span>
                    <span class="font-semibold text-text-primary">{item.phrase}</span>
                  </div>
                  <div class="flex items-center gap-4">
                    <span class="text-sm text-text-muted">{item.count}x</span>
                    <span class="text-sm font-semibold text-brand-pink w-12 text-right">{item.density.toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SEO Recommendations */}
          <div class="p-4 bg-brand-cream rounded-xl border border-brand-cyan/20">
            <h3 class="text-xl font-display font-bold mb-3">💡 SEO Recommendations</h3>
            <ul class="space-y-2 text-text-primary">
              {analysis.overusedWords.length > 0 && (
                <li class="flex items-start gap-2">
                  <span class="text-red-500 mt-1">•</span>
                  <span>Reduce repetition of: <strong>{analysis.overusedWords.slice(0, 3).map(w => w.word).join(', ')}</strong></span>
                </li>
              )}
              {analysis.uniqueWords / analysis.totalWords < 0.5 && (
                <li class="flex items-start gap-2">
                  <span class="text-brand-orange mt-1">•</span>
                  <span>Consider adding more varied vocabulary (current uniqueness: {((analysis.uniqueWords / analysis.totalWords) * 100).toFixed(0)}%)</span>
                </li>
              )}
              <li class="flex items-start gap-2">
                <span class="text-brand-cyan mt-1">•</span>
                <span>Ideal keyword density for SEO is 1-2% for target keywords</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-brand-cyan mt-1">•</span>
                <span>Use synonyms and related terms to avoid keyword stuffing</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
