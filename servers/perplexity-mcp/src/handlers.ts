import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import type { CallToolRequest } from "@modelcontextprotocol/sdk/types.js";
import { AcademicSearchSchema, SearchSchema } from "./schemas.js";
import { callPerplexityAPI } from "./services.js";

export function registerPerplexityHandlers(server: Server, apiKey: string) {
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
            const result = await callPerplexityAPI(apiKey, query, {
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

            const result = await callPerplexityAPI(apiKey, academicQuery, {
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
} 