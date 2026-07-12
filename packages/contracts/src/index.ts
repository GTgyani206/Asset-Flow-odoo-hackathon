import { z } from "zod";

export const CONTRACTS_VERSION = "1.0.0";

export const uuidSchema = z.string().uuid();
export const nonEmptyStringSchema = z.string().trim().min(1);
export const isoDateTimeSchema = z.string().datetime({ offset: true });

export const holderTypeSchema = z.enum(["EMPLOYEE", "DEPARTMENT"]);
export const roleCodeSchema = z.enum(["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD", "EMPLOYEE", "AUDITOR"]);

export const problemDetailsSchema = z.object({
  type: z.string().url(),
  title: nonEmptyStringSchema,
  status: z.number().int().min(400).max(599),
  code: nonEmptyStringSchema,
  detail: z.string().optional(),
  correlationId: z.string().optional(),
});

export type ProblemDetails = z.infer<typeof problemDetailsSchema>;

export const paginationQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(25),
});

export const assetStateSchema = z.object({
  lifecycle: z.enum(["ACTIVE", "LOST", "RETIRED", "DISPOSED"]),
  custody: z.enum(["UNALLOCATED", "ALLOCATED"]),
  serviceability: z.enum(["OPERATIONAL", "UNDER_MAINTENANCE"]),
  reservation: z.enum(["NONE", "RESERVED"]),
});

export const createAssetCommandSchema = z.object({
  name: nonEmptyStringSchema.max(160),
  assetTag: nonEmptyStringSchema.max(64).optional(),
  categoryId: uuidSchema,
  serialNumber: z.string().trim().max(128).nullable().optional(),
  acquisitionDate: z.string().date().optional(),
  acquisitionCost: z.number().nonnegative().optional(),
  condition: z.enum(["NEW", "GOOD", "FAIR", "POOR", "BROKEN"]).default("GOOD"),
  primaryLocationId: uuidSchema,
  owningDepartmentId: uuidSchema.optional(),
  isBookable: z.boolean().default(false),
  criticality: z.enum(["LOW", "NORMAL", "HIGH", "CRITICAL"]).default("NORMAL"),
  warrantyEnd: z.string().date().optional(),
  attributes: z.record(z.unknown()).default({}),
});

export type CreateAssetCommand = z.infer<typeof createAssetCommandSchema>;

export const allocateAssetCommandSchema = z.object({
  assetId: uuidSchema,
  holderType: holderTypeSchema,
  holderId: uuidSchema,
  expectedReturnAt: isoDateTimeSchema.optional(),
  notes: z.string().trim().max(2_000).optional(),
});

export type AllocateAssetCommand = z.infer<typeof allocateAssetCommandSchema>;

export const createTransferCommandSchema = z.object({
  assetId: uuidSchema,
  targetHolderType: holderTypeSchema,
  targetHolderId: uuidSchema,
  reason: nonEmptyStringSchema.max(2_000),
});

export const decideTransferCommandSchema = z.object({
  decision: z.enum(["APPROVE", "REJECT"]),
  reason: z.string().trim().max(2_000).optional(),
});

export const inspectReturnCommandSchema = z.object({
  returnRequestId: uuidSchema,
  accepted: z.boolean(),
  condition: z.enum(["NEW", "GOOD", "FAIR", "POOR", "BROKEN"]),
  locationId: uuidSchema,
  notes: z.string().trim().max(2_000).optional(),
  createMaintenanceRequest: z.boolean().default(false),
});

export const createBookingCommandSchema = z
  .object({
    resourceId: uuidSchema,
    bookedForEmployeeId: uuidSchema.optional(),
    bookedForDepartmentId: uuidSchema.optional(),
    startAt: isoDateTimeSchema,
    endAt: isoDateTimeSchema,
    timezone: nonEmptyStringSchema.max(80),
    purpose: nonEmptyStringSchema.max(500),
  })
  .refine((value) => Date.parse(value.endAt) > Date.parse(value.startAt), {
    message: "endAt must be after startAt",
    path: ["endAt"],
  });

export type CreateBookingCommand = z.infer<typeof createBookingCommandSchema>;

export const createMaintenanceRequestCommandSchema = z.object({
  assetId: uuidSchema,
  issueSummary: nonEmptyStringSchema.max(200),
  issueDescription: nonEmptyStringSchema.max(4_000),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).default("NORMAL"),
});

export const resolveMaintenanceCommandSchema = z.object({
  conditionAfterRepair: z.enum(["NEW", "GOOD", "FAIR", "POOR", "BROKEN"]),
  resolutionNotes: nonEmptyStringSchema.max(4_000),
  resolverId: uuidSchema,
  completedAt: isoDateTimeSchema,
  operationalCost: z.number().nonnegative().optional(),
});

export const createAuditCycleCommandSchema = z.object({
  name: nonEmptyStringSchema.max(160),
  scopeDepartmentIds: z.array(uuidSchema).default([]),
  scopeLocationIds: z.array(uuidSchema).default([]),
  startsAt: isoDateTimeSchema,
  endsAt: isoDateTimeSchema,
  auditorIds: z.array(uuidSchema).min(1),
});

export const recordAuditObservationCommandSchema = z.object({
  auditItemId: uuidSchema,
  result: z.enum([
    "VERIFIED",
    "MISSING",
    "DAMAGED",
    "WRONG_LOCATION",
    "WRONG_HOLDER",
    "NOT_ACCESSIBLE",
    "NOT_APPLICABLE",
    "UNEXPECTED_ASSET",
  ]),
  actualLocationId: uuidSchema.optional(),
  actualHolderType: holderTypeSchema.optional(),
  actualHolderId: uuidSchema.optional(),
  condition: z.enum(["NEW", "GOOD", "FAIR", "POOR", "BROKEN"]).optional(),
  notes: z.string().trim().max(4_000).optional(),
});

export const exportReportCommandSchema = z.object({
  reportType: z.enum([
    "ASSET_UTILIZATION",
    "IDLE_ASSETS",
    "MAINTENANCE_FREQUENCY",
    "DEPARTMENT_ALLOCATION",
    "RESOURCE_BOOKING_HEATMAP",
    "AUDIT_DISCREPANCIES",
  ]),
  format: z.enum(["CSV", "XLSX"]).default("CSV"),
  parameters: z.record(z.unknown()).default({}),
});

export type ExportReportCommand = z.infer<typeof exportReportCommandSchema>;
