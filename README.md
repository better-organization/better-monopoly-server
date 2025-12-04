# Better Monopoly Server

Backend server for the Better Monopoly game. Built with Express, TypeScript, and Docker. This service provides all game logic and authentication for the Monopoly game, designed to be consumed by a separate React frontend (running in Docker).

## Features
- Express + TypeScript backend
- Game logic and authentication structure (placeholders)
- Health, test, and placeholder endpoints
- Dockerized for production and development
- Yarn for package management
- Jest + Supertest for testing
- ESLint + Prettier for code quality
- GitHub Actions CI/CD pipeline

## Getting Started

### Prerequisites
- Node.js >= 18
- Yarn >= 1.22
- Docker (for containerization)

### Install dependencies
```bash
yarn install
```

### Development
Start the server in development mode (port 8080):
```bash
yarn dev
```

### Build
```bash
yarn build
```

### Start (production)
```bash
yarn start
```

### Test
```bash
yarn test
```

### Lint
```bash
yarn lint
```

### Format
```bash
yarn format
```

## Docker
Build and run the server in Docker:
```bash
docker-compose up --build
```

For development:
```bash
docker-compose -f docker-compose.dev.yml up --build
```

## API Documentation

### Interactive Documentation
The server includes comprehensive Swagger/OpenAPI documentation accessible at:
- **Local**: http://localhost:8080/api-docs
- **Interactive UI**: Test endpoints directly from the browser

### Authentication Endpoints

#### Check UserId Availability
```bash
curl -X POST http://localhost:8080/api/auth/userIdExists \
  -H "Content-Type: application/json" \
  -d '{"userId": "player-123"}'
```

#### Register New User
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "player123",
    "password": "SecurePass123",
    "userId": "player-123-unique"
  }'
```

#### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "player-123-unique",
    "password": "SecurePass123"
  }'
```

Response includes JWT token:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Health Endpoints
- `GET /api/health` - Health check with uptime and environment info
- `GET /api/health/ready` - Readiness probe
- `GET /api/health/live` - Liveness probe

### Game Endpoints
- `GET /api/game/test` - Game service status
- `GET /api/game/board/:boardId/version/:version` - Get board layout

### Rate Limiting
Authentication endpoints are rate-limited in production:
- **Limit**: 5 requests per 15 minutes per IP
- **Applies to**: `/register`, `/login`, `/userIdExists`
- **Disabled in**: Test environment

### Validation Rules
- **Username**: 3+ characters, alphanumeric and underscores only
- **Password**: 6+ characters minimum
- **UserId**: 3+ characters, alphanumeric, underscores, and hyphens

## Endpoints
- `GET /api/health` - Health check
- `GET /api/auth/test` - Auth test
- `GET /api/game/test` - Game test

## CI/CD
GitHub Actions workflow runs lint, format, build, test, and Docker health check on every push/PR to `main`.

## Progress
See [PROGRESS.md](./PROGRESS.md) for setup and development log.

## License
MIT
