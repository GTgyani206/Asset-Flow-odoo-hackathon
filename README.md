# AssetFlow

AssetFlow is an enterprise-grade multi-tenant Asset and Resource Management System. It is designed to track physical assets through their lifecycles, manage shared resource bookings without scheduling conflicts, route maintenance requests through approval stages, and run scheduled compliance audits with structured discrepancy handling.

## Problem Being Solved

In typical enterprise operations, physical assets (laptops, servers, machinery) and shared resources (vehicles, rooms, special equipment) are tracked in disparate spreadsheets or siloed databases. This leads to common failures such as double-allocations, scheduling overlaps, unrecorded maintenance history, lack of chain-of-custody tracking, and audit discrepancies. AssetFlow solves these challenges by serving as a single source of truth that enforces strict relational invariants, transactional integrity, tenant isolation, and an append-only audit log.

## Product Scope

AssetFlow manages the lifecycle, booking, allocation, maintenance, and compliance auditing of organization assets:
*   **Organization & Tenant Structure:** Management of departments, physical locations, asset categories, employees, and roles.
*   **Asset Registry:** Registration, serialization, tracking, and state-machine transitions of physical assets.
*   **Allocations & Transfers:** Temporary or long-term assignment of assets to employees or departments, preventing double allocation.
*   **Resource Booking:** Time-bound reservations of shared assets with strict overlap prevention.
*   **Maintenance Workflows:** Multi-stage routing of asset repair requests, status updates, and lifecycle transitions.
*   **Scheduled Audits:** Auditor assignment, discrepancy tracking, verification logging, and immutable cycle closure.
*   **Activity Logs & Analytics:** Tenant-scoped append-only logs for security auditing, along with KPI dashboards.

## Out of Scope & Non-Goals

To prevent scope creep, the following functions are strictly excluded from AssetFlow:
*   **Purchasing & Procurement:** Purchase order generation, vendor contract management, and inbound supply chain tracking.
*   **Invoicing & Billing:** Customer invoicing, payment collection, gateway integration, and receipt generation.
*   **Accounting & General Ledger:** Depreciation calculation books, corporate tax filings, general ledger entries, and direct financial accounting.
*   **Payroll:** Employee salary calculations, expense reimbursements, benefits administration, and direct payouts.
*   **Inventory Valuation:** Asset capital depreciation formulas (e.g., straight-line vs. double-declining) and inventory balance sheet asset valuation.

### What Not to Build Here (Scope Control)
Any contributor adding new features must ensure they do not introduce logic that crosses into purchasing, billing, accounting, payroll, or financial inventory valuation. If a feature request requires financial integration, it should be designed to emit domain events (e.g. `AssetRetiredEvent`) that external procurement or accounting systems consume.

## Current Implementation Status

The project is currently in the **Scaffolding and Infrastructure Bootstrap** phase.

| Feature Area | Status | Description |
|---|---|---|
| **Monorepo Foundation** | **Implemented** | Turborepo configuration, pnpm workspaces, and ESLint/TypeScript shared configs. |
| **Local Infrastructure** | **Implemented** | Docker Compose configuration running PostgreSQL, Redis, and MinIO. |
| **API Shell** | **Implemented** | Minimal NestJS API workspace with a public `/health` check. |
| **Web Shell** | **Implemented** | Next.js 14 workspace with routing placeholder and UI skeleton. |
| **Worker Shell** | **Implemented** | NestJS application context worker with basic lifecycle logs. |
| **Database Schema** | **Scaffolded** | Basic Prisma schema file connected to PostgreSQL (no business models defined yet). |
| **Module Packages** | **Scaffolded** | Subdirectory skeleton for `apps/api/src/modules/` containing README ownership files. |
| **Shared Contracts** | **Scaffolded** | `@assetflow/contracts` for API boundary schemas (currently empty). |
| **Domain Packages** | **Scaffolded** | `@assetflow/domain` containing basic definitions (no business models yet). |
| **Queue Abstraction** | **Scaffolded** | `@assetflow/queue` wrapper (integration with BullMQ is planned). |
| **Observability** | **Scaffolded** | `@assetflow/observability` workspace wrapper (integration with OpenTelemetry is planned). |
| **Transactional Outbox** | **Planned** | Reliable async database-level event dispatching to background workers. |

