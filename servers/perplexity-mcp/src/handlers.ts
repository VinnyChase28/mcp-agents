import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import type { CallToolRequest } from "@modelcontextprotocol/sdk/types.js";
import { AcademicSearchSchema, SearchSchema } from "./schemas.js";
import { callPerplexityAPI } from "./services.js";
import { createLogger } from "@mcp-agents/utils";
import { z } from "zod";

const logger = createLogger('perplexity-mcp');

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
      logger.info(`Received tool call for '${name}'`, { args });

      let parsedArgs;
      try {
        switch (name) {
          case "search":
            parsedArgs = SearchSchema.parse(args);
            break;
          case "academic_search":
            parsedArgs = AcademicSearchSchema.parse(args);
            break;
          default:
            logger.error(`Unknown tool: ${name}`);
            throw new Error(`Unknown tool: ${name}`);
        }
        logger.info('Parsed arguments successfully', { parsedArgs });
      } catch (error) {
        logger.error('Argument parsing failed', { error, tool: name });
        throw new Error(`Invalid arguments for tool: ${name}`);
      }

      try {
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
            } = parsedArgs as z.infer<typeof SearchSchema>;
            
            const apiParams = {
              model,
              temperature,
              max_tokens,
              search_domain_filter,
              search_recency_filter,
              return_images,
              return_related_questions,
            };
            logger.info('Calling Perplexity API for web search', { query, params: apiParams });
            const result = await callPerplexityAPI(apiKey, query, apiParams);

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
            logger.info('Perplexity web search successful');
            return {
              content: [{ type: "text", text: JSON.stringify(response, null, 2) }],
            };
          }

          case "academic_search": {
            const {
              query,
              max_tokens = 1500,
              return_related_questions = true,
            } = parsedArgs as z.infer<typeof AcademicSearchSchema>;
            
            const academicQuery = `Please provide a comprehensive academic overview of: ${query}. Include peer-reviewed sources, key research findings, and scholarly perspectives.`;
            const apiParams = {
              model: "sonar-pro",
              temperature: 0.1,
              max_tokens,
              return_related_questions,
            };
            logger.info('Calling Perplexity API for academic search', { original_query: query, academic_query: academicQuery, params: apiParams });
            const result = await callPerplexityAPI(apiKey, academicQuery, apiParams);
            
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
            logger.info('Perplexity academic search successful');
            return {
              content: [{ type: "text", text: JSON.stringify(response, null, 2) }],
            };
          }
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : undefined;
        logger.error(`Error during tool execution for '${name}'`, {
          error: errorMessage,
          stack: errorStack,
        });
        throw new Error(`Execution failed for tool ${name}: ${errorMessage}`);
      }
      
      throw new Error(`Unknown tool: ${name}`);
    },
  );
} 