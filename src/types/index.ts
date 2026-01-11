export interface JournalEntry {
  id: string;
  user_id: string;
  content: string;
  mood?:  Mood;
  sentiment_score?: number;
  themes?: string[];
  triggers?: string[];  // NEW
  intensity?: 'low' | 'moderate' | 'high';  // NEW
  created_at: string;
  updated_at: string;
}

// Moods
export type Mood = 'great' | 'good' | 'okay' | 'low' | 'difficult';

export type ButterflyStage =
  | 'empty'
  | 'egg'
  | 'growth1'
  | 'caterpillar'
  | 'growth'
  | 'chrysalis'
  | 'metamorphosis'
  | 'butterfly';

export interface WeekProgress {
  weekStart: string;
  entriesCount: number;
  stage: ButterflyStage;
  completed: boolean;
  butterflyColor?:  string;
}

// User Preferences
export interface UserPreferences {
  weeklyGoal: number; // 1-7 
  reminderTime?:  string;
  theme:  'light' | 'dark' | 'auto';
}

// AI-Chat
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp:  string;
}

export interface SentimentAnalysis {
  score: number; // -1 to 1
  label: 'positive' | 'neutral' | 'negative';
  themes:  string[];
}