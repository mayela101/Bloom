// No more Anthropic import - API calls go through backend! 

const API_BASE = '/api';



// Flutter's personality (used for fallbacks only)
export const getFlutterSystemPrompt = (_userName?: string) => {
  return `You are Flutter, a warm journaling companion butterfly. 🦋`;
};

// Generate a journaling prompt
export async function generateJournalPrompt(
  recentEntries?:  string[],
  userName?: string
): Promise<string> {
  try {
    const response = await fetch(`${API_BASE}/prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recentEntries, userName }),
    });

    if (!response.ok) throw new Error('API error');

    const data = await response.json();
    return data.prompt;
  } catch (error) {
    console. error('Failed to generate prompt:', error);
    const fallbacks = [
      "What's one small thing that made you smile today?  🦋",
      "What's on your mind right now? ",
      "What are you grateful for in this moment?",
      "How did you take care of yourself today?",
    ];
    return fallbacks[Math. floor(Math.random() * fallbacks.length)];
  }
}

// Chat with Flutter
export async function chatWithFlutter(
  messages: { role: 'user' | 'assistant'; content: string }[],
  userName?: string
): Promise<string> {
  try {
    const response = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, userName }),
    });

    if (!response.ok) throw new Error('API error');

    const data = await response.json();
    return data. message;
  } catch (error) {
    console.error('Failed to chat:', error);
    return "I'm having a moment, but I'm still here for you! Could you try again? 🦋";
  }
}

// Analyze sentiment and themes
export async function analyzeEntry(content: string): Promise<{
  sentiment: 'positive' | 'neutral' | 'negative';
  sentimentScore: number;
  themes: string[];
  triggers: string[];
  intensity:  'low' | 'moderate' | 'high';
  summary: string;
}> {
  try {
    const response = await fetch(`${API_BASE}/analyze`, {
      method: 'POST',
      headers:  { 'Content-Type': 'application/json' },
      body: JSON. stringify({ content }),
    });

    if (!response.ok) throw new Error('API error');

    return await response.json();
  } catch (error) {
    console.error('Analysis failed:', error);
    return fallbackAnalysis(content);
  }
}

function fallbackAnalysis(content: string) {
  const lowerContent = content. toLowerCase();

  const positiveWords = ['happy', 'grateful', 'excited', 'love', 'great', 'amazing'];
  const negativeWords = ['sad', 'angry', 'frustrated', 'anxious', 'stressed', 'worried'];

  const positiveCount = positiveWords.filter(w => lowerContent. includes(w)).length;
  const negativeCount = negativeWords.filter(w => lowerContent. includes(w)).length;

  let sentiment:  'positive' | 'neutral' | 'negative' = 'neutral';
  let sentimentScore = 0;

  if (positiveCount > negativeCount) {
    sentiment = 'positive';
    sentimentScore = Math.min(positiveCount * 0.2, 1);
  } else if (negativeCount > positiveCount) {
    sentiment = 'negative';
    sentimentScore = Math.max(negativeCount * -0.2, -1);
  }

  return {
    sentiment,
    sentimentScore,
    themes: ['reflection'],
    triggers: [],
    intensity: 'low' as const,
    summary: content. slice(0, 100),
  };
}

// Generate insights
export async function generateInsights(
  entries: { content: string; mood?:  string; sentiment_score?: number; created_at: string }[],
  userName?: string
): Promise<{
  summary: string;
  suggestion: string;
  moodTrend: 'improving' | 'stable' | 'declining' | 'mixed';
}> {
  try {
    const response = await fetch(`${API_BASE}/insights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body:  JSON.stringify({ entries, userName }),
    });

    if (!response.ok) throw new Error('API error');

    return await response.json();
  } catch (error) {
    console.error('Failed to generate insights:', error);
    return {
      summary: "You've been journaling consistently.",
      suggestion: "Keep reflecting on your thoughts. I'm here if you want to chat! 🦋",
      moodTrend:  'stable',
    };
  }
}

export const isClaudeConfigured = () => true; // Always true now - backend handles it

// Backward compatibility
export const chatWithflutter = chatWithFlutter;
export const getflutterSystemPrompt = getFlutterSystemPrompt;
export const flutter_SYSTEM_PROMPT = getFlutterSystemPrompt();