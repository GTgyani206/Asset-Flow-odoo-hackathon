# @assetflow/contracts

**Owner**: Platform team  
**Status**: Scaffold – no contracts defined yet

## Purpose

This package contains **Zod schemas** and **TypeScript types** that define the public contract surface of the AssetFlow API. It is the single source of truth for all request/response shapes used by both the API and the web application.

## Dependency Rules

- **May depend on**: `zod`, language primitives only.
- **Must NOT depend on**: Any `apps/*` package, NestJS, Next.js, Prisma, or any infrastructure SDK.
- **Imported by**: `apps/api` (request validation), `apps/web` (form validation, type safety).

## What belongs here

- Zod schemas for every API request body and query parameter.
- TypeScript types derived from Zod schemas (`z.infer<...>`).
- Shared pagination and error response shapes.

## What does NOT belong here

- Business logic.
- Database models.
- NestJS decorators or metadata.
- Any runtime side-effects.
