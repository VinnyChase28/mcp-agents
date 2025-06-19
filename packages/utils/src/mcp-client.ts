import { ChildProcess } from "child_process";
import { ToolCall, ToolDefinition } from "@mcp-agents/shared-types";

export interface McpServer {
  name: string;
  command: string;
  args: string[];
  process?: ChildProcess;
  tools: ToolDefinition[];
}

export class McpClient {
  private servers: Map<string, McpServer> = new Map();
  private requestId = 0;

  constructor() {
    // Initialize MCP servers
    this.initializeServers();
  }

  private initializeServers() {
    const serverConfigs: McpServer[] = [
      {
        name: "calculator",
        command: "node",
        args: ["./servers/calculator-mcp/dist/index.js"],
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
      },
      {
        name: "file-manager",
        command: "node",
        args: ["./servers/file-manager-mcp/dist/index.js"],
        tools: [
          {
            name: "read_file",
            description: "Read the contents of a file",
            inputSchema: {
              type: "object",
              properties: {
                path: { type: "string", description: "File path to read" },
              },
              required: ["path"],
            },
          },
          {
            name: "write_file",
            description: "Write content to a file",
            inputSchema: {
              type: "object",
              properties: {
                path: { type: "string", description: "File path to write" },
                content: { type: "string", description: "Content to write" },
              },
              required: ["path", "content"],
            },
          },
          {
            name: "list_directory",
            description: "List the contents of a directory",
            inputSchema: {
              type: "object",
              properties: {
                path: { type: "string", description: "Directory path to list" },
              },
              required: ["path"],
            },
          },
        ],
      },
      {
        name: "api-client",
        command: "node",
        args: ["./servers/api-client-mcp/dist/index.js"],
        tools: [
          {
            name: "get_request",
            description: "Make a GET request to a URL",
            inputSchema: {
              type: "object",
              properties: {
                url: { type: "string", description: "URL to request" },
                headers: { type: "object", description: "Optional headers" },
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
                url: { type: "string", description: "URL to request" },
                data: { type: "object", description: "Data to send" },
                headers: { type: "object", description: "Optional headers" },
              },
              required: ["url"],
            },
          },
        ],
      },
      {
        name: "perplexity",
        command: "node",
        args: ["./servers/perplexity-mcp/dist/index.js"],
        tools: [
          {
            name: "search",
            description:
              "Search the web using Perplexity AI for real-time, accurate information",
            inputSchema: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description: "The search query to find information about",
                },
                model: {
                  type: "string",
                  description:
                    "Model to use (sonar-pro, sonar-reasoning, sonar)",
                  enum: ["sonar-pro", "sonar-reasoning", "sonar"],
                },
                search_domain_filter: {
                  type: "array",
                  items: { type: "string" },
                  description:
                    'List of domains to search within (e.g., ["reddit.com", "github.com"])',
                },
                search_recency_filter: {
                  type: "string",
                  description: "Filter by recency",
                  enum: ["month", "week", "day", "hour"],
                },
                return_images: {
                  type: "boolean",
                  description: "Whether to return relevant images",
                },
                return_related_questions: {
                  type: "boolean",
                  description: "Whether to return related questions",
                },
                max_tokens: {
                  type: "number",
                  description: "Maximum tokens in response",
                },
                temperature: {
                  type: "number",
                  description: "Temperature for response generation (0-2)",
                },
              },
              required: ["query"],
            },
          },
          {
            name: "academic_search",
            description:
              "Search academic sources using Perplexity AI for scholarly information",
            inputSchema: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description: "The academic search query",
                },
                max_tokens: {
                  type: "number",
                  description: "Maximum tokens in response",
                },
                return_related_questions: {
                  type: "boolean",
                  description: "Whether to return related academic questions",
                },
              },
              required: ["query"],
            },
          },
        ],
      },
    ];

    serverConfigs.forEach((config) => {
      this.servers.set(config.name, config);
    });
  }

  getAllTools(): ToolDefinition[] {
    const tools: ToolDefinition[] = [];
    this.servers.forEach((server) => {
      tools.push(...server.tools);
    });
    return tools;
  }

  async callTool(toolCall: ToolCall): Promise<ToolCall> {
    const tool = this.findToolByName(toolCall.name);
    if (!tool) {
      return {
        ...toolCall,
        status: "error",
        error: `Tool ${toolCall.name} not found`,
      };
    }

    const serverName = this.getServerNameForTool(toolCall.name);
    if (!serverName) {
      return {
        ...toolCall,
        status: "error",
        error: `Server not found for tool ${toolCall.name}`,
      };
    }

    try {
      // For now, simulate the tool calls since we'd need to set up proper MCP communication
      const result = await this.simulateToolCall(toolCall);
      return {
        ...toolCall,
        status: "success",
        result,
      };
    } catch (error) {
      return {
        ...toolCall,
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private findToolByName(name: string): ToolDefinition | undefined {
    for (const server of this.servers.values()) {
      const tool = server.tools.find((t) => t.name === name);
      if (tool) return tool;
    }
    return undefined;
  }

  private getServerNameForTool(toolName: string): string | undefined {
    for (const [serverName, server] of this.servers.entries()) {
      if (server.tools.some((t) => t.name === toolName)) {
        return serverName;
      }
    }
    return undefined;
  }

  private async simulateToolCall(toolCall: ToolCall): Promise<unknown> {
    // Simulate tool execution for demo purposes
    switch (toolCall.name) {
      case "add":
        const { a: addA, b: addB } = toolCall.arguments;
        return { result: addA + addB };

      case "multiply":
        const { a: mulA, b: mulB } = toolCall.arguments;
        return { result: mulA * mulB };

      case "divide":
        const { a: divA, b: divB } = toolCall.arguments;
        if (divB === 0) throw new Error("Division by zero");
        return { result: divA / divB };

      case "read_file":
        const { path: readPath } = toolCall.arguments;
        return { content: `Simulated content of file: ${readPath}` };

      case "write_file":
        const { path: writePath } = toolCall.arguments;
        return { message: `Successfully wrote to ${writePath}` };

      case "list_directory":
        return {
          files: [
            { name: "example.txt", type: "file" },
            { name: "subfolder", type: "directory" },
          ],
        };

      case "get_request":
        const { url: getUrl } = toolCall.arguments;
        return {
          status: 200,
          data: { message: `Simulated GET response from ${getUrl}` },
        };

      case "post_request":
        const { url: postUrl, data } = toolCall.arguments;
        return {
          status: 200,
          data: {
            message: `Simulated POST response from ${postUrl}`,
            received: data,
          },
        };

      case "search":
        const { query: searchQuery, model = "sonar-pro" } = toolCall.arguments;
        return {
          query: searchQuery,
          model,
          response: `Simulated search results for "${searchQuery}" using ${model}. This would contain real-time web search results with sources and citations.`,
          usage: {
            prompt_tokens: 50,
            completion_tokens: 150,
            total_tokens: 200,
          },
          metadata: { search_type: "web", simulated: true },
        };

      case "academic_search":
        const { query: academicQuery } = toolCall.arguments;
        return {
          query: academicQuery,
          model: "sonar-pro",
          response: `Simulated academic search results for "${academicQuery}". This would contain scholarly articles, research papers, and peer-reviewed sources related to the query.`,
          usage: {
            prompt_tokens: 75,
            completion_tokens: 200,
            total_tokens: 275,
          },
          metadata: { search_type: "academic", simulated: true },
        };

      default:
        throw new Error(`Unknown tool: ${toolCall.name}`);
    }
  }

  cleanup() {
    this.servers.forEach((server) => {
      if (server.process) {
        server.process.kill();
      }
    });
  }
}
