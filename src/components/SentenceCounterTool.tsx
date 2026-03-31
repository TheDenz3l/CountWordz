'use client';
import { useState, useEffect } from 'react';
import { countSentences, countWords, countParagraphs } from '../lib/text-utils';

export default function SentenceCounterTool() {
  const [text, setText] = useState('');
  const sentences = countSentences(text);
  const words = countWords(text);
  const paragraphs = countParagraphs(text);
  const avgWordsPerSentence = sentences > 0 ? Math.round((words / sentences) * 10) / 10 : 0;

  const handlePaste = async () => setText(await navigator.clipboard.readText().catch(() => ''));
  const handleClear = () => setText('');
  const handleCopy = async () => { if (text) await navigator.clipboard.writeText(text).catch(() => {}); };
  const handleSampleText = () => setText("This is the first sentence. Here is the second one! And this is the third? Each sentence ends with proper punctuation.");

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
        <div class="text-center p-3 bg-surface rounded-lg"><div class="text-2xl md:text-3xl font-display font-bold text-brand-pink">{sentences}</div><div class="text-xs text-text-muted mt-1 uppercase">Sentences</div></div>
        <div class="text-center p-3 bg-surface rounded-lg"><div class="text-xl font-display font-semibold text-brand-cyan">{avgWordsPerSentence}</div><div class="text-xs text-text-muted mt-1 uppercase">Avg words/sentence</div></div>
        <div class="text-center p-3 bg-surface rounded-lg"><div class="text-lg font-display font-medium">{words}</div><div class="text-xs text-text-muted mt-1 uppercase">Words</div></div>
        <div class="text-center p-3 bg-surface rounded-lg"><div class="text-lg font-display font-medium">{paragraphs}</div><div class="text-xs text-text-muted mt-1 uppercase">Paragraphs</div></div>
      </div>
    </div>
  );
}
