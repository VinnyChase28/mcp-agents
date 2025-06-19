import { z } from "zod";

// Define tool schemas
export const SearchSchema = z.object({
  query: z.string().describe("The search query to find information about"),
  model: z
    .enum(["sonar-pro", "sonar-reasoning", "sonar"])
    .optional()
    .describe("Model to use"),
  search_domain_filter: z
    .array(z.string())
    .optional()
    .describe("List of domains to search within"),
  search_recency_filter: z
    .enum(["month", "week", "day", "hour"])
    .optional()
    .describe("Filter by recency"),
  return_images: z
    .boolean()
    .optional()
    .describe("Whether to return relevant images"),
  return_related_questions: z
    .boolean()
    .optional()
    .describe("Whether to return related questions"),
  max_tokens: z.number().optional().describe("Maximum tokens in response"),
  temperature: z
    .number()
    .min(0)
    .max(2)
    .optional()
    .describe("Temperature for response generation"),
});

export const AcademicSearchSchema = z.object({
  query: z.string().describe("The academic search query"),
  max_tokens: z.number().optional().describe("Maximum tokens in response"),
  return_related_questions: z
    .boolean()
    .optional()
    .describe("Whether to return related academic questions"),
});

export interface PerplexityResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    finish_reason: string;
    message: {
      role: string;
      content: string;
    };
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
} 