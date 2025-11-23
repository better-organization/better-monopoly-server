# Migration Guide: Java Spring Boot to TypeScript Express

This document outlines the migration from the Java Spring Boot backend to a TypeScript Express backend.

## Overview

The Better Monopoly Server has been successfully migrated from:

- **From**: Java 21 + Spring Boot 3.5.4 + Gradle
- **To**: Node.js 18 + TypeScript 5.5 + Express 4.19

## Key Changes

### 1. Technology Stack

| Component     | Before          | After            |
| ------------- | --------------- | ---------------- |
| Runtime       | JDK 21          | Node.js 18       |
| Language      | Java            | TypeScript       |
| Framework     | Spring Boot     | Express.js       |
| Build Tool    | Gradle          | npm/TypeScript   |
| Testing       | JUnit + Mockito | Jest + Supertest |
| Documentation | SpringDoc       | Swagger-jsdoc    |
| Configuration | application.yml | .env files       |

### 2. Project Structure

**Before (Java):**

```
src/main/java/com/better/monopoly/server/
├── BetterMonopolyServerApplication.java
├── config/
├── controller/
└── contant/
```

**After (TypeScript):**

```
src/
├── config/
├── controllers/
├── middlewares/
├── routes/
├── types/
├── utils/
├── app.ts
└── index.ts
```

### 3. Dependency Management

**Before (build.gradle):**

```gradle
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springdoc:springdoc-openapi-starter-webmvc-ui'
}
```

**After (package.json):**

```json
{
  "dependencies": {
    "express": "^4.19.2",
    "swagger-jsdoc": "^6.2.8"
  }
}
```

### 4. Configuration

**Before (application.yml):**

```yaml
spring:
  application:
    name: Better-Monopoly-Server
```

**After (.env):**

```bash
NODE_ENV=development
PORT=3000
APP_NAME=Better-Monopoly-Server
```

### 5. API Endpoints

The API endpoints remain the same:

```
POST /api/v1/auth/login
```

**Request/Response formats are unchanged** to maintain compatibility with the frontend.

### 6. Docker

**Before:**

- Multi-stage Java build with JDK 21
- Runtime image with JRE 21
- Port 8080

**After:**

- Multi-stage Node.js build
- Alpine-based production image
- Non-root user for security
- Port 3000
- Health checks

### 7. Testing

**Before (JUnit):**

```java
@Test
public void testLogin() {
    // Test code
}
```

**After (Jest):**

```typescript
describe('Auth Controller', () => {
  it('should login successfully', async () => {
    // Test code
  });
});
```

### 8. CI/CD Pipeline

**Enhanced GitHub Actions workflow:**

- Separate jobs for lint, type-check, unit tests, integration tests
- Docker image build and push to GitHub Container Registry
- Security scanning with npm audit and Snyk
- Automated deployment to staging and production
- Code coverage reporting

## Migration Steps Completed

1. ✅ Created TypeScript project structure
2. ✅ Converted Java controllers to Express routes
3. ✅ Migrated DTOs to TypeScript interfaces
4. ✅ Set up Jest for TDD
5. ✅ Created comprehensive test suite
6. ✅ Configured CI/CD pipeline
7. ✅ Updated Docker configuration
8. ✅ Migrated configuration to environment variables
9. ✅ Set up API documentation with Swagger

## Running the Migrated Application

### Quick Start

```bash
# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env.local

# Run in development mode
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Start production server
npm start
```

### Docker

```bash
# Development
docker-compose up

# Production
docker-compose -f docker-compose.prod.yml up
```

## API Compatibility

The migrated API maintains **100% backward compatibility** with the existing frontend:

- Same endpoint paths
- Same request/response formats
- Same validation rules
- Same error responses

## Breaking Changes

None. The API contract remains unchanged.

## Performance Improvements

- **Faster startup time**: Express typically starts faster than Spring Boot
- **Lower memory footprint**: Node.js generally uses less memory than JVM
- **Async by default**: Node.js event loop provides better concurrency for I/O operations

## Code Quality Metrics

- **Test Coverage**: 95% minimum (unchanged)
- **Type Safety**: Strict TypeScript configuration
- **Linting**: ESLint with TypeScript rules
- **Formatting**: Prettier for consistent code style

## Removed Features

The following Java-specific features were removed:

- Spring Boot DevTools
- H2 Database (to be re-added when needed)
- JPA/Hibernate (to be re-added when needed)
- Lombok annotations (replaced with TypeScript interfaces)

These can be added back using TypeScript equivalents:

- Database: Use TypeORM, Prisma, or Sequelize
- Hot reload: ts-node-dev (already included)

## Next Steps

1. **Add Database Integration**: Choose and integrate a database (PostgreSQL, MongoDB)
2. **Implement Authentication**: Add JWT-based authentication
3. **Add WebSocket Support**: For real-time game features
4. **Implement Game Logic**: Build the monopoly game mechanics
5. **Add Caching**: Consider Redis for session management
6. **Set up Monitoring**: Add APM tools (New Relic, DataDog, etc.)

## Rollback Plan

If needed to rollback:

1. The Java code is preserved in the repository
2. Can revert to Java by checking out previous commits
3. Frontend remains compatible with both backends

## Support

For questions or issues:

- Email: developers@monopoly.com
- Documentation: See README.md
- Contributing: See CONTRIBUTING.md

## References

- [Express.js Documentation](https://expressjs.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Jest Documentation](https://jestjs.io/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
