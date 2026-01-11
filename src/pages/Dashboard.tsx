import { useMemo, useEffect } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Minus, Shuffle, Sparkles, TreeDeciduous, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useJournalEntries } from '../hooks/useJournalEntries';
import { userAnalyzeEntries } from '../hooks/userAnalyzeEntries';
import { useCompletedWeeks } from '../hooks/useCompletedWeeks';
import { useProfile } from '../hooks/userProfile';
import { useInsights } from '../hooks/useInsights';
import { ButterflyTree } from '../components/butterfly/ButterflyTree';
import { format, startOfDay, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import styles from './Dashboard.module.css';
import { WeeklyMoodChart } from '../components/charts/WeeklyMoodChart';

export function Dashboard() {
  const { entries, refresh } = useJournalEntries();
  const { profile } = useProfile();
  const weeklyGoal = profile?.weekly_goal || 4;
  const { analyzeAllEntries, analyzing, progress } = userAnalyzeEntries();
  const { completedWeeks, totalButterflies, syncCompletedWeeks } = useCompletedWeeks();

  // Filter entries 
  const currentWeekEntries = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 0 }); // Sunday
    const weekEnd = endOfWeek(now, { weekStartsOn:  0 });

    return entries.filter(entry =>
      isWithinInterval(new Date(entry.created_at), { start: weekStart, end: weekEnd })
    );
  }, [entries]);

  // Use current week entries for insights
  const { insights, loading: insightsLoading } = useInsights(currentWeekEntries, profile?.display_name || undefined);

  // Sync completed weeks 
  useEffect(() => {
    if (entries.length > 0) {
      console.log('Syncing completed weeks with', entries.length, 'entries and goal of', weeklyGoal);
      syncCompletedWeeks(entries, weeklyGoal);
    }
  }, [entries. length, weeklyGoal]);

  // Calculate sentiment stats 
  const sentimentStats = useMemo(() => {
    if (currentWeekEntries. length === 0) return null;

    const analyzed = currentWeekEntries. filter(e => e.sentiment_score !== null && e.sentiment_score !== undefined);
    if (analyzed.length === 0) return null;

    const positive = analyzed.filter(e => (e.sentiment_score || 0) > 0.2).length;
    const negative = analyzed. filter(e => (e.sentiment_score || 0) < -0.2).length;
    const neutral = analyzed.length - positive - negative;
    const average = analyzed.reduce((sum, e) => sum + (e.sentiment_score || 0), 0) / analyzed.length;

    return { positive, negative, neutral, average, total: analyzed.length };
  }, [currentWeekEntries]);

  // Calculate weekly data for line chart
  const weeklyData = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 0 }); // Sunday
    const days = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      const dayStart = startOfDay(date);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const dayEntries = currentWeekEntries. filter(entry =>
        isWithinInterval(new Date(entry.created_at), { start: dayStart, end: dayEnd })
      );

      const avgSentiment = dayEntries.length > 0
        ? dayEntries.reduce((sum, e) => sum + (e.sentiment_score || 0), 0) / dayEntries.length
        : null;

      days. push({
        date,
        label: format(date, 'EEE'),
        entries: dayEntries. length,
        sentiment: avgSentiment,
        isToday: format(date, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd'),
        isFuture: date > now,
      });
    }
    return days;
  }, [currentWeekEntries]);

  const handleAnalyze = async () => {
    try {
      const result = await analyzeAllEntries();
      alert(`Analyzed ${result.analyzed} entries!  🦋`);
      refresh();
    } catch (error) {
      console.error('Analysis failed:', error);
    }
  };

  const getMoodEmoji = (score:  number) => {
    if (score > 0.3) return '😊';
    if (score > 0) return '🙂';
    if (score > -0.3) return '😐';
    return '😔';
  };

  const getMoodLabel = (score: number) => {
    if (score > 0.3) return 'Great';
    if (score > 0) return 'Good';
    if (score > -0.3) return 'Okay';
    return 'Low';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':  return <TrendingUp size={16} />;
      case 'declining': return <TrendingDown size={16} />;
      case 'mixed':  return <Shuffle size={16} />;
      default: return <Minus size={16} />;
    }
  };

  const getTrendLabel = (trend: string) => {
    if (trend === 'declining') return 'Needs Care';
    return trend. charAt(0).toUpperCase() + trend.slice(1);
  };

 
  const weekRangeLabel = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 0 });
    return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d')}`;
  }, []);

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Insights</h1>
        </div>
        <button
          onClick={handleAnalyze}
          disabled={analyzing}
          className={styles. analyzeButton}
        >
          {analyzing ? 'Analyzing...' : 'Analyze'}
        </button>
      </div>

      {/* Analysis Progress */}
      {analyzing && (
        <div className={styles. card}>
          <p>Analyzing your entries with Claude...</p>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${(progress. current / progress.total) * 100}%` }}
            />
          </div>
          <p className={styles.progressText}>
            {progress.current} / {progress.total}
          </p>
        </div>
      )}

      {/* Progress Tree*/}
      <div className={styles.card}>
        <div className={styles.cardTitle}>
          <TreeDeciduous size={18} />
          Your Butterfly Garden
          <span className={styles.butterflyCount}>
            {totalButterflies} 🦋
          </span>
        </div>
        <ButterflyTree completedWeeks={completedWeeks} />
      </div>

      {/* Current week content */}
      {currentWeekEntries.length === 0 ? (
        <div className={styles.card}>
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📝</div>
            <p className={styles.emptyText}>No entries this week yet</p>
            <p className={styles.emptySubtext}>
              Start journaling to see your weekly insights!
            </p>
          </div>
        </div>
      ) : (
        
        <>
        <div className={styles.subHeader}>
        <div>
          <h1 className={styles.weekTitle}>This Week</h1>
          <p className={styles.weekLabel}>{weekRangeLabel}</p>
        </div>
      </div>
          {/* Average Mood - CURRENT WEEK */}
          {sentimentStats && (
            <div className={styles.card}>
              <div className={styles.cardTitle}>
                <TrendingUp size={18} />
                Overall Mood
              </div>
              <div className={styles.averageMood}>
                <span style={{ fontSize: '2rem' }}>
                  {getMoodEmoji(sentimentStats. average)}
                </span>
                <div className={styles.moodMeter}>
                  <div
                    className={styles.moodIndicator}
                    style={{
                      left: `${((sentimentStats.average + 1) / 2) * 100}%`,
                    }}
                  />
                </div>
                <div className={styles.moodValue}>
                  {getMoodLabel(sentimentStats.average)}
                </div>
              </div>
            </div>
          )}

          {/* Mood Breakdown - CURRENT WEEK */}
          {sentimentStats && (
            <div className={styles.card}>
              <div className={styles.cardTitle}>
                <BarChart3 size={18} />
                Mood Breakdown
              </div>
              <div className={styles.moodOverview}>
                <div className={`${styles.moodStat} ${styles.moodStatPositive}`}>
                  <div className={styles.moodEmoji}>😊</div>
                  <div className={styles.moodCount}>{sentimentStats. positive}</div>
                  <div className={styles.moodLabel}>Positive</div>
                </div>
                <div className={`${styles.moodStat} ${styles.moodStatNeutral}`}>
                  <div className={styles.moodEmoji}>😐</div>
                  <div className={styles.moodCount}>{sentimentStats. neutral}</div>
                  <div className={styles.moodLabel}>Neutral</div>
                </div>
                <div className={`${styles.moodStat} ${styles. moodStatNegative}`}>
                  <div className={styles.moodEmoji}>😔</div>
                  <div className={styles.moodCount}>{sentimentStats. negative}</div>
                  <div className={styles.moodLabel}>Difficult</div>
                </div>
              </div>
            </div>
          )}

          {/* 🦋 FLUTTER'S INSIGHTS - CURRENT WEEK */}
          <div className={styles. card}>
            <div className={styles. cardTitle}>
              <Sparkles size={18} />
              Flutter's Insights
            </div>

            {insightsLoading ?  (
              <p className={styles.insightsLoading}>Flutter is analyzing your week...  🦋</p>
            ) : insights ?  (
              <div className={styles.flutterInsights}>
                {/* Mood Trend Badge */}
                <div className={`${styles.moodTrendBadge} ${styles[insights.moodTrend]}`}>
                  {getTrendIcon(insights. moodTrend)}
                  <span>{getTrendLabel(insights.moodTrend)}</span>
                </div>

                {/* Summary */}
                <p className={styles.insightSummary}>{insights.summary}</p>

                {/* Suggestion */}
                <div className={styles.suggestionBox}>
                  <p>{insights.suggestion}</p>
                </div>

                {/* Chat CTA if mood is declining */}
                {insights.moodTrend === 'declining' && (
                  <Link to="/chat" className={styles.chatLink}>
                    <MessageCircle size={16} />
                    <span>Chat with Flutter for support</span>
                  </Link>
                )}
              </div>
            ) : null}
          </div>

          {/* Weekly Line Chart - CURRENT WEEK (Sun-Sat) */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>
              <Sparkles size={18} />
              This Week's Journey
            </div>
            <WeeklyMoodChart data={weeklyData} />
          </div>
        </>
      )}
    </div>
  );
}