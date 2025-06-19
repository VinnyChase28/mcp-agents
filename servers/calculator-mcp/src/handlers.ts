import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { AddSchema, DivideSchema, MultiplySchema } from "./schemas.js";

export function registerCalculatorHandlers(server: Server) {
  // List tools handler
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: "add",
          description: "Add two numbers together",
          inputSchema: {
            type: "object",
            properties: {
              a: { type: "number", description: "First number" },
              b: { type: "number", description: "Second number" },
            },
            required: ["a", "b"],
          },
        },
        {
          name: "multiply",
          description: "Multiply two numbers",
          inputSchema: {
            type: "object",
            properties: {
              a: { type: "number", description: "First number" },
              b: { type: "number", description: "Second number" },
            },
            required: ["a", "b"],
          },
        },
        {
          name: "divide",
          description: "Divide two numbers",
          inputSchema: {
            type: "object",
            properties: {
              a: { type: "number", description: "Dividend" },
              b: { type: "number", description: "Divisor" },
            },
            required: ["a", "b"],
          },
        },
      ],
    };
  });

  // Call tool handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    switch (name) {
      case "add": {
        const { a, b } = AddSchema.parse(args);
        return {
          content: [
            {
              type: "text",
              text: `${a} + ${b} = ${a + b}`,
            },
          ],
        };
      }

      case "multiply": {
        const { a, b } = MultiplySchema.parse(args);
        return {
          content: [
            {
              type: "text",
              text: `${a} × ${b} = ${a * b}`,
            },
          ],
        };
      }

      case "divide": {
        const { a, b } = DivideSchema.parse(args);
        if (b === 0) {
          throw new Error("Division by zero is not allowed");
        }
        return {
          content: [
            {
              type: "text",
              text: `${a} ÷ ${b} = ${a / b}`,
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  });
} 