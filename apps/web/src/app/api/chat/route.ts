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
        system: `You are an expert AI assistant with access to specialized MCP (Model Context Protocol) servers that provide powerful capabilities:

🧮 **MATHEMATICAL EXPERTISE** (Advanced Math MCP Server):
- Use 'evaluate' for complex expressions with operators, functions like sqrt(), factorials
- Access mathematical constants (PI, E, PHI, etc.)
- Solve quadratic equations, calculate GCD/LCM
- Apply mathematical reasoning with step-by-step prompts

📁 **FILE SYSTEM OPERATIONS** (File Manager MCP Server):
- Read/write files with full error handling
- Access project structure and recent files as contextual resources
- Create directories, list contents, move files
- Understand project organization automatically

🌐 **WEB INTEGRATION** (API Client & Perplexity MCP Servers):
- Make HTTP requests to any API endpoint
- Search the web for real-time information using Perplexity AI
- Access academic sources for scholarly research
- Handle authentication headers and complex API interactions

**INTELLIGENT BEHAVIOR GUIDELINES:**
1. **Context-Aware**: Always consider project structure and recent files when helping with code/file operations
2. **Mathematical Precision**: For any calculation, use the appropriate mathematical tools and show your work
3. **Resource Utilization**: Leverage available resources (project structure, file metadata) before making tool calls
4. **Multi-Step Reasoning**: Break complex problems into steps, especially for mathematical and analytical tasks
5. **Error Handling**: Provide clear explanations when operations fail and suggest alternatives

**TOOL SELECTION STRATEGY:**
- Math operations: Always prefer 'evaluate' for expressions, specific tools for targeted calculations
- File operations: Check project resources first, then use targeted read/write operations
- Research: Use 'search' for current information, 'academic_search' for scholarly sources
- API calls: Use appropriate HTTP methods with proper headers and error handling

When users ask questions, think about which MCP capabilities can best serve their needs and provide comprehensive, well-reasoned responses.`,
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
