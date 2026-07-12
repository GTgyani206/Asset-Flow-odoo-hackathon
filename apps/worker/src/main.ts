import { NestFactory } from '@nestjs/core';
import { WorkerModule } from './worker.module.js';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(WorkerModule);
  console.log('Standalone Worker Application initialized successfully');
  
  process.on('SIGTERM', async () => {
    console.log('Worker received SIGTERM, closing...');
    await app.close();
    process.exit(0);
  });
  
  process.on('SIGINT', async () => {
    console.log('Worker received SIGINT, closing...');
    await app.close();
    process.exit(0);
  });
}
bootstrap();
