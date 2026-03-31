'use client';

import { useState, useMemo } from 'react';
import { calculateFleschReadingEase, calculateFleschKincaidGrade } from '../lib/readability';

interface Suggestion {
  type: 'passive' | 'long-sentence' | 'complex-word' | 'repetition' | 'clarity';
  original: string;
  suggestion: string;
  explanation: string;
}

interface RewriteAnalysis {
  sentences: string[];
  suggestions: Suggestion[];
  originalReadability: number;
  improvedReadability: number;
  originalGrade: number;
  improvedGrade: number;
}

// Simple passive voice detection
const passivePatterns = [
  /\b(was|were|is|are|been|being|be)\s+\w+ed\b/gi,
  /\b(was|were|is|are|been|being|be)\s+\w+en\b/gi,
  /\b(has|have|had)\s+been\s+\w+ed\b/gi,
];

// Common complex words and simpler alternatives
const complexWords: Record<string, string> = {
  'utilize': 'use',
  'implement': 'do',
  'facilitate': 'help',
  'commence': 'start',
  'terminate': 'end',
  'subsequently': 'then',
  'nevertheless': 'but',
  'furthermore': 'also',
  'consequently': 'so',
  'approximately': 'about',
  'demonstrate': 'show',
  'investigate': 'check',
  'purchase': 'buy',
  'reside': 'live',
  'possess': 'have',
};

