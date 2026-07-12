# @assetflow/config

**Owner**: Platform team  
**Status**: Scaffold – no config schemas defined yet

## Purpose

Provides **Zod-validated environment variable schemas** and **configuration loader utilities** shared across all applications. Applications should fail fast at startup if required config is absent.

## Dependency Rules

- **May depend on**: `zod`, language primitives.
- **Must NOT depend on**: Any `apps/*`, database, or infrastructure SDKs.
- **Imported by**: `apps/api`, `apps/worker`.

## Rules

- Never export raw `process.env` values directly – always validate through Zod first.
- Never include secrets or default values for production credentials.
- Treat missing required env vars as a fatal startup error.
