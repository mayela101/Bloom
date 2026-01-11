import { useMemo } from 'react';
import { JournalEntry, WeekProgress, ButterflyStage } from '../types';
import { startOfWeek, isWithinInterval, endOfWeek, startOfDay } from 'date-fns';
import { getButterflyColor, getStagesForGoal } from '../utils/butterfly';

export function useWeekProgress(entries: JournalEntry[], weeklyGoal: number = 4) {
  const stages = useMemo(() => getStagesForGoal(weeklyGoal), [weeklyGoal]);

  const currentWeekProgress = useMemo((): WeekProgress => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 0 });

    // Get entries from this week
    const thisWeekEntries = entries.filter(entry =>
      isWithinInterval(new Date(entry.created_at), { start: weekStart, end: weekEnd })
    );

    // Count UNIQUE DAYS with entries (not total entries!)
    const uniqueDays = new Set(
      thisWeekEntries.map(entry => 
        startOfDay(new Date(entry.created_at)).toISOString()
      )
    );
    const count = uniqueDays. size;

    // Calculate stage based on unique days count
    let stage:  ButterflyStage;

    if (count === 0) {
      stage = 'empty';
    } else if (count >= weeklyGoal) {
      stage = 'butterfly';
    } else {
      const stageIndex = Math. min(count - 1, stages. length - 2);
      stage = stages[stageIndex];
    }

    return {
      weekStart:  weekStart.toISOString(),
      entriesCount: count, // This now represents unique DAYS
      stage,
      completed: count >= weeklyGoal,
      butterflyColor: count >= weeklyGoal ? getButterflyColor(0) : undefined,
    };
  }, [entries, weeklyGoal, stages]);

  const entriesToNextStage = useMemo(() => {
    const { stage } = currentWeekProgress;
    if (stage === 'butterfly') return 0;
    return 1;
  }, [currentWeekProgress]);

  const entriesToComplete = useMemo(() => {
    return Math.max(weeklyGoal - currentWeekProgress.entriesCount, 0);
  }, [currentWeekProgress, weeklyGoal]);

  return {
    currentWeekProgress,
    entriesToNextStage,
    entriesToComplete,
    weeklyGoal,
    stages,
  };
}