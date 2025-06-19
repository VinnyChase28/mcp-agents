// Chat Types
export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

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

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: boolean;
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