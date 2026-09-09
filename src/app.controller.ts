import { Controller, Get } from '@nestjs/common';
import { Public } from './common/decorators/public.decorator';

@Controller()
export class AppController {
  @Public()
  @Get()
  getHealth() {
    return {
      status: 'ok',
      service: 'Nigerian Farmers Support Group (NFSG) API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      message: 'NFSG Backend API is running successfully 🌾',
    };
  }
}
