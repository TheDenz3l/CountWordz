'use client';

import { useState } from 'react';

interface DiffStats {
  wordsAdded: number;
  wordsRemoved: number;
  wordsChanged: number;
  similarity: number;
}

interface DiffResult {
  type: 'same' | 'added' | 'removed';
  value: string;
}

export default function TextDiffTool() {
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const [diffResult, setDiffResult] = useState<{
    diff1: DiffResult[];
    diff2: DiffResult[];
    stats: DiffStats;
  } | null>(null);

  // Simple word-level diff algorithm
  const computeDiff = () => {
    const words1 = text1.split(/\s+/).filter(w => w.length > 0);
    const words2 = text2.split(/\s+/).filter(w => w.length > 0);

    const diff1: DiffResult[] = [];
    const diff2: DiffResult[] = [];
    
    const maxLength = Math.max(words1.length, words2.length);
    let added = 0;
    let removed = 0;
    let changed = 0;
    let same = 0;

    for (let i = 0; i < maxLength; i++) {
      const word1 = words1[i];
      const word2 = words2[i];

      if (word1 === undefined) {
        // Word added in text2
        diff2.push({ type: 'added', value: word2 });
        diff1.push({ type: 'same', value: '' });
        added++;
      } else if (word2 === undefined) {
        // Word removed from text1
        diff1.push({ type: 'removed', value: word1 });
        diff2.push({ type: 'same', value: '' });
        removed++;
      } else if (word1 === word2) {
        // Same word
        diff1.push({ type: 'same', value: word1 });
        diff2.push({ type: 'same', value: word2 });
        same++;
      } else {
        // Different word
        diff1.push({ type: 'removed', value: word1 });
        diff2.push({ type: 'added', value: word2 });
        changed++;
      }
    }

    const total = words1.length + words2.length;
    const similarity = total > 0 ? ((same * 2) / total) * 100 : 0;

    setDiffResult({
      diff1,
      diff2,
      stats: {
        wordsAdded: added,
        wordsRemoved: removed,
        wordsChanged: changed,
        similarity: Math.round(similarity)
      }
    });
  };

  const handleClear = () => {
    setText1('');
    setText2('');
    setDiffResult(null);
  };

  const handleSampleText = () => {
    setText1("The quick brown fox jumps over the lazy dog. This is a sample text for comparison.");
    setText2("The quick brown cat jumps over the lazy dog. This is sample text for testing comparison.");
  };

  return (
    <div class="w-full">
      {/* Toolbar */}
      <div class="flex flex-wrap gap-2 mb-4 p-4 bg-gray-50 border-b border-gray-100 rounded-t-xl">
        <button onClick={handleSampleText} class="px-4 py-2 bg-gray-200 text-text-primary rounded-lg font-medium hover:bg-gray-300 transition-all">Sample Text</button>
        <button onClick={handleClear} class="px-4 py-2 bg-brand-pink text-white rounded-lg font-medium hover:bg-opacity-90 transition-all">Clear</button>
        <button onClick={computeDiff} class="px-6 py-2 bg-brand-cyan text-white rounded-lg font-medium hover:bg-opacity-90 transition-all font-semibold">Compare Texts</button>
      </div>

      {/* Text Inputs */}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-semibold text-text-primary mb-2">Original Text</label>
          <textarea
            value={text1}
            onChange={(e) => setText1(e.target.value)}
            placeholder="Paste original text here..."
            class="w-full h-48 p-4 border border-gray-200 rounded-xl resize-none focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/10 transition-all text-text-primary placeholder:text-text-muted/50"
          />
        </div>
        <div>
          <label class="block text-sm font-semibold text-text-primary mb-2">Revised Text</label>
          <textarea
            value={text2}
            onChange={(e) => setText2(e.target.value)}
            placeholder="Paste revised text here..."
            class="w-full h-48 p-4 border border-gray-200 rounded-xl resize-none focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/10 transition-all text-text-primary placeholder:text-text-muted/50"
          />
        </div>
      </div>

      {/* Results */}
      {diffResult && (
        <div class="space-y-6">
          {/* Stats Summary */}
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl">
            <div class="text-center p-3 bg-surface rounded-lg">
              <div class="text-2xl font-display font-bold text-green-600">{diffResult.stats.wordsAdded}</div>
              <div class="text-xs text-text-muted mt-1 uppercase">Words Added</div>
            </div>
            <div class="text-center p-3 bg-surface rounded-lg">
              <div class="text-2xl font-display font-bold text-red-600">{diffResult.stats.wordsRemoved}</div>
              <div class="text-xs text-text-muted mt-1 uppercase">Words Removed</div>
            </div>
            <div class="text-center p-3 bg-surface rounded-lg">
              <div class="text-2xl font-display font-bold text-brand-orange">{diffResult.stats.wordsChanged}</div>
              <div class="text-xs text-text-muted mt-1 uppercase">Words Changed</div>
            </div>
            <div class="text-center p-3 bg-surface rounded-lg">
              <div class="text-2xl font-display font-bold text-brand-cyan">{diffResult.stats.similarity}%</div>
              <div class="text-xs text-text-muted mt-1 uppercase">Similarity</div>
            </div>
          </div>

          {/* Side-by-Side Diff */}
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="p-4 bg-surface rounded-xl border border-gray-100">
              <h3 class="text-lg font-display font-bold mb-3 flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-red-500"></span>
                Original Text
              </h3>
              <div class="text-text-primary leading-relaxed whitespace-pre-wrap font-mono text-sm">
                {diffResult.diff1.map((item, i) => (
                  <span
                    key={i}
                    class={
                      item.type === 'removed'
                        ? 'bg-red-200 text-red-900 px-1 rounded'
                        : item.type === 'same'
                        ? ''
                        : 'opacity-50'
                    }
                  >
                    {item.value && (
                      <>
                        {item.value}
                        {' '}
                      </>
                    )}
                  </span>
                ))}
              </div>
            </div>

            <div class="p-4 bg-surface rounded-xl border border-gray-100">
              <h3 class="text-lg font-display font-bold mb-3 flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-green-500"></span>
                Revised Text
              </h3>
              <div class="text-text-primary leading-relaxed whitespace-pre-wrap font-mono text-sm">
                {diffResult.diff2.map((item, i) => (
                  <span
                    key={i}
                    class={
                      item.type === 'added'
                        ? 'bg-green-200 text-green-900 px-1 rounded'
                        : item.type === 'same'
                        ? ''
                        : 'opacity-50'
                    }
                  >
                    {item.value && (
                      <>
                        {item.value}
                        {' '}
                      </>
                    )}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div class="p-4 bg-brand-cream rounded-xl border border-brand-cyan/20">
            <h3 class="text-lg font-display font-bold mb-2">Legend</h3>
            <div class="flex flex-wrap gap-4 text-sm">
              <div class="flex items-center gap-2">
                <span class="w-4 h-4 bg-green-200 rounded"></span>
                <span class="text-text-primary">Added word</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-4 h-4 bg-red-200 rounded"></span>
                <span class="text-text-primary">Removed word</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-4 h-4 bg-surface border border-gray-200 rounded"></span>
                <span class="text-text-primary">Unchanged word</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
