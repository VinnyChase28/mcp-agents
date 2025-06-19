import { z } from "zod";

export const GetRequestSchema = z.object({
  url: z.string().describe("URL to make GET request to"),
  headers: z.record(z.string()).optional().describe("Optional headers"),
});

export const PostRequestSchema = z.object({
  url: z.string().describe("URL to make POST request to"),
  body: z.string().describe("Request body"),
  headers: z.record(z.string()).optional().describe("Optional headers"),
});

export const PutRequestSchema = z.object({
  url: z.string().describe("URL to make PUT request to"),
  body: z.string().describe("Request body"),
  headers: z.record(z.string()).optional().describe("Optional headers"),
});

export const DeleteRequestSchema = z.object({
  url: z.string().describe("URL to make DELETE request to"),
  headers: z.record(z.string()).optional().describe("Optional headers"),
}); 