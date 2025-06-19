import { describe, it, expect, beforeAll } from "vitest";
/**
 * Integration Tests for Real LLM + MCP Tools Flow
 *
 * These tests use:
 * - Real Anthropic API key
 * - Real AI SDK tool calling via Next.js API routes
 * - MCP client tool execution
 * - Streaming responses with tool calls
 */

const API_BASE = "http://localhost:3000";
const CHAT_ENDPOINT = `${API_BASE}/api/chat`;

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
      const response = await fetch(CHAT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: "What is 15 + 27?" }],
        }),
      });

      expect(response.ok).toBe(true);

      // Read the streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let result = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          result += decoder.decode(value);
        }
      }

      // Should contain tool call for "add" and result 42
      expect(result).toContain("add");
      expect(result).toContain("42"); // 15 + 27 = 42
      expect(result).toContain("toolCallId");
    }, 30000);

    it("should perform multiplication through LLM tool calling", async () => {
      const response = await fetch(CHAT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: "Calculate 8 times 12" }],
        }),
      });

      expect(response.ok).toBe(true);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let result = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          result += decoder.decode(value);
        }
      }

      // Should contain tool call for "multiply" and result 96
      expect(result).toContain("multiply");
      expect(result).toContain("96"); // 8 * 12 = 96
      expect(result).toContain("toolCallId");
    }, 30000);

    it("should handle division including edge cases", async () => {
      const response = await fetch(CHAT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: "What is 100 divided by 4?" }],
        }),
      });

      expect(response.ok).toBe(true);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let result = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          result += decoder.decode(value);
        }
      }

      // Should contain tool call for "divide" and result 25
      expect(result).toContain("divide");
      expect(result).toContain("25"); // 100 / 4 = 25
      expect(result).toContain("toolCallId");
    }, 30000);
  });

  describe("File Manager Tools via LLM", () => {
    it("should read files through LLM tool calling", async () => {
      const response = await fetch(CHAT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: "Read the package.json file" }],
        }),
      });

      expect(response.ok).toBe(true);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let result = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          result += decoder.decode(value);
        }
      }

      // Should contain tool call for "read_file" and file content
      expect(result).toContain("read_file");
      expect(result.toLowerCase()).toMatch(/(package\.json|simulated|content)/);
      expect(result).toContain("toolCallId");
    }, 30000);

    it("should list directory contents through LLM", async () => {
      const response = await fetch(CHAT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: "List the files in the current directory",
            },
          ],
        }),
      });

      expect(response.ok).toBe(true);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let result = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          result += decoder.decode(value);
        }
      }

      // Should contain tool call for "list_directory"
      expect(result).toContain("list_directory");
      expect(result.toLowerCase()).toMatch(/(directory|files|folder)/);
      expect(result).toContain("toolCallId");
    }, 30000);
  });

  describe("API Client Tools via LLM", () => {
    it("should make GET requests through LLM tool calling", async () => {
      const response = await fetch(CHAT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: "Make a GET request to https://httpbin.org/get",
            },
          ],
        }),
      });

      expect(response.ok).toBe(true);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let result = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          result += decoder.decode(value);
        }
      }

      // Should contain tool call for "get_request"
      expect(result).toContain("get_request");
      expect(result.toLowerCase()).toMatch(/(get|request|response|httpbin)/);
      expect(result).toContain("toolCallId");
    }, 30000);

    it("should make POST requests through LLM tool calling", async () => {
      const response = await fetch(CHAT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content:
                'Make a POST request to https://httpbin.org/post with data {"test": "value"}',
            },
          ],
        }),
      });

      expect(response.ok).toBe(true);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let result = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          result += decoder.decode(value);
        }
      }

      // Should contain tool call for "post_request"
      expect(result).toContain("post_request");
      expect(result.toLowerCase()).toMatch(/(post|request|data|test)/);
      expect(result).toContain("toolCallId");
    }, 30000);
  });

  describe("Perplexity Search Tools via LLM", () => {
    beforeAll(() => {
      // Verify Perplexity API key is available
      if (!process.env.PERPLEXITY_API_KEY) {
        throw new Error(
          "PERPLEXITY_API_KEY required for Perplexity integration tests.",
        );
      }
    });

    it("should perform web search through LLM tool calling", async () => {
      const response = await fetch(CHAT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content:
                "Search for the latest developments in artificial intelligence",
            },
          ],
        }),
      });

      expect(response.ok).toBe(true);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let result = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          result += decoder.decode(value);
        }
      }

      // Should contain tool call for "search"
      expect(result).toContain('"toolName":"search"');
      expect(result.toLowerCase()).toMatch(
        /artificial intelligence|ai|development/,
      );
      expect(result).toContain("toolCallId");
    }, 30000);

    it("should perform academic search through LLM tool calling", async () => {
      const response = await fetch(CHAT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content:
                "Search for academic papers about machine learning in healthcare",
            },
          ],
        }),
      });

      expect(response.ok).toBe(true);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let result = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          result += decoder.decode(value);
        }
      }

      // Should contain tool call for "academic_search"
      expect(result).toContain('"toolName":"academic_search"');
      expect(result.toLowerCase()).toMatch(
        /machine learning|healthcare|academic|research/,
      );
      expect(result).toContain("toolCallId");
    }, 30000);

    it("should handle search with specific filters", async () => {
      const response = await fetch(CHAT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content:
                "Search for React best practices from the last week on github.com",
            },
          ],
        }),
      });

      expect(response.ok).toBe(true);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let result = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          result += decoder.decode(value);
        }
      }

      // Should contain tool call for "search" with filtering arguments
      expect(result).toContain('"toolName":"search"');
      expect(result).toContain("github.com");
      expect(result).toContain("week");
      expect(result).toContain("toolCallId");
    }, 30000);
  });

  describe("Streaming and Tool Integration", () => {
    it("should stream tool calls and results properly", async () => {
      const response = await fetch(CHAT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: "What is 5 + 3?" }],
        }),
      });

      expect(response.ok).toBe(true);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let result = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          result += decoder.decode(value);
        }
      }

      // Should contain proper streaming format
      expect(result).toContain('f:{"messageId"'); // Message ID
      expect(result).toContain("9:"); // Tool calls
      expect(result).toContain("a:"); // Tool results
      expect(result).toContain("e:"); // End metadata
      expect(result).toContain("d:"); // Done signal
      expect(result).toContain("8"); // 5 + 3 = 8
    }, 30000);

    it("should handle conversation context across multiple messages", async () => {
      // Test with conversation history
      const response = await fetch(CHAT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "user", content: "Calculate 10 * 5" },
            { role: "assistant", content: "I'll calculate 10 * 5 for you." },
            { role: "user", content: "Now add 25 to that result" },
          ],
        }),
      });

      expect(response.ok).toBe(true);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let result = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          result += decoder.decode(value);
        }
      }

      // Should handle the addition request
      expect(result).toContain("add");
      expect(result).toContain("75"); // 50 + 25 = 75
    }, 45000);
  });

  describe("Error Handling", () => {
    it("should handle API errors gracefully", async () => {
      // Test with malformed request
      const response = await fetch(CHAT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Missing messages field
        }),
      });

      // Should handle error gracefully, not crash
      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it("should handle division by zero through LLM", async () => {
      const response = await fetch(CHAT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: "What is 10 divided by 0?" }],
        }),
      });

      expect(response.ok).toBe(true);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let result = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          result += decoder.decode(value);
        }
      }

      // Should call divide tool and handle the error
      expect(result).toContain("divide");
      expect(result.toLowerCase()).toMatch(
        /(error|zero|undefined|infinity|cannot)/,
      );
    }, 30000);
  });
});
