import { z } from "zod";

export const Schemas = {
  add: z.object({
    numbers: z.array(z.number()).describe("Array of numbers to add"),
  }),
  subtract: z.object({
    minuend: z.number().describe("Number to subtract from"),
    subtrahend: z.number().describe("Number to subtract"),
  }),
  multiply: z.object({
    numbers: z.array(z.number()).describe("Array of numbers to multiply"),
  }),
  divide: z.object({
    dividend: z.number().describe("Number to be divided"),
    divisor: z.number().describe("Number to divide by"),
  }),
  power: z.object({
    base: z.number().describe("Base number"),
    exponent: z.number().describe("Exponent"),
  }),
  sqrt: z.object({
    number: z.number().describe("Number to find square root of"),
  }),
  nth_root: z.object({
    number: z.number().describe("Number to find root of"),
    n: z.number().describe("Root degree"),
  }),
  sin: z.object({ angle: z.number().describe("Angle in radians") }),
  cos: z.object({ angle: z.number().describe("Angle in radians") }),
  tan: z.object({ angle: z.number().describe("Angle in radians") }),
  asin: z.object({
    value: z.number().min(-1).max(1).describe("Value between -1 and 1"),
  }),
  acos: z.object({
    value: z.number().min(-1).max(1).describe("Value between -1 and 1"),
  }),
  atan: z.object({ value: z.number().describe("Input value") }),
  atan2: z.object({
    y: z.number().describe("Y coordinate"),
    x: z.number().describe("X coordinate"),
  }),
  deg_to_rad: z.object({ degrees: z.number().describe("Angle in degrees") }),
  rad_to_deg: z.object({ radians: z.number().describe("Angle in radians") }),
  ln: z.object({ number: z.number().positive().describe("Positive number") }),
  log10: z.object({
    number: z.number().positive().describe("Positive number"),
  }),
  log: z.object({
    number: z.number().positive().describe("Positive number"),
    base: z.number().positive().describe("Base (positive number, not 1)"),
  }),
  mean: z.object({
    numbers: z.array(z.number()).min(1).describe("Array of numbers"),
  }),
  median: z.object({
    numbers: z.array(z.number()).min(1).describe("Array of numbers"),
  }),
  mode: z.object({
    numbers: z.array(z.number()).min(1).describe("Array of numbers"),
  }),
  std_dev: z.object({
    numbers: z.array(z.number()).min(2).describe("Array of numbers"),
    population: z
      .boolean()
      .default(false)
      .describe("Use population formula (default: sample)"),
  }),
  factorial: z.object({
    n: z
      .number()
      .int()
      .min(0)
      .max(170)
      .describe("Non-negative integer (max 170)"),
  }),
  fibonacci: z.object({
    n: z
      .number()
      .int()
      .min(0)
      .max(1476)
      .describe("Non-negative integer (max 1476)"),
  }),
  gcd: z.object({
    numbers: z.array(z.number().int()).min(2).describe("Array of integers"),
  }),
  lcm: z.object({
    numbers: z.array(z.number().int()).min(2).describe("Array of integers"),
  }),
  solve_quadratic: z.object({
    a: z.number().describe("Coefficient of x²"),
    b: z.number().describe("Coefficient of x"),
    c: z.number().describe("Constant term"),
  }),
  get_constant: z.object({
    name: z
      .enum([
        "PI",
        "E",
        "PHI",
        "SQRT2",
        "SQRT1_2",
        "LN2",
        "LN10",
        "LOG2E",
        "LOG10E",
      ])
      .describe("Name of the mathematical constant"),
  }),
  evaluate: z.object({
    expression: z.string().describe("Mathematical expression to evaluate"),
  }),
  round: z.object({
    number: z.number().describe("Number to round"),
    decimals: z
      .number()
      .int()
      .min(0)
      .default(0)
      .describe("Number of decimal places"),
  }),
  floor: z.object({ number: z.number().describe("Number to floor") }),
  ceil: z.object({ number: z.number().describe("Number to ceil") }),
}; 