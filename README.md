# Better Monopoly Server

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

The project uses GitHub Actions for continuous integration and deployment:

### Workflows

1. **CI/CD Pipeline** (`.github/workflows/ci-cd.yml`)
   - Lint and code quality checks
   - TypeScript type checking
   - Unit and integration tests
   - Build application
   - Docker image build and push
   - Security audits
   - Deploy to staging (develop branch)
   - Deploy to production (main branch)

2. **PR Validation** (`.github/workflows/pr-validation.yml`)
   - Automated PR checks
   - Test coverage reporting
   - Build validation

### Branch Strategy

- `main` - Production-ready code
- `develop` - Development branch
- Feature branches - Created from `develop`

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
