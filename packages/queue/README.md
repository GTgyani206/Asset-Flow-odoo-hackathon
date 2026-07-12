# @assetflow/queue

**Owner**: Platform team  
**Status**: Scaffold – no queue interface defined yet

## Purpose

Provides the **queue abstraction interface** that isolates BullMQ from all domain and application code. Application services depend on this interface, not on BullMQ directly.

## Dependency Rules

- **May depend on**: `@assetflow/domain` (for event types), language primitives.
- **Must NOT depend on**: BullMQ, Redis client, any infrastructure SDK directly.
- **Imported by**: `apps/api` (to enqueue jobs), `apps/worker` (for the BullMQ implementation).

## What belongs here

- `IQueuePublisher` interface.
- `IJobHandler` interface.
- Queue name constants.
- Job payload types.

## What does NOT belong here

- BullMQ `Queue` or `Worker` instances.
- Redis connection logic.
- Any business logic.

## Implementation Note

BullMQ-specific implementations live in `apps/worker/src/consumers/` and are injected at startup via NestJS DI. This allows the application layer to remain decoupled from the queue vendor.