export default function ParagraphRewriter() {
  const [text, setText] = useState('');

  const analysis = useMemo((): RewriteAnalysis | null => {
    if (!text.trim()) return null;

    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const suggestions: Suggestion[] = [];

    // Check for passive voice
    sentences.forEach((sentence, i) => {
      passivePatterns.forEach(pattern => {
        const match = sentence.match(pattern);
        if (match) {
          suggestions.push({
            type: 'passive',
            original: sentence.trim(),
            suggestion: 'Consider rewriting in active voice for clarity',
            explanation: 'Passive voice can make writing less direct and harder to read'
          });
        }
      });
    });

    // Check for long sentences (>25 words)
    sentences.forEach(sentence => {
      const wordCount = sentence.trim().split(/\s+/).length;
      if (wordCount > 25) {
        suggestions.push({
          type: 'long-sentence',
          original: sentence.trim(),
          suggestion: `Consider breaking this ${wordCount}-word sentence into shorter sentences`,
          explanation: 'Shorter sentences (15-20 words) are easier to read and understand'
        });
      }
    });

    // Check for complex words
    Object.entries(complexWords).forEach(([complex, simple]) => {
      if (text.toLowerCase().includes(complex)) {
        suggestions.push({
          type: 'complex-word',
          original: complex,
          suggestion: simple,
          explanation: 'Simpler words improve readability'
        });
      }
    });

    // Check for repeated words
    const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const wordFreq = new Map<string, number>();
    words.forEach(w => wordFreq.set(w, (wordFreq.get(w) || 0) + 1));
    wordFreq.forEach((count, word) => {
      if (count > 3) {
        suggestions.push({
          type: 'repetition',
          original: word,
          suggestion: `Use synonyms instead of repeating "${word}" ${count} times`,
          explanation: 'Varying vocabulary makes writing more engaging'
        });
      }
    });

    const originalReadability = calculateFleschReadingEase(text);
    const originalGrade = calculateFleschKincaidGrade(text);

    // Estimate improved readability if suggestions are followed
    const improvedReadability = Math.min(100, originalReadability + suggestions.length * 2);
    const improvedGrade = Math.max(0, originalGrade - suggestions.length * 0.5);

    return {
      sentences,
      suggestions,
      originalReadability: Math.round(originalReadability * 10) / 10,
      improvedReadability: Math.round(improvedReadability * 10) / 10,
      originalGrade: Math.round(originalGrade * 10) / 10,
      improvedGrade: Math.round(improvedGrade * 10) / 10,
    };
  }, [text]);

  const handleClear = () => setText('');
  
  const handleSampleText = () => {
    setText("The utilization of passive voice was implemented by the writer. Consequently, the document was subsequently investigated by the committee. Furthermore, it was demonstrated that approximately 25 words were utilized in a single sentence, which was subsequently terminated by the editor. The committee had been facilitated by the investigation that was commenced.");
  };

  return (
    <div class="w-full">
      {/* Toolbar */}
      <div class="flex flex-wrap gap-2 mb-4 p-4 bg-gray-50 border-b border-gray-100 rounded-t-xl">
        <button onClick={handleSampleText} class="px-4 py-2 bg-gray-200 text-text-primary rounded-lg font-medium hover:bg-gray-300 transition-all">Sample Text</button>
        <button onClick={handleClear} class="px-4 py-2 bg-brand-pink text-white rounded-lg font-medium hover:bg-opacity-90 transition-all">Clear</button>
      </div>

      {/* Text Input */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste your paragraph to analyze and get rewrite suggestions..."
        class="w-full h-48 p-4 border border-gray-200 rounded-xl resize-none focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/10 transition-all text-text-primary placeholder:text-text-muted/50"
      />

      {/* Results */}
      {analysis && (
        <div class="mt-6 space-y-6">
          {/* Readability Comparison */}
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl">
            <div class="text-center p-3 bg-surface rounded-lg">
              <div class="text-sm text-text-muted mb-1">Original Readability</div>
              <div class="text-2xl font-display font-bold text-brand-cyan">{analysis.originalReadability}</div>
            </div>
            <div class="text-center p-3 bg-surface rounded-lg">
              <div class="text-sm text-text-muted mb-1">Improved Readability</div>
              <div class="text-2xl font-display font-bold text-green-600">{analysis.improvedReadability}</div>
            </div>
            <div class="text-center p-3 bg-surface rounded-lg">
              <div class="text-sm text-text-muted mb-1">Original Grade</div>
              <div class="text-xl font-display font-semibold text-brand-orange">{analysis.originalGrade}</div>
            </div>
            <div class="text-center p-3 bg-surface rounded-lg">
              <div class="text-sm text-text-muted mb-1">Improved Grade</div>
              <div class="text-xl font-display font-semibold text-green-600">{analysis.improvedGrade}</div>
            </div>
          </div>

          {/* Suggestions */}
          {analysis.suggestions.length > 0 ? (
            <div class="space-y-4">
              <h3 class="text-xl font-display font-bold">💡 Rewrite Suggestions ({analysis.suggestions.length})</h3>
              
              {/* Passive Voice */}
              {analysis.suggestions.filter(s => s.type === 'passive').map((s, i) => (
                <div key={i} class="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="text-yellow-600 font-bold">⚠️ Passive Voice</span>
                  </div>
                  <p class="text-text-primary mb-2 italic">"{s.original}"</p>
                  <p class="text-sm text-text-muted mb-2">{s.explanation}</p>
                  <p class="text-sm font-semibold text-brand-cyan">{s.suggestion}</p>
                </div>
              ))}

              {/* Long Sentences */}
              {analysis.suggestions.filter(s => s.type === 'long-sentence').map((s, i) => (
                <div key={i} class="p-4 bg-orange-50 border border-orange-200 rounded-xl">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="text-orange-600 font-bold">📏 Long Sentence</span>
                  </div>
                  <p class="text-text-primary mb-2 italic">"{s.original.substring(0, 100)}..."</p>
                  <p class="text-sm text-text-muted mb-2">{s.explanation}</p>
                  <p class="text-sm font-semibold text-brand-cyan">{s.suggestion}</p>
                </div>
              ))}

              {/* Complex Words */}
              {analysis.suggestions.filter(s => s.type === 'complex-word').map((s, i) => (
                <div key={i} class="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="text-blue-600 font-bold">📚 Complex Word</span>
                  </div>
                  <p class="text-text-primary mb-2">Instead of <strong class="text-red-600">"{s.original}"</strong></p>
                  <p class="text-sm font-semibold text-green-600">Use: "{s.suggestion}"</p>
                  <p class="text-xs text-text-muted mt-2">{s.explanation}</p>
                </div>
              ))}

              {/* Repetition */}
              {analysis.suggestions.filter(s => s.type === 'repetition').map((s, i) => (
                <div key={i} class="p-4 bg-purple-50 border border-purple-200 rounded-xl">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="text-purple-600 font-bold">🔄 Word Repetition</span>
                  </div>
                  <p class="text-text-primary mb-2">{s.suggestion}</p>
                  <p class="text-xs text-text-muted">{s.explanation}</p>
                </div>
              ))}
            </div>
          ) : (
            <div class="p-6 bg-green-50 border border-green-200 rounded-xl text-center">
              <p class="text-green-800 font-semibold text-lg">✓ Great writing!</p>
              <p class="text-green-700 mt-2">No major issues found. Your paragraph is clear and readable.</p>
            </div>
          )}

          {/* Writing Tips */}
          <div class="p-4 bg-brand-cream rounded-xl border border-brand-cyan/20">
            <h3 class="text-xl font-display font-bold mb-3">✍️ Writing Tips</h3>
            <ul class="space-y-2 text-text-primary text-sm">
              <li class="flex items-start gap-2">
                <span class="text-brand-cyan mt-1">•</span>
                <span>Use active voice: "The writer wrote" instead of "It was written by the writer"</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-brand-cyan mt-1">•</span>
                <span>Keep sentences between 15-20 words for optimal readability</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-brand-cyan mt-1">•</span>
                <span>Use simple words when possible — clarity over complexity</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-brand-cyan mt-1">•</span>
                <span>Vary your vocabulary to keep readers engaged</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
