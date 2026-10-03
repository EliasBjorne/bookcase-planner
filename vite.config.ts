import { defineConfig } from "vite";

// Served from GitHub Pages at /bookcase-planner/
export default defineConfig({
  base: process.env.CI ? "/bookcase-planner/" : "/",
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
} as Parameters<typeof defineConfig>[0]);
