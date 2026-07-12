import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';

interface HealthResponse {
  service: string;
  status: 'ok';
  version: string;
  timestamp: string;
}

/**
 * Public health endpoint.
 * Returns service name, status, version, and UTC timestamp.
 * Must never expose secrets, credentials, or internal dependency details.
 */
@Controller()
export class HealthController {
  @Get('health')
  @HttpCode(HttpStatus.OK)
  health(): HealthResponse {
    return {
      service: 'assetflow-api',
      status: 'ok',
      version: process.env['npm_package_version'] ?? '0.0.1',
      timestamp: new Date().toISOString(),
    };
  }
}
