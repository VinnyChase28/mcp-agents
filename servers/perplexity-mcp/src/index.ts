#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import type { CallToolRequest } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

// Define tool schemas
const SearchSchema = z.object({
  query: z.string().describe("The search query to find information about"),
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
  max_tokens: z.number().optional().describe("Maximum tokens in response"),
  temperature: z
    .number()
    .min(0)
    .max(2)
    .optional()
    .describe("Temperature for response generation"),
});

const AcademicSearchSchema = z.object({
  query: z.string().describe("The academic search query"),
  max_tokens: z.number().optional().describe("Maximum tokens in response"),
  return_related_questions: z
    .boolean()
    .optional()
    .describe("Whether to return related academic questions"),
});

interface PerplexityResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    finish_reason: string;
    message: {
      role: string;
      content: string;
    };
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Create server
const server = new Server(
  {
    name: "perplexity-mcp",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

// Check for API key
const apiKey = process.env["PERPLEXITY_API_KEY"];
if (!apiKey) {
  console.error("PERPLEXITY_API_KEY environment variable is required");
  process.exit(1);
}

// List tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "search",
        description:
          "Search the web using Perplexity AI for real-time, accurate information",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "The search query to find information about",
            },
            model: {
              type: "string",
              enum: ["sonar-pro", "sonar-reasoning", "sonar"],
              description: "Model to use",
            },
            search_domain_filter: {
              type: "array",
              items: { type: "string" },
              description: "List of domains to search within",
            },
            search_recency_filter: {
              type: "string",
              enum: ["month", "week", "day", "hour"],
              description: "Filter by recency",
            },
            return_images: {
              type: "boolean",
              description: "Whether to return relevant images",
            },
            return_related_questions: {
              type: "boolean",
              description: "Whether to return related questions",
            },
            max_tokens: {
              type: "number",
              description: "Maximum tokens in response",
            },
            temperature: {
              type: "number",
              minimum: 0,
              maximum: 2,
              description: "Temperature for response generation",
            },
          },
          required: ["query"],
        },
      },
      {
        name: "academic_search",
        description:
          "Search academic sources using Perplexity AI for scholarly information",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "The academic search query",
            },
            max_tokens: {
              type: "number",
              description: "Maximum tokens in response",
            },
            return_related_questions: {
              type: "boolean",
              description: "Whether to return related academic questions",
            },
          },
          required: ["query"],
        },
      },
    ],
  };
});

// Call tool handler
server.setRequestHandler(
  CallToolRequestSchema,
  async (request: CallToolRequest) => {
    const { name, arguments: args } = request.params;

    switch (name) {
      case "search": {
        const {
          query,
          model = "sonar-pro",
          search_domain_filter,
          search_recency_filter,
          return_images = false,
          return_related_questions = false,
          max_tokens = 1000,
          temperature = 0.2,
        } = SearchSchema.parse(args);

        try {
          const result = await callPerplexityAPI(query, {
            model,
            temperature,
            max_tokens,
            search_domain_filter,
            search_recency_filter,
            return_images,
            return_related_questions,
          });

          const response = {
            query,
            model,
            response:
              result.choices[0]?.message?.content || "No response received",
            usage: result.usage,
            metadata: {
              search_domain_filter,
              search_recency_filter,
              return_images,
              return_related_questions,
              search_type: "web",
            },
          };

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(response, null, 2),
              },
            ],
          };
        } catch (error) {
          throw new Error(`Search failed: ${error}`);
        }
      }

      case "academic_search": {
        const {
          query,
          max_tokens = 1500,
          return_related_questions = true,
        } = AcademicSearchSchema.parse(args);

        try {
          const academicQuery = `Please provide a comprehensive academic overview of: ${query}. Include peer-reviewed sources, key research findings, and scholarly perspectives.`;

          const result = await callPerplexityAPI(academicQuery, {
            model: "sonar-pro",
            temperature: 0.1,
            max_tokens,
            return_related_questions,
          });

          const response = {
            query,
            academic_query: academicQuery,
            model: "sonar-pro",
            response:
              result.choices[0]?.message?.content || "No response received",
            usage: result.usage,
            metadata: {
              search_type: "academic",
              return_related_questions,
            },
          };

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(response, null, 2),
              },
            ],
          };
        } catch (error) {
          throw new Error(`Academic search failed: ${error}`);
        }
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  },
);

// Helper function to call Perplexity API
async function callPerplexityAPI(
  query: string,
  options: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
    search_domain_filter?: string[];
    search_recency_filter?: string;
    return_images?: boolean;
    return_related_questions?: boolean;
  },
): Promise<PerplexityResponse> {
  const url = "https://api.perplexity.ai/chat/completions";

  const payload = {
    model: options.model || "sonar-pro",
    messages: [
      {
        role: "system",
        content:
          "Be precise and concise. Provide accurate, up-to-date information with relevant sources.",
      },
      {
        role: "user",
        content: query,
      },
    ],
    temperature: options.temperature || 0.2,
    max_tokens: options.max_tokens || 1000,
    top_p: 1,
    stream: false,
    presence_penalty: 0,
    frequency_penalty: 1,
    ...(options.search_domain_filter && {
      search_domain_filter: options.search_domain_filter,
    }),
    ...(options.search_recency_filter && {
      search_recency_filter: options.search_recency_filter,
    }),
    ...(options.return_images !== undefined && {
      return_images: options.return_images,
    }),
    ...(options.return_related_questions !== undefined && {
      return_related_questions: options.return_related_questions,
    }),
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Perplexity API error (${response.status}): ${errorText}`);
  }

  return (await response.json()) as PerplexityResponse;
}

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Perplexity MCP server running on stdio");
}

main().catch(console.error);
