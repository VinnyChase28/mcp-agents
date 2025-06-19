import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import path from "path";
import { fileURLToPath } from "url";
import type { Tool, ToolResult } from "@mcp-agents/shared-types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface MCPServerConfig {
  name: string;
  command: string;
  args: string[];
  env?: Record<string, string>;
}

interface ActiveServer {
  client: Client;
  transport: StdioClientTransport;
  tools: Tool[];
}

export class MCPClient {
  private servers = new Map<string, ActiveServer>();
  private serverConfigs: MCPServerConfig[] = [
    {
      name: "calculator",
      command: "node",
      args: [
        path.resolve(
          __dirname,
          "../../../servers/calculator-mcp/dist/index.js",
        ),
      ],
    },
    {
      name: "file-manager",
      command: "node",
      args: [
        path.resolve(
          __dirname,
          "../../../servers/file-manager-mcp/dist/index.js",
        ),
      ],
    },
    {
      name: "api-client",
      command: "node",
      args: [
        path.resolve(
          __dirname,
          "../../../servers/api-client-mcp/dist/index.js",
        ),
      ],
    },
    {
      name: "perplexity",
      command: "node",
      args: [
        path.resolve(
          __dirname,
          "../../../servers/perplexity-mcp/dist/index.js",
        ),
      ],
      env: {
        PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY || "",
      },
    },
  ];

  async initialize(): Promise<void> {
    console.log("Initializing MCP servers...");

    for (const config of this.serverConfigs) {
      try {
        await this.connectToServer(config);
        console.log(`✓ Connected to ${config.name} server`);
      } catch (error) {
        console.error(`✗ Failed to connect to ${config.name} server:`, error);
      }
    }
  }

  private async connectToServer(config: MCPServerConfig): Promise<void> {
    // Create transport with proper parameters
    const transport = new StdioClientTransport({
      command: config.command,
      args: config.args,
      env: {
        ...(Object.fromEntries(
          Object.entries(process.env).filter(
            ([, value]) => value !== undefined,
          ),
        ) as Record<string, string>),
        ...(config.env || {}),
      },
    });

    const client = new Client(
      {
        name: "mcp-agents-client",
        version: "0.1.0",
      },
      {
        capabilities: {},
      },
    );

    // Connect to the server
    await client.connect(transport);

    // Get available tools
    const toolsResponse = await client.listTools();
    const tools: Tool[] = toolsResponse.tools.map((tool) => ({
      name: tool.name,
      description: tool.description || "",
      parameters: tool.inputSchema as Record<string, unknown>,
      server: config.name,
    }));

    // Store the active server
    this.servers.set(config.name, {
      client,
      transport,
      tools,
    });
  }

  async getAvailableTools(): Promise<Tool[]> {
    const allTools: Tool[] = [];

    for (const server of this.servers.values()) {
      allTools.push(...server.tools);
    }

    return allTools;
  }

  async callTool(
    toolName: string,
    args: Record<string, unknown>,
  ): Promise<ToolResult> {
    // Find which server has this tool
    let targetServer: ActiveServer | undefined;

    for (const server of this.servers.values()) {
      if (server.tools.some((tool) => tool.name === toolName)) {
        targetServer = server;
        break;
      }
    }

    if (!targetServer) {
      throw new Error(`Tool '${toolName}' not found in any connected server`);
    }

    try {
      const response = await targetServer.client.callTool({
        name: toolName,
        arguments: args,
      });

      // Extract content from MCP response
      let content = "";
      if (response.content && Array.isArray(response.content)) {
        for (const item of response.content) {
          if (item.type === "text") {
            content += item.text;
          }
        }
      }

      return {
        success: true,
        result: content,
        toolName,
        args,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        toolName,
        args,
      };
    }
  }

  async shutdown(): Promise<void> {
    console.log("Shutting down MCP servers...");

    for (const [name, server] of this.servers.entries()) {
      try {
        await server.client.close();
        console.log(`✓ Shut down ${name} server`);
      } catch (error) {
        console.error(`✗ Error shutting down ${name} server:`, error);
      }
    }

    this.servers.clear();
  }
}

// Singleton instance
let mcpClientInstance: MCPClient | null = null;

export async function getMCPClient(): Promise<MCPClient> {
  if (!mcpClientInstance) {
    mcpClientInstance = new MCPClient();
    await mcpClientInstance.initialize();
  }
  return mcpClientInstance;
}
