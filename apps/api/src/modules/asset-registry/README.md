# Module: asset-registry

**Owner**: Asset management team  
**Status**: Not yet implemented

## Responsibility

Registers and tracks physical assets through their full lifecycle. Manages asset states:
`AVAILABLE`, `ALLOCATED`, `RESERVED`, `UNDER_MAINTENANCE`, `LOST`, `RETIRED`, `DISPOSED`.

## Dependency Rules

- **May import from**: `@assetflow/contracts`, `@assetflow/domain`, `@assetflow/database`, `@assetflow/config`, `@assetflow/observability`.
- **Must NOT import from**: `allocation`, `maintenance`, or `audit` module internals.
- **Communicates async via**: `AssetStateChangedEvent` → outbox → worker.

## Engineering Rules

- Asset state transitions must be validated; invalid transitions are rejected.
- Optimistic locking (`version` column) required on all asset updates.
- Hard deletion is forbidden; use state transitions to `RETIRED` or `DISPOSED` instead.
