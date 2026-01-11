import { useJournalEntries } from '../hooks/useJournalEntries';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { format } from 'date-fns';
import styles from './Journal.module.css';

export function Journal() {
  const { entries, loading } = useJournalEntries();

  if (loading) {
    return (
      <div className={styles.loading}>
        Loading your reflections...
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Journal</h1>
        <Link to="/journal/new" className={styles.newButton}>
          <Plus size={20} />
          <span>New</span>
        </Link>
      </div>

      {entries.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyTitle}>No entries yet</p>
          <p className={styles.emptySubtitle}>Start your journaling journey today!</p>
          <Link to="/journal/new" className={styles.emptyButton}>
            Write your first entry
          </Link>
        </div>
      ) : (
        <div className={styles.entriesList}>
          {entries.map(entry => (
            <div key={entry.id} className={styles.entryCard}>
              <div className={styles.entryHeader}>
                <span className={styles.entryDate}>
                  {format(new Date(entry.created_at), 'EEEE, MMM d, yyyy')}
                </span>
                {entry.mood && (
                  <span className={styles.entryMood}>{entry.mood}</span>
                )}
              </div>
              <p className={styles.entryContent}>{entry.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}