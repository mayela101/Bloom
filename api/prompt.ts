import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req. method !== 'POST') {
    return new Response('Method not allowed', { status:  405 });
  }

  try {
    const { recentEntries, userName } = await req. json();

    const contextMessage = recentEntries?. length
      ? `Generate a short, warm journaling prompt.  The user recently wrote about:  ${recentEntries.slice(0, 2).join('; ')}. Ask a simple follow-up question. `
      : `Generate a short, warm journaling prompt for someone who might have blank page anxiety. Make it easy to answer.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 100,
      system:  `You are Flutter, a warm journaling companion butterfly. Keep prompts to 1-2 sentences.  No markdown. `,
      messages: [
        {
          role: 'user',
          content:  contextMessage,
        },
      ],
    });

    const textBlock = response. content.find(block => block.type === 'text');
    const prompt = textBlock?.type === 'text' 
      ? textBlock.text. replace(/\*\*/g, '').replace(/\*/g, '').trim()
      : "What's on your mind today? 🦋";

    return new Response(JSON.stringify({ prompt }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Prompt error:', error);
    return new Response(JSON.stringify({ 
      prompt: "What's on your mind today? 🦋" 
    }), {
      headers:  { 'Content-Type': 'application/json' },
    });
  }
}