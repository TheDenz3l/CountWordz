'use client';
import { useState } from 'react';
import { countWords, estimateReadingTime, estimateSpeakingTime } from '../lib/text-utils';

export default function ReadingTimeTool() {
  const [text, setText] = useState('');
  const [wpm, setWpm] = useState(200);
  const words = countWords(text);
  const reading = estimateReadingTime(text, wpm);
  const speaking = estimateSpeakingTime(text, 140);

  const handlePaste = async () => setText(await navigator.clipboard.readText().catch(() => ''));
  const handleClear = () => setText('');
  const handleCopy = async () => { if (text) await navigator.clipboard.writeText(text).catch(() => {}); };
  const handleSampleText = () => setText("This is sample text. Reading time is calculated based on words per minute. Average reading speed is 200-250 WPM. Speaking speed is typically 130-150 WPM.");

  const formatTime = (m: number, s: number) => m === 0 && s === 0 ? '0 sec' : m === 0 ? `${s} sec` : s === 0 ? `${m} min` : `${m} min ${s} sec`;

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2 mb-4 p-4 bg-gray-50 border-b border-gray-100 rounded-t-xl">
        <button onClick={handlePaste} className="px-4 py-2 bg-brand-cyan text-white rounded-lg font-medium">Paste</button>
        <button onClick={handleClear} className="px-4 py-2 bg-brand-pink text-white rounded-lg font-medium">Clear</button>
        <button onClick={handleCopy} className="px-4 py-2 bg-brand-orange text-white rounded-lg font-medium">Copy</button>
        <button onClick={handleSampleText} className="px-4 py-2 bg-gray-200 text-text-primary rounded-lg font-medium">Sample Text</button>
      </div>
      <div className="p-4 bg-gray-50 border-b border-gray-100">
        <label className="text-sm text-text-muted">Reading speed: </label>
        <select value={wpm} onChange={(e) => setWpm(Number(e.target.value))} className="ml-2 px-3 py-1.5 border rounded-lg">
          <option value={150}>Slow (150 WPM)</option>
          <option value={200}>Average (200 WPM)</option>
          <option value={250}>Fast (250 WPM)</option>
        </select>
      </div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste or type your text..." className="w-full h-64 md:h-80 p-4 border border-gray-200 rounded-b-xl resize-none focus:border-brand-pink" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 p-4 bg-gray-50 rounded-xl">
        <div className="text-center p-3 bg-surface rounded-lg"><div className="text-2xl md:text-3xl font-display font-bold text-brand-pink">{formatTime(reading.minutes, reading.seconds)}</div><div className="text-xs text-text-muted mt-1 uppercase">Reading Time</div></div>
        <div className="text-center p-3 bg-surface rounded-lg"><div className="text-xl font-display font-semibold text-brand-cyan">{formatTime(speaking.minutes, speaking.seconds)}</div><div className="text-xs text-text-muted mt-1 uppercase">Speaking Time</div></div>
        <div className="text-center p-3 bg-surface rounded-lg"><div className="text-lg font-display font-medium">{words}</div><div className="text-xs text-text-muted mt-1 uppercase">Words</div></div>
        <div className="text-center p-3 bg-surface rounded-lg"><div className="text-lg font-display font-medium">{wpm}</div><div className="text-xs text-text-muted mt-1 uppercase">WPM</div></div>
      </div>
    </div>
  );
}