## High-Level Architecture Summary

AssetFlow is structured as a **modular monolith** to maintain low operational complexity while enforcing strict domain boundaries.

```
                   ┌──────────────────────────┐
                   │       Web Portal         │
                   │    (Next.js App Router)  │
                   └────────────┬─────────────┘
                                │ HTTPS REST
                   ┌────────────▼─────────────┐
                   │        NestJS API        │
                   │  (Isolated Domain Modules)│
                   └────────────┬─────────────┘
                                │ Write outbox events
      ┌─────────────────────────┼─────────────────────────┐
      │                         │                         │
┌─────▼─────┐             ┌─────▼─────┐             ┌─────▼─────┐
│  MinIO    │             │  Postgres │             │  Redis    │
│  (S3 API) │             │  (DB State│             │  (Queue / │
│           │             │  Machine) │             │  Cache)   │
└───────────┘             └─────▲─────┘             └─────┬─────┘
                                │                         │
                                │ Read/Update             │ Poll jobs
                          ┌─────┴─────┐                   │
                          │ NestJS    ◄───────────────────┘
                          │ Worker    │
                          └───────────┘
```

*   **Next.js Web (`apps/web`):** Handles client-side rendering and Server-Side Rendering (SSR) pages. Communicates with the NestJS API.
*   **NestJS API (`apps/api`):** Exposes REST API endpoints, handles request validation via Zod, processes business logic within isolated modules, and writes state to the database.
*   **NestJS Worker (`apps/worker`):** Standalone backend process that polls jobs from Redis (via BullMQ) and executes background actions (e.g. notifications, report generation).
*   **PostgreSQL:** The single source of truth for operational state. All critical constraints (e.g., allocation exclusivity, booking range checks) are enforced at the database layer.
*   **Redis & Queue:** Utilized for session caching and background job queuing.
*   **S3 Storage (MinIO):** Stores file attachments, images of physical assets, and generated export reports.
*   **Modular Monolith Constraints:** Code in `apps/api/src/modules/` is strictly isolated. Cross-module operations must go through public application interfaces or asynchronous domain events (using the planned Transactional Outbox pattern).

---

## Repository Layout

```
assetflow/
├── apps/
│   ├── api/                   # NestJS REST API
│   │   ├── src/
│   │   │   ├── bootstrap/     # Core startup configurations and health endpoints
│   │   │   ├── modules/       # Isolated domain modules (READMEs only)
│   │   │   └── shared/        # Private API-wide helpers
│   │   └── test/              # Integration and E2E test suites
│   ├── web/                   # Next.js 14 Web Portal
│   │   ├── src/
│   │   │   ├── app/           # App router layouts and pages
│   │   │   ├── components/    # Page-specific composed components
│   │   │   ├── features/      # Feature slices per business module
│   │   │   ├── lib/           # Web application core utilities
│   │   │   └── styles/        # Global stylesheets and CSS tokens
│   │   └── tests/             # Playwright E2E and Vitest unit tests
│   └── worker/                # Standalone Background Worker
│       ├── src/
│       │   ├── jobs/          # Job definitions and payloads
│       │   ├── consumers/     # Queue job consumer classes
│       │   └── schedulers/    # Cron-based job dispatchers
│       └── test/              # Integration test suites
├── packages/                  # Shared Monorepo Packages
│   ├── config/                # Validated environment configs
│   ├── contracts/             # Zod schemas for API request/response
│   ├── database/              # Prisma configuration and client
│   ├── domain/                # Shared core interfaces and events
│   ├── eslint-config/         # Monorepo linting configurations
│   ├── observability/         # Logging and tracing abstractions
│   ├── queue/                 # Publisher abstractions
│   ├── testing/               # Integration testing testcontainer helpers
│   ├── typescript-config/     # Base tsconfigs for Node, Nest, and React
│   └── ui/                    # Primitive React UI components
├── docs/                      # Architectural and Engineering Docs
├── infra/                     # Infrastructure Configuration
│   ├── docker/                # Custom Docker files
│   └── terraform/             # Planned Terraform code (empty placeholder)
├── scripts/                   # Developer setup and utility scripts
├── .github/                   # CI/CD Workflows
│   └── workflows/
│       └── ci.yml             # Github Actions configuration
├── docker-compose.yml         # Local infrastructure definition (Postgres, Redis, MinIO)
├── Makefile                   # Developer shortcuts
├── package.json               # Root scripts and workspace settings
├── pnpm-workspace.yaml        # Monorepo workspaces definition
└── turbo.json                 # Turborepo execution pipelines
```

