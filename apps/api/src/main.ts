import { NestFactory } from '@nestjs/core';
import { VersioningType } from '@nestjs/common';
import { AppModule } from './app.module.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  // All routes are prefixed with /api
  app.setGlobalPrefix('api');

  // URI versioning: /api/v1/...
  app.enableVersioning({ type: VersioningType.URI });

  // CORS – restrict to known origins in production via environment config
  app.enableCors();

  const port = process.env['PORT'] ?? 3001;
  await app.listen(port);

  // Deliberately log only non-sensitive startup information
  console.log(`[AssetFlow API] Listening on http://localhost:${port}/api`);
  console.log(`[AssetFlow API] Health: http://localhost:${port}/health`);
}

bootstrap().catch((err: unknown) => {
  console.error('[AssetFlow API] Fatal startup error', err);
  process.exit(1);
});
