import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import mexp from "math-expression-evaluator";
import { Schemas } from "./schemas.js";
import { MATH_CONSTANTS } from "./constants.js";
import { z, ZodObject, ZodRawShape } from "zod";

// A type-safe, but simplified, Zod to JSON Schema converter
const zodToJsonSchema = (schema: ZodObject<ZodRawShape>) => {
  const { shape } = schema;
  const properties: Record<string, { type: string; description: string }> = {};
  const required: string[] = [];

  for (const key in shape) {
    if (Object.prototype.hasOwnProperty.call(shape, key)) {
      const field = shape[key];
      if (!field.isOptional()) {
        required.push(key);
      }
      const typeName = (field._def as { typeName: string }).typeName;
      properties[key] = {
        type:
          typeName === "ZodNumber"
            ? "number"
            : typeName === "ZodString"
              ? "string"
              : typeName === "ZodBoolean"
                ? "boolean"
                : "object",
        description: field.description || "",
      };
    }
  }
  return { type: "object", properties, required };
};

export function registerMathHandlers(server: Server) {
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: Object.entries(Schemas).map(([name, schema]) => ({
      name,
      description: `Performs the ${name} operation.`,
      inputSchema: zodToJsonSchema(schema),
    })),
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const schema = (Schemas as Record<string, z.ZodSchema>)[name];
    if (!schema) throw new Error(`Unknown tool: ${name}`);

    const parsedArgs = schema.parse(args);
    let text = "";

    // This switch statement will be expanded to handle all tools.
    // For now, it shows the pattern for a few key tools.
    switch (name) {
      case "evaluate":
        try {
          const { expression } = parsedArgs as { expression: string };
          const result = new mexp().eval(expression);
          text = `${expression} = ${result}`;
        } catch (e) {
          throw new Error(`Evaluation failed: ${(e as Error).message}`);
        }
        break;
      case "add":
        {
          const numbers = (parsedArgs as { numbers: number[] }).numbers;
          const result = numbers.reduce((s, n) => s + n, 0);
          text = `Sum of [${numbers.join(", ")}] = ${result}`;
        }
        break;
      case "get_constant":
        {
          const constantName = (parsedArgs as { name: keyof typeof MATH_CONSTANTS })
            .name;
          const value = MATH_CONSTANTS[constantName];
          text = `Constant ${constantName}: ${value}`;
        }
        break;
      default:
        throw new Error(`Tool implementation for '${name}' not found.`);
    }

    return { content: [{ type: "text", text }] };
  });
} 