import { z } from "zod";

export const CONFIG_VERSION = "1.0.0";

const optionalUrl = z.string().url().optional();
const booleanString = z
  .enum(["true", "false"])
  .default("false")
  .transform((value) => value === "true");

export const assetFlowConfigSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "staging", "production"]).default("development"),
    PORT: z.coerce.number().int().min(1).max(65_535).default(3001),
    WEB_ORIGIN: z.string().url().default("http://localhost:3000"),
    DATABASE_URL: z.string().startsWith("postgresql://"),
    REDIS_URL: z.string().startsWith("redis://").default("redis://localhost:6379"),
    S3_ENDPOINT: z.string().url(),
    S3_REGION: z.string().min(1).default("us-east-1"),
    S3_BUCKET: z.string().min(3),
    S3_ACCESS_KEY_ID: z.string().min(1),
    S3_SECRET_ACCESS_KEY: z.string().min(12),
    JWT_SECRET: z.string().min(32),
    JWT_EXPIRES_IN: z.string().min(1).default("15m"),
    REFRESH_TOKEN_EXPIRES_IN: z.string().min(1).default("7d"),
    ADMIN_BOOTSTRAP_SECRET: z.string().min(32),
    LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
    OTEL_SERVICE_NAME: z.string().min(1).default("assetflow"),
    OTEL_EXPORTER_OTLP_ENDPOINT: optionalUrl,
    OUTBOX_POLL_INTERVAL_MS: z.coerce.number().int().min(250).default(1_000),
    SCHEDULER_ENABLED: booleanString,
  })
  .superRefine((value, context) => {
    if (value.NODE_ENV !== "production") return;

    for (const [key, secret] of [
      ["JWT_SECRET", value.JWT_SECRET],
      ["ADMIN_BOOTSTRAP_SECRET", value.ADMIN_BOOTSTRAP_SECRET],
      ["S3_SECRET_ACCESS_KEY", value.S3_SECRET_ACCESS_KEY],
    ] as const) {
      if (/replace|change_me|locally|development/i.test(secret)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: [key],
          message: "production secrets must not use placeholder values",
        });
      }
    }
  });

export type AssetFlowConfig = z.infer<typeof assetFlowConfigSchema>;

export class ConfigurationError extends Error {
  constructor(readonly issues: ReadonlyArray<{ path: string; message: string }>) {
    super(`Invalid configuration: ${issues.map((issue) => `${issue.path}: ${issue.message}`).join("; ")}`);
    this.name = "ConfigurationError";
  }
}

function readProcessEnvironment(): Record<string, string | undefined> {
  const runtime = globalThis as typeof globalThis & {
    process?: { env?: Record<string, string | undefined> };
  };
  return runtime.process?.env ?? {};
}

export function loadConfig(environment: Record<string, string | undefined> = readProcessEnvironment()): AssetFlowConfig {
  const result = assetFlowConfigSchema.safeParse(environment);
  if (!result.success) {
    throw new ConfigurationError(
      result.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    );
  }
  return Object.freeze(result.data);
}
