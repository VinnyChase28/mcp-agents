#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerMathHandlers } from "./tools.js";

// Create MCP server instance
const server = new Server(
  {
    name: "advanced-math-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

// Register all math tools
registerMathHandlers(server);

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Advanced Math MCP Server running on stdio");
}

main().catch(console.error);
