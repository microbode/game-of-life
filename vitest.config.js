import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    // Use jsdom so React components can render against a real DOM API
    environment: "jsdom",

    // Import @testing-library/jest-dom matchers (toBeInTheDocument, etc.)
    // in every test file without an explicit import
    setupFiles: ["./acceptance-pipeline/vitest-setup.js"],

    // Only run acceptance tests from the generated directory
    include: ["generated-acceptance-tests/**/*.test.{js,jsx}"],

    // Never time out from hanging intervals — the Game of Life ticker
    // uses setInterval which must be cleaned up; fail fast if something leaks
    testTimeout: 10000,

    globals: true,
  },
});
