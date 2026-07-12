# Module: allocation

**Owner**: Asset management team  
**Status**: Not yet implemented

## Responsibility

Handles asset allocation to employees or departments, asset transfers between parties, and asset returns. Enforces the no-double-allocation invariant.

## Dependency Rules

- **May import from**: `@assetflow/contracts`, `@assetflow/domain`, `@assetflow/database`, `@assetflow/config`, `@assetflow/observability`.
- **Must NOT import from**: `resource-booking`, `maintenance`, or `audit` internals.
- **Communicates async via**: `AssetAllocatedEvent`, `AssetReturnedEvent` → outbox → worker.

## Critical Engineering Rules

- Double allocation is prevented by a **partial unique index** on `Allocation(assetId) WHERE status = 'ACTIVE'` enforced at the database level, not only in application logic.
- All allocation commands execute within a database transaction.
- Idempotency keys required on `AllocateAsset` command.
