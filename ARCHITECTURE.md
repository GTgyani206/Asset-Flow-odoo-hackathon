# AssetFlow – Architecture Overview

## Architectural Style

**Modular monolith with event-driven background processing.**

The system is deployed as three separate processes that share code through workspace packages:

1. **API** (`apps/api`) – Synchronous HTTP request handling via NestJS.
2. **Worker** (`apps/worker`) – Asynchronous background processing via BullMQ.
3. **Web** (`apps/web`) – Server-rendered React frontend via Next.js.

```
┌────────────────────────────────────────┐
│             Client Browser             │
└──────────────┬─────────────────────────┘
               │ HTTPS
┌──────────────▼─────────────────────────┐
│           apps/web (Next.js)           │
│         (SSR + API Route layer)        │
└──────────────┬─────────────────────────┘
               │ HTTP / REST
┌──────────────▼─────────────────────────┐
│          apps/api (NestJS)             │
│   ┌──────────────────────────────────┐ │
│   │   Module: identity-access        │ │
│   │   Module: organization           │ │
│   │   Module: asset-registry         │ │
│   │   Module: allocation             │ │
│   │   Module: resource-booking       │ │
│   │   Module: maintenance            │ │
│   │   Module: audit                  │ │
│   │   Module: notifications          │ │
│   │   Module: reporting              │ │
│   │   Module: activity-log           │ │
│   └──────────────────────────────────┘ │
└──────┬───────────────────┬─────────────┘
       │                   │ Outbox events → Redis Queue
       │              ┌────▼─────────────────────────┐
       │              │   apps/worker (NestJS)        │
       │              │   Background consumers        │
       │              └────┬──────────────────────────┘
       │                   │
┌──────▼───────────────────▼─────────────┐
│              PostgreSQL 16             │
│  (single source of truth for all       │
│   critical invariants and audit logs)  │
└────────────────────────────────────────┘
```

## Module Boundaries

Each module in `apps/api/src/modules/` is self-contained:
- Owns its own controllers, application services, domain logic, and infrastructure adapters.
- Communicates **synchronously** with other modules via explicit application interfaces.
- Communicates **asynchronously** via domain events published to the transactional outbox.
- Must **not** import controllers or infrastructure from sibling modules.
- Must **not** directly mutate another module's database tables.

## Shared Packages Dependency Rules

```
apps/* → packages/contracts   (Zod schemas, DTOs)
apps/* → packages/database    (Prisma client)
apps/* → packages/domain      (Domain types, interfaces)
apps/* → packages/queue       (Queue abstraction)
apps/* → packages/observability
apps/* → packages/config
apps/web → packages/ui

packages/domain  → (no external deps beyond language primitives)
packages/contracts → packages/domain
packages/queue → packages/domain
```

Domain packages **must not** import from `apps/*`, vendor SDKs, or infrastructure packages.

## Non-Negotiable Invariants (Enforced at Database Level)

| Invariant | Mechanism |
|-----------|-----------|
| No double allocation of an asset | Partial unique index on `Allocation(assetId) WHERE status = 'ACTIVE'` |
| No overlapping resource bookings | PostgreSQL range exclusion constraint using `gist` |
| Tenant isolation | `tenant_id` on every tenant-owned record; enforced by API auth context |
| Append-only audit logs | Application constraint; never issue UPDATE/DELETE on `ActivityLog` |
| Immutable closed audit cycles | Application constraint; amendments create new records |

## Key Engineering Decisions

- ADRs are stored in [`docs/adr/`](./docs/adr/).
- UTC is used for all stored timestamps.
- Idempotency keys are required on all critical commands.
- Transactional outbox pattern is used for all domain events.
- Optimistic locking (`version` column) for normal edits; row-level locking for high-contention workflows.
- Hard deletion is forbidden for referenced operational records.
