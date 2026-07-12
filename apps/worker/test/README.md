# apps/worker – tests

Integration tests for worker consumers and schedulers.

- Unit tests live alongside their source files as `*.spec.ts`.
- Integration tests here use Testcontainers (PostgreSQL + Redis) and test full consumer flows.

See `@assetflow/testing` for shared test utilities and factories.
