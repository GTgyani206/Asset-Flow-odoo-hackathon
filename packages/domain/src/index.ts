export const DOMAIN_VERSION = "1.0.0";

export type TenantId = string;
export type UserId = string;
export type EmployeeId = string;
export type DepartmentId = string;
export type AssetId = string;
export type ResourceId = string;
export type BookingId = string;

export const assetLifecycleStates = ["ACTIVE", "LOST", "RETIRED", "DISPOSED"] as const;
export type AssetLifecycleState = (typeof assetLifecycleStates)[number];

export const assetCustodyStates = ["UNALLOCATED", "ALLOCATED"] as const;
export type AssetCustodyState = (typeof assetCustodyStates)[number];

export const assetServiceabilityStates = ["OPERATIONAL", "UNDER_MAINTENANCE"] as const;
export type AssetServiceabilityState = (typeof assetServiceabilityStates)[number];

export const assetReservationStates = ["NONE", "RESERVED"] as const;
export type AssetReservationState = (typeof assetReservationStates)[number];

export const assetDisplayStatuses = [
  "DISPOSED",
  "RETIRED",
  "LOST",
  "UNDER_MAINTENANCE",
  "RESERVED",
  "ALLOCATED",
  "AVAILABLE",
] as const;
export type AssetDisplayStatus = (typeof assetDisplayStatuses)[number];

export interface AssetStateVector {
  lifecycle: AssetLifecycleState;
  custody: AssetCustodyState;
  serviceability: AssetServiceabilityState;
  reservation: AssetReservationState;
}

export function deriveAssetDisplayStatus(state: AssetStateVector): AssetDisplayStatus {
  if (state.lifecycle === "DISPOSED") return "DISPOSED";
  if (state.lifecycle === "RETIRED") return "RETIRED";
  if (state.lifecycle === "LOST") return "LOST";
  if (state.serviceability === "UNDER_MAINTENANCE") return "UNDER_MAINTENANCE";
  if (state.reservation === "RESERVED") return "RESERVED";
  if (state.custody === "ALLOCATED") return "ALLOCATED";
  return "AVAILABLE";
}

export const allocationStatuses = ["ACTIVE", "RETURN_REQUESTED", "CLOSED", "CANCELLED"] as const;
export type AllocationStatus = (typeof allocationStatuses)[number];

export const transferStatuses = [
  "REQUESTED",
  "APPROVED",
  "AWAITING_HANDOVER",
  "HANDOVER_CONFIRMED",
  "COMPLETED",
  "REJECTED",
  "CANCELLED",
  "EXPIRED",
] as const;
export type TransferStatus = (typeof transferStatuses)[number];

export const returnStatuses = [
  "RETURN_REQUESTED",
  "AWAITING_INSPECTION",
  "ACCEPTED",
  "ACCEPTED_WITH_DAMAGE",
  "REJECTED_FOR_CORRECTION",
  "CANCELLED",
] as const;
export type ReturnStatus = (typeof returnStatuses)[number];

export const bookingStatuses = [
  "DRAFT",
  "UPCOMING",
  "ONGOING",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
  "ACTION_REQUIRED",
] as const;
export type BookingStatus = (typeof bookingStatuses)[number];

export const maintenanceStatuses = [
  "PENDING",
  "APPROVED",
  "TECHNICIAN_ASSIGNED",
  "IN_PROGRESS",
  "RESOLVED",
  "UNREPAIRABLE",
  "REJECTED",
  "CANCELLED",
] as const;
export type MaintenanceStatus = (typeof maintenanceStatuses)[number];

export const auditCycleStatuses = ["DRAFT", "SCHEDULED", "IN_PROGRESS", "REVIEW", "CLOSED", "CANCELLED"] as const;
export type AuditCycleStatus = (typeof auditCycleStatuses)[number];

export const auditItemResults = [
  "VERIFIED",
  "MISSING",
  "DAMAGED",
  "WRONG_LOCATION",
  "WRONG_HOLDER",
  "NOT_ACCESSIBLE",
  "NOT_APPLICABLE",
  "UNEXPECTED_ASSET",
] as const;
export type AuditItemResult = (typeof auditItemResults)[number];

export const holderTypes = ["EMPLOYEE", "DEPARTMENT"] as const;
export type HolderType = (typeof holderTypes)[number];

export const roleCodes = ["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD", "EMPLOYEE", "AUDITOR"] as const;
export type RoleCode = (typeof roleCodes)[number];

export const commandNames = [
  "ASSET_CREATE",
  "ASSET_ALLOCATE",
  "TRANSFER_APPROVE",
  "RETURN_INSPECT",
  "BOOKING_CREATE",
  "MAINTENANCE_APPROVE",
  "AUDIT_CLOSE",
  "REPORT_EXPORT",
] as const;
export type CommandName = (typeof commandNames)[number];

