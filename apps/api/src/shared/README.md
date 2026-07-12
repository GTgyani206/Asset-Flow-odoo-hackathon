# apps/api – Shared Utilities

**Owner**: Platform team

This directory contains internal helpers shared **only within** `apps/api`. It is not a published package.

## Contents (to be added as modules are implemented)

- `PrismaService` – singleton Prisma client wrapper with lifecycle hooks.
- `AuthGuard` – JWT authentication guard applied globally.
- `TenantContextMiddleware` – extracts and validates `tenantId` from auth token.
- `IdempotencyInterceptor` – enforces idempotency keys on critical commands.

## Rules

- These helpers are private to `apps/api`. They must not be imported from `apps/worker` or `apps/web`.
- For logic needed across apps, promote it to the appropriate `packages/*` package.
