# Module: maintenance

**Owner**: Asset management team  
**Status**: Not yet implemented

## Responsibility

Routes maintenance requests through a multi-step approval and repair workflow. Automatically transitions asset state to `UNDER_MAINTENANCE` on approval and back to `AVAILABLE` on completion.

## Dependency Rules

- **May import from**: `@assetflow/contracts`, `@assetflow/domain`, `@assetflow/database`, `@assetflow/config`, `@assetflow/observability`.
- **Must NOT import from**: `allocation`, `resource-booking`, or `audit` internals.
- **Communicates async via**: `MaintenanceRequestCreatedEvent`, `MaintenanceCompletedEvent` → outbox → worker.

## Workflow States

`SUBMITTED` → `APPROVED` → `IN_REPAIR` → `COMPLETED`  
`SUBMITTED` → `REJECTED` (terminal)

## Engineering Rules

- State transitions must be enforced in application logic; invalid transitions return 422.
- Workflow history is append-only.
