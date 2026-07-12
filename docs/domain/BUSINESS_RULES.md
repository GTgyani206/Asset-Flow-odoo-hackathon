# Core Business Rules

This document specifies the authoritative business rules and edge-case behaviors enforced by the AssetFlow platform.

---

## 1. Directory of Business Rules

### Allocation Rules

#### `AF-ALLOC-001`: No Double Allocation
An active physical asset must never be assigned to more than one holder at a time. This is enforced by a PostgreSQL partial unique index on `Allocation(asset_id) WHERE status = 'ACTIVE'`.
*Cross-link:* See [DOMAIN_MODEL.md Section 6](./DOMAIN_MODEL.md#6-asset-internal-state-dimensions).

#### `AF-ALLOC-002`: Transfer Verification
If an asset is currently held by a custodian, it cannot be allocated directly to a new custodian. A `TransferRequest` workflow must be initiated and approved by the corresponding department head.

#### `AF-ALLOC-003`: Active Holder Validation
The target holder of an active allocation must be a valid, active `Employee` or `Department` within the same Tenant scope. Allocating assets to inactive employees or deactivated departments is prohibited.

#### `AF-ALLOC-004`: Expected Return Range
All temporary allocations must include an `expectedReturnDate` value. This value must be in the future relative to the transaction time:
$$\text{expectedReturnDate} > \text{currentTime}$$

---

### Reservation & Booking Rules

#### `AF-BOOK-001`: Half-Open Scheduling Intervals
All bookings use half-open time range boundaries: `[startTime, endTime)`. The reservation begins exactly at `startTime` and ends immediately before `endTime`.

#### `AF-BOOK-002`: Overlap Prevention
Exclusion constraints are enforced in PostgreSQL on the Booking table using range fields (`tsrange`) to prevent overlapping time reservations for the same Resource.

#### `AF-BOOK-003`: Recurring Booking Conflict Policy
If an employee requests a recurring series of bookings and any single occurrence conflicts with an existing reservation, the entire series must be rejected. Partially booking a series is prohibited to ensure scheduling consistency.

---

### Maintenance Rules

#### `AF-MAINT-001`: Maintenance Approval Requirement
No repair work may begin on an Asset or Resource until a corresponding `MaintenanceRequest` has been reviewed and moved to the `APPROVED` state by an Asset Manager.

#### `AF-MAINT-002`: Resource Maintenance Blackout
When a physical Asset that is linked to a shareable Resource is moved to the `UNDER_MAINTENANCE` state, the system must automatically write a **Blackout** range blocking the Resource for the duration of the repair.

---

### Compliance & Audit Rules

#### `AF-AUDIT-001`: Audit Snapshots
Activating an Audit Cycle creates an immutable snapshot of all assets, locations, conditions, and holders at that exact timestamp. Discrepancies are evaluated relative to this snapshot.

#### `AF-AUDIT-002`: Immutable Closed Audits
Once an Audit Cycle is closed, all corresponding records are immutable. Corrections, updates, or late findings must be recorded in a new cycle or registered as an amendment.
*Cross-link:* See [STATE_MACHINES.md Section 6](./STATE_MACHINES.md#6-audit-cycle-state-machine).

---

### Access & Organization Rules

#### `AF-IAM-001`: Controlled Role Assignment
Public signup routes default to the lowest-privilege `EMPLOYEE` role. Role promotions to `ADMIN` or `ASSET_MANAGER` require manual modification by an existing authenticated Administrator.

#### `AF-IAM-002`: Final-Admin Protection
A Tenant must always possess at least one active User with the `ADMIN` role. The system rejects any request to deactivate or change the role of the final Administrator.

#### `AF-ORG-001`: Department Hierarchy Cycle Prevention
Departments can be nested, but hierarchical cycles (e.g. Department A reports to B, B reports to C, C reports to A) are prohibited. This is checked before saving parent ID changes.

#### `AF-TENANT-001`: Strict Tenant Isolation
All operational database queries must filter by `tenant_id` matches from the active authentication context. Tenant IDs must not be accepted via headers or query parameters.

#### `AF-OFFB-001`: Deactivation Check
An Employee cannot be set to `INACTIVE` status while they hold active asset allocations. All assigned assets must be returned or transferred before offboarding completes.

---

### Security & Integrity Rules

#### `AF-SEC-001`: File Attachment Quarantine
All uploaded files are written to a quarantine prefix (`uploads/quarantine/`) and cannot be accessed or downloaded until validation checks confirm they are safe.
*Cross-link:* See [ARCHITECTURE.md Section 13](../../ARCHITECTURE.md#13-file-upload-architecture).

#### `AF-SEC-002`: CSV Formula Injection Protection
To prevent Formula Injection attacks in data exports, all string cells containing leading characters `=`, `+`, `-`, or `@` must be prepended with a single quote `'` during serialization.

#### `AF-NOTIF-001`: Notification Deduplication
Each transaction event carries a unique notification idempotency token. Background workers check this token in Redis to prevent sending duplicate notifications if network timeouts occur.

#### `AF-REP-001`: Reporting Snapshots
To prevent database locks on operational tables, reports must query read replicas using transaction snapshots.

---

## 2. Edge Case Resolution Policies

### Simultaneous Allocation Attempts
If two managers attempt to allocate the same `AVAILABLE` asset simultaneously:
- The first transaction to commit locks the asset row.
- The second transaction fails the optimistic check (`version` mismatch) or hits the database partial unique index constraint, throwing a `409 Conflict` error.

### Simultaneous Booking Attempts
If two employees request the exact same booking slot for a resource:
- The database range exclusion constraint (`gist`) allows only the transaction that commits first.
- The second request is rejected with a `409 Conflict` error.

### Transfer Approval After Return
If a transfer request is pending but the current custodian returns the asset to the warehouse first:
- The return sets the asset custody to `UNALLOCATED` and deactivates the current allocation.
- The pending transfer request is automatically set to `CANCELLED` because the source allocation is no longer active.

### Maintenance Approval During Transfer
If a maintenance request is approved while an asset is undergoing transfer:
- The maintenance approval updates the asset serviceability status to `UNDER_MAINTENANCE`.
- Sibling transfer transactions verify this status on completion; transfers are rejected if the asset is not `OPERATIONAL`.

### Resource Maintenance with Future Bookings
If an asset is moved to maintenance, creating a blackout range:
- Any future user bookings that overlap with this blackout are flagged.
- The system emits a `BookingConflictEvent` to notify the holders, allowing administrators to manually reschedule or reassign the resource.

### User Deactivated While Logged In
If an admin deactivates a user's membership while the user has an active session:
- The user's JWT token remains valid until it expires (max 15 minutes).
- However, any critical write operation calls the database user status check, rejecting changes immediately if the user is `INACTIVE`.

### Department Deactivated with Active Assets
If an administrator deactivates a department:
- The deactivation request is rejected if the department currently holds active asset allocations.
- Assets must be returned or transferred to another department first.

### Lost Asset Later Recovered
If an asset is reported `LOST` but later found during an audit:
- The auditor records it as a discrepancy.
- Once the audit cycle is resolved, an administrator initiates a `Recover` transition, setting the asset back to `ACTIVE` and `UNALLOCATED`.

### Category Schema Changed After Assets Exist
If a category schema is updated:
- Existing asset records retain their original metadata values.
- Schema changes are only enforced during edit operations on existing assets or when creating new assets.

### Daylight-Saving Time Adjustments
- All time inputs are converted and stored in **UTC**.
- For local time display, the system uses the client's registered timezone database (IANA format). Ambiguous hour transitions (DST changes) are handled by storing the exact UTC offset.

### Asset Changes Holder During Audit
If custody of an asset is transferred while an active audit cycle is in progress:
- The audit cycle tracking evaluates findings against the original activation snapshot.
- The change in holder is flagged as a mismatch to be reconciled before closure.

### Duplicate Offline Audit Submission
If an auditor submits an offline report twice due to connection lag:
- The audit item submission includes a cycle-specific idempotency key.
- The second write attempt is rejected as a duplicate.

### Stale Notification Reminders
If a background worker is scheduled to send an overdue allocation reminder but the user returns the asset before the job runs:
- The consumer evaluates the current allocation state before sending the email.
- The job exits without action if the allocation is no longer `ACTIVE`.
