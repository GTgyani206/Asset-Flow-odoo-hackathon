# Module: audit

**Owner**: Compliance team  
**Status**: Not yet implemented

## Responsibility

Manages scheduled audit cycles. Assigns auditors (temporary scoped role), records asset verifications, handles discrepancies, and closes cycles immutably.

## Dependency Rules

- **May import from**: `@assetflow/contracts`, `@assetflow/domain`, `@assetflow/database`, `@assetflow/config`, `@assetflow/observability`.
- **Must NOT import from**: Any other business module's internals.
- **Communicates async via**: `AuditCycleClosedEvent` → outbox → worker.

## Critical Engineering Rules

- Closed audit cycles are **immutable**. No UPDATE or DELETE on a closed cycle's records.
- Corrections after closure create **amendment records**, not overwrites.
- The `AUDITOR` role is a temporary scoped assignment tied to a specific audit cycle, not a permanent role in the system.
