'use client';
import { useState } from 'react';
import { getReadabilityAnalysis } from '../lib/readability';

export default function ReadabilityCheckerTool() {
  const [text, setText] = useState('');
  const analysis = getReadabilityAnalysis(text);

  const handlePaste = async () => setText(await navigator.clipboard.readText().catch(() => ''));
  const handleClear = () => setText('');
  const handleCopy = async () => { if (text) await navigator.clipboard.writeText(text).catch(() => {}); };
  const handleSampleText = () => setText("The quick brown fox jumps over the lazy dog. This sentence is short and simple. Reading ease scores help measure text complexity.");

  return (
    <div class="w-full">
      <div class="flex flex-wrap gap-2 mb-4 p-4 bg-gray-50 border-b border-gray-100 rounded-t-xl">
        <button onClick={handlePaste} class="px-4 py-2 bg-brand-cyan text-white rounded-lg font-medium">Paste</button>
        <button onClick={handleClear} class="px-4 py-2 bg-brand-pink text-white rounded-lg font-medium">Clear</button>
        <button onClick={handleCopy} class="px-4 py-2 bg-brand-orange text-white rounded-lg font-medium">Copy</button>
        <button onClick={handleSampleText} class="px-4 py-2 bg-gray-200 text-text-primary rounded-lg font-medium">Sample Text</button>
      </div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste or type your text..." class="w-full h-64 md:h-80 p-4 border border-gray-200 rounded-b-xl resize-none focus:border-brand-pink" />
      
      {text.trim().length > 0 && (
        <div class="mt-6 space-y-4">
          <div class="p-6 bg-surface rounded-xl border border-gray-100">
            <div class="text-center mb-4">
              <div class="text-4xl font-display font-bold text-brand-pink">{analysis.fleschReadingEase}</div>
              <div class="text-sm text-text-muted">Flesch Reading Ease Score</div>
            </div>
            <div class="text-center p-4 bg-gray-50 rounded-lg">
              <div class="text-xl font-display font-semibold text-brand-cyan">{analysis.label.label}</div>
              <div class="text-sm text-text-muted mt-1">{analysis.label.description}</div>
              <div class="text-xs text-text-muted mt-2">Grade range: {analysis.label.gradeRange}</div>
            </div>
          </div>
          
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div class="text-center p-3 bg-surface rounded-lg"><div class="text-xl font-display font-semibold">{analysis.fleschKincaidGrade}</div><div class="text-xs text-text-muted mt-1 uppercase">Grade Level</div></div>
            <div class="text-center p-3 bg-surface rounded-lg"><div class="text-lg font-display font-medium">{analysis.avgWordsPerSentence}</div><div class="text-xs text-text-muted mt-1 uppercase">Avg words/sentence</div></div>
            <div class="text-center p-3 bg-surface rounded-lg"><div class="text-lg font-display font-medium">{analysis.avgSyllablesPerWord}</div><div class="text-xs text-text-muted mt-1 uppercase">Avg syllables/word</div></div>
          </div>
        </div>
      )}
    </div>
  );
}
