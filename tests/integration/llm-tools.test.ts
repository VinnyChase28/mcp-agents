import { describe, it, expect, beforeAll } from "vitest";
import type { Message, ToolCall } from "ai";

/**
 * Integration Tests for Real LLM + MCP Tools Flow
 *
 * These tests use:
 * - Real Anthropic API key
 * - Real AI SDK tool calling via Next.js API routes
 * - MCP client tool execution
 * - Non-streaming responses for efficient testing
 */

const API_BASE = "http://localhost:3000";
const CHAT_ENDPOINT = `${API_BASE}/api/chat`;

// Workaround for module resolution issue
const generateMessageId = (): string => `msg_${Date.now()}`;

// Helper function for test API calls
async function testChatRequest(messages: Message[]) {
  return await fetch(CHAT_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });
}

// Helper function to parse streaming response and extract tool information
async function parseStreamingResponse(response: Response): Promise<{
  text: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toolCalls: ToolCall<string, any>[];
}> {
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let fullResponse = "";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const toolCalls: ToolCall<string, any>[] = [];

  if (reader) {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      fullResponse += chunk;
      // Simple parsing, assuming tool calls are on separate lines
      if (chunk.includes('"toolName"')) {
        const lines = chunk.split('\n').filter(line => line.startsWith('9:'));
        for (const line of lines) {
            try {
                toolCalls.push(JSON.parse(line.substring(2)));
            } catch {}
        }
      }
    }
  }
  
  console.log("[TEST] Raw streaming content:", fullResponse);
  console.log("[TEST] Parsed tool calls:", toolCalls);
  return { text: fullResponse, toolCalls };
}

// Helper function to validate tool execution
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function expectToolCall(parsed: { toolCalls: ToolCall<string, any>[] }, toolName: string): ToolCall<string, any> | undefined {
    const call = parsed.toolCalls.find(tc => tc.toolName === toolName);
    expect(call).toBeDefined();
    return call;
}

