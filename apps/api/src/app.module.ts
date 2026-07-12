import { Module } from '@nestjs/common';
import { HealthController } from './bootstrap/health.controller.js';

/**
 * Root application module.
 * Business feature modules are registered here as they are implemented.
 * Do NOT register modules that have not been fully implemented.
 */
@Module({
  imports: [],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
