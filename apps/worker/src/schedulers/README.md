# apps/worker – schedulers

Cron-triggered schedulers that enqueue recurring background jobs.

## Rules

- Schedulers only **enqueue** jobs; they do not process them directly.
- All scheduled jobs must have a corresponding idempotent consumer in `consumers/`.
- Scheduler cadence must be configurable via environment variables, not hard-coded.