---

## Prerequisites

Ensure you have the following installed on your machine:
*   **Node.js:** `>= 20.0.0`
*   **pnpm:** `>= 9.0.0`
*   **Docker & Docker Compose:** Required to run PostgreSQL, Redis, and MinIO containers.

---

## Local Setup

Follow these steps to run a clean installation of AssetFlow locally:

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/GTgyani206/Asset-Flow-odoo-hackathon.git
cd Asset-Flow-odoo-hackathon
pnpm install
```

### 2. Environment Variables
Copy the template file to `.env`:
```bash
cp .env.example .env
```
> [!WARNING]  
> The database, Redis, and S3 credentials provided in `.env.example` are pre-configured for local docker containers and are **development-only**. Never use these credentials in staging or production environments.

### 3. Spin Up Infrastructure
Start PostgreSQL, Redis, and MinIO:
```bash
pnpm infra:up
```

### 4. Database Setup
Ensure client binaries are compiled and run migrations:
```bash
pnpm db:generate
pnpm db:migrate
```

### 5. Run the Application
Start the API, Web App, and Worker in development watch mode:
```bash
pnpm dev
```

The services will be available at:
*   **Next.js Web Portal:** [http://localhost:3000](http://localhost:3000)
*   **NestJS API:** [http://localhost:3001/api](http://localhost:3001/api)
*   **NestJS API Health:** [http://localhost:3001/api/health](http://localhost:3001/api/health)
*   **MinIO Console:** [http://localhost:9001](http://localhost:9001) (User: `minioadmin` / Password: `change_me_locally`)

---

## Docker Compose Services

Our local environment uses `docker-compose.yml` to define three primary infrastructure services:
*   **PostgreSQL 16:** Runs on port `5432`. Includes a healthcheck querying `pg_isready` and writes data to a named volume `postgres_data`.
*   **Redis 7:** Runs on port `6379`. Includes a healthcheck running `redis-cli ping` and writes data to a named volume `redis_data`.
*   **MinIO:** Runs on port `9000` (API) and `9001` (Console). Healthcheck queries `mc ready local` and writes to the `minio_data` volume.

Start the infrastructure:
```bash
pnpm infra:up
```

Stop the infrastructure:
```bash
pnpm infra:down
```

---

## Database Management Commands

Prisma is used for schema mapping and migrations. The following scripts are executed from the workspace root:

*   **Generate Client:**
    ```bash
    pnpm db:generate
    ```
    Compiles typescript types based on `packages/database/prisma/schema.prisma`.
*   **Deploy Migrations:**
    ```bash
    pnpm db:migrate
    ```
    Runs pending database migrations against the database URL defined in `.env`.
*   **Reset Database:**
    ```bash
    pnpm db:reset
    ```
    Destructive command that drops all tables, recreates the schema, and runs seeds.

---

## Development Commands

All development tasks are orchestrated using Turborepo.

*   **Start Local Dev Environment:**
    ```bash
    pnpm dev
    ```
*   **Production Build:**
    ```bash
    pnpm build
    ```
*   **Lint Check:**
    ```bash
    pnpm lint
    ```
*   **Format Code (Prettier):**
    ```bash
    pnpm format
    ```
*   **Typecheck Code:**
    ```bash
    pnpm typecheck
    ```

---

## Testing Architecture

We divide testing into three distinct scopes:

| Test Level | Execution Command | Scope and Meaning |
|---|---|---|
| **Unit Tests** | `pnpm test:unit` | Tests isolated logic, value objects, pure functions, and UI component behavior. No databases or networks. |
| **Integration Tests** | `pnpm test:integration` | Verifies module-level storage queries, queues, and S3 writes. Uses `Testcontainers` to spin up ephemeral Postgres instances. |
| **End-to-End (E2E)** | `pnpm test:e2e` | Runs comprehensive tests verifying API endpoint responses (via Supertest) and browser workflows (via Playwright). |

To run all levels:
```bash
pnpm test
```
*Note: In the current scaffold state, unit/integration runs will exit with an empty-test alert until specific `*.spec.ts` files are added alongside business logic.*

---

## Dependency & Coding Rules

To preserve architectural modularity, the following rules must be strictly enforced:
1.  **Strict Module Isolation:** Sibling modules in `apps/api/src/modules/` cannot import each other's services, controllers, or database models. They must communicate only via interfaces in `packages/domain` or publish outbox events.
2.  **Shared Package Entrypoints:** Do not import from deep workspace paths (e.g. `import x from '../../packages/contracts/src/x'`). All imports must go through package exports (e.g. `import { x } from '@assetflow/contracts'`).
3.  **No Vendor Coupling:** Do not import infrastructure SDKs (like BullMQ or Prisma) in packages containing domain logic. Inject them behind the interfaces defined in `packages/domain` and `packages/queue`.

---

## Security Guidelines

*   **Secrets Management:** Never commit secrets to the repository. The `.env.example` file contains public placeholders only. Production credentials must be injected via secret managers or secure environment environments.
*   **Privileged Role Isolation:** The user signup endpoint must always assign the lowest-privileged role (`EMPLOYEE`). Roles such as `ADMIN`, `ASSET_MANAGER`, or `DEPARTMENT_HEAD` can only be modified by an existing authenticated administrator.
*   **Tenant Scopes:** The tenant identifier (`tenantId`) must always be resolved via the active authenticated token context. Never query data using a tenant ID supplied in the request query parameters or headers.
*   **Reporting Vulnerabilities:** If you find a security vulnerability, please report it privately by opening an encrypted communication line or notifying the repository maintainers at security@assetflow.internal. Do not open public issues for vulnerability reports.

---

## Documentation Index

The following internal manuals are available under the `/docs` directory:
*   [API Schema Guide](./docs/api/README.md) - Structure of inputs, versioning, and endpoint routing.
*   [Architecture Design](./docs/architecture/README.md) - System architecture diagram and module interactions.
*   [Architecture Decisions (ADRs)](./docs/adr/README.md) - Decisions log recording reasons for tools chosen.
*   [Data Schema](./docs/data/README.md) - Invariant indexes, constraints, and audit table designs.
*   [Domain Context](./docs/domain/README.md) - Aggregates, states, and business definitions.
*   [Engineering Guidelines](./docs/engineering/README.md) - Setup, linting rules, and pre-commit checks.
*   [Events Catalog](./docs/events/README.md) - Events emitted, outbox triggers, and background jobs.
*   [Operations Manual](./docs/operations/README.md) - Deployments, migration steps, and backup rules.
*   [Security Protocols](./docs/security/README.md) - Encrypted variables, CORS rules, and isolation scopes.

---

## Contribution Workflow

1.  Create a branch from `develop` following naming rules: `feature/name-of-feature`, `bugfix/name-of-bug`, or `chore/task-name`.
2.  Write tests for the code you implement.
3.  Ensure local validation passes: `pnpm lint && pnpm typecheck && pnpm test`.
4.  Open a Pull Request targeting `develop`.
5.  CI checks (GitHub Actions `ci.yml`) will verify installation, formatting, typechecking, testing, and production building before merge approval.

---

## License

No license has been selected yet.
