# Module: organization

**Owner**: Platform team  
**Status**: Not yet implemented

## Responsibility

Manages tenant configuration, departments, locations, and asset categories. Provides the organisational context that all other modules depend on.

## Dependency Rules

- **May import from**: `@assetflow/contracts`, `@assetflow/domain`, `@assetflow/database`, `@assetflow/config`, `@assetflow/observability`.
- **Must NOT import from**: `identity-access` controllers or services directly (use domain interfaces).
- **Communicates async via**: `DepartmentCreatedEvent`, `LocationCreatedEvent` → outbox → worker.

## What does NOT belong here

- Asset lifecycle management.
- Allocation or booking logic.
