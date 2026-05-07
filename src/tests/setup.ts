import { beforeAll, afterAll } from "bun:test";

// Mocking global objects if needed
// Bun.mock() can be used for module mocking if necessary

// Global environment variables for testing
process.env.BETTER_AUTH_URL = "http://localhost:3000";
process.env.BETTER_AUTH_SECRET = "test-secret-key-that-is-at-least-32-characters-long";
process.env.DATABASE_URL = "postgresql://user:pass@localhost:5432/db";

beforeAll(() => {
  // Setup logic
});

afterAll(() => {
  // Cleanup logic
});
