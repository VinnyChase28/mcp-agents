#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

// Define tool schemas
const AddSchema = z.object({
  a: z.number().describe("First number"),
  b: z.number().describe("Second number")
});

const MultiplySchema = z.object({
  a: z.number().describe("First number"),
  b: z.number().describe("Second number")
});

const DivideSchema = z.object({
  a: z.number().describe("Dividend"),
  b: z.number().describe("Divisor")
});

// Create server
const server = new Server({
  name: "calculator-mcp",
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
        name: "add",
        description: "Add two numbers together",
        inputSchema: AddSchema
      },
      {
        name: "multiply",
        description: "Multiply two numbers",
        inputSchema: MultiplySchema
      },
      {
        name: "divide",
        description: "Divide two numbers",
        inputSchema: DivideSchema
      }
    ]
  };
});

// Call tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "add": {
      const { a, b } = AddSchema.parse(args);
      return {
        content: [{
          type: "text",
          text: `${a} + ${b} = ${a + b}`
        }]
      };
    }
    
    case "multiply": {
      const { a, b } = MultiplySchema.parse(args);
      return {
        content: [{
          type: "text",
          text: `${a} × ${b} = ${a * b}`
        }]
      };
    }
    
    case "divide": {
      const { a, b } = DivideSchema.parse(args);
      if (b === 0) {
        throw new Error("Division by zero is not allowed");
      }
      return {
        content: [{
          type: "text",
          text: `${a} ÷ ${b} = ${a / b}`
        }]
      };
    }
    
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Calculator MCP server running on stdio");
}

main().catch(console.error); 