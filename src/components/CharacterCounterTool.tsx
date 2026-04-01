'use client';

import { useState } from 'react';
import { countCharsWithSpaces, countCharsWithoutSpaces, countWords } from '../lib/text-utils';
import { getToolTranslation } from '../lib/tool-i18n';

interface PlatformPreset {
  name: string;
  limit: number;
}

interface Props {
  locale?: string;
}

export default function CharacterCounterTool({ locale = 'en' }: Props) {
  const common = getToolTranslation(locale, 'common');
  const copy = getToolTranslation(locale, 'characterCounter');
  const platformPresets: PlatformPreset[] = [
    { name: copy.presets.twitter, limit: 280 },
    { name: copy.presets.instagram, limit: 2200 },
    { name: copy.presets.linkedin, limit: 3000 },
    { name: copy.presets.meta, limit: 160 },
  ];

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
    setText(copy.sampleText);
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-2 mb-4 p-4 bg-gray-50 border-b border-gray-100 rounded-t-xl">
        <button type="button" onClick={handlePaste} className="px-4 py-2 bg-brand-cyan text-white rounded-lg font-medium hover:bg-opacity-90 transition-all active:translate-y-[1px] active:scale-[0.98]">{common.paste}</button>
        <button type="button" onClick={handleClear} className="px-4 py-2 bg-brand-pink text-white rounded-lg font-medium hover:bg-opacity-90 transition-all active:translate-y-[1px] active:scale-[0.98]">{common.clear}</button>
        <button type="button" onClick={handleCopy} className="px-4 py-2 bg-brand-orange text-white rounded-lg font-medium hover:bg-opacity-90 transition-all active:translate-y-[1px] active:scale-[0.98]">{common.copy}</button>
        <button type="button" onClick={handleSampleText} className="px-4 py-2 bg-gray-200 text-text-primary rounded-lg font-medium hover:bg-gray-300 transition-all active:translate-y-[1px] active:scale-[0.98]">{common.sampleText}</button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4 p-4 bg-gray-50">
        <span className="text-sm text-text-muted font-medium">{copy.platformLimits}</span>
        {platformPresets.map((preset) => (
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

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={copy.placeholder}
        className="w-full h-64 md:h-80 p-4 border border-gray-200 rounded-b-xl resize-none focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/10 transition-all text-text-primary placeholder:text-text-muted/50"
        spellCheck="false"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 p-4 bg-gray-50 rounded-xl">
        <div className="text-center p-3 bg-surface rounded-lg">
          <div className="text-2xl md:text-3xl font-display font-bold text-brand-pink">{chars.toLocaleString()}</div>
          <div className="text-xs text-text-muted mt-1 uppercase tracking-wide">{copy.charactersWithSpaces}</div>
        </div>
        <div className="text-center p-3 bg-surface rounded-lg">
          <div className="text-xl md:text-2xl font-display font-semibold text-brand-cyan">{charsNoSpaces.toLocaleString()}</div>
          <div className="text-xs text-text-muted mt-1 uppercase tracking-wide">{copy.charactersNoSpaces}</div>
        </div>
        <div className="text-center p-3 bg-surface rounded-lg">
          <div className="text-lg font-display font-medium text-text-primary">{words.toLocaleString()}</div>
          <div className="text-xs text-text-muted mt-1 uppercase tracking-wide">{copy.words}</div>
        </div>
        {remaining !== null && (
          <div className="text-center p-3 bg-surface rounded-lg">
            <div className={`text-lg font-display font-medium ${remaining >= 0 ? 'text-green-600' : 'text-brand-pink'}`}>{remaining}</div>
            <div className="text-xs text-text-muted mt-1 uppercase tracking-wide">{remaining >= 0 ? copy.remaining : copy.overLimit}</div>
          </div>
        )}
      </div>
    </div>
  );
}
