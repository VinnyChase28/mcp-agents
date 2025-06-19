import { experimental_createMCPClient } from "ai";
import { Experimental_StdioMCPTransport } from "ai/mcp-stdio";
import type { ToolSet } from "ai";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Type for the MCP client returned by experimental_createMCPClient
type MCPClient = Awaited<ReturnType<typeof experimental_createMCPClient>>;

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
          PERPLEXITY_API_KEY: process.env["PERPLEXITY_API_KEY"] ?? "",
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
        console.log(`✓ [MCP] Connected to ${config.name} server`);
      } catch (error) {
        console.error(`✗ [MCP] Failed to connect to ${config.name} server:`, error);
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
