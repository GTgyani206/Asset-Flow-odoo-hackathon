# @assetflow/ui

**Owner**: Frontend team  
**Status**: Scaffold – no components defined yet

## Purpose

Shared **React component library** and **design token definitions** for the AssetFlow web application.

## Dependency Rules

- **May depend on**: `react`, `react-dom` (peer deps), language primitives.
- **Must NOT depend on**: Any `apps/*`, NestJS, Prisma, or backend-only packages.
- **Imported by**: `apps/web` only.

## What belongs here

- Primitive UI components (Button, Input, Badge, Card, etc.).
- Layout components.
- Design tokens (colours, spacing, typography).
- Shared hooks that are purely presentational.

## What does NOT belong here

- API calls or data fetching logic.
- Business logic or domain concepts.
- Any server-side code.
