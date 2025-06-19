import { google } from "@ai-sdk/google";
import { experimental_createMCPClient, streamText, type ToolSet } from "ai";
import { Experimental_StdioMCPTransport } from "ai/mcp-stdio";
import path from 'path';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Define MCP server configurations
const mcpServerConfigs = [
  { name: 'math', command: 'node', args: [path.resolve(process.cwd(), '../../servers/math-mcp/dist/index.js')] },
  { name: 'api-client', command: 'node', args: [path.resolve(process.cwd(), '../../servers/api-client-mcp/dist/index.js')] },
  {
    name: 'perplexity',
    command: 'node',
    args: [path.resolve(process.cwd(), '../../servers/perplexity-mcp/dist/index.js')],
    env: { PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY ?? '' },
  },
];

type MCPClient = Awaited<ReturnType<typeof experimental_createMCPClient>>;

export async function POST(req: Request) {
  const clients: MCPClient[] = [];

  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: 'Messages array is required' }, { status: 400 });
    }
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return Response.json({ error: 'Google API key not configured' }, { status: 500 });
    }
    
    // 1. Create all MCP clients
    for (const config of mcpServerConfigs) {
      const transport = new Experimental_StdioMCPTransport({
        command: config.command,
        args: config.args,
        env: config.env as Record<string, string> | undefined,
      });
      clients.push(await experimental_createMCPClient({ transport }));
    }
    
    // 2. Get tools from all clients
    const allTools: ToolSet = {};
    const toolPromises = clients.map(client => client.tools());
    const toolSets = await Promise.all(toolPromises);
    toolSets.forEach(toolSet => Object.assign(allTools, toolSet));
    
    console.log(`[CHAT] Starting request with ${Object.keys(allTools).length} tools available.`);

    // 3. Stream text with AI model and tools
    const result = await streamText({
      model: google('gemini-1.5-flash-latest'),
      messages,
      tools: allTools,
      system: `You have access to a variety of tools. Use them when necessary to fulfill the user's request. Available tool categories are: math, file management, API requests, and web search.`,
      onFinish: async () => {
        console.log('[CHAT] Stream finished, closing clients.');
        await Promise.all(clients.map(c => c.close()));
      },
      onError: async (e) => {
        console.error('[CHAT] Stream error:', e);
        await Promise.all(clients.map(c => c.close()));
      }
    });

    return result.toDataStreamResponse();

  } catch (error) {
    console.error("Chat API error:", error);
    // Ensure clients are closed even if setup fails
    await Promise.all(clients.map(c => c.close()));
    return new Response(JSON.stringify({ error: "An error occurred while processing your request." }), { status: 500 });
  }
}
