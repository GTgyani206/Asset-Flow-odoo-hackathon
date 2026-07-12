import { Module } from '@nestjs/common';

/**
 * Root worker module.
 * Job consumers and schedulers are registered here as they are implemented.
 * Do NOT register consumers that have not been fully implemented and tested.
 */
@Module({
  imports: [],
  providers: [],
})
export class WorkerModule {}
