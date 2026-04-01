'use client';

import { useState, useEffect } from 'react';
import { getTextStats } from '../lib/text-utils';
import { getToolTranslation, resolveLocale } from '../lib/tool-i18n';

interface Stats {
  words: number;
  charactersWithSpaces: number;
  charactersWithoutSpaces: number;
  sentences: number;
  paragraphs: number;
  readingTime: { minutes: number; seconds: number };
  speakingTime: { minutes: number; seconds: number };
}

interface Props {
  locale?: string;
}

export default function WordCounterTool({ locale = 'en' }: Props) {
  const resolvedLocale = resolveLocale(locale);
  const common = getToolTranslation(resolvedLocale, 'common');
  const copy = getToolTranslation(resolvedLocale, 'wordCounter');
  const [text, setText] = useState('');
  const [stats, setStats] = useState<Stats>({
    words: 0,
    charactersWithSpaces: 0,
    charactersWithoutSpaces: 0,
    sentences: 0,
    paragraphs: 0,
    readingTime: { minutes: 0, seconds: 0 },
    speakingTime: { minutes: 0, seconds: 0 },
  });

  const [clipboardHistory, setClipboardHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  useEffect(() => {
    const newStats = getTextStats(text, resolvedLocale);
    setStats({
      words: newStats.words,
      charactersWithSpaces: newStats.charactersWithSpaces,
      charactersWithoutSpaces: newStats.charactersWithoutSpaces,
      sentences: newStats.sentences,
      paragraphs: newStats.paragraphs,
      readingTime: { minutes: newStats.readingTime.minutes, seconds: newStats.readingTime.seconds },
      speakingTime: { minutes: newStats.speakingTime.minutes, seconds: newStats.speakingTime.seconds },
    });
  }, [text, resolvedLocale]);

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      setText(clipboardText);
    } catch (err) {
      console.error('Failed to paste:', err);
    }
  };

  const handleClear = () => {
    if (text) {
      setClipboardHistory([...clipboardHistory, text]);
      setHistoryIndex(clipboardHistory.length);
      setText('');
    }
  };

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

  const handleUndo = () => {
    if (clipboardHistory.length > 0 && historyIndex >= 0) {
      setText(clipboardHistory[historyIndex]);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const formatTime = (minutes: number, seconds: number) => {
    if (minutes === 0 && seconds === 0) return `0 ${common.sec}`;
    if (minutes === 0) return `${seconds} ${common.sec}`;
    if (seconds === 0) return `${minutes} ${common.min}`;
    return `${minutes} ${common.min} ${seconds} ${common.sec}`;
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-2 mb-4 p-4 bg-gray-50 border-b border-gray-100 rounded-t-xl">
        <button type="button" onClick={handlePaste} className="px-4 py-2 bg-brand-cyan text-white rounded-lg font-medium hover:bg-opacity-90 transition-all active:translate-y-[1px] active:scale-[0.98]">{common.paste}</button>
        <button type="button" onClick={handleClear} className="px-4 py-2 bg-brand-pink text-white rounded-lg font-medium hover:bg-opacity-90 transition-all active:translate-y-[1px] active:scale-[0.98]">{common.clear}</button>
        <button type="button" onClick={handleCopy} className="px-4 py-2 bg-brand-orange text-white rounded-lg font-medium hover:bg-opacity-90 transition-all active:translate-y-[1px] active:scale-[0.98]">{common.copy}</button>
        <button type="button" onClick={handleSampleText} className="px-4 py-2 bg-gray-200 text-text-primary rounded-lg font-medium hover:bg-gray-300 transition-all active:translate-y-[1px] active:scale-[0.98]">{common.sampleText}</button>
        <button type="button" onClick={handleUndo} disabled={historyIndex < 0} className="px-4 py-2 bg-gray-200 text-text-primary rounded-lg font-medium hover:bg-gray-300 transition-all active:translate-y-[1px] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">{common.undo}</button>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={copy.placeholder}
        className="w-full h-64 md:h-80 p-4 border border-gray-200 rounded-b-xl resize-none focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/10 transition-all text-text-primary placeholder:text-text-muted/50"
        spellCheck="false"
      />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-6 p-4 bg-gray-50 rounded-xl">
        <div className="text-center p-3 bg-surface rounded-lg">
          <div className="text-2xl md:text-3xl font-display font-bold text-brand-pink">{stats.words.toLocaleString()}</div>
          <div className="text-xs text-text-muted mt-1 uppercase tracking-wide">{copy.words}</div>
        </div>
        <div className="text-center p-3 bg-surface rounded-lg">
          <div className="text-xl md:text-2xl font-display font-semibold text-brand-cyan">{stats.charactersWithSpaces.toLocaleString()}</div>
          <div className="text-xs text-text-muted mt-1 uppercase tracking-wide">{copy.charsWithSpaces}</div>
        </div>
        <div className="text-center p-3 bg-surface rounded-lg">
          <div className="text-xl md:text-2xl font-display font-semibold text-brand-cyan">{stats.charactersWithoutSpaces.toLocaleString()}</div>
          <div className="text-xs text-text-muted mt-1 uppercase tracking-wide">{copy.charsNoSpaces}</div>
        </div>
        <div className="text-center p-3 bg-surface rounded-lg">
          <div className="text-lg font-display font-medium text-text-primary">{stats.sentences.toLocaleString()}</div>
          <div className="text-xs text-text-muted mt-1 uppercase tracking-wide">{copy.sentences}</div>
        </div>
        <div className="text-center p-3 bg-surface rounded-lg">
          <div className="text-lg font-display font-medium text-text-primary">{stats.paragraphs.toLocaleString()}</div>
          <div className="text-xs text-text-muted mt-1 uppercase tracking-wide">{copy.paragraphs}</div>
        </div>
        <div className="text-center p-3 bg-surface rounded-lg">
          <div className="text-lg font-display font-medium text-text-primary">{formatTime(stats.readingTime.minutes, stats.readingTime.seconds)}</div>
          <div className="text-xs text-text-muted mt-1 uppercase tracking-wide">{copy.readingTime}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-4">
        <div className="col-span-2 md:col-span-3 lg:col-span-6 text-center p-3 bg-surface rounded-xl border border-gray-100">
          <div className="text-lg font-display font-medium text-brand-orange">{formatTime(stats.speakingTime.minutes, stats.speakingTime.seconds)}</div>
          <div className="text-xs text-text-muted mt-1 uppercase tracking-wide">{copy.speakingTime}</div>
        </div>
      </div>
    </div>
  );
}
