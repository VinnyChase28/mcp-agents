import type { Message } from "@mcp-agents/shared-types/chat";

export const generateMessageId = (): string => {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const createMessage = (
  content: string,
  role: Message["role"],
  metadata?: Record<string, unknown>,
): Message => ({
  id: generateMessageId(),
  content,
  role,
  timestamp: new Date(),
  metadata,
}); 