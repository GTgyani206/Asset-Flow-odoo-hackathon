import { NestFactory } from '@nestjs/core';
import { WorkerModule } from './worker.module.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.createApplicationContext(WorkerModule, {
    logger: ['error', 'warn', 'log'],
  });

  // Startup health log – confirms the worker process initialised successfully.
  // No jobs are polled here; consumers register themselves via NestJS DI when implemented.
  console.log('[AssetFlow Worker] Process started successfully');
  console.log('[AssetFlow Worker] No active consumers registered yet');
  console.log('[AssetFlow Worker] Waiting for graceful shutdown signals...');

  const shutdown = async (signal: string): Promise<void> => {
    console.log(`[AssetFlow Worker] Received ${signal}, shutting down gracefully...`);
    await app.close();
    process.exit(0);
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}

bootstrap().catch((err: unknown) => {
  console.error('[AssetFlow Worker] Fatal startup error', err);
  process.exit(1);
});
