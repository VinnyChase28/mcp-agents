#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerFileManagerHandlers } from "./handlers.js";

// Create server
const server = new Server(
  {
    name: "file-manager-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  },
);

// Register handlers
registerFileManagerHandlers(server);

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("File Manager MCP server running on stdio");
}

main().catch(console.error);
