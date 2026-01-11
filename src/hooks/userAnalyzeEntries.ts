import { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { analyzeEntry } from '../lib/claude';
import { useAuth } from './useAuth';

export function userAnalyzeEntries() {
  const { user } = useAuth();
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const analyzeAllEntries = async () => {
    if (!isSupabaseConfigured() || !supabase || !user) {
      throw new Error('Not configured');
    }

    setAnalyzing(true);
    
    try {
      // Get all entries without analysis
      const { data: entries, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .is('sentiment_score', null);

      if (error) throw error;
      if (! entries || entries.length === 0) {
        console.log('No entries to analyze');
        return { analyzed: 0 };
      }

      setProgress({ current: 0, total: entries.length });

      let analyzed = 0;
      for (const entry of entries) {
        try {
          const result = await analyzeEntry(entry.content);
          
          await supabase
            .from('journal_entries')
            .update({
              sentiment_score: result. sentimentScore,
              themes: result.themes,
            })
            .eq('id', entry.id);

          analyzed++;
          setProgress({ current: analyzed, total:  entries.length });
          
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (err) {
          console.error(`Failed to analyze entry ${entry.id}:`, err);
        }
      }

      return { analyzed };
    } finally {
      setAnalyzing(false);
    }
  };

  return {
    analyzeAllEntries,
    analyzing,
    progress,
  };
}