# Event Catalog

This document specifies the event envelope structure and catalog of domain events used for asynchronous messaging and transactional outbox logs in AssetFlow.

---

## 1. Event Envelope Structure

All domain events must utilize the following JSON envelope format to ensure routing consistency and traceability across worker processes:

```json
{
  "eventId": "uuid-v7-event-id",
  "eventType": "module.aggregate.action",
  "eventVersion": 1,
  "occurredAt": "2026-07-12T07:40:00.000Z",
  "tenantId": "uuid-tenant-id",
  "aggregateType": "Asset",
  "aggregateId": "uuid-asset-id",
  "actorId": "uuid-user-id-or-system",
  "correlationId": "uuid-correlation-id",
  "causationId": "uuid-causation-event-id",
  "payload": {
    "data": "event-specific-properties"
  }
}
```

---

## 2. Catalog of Planned Events

### identity-access

#### `EmployeeActivated`
*   **Producer:** `identity-access`
*   **Consumers:** `notifications`, `activity-log`
*   **Required Payload Fields:** `employeeId` (UUID), `email` (string), `departmentId` (UUID)
*   **Privacy Notes:** Email is PII. Must be handled securely by email services. Do not include user password hashes or address fields.
*   **Idempotency Key:** `eventId`

#### `RoleAssigned`
*   **Producer:** `identity-access`
*   **Consumers:** `notifications`, `activity-log`
*   **Required Payload Fields:** `membershipId` (UUID), `employeeId` (UUID), `role` (enum: `ADMIN`, `ASSET_MANAGER`, `DEPARTMENT_HEAD`, `EMPLOYEE`)
*   **Privacy Notes:** None.
*   **Idempotency Key:** `membershipId` + `role` + `eventVersion`

---

### asset-registry

#### `AssetRegistered`
*   **Producer:** `asset-registry`
*   **Consumers:** `activity-log`
*   **Required Payload Fields:** `assetId` (UUID), `assetTag` (string), `categoryId` (UUID), `condition` (string)
*   **Privacy Notes:** Avoid logging notes containing employee names or personal desk location details.
*   **Idempotency Key:** `assetId`

---

### allocation

#### `AssetAllocated`
*   **Producer:** `allocation`
*   **Consumers:** `notifications`, `activity-log`
*   **Required Payload Fields:** `allocationId` (UUID), `assetId` (UUID), `holderId` (UUID), `holderType` (string: `EMPLOYEE`/`DEPARTMENT`), `expectedReturnDate` (string/null)
*   **Privacy Notes:** None.
*   **Idempotency Key:** `allocationId`

#### `TransferRequested`
*   **Producer:** `allocation`
*   **Consumers:** `notifications`
*   **Required Payload Fields:** `transferId` (UUID), `assetId` (UUID), `sourceHolderId` (UUID), `targetHolderId` (UUID), `approverId` (UUID)
*   **Privacy Notes:** None.
*   **Idempotency Key:** `transferId`

#### `TransferApproved`
*   **Producer:** `allocation`
*   **Consumers:** `notifications`, `activity-log`
*   **Required Payload Fields:** `transferId` (UUID), `approverId` (UUID), `approvedAt` (string)
*   **Privacy Notes:** None.
*   **Idempotency Key:** `transferId` + `approvedAt`

#### `TransferCompleted`
*   **Producer:** `allocation`
*   **Consumers:** `notifications`, `activity-log`
*   **Required Payload Fields:** `transferId` (UUID), `assetId` (UUID), `newAllocationId` (UUID)
*   **Privacy Notes:** None.
*   **Idempotency Key:** `transferId`

#### `ReturnRequested`
*   **Producer:** `allocation`
*   **Consumers:** `notifications`
*   **Required Payload Fields:** `returnId` (UUID), `assetId` (UUID), `holderId` (UUID)
*   **Privacy Notes:** None.
*   **Idempotency Key:** `returnId`

#### `ReturnAccepted`
*   **Producer:** `allocation`
*   **Consumers:** `notifications`, `activity-log`
*   **Required Payload Fields:** `returnId` (UUID), `assetId` (UUID), `condition` (string)
*   **Privacy Notes:** None.
*   **Idempotency Key:** `returnId`

---

### resource-booking

#### `BookingCreated`
*   **Producer:** `resource-booking`
*   **Consumers:** `notifications`, `activity-log`
*   **Required Payload Fields:** `bookingId` (UUID), `resourceId` (UUID), `employeeId` (UUID), `timeRange` (object: `start`, `end`)
*   **Privacy Notes:** Avoid logging description fields containing sensitive meeting titles.
*   **Idempotency Key:** `bookingId`

