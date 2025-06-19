import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import mexp from "math-expression-evaluator";
import { Schemas } from "./schemas.js";
import { MATH_CONSTANTS } from "./constants.js";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

export function registerMathHandlers(server: Server) {
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: Object.entries(Schemas).map(([name, schema]) => {
      let description = `Performs the ${name} operation.`;
      if (name === "evaluate") {
        description =
          "Evaluates a mathematical expression string. Use this for complex calculations with multiple operators, parentheses, and functions like sqrt, !, etc.";
      }
      return {
        name,
        description,
        inputSchema: zodToJsonSchema(schema),
      };
    }),
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const schema = (Schemas as Record<string, z.ZodSchema>)[name];
    if (!schema) throw new Error(`Unknown tool: ${name}`);

    const parsedArgs = schema.parse(args);
    let text = "";

    switch (name) {
      case "evaluate":
        try {
          const { expression } = parsedArgs as { expression: string };
          const m = new mexp();
          m.addToken([
            {
              type: 0,
              token: "sqrt",
              show: "sqrt",
              value: (a: number) => Math.sqrt(a),
              precedence: 99,
            },
          ]);
          const result = m.eval(expression);
          text = `${expression} = ${result}`;
        } catch (e) {
          console.error("Math evaluation error:", (e as Error).message);
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
      case "multiply":
        {
          const numbers = (parsedArgs as { numbers: number[] }).numbers;
          const result = numbers.reduce((s, n) => s * n, 1);
          text = `Product of [${numbers.join(", ")}] = ${result}`;
        }
        break;
      case "divide":
        {
          const { dividend, divisor } = parsedArgs as {
            dividend: number;
            divisor: number;
          };
          if (divisor === 0) {
            throw new Error("Division by zero is not allowed.");
          }
          const result = dividend / divisor;
          text = `${dividend} / ${divisor} = ${result}`;
        }
        break;
      case "get_constant":
        {
          const constantName = (
            parsedArgs as { name: keyof typeof MATH_CONSTANTS }
          ).name;
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