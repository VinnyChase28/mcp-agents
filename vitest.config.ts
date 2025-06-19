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
    environment: "node",
    include: ["tests/**/*.{test,spec}.{js,ts}"],
    exclude: [
      "node_modules",
      "dist",
      ".next",
      "coverage",
      "**/node_modules/**/*.test.*",
      "**/node_modules/**/*.spec.*",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "dist/",
        ".next/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/coverage/**",
      ],
    },
    // Enable UI for better test visualization
    ui: true,
    // Mock external APIs by default
    mockReset: true,
    clearMocks: true,
    testTimeout: 60000,
    hookTimeout: 60000,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@/packages": resolve(__dirname, "./packages"),
      "@/apps": resolve(__dirname, "./apps"),
      "@/servers": resolve(__dirname, "./servers"),
      "@/mcp-agents/shared-types": resolve(
        __dirname,
        "./packages/shared-types/src",
      ),
      "@/mcp-agents/utils": resolve(__dirname, "./packages/utils/src"),
      "@/mcp-agents/config": resolve(__dirname, "./packages/config/src"),
    },
  },
});
