import { anthropic } from "@ai-sdk/anthropic";
import { streamText, CoreMessage, tool } from "ai";
import { z } from "zod";
import { McpClient } from "@mcp-agents/utils";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Initialize MCP client
const mcpClient = new McpClient();

export async function POST(req: Request) {
  try {
    const { messages }: { messages: CoreMessage[] } = await req.json();

    // Check if API key is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({
          error:
            "API key not configured. Please set ANTHROPIC_API_KEY in your environment variables.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    const result = await streamText({
      model: anthropic("claude-3-5-sonnet-latest"),
      messages,
      system: `You are a helpful AI assistant with access to various tools. You can:
- Perform mathematical calculations (add, multiply, divide)
- Read and write files
- Make HTTP requests
- List directory contents
- Search the web for real-time information using Perplexity AI
- Search academic sources for scholarly information

When users ask for calculations, file operations, web requests, or need to search for information, use the appropriate tools to help them. After using a tool, explain the results clearly to the user.`,
      tools: {
        add: tool({
          description: "Add two numbers together",
          parameters: z.object({
            a: z.number().describe("First number"),
            b: z.number().describe("Second number"),
          }),
          execute: async ({ a, b }) => {
            const toolCall = {
              id: `call_${Date.now()}`,
              name: "add",
              arguments: { a, b },
              status: "pending" as const,
              timestamp: new Date(),
            };
            const result = await mcpClient.callTool(toolCall);
            return result.result;
          },
        }),
        multiply: tool({
          description: "Multiply two numbers",
          parameters: z.object({
            a: z.number().describe("First number"),
            b: z.number().describe("Second number"),
          }),
          execute: async ({ a, b }) => {
            const toolCall = {
              id: `call_${Date.now()}`,
              name: "multiply",
              arguments: { a, b },
              status: "pending" as const,
              timestamp: new Date(),
            };
            const result = await mcpClient.callTool(toolCall);
            return result.result;
          },
        }),
        divide: tool({
          description: "Divide two numbers",
          parameters: z.object({
            a: z.number().describe("Dividend"),
            b: z.number().describe("Divisor"),
          }),
          execute: async ({ a, b }) => {
            const toolCall = {
              id: `call_${Date.now()}`,
              name: "divide",
              arguments: { a, b },
              status: "pending" as const,
              timestamp: new Date(),
            };
            const result = await mcpClient.callTool(toolCall);

            // Handle errors from MCP client
            if (result.status === "error") {
              throw new Error(result.error || "Tool execution failed");
            }

            return result.result;
          },
        }),
        read_file: tool({
          description: "Read the contents of a file",
          parameters: z.object({
            path: z.string().describe("File path to read"),
          }),
          execute: async ({ path }) => {
            const toolCall = {
              id: `call_${Date.now()}`,
              name: "read_file",
              arguments: { path },
              status: "pending" as const,
              timestamp: new Date(),
            };
            const result = await mcpClient.callTool(toolCall);
            return result.result;
          },
        }),
        write_file: tool({
          description: "Write content to a file",
          parameters: z.object({
            path: z.string().describe("File path to write"),
            content: z.string().describe("Content to write"),
          }),
          execute: async ({ path, content }) => {
            const toolCall = {
              id: `call_${Date.now()}`,
              name: "write_file",
              arguments: { path, content },
              status: "pending" as const,
              timestamp: new Date(),
            };
            const result = await mcpClient.callTool(toolCall);
            return result.result;
          },
        }),
        list_directory: tool({
          description: "List the contents of a directory",
          parameters: z.object({
            path: z.string().describe("Directory path to list"),
          }),
          execute: async ({ path }) => {
            const toolCall = {
              id: `call_${Date.now()}`,
              name: "list_directory",
              arguments: { path },
              status: "pending" as const,
              timestamp: new Date(),
            };
            const result = await mcpClient.callTool(toolCall);
            return result.result;
          },
        }),
        get_request: tool({
          description: "Make a GET request to a URL",
          parameters: z.object({
            url: z.string().describe("URL to request"),
            headers: z
              .record(z.string())
              .optional()
              .describe("Optional headers"),
          }),
          execute: async ({ url, headers }) => {
            const toolCall = {
              id: `call_${Date.now()}`,
              name: "get_request",
              arguments: { url, headers },
              status: "pending" as const,
              timestamp: new Date(),
            };
            const result = await mcpClient.callTool(toolCall);
            return result.result;
          },
        }),
        post_request: tool({
          description: "Make a POST request to a URL",
          parameters: z.object({
            url: z.string().describe("URL to request"),
            data: z.record(z.any()).optional().describe("Data to send"),
            headers: z
              .record(z.string())
              .optional()
              .describe("Optional headers"),
          }),
          execute: async ({ url, data, headers }) => {
            const toolCall = {
              id: `call_${Date.now()}`,
              name: "post_request",
              arguments: { url, data, headers },
              status: "pending" as const,
              timestamp: new Date(),
            };
            const result = await mcpClient.callTool(toolCall);

            // Handle errors from MCP client
            return result.result;
          },
        }),
        search: tool({
          description:
            "Search the web using Perplexity AI for real-time, accurate information",
          parameters: z.object({
            query: z
              .string()
              .describe("The search query to find information about"),
            model: z
              .enum(["sonar-pro", "sonar-reasoning", "sonar"])
              .optional()
              .describe("Model to use"),
            search_domain_filter: z
              .array(z.string())
              .optional()
              .describe("List of domains to search within"),
            search_recency_filter: z
              .enum(["month", "week", "day", "hour"])
              .optional()
              .describe("Filter by recency"),
            return_images: z
              .boolean()
              .optional()
              .describe("Whether to return relevant images"),
            return_related_questions: z
              .boolean()
              .optional()
              .describe("Whether to return related questions"),
            max_tokens: z
              .number()
              .optional()
              .describe("Maximum tokens in response"),
            temperature: z
              .number()
              .min(0)
              .max(2)
              .optional()
              .describe("Temperature for response generation"),
          }),
          execute: async ({
            query,
            model,
            search_domain_filter,
            search_recency_filter,
            return_images,
            return_related_questions,
            max_tokens,
            temperature,
          }) => {
            const toolCall = {
              id: `call_${Date.now()}`,
              name: "search",
              arguments: {
                query,
                model,
                search_domain_filter,
                search_recency_filter,
                return_images,
                return_related_questions,
                max_tokens,
                temperature,
              },
              status: "pending" as const,
              timestamp: new Date(),
            };
            const result = await mcpClient.callTool(toolCall);

            // Handle errors from MCP client
            if (result.status === "error") {
              throw new Error(result.error || "Tool execution failed");
            }

            return result.result;
          },
        }),
        academic_search: tool({
          description:
            "Search academic sources using Perplexity AI for scholarly information",
          parameters: z.object({
            query: z.string().describe("The academic search query"),
            max_tokens: z
              .number()
              .optional()
              .describe("Maximum tokens in response"),
            return_related_questions: z
              .boolean()
              .optional()
              .describe("Whether to return related academic questions"),
          }),
          execute: async ({ query, max_tokens, return_related_questions }) => {
            const toolCall = {
              id: `call_${Date.now()}`,
              name: "academic_search",
              arguments: { query, max_tokens, return_related_questions },
              status: "pending" as const,
              timestamp: new Date(),
            };
            const result = await mcpClient.callTool(toolCall);

            // Handle errors from MCP client
            if (result.status === "error") {
              throw new Error(result.error || "Tool execution failed");
            }

            return result.result;
          },
        }),
      },
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
