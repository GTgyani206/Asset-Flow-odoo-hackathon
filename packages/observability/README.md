# @assetflow/observability

**Owner**: Platform team  
**Status**: Scaffold – no observability helpers defined yet

## Purpose

Provides **structured logging**, **distributed trace helpers**, and **metric instrument factories** that wrap OpenTelemetry APIs. All `apps/*` use this package instead of calling OpenTelemetry SDK directly.

## Dependency Rules

- **May depend on**: `@opentelemetry/*` SDK packages, language primitives.
- **Must NOT depend on**: Any `apps/*`, business logic, or database packages.
- **Imported by**: `apps/api`, `apps/worker`.

## Rules

- Never log passwords, tokens, secrets, or sensitive document contents.
- All log messages must be structured (JSON-serialisable fields only).
- Trace context must propagate across service boundaries via W3C TraceContext headers.
