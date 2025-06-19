import { experimental_createMCPClient } from "ai";
import { Experimental_StdioMCPTransport } from "ai/mcp-stdio";
import type { ToolSet } from "ai";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MCP Server configuration
interface MCPServerConfig {
  name: string;
  command: string;
  args: string[];
  env?: Record<string, string>;
}

// Type for the MCP client returned by experimental_createMCPClient
type MCPClient = Awaited<ReturnType<typeof experimental_createMCPClient>>;

// MCP Client Manager using AI SDK
export class MCPClientManager {
  private clients = new Map<string, MCPClient>();
  private serverConfigs: MCPServerConfig[] = [
    {
      name: "math",
      command: "node",
      args: [
        path.resolve(
          __dirname,
          "../../../servers/math-mcp/dist/index.js",
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
        PERPLEXITY_API_KEY: process.env["PERPLEXITY_API_KEY"] || "",
      },
    },
  ];

  private async createClient(config: MCPServerConfig): Promise<MCPClient> {
    const transport = new Experimental_StdioMCPTransport({
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

    const client = await experimental_createMCPClient({
      transport,
    });

    return client;
  }

  async getClient(serverName: string): Promise<MCPClient> {
    if (!this.clients.has(serverName)) {
      const config = this.serverConfigs.find((c) => c.name === serverName);
      if (!config) {
        throw new Error(`Unknown MCP server: ${serverName}`);
      }

      try {
        const client = await this.createClient(config);
        this.clients.set(serverName, client);
        console.log(`✓ Connected to ${serverName} MCP server`);
      } catch (error) {
        console.error(`✗ Failed to connect to ${serverName} server:`, error);
        throw error;
      }
    }
    return this.clients.get(serverName)!;
  }

  async getAllTools() {
    const allTools = {};

    for (const config of this.serverConfigs) {
      try {
        const client = await this.getClient(config.name);
        const tools = await client.tools();
        Object.assign(allTools, tools);
      } catch (error) {
        console.error(`Failed to get tools from ${config.name}:`, error);
      }
    }

    return allTools;
  }

  // Note: Resources and Prompts support may be limited in current AI SDK MCP integration
  // These methods are prepared for future API updates
  async getAllResources() {
    console.log("Resources support coming soon in AI SDK MCP integration");
    return Promise.resolve([]);
  }

  async getAllPrompts() {
    console.log("Prompts support coming soon in AI SDK MCP integration");
    return Promise.resolve([]);
  }

  async readResource(uri: string) {
     
    console.log("Resource reading not yet supported", uri);
    throw new Error(
      "Resource reading not yet supported in AI SDK MCP integration",
    );
  }

  async getPrompt(name: string, args?: Record<string, unknown>) {
     
    console.log("Prompt retrieval not yet supported", name, args);
    throw new Error(
      "Prompt retrieval not yet supported in AI SDK MCP integration",
    );
  }

  async closeAll(): Promise<void> {
    await Promise.all(
      Array.from(this.clients.values()).map((client) => client.close()),
    );
    this.clients.clear();
  }

  async close(serverName: string): Promise<void> {
    const client = this.clients.get(serverName);
    if (client) {
      await client.close();
      this.clients.delete(serverName);
    }
  }
}

// Singleton instance
let mcpClientManager: MCPClientManager | null = null;

export function getMCPClientManager(): MCPClientManager {
  if (!mcpClientManager) {
    mcpClientManager = new MCPClientManager();
  }
  return mcpClientManager;
}

// Modern MCP integration using latest AI SDK
export async function withMCPTools<T>(
  operation: (tools: ToolSet) => Promise<T>,
): Promise<T> {
  const clients: Array<{ name: string; client: MCPClient }> = [];

  try {
    // Create MCP clients for each server using latest AI SDK
    for (const config of [
      {
        name: "math",
        command: "node",
        args: [
          path.resolve(
            __dirname,
            "../../../servers/math-mcp/dist/index.js",
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
          PERPLEXITY_API_KEY: process.env["PERPLEXITY_API_KEY"] || "",
        },
      },
    ]) {
      try {
        const client = await experimental_createMCPClient({
          transport: new Experimental_StdioMCPTransport({
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
          }),
        });

        clients.push({ name: config.name, client });
        console.log(`✓ Connected to ${config.name} MCP server`);
      } catch (error) {
        console.error(`✗ Failed to connect to ${config.name} server:`, error);
      }
    }

    // Combine tools from all connected clients
    const allTools = {};
    for (const { client } of clients) {
      try {
        const tools = await client.tools();
        Object.assign(allTools, tools);
      } catch (error) {
        console.error("Failed to get tools from client:", error);
      }
    }

    return await operation(allTools as ToolSet);
  } finally {
    // Clean up all client connections
    await Promise.all(
      clients.map(async ({ client }) => {
        try {
          await client.close();
        } catch (error) {
          console.error("Error closing MCP client:", error);
        }
      }),
    );
  }
}
