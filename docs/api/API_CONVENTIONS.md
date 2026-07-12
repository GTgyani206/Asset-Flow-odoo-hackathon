# API Conventions

This document specifies the communication standards, validation rules, error handling structures, and endpoint designs for the AssetFlow API.

---

## 1. REST & Versioning

*   **RESTful Design:** The API follows REST principles. Resources are identified by URLs, and standard HTTP methods define actions:
    *   `GET`: Read resource representation.
    *   `POST`: Create resources or execute workflow commands.
    *   `PUT`: Update resources (full replacement).
    *   `DELETE`: Archive or soft-delete resources.
*   **Version Prefix:** The API is prefixed with `/api/v1/` to support future non-breaking updates:
    *   *Example:* `https://api.assetflow.io/api/v1/assets`

---

## 2. Resource Naming

API paths must use **plural nouns** in kebab-case format:
*   `GET /api/v1/asset-categories`
*   `GET /api/v1/maintenance-requests`

---

## 3. Workflow-Command Endpoints

To maintain state-machine integrity, mutating actions must utilize **explicit command endpoints** rather than generic `PATCH` requests that target status fields directly:

*   *Do NOT do:* `PATCH /api/v1/assets/{id}` with body `{ "status": "ALLOCATED" }`
*   *Do:* `POST /api/v1/assets/{id}/allocate` with body `{ "holderId": "..." }`
*   *Do:* `POST /api/v1/transfers/{id}/approve`
*   *Do:* `POST /api/v1/maintenance-requests/{id}/resolve`

---

## 4. Authentication & Tenant Context

*   **Bearer Tokens:** Access is verified via JWT tokens passed in the authorization header:
    ```http
    Authorization: Bearer <JWT_TOKEN>
    ```
*   **Implicit Tenant Scope:** The API server resolves the user's `tenant_id` scope directly by parsing the JWT claims. Request payloads, paths, or query parameters must not contain a tenant ID. Clients cannot manually set or override the active tenant.

---

## 5. Request Validation

*   **Zod Schema Validation:** All request body inputs are validated against Zod schemas defined in `@assetflow/contracts`.
*   **Strict Property Whitelisting:** Any request containing undeclared fields must be rejected with a `422 Unprocessable Entity` status to prevent parameter injection attacks.

---

## 6. RFC 7807 Error Envelope

All API errors return the standard `application/problem+json` format (RFC 7807):

```json
{
  "type": "https://api.assetflow.io/errors/VALIDATION_FAILED",
  "title": "Validation Failed",
  "status": 422,
  "detail": "The asset tag value 'AF-123' does not match formatting rules.",
  "instance": "/api/v1/assets",
  "code": "VALIDATION_FAILED",
  "invalidParams": [
    {
      "name": "assetTag",
      "reason": "Must match regex pattern ^AF-[A-Z0-9]{6}$"
    }
  ]
}
```

---

## 7. Idempotency Key Behavior

All state-mutating requests (`POST`, `PUT`, `DELETE`) require a unique UUID passed in the `X-Idempotency-Key` header:

1.  **Deduplication Lookup:** Middleware checks the key in Redis before running the request.
2.  **Duplicate Request:** If the key exists, the API returns the cached response directly.
3.  **Conflict Check:** If a request is received with a duplicate key but a different payload, the API returns `400 Bad Request`.
4.  **TTL:** Successful responses are cached in Redis with a 24-hour TTL.

---

## 8. Optimistic Concurrency Control

Write operations on mutable resources must verify concurrent edit state using the `If-Match` header containing the current `version` integer:

```http
If-Match: 4
```

If the resource version has changed in the database, the API returns `412 Precondition Failed`.

---

## 9. Cursor Pagination

Endpoints returning lists of records must implement cursor-based pagination. Offset-based (`page`) pagination is prohibited to avoid record skipping on active lists.

**Parameters:**
*   `limit`: Integer representing the maximum count of returned records (default `20`, max `100`).
*   `cursor`: Base64 encoded string containing the identifier and sort sorting index of the boundary record.

---

## 10. Query parameters: Filter, Sort, Search

*   **Filtering:** Scoped using `filter[property]=value`:
    *   `GET /api/v1/assets?filter[status]=AVAILABLE`
*   **Sorting:** Scoped using `sort=property` (ascending) or `sort=-property` (descending):
    *   `GET /api/v1/assets?sort=-createdAt`
*   **Full-Text Search:** Query term passed using `q=term`:
    *   `GET /api/v1/assets?q=thinkpad`

---

