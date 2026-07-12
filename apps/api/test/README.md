# apps/api – tests

Integration and e2e tests for the API application.

- Unit tests live alongside their source files as `*.spec.ts`.
- Integration tests here use Supertest and Testcontainers.
- E2e tests exercise the full HTTP stack against a real database.

See `@assetflow/testing` for shared test utilities and factories.
