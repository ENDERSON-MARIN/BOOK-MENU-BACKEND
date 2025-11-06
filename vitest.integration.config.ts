import { defineConfig } from "vitest/config"
import path from "path"

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    include: [
      "tests/modules/**/integration/**/*.spec.ts",
      "tests/modules/**/e2e/**/*.spec.ts",
      "tests/system/**/*.spec.ts",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "dist/",
        "prisma/",
        "**/*.spec.ts",
        "**/*.test.ts",
        "src/server.ts",
      ],
    },
    setupFiles: ["./tests/shared/setup/integration.setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@tests": path.resolve(__dirname, "./tests"),
    },
  },
})
