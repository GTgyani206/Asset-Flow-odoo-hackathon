# Module: resource-booking

**Owner**: Asset management team  
**Status**: Not yet implemented

## Responsibility

Manages bookings of shared resources (conference rooms, vehicles, projectors, etc.) without overlapping time slots.

## Dependency Rules

- **May import from**: `@assetflow/contracts`, `@assetflow/domain`, `@assetflow/database`, `@assetflow/config`, `@assetflow/observability`.
- **Must NOT import from**: `allocation`, `maintenance`, or `audit` internals.
- **Communicates async via**: `ResourceBookedEvent` → outbox → worker.

## Critical Engineering Rules

- Overlapping bookings are prevented by a **PostgreSQL range exclusion constraint** using `gist` on `(resourceId, tsrange(startTime, endTime))`. Application-level checks are secondary.
- All booking commands execute within a database transaction.
- Idempotency keys required on `BookResource` command.
- Timestamps are stored and compared in UTC only.
