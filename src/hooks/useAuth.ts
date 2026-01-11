import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (! isSupabaseConfigured() || !supabase) {
      setLoading(false);
      return;
    }

    // Get initial session
    supabase. auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?. user ??  null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth. onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ??  null);
      }
    );

    return () => subscription. unsubscribe();
  }, []);

  const signUp = async (email:  string, password: string) => {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase. auth.signUp({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  };

  const signIn = async (email:  string, password: string) => {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase.auth. signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  };

  const signInWithGoogle = async () => {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const resetPassword = async (email: string) => {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase. auth.resetPasswordForEmail(email, {
      redirectTo:  `${window.location. origin}/reset-password`,
    });
    
    if (error) throw error;
    return data;
  };

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    isAuthenticated: !! user,
  };
}