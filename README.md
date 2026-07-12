# AssetFlow

**Enterprise Asset & Resource Management System**

AssetFlow is a multi-tenant ERP-style platform for organisations to manage physical assets, resource bookings, maintenance workflows, and audit cycles.

## Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Copy environment variables and fill in your local values
cp .env.example .env

# 3. Start local infrastructure (PostgreSQL, Redis, MinIO)
pnpm infra:up

# 4. Apply database migrations
pnpm db:migrate

# 5. Start all apps in development mode
pnpm dev
```

## Apps

| App | Port | Description |
|-----|------|-------------|
| `apps/api` | 3001 | NestJS REST API |
| `apps/web` | 3000 | Next.js web portal |
| `apps/worker` | – | Standalone background worker |

## Packages

| Package | Description |
|---------|-------------|
| `packages/contracts` | Zod schemas and shared DTOs for API contracts |
| `packages/database` | Prisma schema, client, and migration helpers |
| `packages/domain` | Domain types, value objects, and event interfaces |
| `packages/queue` | Queue abstraction (BullMQ behind an interface) |
| `packages/observability` | OpenTelemetry-compatible logging, metrics, traces |
| `packages/config` | Shared configuration loaders and validators |
| `packages/ui` | Shared React component library |
| `packages/testing` | Shared test utilities, factories, and Testcontainers helpers |
| `packages/eslint-config` | Shared ESLint configuration presets |
| `packages/typescript-config` | Shared TypeScript `tsconfig` bases |

## Scripts

```bash
pnpm dev              # Start all apps in watch mode
pnpm build            # Build all apps and packages
pnpm lint             # Lint all packages
pnpm format           # Format all files with Prettier
pnpm typecheck        # Type-check all packages
pnpm test             # Run all tests
pnpm test:unit        # Run unit tests only
pnpm test:integration # Run integration tests
pnpm test:e2e         # Run end-to-end tests
pnpm db:generate      # Generate Prisma client
pnpm db:migrate       # Apply database migrations
pnpm db:reset         # Reset database
pnpm infra:up         # Start local infrastructure
pnpm infra:down       # Stop local infrastructure
```

## Technology Stack

- **Monorepo**: pnpm workspaces + Turborepo
- **Frontend**: Next.js 14 + React 18 + TypeScript
- **Backend**: NestJS + TypeScript
- **Database**: PostgreSQL 16 + Prisma ORM
- **Cache / Queue**: Redis 7 + BullMQ
- **Object Storage**: S3-compatible (MinIO for local dev)
- **Testing**: Vitest, Supertest, Playwright, Testcontainers
- **Observability**: OpenTelemetry

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) and the [`docs/`](./docs/) directory.

## Licence

Private – All rights reserved.
