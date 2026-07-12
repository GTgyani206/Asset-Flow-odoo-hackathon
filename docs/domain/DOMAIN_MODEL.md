# Domain Model Specification

This document details the logical structure, aggregate boundaries, relational mapping, and state dimensions of the AssetFlow domain models.

---

## 1. Bounded Module Overview

AssetFlow is partitioned into logical modules that map to architectural boundaries. Each module manages a specific set of domain aggregate roots and entities:

- **`identity-access`:** Manages Users, Memberships, and security roles.
- **`organization`:** Manages Tenant-wide structures (Departments, Locations, Categories).
- **`asset-registry`:** Manages the inventory, lifecycle states, and profiles of individual physical Assets.
- **`allocation`:** Manages the long-term custodial assignments, transfers, and return inspections of assets.
- **`resource-booking`:** Manages time-bound Reservations, Resources, and scheduling blackout ranges.
- **`maintenance`:** Tracks repairs, request flows, and maintenance outcomes.
- **`audit`:** Coordinates audit schedules, counts, and discrepancies.
- **`notifications` & `activity-log`:** Tracks audit trails and communication logs.

---

## 2. Aggregate Roots & Entities

*   **Tenant (Root):** The root boundary for all tenant-specific data.
*   **Employee (Entity):** Belongs to a Tenant and holds department associations.
*   **Asset (Root):** The root for physical hardware tracking. 
*   **Allocation (Root):** Coordinates the custody details between an Asset and a Holder.
*   **Resource (Root):** Represents an item or space that can be booked.
*   **Booking (Entity):** Time-bound reservation linked to a Resource and an Employee.
*   **MaintenanceRequest (Root):** A workflow tracking a repair cycle for an Asset.
*   **AuditCycle (Root):** Manages a single active compliance audit process.
*   **AuditItem (Entity):** A child of `AuditCycle` representing the audit status of a single Asset.
*   **ActivityLog (Root):** Represents an immutable, append-only log entry.

---

## 3. Entity Relationship Diagram

This diagram shows how aggregates relate conceptually. Direct database foreign key constraints are not allowed across module boundaries. Sibling modules link to entities by ID values only.

```mermaid
erDiagram
    Tenant ||--o{ Membership : owns
    Tenant ||--o{ Employee : employs
    Tenant ||--o{ Department : organizes
    Tenant ||--o{ Asset : registers
    Tenant ||--o{ Resource : owns
    Tenant ||--o{ AuditCycle : schedules
    
    User ||--o{ Membership : possesses
    Membership ||--|| Employee : matches
    
    Department ||--o{ Employee : groups
    Department ||--o{ Asset : holds_custody
    Employee ||--o{ Asset : holds_custody
    
    Asset ||--o{ Allocation : tracks
    Asset ||--o{ MaintenanceRequest : undergoes
    Asset ||--o? Resource : underlies
    
    Resource ||--o{ Booking : schedules
    Resource ||--o{ Blackout : blocks
    
    AuditCycle ||--o{ AuditItem : contains
    Asset ||--o{ AuditItem : audited_by
    
    Employee ||--o{ Allocation : receives
    Employee ||--o{ Booking : reserves
    Employee ||--o{ MaintenanceRequest : requests
    Employee ||--o{ AuditCycle : conducts
```

---

## 4. Ownership and Reference Rules

To support decoupled development, the domain model enforces strict referencing boundaries:
1.  **Cross-Module References:** Sibling modules must reference external aggregate roots by primitive IDs only (e.g. `Allocation` references `assetId` as a raw UUID string, not as a nested object reference).
2.  **No Cascades Across Boundaries:** Database cascade operations (`onDelete: Cascade`) are strictly limited to children within the *same* aggregate boundary (e.g., deleting an `AuditCycle` cascades to its `AuditItems`, but deleting a `Department` must never cascade to delete its `Employees`).
3.  **Local Read-Only Views:** Sibling modules can read other modules' schemas but must never perform write or update operations.

---

## 5. Important Value Objects

Value objects are immutable and defined by their attributes. They contain validation rules to prevent corrupt states.

*   **`TenantId`:** A typed UUID string representing a valid Tenant database scope.
*   **`AssetTag`:** A strictly formatted, unique alphanumeric identifier matching regular expression `^AF-[A-Z0-9]{6}$`.
*   **`TimeRange`:** An object encapsulating a start and end time (ISO-8601 UTC). Enforces the invariant:
    *   `startTime < endTime`
    *   Evaluates intervals as half-open: `[startTime, endTime)`.