#### `BookingCancelled`
*   **Producer:** `resource-booking`
*   **Consumers:** `notifications`, `activity-log`
*   **Required Payload Fields:** `bookingId` (UUID), `reason` (string)
*   **Privacy Notes:** None.
*   **Idempotency Key:** `bookingId`

#### `ResourceBlackoutCreated`
*   **Producer:** `resource-booking`
*   **Consumers:** `notifications`, `activity-log`
*   **Required Payload Fields:** `blackoutId` (UUID), `resourceId` (UUID), `timeRange` (object: `start`, `end`), `reason` (string)
*   **Privacy Notes:** None.
*   **Idempotency Key:** `blackoutId`

---

### maintenance

#### `MaintenanceRequested`
*   **Producer:** `maintenance`
*   **Consumers:** `notifications`, `activity-log`
*   **Required Payload Fields:** `requestId` (UUID), `assetId` (UUID), `requesterId` (UUID), `description` (string)
*   **Privacy Notes:** None.
*   **Idempotency Key:** `requestId`

#### `MaintenanceApproved`
*   **Producer:** `maintenance`
*   **Consumers:** `notifications`, `activity-log`
*   **Required Payload Fields:** `requestId` (UUID), `approverId` (UUID)
*   **Privacy Notes:** None.
*   **Idempotency Key:** `requestId`

#### `MaintenanceResolved`
*   **Producer:** `maintenance`
*   **Consumers:** `notifications`, `activity-log`
*   **Required Payload Fields:** `requestId` (UUID), `resolverId` (UUID), `resolutionDetails` (string)
*   **Privacy Notes:** None.
*   **Idempotency Key:** `requestId`

---

### audit

#### `AuditCycleStarted`
*   **Producer:** `audit`
*   **Consumers:** `notifications`, `activity-log`
*   **Required Payload Fields:** `cycleId` (UUID), `startedAt` (string), `auditorIds` (array of UUIDs)
*   **Privacy Notes:** None.
*   **Idempotency Key:** `cycleId`

#### `AuditDiscrepancyFlagged`
*   **Producer:** `audit`
*   **Consumers:** `notifications`, `activity-log`
*   **Required Payload Fields:** `cycleId` (UUID), `itemId` (UUID), `assetId` (UUID), `discrepancyType` (string: `LOCATION_MISMATCH`/`CONDITION_DEGRADED`/`MISSING`), `expectedValue` (string), `foundValue` (string)
*   **Privacy Notes:** Do not log names of employees audited.
*   **Idempotency Key:** `itemId` + `discrepancyType`

#### `AuditCycleClosed`
*   **Producer:** `audit`
*   **Consumers:** `notifications`, `activity-log`
*   **Required Payload Fields:** `cycleId` (UUID), `closedAt` (string), `totalDiscrepancies` (integer)
*   **Privacy Notes:** None.
*   **Idempotency Key:** `cycleId`

---

### notifications

#### `NotificationRequested`
*   **Producer:** `notifications` (or system events mapping logic)
*   **Consumers:** `notifications` (worker delivery)
*   **Required Payload Fields:** `notificationId` (UUID), `recipientId` (UUID), `channel` (string: `EMAIL`/`IN_APP`), `templateName` (string), `variables` (JSON object)
*   **Privacy Notes:** Mask sensitive links and PII tokens in logs.
*   **Idempotency Key:** `notificationId`

---

### reporting

#### `ExportRequested`
*   **Producer:** `reporting`
*   **Consumers:** `reporting` (worker compiler)
*   **Required Payload Fields:** `jobId` (UUID), `requesterId` (UUID), `reportType` (string: `ASSET_INVENTORY`/`BOOKING_STATS`), `filters` (JSON object)
*   **Privacy Notes:** None.
*   **Idempotency Key:** `jobId`

#### `ExportCompleted`
*   **Producer:** `reporting` (worker compiler)
*   **Consumers:** `notifications`
*   **Required Payload Fields:** `jobId` (UUID), `requesterId` (UUID), `downloadUrl` (string/pre-signed S3 URL)
*   **Privacy Notes:** Pre-signed URLs must have a short TTL (e.g. 15 minutes) and must only be visible/transmitted securely to the requester.
*   **Idempotency Key:** `jobId`
