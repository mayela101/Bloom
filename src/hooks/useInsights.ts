import { useState, useEffect } from 'react';
import { JournalEntry } from '../types';
import { generateInsights } from '../lib/claude';

interface Insights {
  summary: string;
  suggestion: string;
  moodTrend: 'improving' | 'stable' | 'declining' | 'mixed';
}

export function useInsights(entries: JournalEntry[], userName?: string) {
  const [insights, setInsights] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInsights() {
      setLoading(true);
      try {
        const result = await generateInsights(
          entries. map(e => ({
            content: e.content,
            mood: e.mood,
            sentiment_score: e.sentiment_score,
            created_at: e.created_at,
          })),
          userName
        );
        setInsights(result);
      } catch (err) {
        console.error('Failed to fetch insights:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchInsights();
  }, [entries, userName]);

  return { insights, loading };
}