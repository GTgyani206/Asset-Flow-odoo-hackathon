# AssetFlow Two-Phase Completion Plan

This plan converts the AssetFlow architecture into two implementation phases. Phase 1 creates a usable, integrity-first product foundation. Phase 2 turns that foundation into a production launch candidate with hardening, analytics, and operational controls.

## Phase 1: Core Integrity Product

Goal: deliver the complete transactional backbone and a usable internal product for administrators, asset managers, department heads, employees, and auditors.

Required outcomes:

- Tenant-aware identity, membership, employee directory, role assignment, and permission checks.
- Organization setup for departments, locations, categories, category schema versions, and scoped role assignments.
- Asset registry with tenant-scoped asset tags, lifecycle/custody/serviceability state dimensions, immutable state history, document metadata, and private object-storage references.
- Allocation, transfer, return, and inspection workflows guarded by database constraints, state machines, idempotency keys, activity logs, and outbox events.
- Generic resources and booking workflows with non-overlap enforcement, half-open intervals, blackout support, cancellation, reminders, and no-show states.
- Maintenance workflow from request through approval, assignment, work log, resolution, and resource blackout synchronization.
- Audit workflow with cycle setup, scoped auditor assignments, snapshot items, discrepancy handling, immutable closure, and amendment-only corrections.
- Notification and worker foundation for in-app delivery, retryable email/webhook delivery, outbox polling, scheduled reminders, overdue detection, and export job processing.
- Role-aware web application with dense operational dashboards, asset registry, allocation, booking calendar, maintenance queue, audit console, notifications, and report job views.
- Automated validation covering domain state transitions, authorization, tenant isolation, idempotency, database constraints, worker idempotency, and web workflow smoke tests.

Phase 1 exit gates:

- Double allocation is impossible at the database level.
- Booking overlap is impossible at the database level.
- Closed audit cycles cannot be edited directly.
- Disposed assets cannot re-enter normal workflows.
- Public signup cannot create privileged roles.
- Every high-value command stores an idempotency record and an activity log entry.
- Worker retries do not duplicate notifications, exports, or state transitions.
- The web app exposes every core workflow with accessible empty, loading, error, and conflict states.

## Phase 2: Production Launch Candidate

Goal: harden Phase 1 into a deployable, observable, recoverable production system.

Required outcomes:

- PostgreSQL row-level security policies, tenant isolation tests, migration rehearsals, and restore-tested backups.
- Secure file pipeline with pre-signed uploads, MIME verification, malware scanning hooks, quarantine state, hashes, and temporary signed downloads.
- MFA for privileged roles, rotating refresh tokens, session version invalidation, CSRF protection, strict CORS, secure headers, and security audit logging.
- Reporting read models, materialized aggregates, dashboard freshness timestamps, asynchronous CSV/XLSX exports, formula-injection protection, and expiring downloads.
- Notification preferences, template versioning, dead-letter handling, replay tooling, digest batching, and obsolete-reminder suppression.
- Observability using structured logs, correlation IDs, traces, metrics, alert rules, dashboards, and business KPIs.
- CI/CD with lint, formatting check, typecheck, unit/integration/E2E tests, security scans, migration validation, container build, staging smoke tests, and production canary workflow.
- Infrastructure as code for app services, worker services, PostgreSQL, Redis, object storage, queue, secrets, backup policies, health checks, and autoscaling.
- Disaster recovery runbooks with RPO of five minutes or better and RTO of sixty minutes or better.
- Accessibility, load, concurrency, chaos, penetration, backup-restore, rollback, and incident-response drills.

Phase 2 exit gates:

- Restore drills and migration rehearsals have evidence.
- Monitoring alerts cover API error rate, lock waits, queue age, outbox lag, dead letters, backup failures, replica lag, and scheduler contention.
- Production secrets are externally managed and no environment file is required in the repository.
- Long-running operations are asynchronous and replayable.
- Administrators can investigate activity logs, failed notifications, export jobs, scheduler runs, and worker retries.
- Accessibility checks pass for dashboards, data tables, dialogs, forms, calendars, and mobile audit/scanning flows.

## Implementation Order

1. Shared domain, contract, configuration, queue, and observability packages.
2. PostgreSQL schema, raw SQL constraints, seed permissions, and migration tests.
3. API command handlers, authorization guards, idempotency middleware, activity logging, and outbox writes.
4. Worker outbox polling, scheduled jobs, notification delivery, exports, and retry policies.
5. Web application connected to typed contracts and role-aware workflow screens.
6. Integration, concurrency, E2E, security, accessibility, and operational verification.

## Non-Goals

- Purchasing, invoicing, procurement, payroll, accounting, and inventory valuation remain outside AssetFlow.
- Phase 1 does not require microservices. The implementation remains a modular monolith with a separate web app, core API, and worker process.
- Phase 2 hardening does not change the business boundary; it improves reliability, security, reporting, and deployability.
