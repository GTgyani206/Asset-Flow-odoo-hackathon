.PHONY: help dev build lint format typecheck test infra-up infra-down db-generate db-migrate db-reset

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

dev: ## Start all apps in watch mode
	pnpm dev

build: ## Build all apps and packages
	pnpm build

lint: ## Lint all packages
	pnpm lint

format: ## Format all files with Prettier
	pnpm format

typecheck: ## Type-check all packages
	pnpm typecheck

test: ## Run all tests
	pnpm test

test-unit: ## Run unit tests only
	pnpm test:unit

test-integration: ## Run integration tests only
	pnpm test:integration

test-e2e: ## Run end-to-end tests only
	pnpm test:e2e

infra-up: ## Start local infrastructure (PostgreSQL, Redis, MinIO)
	pnpm infra:up

infra-down: ## Stop local infrastructure
	pnpm infra:down

db-generate: ## Generate Prisma client
	pnpm db:generate

db-migrate: ## Apply database migrations
	pnpm db:migrate

db-reset: ## Reset database (drops and re-migrates)
	pnpm db:reset

setup: ## First-time local setup: install deps + start infra
	pnpm install
	pnpm infra:up
	@echo "✓ Infrastructure started. Copy .env.example to .env and fill in your values."
