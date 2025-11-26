# Better Monopoly Server

[![CI/CD Pipeline](https://github.com/Akash0Dey/better-monopoly-server/actions/workflows/main.yml/badge.svg)](https://github.com/Akash0Dey/better-monopoly-server/actions/workflows/main.yml)

TypeScript Express backend for the Better Monopoly game. This is a multi-repository project with a separate React/Next.js frontend.

## 🚀 Features

- **TypeScript** - Type-safe development
- **Express.js** - Fast, minimalist web framework
- **TDD Approach** - Test-driven development with Jest
- **CI/CD Pipeline** - Automated testing and deployment with GitHub Actions
- **Docker Support** - Containerized deployment
- **API Documentation** - Swagger/OpenAPI integration
- **Code Quality** - ESLint, Prettier, and strict TypeScript
- **Security** - Helmet.js, CORS, and security best practices
- **Logging** - Winston logger with multiple transports
- **Health Checks** - Built-in health check endpoint

## 📋 Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Docker (optional, for containerization)

## 🛠️ Installation

```bash
# Clone the repository
git clone https://github.com/better-organization/better-monopoly-server.git
cd better-monopoly-server

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
```

## 🔧 Configuration

Environment variables can be configured in `.env.local`, `.env.development`, or `.env.production`:

- `NODE_ENV` - Environment (development, production, local)
- `PORT` - Server port (default: 3000)
- `APP_NAME` - Application name
- `API_PREFIX` - API route prefix (default: /api/v1)
- `CORS_ORIGIN` - Allowed CORS origins
- `LOG_LEVEL` - Logging level (debug, info, warn, error)
- `SWAGGER_ENABLED` - Enable/disable API documentation

## 🏃 Running the Application

### Development Mode

```bash
npm run dev
```

The server will start at `http://localhost:3000` with hot reload enabled.

### Production Mode

```bash
# Build the application
npm run build

# Start the server
npm start
```

### Docker

```bash
# Development
docker-compose up

# Production
docker-compose -f docker-compose.prod.yml up
```

## 🧪 Testing

This project follows a TDD (Test-Driven Development) approach with comprehensive test coverage.

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run tests in watch mode
npm run test:watch
```

### Coverage Thresholds

- **Lines**: 95%
- **Functions**: 95%
- **Branches**: 95%
- **Statements**: 95%

## 📝 Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Check code formatting
npm run format:check

# Format code
npm run format

# Type check
npm run type-check
```

## 📚 API Documentation

When `SWAGGER_ENABLED=true`, API documentation is available at:

```
http://localhost:3000/api-docs
```

## 🔄 CI/CD Pipeline

The project uses GitHub Actions for continuous integration and deployment to Render.

### Workflow Overview

**File**: `.github/workflows/main.yml`

The pipeline runs on every push and pull request to `main` and `develop` branches:

#### Quality Checks (Always Run)
1. **Lint** - ESLint code quality validation
2. **Format Check** - Prettier formatting verification
3. **Type Check** - TypeScript compilation without emit
4. **Tests** - Unit and integration tests on Node 18.x and 20.x
5. **Build** - Production build verification
6. **Security Audit** - npm audit for vulnerabilities

#### Deployment (Main Branch Only)
7. **Deploy to Render** - Automatic deployment when changes are pushed to `main` branch
   - **Disabled for PRs** - Pull requests trigger all checks but skip deployment
   - Uses Render Deploy Hook for zero-downtime deployments
   - Includes health check verification post-deployment

### Setting Up Render Deployment

#### 1. Create Render Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository: `Akash0Dey/better-monopoly-server`
4. Render will auto-detect `render.yaml` and configure the service

#### 2. Configure GitHub Secrets

Add these secrets to your GitHub repository (`Settings` → `Secrets and variables` → `Actions`):

| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `RENDER_DEPLOY_HOOK_URL` | Deploy hook URL | Render Dashboard → Service Settings → Deploy Hook |
| `RENDER_SERVICE_URL` | Your service URL | e.g., `https://better-monopoly-server.onrender.com` |
| `CODECOV_TOKEN` | (Optional) Code coverage | [codecov.io](https://codecov.io) |

**Getting Deploy Hook URL**:
- In Render Dashboard → Your Service → Settings → Deploy Hook
- Copy the URL (looks like: `https://api.render.com/deploy/srv-xxxxx?key=yyyyy`)

#### 3. Configure Environment Variables in Render

Go to your Render service → Environment tab and add:

| Variable | Value | Notes |
|----------|-------|-------|
| `NODE_ENV` | `production` | Auto-set by `render.yaml` |
| `PORT` | `10000` | Auto-set by Render |
| `APP_NAME` | `Better-Monopoly-Server` | Auto-set |
| `API_PREFIX` | `/api/v1` | Auto-set |
| `CORS_ORIGIN` | `https://your-frontend.com` | **Set manually** (comma-separated for multiple) |
| `LOG_LEVEL` | `info` | Auto-set |
| `SWAGGER_ENABLED` | `false` | Disabled in production |

**Note**: `CORS_ORIGIN` must be manually configured with your frontend URL(s).

### Deployment Process

1. **Make changes** on a feature branch
2. **Create Pull Request** to `main`
   - CI pipeline runs all quality checks
   - Deployment is **skipped** for PRs
3. **Merge to main**
   - CI pipeline runs all quality checks
   - Build succeeds → Deployment automatically triggers
   - Render pulls latest code, builds, and deploys
   - Health check verifies deployment success

### Monitoring Deployments

- **GitHub Actions**: View workflow runs in the `Actions` tab
- **Render Dashboard**: Real-time build logs and deployment status
- **Health Check**: `https://your-service.onrender.com/health`

### Manual Deployment

Trigger deployment manually via Render dashboard or using the deploy hook:

```bash
curl -X POST "$RENDER_DEPLOY_HOOK_URL"
```

## 📁 Project Structure

```
better-monopoly-server/
├── src/
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── middlewares/      # Custom middleware
│   ├── routes/           # API routes
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   ├── app.ts           # Express app setup
│   └── index.ts         # Application entry point
├── __tests__/
│   ├── unit/            # Unit tests
│   └── integration/     # Integration tests
├── dist/                # Compiled JavaScript (generated)
├── coverage/            # Test coverage reports (generated)
├── .github/
│   └── workflows/       # CI/CD workflows
├── Dockerfile           # Production Docker image
├── Dockerfile.dev       # Development Docker image
├── docker-compose.yml   # Development compose file
├── docker-compose.prod.yml  # Production compose file
├── package.json         # Node.js dependencies
├── tsconfig.json       # TypeScript configuration
├── jest.config.js      # Jest configuration
├── .eslintrc.js        # ESLint configuration
└── .prettierrc         # Prettier configuration
```

## 🔗 API Endpoints

### Health Check

```
GET /health
```

### Authentication

```
POST /api/v1/auth/login
```

**Request Body:**
```json
{
  "username": "john_doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful"
}
```

## 🚢 Deployment

### Docker Deployment

```bash
# Build the image
docker build -t better-monopoly-server .

# Run the container
docker run -p 3000:3000 --env-file .env.production better-monopoly-server
```

### Environment-Specific Deployment

The CI/CD pipeline automatically deploys:
- **Staging**: On push to `develop` branch
- **Production**: On push to `main` branch

## 🔐 Security

- **Helmet.js** - Security headers
- **CORS** - Cross-origin resource sharing
- **Input Validation** - express-validator
- **npm audit** - Automated security audits
- **Snyk** - Continuous security monitoring

## 🤝 Contributing

1. Create a feature branch from `develop`
2. Write tests first (TDD approach)
3. Implement the feature
4. Ensure all tests pass and coverage meets thresholds
5. Run linting and formatting
6. Submit a pull request to `develop`

## 📄 License

Private - For Internal Use Only

## 👥 Team

Monopoly Dev Team - developers@monopoly.com

## 🔗 Related Repositories

- Frontend: [better-monopoly-frontend](https://github.com/better-organization/better-monopoly-frontend)

## 📊 Monitoring

- Health check endpoint: `/health`
- Docker health checks enabled
- Winston logging with multiple transports

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Change PORT in .env file
   PORT=3001
   ```

2. **Dependencies not installed**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **TypeScript errors**
   ```bash
   npm run type-check
   ```

## 📈 Future Enhancements

- Database integration (PostgreSQL/MongoDB)
- Authentication & authorization (JWT)
- WebSocket support for real-time game updates
- Caching layer (Redis)
- Rate limiting
- API versioning
- Monitoring & observability (Prometheus, Grafana)
