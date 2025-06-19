import { spawn, ChildProcess } from 'child_process';
import { ToolCall, ToolDefinition } from '@mcp-agents/shared-types';

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
        name: 'calculator',
        command: 'node',
        args: ['./servers/calculator-mcp/dist/index.js'],
        tools: [
          {
            name: 'add',
            description: 'Add two numbers together',
            inputSchema: {
              type: 'object',
              properties: {
                a: { type: 'number', description: 'First number' },
                b: { type: 'number', description: 'Second number' }
              },
              required: ['a', 'b']
            }
          },
          {
            name: 'multiply',
            description: 'Multiply two numbers',
            inputSchema: {
              type: 'object',
              properties: {
                a: { type: 'number', description: 'First number' },
                b: { type: 'number', description: 'Second number' }
              },
              required: ['a', 'b']
            }
          },
          {
            name: 'divide',
            description: 'Divide two numbers',
            inputSchema: {
              type: 'object',
              properties: {
                a: { type: 'number', description: 'Dividend' },
                b: { type: 'number', description: 'Divisor' }
              },
              required: ['a', 'b']
            }
          }
        ]
      },
      {
        name: 'file-manager',
        command: 'node',
        args: ['./servers/file-manager-mcp/dist/index.js'],
        tools: [
          {
            name: 'read_file',
            description: 'Read the contents of a file',
            inputSchema: {
              type: 'object',
              properties: {
                path: { type: 'string', description: 'File path to read' }
              },
              required: ['path']
            }
          },
          {
            name: 'write_file',
            description: 'Write content to a file',
            inputSchema: {
              type: 'object',
              properties: {
                path: { type: 'string', description: 'File path to write' },
                content: { type: 'string', description: 'Content to write' }
              },
              required: ['path', 'content']
            }
          },
          {
            name: 'list_directory',
            description: 'List the contents of a directory',
            inputSchema: {
              type: 'object',
              properties: {
                path: { type: 'string', description: 'Directory path to list' }
              },
              required: ['path']
            }
          }
        ]
      },
      {
        name: 'api-client',
        command: 'node',
        args: ['./servers/api-client-mcp/dist/index.js'],
        tools: [
          {
            name: 'get_request',
            description: 'Make a GET request to a URL',
            inputSchema: {
              type: 'object',
              properties: {
                url: { type: 'string', description: 'URL to request' },
                headers: { type: 'object', description: 'Optional headers' }
              },
              required: ['url']
            }
          },
          {
            name: 'post_request',
            description: 'Make a POST request to a URL',
            inputSchema: {
              type: 'object',
              properties: {
                url: { type: 'string', description: 'URL to request' },
                data: { type: 'object', description: 'Data to send' },
                headers: { type: 'object', description: 'Optional headers' }
              },
              required: ['url']
            }
          }
        ]
      }
    ];

    serverConfigs.forEach(config => {
      this.servers.set(config.name, config);
    });
  }

  getAllTools(): ToolDefinition[] {
    const tools: ToolDefinition[] = [];
    this.servers.forEach(server => {
      tools.push(...server.tools);
    });
    return tools;
  }

  async callTool(toolCall: ToolCall): Promise<ToolCall> {
    const tool = this.findToolByName(toolCall.name);
    if (!tool) {
      return {
        ...toolCall,
        status: 'error',
        error: `Tool ${toolCall.name} not found`
      };
    }

    const serverName = this.getServerNameForTool(toolCall.name);
    if (!serverName) {
      return {
        ...toolCall,
        status: 'error',
        error: `Server not found for tool ${toolCall.name}`
      };
    }

    try {
      // For now, simulate the tool calls since we'd need to set up proper MCP communication
      const result = await this.simulateToolCall(toolCall);
      return {
        ...toolCall,
        status: 'success',
        result
      };
    } catch (error) {
      return {
        ...toolCall,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private findToolByName(name: string): ToolDefinition | undefined {
    for (const server of this.servers.values()) {
      const tool = server.tools.find(t => t.name === name);
      if (tool) return tool;
    }
    return undefined;
  }

  private getServerNameForTool(toolName: string): string | undefined {
    for (const [serverName, server] of this.servers.entries()) {
      if (server.tools.some(t => t.name === toolName)) {
        return serverName;
      }
    }
    return undefined;
  }

  private async simulateToolCall(toolCall: ToolCall): Promise<any> {
    // Simulate tool execution for demo purposes
    switch (toolCall.name) {
      case 'add':
        const { a: addA, b: addB } = toolCall.arguments;
        return { result: addA + addB };
      
      case 'multiply':
        const { a: mulA, b: mulB } = toolCall.arguments;
        return { result: mulA * mulB };
      
      case 'divide':
        const { a: divA, b: divB } = toolCall.arguments;
        if (divB === 0) throw new Error('Division by zero');
        return { result: divA / divB };
      
      case 'read_file':
        const { path: readPath } = toolCall.arguments;
        return { content: `Simulated content of file: ${readPath}` };
      
      case 'write_file':
        const { path: writePath, content } = toolCall.arguments;
        return { message: `Successfully wrote to ${writePath}` };
      
      case 'list_directory':
        const { path: dirPath } = toolCall.arguments;
        return { 
          files: [
            { name: 'example.txt', type: 'file' },
            { name: 'subfolder', type: 'directory' }
          ]
        };
      
      case 'get_request':
        const { url: getUrl } = toolCall.arguments;
        return { 
          status: 200, 
          data: { message: `Simulated GET response from ${getUrl}` }
        };
      
      case 'post_request':
        const { url: postUrl, data } = toolCall.arguments;
        return { 
          status: 200, 
          data: { message: `Simulated POST response from ${postUrl}`, received: data }
        };
      
      default:
        throw new Error(`Unknown tool: ${toolCall.name}`);
    }
  }

  cleanup() {
    this.servers.forEach(server => {
      if (server.process) {
        server.process.kill();
      }
    });
  }
} 