import { beforeAll, afterAll } from '@jest/globals';

// Global test setup
beforeAll(async () => {
  // Setup test environment
  process.env['NODE_ENV'] = 'test';
  process.env['PORT'] = '0'; // Use random port for testing
});

afterAll(async () => {
  // Cleanup after all tests
});
