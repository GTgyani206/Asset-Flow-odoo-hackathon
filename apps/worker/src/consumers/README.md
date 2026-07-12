# apps/worker – consumers

BullMQ **Worker** instances that process jobs from the queue.

## Rules

- Every consumer must be **idempotent** – processing the same job twice must produce the same result.
- Consumers depend on the `@assetflow/queue` interface, not on BullMQ directly in business logic.
- A consumer may only access its own module's data. Cross-module data access goes through the API or domain events.
- Consumer failures must be logged with structured context (job ID, attempt, error).
