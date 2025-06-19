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

// Note: Specific tool schemas are defined in their respective MCP server packages 