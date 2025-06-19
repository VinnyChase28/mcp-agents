#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerPerplexityHandlers } from "./handlers.js";

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

// Register handlers
registerPerplexityHandlers(server, apiKey);

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Perplexity MCP server running on stdio");
}

main().catch(console.error);
