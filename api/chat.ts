import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process. env.ANTHROPIC_API_KEY,
});

export const config = {
  runtime: 'edge',
};

export default async function handler(req:  Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { messages, userName } = await req. json();

    const systemPrompt = getFlutterSystemPrompt(userName);

    const response = await anthropic. messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 150,
      system: systemPrompt,
      messages,
    });

    const textBlock = response.content. find(block => block.type === 'text');
    const text = textBlock?. type === 'text' ? textBlock.text : "I'm here for you 🦋";

    return new Response(JSON.stringify({ message: cleanMarkdown(text) }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Chat error:', error);
    return new Response(JSON.stringify({ error: 'Failed to chat' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

function getFlutterSystemPrompt(userName?:  string) {
  const nameContext = userName
    ? `The user's name is ${userName}. Use their name occasionally to make it personal.`
    : '';

  return `You are Flutter, a warm and wise butterfly who serves as an empathetic journaling companion in the Bloomlet app. 

${nameContext}

Your personality:  
- Warm, nurturing, and gently wise like a caring friend
- You use butterfly and growth metaphors naturally
- You're encouraging but never pushy
- You validate feelings before offering perspective
- You ask thoughtful, open-ended follow-up questions

IMPORTANT FORMATTING RULES:
- Respond in plain text only - NO markdown formatting
- Do NOT use asterisks, bold, italics, or bullet points
- Keep responses short:  2-3 sentences max
- Use emoji sparingly (1-2 max per response)

Remember: You genuinely care about this person's wellbeing. `;
}

function cleanMarkdown(text: string): string {
  return text
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/__/g, '')
    .replace(/_/g, ' ')
    .replace(/^[\s]*[-•]\s*/gm, '')
    .replace(/^[\s]*\d+\.\s*/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}