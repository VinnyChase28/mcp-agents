import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import mexp from "math-expression-evaluator";
import { Schemas } from "./schemas.js";
import { MATH_CONSTANTS } from "./constants.js";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

export function registerMathHandlers(server: Server) {
  // Register prompts
  server.setRequestHandler(ListPromptsRequestSchema, async () => {
    return {
      prompts: [
        {
          name: "solve_word_problem",
          description: "Help solve a mathematical word problem step by step",
          arguments: [
            {
              name: "problem",
              description: "The word problem to solve",
              required: true,
            },
          ],
        },
        {
          name: "explain_calculation",
          description: "Explain a mathematical calculation with step-by-step reasoning",
          arguments: [
            {
              name: "expression",
              description: "The mathematical expression to explain",
              required: true,
            },
          ],
        },
        {
          name: "compare_methods",
          description: "Compare different mathematical methods for solving a problem",
          arguments: [
            {
              name: "problem_type",
              description: "Type of mathematical problem (e.g., 'quadratic equation', 'optimization')",
              required: true,
            },
          ],
        },
      ],
    };
  });

  server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    switch (name) {
      case "solve_word_problem":
        const problem = args?.problem || "[Problem description]";
        return {
          description: "Step-by-step word problem solving template",
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: `I need help solving this word problem: "${problem}"

Please help me:
1. Identify what information is given
2. Determine what we need to find
3. Set up the mathematical equation(s)
4. Solve step by step
5. Verify the answer makes sense

Use the available math tools to perform calculations and show your work clearly.`,
              },
            },
          ],
        };

      case "explain_calculation":
        const expression = args?.expression || "[Mathematical expression]";
        return {
          description: "Detailed calculation explanation template",
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: `Please explain how to calculate: ${expression}

Break down the calculation by:
1. Identifying the order of operations
2. Explaining each step
3. Using math tools to verify intermediate results
4. Showing the final answer

Make sure to explain why each step is necessary and what mathematical principles are being applied.`,
              },
            },
          ],
        };

      case "compare_methods":
        const problemType = args?.problem_type || "[Problem type]";
        return {
          description: "Mathematical method comparison template",
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: `I want to understand different approaches for solving ${problemType} problems.

Please:
1. Explain 2-3 different methods that can be used
2. Show the pros and cons of each approach
3. Provide a simple example using each method
4. Use math tools to demonstrate the calculations
5. Recommend when to use each method

Help me understand which method might be best for different scenarios.`,
              },
            },
          ],
        };

      default:
        throw new Error(`Unknown prompt: ${name}`);
    }
  });

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
    console.log(`[math-mcp] Received tool call for '${name}' with args:`, args);

    const schema = (Schemas as Record<string, z.ZodSchema>)[name];
    if (!schema) {
      console.error(`[math-mcp] Unknown tool: ${name}`);
      throw new Error(`Unknown tool: ${name}`);
    }

    const parsedArgs = schema.parse(args);
    console.log(`[math-mcp] Parsed arguments:`, parsedArgs);
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
      case "round":
        {
          const { number, decimals } = parsedArgs as { number: number, decimals?: number };
          const result = decimals ? parseFloat(number.toFixed(decimals)) : Math.round(number);
          text = `Rounded value of ${number} is ${result}`;
        }
        break;
      case "floor":
        {
          const { number } = parsedArgs as { number: number };
          text = `Floor value of ${number} is ${Math.floor(number)}`;
        }
        break;
      case "ceil":
        {
          const { number } = parsedArgs as { number: number };
          text = `Ceiling value of ${number} is ${Math.ceil(number)}`;
        }
        break;
      case "lcm":
        {
          const { numbers } = parsedArgs as { numbers: number[] };
          const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
          const lcm = (a: number, b: number): number => (a * b) / gcd(a, b);
          const result = numbers.reduce(lcm);
          text = `LCM of [${numbers.join(", ")}] is ${result}`;
        }
        break;
      case "solve_quadratic":
        {
          const { a, b, c } = parsedArgs as { a: number, b: number, c: number };
          const discriminant = b * b - 4 * a * c;
          if (discriminant > 0) {
            const root1 = (-b + Math.sqrt(discriminant)) / (2 * a);
            const root2 = (-b - Math.sqrt(discriminant)) / (2 * a);
            text = `The roots are ${root1} and ${root2}`;
          } else if (discriminant === 0) {
            const root = -b / (2 * a);
            text = `The root is ${root}`;
          } else {
            text = "No real roots";
          }
        }
        break;
      default:
        console.error(`[math-mcp] Tool implementation for '${name}' not found.`);
        throw new Error(`Tool implementation for '${name}' not found.`);
    }

    console.log(`[math-mcp] Result for '${name}':`, text);
    return { content: [{ type: "text", text }] };
  });
} 