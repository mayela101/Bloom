import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJournalEntries } from '../hooks/useJournalEntries';
import { useWeekProgress } from '../hooks/useWeekProgress';
import { useProfile } from '../hooks/userProfile';
import { useCompletedWeeks } from '../hooks/useCompletedWeeks';
import { Mood } from '../types';
import { getflutterMessage, getStageFromEntries } from '../utils/butterfly';
import { generateJournalPrompt } from '../lib/claude';
import { ArrowLeft, Send, Sparkles, RefreshCw } from 'lucide-react';
import { startOfDay } from 'date-fns';
import styles from './NewEntry.module.css';

const MOOD_OPTIONS:  { value: Mood; emoji: string; label: string }[] = [
  { value: 'great', emoji: '😊', label: 'Great' },
  { value: 'good', emoji: '🙂', label:  'Good' },
  { value:  'okay', emoji: '😐', label: 'Okay' },
  { value:  'low', emoji: '😔', label: 'Low' },
  { value: 'difficult', emoji: '😢', label: 'Difficult' },
];

export function NewEntry() {
  const navigate = useNavigate();
  const { entries, addEntry } = useJournalEntries();
  const { profile } = useProfile();
  const weeklyGoal = profile?.weekly_goal || 4;
  const { currentWeekProgress } = useWeekProgress(entries, weeklyGoal);
  const { markWeekComplete, completedWeeks } = useCompletedWeeks();

  const [content, setContent] = useState('');
  const [mood, setMood] = useState<Mood | undefined>();
  const [saving, setSaving] = useState(false);
  const [prompt, setPrompt] = useState<string>('');
  const [loadingPrompt, setLoadingPrompt] = useState(true);

  // Check if user already journaled today
  const alreadyJournaledToday = useMemo(() => {
    const todayStart = startOfDay(new Date()).toISOString();
    return entries. some(entry => 
      startOfDay(new Date(entry.created_at)).toISOString() === todayStart
    );
  }, [entries]);

  useEffect(() => {
    loadPrompt();
  }, []);

  const loadPrompt = async () => {
    setLoadingPrompt(true);
    try {
      const recentContent = entries.slice(0, 3).map(e => e.content. slice(0, 100));
      const newPrompt = await generateJournalPrompt(recentContent, profile?.display_name || undefined);
      setPrompt(newPrompt);
    } catch (error) {
      setPrompt("What's on your mind today? 🦋");
    } finally {
      setLoadingPrompt(false);
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;

    setSaving(true);
    try {
      const { totalThisWeek } = await addEntry(content, mood);

      // Only count this as progress if it's the FIRST entry today
      const isFirstEntryToday = ! alreadyJournaledToday;

      if (isFirstEntryToday) {
        // Check if this entry completes the weekly goal! 
        const justCompletedGoal = totalThisWeek >= weeklyGoal;
        const wasAlreadyComplete = currentWeekProgress.completed;

        // Check if we already have a butterfly for this week
        const currentWeekStart = currentWeekProgress.weekStart. split('T')[0];
        const alreadyHasButterfly = completedWeeks.some(
          w => w.week_start === currentWeekStart
        );

        if (justCompletedGoal && !wasAlreadyComplete && !alreadyHasButterfly) {
          // 🎉 User just completed their goal! Add a butterfly! 
          await markWeekComplete(totalThisWeek, weeklyGoal);
          alert("🦋 Congratulations! You've completed your weekly goal and hatched a new butterfly!  Check your Butterfly Garden in Insights!");
        } else {
          // Regular stage progress message
          const newStage = getStageFromEntries(totalThisWeek, weeklyGoal);
          const message = getflutterMessage(newStage, true);
          alert(message);
        }
      } else {
        // They already journaled today - still save, but no stage progress
        alert("Entry saved! 📝 You've already made progress today - come back tomorrow to continue growing!  🦋");
      }

      navigate('/');
    } catch (error) {
      console.error('Failed to save entry:', error);
      alert('Failed to save entry.  Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button onClick={() => navigate(-1)} className={styles.backButton}>
          <ArrowLeft size={24} />
        </button>
        <h1 className={styles.title}>New Entry</h1>
      </div>

      {/* Already journaled today notice */}
      {alreadyJournaledToday && (
        <div className={styles.noticeCard}>
          <p>You've already journaled today!  Feel free to write more, but your next stage progress will be tomorrow. </p>
        </div>
      )}

      {/* Flutter's Prompt */}
      <div className={styles.promptCard}>
        <div className={styles.promptContent}>
          <div style={{ flex: 1 }}>
            <div className={styles.promptHeader}>
              <p className={styles.promptLabel}>Flutter suggests:</p>
              <button
                onClick={loadPrompt}
                disabled={loadingPrompt}
                className={styles.refreshButton}
                title="Get new prompt"
              >
                <RefreshCw size={16} className={loadingPrompt ? styles.spinning : ''} />
              </button>
            </div>
            <p className={loadingPrompt ? styles.promptLoading : styles.promptText}>
              {loadingPrompt ? 'Flutter is thinking...' : prompt}
            </p>
          </div>
        </div>
      </div>

      {/* Mood Selector */}
      <div className={styles.moodSection}>
        <p className={styles.moodLabel}>How are you feeling? </p>
        <div className={styles.moodOptions}>
          {MOOD_OPTIONS.map(option => (
            <button
              key={option.value}
              onClick={() => setMood(option.value)}
              className={`${styles.moodButton} ${mood === option.value ?  styles.moodButtonActive : ''}`}
            >
              <span className={styles. moodEmoji}>{option.emoji}</span>
              <span className={styles. moodText}>{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Text Area */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target. value)}
        placeholder="Let your thoughts flow..."
        className={styles.textArea}
      />

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={! content.trim() || saving}
        className={styles.submitButton}
      >
        {saving ? (
          <span>Saving...</span>
        ) : (
          <>
            <Send size={20} />
            <span>Save Entry</span>
          </>
        )}
      </button>
    </div>
  );
}