import { useJournalEntries } from '../hooks/useJournalEntries';
import { useWeekProgress } from '../hooks/useWeekProgress';
import { useProfile } from '../hooks/userProfile';
import { getStageEmoji, getflutterMessage, getStageName } from '../utils/butterfly';
import { Link } from 'react-router-dom';
import { PenLine, Sparkles } from 'lucide-react';
import { ProgressRing } from '../components/butterfly/ProgressRing';
import styles from './Home.module.css';

export function Home() {
  const { entries } = useJournalEntries();
  const { profile } = useProfile();
  const weeklyGoal = profile?.weekly_goal || 4;

  const { currentWeekProgress,  entriesToComplete, stages } = useWeekProgress(entries, weeklyGoal);

// Use stages directly (no 'empty' in the dots)
const displayStages = stages;
const currentStageIndex = currentWeekProgress.stage === 'empty' 
  ? -1  // Nothing highlighted when empty
  : displayStages.indexOf(currentWeekProgress. stage);

  // Personalized greeting
  const greeting = profile?.display_name
    ? `Welcome back, ${profile.display_name}! 🦋`
    : 'Welcome back! 🦋';

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Bloom</h1>
      </div>

      {/* Flutter's Greeting */}
      <div className={styles. card}>
        <div className={styles.flutterGreeting}>
          <span className={styles.flutterEmoji}>🦋</span>
          <div>
            <p className={styles.flutterLabel}>Flutter says:</p>
            <p className={styles.flutterMessage}>
              {greeting} {getflutterMessage(currentWeekProgress.stage, false)}
            </p>
          </div>
        </div>
      </div>

      {/* Circular Progress Ring */}
      <div className={styles.card}>
        <div className={styles.progressSection}>
          <ProgressRing
            current={currentWeekProgress.entriesCount}
            goal={weeklyGoal}
            stage={currentWeekProgress.stage}
          />
          <div className={styles.progressInfo}>
            <p className={styles.progressCount}>
              {currentWeekProgress.entriesCount} / {weeklyGoal}
            </p>

          </div>
        </div>
      </div>

      {/* This Week's Growth - Stage Dots */}
      <div className={styles.cardLarge}>
        <h2 className={styles.sectionTitle}>This Week's Growth</h2>

        <div className={styles.stagesContainer}>
          {displayStages.map((stage, index) => {
            const isCurrent = index === currentStageIndex;
            const isPending = index > currentStageIndex;

            return (
              <div
                key={stage}
                className={`
                  ${styles.stage}
                  ${isCurrent ? styles.stageCurrent : ''}
                  ${isPending ? styles.stageIncomplete : ''}
                `}
              >
                <span className={`${styles.stageEmoji} ${isCurrent ? styles.stageEmojiGlow : ''}`}>
                  {getStageEmoji(stage)}
                </span>
                <span className={styles.stageLabel}>{getStageName(stage)}</span>
              </div>
            );
          })}
        </div>

        <div className={styles.progressCountCard}>
          <p className={styles.progressText}>
            {currentWeekProgress.entriesCount === 0
              ? "Start journaling to grow!"
              : entriesToComplete > 0
                ? `${entriesToComplete} more ${entriesToComplete === 1 ? 'entry' : 'entries'} to hatch a butterfly!`
                : "You've completed your weekly goal! 🎉"
            }
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={styles.actionsGrid}>
        <Link to="/journal/new" className={styles.actionButtonPrimary}>
          <PenLine size={28} />
          <span>New Entry</span>
        </Link>

        <Link to="/chat" className={styles.actionButtonSecondary}>
          <Sparkles size={28} />
          <span>Chat with Flutter</span>
        </Link>
      </div>

      {/* Recent Entries Preview */}
      {entries.length > 0 && (
        <div className={styles.card}>
          <div className={styles.recentHeader}>
            <h2 className={styles.sectionTitle} style={{ marginBottom: 0 }}>
              Recent Reflections
            </h2>
            <Link to="/journal" className={styles.viewAllLink}>
              View all
            </Link>
          </div>
          <div className={styles.entriesList}>
            {entries.slice(0, 2).map(entry => (
              <div key={entry.id} className={styles.entryPreview}>
                <p className={styles.entryContent}>{entry.content}</p>
                <p className={styles.entryDate}>
                  {new Date(entry.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}