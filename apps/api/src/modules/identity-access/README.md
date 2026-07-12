# Module: identity-access

**Owner**: Platform team  
**Status**: Not yet implemented

## Responsibility

Manages authentication (login/logout/refresh), public signup (creates Employee-level membership only), the controlled admin bootstrap mechanism, role assignment (Admin only), and JWT token issuance.

## Dependency Rules

- **May import from**: `@assetflow/contracts`, `@assetflow/domain`, `@assetflow/database`, `@assetflow/config`, `@assetflow/observability`.
- **Must NOT import from**: Any other business module's controllers, services, or repositories.
- **Communicates async via**: `UserCreatedEvent`, `RoleChangedEvent` → outbox → worker.

## Account Rules

- Public signup assigns `EMPLOYEE` role only.
- `ADMIN`, `ASSET_MANAGER`, `DEPARTMENT_HEAD` roles are assigned by an existing Admin.
- First Admin is created via the bootstrap endpoint, protected by `ADMIN_BOOTSTRAP_SECRET`.

## What does NOT belong here

- Asset, allocation, or booking logic.
- Audit cycle management.
