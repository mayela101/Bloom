import { useState, useEffect } from 'react';
import { JournalEntry } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './useAuth';
import { analyzeEntry } from '../lib/claude';

const LOCAL_STORAGE_KEY = 'bloomlet_entries';

export function useJournalEntries() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, _setError] = useState<string | null>(null);

  useEffect(() => {
    loadEntries();
  }, [user]);

  const loadEntries = async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured() && supabase && user) {
        const { data, error } = await supabase
          . from('journal_entries')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setEntries(data || []);
      } else {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        setEntries(stored ?  JSON.parse(stored) : []);
      }
    } catch (err) {
      console.warn('Using localStorage fallback');
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      setEntries(stored ? JSON.parse(stored) : []);
    } finally {
      setLoading(false);
    }
  };

  const addEntry = async (content: string, mood?:  JournalEntry['mood']): Promise<{ entry: JournalEntry; totalThisWeek: number }> => {
    // First, analyze the entry with Claude
    let analysis = {
      sentiment_score: 0,
      themes: ['reflection'],
    };

    try {
      const result = await analyzeEntry(content);
      analysis = {
        sentiment_score: result.sentimentScore,
        themes: result.themes,
      };
    } catch (err) {
      console.warn('Analysis failed, continuing without it:', err);
    }

    const newEntry: JournalEntry = {
      id: crypto.randomUUID(),
      user_id: user?. id || 'local-user',
      content,
      mood,
      sentiment_score: analysis. sentiment_score,
      themes: analysis. themes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      if (isSupabaseConfigured() && supabase && user) {
        const { data, error } = await supabase
          .from('journal_entries')
          .insert({
            user_id: user.id,
            content,
            mood,
            sentiment_score: analysis.sentiment_score,
            themes: analysis.themes,
          })
          .select()
          .single();

        if (error) throw error;

        const updated = [data, ...entries];
        setEntries(updated);
        
        // Count this week's entries
        const thisWeekCount = countThisWeekEntries(updated);
        
        return { entry: data, totalThisWeek: thisWeekCount };
      }

      // Fallback to localStorage
      const updated = [newEntry, ...entries];
      setEntries(updated);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      
      const thisWeekCount = countThisWeekEntries(updated);
      return { entry: newEntry, totalThisWeek: thisWeekCount };
    } catch (err) {
      // Fallback to localStorage
      const updated = [newEntry, ... entries];
      setEntries(updated);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      
      const thisWeekCount = countThisWeekEntries(updated);
      return { entry: newEntry, totalThisWeek:  thisWeekCount };
    }
  };

  // Helper to count unique DAYS with entries this week
  const countThisWeekEntries = (allEntries: JournalEntry[]): number => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart. setDate(now.getDate() - now.getDay()); // Sunday
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    const thisWeekEntries = allEntries.filter(entry => {
      const entryDate = new Date(entry.created_at);
      return entryDate >= weekStart && entryDate < weekEnd;
    });

    // Count UNIQUE days, not total entries
    const uniqueDays = new Set(
      thisWeekEntries.map(entry => {
        const d = new Date(entry.created_at);
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      })
    );

    return uniqueDays.size;
  };

  const deleteEntry = async (id: string) => {
    try {
      if (isSupabaseConfigured() && supabase && user) {
        const { error } = await supabase
          .from('journal_entries')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) throw error;
      }

      const updated = entries.filter(e => e.id !== id);
      setEntries(updated);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      const updated = entries.filter(e => e. id !== id);
      setEntries(updated);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    }
  };

  // Get sentiment stats for dashboard
  const getSentimentStats = () => {
    if (entries.length === 0) return null;

    const withSentiment = entries.filter(e => e. sentiment_score !== undefined);
    if (withSentiment.length === 0) return null;

    const avgSentiment = withSentiment.reduce((sum, e) => sum + (e.sentiment_score || 0), 0) / withSentiment.length;

    const positive = withSentiment.filter(e => (e.sentiment_score || 0) > 0.2).length;
    const neutral = withSentiment.filter(e => Math.abs(e. sentiment_score || 0) <= 0.2).length;
    const negative = withSentiment.filter(e => (e.sentiment_score || 0) < -0.2).length;

    return {
      average:  avgSentiment,
      positive,
      neutral,
      negative,
      total: withSentiment.length,
    };
  };

  // Get theme frequency for dashboard
  const getThemeStats = () => {
    const themeCounts:  Record<string, number> = {};

    entries.forEach(entry => {
      entry.themes?. forEach(theme => {
        themeCounts[theme] = (themeCounts[theme] || 0) + 1;
      });
    });

    return Object.entries(themeCounts)
      .map(([theme, count]) => ({ theme, count }))
      .sort((a, b) => b.count - a.count);
  };

  return {
    entries,
    loading,
    error,
    addEntry,
    deleteEntry,
    refresh: loadEntries,
    getSentimentStats,
    getThemeStats,
  };
}