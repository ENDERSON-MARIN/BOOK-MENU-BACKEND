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
      "tests/modules/**/*.spec.ts",
      "tests/system/**/*.spec.ts",
      "tests/shared/**/*.spec.ts",
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
    setupFiles: ["./tests/shared/setup/setup.ts"],
    typecheck: {
      tsconfig: "./tsconfig.test.json",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/app": path.resolve(__dirname, "./src/app"),
      "@/infrastructure": path.resolve(__dirname, "./src/infrastructure"),
      "@/config": path.resolve(__dirname, "./src/config"),
      "@tests": path.resolve(__dirname, "./tests"),
      "@tests/shared": path.resolve(__dirname, "./tests/shared"),
      "@tests/modules": path.resolve(__dirname, "./tests/modules"),
      "@tests/system": path.resolve(__dirname, "./tests/system"),
    },
  },
})
