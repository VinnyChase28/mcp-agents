import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { GetRequestSchema, PostRequestSchema } from "./schemas.js";
import { createLogger } from "@mcp-agents/utils";
import { z } from "zod";

const logger = createLogger('api-client-mcp');

export function registerApiClientHandlers(server: Server) {
  // List tools handler
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: "get_request",
          description: "Make a GET request to a URL",
          inputSchema: {
            type: "object",
            properties: {
              url: {
                type: "string",
                description: "URL to make GET request to",
              },
              headers: {
                type: "object",
                description: "Optional headers",
                additionalProperties: { type: "string" },
              },
            },
            required: ["url"],
          },
        },
        {
          name: "post_request",
          description: "Make a POST request to a URL",
          inputSchema: {
            type: "object",
            properties: {
              url: {
                type: "string",
                description: "URL to make POST request to",
              },
              body: { type: "string", description: "Request body" },
              headers: {
                type: "object",
                description: "Optional headers",
                additionalProperties: { type: "string" },
              },
            },
            required: ["url", "body"],
          },
        },
      ],
    };
  });

  // Call tool handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    logger.info(`Received tool call for '${name}'`, { args });

    let parsedArgs;
    try {
      switch (name) {
        case "get_request":
          parsedArgs = GetRequestSchema.parse(args);
          break;
        case "post_request":
          parsedArgs = PostRequestSchema.parse(args);
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
        case "get_request": {
          const { url, headers = {} } = parsedArgs as z.infer<typeof GetRequestSchema>;
          logger.info('Making GET request', { url, headers });
          const response = await fetch(url, {
            method: "GET",
            headers,
          });
          const data = await response.text();
          logger.info('GET request successful', { status: response.status });
          return {
            content: [{ type: "text", text: `Status: ${response.status}\nData: ${data}` }],
          };
        }

        case "post_request": {
          const { url, body, headers = {} } = parsedArgs as z.infer<typeof PostRequestSchema>;
          logger.info('Making POST request', { url, headers });
          const response = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...headers,
            },
            body,
          });
          const data = await response.text();
          logger.info('POST request successful', { status: response.status });
          return {
            content: [{ type: "text", text: `Status: ${response.status}\nData: ${data}` }],
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
  });
} 