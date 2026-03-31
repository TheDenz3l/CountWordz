'use client';

import { useState, useEffect } from 'react';
import { countCharsWithSpaces, countCharsWithoutSpaces, countWords } from '../lib/text-utils';

interface PlatformPreset {
  name: string;
  limit: number;
}

const PLATFORM_PRESETS: PlatformPreset[] = [
  { name: 'X (Twitter)', limit: 280 },
  { name: 'Instagram Caption', limit: 2200 },
  { name: 'LinkedIn Post', limit: 3000 },
  { name: 'Meta Description', limit: 160 },
];

export default function CharacterCounterTool() {
  const [text, setText] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<PlatformPreset | null>(null);

  const chars = countCharsWithSpaces(text);
  const charsNoSpaces = countCharsWithoutSpaces(text);
  const words = countWords(text);
  const remaining = selectedPreset ? selectedPreset.limit - chars : null;

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
    setText("This is sample text to demonstrate the character counter. Paste your own text or start typing to see real-time character counts with and without spaces.");
  };

  return (
    <div className="w-full">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-4 p-4 bg-gray-50 border-b border-gray-100 rounded-t-xl">
        <button type="button" onClick={handlePaste} className="px-4 py-2 bg-brand-cyan text-white rounded-lg font-medium hover:bg-opacity-90 transition-all active:translate-y-[1px] active:scale-[0.98]">Paste</button>
        <button type="button" onClick={handleClear} className="px-4 py-2 bg-brand-pink text-white rounded-lg font-medium hover:bg-opacity-90 transition-all active:translate-y-[1px] active:scale-[0.98]">Clear</button>
        <button type="button" onClick={handleCopy} className="px-4 py-2 bg-brand-orange text-white rounded-lg font-medium hover:bg-opacity-90 transition-all active:translate-y-[1px] active:scale-[0.98]">Copy</button>
        <button type="button" onClick={handleSampleText} className="px-4 py-2 bg-gray-200 text-text-primary rounded-lg font-medium hover:bg-gray-300 transition-all active:translate-y-[1px] active:scale-[0.98]">Sample Text</button>
      </div>

      {/* Platform Presets */}
      <div className="flex flex-wrap gap-2 mb-4 p-4 bg-gray-50">
        <span className="text-sm text-text-muted font-medium">Platform limits:</span>
        {PLATFORM_PRESETS.map((preset) => (
          <button
            key={preset.name}
            type="button"
            onClick={() => setSelectedPreset(selectedPreset?.name === preset.name ? null : preset)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              selectedPreset?.name === preset.name
                ? 'bg-brand-pink text-white'
                : 'bg-gray-200 text-text-primary hover:bg-gray-300'
            }`}
          >
            {preset.name} ({preset.limit})
          </button>
        ))}
      </div>

      {/* Text Input */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste or type your text here..."
        className="w-full h-64 md:h-80 p-4 border border-gray-200 rounded-b-xl resize-none focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/10 transition-all text-text-primary placeholder:text-text-muted/50"
        spellCheck="false"
      />

      {/* Stats Panel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 p-4 bg-gray-50 rounded-xl">
        <div className="text-center p-3 bg-surface rounded-lg">
          <div className="text-2xl md:text-3xl font-display font-bold text-brand-pink">{chars.toLocaleString()}</div>
          <div className="text-xs text-text-muted mt-1 uppercase tracking-wide">Characters (with spaces)</div>
        </div>
        <div className="text-center p-3 bg-surface rounded-lg">
          <div className="text-xl md:text-2xl font-display font-semibold text-brand-cyan">{charsNoSpaces.toLocaleString()}</div>
          <div className="text-xs text-text-muted mt-1 uppercase tracking-wide">Characters (no spaces)</div>
        </div>
        <div className="text-center p-3 bg-surface rounded-lg">
          <div className="text-lg font-display font-medium text-text-primary">{words.toLocaleString()}</div>
          <div className="text-xs text-text-muted mt-1 uppercase tracking-wide">Words</div>
        </div>
        {remaining !== null && (
          <div className="text-center p-3 bg-surface rounded-lg">
            <div className={`text-lg font-display font-medium ${remaining >= 0 ? 'text-green-600' : 'text-brand-pink'}`}>
              {remaining >= 0 ? remaining : remaining}
            </div>
            <div className="text-xs text-text-muted mt-1 uppercase tracking-wide">
              {remaining >= 0 ? 'Remaining' : 'Over limit'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