describe("LLM Tools Integration", () => {
  beforeAll(() => {
    // Verify API key is available
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error(
        "ANTHROPIC_API_KEY required for integration tests. Please set it in your .env file.",
      );
    }
  });

  describe("Calculator Tools via LLM", () => {
    it("should perform addition through LLM tool calling", async () => {
      const response = await testChatRequest([
        { id: generateMessageId(), role: "user", content: "What is 15 + 27?" },
      ]);
      expect(response.ok).toBe(true);
      const parsed = await parseStreamingResponse(response);
      const addCall = expectToolCall(parsed, "add");
      expect(addCall!.args.numbers).toEqual([15, 27]);
    }, 30000);

    it("should perform multiplication through LLM tool calling", async () => {
      const response = await testChatRequest([
        { id: generateMessageId(), role: "user", content: "What is 8 * 12?" },
      ]);
      expect(response.ok).toBe(true);
      const parsed = await parseStreamingResponse(response);
      const multiplyCall = expectToolCall(parsed, "multiply");
      expect(multiplyCall!.args.numbers).toEqual([8, 12]);
    }, 30000);

    it("should handle division including edge cases", async () => {
      const response = await testChatRequest([
        {
          id: generateMessageId(),
          role: "user",
          content: "Use the 'divide' tool to compute 10 divided by 0.",
        },
      ]);
      expect(response.ok).toBe(true);
      const parsed = await parseStreamingResponse(response);
      const divideCall = expectToolCall(parsed, "divide");
      expect(divideCall!.args.dividend).toEqual(10);
      expect(divideCall!.args.divisor).toEqual(0);
    }, 30000);

    it("should handle complex expressions with the evaluate tool", async () => {
        const response = await testChatRequest([
            {
              id: generateMessageId(),
              role: "user",
              content: "Use the 'evaluate' tool to compute the result of: (10 + 5) * 2 - 8 / 4 + sqrt(81)"
            }
        ]);
        expect(response.ok).toBe(true);
        const parsed = await parseStreamingResponse(response);
        const evaluateCall = expectToolCall(parsed, "evaluate");
        expect(evaluateCall!.args.expression).toEqual("(10 + 5) * 2 - 8 / 4 + sqrt(81)");
    }, 30000);
  });

  describe("API Client Tools via LLM", () => {
    it("should make GET requests through LLM tool calling", async () => {
      const response = await testChatRequest([
        {
          id: generateMessageId(),
          role: "user",
          content: "Make a GET request to https://jsonplaceholder.typicode.com/posts/1"
        }
      ]);
      expect(response.ok).toBe(true);
      const parsed = await parseStreamingResponse(response);
      const getCall = expectToolCall(parsed, "get_request");
      expect(getCall!.args.url).toEqual("https://jsonplaceholder.typicode.com/posts/1");
    }, 30000);

    it("should make POST requests through LLM tool calling", async () => {
      const response = await testChatRequest([
        {
          id: generateMessageId(),
          role: "user",
          content: 'Make a POST request to https://jsonplaceholder.typicode.com/posts with data {"test": "value"}'
        }
      ]);
      expect(response.ok).toBe(true);
      const parsed = await parseStreamingResponse(response);
      const postCall = expectToolCall(parsed, "post_request");
      expect(postCall!.args.url).toEqual("https://jsonplaceholder.typicode.com/posts");
    }, 30000);

    it("should make PUT requests through LLM tool calling", async () => {
      const response = await testChatRequest([
        {
          id: generateMessageId(),
          role: "user",
          content: "Make a PUT request to https://jsonplaceholder.typicode.com/posts/1"
        }
      ]);

      expect(response.ok).toBe(true);

      const parsed = await parseStreamingResponse(response);
      const putCall = expectToolCall(parsed, "put_request");
      expect(putCall!.args.url).toEqual("https://jsonplaceholder.typicode.com/posts/1");
    }, 30000);

    it("should make DELETE requests through LLM tool calling", async () => {
      const response = await testChatRequest([
        {
          id: generateMessageId(),
          role: "user",
          content: "Make a DELETE request to https://jsonplaceholder.typicode.com/posts/1"
        }
      ]);

      expect(response.ok).toBe(true);

      const parsed = await parseStreamingResponse(response);
      const deleteCall = expectToolCall(parsed, "delete_request");
      expect(deleteCall!.args.url).toEqual("https://jsonplaceholder.typicode.com/posts/1");
    }, 30000);
  });

  describe("Perplexity Search Tools via LLM", () => {
    beforeAll(() => {
      if (!process.env.PERPLEXITY_API_KEY) {
        throw new Error(
          "PERPLEXITY_API_KEY required for Perplexity integration tests.",
        );
      }
    });

    it("should perform web search through LLM tool calling", async () => {
        const response = await testChatRequest([
            {
              id: generateMessageId(),
              role: "user",
              content: "Search for the latest developments in artificial intelligence"
            }
        ]);
        expect(response.ok).toBe(true);
        const parsed = await parseStreamingResponse(response);
        expectToolCall(parsed, "search");
    }, 30000);

    it("should perform academic search through LLM tool calling", async () => {
        const response = await testChatRequest([
            {
              id: generateMessageId(),
              role: "user",
              content: "Search for academic papers about machine learning in healthcare"
            }
        ]);
        expect(response.ok).toBe(true);
        const parsed = await parseStreamingResponse(response);
        expectToolCall(parsed, "academic_search");
    }, 30000);
    
    it("should handle search with specific filters", async () => {
        const response = await testChatRequest([
            {
              id: generateMessageId(),
              role: "user",
              content: "Use the 'search' tool to find MCP repositories on github.com from the last week."
            }
        ]);
        expect(response.ok).toBe(true);
        const parsed = await parseStreamingResponse(response);
        const searchCall = expectToolCall(parsed, "search");
        expect(searchCall!.args.query).toContain("MCP repositories");
    }, 30000);
  });

  describe("Streaming and Tool Integration", () => {
    it("should stream tool calls and results properly", async () => {
        const response = await testChatRequest([
            { id: generateMessageId(), role: "user", content: "What is 5 + 3?" }
        ]);
        expect(response.ok).toBe(true);
        const parsed = await parseStreamingResponse(response);
        expect(parsed.text).toContain('f:{"messageId"');
        expect(parsed.text).toContain("9:");
        expect(parsed.text).toContain("a:");
        expect(parsed.text).toContain("8");
    }, 30000);

    it("should handle conversation context across multiple messages", async () => {
        const response = await testChatRequest([
             { id: generateMessageId(), role: "user", content: "Calculate 10 * 5" },
             { id: generateMessageId(), role: "assistant", content: "The result is 50." },
             { id: generateMessageId(), role: "user", content: "Now add 25 to that result" },
        ]);
        expect(response.ok).toBe(true);
        const parsed = await parseStreamingResponse(response);
        const addCall = expectToolCall(parsed, "add");
        expect(addCall!.args.numbers).toEqual([50, 25]);
    }, 45000);
  });

  describe("Error Handling", () => {
    it("should handle API errors gracefully", async () => {
      const response = await testChatRequest([]);
      expect(response.status).toBe(400);
    });
  });
});
