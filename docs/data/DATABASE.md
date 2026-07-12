# Database Design & Operations

This document specifies the database standards, storage patterns, table directory, constraints, and migration policies for **AssetFlow**.

---

## 1. PostgreSQL as the Source of Truth

PostgreSQL 16 is the final authority for all application state, relational constraints, concurrency controls, and transaction logs. All business invariants—specifically allocation uniqueness and booking overlap checks—must be enforced at the database level using schemas, indexes, and constraints.

---

## 2. Naming Conventions

*   **Tables:** Plural, snake_case (e.g. `users`, `asset_condition_histories`).
*   **Columns:** snake_case (e.g. `tenant_id`, `serial_number`).
*   **Primary Keys:** Named `id`.
*   **Foreign Keys:** Named `<singular_target_table>_id` (e.g. `user_id`).
*   **Constraints & Indexes:** Prefix conventions:
    *   Primary Keys: `pk_<table_name>` (e.g. `pk_users`).
    *   Foreign Keys: `fk_<table_name>_<column_name>` (e.g. `fk_memberships_user_id`).
    *   Unique Index: `uq_<table_name>_<columns>` (e.g. `uq_assets_tenant_id_asset_tag`).
    *   Exclusion Index: `ex_<table_name>_<columns>` (e.g. `ex_bookings_resource_time`).

---

## 3. Identifier Policy

All primary keys must utilize **UUIDv7** (time-ordered, binary-sortable UUIDs).
*   **Rationale:** Standard UUIDv4 values cause significant write performance degradation in B-Tree indexes due to random insertion paths. UUIDv7 retains time sorting in its leading bits, maintaining index localization while ensuring global uniqueness.

---

## 4. Tenant ID Policy

*   Every database table containing tenant-owned operational data must include a non-nullable `tenant_id` UUID column.
*   To optimize query performance, composite indexes targeting tenant lookups must declare `tenant_id` as the leading column:
    ```sql
    CREATE INDEX idx_assets_tenant_status ON assets (tenant_id, status);
    ```

---

## 5. UTC Timestamp Policy

All date-time columns must utilize `TIMESTAMP WITH TIME ZONE` (`timestamptz`). The database engine stores these values in UTC format. Application nodes must convert client inputs to UTC before running queries.

---

## 6. Soft Deletion versus Immutable History

*   **Soft Deletion:** Core operational records (e.g. `Employee`, `Department`, `Location`) utilize an `archived_at` nullable timestamp column. Records containing an `archived_at` timestamp are excluded from standard user-facing listings.
*   **Immutable Tables:** Activity logs, event outboxes, allocation logs, and closed audit findings must never be soft-deleted. These tables are append-only.

---

## 7. Optimistic Versioning Policy

Every mutable table must include a non-nullable `version` integer column (default `1`). Updates must evaluate this column to prevent concurrent write collisions (Lost Updates):
```sql
UPDATE assets SET status = 'RESERVED', version = version + 1 
WHERE id = :id AND version = :version;
```

---

## 8. Transaction Isolation Expectations

The default transaction isolation level is **Read Committed**. 
For operations demanding multi-row consistency guarantees (such as audit cycle totals or multi-asset allocation checkouts), the isolation level must be promoted to **Repeatable Read** or **Serializable** within the transaction context.

---

## 9. Row-Locking Use Cases

*   **Allocation Transfers:** Staging allocation transfers requires acquiring an explicit lock on the source allocation row using `SELECT ... FOR UPDATE` to block concurrent returns or sibling transfer requests.
*   **State Machine Transitions:** Asset state checks during checkout must lock the target row to prevent race conditions.

---

## 10. Planned Table Inventory by Module

```
identity-access/
 ├── users
 └── memberships
organization/
 ├── tenants
 ├── departments
 ├── locations
 └── asset_categories
asset-registry/
 ├── assets
 └── asset_condition_histories
allocation/
 ├── allocations
 ├── transfer_requests
 ├── return_requests
 └── return_inspections
resource-booking/
 ├── resources
 ├── bookings
 └── blackouts
maintenance/
 ├── maintenance_requests
 └── maintenance_logs
audit/
 ├── audit_cycles
 ├── audit_items
 └── audit_discrepancy_logs
activity-log/
 └── activity_logs
shared/
 └── outbox_events
```

