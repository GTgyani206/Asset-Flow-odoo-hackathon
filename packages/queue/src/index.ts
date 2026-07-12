export const QUEUE_VERSION = "1.0.0";

export type QueueName =
  | "outbox"
  | "notifications"
  | "reports"
  | "reminders"
  | "maintenance"
  | "audit"
  | "file-processing";

export interface QueueJob<TPayload extends Record<string, unknown> = Record<string, unknown>> {
  id: string;
  queue: QueueName;
  payload: TPayload;
  attempts: number;
  maxAttempts: number;
  availableAt: Date;
  correlationId?: string;
  tenantId?: string;
}

export interface EnqueueOptions {
  idempotencyKey?: string;
  delayMs?: number;
  maxAttempts?: number;
  correlationId?: string;
  tenantId?: string;
}

export interface QueuePort {
  enqueue<TPayload extends Record<string, unknown>>(
    queue: QueueName,
    payload: TPayload,
    options?: EnqueueOptions,
  ): Promise<QueueJob<TPayload>>;

  acknowledge(queue: QueueName, jobId: string): Promise<void>;

  retry(queue: QueueName, jobId: string, reason: string, delayMs: number): Promise<void>;

  deadLetter(queue: QueueName, jobId: string, reason: string): Promise<void>;
}

export interface ScheduledJobLease {
  jobName: string;
  ownerId: string;
  expiresAt: Date;
}

export interface SchedulerPort {
  acquireLease(jobName: string, ownerId: string, leaseMs: number): Promise<ScheduledJobLease | null>;
  releaseLease(lease: ScheduledJobLease): Promise<void>;
  recordSuccess(jobName: string, completedAt: Date): Promise<void>;
  recordFailure(jobName: string, failedAt: Date, reason: string): Promise<void>;
}
