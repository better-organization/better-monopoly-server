# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-11-23

### Added
- Migrated from Java Spring Boot to TypeScript Express
- Express.js server with TypeScript
- Authentication endpoints (login)
- Comprehensive test suite with Jest
- CI/CD pipeline with GitHub Actions
- Docker support for development and production
- API documentation with Swagger/OpenAPI
- Health check endpoint
- Request validation with express-validator
- Logging with Winston
- Security middleware (Helmet, CORS)
- ESLint and Prettier configuration
- 95% test coverage requirement

### Changed
- Architecture migrated from Spring Boot to Express
- Build system changed from Gradle to npm
- JDK 21 replaced with Node.js 18
- SpringDoc replaced with swagger-jsdoc
- JUnit replaced with Jest
- Lombok patterns replaced with TypeScript interfaces

### Removed
- Java source code
- Gradle build configuration
- Spring Boot dependencies
- H2 database configuration (to be re-added as needed)
