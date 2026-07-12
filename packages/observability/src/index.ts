export const OBSERVABILITY_VERSION = "1.0.0";

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogContext {
  service?: string;
  environment?: string;
  tenantId?: string;
  userId?: string;
  requestId?: string;
  correlationId?: string;
  traceId?: string;
  event?: string;
  durationMs?: number;
  errorCode?: string;
  [key: string]: unknown;
}

export interface LoggerPort {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, context?: LogContext & { error?: unknown }): void;
}

export interface MetricPort {
  increment(name: string, value?: number, tags?: Record<string, string>): void;
  histogram(name: string, value: number, tags?: Record<string, string>): void;
  gauge(name: string, value: number, tags?: Record<string, string>): void;
}

export function createConsoleLogger(defaultContext: LogContext = {}): LoggerPort {
  const sink =
    (globalThis as typeof globalThis & {
      console?: {
        log: (line: string) => void;
        warn: (line: string) => void;
        error: (line: string) => void;
      };
    }).console ?? {
      log: () => undefined,
      warn: () => undefined,
      error: () => undefined,
    };

  const write = (level: LogLevel, message: string, context: LogContext = {}) => {
    const entry = {
      timestamp: new Date().toISOString(),
      severity: level,
      message,
      ...defaultContext,
      ...context,
    };
    const line = JSON.stringify(entry);
    if (level === "error") {
      sink.error(line);
      return;
    }
    if (level === "warn") {
      sink.warn(line);
      return;
    }
    sink.log(line);
  };

  return {
    debug: (message, context) => write("debug", message, context),
    info: (message, context) => write("info", message, context),
    warn: (message, context) => write("warn", message, context),
    error: (message, context) => write("error", message, context),
  };
}

export function createNoopMetrics(): MetricPort {
  return {
    increment: () => undefined,
    histogram: () => undefined,
    gauge: () => undefined,
  };
}
