import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './useAuth';
import { startOfWeek, format } from 'date-fns';
import { BUTTERFLY_COLORS } from '../utils/butterfly';

export interface CompletedWeek {
  id: string;
  week_start: string;
  butterfly_color: string;
  entries_count: number;
}

const LOCAL_STORAGE_KEY = 'bloomlet_completed_weeks';

export function useCompletedWeeks() {
  const { user } = useAuth();
  const [completedWeeks, setCompletedWeeks] = useState<CompletedWeek[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCompletedWeeks();
  }, [user]);

  const loadCompletedWeeks = async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured() && supabase && user) {
        const { data, error } = await supabase
          . from('weekly_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('completed', true)
          .order('week_start', { ascending: true });

        if (error) throw error;
        
        console.log('Loaded completed weeks from database:', data);
        
        // Map to our format with colors
        const weeks = (data || []).map((week, index) => ({
          id: week.id,
          week_start: week.week_start,
          butterfly_color: week. butterfly_color || BUTTERFLY_COLORS[index % BUTTERFLY_COLORS.length],
          entries_count: week.entries_count,
        }));
        
        console.log('Mapped completed weeks:', weeks);
        setCompletedWeeks(weeks);
      } else {
        // Fallback to localStorage
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        const weeks = stored ? JSON.parse(stored) : [];
        console.log('Loaded completed weeks from localStorage:', weeks);
        setCompletedWeeks(weeks);
      }
    } catch (err) {
      console.error('Failed to load completed weeks:', err);
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      setCompletedWeeks(stored ?  JSON.parse(stored) : []);
    } finally {
      setLoading(false);
    }
  };

  const markWeekComplete = async (entriesCount: number, goal: number, weekStartDate?: string) => {
    const weekStart = weekStartDate || format(startOfWeek(new Date(), { weekStartsOn: 0 }), 'yyyy-MM-dd');
    const color = BUTTERFLY_COLORS[completedWeeks.length % BUTTERFLY_COLORS.length];

    // Avoid duplicate entries for the same week in local state/localStorage
    const existing = completedWeeks.find(w => w.week_start === weekStart);
    if (existing) {
      return existing;
    }

    const newWeek:  CompletedWeek = {
      id: crypto.randomUUID(),
      week_start: weekStart,
      butterfly_color:  color,
      entries_count: entriesCount,
    };

    try {
      if (isSupabaseConfigured() && supabase && user) {
        const { error } = await supabase
          .from('weekly_progress')
          .upsert({
            user_id: user. id,
            week_start: weekStart,
            entries_count: entriesCount,
            goal,
            completed: true,
            butterfly_color: color,
          }, {
            onConflict: 'user_id,week_start',
          });

        if (error) throw error;
      }

      const updated = [... completedWeeks, newWeek];
      setCompletedWeeks(updated);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      
      return newWeek;
    } catch (err) {
      console.error('Failed to mark week complete:', err);
      throw err;
    }
  };

  const syncCompletedWeeks = async (entries: any[], weeklyGoal: number) => {
    // Group entries by week and check which weeks completed the goal
    const weekMap = new Map<string, any[]>();
    
    entries.forEach(entry => {
      const entryDate = new Date(entry.created_at);
      const weekStart = format(startOfWeek(entryDate, { weekStartsOn: 0 }), 'yyyy-MM-dd');
      
      if (!weekMap.has(weekStart)) {
        weekMap.set(weekStart, []);
      }
      weekMap.get(weekStart)!.push(entry);
    });

    console.log('Week map:', Array.from(weekMap.entries()).map(([week, entries]) => ({
      week,
      count: entries.length,
      meetsGoal: entries.length >= weeklyGoal
    })));

    // Check each week that met the goal
    const weeksToComplete = Array.from(weekMap.entries())
      .filter(([_, weekEntries]) => weekEntries.length >= weeklyGoal)
      .map(([weekStart, weekEntries]) => ({
        weekStart,
        count: weekEntries.length
      }));

    console.log('Weeks that should be completed:', weeksToComplete);

    // Mark each completed week
    for (const { weekStart, count } of weeksToComplete) {
      // Check if already marked
      const existing = completedWeeks.find(w => w.week_start === weekStart);
      if (!existing) {
        console.log(`Marking week ${weekStart} as complete (${count} entries)`);
        await markWeekComplete(count, weeklyGoal, weekStart);
      }
    }

    // Reload after sync
    await loadCompletedWeeks();
  };

  return {
    completedWeeks,
    loading,
    markWeekComplete,
    refresh: loadCompletedWeeks,
    syncCompletedWeeks,
    totalButterflies: completedWeeks.length,
  };
}