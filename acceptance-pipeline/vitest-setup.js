/**
 * Vitest global setup for acceptance tests.
 *
 * Imported via vitest.config.js -> test.setupFiles.
 * Runs once before each test file.
 */

// Extend Vitest's expect with jest-dom matchers:
//   toBeInTheDocument(), toBeDisabled(), toHaveClass(), toHaveTextContent(), etc.
import "@testing-library/jest-dom";

// Silence React's "act()" warnings that fire when state updates happen
// outside a wrapped act() call in async userEvent chains.
// The tests still work correctly; this just keeps output readable.
const originalError = console.error.bind(console);
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === "string" &&
      (args[0].includes("Warning: An update to") ||
        args[0].includes("inside a test was not wrapped in act"))
    ) {
      return;
    }
    originalError(...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
