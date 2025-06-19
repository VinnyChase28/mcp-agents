#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { promises as fs } from "fs";
import { dirname } from "path";

// Define tool schemas
const ReadFileSchema = z.object({
  path: z.string().describe("Path to the file to read")
});

const WriteFileSchema = z.object({
  path: z.string().describe("Path to the file to write"),
  content: z.string().describe("Content to write to the file")
});

const ListDirectorySchema = z.object({
  path: z.string().describe("Path to the directory to list")
});

// Create server
const server = new Server({
  name: "file-manager-mcp",
  version: "1.0.0"
}, {
  capabilities: {
    tools: {}
  }
});

// List tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "read_file",
        description: "Read contents of a file",
        inputSchema: ReadFileSchema
      },
      {
        name: "write_file",
        description: "Write content to a file",
        inputSchema: WriteFileSchema
      },
      {
        name: "list_directory",
        description: "List contents of a directory",
        inputSchema: ListDirectorySchema
      }
    ]
  };
});

// Call tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "read_file": {
      const { path } = ReadFileSchema.parse(args);
      try {
        const content = await fs.readFile(path, "utf-8");
        return {
          content: [{
            type: "text",
            text: content
          }]
        };
      } catch (error) {
        throw new Error(`Failed to read file: ${error}`);
      }
    }
    
    case "write_file": {
      const { path, content } = WriteFileSchema.parse(args);
      try {
        await fs.mkdir(dirname(path), { recursive: true });
        await fs.writeFile(path, content, "utf-8");
        return {
          content: [{
            type: "text",
            text: `Successfully wrote to ${path}`
          }]
        };
      } catch (error) {
        throw new Error(`Failed to write file: ${error}`);
      }
    }
    
    case "list_directory": {
      const { path } = ListDirectorySchema.parse(args);
      try {
        const items = await fs.readdir(path, { withFileTypes: true });
        const itemList = items.map(item => ({
          name: item.name,
          type: item.isDirectory() ? "directory" : "file"
        }));
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify(itemList, null, 2)
          }]
        };
      } catch (error) {
        throw new Error(`Failed to list directory: ${error}`);
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
  console.error("File Manager MCP server running on stdio");
}

main().catch(console.error); 