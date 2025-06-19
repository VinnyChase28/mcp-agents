import { z } from 'zod';

// Tool-related types and schemas
export const ToolCallSchema = z.object({
  id: z.string(),
  name: z.string(),
  arguments: z.record(z.any()),
  result: z.any().optional(),
  status: z.enum(['pending', 'success', 'error']).default('pending'),
  error: z.string().optional(),
  timestamp: z.date().default(() => new Date()),
});

export type ToolCall = z.infer<typeof ToolCallSchema>;

export const ToolDefinitionSchema = z.object({
  name: z.string(),
  description: z.string(),
  inputSchema: z.object({
    type: z.literal('object'),
    properties: z.record(z.any()),
    required: z.array(z.string()).optional(),
  }),
});

export type ToolDefinition = z.infer<typeof ToolDefinitionSchema>;

// Tool usage tracking
export const ToolUsageSchema = z.object({
  sessionId: z.string(),
  toolName: z.string(),
  status: z.enum(['active', 'completed', 'error']),
  timestamp: z.date(),
  duration: z.number().optional(),
});

export type ToolUsage = z.infer<typeof ToolUsageSchema>; 