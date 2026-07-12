# Module: reporting

**Owner**: Platform team  
**Status**: Not yet implemented

## Responsibility

Provides KPI dashboards, asset utilisation analytics, and data exports. Read-only against the operational database; no writes to other modules' tables.

## Dependency Rules

- **May import from**: `@assetflow/contracts`, `@assetflow/domain`, `@assetflow/database` (read-only queries), `@assetflow/config`, `@assetflow/observability`.
- **Must NOT write to**: Any other module's tables. Reporting is strictly read-only.
- **Must NOT import from**: Other business module internals.

## Rules

- Export endpoints (CSV, XLSX) must be authorised and scoped to the caller's tenant.
- Expensive aggregation queries must be paginated or cached; never unbounded full-table scans in request handlers.