export class DomainRuleViolation extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly details: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = "DomainRuleViolation";
  }
}

const assetLifecycleTransitions: Record<AssetLifecycleState, readonly AssetLifecycleState[]> = {
  ACTIVE: ["LOST", "RETIRED", "DISPOSED"],
  LOST: ["ACTIVE", "DISPOSED"],
  RETIRED: ["DISPOSED", "ACTIVE"],
  DISPOSED: [],
};

const transferTransitions: Record<TransferStatus, readonly TransferStatus[]> = {
  REQUESTED: ["APPROVED", "REJECTED", "CANCELLED", "EXPIRED"],
  APPROVED: ["AWAITING_HANDOVER", "COMPLETED", "CANCELLED", "EXPIRED"],
  AWAITING_HANDOVER: ["HANDOVER_CONFIRMED", "CANCELLED", "EXPIRED"],
  HANDOVER_CONFIRMED: ["COMPLETED"],
  COMPLETED: [],
  REJECTED: [],
  CANCELLED: [],
  EXPIRED: [],
};

const maintenanceTransitions: Record<MaintenanceStatus, readonly MaintenanceStatus[]> = {
  PENDING: ["APPROVED", "REJECTED", "CANCELLED"],
  APPROVED: ["TECHNICIAN_ASSIGNED", "IN_PROGRESS", "CANCELLED"],
  TECHNICIAN_ASSIGNED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["RESOLVED", "UNREPAIRABLE", "CANCELLED"],
  RESOLVED: [],
  UNREPAIRABLE: [],
  REJECTED: [],
  CANCELLED: [],
};

const auditTransitions: Record<AuditCycleStatus, readonly AuditCycleStatus[]> = {
  DRAFT: ["SCHEDULED", "CANCELLED"],
  SCHEDULED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["REVIEW", "CANCELLED"],
  REVIEW: ["CLOSED"],
  CLOSED: [],
  CANCELLED: [],
};

export function assertAssetLifecycleTransition(from: AssetLifecycleState, to: AssetLifecycleState): void {
  if (!assetLifecycleTransitions[from].includes(to)) {
    throw new DomainRuleViolation("INVALID_ASSET_LIFECYCLE_TRANSITION", `Cannot transition asset from ${from} to ${to}`, {
      from,
      to,
    });
  }
}

export function assertTransferTransition(from: TransferStatus, to: TransferStatus): void {
  if (!transferTransitions[from].includes(to)) {
    throw new DomainRuleViolation("INVALID_TRANSFER_TRANSITION", `Cannot transition transfer from ${from} to ${to}`, {
      from,
      to,
    });
  }
}

export function assertMaintenanceTransition(from: MaintenanceStatus, to: MaintenanceStatus): void {
  if (!maintenanceTransitions[from].includes(to)) {
    throw new DomainRuleViolation("INVALID_MAINTENANCE_TRANSITION", `Cannot transition maintenance from ${from} to ${to}`, {
      from,
      to,
    });
  }
}

export function assertAuditTransition(from: AuditCycleStatus, to: AuditCycleStatus): void {
  if (!auditTransitions[from].includes(to)) {
    throw new DomainRuleViolation("INVALID_AUDIT_TRANSITION", `Cannot transition audit cycle from ${from} to ${to}`, {
      from,
      to,
    });
  }
}

export interface TimeRangeInput {
  startAt: Date;
  endAt: Date;
}

export function assertValidHalfOpenRange(range: TimeRangeInput): void {
  if (!(range.startAt instanceof Date) || Number.isNaN(range.startAt.getTime())) {
    throw new DomainRuleViolation("INVALID_START_TIME", "Booking start time must be a valid date");
  }
  if (!(range.endAt instanceof Date) || Number.isNaN(range.endAt.getTime())) {
    throw new DomainRuleViolation("INVALID_END_TIME", "Booking end time must be a valid date");
  }
  if (range.endAt.getTime() <= range.startAt.getTime()) {
    throw new DomainRuleViolation("INVALID_TIME_RANGE", "Booking end time must be after start time");
  }
}

export function halfOpenRangesOverlap(left: TimeRangeInput, right: TimeRangeInput): boolean {
  assertValidHalfOpenRange(left);
  assertValidHalfOpenRange(right);
  return left.startAt.getTime() < right.endAt.getTime() && right.startAt.getTime() < left.endAt.getTime();
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function requireIdempotencyKey(value: string | undefined): string {
  if (!value || value.trim().length < 16) {
    throw new DomainRuleViolation("IDEMPOTENCY_KEY_REQUIRED", "A valid idempotency key is required");
  }
  return value.trim();
}
