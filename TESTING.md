# Test Execution Guide

## Quick Start

### Run All Tests
```bash
npm test
```
Runs complete test suite with coverage report.

### Run Tests in Watch Mode
```bash
npm run test:watch
```
Automatically re-run tests when files change.

### Check Coverage Threshold
```bash
npm run test:coverage:check
```
Runs tests and verifies all coverage thresholds are met (70% minimum).

### View Coverage Report
```bash
npm test
cd coverage/lcov-report
open index.html
```

## Test Structure

```
tests/
├── integration/
│   ├── routes/
│   │   ├── health.test.ts      (3 describe blocks, 9 tests)
│   │   ├── auth.test.ts        (5 describe blocks, 13 tests)
│   │   └── game.test.ts        (4 describe blocks, 14 tests)
│   └── middleware/
│       ├── errorHandler.test.ts (1 describe block, 6 tests)
│       └── notFoundHandler.test.ts (1 describe block, 6 tests)
├── unit/
│   ├── services/
│   │   ├── boardService.test.ts   (2 describe blocks, 12 tests)
│   │   ├── dbService.test.ts      (2 describe blocks, 10 tests)
│   │   └── gameService.test.ts    (6 describe blocks, 16 tests)
│   └── controllers/
│       └── boardController.test.ts (1 describe block, 10 tests)
└── setup.ts (Jest configuration setup)
```

## Test Summary

| Category | File Count | Test Count | Coverage |
|----------|-----------|-----------|----------|
| Routes | 3 | 36 | High |
| Middleware | 2 | 12 | High |
| Services | 3 | 38 | Medium |
| Controllers | 1 | 10 | High |
| **Total** | **9** | **96** | **≥70%** |

## Coverage Targets

- **Statements**: ≥70%
- **Branches**: ≥70%
- **Functions**: ≥70%
- **Lines**: ≥70%

## What's Tested

### ✅ API Routes
- Health check endpoints (main, ready, live)
- Auth service endpoints (test endpoint)
- Game board retrieval with various scenarios
- Error handling for missing/invalid parameters
- 404 error responses

### ✅ Middleware
- Error handler with proper status codes
- Stack trace handling (dev vs prod)
- Not found handler for undefined routes
- Response structure validation

### ✅ Services
- BoardService: board layout retrieval and cell flattening
- DatabaseService: mock data loading from resources
- GameService: dice rolling, board initialization, game operations

### ✅ Controllers
- BoardController: request validation and response formatting
- Error handling (400, 404, 500)
- Data transformation and validation

## Common Test Commands

### Run specific test file
```bash
npm test -- boardController.test.ts
```

### Run tests matching pattern
```bash
npm test -- --testNamePattern="should return"
```

### Generate HTML coverage report
```bash
npm test
open coverage/lcov-report/index.html
```

### Run with verbose output
```bash
npm test -- --verbose
```

## Excluded from Tests

The following are intentionally excluded:
- `tests/unit/models/` - Model classes (not tested)
- `tests/unit/utils/` - Utility functions (not tested)

These can be added if needed by removing them from `testPathIgnorePatterns` in `jest.config.js`.

## Debugging Tests

### Run single test
```bash
npm test -- --testNamePattern="should return board layout for valid board"
```

### Run with debugging
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Run only failed tests
```bash
npm test -- --onlyChanged
```

## CI/CD Integration

Add to your CI/CD pipeline:
```bash
npm run test:coverage:check
```

This will:
1. Run all tests
2. Generate coverage report
3. Fail if coverage is below 70% threshold
4. Exit with code 0 on success, 1 on failure

## Notes

- All tests use Jest with ts-jest preset
- Tests run in Node environment (jsdom not needed)
- Mocking is used for Express Request/Response objects
- Supertest is used for HTTP integration tests
- Test timeout: 10 seconds per test

