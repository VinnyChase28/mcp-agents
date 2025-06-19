import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { promises as fs } from "fs";
import { dirname, join } from "path";
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

  // Register resources capability
  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    // Expose common directory structures as resources
    const resources = [
      {
        uri: "file://project-structure",
        name: "Project Structure",
        description: "Overview of the current project directory structure",
        mimeType: "text/plain",
      },
      {
        uri: "file://recent-files",
        name: "Recently Modified Files",
        description: "List of recently modified files in the project",
        mimeType: "application/json",
      },
    ];

    return { resources };
  });

  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const { uri } = request.params;

    switch (uri) {
      case "file://project-structure":
        try {
          const structure = await getDirectoryStructure(process.cwd(), 2);
          return {
            contents: [
              {
                uri,
                mimeType: "text/plain",
                text: structure,
              },
            ],
          };
        } catch (error) {
          throw new Error(`Failed to read project structure: ${error}`);
        }

      case "file://recent-files":
        try {
          const recentFiles = await getRecentFiles(process.cwd(), 10);
          return {
            contents: [
              {
                uri,
                mimeType: "application/json",
                text: JSON.stringify(recentFiles, null, 2),
              },
            ],
          };
        } catch (error) {
          throw new Error(`Failed to read recent files: ${error}`);
        }

      default:
        throw new Error(`Unknown resource: ${uri}`);
    }
  });
}

async function getDirectoryStructure(dirPath: string, maxDepth: number): Promise<string> {
  const structure: string[] = [];
  
  async function traverse(currentPath: string, depth: number, prefix: string = "") {
    if (depth > maxDepth) return;
    
    try {
      const items = await fs.readdir(currentPath, { withFileTypes: true });
      
      for (const item of items) {
        if (item.name.startsWith('.')) continue; // Skip hidden files
        
        const isDirectory = item.isDirectory();
        const symbol = isDirectory ? "📁" : "📄";
        structure.push(`${prefix}${symbol} ${item.name}`);
        
        if (isDirectory && depth < maxDepth) {
          await traverse(join(currentPath, item.name), depth + 1, prefix + "  ");
        }
      }
    } catch (error) {
      structure.push(`${prefix}❌ Error reading directory: ${error}`);
    }
  }
  
  await traverse(dirPath, 0);
  return structure.join('\n');
}

async function getRecentFiles(dirPath: string, limit: number): Promise<Array<{path: string, modified: string, size: number}>> {
  const files: Array<{path: string, modified: Date, size: number}> = [];
  
  async function collectFiles(currentPath: string) {
    try {
      const items = await fs.readdir(currentPath, { withFileTypes: true });
      
      for (const item of items) {
        if (item.name.startsWith('.')) continue;
        
        const fullPath = join(currentPath, item.name);
        
        if (item.isFile()) {
          const stats = await fs.stat(fullPath);
          files.push({
            path: fullPath,
            modified: stats.mtime,
            size: stats.size,
          });
        } else if (item.isDirectory()) {
          await collectFiles(fullPath);
        }
      }
    } catch {
      // Skip directories we can't read
    }
  }
  
  await collectFiles(dirPath);
  
  return files
    .sort((a, b) => b.modified.getTime() - a.modified.getTime())
    .slice(0, limit)
    .map(file => ({
      path: file.path,
      modified: file.modified.toISOString(),
      size: file.size,
    }));
} 