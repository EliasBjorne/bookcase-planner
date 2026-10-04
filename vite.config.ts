import { execSync } from "node:child_process";
import { defineConfig } from "vite";

const sha = (process.env.GITHUB_SHA ?? tryGit()).slice(0, 7);
function tryGit(): string {
  try {
    return execSync("git rev-parse HEAD", { encoding: "utf8" }).trim();
  } catch {
    return "dev";
  }
}

// Served from GitHub Pages at /bookcase-planner/
export default defineConfig({
  base: process.env.CI ? "/bookcase-planner/" : "/",
  define: {
    __BUILD_INFO__: JSON.stringify(`${sha} · ${new Date().toISOString().slice(0, 16).replace("T", " ")}`),
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
} as Parameters<typeof defineConfig>[0]);
