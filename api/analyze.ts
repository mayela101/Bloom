import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env. ANTHROPIC_API_KEY,
});

export const config = {
  runtime:  'edge',
};

export default async function handler(req:  Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { content } = await req.json();

    const response = await anthropic. messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 250,
      messages: [
        {
          role: 'user',
          content:  `Analyze this journal entry for emotional content.  

Journal Entry: 
"${content}"

Detect these specific triggers if present:
- stress/overwhelm
- anxiety/worry
- loneliness/isolation
- sadness/grief
- anger/frustration
- exhaustion/burnout
- self-criticism
- relationship issues
- work/school pressure

Respond with ONLY valid JSON (no other text):
{
  "sentiment": "positive" or "neutral" or "negative",
  "sentimentScore": <number from -1. 0 to 1.0>,
  "themes": ["theme1", "theme2"],
  "triggers":  ["trigger1", "trigger2"],
  "intensity":  "low" or "moderate" or "high",
  "summary": "<one sentence summary>"
}`,
        },
      ],
    });

    const textBlock = response.content.find(block => block.type === 'text');
    if (textBlock?. type === 'text') {
      const result = JSON.parse(textBlock.text);
      return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    throw new Error('No response');
  } catch (error) {
    console.error('Analysis error:', error);
    return new Response(JSON.stringify(fallbackAnalysis()), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

function fallbackAnalysis() {
  return {
    sentiment: 'neutral',
    sentimentScore: 0,
    themes: ['reflection'],
    triggers: [],
    intensity: 'low',
    summary: 'Entry recorded',
  };
}