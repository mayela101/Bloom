import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process. env.ANTHROPIC_API_KEY,
});

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { entries, userName } = await req.json();

    if (!entries || entries. length === 0) {
      return new Response(JSON.stringify({
        summary: "Start journaling to unlock personalized insights! ",
        suggestion: "Write your first entry and I'll help you discover patterns.  🦋",
        moodTrend: 'stable',
      }), {
        headers:  { 'Content-Type': 'application/json' },
      });
    }

    const recentEntries = entries.slice(0, 7).map((e:  any) => ({
      content: e.content. slice(0, 300),
      mood: e.mood || 'unknown',
      sentiment: e.sentiment_score || 0,
      date: new Date(e.created_at).toLocaleDateString('en-US', { 
        weekday: 'short', month: 'short', day: 'numeric' 
      }),
    }));

    const response = await anthropic.messages. create({
      model: 'claude-sonnet-4-20250514',
      max_tokens:  300,
      system: `You are Flutter, a warm and empathetic journaling companion butterfly.  🦋

${userName ? `The user's name is ${userName}. Use it occasionally. ` : ''}

RULES:
- Be warm, supportive, non-judgmental
- If someone seems down, suggest breathing exercises, hobbies, or chatting with you
- Keep responses short and actionable
- NO markdown, asterisks, or bullet points
- Summary:  1-2 sentences max
- Suggestion: 2-3 sentences max`,
      messages: [
        {
          role: 'user',
          content:  `Analyze these journal entries: 

${JSON.stringify(recentEntries, null, 2)}

Respond with ONLY valid JSON:
{
  "summary": "<1-2 sentence summary of how user has been feeling>",
  "suggestion": "<2-3 sentence caring suggestion>",
  "moodTrend": "<improving | stable | declining | mixed>"
}`,
        },
      ],
    });

    const textBlock = response. content.find(block => block.type === 'text');
    if (textBlock?.type === 'text') {
      return new Response(textBlock.text, {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    throw new Error('No response');
  } catch (error) {
    console. error('Insights error:', error);
    return new Response(JSON.stringify({
      summary: "You've been journaling consistently.",
      suggestion: "Keep reflecting on your thoughts.  I'm here if you want to chat!  🦋",
      moodTrend: 'stable',
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
}