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
    <div className="w-full">
      <div className="flex flex-wrap gap-2 mb-4 p-4 bg-gray-50 border-b border-gray-100 rounded-t-xl">
        <button onClick={handlePaste} className="px-4 py-2 bg-brand-cyan text-white rounded-lg font-medium">Paste</button>
        <button onClick={handleClear} className="px-4 py-2 bg-brand-pink text-white rounded-lg font-medium">Clear</button>
        <button onClick={handleCopy} className="px-4 py-2 bg-brand-orange text-white rounded-lg font-medium">Copy</button>
        <button onClick={handleSampleText} className="px-4 py-2 bg-gray-200 text-text-primary rounded-lg font-medium">Sample Text</button>
      </div>
      <div className="flex flex-wrap gap-2 mb-4 p-4 bg-gray-50">
        <button onClick={() => convert(s => s.toLowerCase())} className="px-4 py-2 bg-gray-200 rounded-lg font-medium hover:bg-gray-300">lowercase</button>
        <button onClick={() => convert(s => s.toUpperCase())} className="px-4 py-2 bg-gray-200 rounded-lg font-medium hover:bg-gray-300">UPPERCASE</button>
        <button onClick={() => convert(toTitleCase)} className="px-4 py-2 bg-gray-200 rounded-lg font-medium hover:bg-gray-300">Title Case</button>
        <button onClick={() => convert(toSentenceCase)} className="px-4 py-2 bg-gray-200 rounded-lg font-medium hover:bg-gray-300">Sentence case</button>
        <button onClick={() => convert(s => s.split('').map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join(''))} className="px-4 py-2 bg-gray-200 rounded-lg font-medium hover:bg-gray-300">tOGGLE cASE</button>
      </div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste or type your text, then click a conversion button..." className="w-full h-64 md:h-80 p-4 border border-gray-200 rounded-b-xl resize-none focus:border-brand-pink" />
      <div className="mt-6 p-4 bg-gray-50 rounded-xl"><p className="text-sm text-text-muted">Text length: {text.length} characters, {text.split(/\s+/).filter(w => w).length} words</p></div>
    </div>
  );
}
