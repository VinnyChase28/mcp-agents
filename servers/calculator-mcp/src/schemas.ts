import { z } from "zod";

export const AddSchema = z.object({
  a: z.number().describe("First number"),
  b: z.number().describe("Second number"),
});

export const MultiplySchema = z.object({
  a: z.number().describe("First number"),
  b: z.number().describe("Second number"),
});

export const DivideSchema = z.object({
  a: z.number().describe("Dividend"),
  b: z.number().describe("Divisor"),
}); 