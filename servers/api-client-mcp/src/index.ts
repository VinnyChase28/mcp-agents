#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

// Define tool schemas
const GetRequestSchema = z.object({
  url: z.string().describe("URL to make GET request to"),
  headers: z.record(z.string()).optional().describe("Optional headers"),
});

const PostRequestSchema = z.object({
  url: z.string().describe("URL to make POST request to"),
  body: z.string().describe("Request body"),
  headers: z.record(z.string()).optional().describe("Optional headers"),
});

// Create server
const server = new Server(
  {
    name: "api-client-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

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
            url: { type: "string", description: "URL to make GET request to" },
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
            url: { type: "string", description: "URL to make POST request to" },
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

  switch (name) {
    case "get_request": {
      const { url, headers = {} } = GetRequestSchema.parse(args);
      try {
        const response = await fetch(url, {
          method: "GET",
          headers,
        });

        const data = await response.text();

        return {
          content: [
            {
              type: "text",
              text: `Status: ${response.status}\nData: ${data}`,
            },
          ],
        };
      } catch (error) {
        throw new Error(`Failed to make GET request: ${error}`);
      }
    }

    case "post_request": {
      const { url, body, headers = {} } = PostRequestSchema.parse(args);
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...headers,
          },
          body,
        });

        const data = await response.text();

        return {
          content: [
            {
              type: "text",
              text: `Status: ${response.status}\nData: ${data}`,
            },
          ],
        };
      } catch (error) {
        throw new Error(`Failed to make POST request: ${error}`);
      }
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("API Client MCP server running on stdio");
}

main().catch(console.error);
