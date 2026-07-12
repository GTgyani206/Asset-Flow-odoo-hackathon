# @assetflow/domain

**Owner**: Platform team  
**Status**: Scaffold – no domain types defined yet

## Purpose

Pure domain layer. Contains **entity interfaces**, **value object types**, **domain event type definitions**, and **aggregate root interfaces**. No framework code, no database access, no HTTP.

## Dependency Rules

- **May depend on**: Language primitives only. No npm packages beyond dev tools.
- **Must NOT depend on**: Any `apps/*`, NestJS, Prisma, `@assetflow/contracts`, or any infrastructure package.
- **Imported by**: `apps/api` (application services), `packages/contracts`, `packages/queue`.

## What belongs here

- Entity and aggregate root interfaces (e.g., `IAsset`, `IAllocation`).
- Value object types (e.g., `AssetState` enum, `TenantId` brand type).
- Domain event payload types (e.g., `AssetAllocatedEvent`).
- Repository interfaces (port definitions, not implementations).

## What does NOT belong here

- Prisma models or database queries.
- NestJS decorators.
- HTTP request/response types (those belong in `packages/contracts`).
- Any side-effecting code.
