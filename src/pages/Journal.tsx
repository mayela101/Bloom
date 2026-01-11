import { useState, useMemo, useEffect } from 'react';
import { useJournalEntries } from '../hooks/useJournalEntries';
import { Link } from 'react-router-dom';
import { Plus, X } from 'lucide-react';
import { format } from 'date-fns';
import styles from './Journal.module.css';

export function Journal() {
  const { entries, loading } = useJournalEntries();

  // Search state
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce the user's typing to avoid filtering on every keystroke
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 250);
    return () => clearTimeout(t);
  }, [query]);

  // Filter entries client-side by content, mood, themes, triggers, or date
  const filteredEntries = useMemo(() => {
    if (!debouncedQuery) return entries;
    const q = debouncedQuery.toLowerCase();

    return entries.filter((e) => {
      const content = (e.content || '').toLowerCase();
      const mood = (e.mood || '').toLowerCase();
      const themes = Array.isArray(e.themes) ? e.themes.join(' ').toLowerCase() : '';
      const triggers = Array.isArray(e.triggers) ? e.triggers.join(' ').toLowerCase() : '';
      const dateText = format(new Date(e.created_at), 'EEEE, MMM d, yyyy').toLowerCase();

      return (
        content.includes(q) ||
        mood.includes(q) ||
        themes.includes(q) ||
        triggers.includes(q) ||
        dateText.includes(q)
      );
    });
  }, [entries, debouncedQuery]);

  const clearSearch = () => {
    setQuery('');
    setDebouncedQuery('');
  };

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
        <div className={styles.titleRow}>
          <h1 className={styles.title}>Journal</h1>


        </div>

        <Link to="/journal/new" className={styles.newButton}>
          <Plus size={20} />
          <span>New</span>
        </Link>
      </div>

      {/* Search input */}
        <div className={styles.searchWrap}>
          <input
              aria-label="Search journal entries"
              className={styles.searchInput}
              type="search"
              placeholder="Search entries, moods, themes, dates..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
                aria-label="Clear search"
                className={styles.clearButton}
                onClick={clearSearch}
              >
                <X size={14} />
            </button>
          )}
        </div>
      {/* Result count */}
      {debouncedQuery ? (
        <div className={styles.resultCount}>
          Showing {filteredEntries.length} result{filteredEntries.length !== 1 ? 's' : ''} for “{debouncedQuery}”
        </div>
      ) : null}

      {filteredEntries.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyTitle}>
            {debouncedQuery ? 'No results' : 'No entries yet'}
          </p>
          <p className={styles.emptySubtitle}>
            {debouncedQuery
              ? 'Try another search term or clear the filter.'
              : 'Start your journaling journey today!'}
          </p>
          <Link to="/journal/new" className={styles.emptyButton}>
            Write your first entry
          </Link>
        </div>
      ) : (
        <div className={styles.entriesList}>
          {filteredEntries.map(entry => (
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