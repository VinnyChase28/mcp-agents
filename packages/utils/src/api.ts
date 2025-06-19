import type { ApiResponse } from "@mcp-agents/shared-types/api";

export const createApiResponse = <T>(
  success: boolean,
  data?: T,
  error?: string,
  message?: string,
): ApiResponse<T> => ({
  success,
  data,
  error,
  message,
}); 