---

## 11. Critical Database Constraints

*   **Tenant-Scoped Asset Tag Uniqueness:** Affixed physical tags must be unique inside the Tenant: `UNIQUE (tenant_id, asset_tag)`.
*   **One Active Allocation Per Asset:** An asset cannot belong to multiple custodians: `UNIQUE (asset_id) WHERE status = 'ACTIVE'`.
*   **Booking Overlap Prevention:** GiST exclusion constraints check time range overlaps: `EXCLUDE USING gist (resource_id WITH =, time_range WITH &&)`.
*   **Time-Range Boundaries:** Bookings must satisfy: `CHECK (end_at > start_at)`.
*   **Holder Integrity:** Allocations must validate target fields: `CHECK (holder_type IN ('EMPLOYEE', 'DEPARTMENT'))`.
*   **Hierarchy Cycle Protection:** Recursive triggers on `departments` check parent hierarchy structures to prevent loops.
*   **Closed-Audit Immutability:** Audit records block edits via database triggers when `status = 'CLOSED'`.
*   **Disposed Asset Restrictions:** Triggers block status changes once lifecycle state reaches `DISPOSED`.

---

## 12. Indexing Strategy

*   Primary and Foreign Key columns are indexed by default.
*   Composite B-Tree indexes are declared on commonly filtered query scopes: `(tenant_id, archived_at)`.
*   GiST indexes are configured for all time-range calculations (`time_range`).

---

## 13. Raw SQL Migration Policy

PostgreSQL-specific database configurations (such as custom triggers, range types, and GiST exclusion constraints) must be executed using raw SQL migrations (`prisma migrate dev --create-only`).

---

## 14. Expand-and-Contract Migration Procedure

Zero-downtime schema migrations must follow the **Expand-and-Contract** pattern:
1.  **Expand Phase:** Deploy schema changes (e.g. write a new column alongside the old one). Sibling models write to both fields.
2.  **Migration Phase:** Background processes backfill old data into the new structure.
3.  **Contract Phase:** The API shifts read queries to the new column. Once validated, the old column is removed.

---

## 15. Seed-Data Policy

*   **System Seeds:** Injected into all environments (e.g. system permissions, standard asset categories).
*   **Development Seeds:** Mock datasets loaded locally via isolated scripts (`pnpm db:seed:dev`) to assist engineering tests. These must never run in production environments.

---

## 16. Backup, Restore, and Disaster Recovery

*   **Daily Snapshots:** Compressed database dumps are stored in secure S3 storage.
*   **Write-Ahead Log (WAL) Archiving:** WAL logs are shipped hourly to enable Point-in-Time Recovery (PITR) targets (RPO < 1 hour).

---

## 17. Data Retention & Archival

*   **Hot Storage:** Active operations are retained on primary disks.
*   **Warm Storage:** Read replicas store data from past calendar cycles.
*   **Cold Storage:** Closed audit cycles and activity logs older than 7 years are compressed, encrypted, and archived to S3 Glacier before being deleted from the primary database.

---

## 18. Reference SQL Design

Below is the reference SQL configuration for the two critical operational constraints:

### Constraint 1: One Active Allocation Per Asset (Partial Index)
```sql
CREATE UNIQUE INDEX uq_single_active_allocation 
ON allocations (asset_id) 
WHERE status = 'ACTIVE';
```

### Constraint 2: No Overlapping Resource Bookings (GiST Range Exclusion)
```sql
-- Ensure pg_trgm and btree_gist extensions are active
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    resource_id UUID NOT NULL,
    time_range TSTZRANGE NOT NULL,
    CONSTRAINT chk_time_range_valid CHECK (upper(time_range) > lower(time_range)),
    
    -- Exclude overlapping ranges on the same resource
    CONSTRAINT ex_no_overlapping_bookings 
    EXCLUDE USING gist (resource_id WITH =, time_range WITH &&)
);
```
