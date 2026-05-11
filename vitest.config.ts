import path from "node:path";
import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(dirname, "src"),
    },
    tsconfigPaths: true,
  },
  test: {
    environment: "jsdom",
    exclude: ["tests/e2e/**", "node_modules/**", ".next/**"],
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
  },
});
