import type { Message } from "ai";

export const generateMessageId = (): string => {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const createMessage = (
  content: string,
  role: Message["role"],
): Message => ({
  id: generateMessageId(),
  content,
  role,
  createdAt: new Date(),
}); 