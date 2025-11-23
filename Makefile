.PHONY: help install dev build start test lint format clean docker-up docker-down

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies
	npm install

dev: ## Run development server with hot reload
	npm run dev

build: ## Build the application for production
	npm run build

start: ## Start production server
	npm start

test: ## Run all tests with coverage
	npm test

test-unit: ## Run unit tests only
	npm run test:unit

test-integration: ## Run integration tests only
	npm run test:integration

test-watch: ## Run tests in watch mode
	npm run test:watch

lint: ## Lint code
	npm run lint

lint-fix: ## Fix linting issues
	npm run lint:fix

format: ## Format code with Prettier
	npm run format

format-check: ## Check code formatting
	npm run format:check

type-check: ## Run TypeScript type checking
	npm run type-check

clean: ## Clean build artifacts
	rm -rf dist coverage node_modules

docker-build: ## Build Docker image
	docker build -t better-monopoly-server .

docker-build-dev: ## Build development Docker image
	docker build -f Dockerfile.dev -t better-monopoly-server:dev .

docker-up: ## Start development environment with Docker Compose
	docker-compose up

docker-down: ## Stop development environment
	docker-compose down

docker-up-prod: ## Start production environment with Docker Compose
	docker-compose -f docker-compose.prod.yml up

docker-down-prod: ## Stop production environment
	docker-compose -f docker-compose.prod.yml down

ci: lint type-check test build ## Run all CI checks locally

setup: install ## Complete setup for new developers
	@echo "Copying environment file..."
	@if [ ! -f .env.local ]; then cp .env.example .env.local; fi
	@echo "Setup complete! Run 'make dev' to start development server"
