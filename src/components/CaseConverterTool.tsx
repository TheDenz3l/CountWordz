'use client';
import { useState } from 'react';

function toTitleCase(str: string): string {
  const smallWords = /^(a|an|and|as|at|but|by|en|for|if|in|nor|of|on|or|per|the|to|v.?|vs.?|via)$/i;
  return str.replace(/[A-Za-z0-9\u00C0-\u00FF]+[^\s-]*/g, (match, index, title) => {
    if (index > 0 && index + match.length !== title.length && match.search(smallWords) > -1 && title.charAt(index - 2) !== ':' && (title.charAt(index + match.length) !== ':' || title.charAt(index + match.length + 1) !== ')')) return match.toLowerCase();
    if (match.substr(1).search(/[A-Z]|\../) > -1) return match;
    return match.charAt(0).toUpperCase() + match.substr(1).toLowerCase();
  });
}

function toSentenceCase(str: string): string {
  return str.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase());
}

export default function CaseConverterTool() {
  const [text, setText] = useState('');

  const convert = (fn: (s: string) => string) => setText(fn(text));
  const handlePaste = async () => setText(await navigator.clipboard.readText().catch(() => ''));
  const handleClear = () => setText('');
  const handleCopy = async () => { if (text) await navigator.clipboard.writeText(text).catch(() => {}); };
  const handleSampleText = () => setText("this is sample text in lowercase. the quick brown fox jumps over the lazy dog!");

  return (
    <div class="w-full">
      <div class="flex flex-wrap gap-2 mb-4 p-4 bg-gray-50 border-b border-gray-100 rounded-t-xl">
        <button onClick={handlePaste} class="px-4 py-2 bg-brand-cyan text-white rounded-lg font-medium">Paste</button>
        <button onClick={handleClear} class="px-4 py-2 bg-brand-pink text-white rounded-lg font-medium">Clear</button>
        <button onClick={handleCopy} class="px-4 py-2 bg-brand-orange text-white rounded-lg font-medium">Copy</button>
        <button onClick={handleSampleText} class="px-4 py-2 bg-gray-200 text-text-primary rounded-lg font-medium">Sample Text</button>
      </div>
      <div class="flex flex-wrap gap-2 mb-4 p-4 bg-gray-50">
        <button onClick={() => convert(s => s.toLowerCase())} class="px-4 py-2 bg-gray-200 rounded-lg font-medium hover:bg-gray-300">lowercase</button>
        <button onClick={() => convert(s => s.toUpperCase())} class="px-4 py-2 bg-gray-200 rounded-lg font-medium hover:bg-gray-300">UPPERCASE</button>
        <button onClick={() => convert(toTitleCase)} class="px-4 py-2 bg-gray-200 rounded-lg font-medium hover:bg-gray-300">Title Case</button>
        <button onClick={() => convert(toSentenceCase)} class="px-4 py-2 bg-gray-200 rounded-lg font-medium hover:bg-gray-300">Sentence case</button>
        <button onClick={() => convert(s => s.split('').map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join(''))} class="px-4 py-2 bg-gray-200 rounded-lg font-medium hover:bg-gray-300">tOGGLE cASE</button>
      </div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste or type your text, then click a conversion button..." class="w-full h-64 md:h-80 p-4 border border-gray-200 rounded-b-xl resize-none focus:border-brand-pink" />
      <div class="mt-6 p-4 bg-gray-50 rounded-xl"><p class="text-sm text-text-muted">Text length: {text.length} characters, {text.split(/\s+/).filter(w => w).length} words</p></div>
    </div>
  );
}
