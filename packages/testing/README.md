# @assetflow/testing

**Owner**: Platform team  
**Status**: Scaffold – no helpers defined yet

## Purpose

Shared **test utilities**, **object factories**, and **Testcontainers setup helpers** used across all application integration and unit tests.

## Dependency Rules

- **May depend on**: `vitest`, `@testcontainers/*`, `@assetflow/database` (for seeding), language primitives.
- **Must NOT depend on**: `apps/*`, Next.js, or any production runtime SDK not needed in tests.
- **Imported by**: `apps/api/test/`, `apps/worker/test/`, `packages/*/src/**/*.test.ts`.

## What belongs here

- Entity builder / factory functions for test data.
- Testcontainers helpers (PostgreSQL, Redis container setup).
- Common assertion helpers.
- Mock implementations of infrastructure interfaces.

## Rules

- Test helpers must not leak side effects between test suites.
- Testcontainers must be used for integration tests (no mocking of the DB).
