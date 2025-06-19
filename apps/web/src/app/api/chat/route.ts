import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { withMCPTools } from "@mcp-agents/utils/mcp-client";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Check if API key is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      return Response.json(
        { error: "Anthropic API key not configured" },
        { status: 500 },
      );
    }

    // Use the AI SDK MCP integration with proper resource management
    const result = await withMCPTools(async (tools) => {
      return streamText({
        model: anthropic("claude-3-5-sonnet-latest"),
        messages,
        system: `You are a helpful AI assistant with access to various tools. You can:
              - Perform mathematical calculations. Use 'evaluate' for complex expressions.
              - Read and write files
              - Make HTTP requests
              - List directory contents
              - Search the web for real-time information using Perplexity AI
              - Search academic sources for scholarly information

      When users ask for calculations, file operations, web requests, or need to search 
      for information, use the appropriate tools to help them. For complex math, use the 'evaluate' tool. After using a tool, explain 
      the results clearly to the user.`,
        tools,
      });
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({
        error: "An error occurred while processing your request.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
