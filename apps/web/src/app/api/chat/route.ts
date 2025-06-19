import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Check if API key is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ 
          error: 'API key not configured. Please set ANTHROPIC_API_KEY in your environment variables.' 
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const result = await streamText({
      model: anthropic('claude-3-5-sonnet-20241022'),
      messages,
      system: 'You are a helpful AI assistant built with the Vercel AI SDK.',
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'An error occurred while processing your request.' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 