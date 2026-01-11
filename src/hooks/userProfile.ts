import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  weekly_goal: number;
  reminder_enabled: boolean;
  reminder_time: string;
  theme: string;
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  const loadProfile = async () => {
    if (!isSupabaseConfigured() || !supabase || !user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (err) {
      console.error('Failed to load profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!isSupabaseConfigured() || !supabase || !user) {
      throw new Error('Not authenticated');
    }

    try {
      const { data, error } = await supabase
        . from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
      return data;
    } catch (err) {
      console. error('Failed to update profile:', err);
      throw err;
    }
  };

  const updateDisplayName = async (displayName: string) => {
    return updateProfile({ display_name: displayName });
  };

  const updateWeeklyGoal = async (goal: number) => {
    return updateProfile({ weekly_goal: goal });
  };

  const updateReminders = async (enabled: boolean, time?:  string) => {
    const updates:  Partial<UserProfile> = { reminder_enabled: enabled };
    if (time) updates.reminder_time = time;
    return updateProfile(updates);
  };

  const updateTheme = async (theme: string) => {
    return updateProfile({ theme });
  };

  return {
    profile,
    loading,
    error,
    updateProfile,
    updateDisplayName,
    updateWeeklyGoal,
    updateReminders,
    updateTheme,
    refresh: loadProfile,
  };
}