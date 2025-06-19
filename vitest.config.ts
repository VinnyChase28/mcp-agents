/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import { resolve } from "path";
import { config } from "dotenv";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from the root .env file
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// Load environment variables from .env file
config();

export default defineConfig({
  test: {
    globals: true,
    include: ["**/*.test.ts"],
    exclude: ["**/node_modules/**", "**/dist/**"],
    testTimeout: 60000,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@/packages": resolve(__dirname, "./packages"),
      "@/apps": resolve(__dirname, "./apps"),
      "@mcp-agents/shared-types": resolve(
        __dirname,
        "./packages/shared-types/src",
      ),
      "@mcp-agents/utils": resolve(__dirname, "./packages/utils/src"),
      "@mcp-agents/config": resolve(__dirname, "./packages/config/src"),
    },
  },
});
