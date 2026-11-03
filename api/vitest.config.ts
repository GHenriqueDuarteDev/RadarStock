import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: false,
    environment: "node",
    include: ["**/*.{test,spec}.ts"],
    exclude: ["node_modules", "generated"],
    setupFiles: ["./tests/setup.ts"],
    clearMocks: true,
  },
});
