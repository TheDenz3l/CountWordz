'use client';

import { useState, useEffect } from 'react';
import { getTextStats } from '../lib/text-utils';

interface Stats {
  words: number;
  charactersWithSpaces: number;
  charactersWithoutSpaces: number;
  sentences: number;
  paragraphs: number;
  readingTime: { minutes: number; seconds: number; totalSeconds: number };
  speakingTime: { minutes: number; seconds: number; totalSeconds: number };
}

export default function WordCounter() {
  const [text, setText] = useState('');
  const [stats, setStats] = useState<Stats>({
    words: 0,
    charactersWithSpaces: 0,
    charactersWithoutSpaces: 0,
    sentences: 0,
    paragraphs: 0,
    readingTime: { minutes: 0, seconds: 0, totalSeconds: 0 },
    speakingTime: { minutes: 0, seconds: 0, totalSeconds: 0 },
  });

  useEffect(() => {
    const newStats = getTextStats(text);
    setStats(newStats);
  }, [text]);

  const formatTime = (minutes: number, seconds: number) => {
    if (minutes === 0 && seconds === 0) return '0 sec';
    if (minutes === 0) return `${seconds} sec`;
    if (seconds === 0) return `${minutes} min`;
    return `${minutes} min ${seconds} sec`;
  };

  return (
    <>
      {/* Stats are displayed by ToolLayout, this component handles the logic */}
      <style>{`
        [data-stat="words"] { font-size: 2.5rem; }
        [data-stat="chars"] { font-size: 1.5rem; }
        [data-stat="sentences"] { font-size: 1.5rem; }
        [data-stat="paragraphs"] { font-size: 1.25rem; }
        [data-stat="reading"] { font-size: 1.25rem; }
        [data-stat="speaking"] { font-size: 1.25rem; }
      `}</style>
      
      {/* Listen to text changes from ToolLayout and update stats */}
      <script>
        {`
          document.addEventListener('text-change', (e) => {
            const text = e.detail.text;
            // Stats calculation happens in the React component
            window.dispatchEvent(new CustomEvent('word-counter-update', { detail: { text } }));
          });
        `}
      </script>
    </>
  );
}
