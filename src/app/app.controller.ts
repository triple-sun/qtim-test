import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  /** Healthcheck */
  @Get('health')
  async health() {
    return {
      status: 'ok',
      timestamp: new Date(),
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
    };
  }
}
