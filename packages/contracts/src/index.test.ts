import { describe, expect, it } from "vitest";
import {
  allocateAssetCommandSchema,
  createBookingCommandSchema,
  createMaintenanceRequestCommandSchema,
  problemDetailsSchema,
} from "./index.js";

describe("AssetFlow API contracts", () => {
  it("accepts explicit allocation commands", () => {
    const parsed = allocateAssetCommandSchema.parse({
      assetId: "00000000-0000-4000-8000-000000000001",
      holderType: "EMPLOYEE",
      holderId: "00000000-0000-4000-8000-000000000002",
      expectedReturnAt: "2026-07-20T10:00:00.000Z",
    });
    expect(parsed.holderType).toBe("EMPLOYEE");
  });

  it("rejects zero-length bookings", () => {
    expect(() =>
      createBookingCommandSchema.parse({
        resourceId: "00000000-0000-4000-8000-000000000003",
        startAt: "2026-07-12T10:00:00.000Z",
        endAt: "2026-07-12T10:00:00.000Z",
        timezone: "Asia/Calcutta",
        purpose: "Audit room",
      }),
    ).toThrow();
  });

  it("requires maintenance evidence text", () => {
    expect(() =>
      createMaintenanceRequestCommandSchema.parse({
        assetId: "00000000-0000-4000-8000-000000000004",
        issueSummary: "",
        issueDescription: "Screen flickers during audits",
      }),
    ).toThrow();
  });

  it("standardizes RFC 7807 problem details", () => {
    expect(
      problemDetailsSchema.parse({
        type: "https://assetflow/errors/booking-conflict",
        title: "Resource is already booked",
        status: 409,
        code: "BOOKING_OVERLAP",
      }).code,
    ).toBe("BOOKING_OVERLAP");
  });
});
