import { z } from "zod";

export const ReadFileSchema = z.object({
  path: z.string().describe("Path to the file to read"),
});

export const WriteFileSchema = z.object({
  path: z.string().describe("Path to the file to write"),
  content: z.string().describe("Content to write to the file"),
});

export const ListDirectorySchema = z.object({
  path: z.string().describe("Path to the directory to list"),
}); 