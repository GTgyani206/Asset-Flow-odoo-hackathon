# Module: notifications

**Owner**: Platform team  
**Status**: Not yet implemented

## Responsibility

Delivers in-app and email notifications triggered by domain events from other modules. Consumed asynchronously via the worker.

## Dependency Rules

- **May import from**: `@assetflow/contracts`, `@assetflow/domain`, `@assetflow/database`, `@assetflow/config`, `@assetflow/observability`, `@assetflow/queue`.
- **Must NOT import from**: Any business module internals directly. Receives only domain events.
- **Triggered by**: Events from `allocation`, `maintenance`, `audit`, `identity-access`.

## Rules

- Notification delivery is best-effort for in-app notifications.
- Email delivery must be retried by the worker with exponential backoff.
- Never include secrets, credentials, or PII beyond what is strictly required for the notification.
