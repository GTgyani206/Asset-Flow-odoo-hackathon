# Error Catalog

This document specifies the standard error codes, corresponding HTTP status codes, user-safe descriptions, retry guidelines, and logging severities for AssetFlow.

---

## Error Catalog Table

| Error Code | HTTP Status | User-Safe Message | Retryable | Logging Severity |
|---|---|---|---|---|
| **`AUTHENTICATION_REQUIRED`** | 401 | Authentication credentials were not provided or are invalid. Please log in again. | No | INFO |
| **`INVALID_CREDENTIALS`** | 401 | The email or password provided is incorrect. | No | INFO |
| **`EMAIL_NOT_VERIFIED`** | 403 | Your email address has not been verified yet. Please check your inbox. | No | INFO |
| **`ACCOUNT_INACTIVE`** | 403 | This account has been deactivated. Please contact your organization administrator. | No | WARN |
| **`FORBIDDEN`** | 403 | You do not have the required permissions to perform this action. | No | WARN |
| **`TENANT_SCOPE_VIOLATION`** | 403 | The requested resource belongs to a different organization partition. | No | ERROR |
| **`VALIDATION_FAILED`** | 422 | The request payload contains invalid parameters. Please correct the highlighted fields. | No | DEBUG |
| **`RESOURCE_NOT_FOUND`** | 404 | The requested resource could not be found. | No | DEBUG |
| **`CONCURRENT_MODIFICATION`** | 412 | The resource was modified by another process. Please reload and try again. | Yes | INFO |
| **`IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_PAYLOAD`** | 400 | This idempotency key was previously used with a different request payload. | No | WARN |
| **`ASSET_ALREADY_ALLOCATED`** | 409 | This asset is already allocated to another custodian. | No | INFO |
| **`ASSET_NOT_ALLOCATABLE`** | 422 | The asset is in a lifecycle or maintenance state that prevents allocation. | No | INFO |
| **`TRANSFER_STALE`** | 409 | This transfer request is no longer valid (e.g., source allocation changed). | No | INFO |
| **`RETURN_INSPECTION_REQUIRED`** | 422 | An asset return must include an inspection report to be accepted. | No | INFO |
| **`BOOKING_OVERLAP`** | 409 | The resource is already reserved during the requested time slot. | Yes | INFO |
| **`INVALID_TIME_RANGE`** | 422 | The booking end time must be greater than the start time. | No | DEBUG |
| **`AMBIGUOUS_LOCAL_TIME`** | 400 | The local time provided is ambiguous due to a daylight-saving transition. Please use UTC. | No | WARN |
| **`RESOURCE_UNAVAILABLE`** | 422 | The resource is temporarily unavailable due to a blackout or maintenance event. | No | INFO |
| **`MAINTENANCE_STATE_CONFLICT`** | 409 | The maintenance request cannot progress because the asset is currently allocated. | No | INFO |
| **`AUDIT_ALREADY_CLOSED`** | 409 | This audit cycle is closed and cannot be updated. | No | WARN |
| **`AUDIT_ITEMS_INCOMPLETE`** | 422 | An audit cycle cannot be closed while there are unverified audit items. | No | INFO |
| **`FILE_QUARANTINED`** | 403 | The requested file is quarantined and undergoing malware validation. | Yes | INFO |
| **`FILE_REJECTED`** | 422 | The uploaded file was rejected due to an invalid format or malware detection. | No | WARN |
| **`RATE_LIMITED`** | 429 | Too many requests. Please slow down and wait before trying again. | Yes | INFO |
| **`DEPENDENCY_UNAVAILABLE`** | 503 | An internal service dependency (e.g. database, queue) is temporarily offline. | Yes | ERROR |
| **`INTERNAL_ERROR`** | 500 | An unexpected system error occurred. Our engineers have been notified. | Yes | ERROR |

---

## Error Catalog Cross-Links
*   *Validation errors* map directly to schema properties defined in [`API_CONVENTIONS.md`](./API_CONVENTIONS.md).
*   *Conflict rules* (allocation, booking, audit) are governed by constraints declared in [`DATABASE.md`](../data/DATABASE.md#11-critical-database-constraints).
