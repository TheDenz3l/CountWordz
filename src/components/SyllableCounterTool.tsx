'use client';
import { useState } from 'react';
import { countSyllables, getSyllableDistribution, SYLLABLE_DISCLAIMER } from '../lib/syllable';

export default function SyllableCounterTool() {
  const [text, setText] = useState('');
  const { total, average } = countSyllables(text);
  const dist = getSyllableDistribution(text);

  const handlePaste = async () => setText(await navigator.clipboard.readText().catch(() => ''));
  const handleClear = () => setText('');
  const handleCopy = async () => { if (text) await navigator.clipboard.writeText(text).catch(() => {}); };
  const handleSampleText = () => setText("The quick brown fox jumps over the lazy dog. Beautiful mountains provide wonderful hiking opportunities.");

  return (
    <div class="w-full">
      <div class="flex flex-wrap gap-2 mb-4 p-4 bg-gray-50 border-b border-gray-100 rounded-t-xl">
        <button onClick={handlePaste} class="px-4 py-2 bg-brand-cyan text-white rounded-lg font-medium">Paste</button>
        <button onClick={handleClear} class="px-4 py-2 bg-brand-pink text-white rounded-lg font-medium">Clear</button>
        <button onClick={handleCopy} class="px-4 py-2 bg-brand-orange text-white rounded-lg font-medium">Copy</button>
        <button onClick={handleSampleText} class="px-4 py-2 bg-gray-200 text-text-primary rounded-lg font-medium">Sample Text</button>
      </div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste or type your text..." class="w-full h-64 md:h-80 p-4 border border-gray-200 rounded-b-xl resize-none focus:border-brand-pink" />
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 p-4 bg-gray-50 rounded-xl">
        <div class="text-center p-3 bg-surface rounded-lg"><div class="text-2xl md:text-3xl font-display font-bold text-brand-pink">{total}</div><div class="text-xs text-text-muted mt-1 uppercase">Total Syllables</div></div>
        <div class="text-center p-3 bg-surface rounded-lg"><div class="text-xl font-display font-semibold text-brand-cyan">{average}</div><div class="text-xs text-text-muted mt-1 uppercase">Avg per word</div></div>
        <div class="text-center p-3 bg-surface rounded-lg"><div class="text-lg font-display font-medium">{dist.oneSyllable}</div><div class="text-xs text-text-muted mt-1 uppercase">1 syllable</div></div>
        <div class="text-center p-3 bg-surface rounded-lg"><div class="text-lg font-display font-medium">{dist.twoSyllables}</div><div class="text-xs text-text-muted mt-1 uppercase">2 syllables</div></div>
      </div>
      <p class="mt-4 text-xs text-text-muted italic">{SYLLABLE_DISCLAIMER}</p>
    </div>
  );
}
