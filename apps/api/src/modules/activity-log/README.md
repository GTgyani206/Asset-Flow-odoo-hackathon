# Module: activity-log

**Owner**: Platform team  
**Status**: Not yet implemented

## Responsibility

Records all security-relevant and business-critical actions as an **append-only** activity log. Consumed by audit, reporting, and security review workflows.

## Dependency Rules

- **May import from**: `@assetflow/contracts`, `@assetflow/domain`, `@assetflow/database`, `@assetflow/config`, `@assetflow/observability`.
- **Must NOT import from**: Any other business module internals.
- **Written by**: All modules via a shared `IActivityLogWriter` interface (injected).

## Critical Engineering Rules

- The `ActivityLog` table is **append-only**. The application must never issue `UPDATE` or `DELETE` against it.
- Every tenant-owned record includes `tenantId`.
- Never log passwords, tokens, secrets, or sensitive document contents.
