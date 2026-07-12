import { describe, expect, it } from "vitest";
import { ConfigurationError, loadConfig } from "./index.js";

const validEnvironment = {
  NODE_ENV: "test",
  DATABASE_URL: "postgresql://assetflow:test@localhost:5432/assetflow",
  REDIS_URL: "redis://localhost:6379",
  S3_ENDPOINT: "http://localhost:9000",
  S3_BUCKET: "assetflow-local",
  S3_ACCESS_KEY_ID: "minioadmin",
  S3_SECRET_ACCESS_KEY: "local-secret-value",
  JWT_SECRET: "a-test-secret-with-enough-length-for-validation",
  ADMIN_BOOTSTRAP_SECRET: "a-separate-bootstrap-secret-with-enough-length",
};

describe("loadConfig", () => {
  it("loads typed runtime configuration", () => {
    const config = loadConfig({ ...validEnvironment, PORT: "4001", SCHEDULER_ENABLED: "true" });
    expect(config.PORT).toBe(4001);
    expect(config.SCHEDULER_ENABLED).toBe(true);
  });

  it("rejects missing required values", () => {
    expect(() => loadConfig({ ...validEnvironment, DATABASE_URL: undefined })).toThrow(ConfigurationError);
  });

  it("rejects production placeholder secrets", () => {
    expect(() =>
      loadConfig({
        ...validEnvironment,
        NODE_ENV: "production",
        S3_SECRET_ACCESS_KEY: "change_me_locally",
      }),
    ).toThrow(ConfigurationError);
  });
});
