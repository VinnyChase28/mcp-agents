import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { promises as fs } from "fs";
import { dirname } from "path";
import {
  ListDirectorySchema,
  ReadFileSchema,
  WriteFileSchema,
} from "./schemas.js";

export function registerFileManagerHandlers(server: Server) {
  // List tools handler
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: "read_file",
          description: "Read contents of a file",
          inputSchema: {
            type: "object",
            properties: {
              path: {
                type: "string",
                description: "Path to the file to read",
              },
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
              path: {
                type: "string",
                description: "Path to the file to write",
              },
              content: {
                type: "string",
                description: "Content to write to the file",
              },
            },
            required: ["path", "content"],
          },
        },
        {
          name: "list_directory",
          description: "List contents of a directory",
          inputSchema: {
            type: "object",
            properties: {
              path: {
                type: "string",
                description: "Path to the directory to list",
              },
            },
            required: ["path"],
          },
        },
      ],
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
            content: [
              {
                type: "text",
                text: content,
              },
            ],
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
            content: [
              {
                type: "text",
                text: `Successfully wrote to ${path}`,
              },
            ],
          };
        } catch (error) {
          throw new Error(`Failed to write file: ${error}`);
        }
      }

      case "list_directory": {
        const { path } = ListDirectorySchema.parse(args);
        try {
          const items = await fs.readdir(path, { withFileTypes: true });
          const itemList = items.map((item) => ({
            name: item.name,
            type: item.isDirectory() ? "directory" : "file",
          }));

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(itemList, null, 2),
              },
            ],
          };
        } catch (error) {
          throw new Error(`Failed to list directory: ${error}`);
        }
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  });
} 