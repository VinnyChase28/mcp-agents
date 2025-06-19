import { z } from "zod";

// MCP-specific tool types
export interface Tool {
  name: string;
  description: string;
  parameters: Record<string, unknown>; // JSON Schema for parameters
  server: string; // Which MCP server provides this tool
}

// Tool execution result
export interface ToolResult {
  success: boolean;
  result?: unknown;
  error?: string;
  toolName: string;
  args: Record<string, unknown>;
}

// Tool usage tracking
export const ToolUsageSchema = z.object({
  sessionId: z.string(),
  toolName: z.string(),
  status: z.enum(["active", "completed", "error"]),
  timestamp: z.date(),
  duration: z.number().optional(),
});

export type ToolUsage = z.infer<typeof ToolUsageSchema>;