*   **`Money`:** Encapsulates a decimal amount and currency type (e.g. USD). Used strictly for operational logging, acquisition value, and reporting. It is not used for ledger entries.
*   **`Condition`:** An enum representing physical status: `NEW`, `GOOD`, `FAIR`, `POOR`, `BROKEN`.
*   **`OrganizationTimezone`:** An IANA-compliant timezone string (e.g., `America/New_York`) used to map local operations to standard UTC database fields.
*   **`EntityVersion`:** An integer property (`version`) evaluated for optimistic lock execution.

---

## 6. Asset Internal State Dimensions

An Asset does not have a single flat status field. It is tracked across four distinct dimensions:

```
                  ┌───────────────────────────────┐
                  │            ASSET              │
                  └──────────────┬────────────────┘
                                 │
         ┌───────────────┬───────┴───────┬───────────────┐
         ▼               ▼               ▼               ▼
   [ Lifecycle ]     [ Custody ]  [Serviceability] [ Reservation ]
   - ACTIVE        - UNALLOCATED  - OPERATIONAL    - NONE
   - LOST          - ALLOCATED    - MAINTENANCE    - RESERVED
   - RETIRED
   - DISPOSED
```

1.  **Lifecycle:**
    *   `ACTIVE`: The asset is registered and operational.
    *   `LOST`: The asset is physically missing (declared during audits or manually).
    *   `RETIRED`: The asset is taken out of service but retained in records.
    *   `DISPOSED`: The asset is sold, destroyed, or recycled (terminal state).
2.  **Custody:**
    *   `UNALLOCATED`: Held in storage / warehouse.
    *   `ALLOCATED`: Assigned to a specific Employee or Department.
3.  **Serviceability:**
    *   `OPERATIONAL`: Ready to use.
    *   `UNDER_MAINTENANCE`: Currently undergoing repair.
4.  **Reservation:**
    *   `NONE`: Available for scheduling.
    *   `RESERVED`: Reserved for a confirmed booking.

---

## 7. Derived User-Facing Status Precedence

To simplify user interface representations, a single derived status is calculated at runtime from the asset's state dimensions. Precedence is evaluated top-down:

1.  **`DISPOSED`:** (If Lifecycle = `DISPOSED`)
2.  **`RETIRED`:** (If Lifecycle = `RETIRED`)
3.  **`LOST`:** (If Lifecycle = `LOST`)
4.  **`UNDER_MAINTENANCE`:** (If Serviceability = `UNDER_MAINTENANCE`)
5.  **`RESERVED`:** (If Reservation = `RESERVED`)
6.  **`ALLOCATED`:** (If Custody = `ALLOCATED`)
7.  **`AVAILABLE`:** (Fallback default when active and in storage)

```
[DIMENSIONS STATE]                                   [DERIVED UI STATUS]
Lifecycle=DISPOSED    ─────────────────────────────► DISPOSED
Lifecycle=RETIRED     ─────────────────────────────► RETIRED
Lifecycle=LOST        ─────────────────────────────► LOST
Serviceability=MAINT  ─────────────────────────────► UNDER_MAINTENANCE
Reservation=RESERVED  ─────────────────────────────► RESERVED
Custody=ALLOCATED     ─────────────────────────────► ALLOCATED
(Default Fallback)    ─────────────────────────────► AVAILABLE
```

---

## 8. Linking Generic Resources to Assets

A **Resource** (e.g. "Pool Vehicle 1") can exist independently of a physical Asset to allow general room or equipment reservations. However, it can optionally hold a reference to an underlying physical **Asset** ID.

This link is used to handle cross-module serviceability:
- If a physical Asset is marked `UNDER_MAINTENANCE` (via a maintenance request), the system queries the link and automatically schedules a **Blackout** period blocking the corresponding Resource from future bookings.

---

## 9. Historical & Append-Only Records

Certain tables must never execute `UPDATE` or `DELETE` statements. Updates are appended as new entries:
*   **`TransferRequest` / `AllocationHistory`:** Records all historical custodial changes.
*   **`ConditionHistory`:** Logs changes in physical health records for audit compliance.
*   **`AuditItemFindings`:** Discrepancy logs are recorded as immutable snapshots.
*   **`ActivityLog`:** Records security-critical actions and changes.

---

## 10. Deletion and Archival Policy

*   **No Physical Deletion:** Operational entities (Employees, Assets, Departments, Locations) are never hard-deleted from the database once referenced.
*   **Soft Deactivation:**
    *   `Employee` receives `INACTIVE` state (deactivates authentication and memberships).
    *   `Asset` transitions to `RETIRED` or `DISPOSED`.
    *   `Department` holds `DEACTIVATED` state, blocking new allocations.
