import { z } from 'zod';
import { ToolDefinitionSchema } from './tools.js';

// MCP Agent Types
export interface MCPAgent {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  status: 'active' | 'inactive' | 'error';
  config: Record<string, unknown>;
}

export interface MCPTool {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface MCPResource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

// MCP Server Types
export interface McpServerConfig {
  name: string;
  version: string;
  description?: string;
}

export interface McpToolResponse {
  content: Array<{
    type: "text" | "image";
    text?: string;
    data?: string;
    mimeType?: string;
  }>;
}

// Utility functions
export const createSuccessResponse = (message: string): McpToolResponse => ({
  content: [{
    type: "text",
    text: message
  }]
});

export const createErrorResponse = (error: string): McpToolResponse => ({
  content: [{
    type: "text", 
    text: `Error: ${error}`
  }]
});

// Validation helpers
export const validateFilePath = (path: string): boolean => {
  return typeof path === "string" && path.length > 0 && !path.includes("..");
};

// MCP Server Tool Definitions
export const CalculatorToolsSchema = z.object({
  add: ToolDefinitionSchema.extend({
    name: z.literal('add'),
    description: z.literal('Add two numbers together'),
    inputSchema: z.object({
      type: z.literal('object'),
      properties: z.object({
        a: z.object({ type: z.literal('number'), description: z.string() }),
        b: z.object({ type: z.literal('number'), description: z.string() }),
      }),
      required: z.array(z.literal('a').or(z.literal('b'))),
    }),
  }),
  multiply: ToolDefinitionSchema.extend({
    name: z.literal('multiply'),
    description: z.literal('Multiply two numbers'),
    inputSchema: z.object({
      type: z.literal('object'),
      properties: z.object({
        a: z.object({ type: z.literal('number'), description: z.string() }),
        b: z.object({ type: z.literal('number'), description: z.string() }),
      }),
      required: z.array(z.literal('a').or(z.literal('b'))),
    }),
  }),
  divide: ToolDefinitionSchema.extend({
    name: z.literal('divide'),
    description: z.literal('Divide two numbers'),
    inputSchema: z.object({
      type: z.literal('object'),
      properties: z.object({
        a: z.object({ type: z.literal('number'), description: z.string() }),
        b: z.object({ type: z.literal('number'), description: z.string() }),
      }),
      required: z.array(z.literal('a').or(z.literal('b'))),
    }),
  }),
});

export const FileManagerToolsSchema = z.object({
  read_file: ToolDefinitionSchema.extend({
    name: z.literal('read_file'),
    description: z.literal('Read the contents of a file'),
    inputSchema: z.object({
      type: z.literal('object'),
      properties: z.object({
        path: z.object({ type: z.literal('string'), description: z.string() }),
      }),
      required: z.array(z.literal('path')),
    }),
  }),
  write_file: ToolDefinitionSchema.extend({
    name: z.literal('write_file'),
    description: z.literal('Write content to a file'),
    inputSchema: z.object({
      type: z.literal('object'),
      properties: z.object({
        path: z.object({ type: z.literal('string'), description: z.string() }),
        content: z.object({ type: z.literal('string'), description: z.string() }),
      }),
      required: z.array(z.literal('path').or(z.literal('content'))),
    }),
  }),
  list_directory: ToolDefinitionSchema.extend({
    name: z.literal('list_directory'),
    description: z.literal('List the contents of a directory'),
    inputSchema: z.object({
      type: z.literal('object'),
      properties: z.object({
        path: z.object({ type: z.literal('string'), description: z.string() }),
      }),
      required: z.array(z.literal('path')),
    }),
  }),
});

export const ApiClientToolsSchema = z.object({
  get_request: ToolDefinitionSchema.extend({
    name: z.literal('get_request'),
    description: z.literal('Make a GET request to a URL'),
    inputSchema: z.object({
      type: z.literal('object'),
      properties: z.object({
        url: z.object({ type: z.literal('string'), description: z.string() }),
        headers: z.object({ type: z.literal('object'), description: z.string() }).optional(),
      }),
      required: z.array(z.literal('url')),
    }),
  }),
  post_request: ToolDefinitionSchema.extend({
    name: z.literal('post_request'),
    description: z.literal('Make a POST request to a URL'),
    inputSchema: z.object({
      type: z.literal('object'),
      properties: z.object({
        url: z.object({ type: z.literal('string'), description: z.string() }),
        data: z.object({ type: z.literal('object'), description: z.string() }).optional(),
        headers: z.object({ type: z.literal('object'), description: z.string() }).optional(),
      }),
      required: z.array(z.literal('url')),
    }),
  }),
}); 