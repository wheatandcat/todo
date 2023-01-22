import { defineConfig } from "vitest/config";

// https://vitejs.dev/config/
export default defineConfig({
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: ["./setupTests.ts"],
    css: true,
  },
});