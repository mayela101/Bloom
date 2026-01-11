import { ButterflyStage } from '../types';

export type ProgressStage = 'empty' | ButterflyStage;

// Get stages based on user's goal
export function getStagesForGoal(goal: number): ButterflyStage[] {
  if (goal <= 2) {
    return ['egg', 'butterfly'];
  } else if (goal === 3) {
    return ['egg', 'caterpillar', 'butterfly'];
  } else if (goal === 4) {
    return ['egg', 'caterpillar', 'chrysalis', 'butterfly'];
  } else if (goal === 5) {
    return ['egg', 'growth1', 'caterpillar', 'chrysalis', 'butterfly'];
  } else if (goal === 6) {
    return ['egg', 'growth1', 'caterpillar', 'chrysalis', 'metamorphosis', 'butterfly'];
  } else {
    return ['egg', 'growth1', 'caterpillar', 'growth', 'chrysalis', 'metamorphosis', 'butterfly'];
  }
}

//Stage tracking progress
export function getStageFromEntries(count: number, goal:  number): ProgressStage {
  if (count === 0) return 'empty';
  if (count >= goal) return 'butterfly';

  const stages = getStagesForGoal(goal);
  const stageIndex = Math.min(count - 1, stages. length - 2); // -2 : butterfly is always final stage

  return stages[stageIndex];
}

export function getStageEmoji(stage: ProgressStage): string {
  const emojis:  Record<ProgressStage, string> = {
    empty: ' ',  
    egg:  '🥚',
    growth1: '🌱',
    caterpillar: '🐛',
    growth: '🌿',
    chrysalis: '🐚',
    metamorphosis: '✨',
    butterfly: '🦋',
  };
  return emojis[stage];
}

export function getStageName(stage:  ProgressStage): string {
  const names: Record<ProgressStage, string> = {
    empty: 'Start',
    egg:  'Egg',
    growth1: 'Sprout',
    caterpillar: 'Caterpillar',
    growth:  'Growing',
    chrysalis: 'Chrysalis',
    metamorphosis: 'Transform',
    butterfly: 'Butterfly',
  };
  return names[stage];
}

export function getflutterMessage(stage: ProgressStage, isNewEntry: boolean): string {
  if (! isNewEntry) {
    return "Ready to reflect today?  🦋";
  }

  const messages: Record<ProgressStage, string> = {
    empty: "Ready to start your journey?  🦋",
    egg: "A beautiful beginning! Your egg is nestled safely.  🥚",
    growth1: "Look!  Something's starting to grow! 🌱",
    caterpillar:  "Your little caterpillar is munching away happily!  🐛",
    growth: "Growing stronger every day! 🌿",
    chrysalis: "Transformation in progress...  Something magical is happening! 🫛",
    metamorphosis: "Almost there! The magic is happening! ✨",
    butterfly: "You did it! A beautiful butterfly has emerged! 🦋",
  };
  return messages[stage];
}

export const BUTTERFLY_COLORS = [
  '#FFB6C1',
  '#E6E6FA',
  '#98FB98',
  '#FFDAB9',
  '#87CEEB',
  '#DDA0DD',
  '#F0E68C',
  '#E0BBE4',
];

export function getButterflyColor(weekIndex: number): string {
  return BUTTERFLY_COLORS[weekIndex % BUTTERFLY_COLORS. length];
}