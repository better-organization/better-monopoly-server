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
