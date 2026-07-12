import { describe, expect, it } from "vitest";
import {
  DomainRuleViolation,
  assertAssetLifecycleTransition,
  assertValidHalfOpenRange,
  deriveAssetDisplayStatus,
  halfOpenRangesOverlap,
  normalizeEmail,
  requireIdempotencyKey,
} from "./index.js";

describe("AssetFlow domain rules", () => {
  it("derives display status by production precedence", () => {
    expect(
      deriveAssetDisplayStatus({
        lifecycle: "ACTIVE",
        custody: "ALLOCATED",
        serviceability: "UNDER_MAINTENANCE",
        reservation: "RESERVED",
      }),
    ).toBe("UNDER_MAINTENANCE");

    expect(
      deriveAssetDisplayStatus({
        lifecycle: "DISPOSED",
        custody: "UNALLOCATED",
        serviceability: "OPERATIONAL",
        reservation: "NONE",
      }),
    ).toBe("DISPOSED");
  });

  it("blocks invalid terminal asset transitions", () => {
    expect(() => assertAssetLifecycleTransition("DISPOSED", "ACTIVE")).toThrow(DomainRuleViolation);
  });

  it("uses half-open booking overlap semantics", () => {
    const first = { startAt: new Date("2026-07-12T09:00:00.000Z"), endAt: new Date("2026-07-12T10:00:00.000Z") };
    const backToBack = {
      startAt: new Date("2026-07-12T10:00:00.000Z"),
      endAt: new Date("2026-07-12T11:00:00.000Z"),
    };
    const overlapping = {
      startAt: new Date("2026-07-12T09:59:00.000Z"),
      endAt: new Date("2026-07-12T11:00:00.000Z"),
    };

    expect(halfOpenRangesOverlap(first, backToBack)).toBe(false);
    expect(halfOpenRangesOverlap(first, overlapping)).toBe(true);
  });

  it("rejects invalid time ranges", () => {
    expect(() =>
      assertValidHalfOpenRange({
        startAt: new Date("2026-07-12T10:00:00.000Z"),
        endAt: new Date("2026-07-12T10:00:00.000Z"),
      }),
    ).toThrow(DomainRuleViolation);
  });

  it("normalizes email and requires durable command idempotency keys", () => {
    expect(normalizeEmail("  USER@Example.COM ")).toBe("user@example.com");
    expect(requireIdempotencyKey(" idem-1234567890abcdef ")).toBe("idem-1234567890abcdef");
    expect(() => requireIdempotencyKey("short")).toThrow(DomainRuleViolation);
  });
});
