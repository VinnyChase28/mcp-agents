import { describe, it, expect, beforeAll } from "vitest";

/**
 * Integration Tests for Real LLM + Tools Flow
 *
 * These tests use:
 * - Real Anthropic API key
 * - Real AI SDK tool calling
 * - Actual chat API endpoint
 * - Real tool execution
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

      // Should contain tool call and result
      expect(result).toContain("42"); // 15 + 27 = 42
    }, 30000); // 30 second timeout for LLM response

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

      expect(result).toContain("96"); // 8 * 12 = 96
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

      expect(result).toContain("25"); // 100 / 4 = 25
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

      // Should contain file content or simulation response
      expect(result.toLowerCase()).toMatch(/(package\.json|file|content)/);
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

      expect(result.toLowerCase()).toMatch(/(directory|files|folder)/);
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

      expect(result.toLowerCase()).toMatch(/(get|request|response|httpbin)/);
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

      expect(result.toLowerCase()).toMatch(/(post|request|data|test)/);
    }, 30000);
  });

  describe("Conversation Context", () => {
    it("should handle conversation context across multiple messages", async () => {
      // First message
      const response1 = await fetch(CHAT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: "Calculate 10 * 5" }],
        }),
      });

      expect(response1.ok).toBe(true);

      // Second message building on the first
      const response2 = await fetch(CHAT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "user", content: "Calculate 10 * 5" },
            { role: "assistant", content: "I calculated 10 * 5 = 50." },
            { role: "user", content: "Now add 25 to that result" },
          ],
        }),
      });

      expect(response2.ok).toBe(true);

      const reader = response2.body?.getReader();
      const decoder = new TextDecoder();
      let result = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          result += decoder.decode(value);
        }
      }

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

      // Should handle division by zero error
      expect(result.toLowerCase()).toMatch(
        /(error|zero|undefined|infinity|cannot)/,
      );
    }, 30000);
  });
});