## 11. Date, Time & Timezone Formats

All timestamps passed through the API must use ISO-8601 UTC format:
`YYYY-MM-DDTHH:mm:ss.sssZ` (e.g. `2026-07-12T07:39:52.000Z`).

---

## 12. File Upload Flow

File uploads must bypass the main API gateway process to avoid resource locking:

```
┌───────────┐                ┌───────────┐                ┌───────────┐
│  Client   │                │   NestJS  │                │   MinIO   │
│           │                │    API    │                │  Storage  │
└─────┬─────┘                └─────┬─────┘                └─────┬─────┘
      │                            │                            │
      │ 1. POST /uploads/presign   │                            │
      ├───────────────────────────►│                            │
      │                            │                            │
      │ 2. Return pre-signed URL   │                            │
      │◄───────────────────────────┤                            │
      │                            │                            │
      │ 3. PUT file binary data    │                            │
      ├────────────────────────────┼───────────────────────────►│
      │                            │                            │
      │ 4. HTTP 200 OK             │                            │
      │◄───────────────────────────┼────────────────────────────┤
      │                            │                            │
      │ 5. POST /assets (attachment URL)                        │
      ├───────────────────────────►│                            │
      │                            │                            │
      │ 6. HTTP 201 Created        │                            │
      │◄───────────────────────────┤                            │
```

---

## 13. Asynchronous Export Operations

Expensive operations (such as generating large CSV reports) must run asynchronously to prevent database locks:

1.  **Request:** User calls `POST /api/v1/reports/exports`.
2.  **Staged Response:** The API returns `202 Accepted` along with a task coordinate:
    ```json
    { "jobId": "job-uuid-123", "status": "QUEUED" }
    ```
3.  **Polling:** Client queries `GET /api/v1/reports/exports/job-uuid-123` to track processing.
4.  **Completed:** Once complete, the job endpoint returns `303 See Other` redirecting to the secure S3 download URL.

---

## 14. Rate Limit Headers

Every response payload contains rate limit values:
*   `X-RateLimit-Limit`: Maximum requests allowed within the window.
*   `X-RateLimit-Remaining`: Remaining requests allowed.
*   `X-RateLimit-Reset`: UTC epoch timestamp indicating when the window resets.

---

## 15. Correlation & Trace Headers

*   **`X-Correlation-ID`:** A unique identifier generated on the client or API gateway to correlate logs across services.
*   **`traceparent`:** Follows the W3C Trace Context standard (e.g. `00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01`) to propagate distributed traces.

---

## 16. Deprecation Policy

When deprecating endpoints, the response must include:
*   `Deprecation`: Date/timestamp indicating when the endpoint was deprecated.
*   `Sunset`: Target decommissioning date.

---

## 17. OpenAPI Requirements

API schemas must be declared using OpenAPI 3.0 specs. These are auto-generated from NestJS modules via decorators to ensure the documentation stays in sync with changes.

---

## 18. Target Endpoint Catalog (Reference Design)

Below are example routes planned for implementation across the core business modules:

### identity-access
*   `POST /api/v1/identity/signup` - Registers a new user (assigns `EMPLOYEE` role).
*   `POST /api/v1/identity/bootstrap` - First admin creation (requires `ADMIN_BOOTSTRAP_SECRET`).
*   `POST /api/v1/identity/roles/assign` - Update user role assignment.

### organization
*   `POST /api/v1/departments` - Create organizational department.
*   `PUT /api/v1/departments/{id}/parent` - Update hierarchy parent.

### asset-registry
*   `POST /api/v1/assets` - Register a physical hardware asset.
*   `POST /api/v1/assets/{id}/retire` - Move asset status to retired.

### allocation
*   `POST /api/v1/assets/{id}/allocate` - Allocate asset to an employee.
*   `POST /api/v1/transfers/initiate` - Propose asset custody transfer.
*   `POST /api/v1/returns/initiate` - Log return request.

### resource-booking
*   `POST /api/v1/resources` - Register a bookable space/item.
*   `POST /api/v1/resources/{id}/bookings` - Reserve a resource booking slot.

### maintenance
*   `POST /api/v1/maintenance-requests` - Submit repair ticket.
*   `POST /api/v1/maintenance-requests/{id}/approve` - Approve maintenance work.

### audit
*   `POST /api/v1/audits` - Create audit cycle.
*   `POST /api/v1/audits/{id}/activate` - Activate audit cycle and capture state snapshot.
*   `POST /api/v1/audits/{id}/items/{itemId}/verify` - Record physical audit findings.
